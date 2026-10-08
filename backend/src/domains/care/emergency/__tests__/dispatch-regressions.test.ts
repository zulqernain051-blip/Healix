import { prisma } from '../../../../common/config/database';
import { EmergencyRepository } from '../emergency.repository';
import { DispatchService } from '../dispatch/dispatch.service';
import { DispatchAmbulanceUseCase } from '../usecases/dispatch-ambulance.usecase';
import { AdmissionRepository } from '../admission/admission.repository';
import { AssertPatientAccessUseCase } from '../../../identity/patient/usecases/profile/assert-patient-access.usecase';

jest.mock('../../../../common/config/database', () => {
  const model = () => ({ findUnique: jest.fn(), findUniqueOrThrow: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn() });
  const db: any = { user: model(), patient: model(), hospital: model(), ambulance: model(), paramedic: model(), ambulanceDispatch: model(), emergencyEvent: model(), eventOutbox: model(), admission: model(), careRequest: model() };
  db.$transaction = jest.fn((callback: any) => callback(db));
  db.$queryRaw = jest.fn().mockResolvedValue([{ id: 'patient-1' }]);
  return { prisma: db };
});
jest.mock('../../../communication/chat/chat.socket', () => ({ ChatSocketService: { getIo: () => undefined } }));
jest.mock('../../../identity/patient/usecases/profile/assert-patient-access.usecase', () => ({ AssertPatientAccessUseCase: { execute: jest.fn() } }));

const db = prisma as any;
const data = { patientId: 'patient-1', doctorId: 'doctor-1', doctorUserId: 'doctor-user' };
beforeEach(() => {
  jest.clearAllMocks();
  db.hospital.findFirst.mockResolvedValue({ id: 'hospital-default' });
  db.hospital.findUnique.mockResolvedValue({ id: 'hospital-selected' });
  db.ambulance.findFirst.mockResolvedValue({ id: 'ambulance-1', status: 'AVAILABLE' });
  db.ambulance.updateMany.mockResolvedValue({ count: 1 });
  db.ambulanceDispatch.updateMany.mockResolvedValue({ count: 1 });
  db.ambulanceDispatch.findFirst.mockResolvedValue(null);
  db.ambulanceDispatch.create.mockResolvedValue({ id: 'dispatch-1' });
  db.ambulance.update.mockResolvedValue({ id: 'ambulance-1', status: 'DISPATCHED' });
  db.paramedic.findMany.mockResolvedValue([{ id: 'paramedic-1', userId: 'paramedic-user', ambulanceDispatches: [] }]);
  db.emergencyEvent.create.mockResolvedValue({ id: 'event-1' });
});

test('the selected hospital reaches dispatch persistence', async () => {
  db.user.findUnique.mockResolvedValue({ id: 'doctor-user', role: 'DOCTOR', status: 'ACTIVE', doctor: { id: 'doctor-1', verificationStatus: 'VERIFIED' } });
  await DispatchService.triggerAmbulanceDispatch('patient-1', 'hospital-selected', 'doctor-user');
  expect(db.ambulanceDispatch.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ hospitalId: 'hospital-selected' }) }));
  expect(db.hospital.findFirst).not.toHaveBeenCalled();
});

test('standalone dispatch uses a transaction and queues communication after commit', async () => {
  await new DispatchAmbulanceUseCase().execute('patient-1', undefined, 'doctor-1', 'doctor-user');
  expect(db.$transaction).toHaveBeenCalled();
  expect(db.eventOutbox.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ eventType: 'AMBULANCE_DISPATCHED', payload: expect.objectContaining({ paramedicUserId: 'paramedic-user' }) }) }));
});

test('resource shortage returns HTTP 503 and preserves an independent emergency record', async () => {
  db.ambulance.findFirst.mockResolvedValue(null);
  const outerTransaction = { ...db, emergencyEvent: { create: jest.fn() } };
  await expect(EmergencyRepository.createEmergencyWorkflow(data, outerTransaction)).rejects.toMatchObject({ statusCode: 503 });
  expect(db.emergencyEvent.create).toHaveBeenCalled();
  expect(outerTransaction.emergencyEvent.create).not.toHaveBeenCalled();
  expect(db.ambulanceDispatch.create).not.toHaveBeenCalled();
});

