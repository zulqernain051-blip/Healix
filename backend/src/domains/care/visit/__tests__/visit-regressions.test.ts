import { prisma } from '../../../../common/config/database';
import { NurseSchedulingRepository } from '../../../identity/nurse/repositories/nurse-scheduling.repository';
import { CreateVacationUseCase } from '../scheduling/create-vacation.usecase';
import { DeleteVacationUseCase } from '../scheduling/delete-vacation.usecase';
import { VisitAccessPolicy } from '../shared/policies/visit-access.policy';
import { VerificationService } from '../verification/verification.service';
import { VerificationRepository } from '../verification/verification.repository';
import { VisitRepository } from '../visit.repository';
import { VerificationController } from '../verification/verification.controller';
import { VisitController } from '../visit.controller';

jest.mock('../../../../common/config/database', () => ({ prisma: { $transaction: jest.fn(), $queryRaw: jest.fn(), visit: { findFirst: jest.fn() }, nurseVacation: { findFirst: jest.fn(), create: jest.fn(), deleteMany: jest.fn(), findMany: jest.fn() } } }));
jest.mock('../visit.repository', () => ({ VisitRepository: { startVisit: jest.fn(), findVisitById: jest.fn() } }));
jest.mock('../verification/verification.repository', () => ({ VerificationRepository: { findVisitWithPatient: jest.fn(), findEvidence: jest.fn(), findAttendance: jest.fn() } }));

const db = prisma as any;
const visit = { id: 'visit-1', status: 'SCHEDULED', nurseId: 'nurse-1', doctorId: null, request: { patientId: 'patient-1', patient: { latitude: 0, longitude: 0 } }, caseAssignment: { doctorId: 'doctor-1' } };

beforeEach(() => {
  jest.clearAllMocks();
  db.$transaction.mockImplementation((fn: any) => fn(db));
  db.nurseVacation.findFirst.mockResolvedValue(null);
  db.visit.findFirst.mockResolvedValue(null);
  (VerificationRepository.findVisitWithPatient as jest.Mock).mockResolvedValue(visit);
  (VisitRepository.findVisitById as jest.Mock).mockResolvedValue(visit);
});

test('vacations now save and list actual nurse records', async () => {
  db.nurseVacation.findMany.mockResolvedValue([{ id: 'vacation-1' }]);
  await new CreateVacationUseCase().execute({ nurseId: 'nurse-1', startDate: new Date('2026-10-10'), endDate: new Date('2026-10-11') });
  expect(db.nurseVacation.create).toHaveBeenCalled();
  expect(await NurseSchedulingRepository.findVacationsByNurseId('nurse-1')).toHaveLength(1);
});

test('reversed vacation dates are rejected before persistence', async () => {
  await expect(new CreateVacationUseCase().execute({ nurseId: 'nurse-1', startDate: new Date('2026-10-11'), endDate: new Date('2026-10-10') })).rejects.toMatchObject({ statusCode: 400 });
  expect(db.nurseVacation.create).not.toHaveBeenCalled();
});

test('deleting another nurse vacation is scoped by owner and returns not found', async () => {
  db.nurseVacation.deleteMany.mockResolvedValue({ count: 0 });
  await expect(new DeleteVacationUseCase().execute({ nurseId: 'other-nurse', vacationId: 'vacation-1' })).rejects.toMatchObject({ statusCode: 404 });
  expect(db.nurseVacation.deleteMany).toHaveBeenCalledWith({ where: { id: 'vacation-1', nurseId: 'other-nurse' } });
});

test.each([
  [undefined, undefined], [NaN, 0], [0, Infinity], [91, 0], [0, 181]
])('invalid GPS coordinates %s/%s cannot start a visit', async (lat, lng) => {
  await expect(VerificationService.verifyWithGps('visit-1', 'nurse-1', lat as number, lng as number)).rejects.toMatchObject({ statusCode: 400 });
  expect(VisitRepository.startVisit).not.toHaveBeenCalled();
});

test('coordinates on the equator and prime meridian are valid', async () => {
  await VerificationService.verifyWithGps('visit-1', 'nurse-1', 0, 0);
  expect(VisitRepository.startVisit).toHaveBeenCalledWith('visit-1', 'GPS', expect.any(String), 0, 0);
});

test('a distant nurse cannot verify arrival', async () => {
  await expect(VerificationService.verifyWithGps('visit-1', 'nurse-1', 1, 1)).rejects.toMatchObject({ statusCode: 400 });
});

test('assigned clinical reviewers retain access even when visit.doctorId is null', () => {
  expect(() => VisitAccessPolicy.assertCanRead(visit, { id: 'u-1', role: 'DOCTOR', doctor: { id: 'doctor-1' } })).not.toThrow();
});

test('an unrelated patient cannot read visit detail, evidence, or attendance', async () => {
  const actor = { id: 'user-2', role: 'PATIENT', patient: { id: 'patient-2' } };
  expect(() => VisitAccessPolicy.assertCanRead(visit, actor)).toThrow();
  await expect(VerificationService.getEvidence('visit-1', actor)).rejects.toMatchObject({ statusCode: 403 });
  await expect(VerificationService.getAttendance('visit-1', actor)).rejects.toMatchObject({ statusCode: 403 });
  expect(VerificationRepository.findEvidence).not.toHaveBeenCalled();
  expect(VerificationRepository.findAttendance).not.toHaveBeenCalled();
});

test('visit detail controller rejects an unrelated patient', async () => {
  const next = jest.fn(), res = { json: jest.fn(), status: jest.fn() };
  await VisitController.getVisitDetail({ params: { visitId: 'visit-1' }, user: { id: 'user-2', role: 'PATIENT', patient: { id: 'patient-2' } } } as any, res as any, next);
  expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  expect(res.json).not.toHaveBeenCalled();
});

test('verification controller forwards client errors rather than returning HTTP 500', async () => {
  const next = jest.fn(), res = { json: jest.fn(), status: jest.fn() };
  await VerificationController.verifyWithGps({ params: { id: 'visit-1' }, body: {}, user: { nurse: { id: 'nurse-1' } } } as any, res as any, next);
  expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  expect(res.status).not.toHaveBeenCalledWith(500);
});

test('private nurse schedules reject unrelated users', () => {
  expect(() => VisitAccessPolicy.assertOwnNurse('nurse-1', { id: 'user-2', role: 'NURSE', nurse: { id: 'nurse-2' } })).toThrow();
});

test('time off overlapping a booked visit is rejected', async () => {
  db.visit.findFirst.mockResolvedValue({ id: 'booked' });
  await expect(new CreateVacationUseCase().execute({ nurseId: 'nurse-1', startDate: new Date('2026-10-10'), endDate: new Date('2026-10-11') })).rejects.toMatchObject({ statusCode: 409 });
  expect(db.nurseVacation.create).not.toHaveBeenCalled();
});
test('overlapping vacation ranges are rejected', async () => {
  db.nurseVacation.findFirst.mockResolvedValue({ id: 'existing' });
  await expect(new CreateVacationUseCase().execute({ nurseId: 'nurse-1', startDate: new Date('2026-10-10'), endDate: new Date('2026-10-11') })).rejects.toMatchObject({ statusCode: 409 });
});
