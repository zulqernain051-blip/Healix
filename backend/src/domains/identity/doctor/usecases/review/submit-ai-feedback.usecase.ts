import { DoctorRepository } from '../../doctor.repository';

export class SubmitAiFeedbackUseCase {
  constructor(private readonly doctorRepository = DoctorRepository) {}

  async execute(caseId: string, doctorId: string, targetType: string, comment: string) {
    return this.doctorRepository.createAiFeedback(caseId, doctorId, targetType, comment);
  }
}
