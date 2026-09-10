import { AppError } from '../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../common/constants/index';
import { ClinicalRepository } from './clinical.repository';

export class ClinicalService {
  public static async performRiskAssessment(
    data: {
      visitId?: string;
      patientId: string;
      nurseConfidence: number;
    },
    simulateTimeout = false
  ) {
    let timedOut = false;

    // Simulate timeout logic
    if (simulateTimeout) {
      timedOut = true;
    }

    const vitals = data.visitId
      ? await ClinicalRepository.findLatestVitalsForVisit(data.visitId)
      : await ClinicalRepository.findLatestVitalsForPatient(data.patientId);

    let visitNotes = '';
    if (data.visitId) {
      const visit = await ClinicalRepository.findVisitById(data.visitId);
      visitNotes = visit?.notes || '';
    }

    // Normal baseline values
    const sys = vitals?.systolic ?? 120;
    const dia = vitals?.diastolic ?? 80;
    const hr = vitals?.heartRate ?? 75;
    const temp = vitals?.temperature ?? 37.0;
    const spo2 = vitals?.oxygenSaturation ?? 98;

    // Calculate vitals deviation
    const sysDev = Math.abs(sys - 120) * 1.2;
    const diaDev = Math.abs(dia - 80) * 1.5;
    const hrDev = Math.abs(hr - 75) * 1.0;
    const tempDev = Math.abs(temp - 37.0) * 25;
    const spo2Dev = Math.max(0, 98 - spo2) * 15;

    const vitalsDeviation = Math.min(100, Math.round(sysDev + diaDev + hrDev + tempDev + spo2Dev));

    // Mock ML baseline score (highly correlated with deviation)
    const mlScore = Math.min(100, Math.round(vitalsDeviation * 0.95 + 5));

    // NLP sentiment/severity score of qualitative notes
    let nlpScore = 30; // base score
    const notesLower = visitNotes.toLowerCase();
    const highKeywords = ['severe', 'critical', 'bleeding', 'unconscious', 'chest pain', 'worse', 'infection', 'fever', 'high'];
    const medKeywords = ['pain', 'swelling', 'cough', 'weakness', 'elevated', 'dizzy', 'moderate'];
    const lowKeywords = ['stable', 'normal', 'improving', 'good', 'fine', 'controlled', 'low'];

    if (highKeywords.some(kw => notesLower.includes(kw))) {
      nlpScore = 85;
    } else if (medKeywords.some(kw => notesLower.includes(kw))) {
      nlpScore = 60;
    } else if (lowKeywords.some(kw => notesLower.includes(kw))) {
      nlpScore = 15;
    }

    // Fused risk score: ML (50%), Vitals deviation (30%), Nurse confidence (20% weight, represented by nurseConfidence * 4)
    // plus NLP score contribution
    let fusedScore = (mlScore * 0.45) + (vitalsDeviation * 0.3) + (data.nurseConfidence * 4) + (nlpScore * 0.1);
    fusedScore = Math.min(100, Math.round(fusedScore));

    // Determine raw risk tier
    let riskTier = 'LOW';
    if (fusedScore >= 70) {
      riskTier = 'HIGH';
    } else if (fusedScore >= 40) {
      riskTier = 'MEDIUM';
    }

    // Nurse confidence adjustment (Low confidence biases the result toward the more cautious adjacent tier)
    if (data.nurseConfidence <= 2) {
      if (riskTier === 'LOW' && fusedScore >= 30) {
        riskTier = 'MEDIUM';
      } else if (riskTier === 'MEDIUM' && fusedScore >= 60) {
        riskTier = 'HIGH';
      }
    }

    // Explanation details
    const explanation = {
      mlModelContribution: '45%',
      vitalsDeviationContribution: '30%',
      nurseConfidenceContribution: '20%',
      nlpSentimentContribution: '10%',
      calculations: {
        rawVitalsDeviationScore: vitalsDeviation,
        mlModelScore: mlScore,
        nlpNotesScore: nlpScore,
        nurseConfidenceProvided: data.nurseConfidence
      },
      interpretation: `Risk assessment classified as ${riskTier} based on fused clinical variables.`
    };

    // Save risk assessment record and optionally create CaseAssignment
    const shouldCreateCase = riskTier === 'HIGH' && !!data.visitId;
    const assessment = await ClinicalRepository.createRiskAssessmentAndCase(
      {
        patientId: data.patientId,
        visitId: data.visitId || null,
        riskTier,
        fusedScore,
        mlScore,
        nurseConfidence: data.nurseConfidence,
        explanation: JSON.stringify(explanation),
        timedOut,
        notes: visitNotes || 'Automated risk assessment generated.'
      },
      shouldCreateCase,
      data.visitId
    );

    if (shouldCreateCase) {
      console.log(`[ALERT] High risk visit ${data.visitId} auto-assigned to clinical case queue with 2-hour SLA.`);
    }

    return assessment;
  }

  public static async queryClinicalKnowledge(query: string) {
    const entries = await ClinicalRepository.findAllClinicalKnowledge();
    const keywords = query.toLowerCase().split(/\s+/);

    // Score entries based on keyword matches
    const scored = entries.map(entry => {
      let score = 0;
      const topicLower = entry.topic.toLowerCase();
      const contentLower = entry.content.toLowerCase();
      const tagsLower = entry.tags.toLowerCase();

      keywords.forEach(keyword => {
        if (keyword.length < 3) return; // skip very short words
        if (topicLower.includes(keyword)) score += 10;
        if (contentLower.includes(keyword)) score += 3;
        if (tagsLower.includes(keyword)) score += 5;
      });

      return { entry, score };
    });

    // Filter out zero matches and sort descending
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.entry);
  }

  public static async getVisitAiSummary(visitId: string) {
    const visit = await ClinicalRepository.findVisitForAiSummary(visitId);

    if (!visit) throw new AppError('', HTTP_STATUS.NOT_FOUND);

    const patientName = visit.request.patient.user.fullName;
    const latestVitals = visit.vitals.sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())[0];
    const symptoms = visit.symptoms.map(s => `${s.symptomName} (${s.severity.toLowerCase()})`).join(', ');

    const summaryText = `AI clinical summary for patient ${patientName}: Visit scheduled for ${new Date(visit.request.scheduledAt || new Date()).toLocaleDateString()} completed. Symptoms reported: ${symptoms || 'None'}. Vitals recorded: Temp=${latestVitals?.temperature ?? 'N/A'}°C, BP=${latestVitals?.systolic ?? 'N/A'}/${latestVitals?.diastolic ?? 'N/A'} mmHg, SpO2=${latestVitals?.oxygenSaturation ?? 'N/A'}%.`;

    // AI recommendations
    const recommendations: string[] = [];
    if (latestVitals) {
      if (latestVitals.oxygenSaturation < 92) {
        recommendations.push('Immediate oxygen support evaluation recommended.');
      }
      if (latestVitals.systolic > 160 || latestVitals.diastolic > 100) {
        recommendations.push('Antihypertensive medication titration or review required.');
      }
      if (latestVitals.temperature > 38.5) {
        recommendations.push('Monitor for signs of systemic infection or post-surgical wound issues.');
      }
    }

    if (visit.symptoms.some(s => s.severity === 'SEVERE')) {
      recommendations.push('Patient exhibits severe symptoms. Schedule urgent follow-up review.');
    } else {
      recommendations.push('Continue regular home monitoring and adherence reporting.');
    }

    return {
      visitId,
      patientName,
      summary: summaryText,
      recommendations,
      generatedAt: new Date()
    };
  }
}
