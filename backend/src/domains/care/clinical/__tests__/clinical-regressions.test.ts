import { ClinicalRepository } from '../clinical.repository';
import { AutomaticDoctorAssignmentUseCase } from '../usecases/assignment/automatic-doctor-assignment.usecase';
import { CaseAssignmentWorker } from '../workers/case-assignment.worker';
import { registerClinicalListeners } from '../clinical.listeners';
import { AppEventBus, EVENTS } from '../../../../common/events/app-event-bus';
import { LogMedicationDoseUseCase } from '../usecases/medication/log-medication-dose.usecase';
jest.mock('../clinical.repository', () => ({ ClinicalRepository: { findPendingCaseIds: jest.fn(), findMedicationById: jest.fn(), createMedicationLog: jest.fn() } }));
jest.mock('../usecases/assignment/automatic-doctor-assignment.usecase');
jest.mock('../../../../common/utils/logger', () => ({ logger: { error: jest.fn() } }));
beforeEach(() => { jest.resetAllMocks(); AppEventBus.removeAllListeners(); });

test('failed case assignment reaches the outbox for retry', async () => {
  (AutomaticDoctorAssignmentUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('temporary failure'));
  registerClinicalListeners();
  await expect(AppEventBus.emitAsync(EVENTS.CASE_CREATED, { caseId: 'case-1' })).rejects.toThrow('temporary failure');
});

test('recovery paginates past a failed case instead of starving later cases', async () => {
  const firstPage = Array.from({ length: 20 }, (_, i) => ({ id: 'case-' + i }));
  (ClinicalRepository.findPendingCaseIds as jest.Mock).mockResolvedValueOnce(firstPage).mockResolvedValueOnce([{ id: 'last-case' }]);
  (AutomaticDoctorAssignmentUseCase.prototype.execute as jest.Mock).mockRejectedValueOnce(new Error('failed')).mockResolvedValue({});
  await CaseAssignmentWorker.processPendingCases();
  expect(ClinicalRepository.findPendingCaseIds).toHaveBeenNthCalledWith(2, 'case-19');
  expect(AutomaticDoctorAssignmentUseCase.prototype.execute).toHaveBeenCalledTimes(21);
  expect(AutomaticDoctorAssignmentUseCase.prototype.execute).toHaveBeenLastCalledWith('last-case');
});

test('medication belonging to another patient cannot be logged', async () => {
  (ClinicalRepository.findMedicationById as jest.Mock).mockResolvedValue({ patientId: 'another-patient' });
  await expect(new LogMedicationDoseUseCase().execute('medication-1', 'patient-1')).rejects.toMatchObject({ statusCode: 403 });
  expect(ClinicalRepository.createMedicationLog).not.toHaveBeenCalled();
});

test('the owner can log a medication dose', async () => {
  (ClinicalRepository.findMedicationById as jest.Mock).mockResolvedValue({ patientId: 'patient-1' });
  await new LogMedicationDoseUseCase().execute('medication-1', 'patient-1');
  expect(ClinicalRepository.createMedicationLog).toHaveBeenCalledWith('medication-1', 'patient-1');
});
