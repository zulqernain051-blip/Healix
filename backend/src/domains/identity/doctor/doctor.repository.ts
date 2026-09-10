import { prisma } from '../../../common/config/database';

export class DoctorRepository {
  public static async findCaseById(caseId: string) {
    return prisma.caseAssignment.findUnique({
      where: { id: caseId },
      include: {
        visit: {
          include: {
            request: {
              include: {
                patient: {
                  include: {
                    user: {
                      select: { id: true, fullName: true, email: true, phone: true }
                    },
                    allergies: true,
                    diagnoses: {
                      orderBy: { diagnosedAt: 'desc' }
                    }
                  }
                }
              }
            },
            nurse: {
              include: {
                user: {
                  select: { id: true, fullName: true, email: true, phone: true }
                }
              }
            },
            vitals: {
              orderBy: { recordedAt: 'desc' }
            },
            symptoms: {
              orderBy: { createdAt: 'desc' }
            },
            clinicalRemark: true
          }
        },
        doctor: {
          include: {
            user: {
              select: { fullName: true }
            }
          }
        },
        secondOpinions: {
          include: {
            requestingDoctor: { include: { user: { select: { fullName: true } } } },
            consultedDoctor: { include: { user: { select: { fullName: true } } } }
          }
        },
        decisions: true,
        diagnoses: true,
        aiFeedback: true
      }
    });
  }

  public static async findDiagnosisById(diagnosisId: string) {
    return prisma.diagnosis.findUnique({
      where: { id: diagnosisId }
    });
  }

  public static async findCaseByVisitId(visitId: string) {
    return prisma.caseAssignment.findFirst({
      where: { visitId }
    });
  }

  public static async findPatientWithAllergies(patientId: string) {
    return prisma.patient.findUnique({
      where: { id: patientId },
      include: { allergies: true }
    });
  }

  public static async findPatientWithChronicConditions(patientId: string) {
    return prisma.patient.findUnique({
      where: { id: patientId },
      include: { chronicConditions: true }
    });
  }

  public static async findPrescriptionById(prescriptionId: string) {
    return prisma.prescription.findUnique({
      where: { id: prescriptionId }
    });
  }

  public static async findQueueByDoctorId(doctorId: string) {
    return prisma.caseAssignment.findMany({
      where: {
        status: { in: ['ASSIGNED', 'IN_REVIEW'] },
        doctorId
      },
      include: {
        visit: {
          include: {
            request: { include: { patient: { include: { user: { select: { fullName: true } } } } } },
            symptoms: true,
            clinicalRemark: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  public static async findEligibleDoctorsWithWorkload(tx?: any, riskTier?: string) {
    const db = tx || prisma;
    
    let whereClause: any = {
      verificationStatus: 'VERIFIED',
      user: { status: 'ACTIVE' }
    };
    
    if (riskTier === 'HIGH' || riskTier === 'CRITICAL') {
      whereClause.emergencyAvailable = true;
    }
    
    return db.doctor.findMany({
      where: whereClause,
      select: {
        id: true,
        availabilities: true,
        _count: {
          select: {
            caseAssignments: {
              where: { status: { in: ['ASSIGNED', 'IN_REVIEW'] } }
            }
          }
        }
      }
    });
  }

  public static async findHighRiskQueueByDoctorId(doctorId: string) {
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { isProfessional: true } });
    const isProfessional = doctor?.isProfessional || false;
    
    return prisma.caseAssignment.findMany({
      where: {
        riskTier: { in: ['HIGH', 'CRITICAL'] },
        OR: [
          { status: { in: ['ASSIGNED', 'IN_REVIEW'] }, doctorId },
          { status: { in: ['GENERAL_BROADCAST', 'ADMIN_ESCALATED'] }, doctorId: null },
          ...(isProfessional ? [{ status: 'PROFESSIONAL_BROADCAST', doctorId: null }] : [])
        ]
      },
      include: {
        visit: {
          include: {
            request: { include: { patient: { include: { user: { select: { fullName: true } } } } } }
          }
        }
      },
      orderBy: { slaDeadline: 'asc' }
    });
  }

  public static async startReview(caseId: string, doctorId: string) {
    return prisma.caseAssignment.updateMany({
      where: {
        id: caseId,
        doctorId,
        status: 'ASSIGNED'
      },
      data: {
        status: 'IN_REVIEW',
        acceptedAt: new Date()
      }
    });
  }

  public static async acceptEmergencyCase(caseId: string, doctorId: string) {
    return prisma.$transaction(async (tx) => {
      const lockedCases = await tx.$queryRaw<any[]>`SELECT * FROM "case_assignments" WHERE "id" = ${caseId} FOR UPDATE`;
      if (!lockedCases || lockedCases.length === 0) return null;
      
      const currentStatus = lockedCases[0].status;
      if (currentStatus !== 'PROFESSIONAL_BROADCAST' && currentStatus !== 'GENERAL_BROADCAST' && currentStatus !== 'ADMIN_ESCALATED') {
        return null; // Already accepted or not broadcast
      }

      const updated = await tx.caseAssignment.update({
        where: { id: caseId },
        data: {
          doctorId,
          status: 'ASSIGNED',
          acceptedAt: new Date()
        }
      });

      await tx.assignmentLog.create({
        data: {
          visitId: updated.visitId,
          method: 'DOCTOR_ACCEPTED',
          assignedTo: (await tx.doctor.findUnique({ where: { id: doctorId } }))!.userId,
          reason: `Emergency case accepted during ${currentStatus}`
        }
      });

      return updated;
    });
  }

  public static async resolveCase(caseId: string, doctorId: string, resolutionSummary: string, outerTx?: any) {
    const executeLogic = async (tx: any) => {
      const doctor = await tx.doctor.findUnique({ where: { id: doctorId }, select: { userId: true } });
        
      const result = await tx.caseAssignment.updateMany({
        where: {
          id: caseId,
          doctorId,
          status: 'IN_REVIEW'
        },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date()
        }
      });

      if (result.count > 0) {
        const updatedCase = await tx.caseAssignment.findUnique({
          where: { id: caseId }
        });
        
        if (updatedCase && doctor) {
          await tx.assignmentLog.create({
            data: {
              visitId: updatedCase.visitId,
              method: 'MANUAL',
              assignedTo: doctor.userId,
              reason: `Case Resolved: ${resolutionSummary}`
            }
          });
        }
      }
      return result;
    };
    if (outerTx) return executeLogic(outerTx);
    return prisma.$transaction(executeLogic);
  }

  public static async createClinicalDecision(caseId: string, doctorId: string, decision: string, justification: string, autoDispatch: boolean = false, tx?: any) {
    const db = tx || prisma;
    return db.clinicalDecision.create({
      data: {
        caseId,
        doctorId,
        decision,
        justification,
        autoDispatch
      }
    });
  }

  public static async findDoctorsExcluding(doctorId: string) {
    return prisma.doctor.findMany({
      where: { id: { not: doctorId } },
      include: { user: { select: { fullName: true } } }
    });
  }

  public static async createSecondOpinion(caseId: string, requestingDoctorId: string, consultedDoctorId: string) {
    return prisma.secondOpinion.create({
      data: {
        caseId,
        requestingDoctorId,
        consultedDoctorId
      }
    });
  }

  public static async createAiFeedback(caseId: string, doctorId: string, targetType: string, comment: string) {
    return prisma.aiFeedback.create({
      data: {
        caseId,
        doctorId,
        targetType,
        comment
      }
    });
  }
}
