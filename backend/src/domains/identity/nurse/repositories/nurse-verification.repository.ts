import { prisma } from '../../../../common/config/database';

export class NurseVerificationRepository {
  /** Get all submitted verification documents for a user */
  public static async findDocuments(userId: string) {
    return prisma.userDocument.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' }
    });
  }

  /** Find a specific document by ID */
  public static async findDocumentById(id: string) {
    return prisma.userDocument.findFirst({ where: { id } });
  }

  /** Upsert a verification document (one document per type per user) */
  public static async upsertDocument(userId: string, documentType: string, fileUrl: string) {
    return prisma.$transaction(async tx => {
    await tx.userDocument.deleteMany({ where: { userId, documentType: documentType as any } });
    return tx.userDocument.create({
      data: {
        userId,
        documentType: documentType as any,
        fileUrl,
        status: 'PENDING',
        verified: false,
        rejectionReason: null
      }
    });
    });
  }

  /** Admin: approve or reject a document */
  public static async reviewDocument(id: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) {
    return prisma.userDocument.update({
      where: { id },
      data: {
        status,
        verified: status === 'APPROVED',
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      }
    });
  }

  /** Update the user status (e.g. to ACTIVE after verification) */
  public static async updateUserStatus(userId: string, status: string) {
    return prisma.$transaction(async tx => {
      await tx.nurse.updateMany({ where: { userId, verificationStatus: 'PENDING' }, data: { verificationStatus: 'VERIFIED', verificationApprovedAt: new Date(), rejectionReason: null } });
      return tx.user.updateMany({ where: { id: userId, status: 'PENDING_VERIFICATION', nurse: { verificationStatus: 'VERIFIED' } }, data: { status: status as any } });
    });
  }
}
