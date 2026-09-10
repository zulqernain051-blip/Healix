import { DoctorRepository } from '../../doctor.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';

export class GetCaseReviewUseCase {
  constructor(private readonly doctorRepository = DoctorRepository) {}

  async execute(caseId: string, doctorId: string) {
    const caseAssignment = await this.doctorRepository.findCaseById(caseId);
    if (!caseAssignment) {
      throw new AppError('Case not found', HTTP_STATUS.NOT_FOUND);
    }
    
    // Only throw Unauthorized if the case is actively assigned to a DIFFERENT doctor.
    // If doctorId is null, it means it's in the broadcast pool and any doctor can view it to accept it.
    if (caseAssignment.doctorId && caseAssignment.doctorId !== doctorId) {
      throw new AppError('Unauthorized: This case is assigned to another doctor', HTTP_STATUS.FORBIDDEN);
    }

    // Consolidated single API payload
    const vitals = caseAssignment.visit.vitals;
    const symptoms = caseAssignment.visit.symptoms;
    const clinicalRemark = caseAssignment.visit.clinicalRemark;

    // Generate Mock CDSS advisory summary and recommendations based on symptoms
    const hasRespiratory = symptoms.some((s: any) => s.bodySystem === 'RESPIRATORY');
    const hasCardio = symptoms.some((s: any) => s.bodySystem === 'CARDIOVASCULAR');

    let aiSummary = 'Patient presents with mild generalized physiological fatigue. Vitals remain stable within acceptable clinical thresholds.';
    const aiRecommendations = [
      { text: 'Ensure patient maintains adequate oral hydration.', source: 'WHO Clinical Guidelines (2024)' },
      { text: 'Check vitals again in 12 hours.', source: 'NHS Home Care Protocol' }
    ];

    if (hasRespiratory) {
      aiSummary = 'Patient demonstrates clinical symptoms of respiratory distress (Cough/Dyspnea). SpO2 levels and lung sounds require immediate physician attention.';
      aiRecommendations.push(
        { text: 'Administer supplementary low-flow oxygen therapy if SpO2 drops below 92%.', source: 'British Thoracic Society Guidelines' },
        { text: 'Nebulize with Salbutamol if wheezing persists.', source: 'GINA Global Strategy for Asthma' }
      );
    }

    if (hasCardio) {
      aiSummary = 'Cardiovascular assessment indicates irregular rhythm or chest symptoms. Potential high cardiac output requirement detected.';
      aiRecommendations.push(
        { text: 'Monitor blood pressure hourly. Maintain systolic pressure below 140 mmHg.', source: 'ACC/AHA Hypertension Guidelines' },
        { text: 'Perform 12-lead ECG diagnostics if chest discomfort intensifies.', source: 'European Society of Cardiology (ESC)' }
      );
    }

    return {
      case: caseAssignment,
      clinicalData: {
        vitals,
        symptoms,
        notes: caseAssignment.visit.notes,
        nurseRemarks: clinicalRemark?.remarksText,
        nurseConfidence: clinicalRemark?.confidenceLevel
      },
      aiInsights: {
        disclaimer: 'Clinical Decision Support System (CDSS) - Advisory recommendation only. Not a final diagnosis.',
        summary: aiSummary,
        recommendations: aiRecommendations
      }
    };
  }
}
