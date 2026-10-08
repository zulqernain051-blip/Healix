import { prisma } from '../../../../common/config/database';
import { EmergencyOperationsService } from '../operations.service';
import { ResourceAssignmentService } from '../resource-assignment.service';
import { DispatchService } from '../dispatch/dispatch.service';
import { AmbulanceService } from '../ambulance/ambulance.service';

jest.mock('../../../../common/config/database', () => {
  const model = () => ({ findUnique: jest.fn(), findUniqueOrThrow: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn(), count: jest.fn(), delete: jest.fn() });
  const db: any = { ambulanceDispatch: model(), ambulance: model(), paramedic: model(), admission: model(), eventOutbox: model() };
  db.$queryRaw = jest.fn().mockResolvedValue([{ id: 'row' }]);
  db.$transaction = jest.fn((fn: any) => fn(db));
  return { prisma: db };
});
const db = prisma as any;
beforeEach(() => { jest.clearAllMocks(); db.$queryRaw.mockResolvedValue([{ id: 'row' }]); });

test('paramedic queue is scoped to their user identity', async () => {
  await EmergencyOperationsService.listDispatches({ id: 'paramedic-user', role: 'PARAMEDIC' });
  expect(db.ambulanceDispatch.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { paramedic: { userId: 'paramedic-user' } } }));
});
test('unsupported roles cannot enumerate dispatch records', async () => {
  await expect(EmergencyOperationsService.listDispatches({ id: 'nurse', role: 'NURSE' })).rejects.toMatchObject({ statusCode: 403 });
});
test('only the assigned paramedic can send GPS', async () => {
  db.ambulanceDispatch.findUnique.mockResolvedValue({ id: 'trip', paramedic: { userId: 'owner' } });
  await expect(EmergencyOperationsService.updateLocation('trip', { id: 'other', role: 'PARAMEDIC' }, { latitude: 30, longitude: 70 })).rejects.toMatchObject({ statusCode: 403 });
  expect(db.ambulanceDispatch.updateMany).not.toHaveBeenCalled();
});
test('invalid coordinates are rejected before writing', async () => {
  await expect(EmergencyOperationsService.updateLocation('trip', { id: 'owner', role: 'PARAMEDIC' }, { latitude: 200, longitude: 70 })).rejects.toMatchObject({ statusCode: 400 });
});
test('a closed dispatch cannot accept location updates', async () => {
  db.ambulanceDispatch.findUnique.mockResolvedValue({ id: 'trip', paramedicId: 'p', paramedic: { userId: 'owner' } });
  db.ambulanceDispatch.updateMany.mockResolvedValue({ count: 0 });
  await expect(EmergencyOperationsService.updateLocation('trip', { id: 'owner', role: 'PARAMEDIC' }, { latitude: 30, longitude: 70 })).rejects.toMatchObject({ statusCode: 409 });
});
test('GPS and paramedic ETA have server timestamps', async () => {
  db.ambulanceDispatch.findUnique.mockResolvedValue({ id: 'trip', paramedicId: 'p', paramedic: { userId: 'owner' } });
  db.ambulanceDispatch.updateMany.mockResolvedValue({ count: 1 });
  const tracking = jest.spyOn(DispatchService, 'getDispatchTracking').mockResolvedValue({ id: 'trip' } as any);
  await EmergencyOperationsService.updateLocation('trip', { id: 'owner', role: 'PARAMEDIC' }, { latitude: 30, longitude: 70, etaMinutes: 8 });
  expect(db.ambulanceDispatch.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ etaMinutes: 8, etaUpdatedAt: expect.any(Date), locationUpdatedAt: expect.any(Date) }) }));
  tracking.mockRestore();
});
test('a busy vehicle cannot replace an assigned vehicle', async () => {
  db.ambulanceDispatch.findUnique.mockResolvedValue({ status: 'EN_ROUTE', ambulanceId: 'old' });
  db.ambulance.findUnique.mockResolvedValue({ id: 'new' });
  db.ambulance.updateMany.mockResolvedValue({ count: 0 });
  await expect(ResourceAssignmentService.assignVehicle('trip', 'new')).rejects.toMatchObject({ statusCode: 409 });
  expect(db.ambulance.update).not.toHaveBeenCalled();
});
test('vehicle replacement claims the new vehicle before releasing the old one', async () => {
  db.ambulanceDispatch.findUnique.mockResolvedValue({ status: 'EN_ROUTE', ambulanceId: 'old' });
  db.ambulance.findUnique.mockResolvedValue({ id: 'new' });
  db.ambulance.updateMany.mockResolvedValue({ count: 1 });
  await ResourceAssignmentService.assignVehicle('trip', 'new');
  expect(db.ambulance.updateMany.mock.invocationCallOrder[0]).toBeLessThan(db.ambulance.update.mock.invocationCallOrder[0]);
  expect(db.ambulanceDispatch.update).toHaveBeenCalledWith({ where: { id: 'trip' }, data: { ambulanceId: 'new' } });
});
test('unverified paramedics cannot be assigned', async () => {
  db.ambulanceDispatch.findUnique.mockResolvedValue({ status: 'DISPATCHED' });
  db.paramedic.findUnique.mockResolvedValue({ verificationStatus: 'PENDING', user: { status: 'ACTIVE' } });
  await expect(ResourceAssignmentService.assignParamedic('trip', 'p')).rejects.toMatchObject({ statusCode: 400 });
});
test('admission request replay returns the existing admission', async () => {
  const access = jest.spyOn(DispatchService, 'assertAccess').mockResolvedValue(undefined);
  db.ambulanceDispatch.findUniqueOrThrow.mockResolvedValue({ status: 'ARRIVED', patientId: 'patient' });
  db.admission.findFirst.mockResolvedValue({ id: 'existing' });
  await expect(EmergencyOperationsService.requestAdmission('trip', { role: 'ADMIN' })).resolves.toEqual({ id: 'existing' });
  expect(db.admission.create).not.toHaveBeenCalled(); access.mockRestore();
});
test('patients cannot create their own admission record', async () => {
  await expect(EmergencyOperationsService.requestAdmission('trip', { role: 'PATIENT' })).rejects.toMatchObject({ statusCode: 403 });
});
test('fleet editing cannot manually release a vehicle with an active trip', async () => {
  db.ambulanceDispatch.count.mockResolvedValue(1);
  await expect(AmbulanceService.updateAmbulance('vehicle', { status: 'AVAILABLE' })).rejects.toMatchObject({ statusCode: 409 });
  expect(db.ambulance.update).not.toHaveBeenCalled();
});

test('a paramedic serving another active trip cannot be reassigned', async () => {
  db.ambulanceDispatch.findUnique.mockResolvedValue({ status: 'PENDING', ambulanceId: 'vehicle' });
  db.paramedic.findUnique.mockResolvedValue({ verificationStatus: 'VERIFIED', user: { status: 'ACTIVE' } });
  db.ambulanceDispatch.findFirst.mockResolvedValue({ id: 'other-trip' });
  await expect(ResourceAssignmentService.assignParamedic('trip', 'p')).rejects.toMatchObject({ statusCode: 409 });
  expect(db.ambulanceDispatch.update).not.toHaveBeenCalled();
});
