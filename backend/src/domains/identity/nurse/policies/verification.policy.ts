export class VerificationPolicy {
  private static readonly REQUIRED_DOCUMENTS = [
    'CNIC_FRONT',
    'CNIC_BACK',
    'NURSE_LICENSE',
    'DEGREE',
    'BACKGROUND_CHECK'
  ];

  /** Evaluates if a nurse has all required documents approved and is eligible for activation. */
  public static isEligibleForActivation(documents: any[]): boolean {
    const approvedTypes = documents
      .filter(d => d.status === 'APPROVED')
      .map(d => d.documentType);

    return this.REQUIRED_DOCUMENTS.every(type => approvedTypes.includes(type));
  }

  /** Generates the verification status map for all required documents. */
  public static buildVerificationStatusMap(documents: any[]): Record<string, any> {
    const checksMap: Record<string, any> = {};

    for (const type of this.REQUIRED_DOCUMENTS) {
      checksMap[type] = { status: 'NOT_SUBMITTED' };
    }
    
    for (const doc of documents) {
      if (this.REQUIRED_DOCUMENTS.includes(doc.documentType)) {
        checksMap[doc.documentType] = {
          status: doc.status,
          fileUrl: doc.fileUrl,
          rejectionReason: doc.rejectionReason,
          uploadedAt: doc.uploadedAt
        };
      }
    }

    return checksMap;
  }
}
