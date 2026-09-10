import { DoctorRepository } from '../../doctor.repository';

export class GetDoctorsUseCase {
  constructor(private readonly doctorRepository = DoctorRepository) {}

  async execute(doctorId: string) {
    return this.doctorRepository.findDoctorsExcluding(doctorId);
  }
}
