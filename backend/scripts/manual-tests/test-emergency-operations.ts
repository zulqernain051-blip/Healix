import { qaToken } from './qa-session';
/** Real database + HTTP verification. Only this run's UUID-scoped fixtures are removed. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import app from '../../src/app';
import { prisma } from '../../src/common/config/database';
import { config } from '../../src/common/config';
import { EmergencyRepository } from '../../src/domains/care/emergency/emergency.repository';
import { logger } from '../../src/common/utils/logger';

async function main() {
  require('../dev/jest-isolation.cjs');
  logger.silent = true;
  const runId = randomUUID();
  const users: string[] = [], vehicles: string[] = [], hospitals: string[] = [], trips: string[] = [];
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const port = (server.address() as any).port;
  const request = async (actor: any, method: string, path: string, data?: unknown, expected = 200) => {
    const token = await qaToken(actor);
    const response = await fetch(`http://127.0.0.1:${port}/api/v1${path}`, { method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) });
    const body = await response.json();
    assert.equal(response.status, expected, `${method} ${path}: ${body.message || response.status}`);
    return body.data;
  };
  const createUser = async (role: 'ADMIN' | 'DOCTOR' | 'PARAMEDIC' | 'PATIENT') => {
    const id = randomUUID();
    const u = await prisma.user.create({ data: { id, email: `${id}@healix-test.invalid`, phone: `qa-${id}`, fullName: `Emergency QA ${role}`, passwordHash: await bcrypt.hash(randomUUID(), 4), role, status: 'ACTIVE',
      ...(role === 'ADMIN' ? { admin: { create: {} } } : {}),
      ...(role === 'DOCTOR' ? { doctor: { create: { cnic: id, pmdcNumber: id, verificationStatus: 'VERIFIED' } } } : {}),
      ...(role === 'PARAMEDIC' ? { paramedic: { create: { cnic: id, certificationNumber: id, verificationStatus: 'VERIFIED' } } } : {}),
      ...(role === 'PATIENT' ? { patient: { create: { cnic: id, latitude: 31.5, longitude: 74.3 } } } : {}),
    }, include: { doctor: true, patient: true, paramedic: true } });
    users.push(u.id); return u;
  };
  const findVehicle = EmergencyRepository.findAvailableAmbulance;
  const findParamedic = EmergencyRepository.findLowestWorkloadParamedic;
  try {
    const admin = await createUser('ADMIN'), doctor = await createUser('DOCTOR'), paramedic = await createUser('PARAMEDIC'), patient = await createUser('PATIENT'), outsider = await createUser('PATIENT');
    const requestRecord = await prisma.careRequest.create({ data: { patientId: patient.patient!.id, type: 'NURSE_VISIT', visits: { create: { doctorId: doctor.doctor!.id, caseAssignment: { create: { doctorId: doctor.doctor!.id, riskTier: 'HIGH', status: 'ASSIGNED', slaDeadline: new Date(Date.now() + 900000) } } } } }, include: { visits: { include: { caseAssignment: true } } } });
    const caseId = requestRecord.visits[0].caseAssignment!.id;
    const colleague = await createUser('DOCTOR');
    const profile = await request(doctor, 'GET', '/auth/me');
    assert.equal(profile.doctor.pmdcNumber, doctor.doctor!.pmdcNumber);
    assert.equal(profile.doctor.verificationStatus, 'VERIFIED');
    const queue = await request(doctor, 'GET', '/doctors/queue');
    assert(queue.some((c: any) => c.id === caseId && typeof c.remainingMins === 'number'));
    await prisma.caseAssignment.update({ where: { id: caseId }, data: { doctorId: null, status: 'PROFESSIONAL_BROADCAST' } });
    await request(doctor, 'GET', `/cases/${caseId}/review`, undefined, 403);
    await request(doctor, 'PUT', `/cases/${caseId}/start-review`, {}, 403);
    await prisma.doctor.update({ where: { id: doctor.doctor!.id }, data: { isProfessional: true } });
    assert((await request(doctor, 'GET', '/doctors/queue/high-risk')).some((c: any) => c.id === caseId));
    await request(doctor, 'PUT', `/cases/${caseId}/start-review`, {});
    assert.equal((await prisma.caseAssignment.findUniqueOrThrow({ where: { id: caseId } })).status, 'IN_REVIEW');
    assert(await prisma.chatThread.findFirst({ where: { OR: [{ participantAId: doctor.id, participantBId: patient.id }, { participantAId: patient.id, participantBId: doctor.id }] } }));
    await request(colleague, 'POST', `/cases/${caseId}/second-opinion`, { consultedDoctorId: doctor.doctor!.id }, 403);
    await request(doctor, 'POST', `/cases/${caseId}/second-opinion`, { consultedDoctorId: colleague.doctor!.id }, 201);
    const candidates = await request(doctor, 'GET', '/doctors/home-visits/patients');
    assert(candidates.some((p: any) => p.id === patient.patient!.id));
    await request(doctor, 'POST', '/doctors/home-visits', { patientId: outsider.patient!.id, scheduledAt: new Date(Date.now() + 3600000).toISOString() }, 403);
    await request(doctor, 'POST', '/doctors/home-visits', { patientId: patient.patient!.id, scheduledAt: new Date(Date.now() - 3600000).toISOString() }, 400);
    const homeVisit = await request(doctor, 'POST', '/doctors/home-visits', { patientId: patient.patient!.id, scheduledAt: new Date(Date.now() + 3600000).toISOString() }, 201);
    await request(colleague, 'PUT', `/doctors/home-visits/${homeVisit.id}`, { status: 'EN_ROUTE' }, 403);
    await request(doctor, 'PUT', `/doctors/home-visits/${homeVisit.id}`, { status: 'COMPLETED', findings: 'QA findings' }, 409);
    await request(doctor, 'PUT', `/doctors/home-visits/${homeVisit.id}`, { status: 'EN_ROUTE' });
    await request(doctor, 'PUT', `/doctors/home-visits/${homeVisit.id}`, { status: 'ARRIVED' });
    await request(doctor, 'PUT', `/doctors/home-visits/${homeVisit.id}`, { status: 'COMPLETED' }, 400);
    await request(doctor, 'PUT', `/doctors/home-visits/${homeVisit.id}`, { status: 'COMPLETED', findings: 'QA workflow findings', outcomeNotes: 'QA completed' });
    assert((await request(doctor, 'GET', '/doctors/home-visits')).some((v: any) => v.id === homeVisit.id && v.status === 'COMPLETED'));
    const hospital = await request(admin, 'POST', '/admin/hospitals', { name: `QA Hospital ${runId}`, latitude: 31.51, longitude: 74.31, capacityStatus: 'AVAILABLE', affordabilityTier: 'LOW', isCharity: true }); hospitals.push(hospital.id);
    await request(admin, 'POST', '/admin/hospitals', { name: 'Invalid QA', latitude: 99, longitude: 74.3, capacityStatus: 'NORMAL', affordabilityTier: 'STANDARD' }, 400);
    for (const suffix of ['A', 'B']) { const v = await request(admin, 'POST', '/admin/ambulances', { vehicleNumber: `${runId}-${suffix}`, plateNumber: `${runId}-${suffix}`, type: 'ADVANCED' }); vehicles.push(v.id); }
    // Restrict automatic selection to this run's resources to avoid notifying or changing existing users/vehicles.
    EmergencyRepository.findAvailableAmbulance = async () => prisma.ambulance.findUnique({ where: { id: vehicles[0] } });
    EmergencyRepository.findLowestWorkloadParamedic = async () => prisma.paramedic.findUnique({ where: { id: paramedic.paramedic!.id }, include: { user: true, ambulanceDispatches: true } }) as any;
    const recommended = await request(doctor, 'GET', `/hospitals/recommend?patientId=${patient.patient!.id}&latitude=31.5&longitude=74.3&affordabilityTier=LOW`);
    assert(recommended.some((h: any) => h.id === hospital.id));
    await request(outsider, 'GET', `/hospitals/recommend?patientId=${patient.patient!.id}&latitude=31.5&longitude=74.3`, undefined, 403);
    await request(doctor, 'POST', `/cases/${caseId}/decision`, { decision: 'REQUEST_EMERGENCY', justification: 'QA workflow checks emergency transport', hospitalId: hospital.id, autoDispatch: true }, 201);
    const dispatch = await prisma.ambulanceDispatch.findFirstOrThrow({ where: { patientId: patient.patient!.id } }); trips.push(dispatch.id);
    assert.equal(dispatch.ambulanceId, vehicles[0]); assert.equal(dispatch.paramedicId, paramedic.paramedic!.id);
    assert.equal((await prisma.caseAssignment.findUniqueOrThrow({ where: { id: caseId } })).status, 'RESOLVED');
    await request(doctor, 'POST', '/dispatch', { patientId: patient.patient!.id, hospitalId: hospital.id, justification: 'QA duplicate dispatch check' }, 409);
    await request(outsider, 'GET', `/dispatch/${dispatch.id}/tracking`, undefined, 403);
    await request(patient, 'PUT', `/dispatch/${dispatch.id}/status`, { status: 'ARRIVED' }, 403);
    await request(paramedic, 'PUT', `/dispatch/${dispatch.id}/location`, { latitude: 31.52, longitude: 74.32, etaMinutes: 7 });
    const tracking = await request(patient, 'GET', `/dispatch/${dispatch.id}/tracking`);
    assert.equal(tracking.location.latitude, 31.52); assert.equal(tracking.etaSource, 'PARAMEDIC_ESTIMATE');
    assert.equal((await request(paramedic, 'GET', '/dispatch')).length, 1);
    await request(admin, 'PUT', `/admin/ambulances/${vehicles[1]}`, { status: 'INACTIVE' });
    await request(admin, 'POST', `/admin/emergencies/${dispatch.id}/assign-ambulance`, { ambulanceId: vehicles[1] }, 409);
    await request(admin, 'PUT', `/admin/ambulances/${vehicles[1]}`, { status: 'AVAILABLE' });
    await request(admin, 'POST', `/admin/emergencies/${dispatch.id}/assign-ambulance`, { ambulanceId: vehicles[1] });
    assert.equal((await prisma.ambulance.findUniqueOrThrow({ where: { id: vehicles[0] } })).status, 'AVAILABLE');
    await request(admin, 'PUT', `/admin/ambulances/${vehicles[1]}`, { status: 'AVAILABLE' }, 409);
    await request(paramedic, 'PUT', `/dispatch/${dispatch.id}/status`, { status: 'EN_ROUTE' });
    await request(paramedic, 'PUT', `/dispatch/${dispatch.id}/status`, { status: 'ARRIVED' });
    const admissions = await Promise.all([request(admin, 'POST', `/dispatch/${dispatch.id}/admission`, {}), request(doctor, 'POST', `/dispatch/${dispatch.id}/admission`, {})]);
    assert.equal(admissions[0].id, admissions[1].id);
    await request(admin, 'PUT', `/admissions/${admissions[0].id}/status`, { status: 'ADMITTED' });
    await request(admin, 'PUT', `/admissions/${admissions[0].id}/status`, { status: 'DISCHARGED', dischargeNotes: 'QA discharge follow-up' });
    await request(admin, 'PUT', `/admissions/${admissions[0].id}/status`, { status: 'DISCHARGED' });
    assert.equal(await prisma.careRequest.count({ where: { patientId: patient.patient!.id, status: 'DRAFT' } }), 1);
    await request(paramedic, 'PUT', `/dispatch/${dispatch.id}/status`, { status: 'COMPLETED' });
    assert.equal((await prisma.ambulance.findUniqueOrThrow({ where: { id: vehicles[1] } })).status, 'AVAILABLE');
    await request(paramedic, 'PUT', `/dispatch/${dispatch.id}/location`, { latitude: 31.52, longitude: 74.32 }, 409);
    await request(admin, 'DELETE', `/admin/ambulances/${vehicles[1]}`, undefined, 409);
    await request(admin, 'DELETE', `/admin/hospitals/${hospital.id}`, undefined, 409);
    // Emergencies without nurse visits must also be assignable and dispatchable.
    const event = await prisma.emergencyEvent.create({ data: { patientId: outsider.patient!.id, source: 'CHAT', severity: 'CRITICAL', status: 'ACTIVE' } });
    await request(admin, 'POST', `/admin/emergencies/${event.id}/assign-doctor`, { doctorId: doctor.doctor!.id });
    const eventQueue = await request(doctor, 'GET', '/emergency/events');
    assert(eventQueue.some((e: any) => e.id === event.id));
    const standalone = await request(doctor, 'POST', '/dispatch', { patientId: outsider.patient!.id, hospitalId: hospital.id, justification: 'QA standalone emergency transport' });
    trips.push(standalone.ambulanceDispatch.id);
    assert.equal(standalone.ambulanceDispatch.emergencyEventId, event.id);
    assert.equal(standalone.ambulanceDispatch.notes, 'QA standalone emergency transport');
    await request(admin, 'PUT', `/dispatch/${standalone.ambulanceDispatch.id}/status`, { status: 'ARRIVED' });
    await request(admin, 'PUT', `/dispatch/${standalone.ambulanceDispatch.id}/status`, { status: 'COMPLETED' });
    console.log('PASS: real HTTP/database emergency workflow, GPS, authorization, fleet reassignment, concurrent admissions, discharge replay and vehicle release.');
  } finally {
    EmergencyRepository.findAvailableAmbulance = findVehicle; EmergencyRepository.findLowestWorkloadParamedic = findParamedic;
    await new Promise<void>(resolve => server.close(() => resolve()));
    const remaining = await prisma.ambulanceDispatch.findMany({ where: { patient: { userId: { in: users } } }, select: { id: true } });
    trips.push(...remaining.map(d => d.id));
    await prisma.eventOutbox.deleteMany({ where: { aggregateId: { in: trips } } });
    await prisma.ambulanceDispatch.deleteMany({ where: { patient: { userId: { in: users } } } });
    await prisma.emergencyEvent.deleteMany({ where: { patient: { userId: { in: users } } } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
    await prisma.ambulance.deleteMany({ where: { id: { in: vehicles } } });
    await prisma.hospital.deleteMany({ where: { id: { in: hospitals } } });
    await prisma.$disconnect();
  }
}
void main().catch(e => { console.error(e.message); process.exitCode = 1; });
