import { PrismaClient } from '@prisma/client';
import { CreateCareRequestDto } from '../dto/create-care-request.dto';
import { OutboxRepository } from '../../../../common/events/outbox.repository';
import { EVENTS } from '../../../../common/events/app-event-bus';

const prisma = new PrismaClient();

export class CareRequestRepository {
  public static async findCareRequestById(id: string) {
    return prisma.careRequest.findUnique({
      where: { id },
      include: { patient: true }
    });
  }
  public static async createCareRequest(data: CreateCareRequestDto, priority: string, fallbackLocation: { address: string; latitude: number; longitude: number }) {
    const address = data.location?.address || fallbackLocation.address;
    const latitude = data.location?.latitude || fallbackLocation.latitude;
    const longitude = data.location?.longitude || fallbackLocation.longitude;

    if (data.scheduleType === 'RECURRING' && data.recurring) {
      // Create pattern and request in a Care-domain transaction
      return await prisma.$transaction(async (tx) => {
        const pattern = await tx.recurringPattern.create({
          data: {
            patientId: data.patientId,
            frequency: data.recurring!.frequency,
            startDate: data.recurring!.startDate,
            endDate: new Date(data.recurring!.startDate.getTime() + (data.recurring!.occurrencesLimit * 7 * 24 * 60 * 60 * 1000)), // Approximate end date to satisfy legacy schema
            occurrencesRemaining: data.recurring!.occurrencesLimit,
          }
        });

        const request = await tx.careRequest.create({
          data: {
            patientId: data.patientId,
            type: data.type,
            status: 'OPEN',
            scheduleType: data.scheduleType,
            preferredDate: data.preferredDate,
            preferredStartTime: data.preferredStartTime,
            preferredTimeWindow: data.preferredTimeWindow,
            durationMinutes: data.durationMinutes,
            address,
            latitude,
            longitude,
            priority,
            notes: data.notes,
            requirements: data.requirements,
            recurringPatternId: pattern.id
          }
        });

        await OutboxRepository.createEvent(tx, {
          eventType: EVENTS.CARE_REQUEST_CREATED,
          aggregateType: 'CARE_REQUEST',
          aggregateId: request.id,
          payload: { careRequestId: request.id }
        });

        return request;
      });
    }

    // ONE_TIME request
    return await prisma.$transaction(async (tx) => {
      const request = await tx.careRequest.create({
        data: {
          patientId: data.patientId,
          type: data.type,
          status: 'OPEN',
          scheduleType: data.scheduleType,
          preferredDate: data.preferredDate,
          preferredStartTime: data.preferredStartTime,
          preferredTimeWindow: data.preferredTimeWindow,
          durationMinutes: data.durationMinutes,
          address,
          latitude,
          longitude,
          priority,
          notes: data.notes,
          requirements: data.requirements
        }
      });

      await OutboxRepository.createEvent(tx, {
        eventType: EVENTS.CARE_REQUEST_CREATED,
        aggregateType: 'CARE_REQUEST',
        aggregateId: request.id,
        payload: { careRequestId: request.id }
      });

      return request;
    });
  }

  public static async findSimilarActiveRequest(data: CreateCareRequestDto, fallbackLocation: { address: string; latitude: number; longitude: number }) {
    const address = data.location?.address || fallbackLocation.address;

    return await prisma.careRequest.findFirst({
      where: {
        patientId: data.patientId,
        type: data.type,
        status: 'OPEN', // Only consider actively open/pending requests
        scheduleType: data.scheduleType,
        preferredDate: data.preferredDate || null,
        preferredStartTime: data.preferredStartTime || null,
        preferredTimeWindow: data.preferredTimeWindow || null,
        durationMinutes: data.durationMinutes,
        address: address
      }
    });
  }
}
