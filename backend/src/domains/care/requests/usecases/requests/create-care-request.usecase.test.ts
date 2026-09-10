import { CreateCareRequestUseCase } from './create-care-request.usecase';
import { CreateCareRequestDto } from '../../dto/create-care-request.dto';
import { PatientRepository } from '../../../../identity/patient/patient.repository';
import { CareRequestRepository } from '../../repository/care-request.repository';

// Mock dependencies
jest.mock('../../../../identity/patient/patient.repository');
jest.mock('../../repository/care-request.repository');

describe('CreateCareRequestUseCase', () => {
  const mockUserId = 'user-123';
  const mockPatientId = 'patient-456';
  const fallbackLocation = {
    address: 'Patient Home',
    latitude: 31.0,
    longitude: 74.0
  };

  const baseRequest: CreateCareRequestDto = {
    patientId: '',
    type: 'NURSE_VISIT',
    scheduleType: 'ONE_TIME',
    durationMinutes: 60,
    preferredDate: new Date('2026-08-20T10:00:00.000Z'),
    preferredTimeWindow: 'MORNING'
  };

  let useCase: CreateCareRequestUseCase;

  beforeEach(() => {
    useCase = new CreateCareRequestUseCase();
    jest.clearAllMocks();
    
    (PatientRepository.findPatientByUserId as jest.Mock).mockResolvedValue({
      id: mockPatientId,
      address: fallbackLocation.address,
      latitude: fallbackLocation.latitude,
      longitude: fallbackLocation.longitude
    });

    (CareRequestRepository.createCareRequest as jest.Mock).mockImplementation(async (data, priority, _loc) => ({
      id: 'req-123',
      ...data,
      priority,
      status: 'OPEN'
    }));
  });

  describe('One-Time Requests', () => {
    it('should successfully create a valid one-time request with a flexible time window', async () => {
      const result = await useCase.execute(mockUserId, { ...baseRequest });
      expect(result.status).toBe('OPEN');
      expect(result.priority).toBe('ROUTINE');
      expect(CareRequestRepository.createCareRequest).toHaveBeenCalled();
    });

    it('should successfully create a valid one-time request with exact start time', async () => {
      const result = await useCase.execute(mockUserId, {
        ...baseRequest,
        preferredTimeWindow: undefined,
        preferredStartTime: '10:00'
      });
      expect(result.preferredStartTime).toBe('10:00');
    });

    it('should throw an error for invalid duration', async () => {
      await expect(useCase.execute(mockUserId, { ...baseRequest, durationMinutes: -10 }))
        .rejects.toThrow('Invalid duration');
    });
  });

  describe('Recurring Requests', () => {
    it('should successfully create a valid recurring request', async () => {
      const recurringReq: CreateCareRequestDto = {
        ...baseRequest,
        scheduleType: 'RECURRING',
        preferredTimeWindow: 'AFTERNOON',
        recurring: {
          startDate: new Date('2026-08-20T10:00:00.000Z'),
          frequency: 'DAILY',
          occurrencesLimit: 5
        }
      };

      const result = await useCase.execute(mockUserId, recurringReq);
      expect(result.scheduleType).toBe('RECURRING');
      expect((result as any).recurring?.frequency).toBe('DAILY');
    });
  });

  describe('Location & Priority', () => {
    it('should use patient fallback location if custom location is not provided', async () => {
      await useCase.execute(mockUserId, { ...baseRequest });
      expect(CareRequestRepository.createCareRequest).toHaveBeenCalledWith(
        expect.anything(),
        'ROUTINE',
        fallbackLocation
      );
    });

    it('should prioritize ROUTINE and not allow patient to submit priority', async () => {
      const maliciousRequest = { ...baseRequest, priority: 'URGENT' } as any;
      const result = await useCase.execute(mockUserId, maliciousRequest);
      expect(result.priority).toBe('ROUTINE'); // Forcefully overriden by usecase
    });
  });

  describe('Authorization', () => {
    it('should throw an error if patient is not found', async () => {
      (PatientRepository.findPatientByUserId as jest.Mock).mockResolvedValue(null);
      await expect(useCase.execute('invalid-user', { ...baseRequest }))
        .rejects.toThrow('Patient profile not found');
    });
  });

  describe('Duplicate Protection', () => {
    it('should reject a duplicate active request', async () => {
      (CareRequestRepository.findSimilarActiveRequest as jest.Mock).mockResolvedValue({
        id: 'existing-req',
        createdAt: new Date() // recent
      });

      await expect(useCase.execute(mockUserId, { ...baseRequest }))
        .rejects.toThrow('A similar active care request already exists.');
    });

    it('should accept a legitimately different request', async () => {
      (CareRequestRepository.findSimilarActiveRequest as jest.Mock).mockResolvedValue(null);

      const result = await useCase.execute(mockUserId, { ...baseRequest });
      expect(result.status).toBe('OPEN');
    });

    it('should allow creation if similar request is very old (e.g., cancelled or ignored)', async () => {
      // While findSimilarActiveRequest filters by OPEN, if one is somehow stuck OPEN but very old, the 1-hour threshold bypasses it.
      (CareRequestRepository.findSimilarActiveRequest as jest.Mock).mockResolvedValue({
        id: 'old-req',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      });

      const result = await useCase.execute(mockUserId, { ...baseRequest });
      expect(result.status).toBe('OPEN');
    });
  });
});
