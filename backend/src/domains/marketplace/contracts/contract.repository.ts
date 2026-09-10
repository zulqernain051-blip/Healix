import { prisma } from '../../../common/config/database';
import { AppError } from '../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../common/constants/index';
import { OutboxRepository } from '../../../common/events/outbox.repository';
import { EVENTS } from '../../../common/events/app-event-bus';

export class ContractRepository {
  public static async createContract(data: {
    patientId: string;
    nurseId: string;
    sourceOfferId?: string;
    careRequestId?: string;
    price: number;
    priceType: string;
    scopeText: string;
    actorId: string;
    actorRole: string;
  }) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return prisma.$transaction(async (tx) => {
      const contract = await tx.contract.create({
        data: {
          patientId: data.patientId,
          nurseId: data.nurseId,
          sourceOfferId: data.sourceOfferId || null,
          careRequestId: data.careRequestId || null,
          price: data.price,
          priceType: data.priceType,
          scopeText: data.scopeText,
          status: 'PENDING_APPROVAL',
          expiresAt
        }
      });

      await tx.contractAuditLog.create({
        data: {
          contractId: contract.id,
          action: 'CREATED',
          actorId: data.actorId,
          actorRole: data.actorRole,
          afterValue: JSON.stringify(contract),
          note: 'Contract drafted and sent for dual approval.'
        }
      });

      return contract;
    });
  }

  public static async findContractIdsForRequest(careRequestId: string, statuses?: string[]) {
    return prisma.contract.findMany({
      where: {
        careRequestId,
        ...(statuses ? { status: { in: statuses } } : {})
      },
      select: { id: true }
    });
  }

  public static async findContractById(id: string) {
    return prisma.contract.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { fullName: true, email: true } } } },
        nurse: { include: { user: { select: { fullName: true, email: true } } } },
        approvals: true,
        auditLogs: { orderBy: { createdAt: 'desc' } },
        sourceOffer: true
      }
    });
  }

  public static async findContractBySourceOfferId(sourceOfferId: string) {
    return prisma.contract.findUnique({
      where: { sourceOfferId }
    });
  }

  public static async findExpiredContracts() {
    return prisma.contract.findMany({
      where: {
        status: 'PENDING_APPROVAL',
        expiresAt: { lt: new Date() }
      },
      select: { id: true }
    });
  }

  public static async findContractsByPatientId(patientId: string) {
    return prisma.contract.findMany({
      where: { patientId },
      include: {
        nurse: { include: { user: { select: { fullName: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  public static async findContractsByNurseId(nurseId: string) {
    return prisma.contract.findMany({
      where: { nurseId },
      include: {
        patient: { include: { user: { select: { fullName: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  public static async updateApproval(
    contractId: string,
    role: 'PATIENT' | 'NURSE',
    userId: string,
    actorRole: string
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Lock the Contract row to guarantee serialized concurrency
      const lockResult = await tx.$queryRaw<any[]>`
        SELECT * FROM "contracts" WHERE id = ${contractId} FOR UPDATE
      `;
      
      if (!lockResult || lockResult.length === 0) {
        throw new AppError('Contract not found', HTTP_STATUS.NOT_FOUND);
      }
      
      const current = lockResult[0];

      // 2. Enforce PENDING_APPROVAL and idempotency
      if (current.status === 'ACTIVE') {
        // Idempotent return if already activated
        return tx.contract.findUnique({ where: { id: contractId } });
      }

      if (current.status !== 'PENDING_APPROVAL') {
        throw new AppError(`Contract cannot be approved in its current state: ${current.status}`, HTTP_STATUS.BAD_REQUEST);
      }

      // 3. Prevent duplicate identical approvals from creating redundant audit logs unnecessarily
      const isAlreadyApprovedByRole = (role === 'PATIENT' && current.patientApproved) || 
                                      (role === 'NURSE' && current.nurseApproved);
      
      if (isAlreadyApprovedByRole) {
        return tx.contract.findUnique({ where: { id: contractId } });
      }

      // 4. Determine new approval state
      const isPatientApprovingNow = role === 'PATIENT';
      const isNurseApprovingNow = role === 'NURSE';
      
      const newPatientApproved = current.patientApproved || isPatientApprovingNow;
      const newNurseApproved = current.nurseApproved || isNurseApprovingNow;
      
      const isBothApproved = newPatientApproved && newNurseApproved;
      const newStatus = isBothApproved ? 'ACTIVE' : 'PENDING_APPROVAL';

      // 5. Apply the update
      const updated = await tx.contract.update({
        where: { id: contractId },
        data: {
          patientApproved: newPatientApproved,
          nurseApproved: newNurseApproved,
          status: newStatus
        }
      });

      // 6. Audit log
      await tx.contractApproval.create({
        data: {
          contractId,
          partyRole: role,
          approved: true,
          reason: 'Approved terms'
        }
      });

      await tx.contractAuditLog.create({
        data: {
          contractId,
          action: 'APPROVED',
          actorId: userId,
          actorRole,
          beforeValue: JSON.stringify(current),
          afterValue: JSON.stringify(updated),
          note: `Contract approved by ${role.toLowerCase()}. Status: ${newStatus}`
        }
      });

      // 7. Exactly-Once Outbox Insertion
      // Only the transaction that actually flips the status to ACTIVE will execute this
      if (newStatus === 'ACTIVE') {
        await OutboxRepository.createEvent(tx, {
          eventType: EVENTS.CONTRACT_ACTIVATED,
          aggregateType: 'CONTRACT',
          aggregateId: contractId,
          payload: {
            contractId: updated.id,
            careRequestId: updated.careRequestId,
            patientId: updated.patientId,
            nurseId: updated.nurseId,
            sourceOfferId: updated.sourceOfferId
          }
        });
      }

      return updated;
    });
  }

  public static async rejectContract(
    contractId: string,
    role: 'PATIENT' | 'NURSE',
    reason: string,
    userId: string,
    actorRole: string
  ) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.contract.findUnique({
        where: { id: contractId }
      });
      if (!current) throw new AppError('Contract not found', HTTP_STATUS.NOT_FOUND);

      const updateData: any = {
        status: 'REJECTED'
      };
      if (role === 'PATIENT') {
        updateData.patientReason = reason;
      } else {
        updateData.nurseReason = reason;
      }

      const updated = await tx.contract.update({
        where: { id: contractId },
        data: updateData
      });

      await tx.contractApproval.create({
        data: {
          contractId,
          partyRole: role,
          approved: false,
          reason
        }
      });

      await tx.contractAuditLog.create({
        data: {
          contractId,
          action: 'REJECTED',
          actorId: userId,
          actorRole,
          beforeValue: JSON.stringify(current),
          afterValue: JSON.stringify(updated),
          note: `Contract rejected by ${role.toLowerCase()}. Reason: ${reason}`
        }
      });

      await OutboxRepository.createEvent(tx, {
        eventType: 'CONTRACT_REJECTED',
        aggregateType: 'CONTRACT',
        aggregateId: contractId,
        payload: { contractId }
      });

      return updated;
    });
  }

  public static async cancelContract(
    contractId: string,
    reason: string,
    userId: string,
    actorRole: string
  ) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.contract.findUnique({
        where: { id: contractId }
      });
      if (!current) throw new AppError('Contract not found', HTTP_STATUS.NOT_FOUND);

      const updated = await tx.contract.update({
        where: { id: contractId },
        data: { status: 'CANCELLED' }
      });

      await tx.contractAuditLog.create({
        data: {
          contractId,
          action: 'CANCELLED',
          actorId: userId,
          actorRole,
          beforeValue: JSON.stringify(current),
          afterValue: JSON.stringify(updated),
          note: `Contract cancelled. Reason: ${reason || 'No reason provided'}`
        }
      });

      await OutboxRepository.createEvent(tx, {
        eventType: 'CONTRACT_CANCELLED',
        aggregateType: 'CONTRACT',
        aggregateId: contractId,
        payload: { contractId }
      });

      return updated;
    });
  }

  public static async expireContract(contractId: string) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.contract.findUnique({
        where: { id: contractId }
      });
      if (!current) throw new AppError('Contract not found', HTTP_STATUS.NOT_FOUND);

      const updated = await tx.contract.update({
        where: { id: contractId },
        data: { status: 'EXPIRED' }
      });

      await tx.contractAuditLog.create({
        data: {
          contractId,
          action: 'EXPIRED',
          actorId: 'SYSTEM',
          actorRole: 'SYSTEM',
          beforeValue: JSON.stringify(current),
          afterValue: JSON.stringify(updated),
          note: 'Contract auto-expired after 24 hours of inactivity.'
        }
      });

      await OutboxRepository.createEvent(tx, {
        eventType: 'CONTRACT_EXPIRED',
        aggregateType: 'CONTRACT',
        aggregateId: contractId,
        payload: { contractId }
      });

      return updated;
    });
  }

  public static async markContractCompleted(contractId: string) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.contract.findUnique({
        where: { id: contractId }
      });
      if (!current) return;

      const updated = await tx.contract.update({
        where: { id: contractId },
        data: { status: 'COMPLETED' }
      });

      await tx.contractAuditLog.create({
        data: {
          contractId,
          action: 'COMPLETED',
          actorId: 'SYSTEM',
          actorRole: 'SYSTEM',
          beforeValue: JSON.stringify(current),
          afterValue: JSON.stringify(updated),
          note: 'Contract auto-completed as all linked visits are completed.'
        }
      });

      return updated;
    });
  }
}
