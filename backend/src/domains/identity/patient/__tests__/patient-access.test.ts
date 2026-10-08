import { AssertPatientAccessUseCase } from '../usecases/profile/assert-patient-access.usecase';
import { PatientRepository } from '../patient.repository';

jest.mock('../patient.repository', () => ({ PatientRepository: { hasCareRelationship: jest.fn() } }));
beforeEach(() => jest.clearAllMocks());

test('patients can access their own records without a staff assignment', async () => {
  await AssertPatientAccessUseCase.execute('patient-1', { id: 'user-1', role: 'PATIENT', patient: { id: 'patient-1' } });
  expect(PatientRepository.hasCareRelationship).not.toHaveBeenCalled();
});

test('unrelated clinicians cannot access patient records', async () => {
  (PatientRepository.hasCareRelationship as jest.Mock).mockResolvedValue(false);
  await expect(AssertPatientAccessUseCase.execute('patient-1', { id: 'user-2', role: 'NURSE' })).rejects.toMatchObject({ statusCode: 403 });
});

test('assigned clinicians retain patient access', async () => {
  (PatientRepository.hasCareRelationship as jest.Mock).mockResolvedValue(true);
  await AssertPatientAccessUseCase.execute('patient-1', { id: 'user-2', role: 'DOCTOR' });
  expect(PatientRepository.hasCareRelationship).toHaveBeenCalledWith('patient-1', 'user-2', 'DOCTOR');
});
