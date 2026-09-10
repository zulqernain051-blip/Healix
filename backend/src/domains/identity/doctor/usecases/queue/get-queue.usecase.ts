import { DoctorRepository } from '../../doctor.repository';

export class GetQueueUseCase {
  constructor(private readonly doctorRepository = DoctorRepository) {}

  async execute(doctorId: string) {
    const queue = await this.doctorRepository.findQueueByDoctorId(doctorId);
    const now = new Date();

    return queue.map(c => {
      const remainingMs = c.slaDeadline.getTime() - now.getTime();
      const remainingMins = Math.max(0, Math.round(remainingMs / (1000 * 60)));
      return {
        ...c,
        remainingMins
      };
    });
  }
}