test('missing hospitals do not generate a simulated destination', async () => {
  db.hospital.findFirst.mockResolvedValue(null);
  await expect(EmergencyRepository.createEmergencyWorkflow(data)).rejects.toMatchObject({ statusCode: 503 });
  expect(db.hospital.create).not.toHaveBeenCalled();
});

test('a vehicle claimed concurrently cannot be dispatched twice', async () => {
  db.ambulance.updateMany.mockResolvedValueOnce({ count: 0 });
  await expect(EmergencyRepository.createEmergencyWorkflow(data)).rejects.toMatchObject({ statusCode: 409 });
  expect(db.ambulanceDispatch.create).not.toHaveBeenCalled();
});

test('a patient dispatch is rechecked after acquiring its lock', async () => {
  db.ambulanceDispatch.findFirst.mockResolvedValueOnce({ id: 'already-dispatched' });
  await expect(EmergencyRepository.createEmergencyWorkflow(data)).rejects.toMatchObject({ statusCode: 409 });
  expect(db.ambulanceDispatch.create).not.toHaveBeenCalled();
});

test('completed dispatches cannot be reopened', async () => {
  db.ambulanceDispatch.findUnique.mockResolvedValue({ id: 'dispatch-1', status: 'COMPLETED' });
  await expect(DispatchService.updateDispatchStatus('dispatch-1', 'EN_ROUTE')).rejects.toMatchObject({ statusCode: 409 });
});

test('concurrent status updates do not release the ambulance', async () => {
  db.ambulanceDispatch.findUnique.mockResolvedValue({ id: 'dispatch-1', status: 'ARRIVED', ambulanceId: 'ambulance-1' });
  db.ambulanceDispatch.updateMany.mockResolvedValueOnce({ count: 0 });
  await expect(DispatchService.updateDispatchStatus('dispatch-1', 'COMPLETED')).rejects.toMatchObject({ statusCode: 409 });
  expect(db.ambulance.update).not.toHaveBeenCalled();
});

test('a patient cannot update their own dispatch status', async () => {
  db.ambulanceDispatch.findUnique.mockResolvedValue({ patientId: 'patient-1', status: 'DISPATCHED' });
  await expect(DispatchService.assertAccess('dispatch-1', { id: 'patient-user', role: 'PATIENT', patient: { id: 'patient-1' } }, true)).rejects.toMatchObject({ statusCode: 403 });
});

test('tracking access delegates to the patient care relationship check', async () => {
  db.ambulanceDispatch.findUnique.mockResolvedValue({ patientId: 'patient-1', status: 'DISPATCHED' });
  (AssertPatientAccessUseCase.execute as jest.Mock).mockRejectedValueOnce(new Error('Forbidden'));
  await expect(DispatchService.assertAccess('dispatch-1', { id: 'outsider', role: 'NURSE' })).rejects.toThrow('Forbidden');
});

test('discharge replay does not create duplicate follow-up requests', async () => {
  db.admission.findUnique.mockResolvedValue({ id: 'admission-1', status: 'DISCHARGED' });
  await AdmissionRepository.updateAdmissionStatusAndCreateFollowUp('admission-1', 'DISCHARGED');
  expect(db.careRequest.create).not.toHaveBeenCalled();
});

test('discharge racing another status update does not create a follow-up', async () => {
  db.admission.findUnique.mockResolvedValue({ id: 'admission-1', status: 'ADMITTED' });
  db.admission.updateMany.mockResolvedValueOnce({ count: 0 });
  await expect(AdmissionRepository.updateAdmissionStatusAndCreateFollowUp('admission-1', 'DISCHARGED')).rejects.toMatchObject({ statusCode: 409 });
  expect(db.careRequest.create).not.toHaveBeenCalled();
});
