const fs = require('fs');
let code = fs.readFileSync('src/domains/identity/doctor/doctor.controller.ts', 'utf8');

code = code.replace(
  `import { SubmitAiFeedbackUseCase } from './usecases/review/submit-ai-feedback.usecase';`,
  `  carePlanSchema,
  prescriptionSchema,
  decisionSchema,
  aiFeedbackSchema
} from './doctor.validation';

// Queue Use Cases
import { GetQueueUseCase } from './usecases/queue/get-queue.usecase';
import { GetHighRiskQueueUseCase } from './usecases/queue/get-high-risk-queue.usecase';
import { AcceptEmergencyCaseUseCase } from './usecases/queue/accept-emergency-case.usecase';

// Review Use Cases
import { StartCaseReviewUseCase } from './usecases/review/start-case-review.usecase';
import { GetCaseReviewUseCase } from './usecases/review/get-case-review.usecase';
import { RequestSecondOpinionUseCase } from './usecases/review/request-second-opinion.usecase';
import { SubmitClinicalDecisionUseCase } from './usecases/review/submit-clinical-decision.usecase';
import { SubmitAiFeedbackUseCase } from './usecases/review/submit-ai-feedback.usecase';`
);

code = code.replace(`const supersedePrescriptionUseCase = new SupersedePrescriptionUseCase();`, `const supersedePrescriptionUseCase = new SupersedePrescriptionUseCase();
const acceptEmergencyCaseUseCase = new AcceptEmergencyCaseUseCase();`);

code = code.replace(
  `public static async getHighRiskQueue`,
  `public static async acceptEmergencyCase(req: Request, res: Response) {
    try {
      const { caseId } = req.params;
      const doctorId = (req as any).user?.doctor?.id;
      if (!doctorId) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }
      const result = await acceptEmergencyCaseUseCase.execute(caseId, doctorId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getHighRiskQueue`
);

fs.writeFileSync('src/domains/identity/doctor/doctor.controller.ts', code);
