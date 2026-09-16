import { AdminService } from '../admin.service';

// We'll mock the Prisma client
jest.mock('../../../../common/config/database', () => ({
  prisma: {
    caseAssignment: {
      findMany: jest.fn()
    },
    emergencyEvent: {
      findMany: jest.fn()
    }
  }
}));

const { prisma } = require('../../../../common/config/database');

describe('Admin Consistency & Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Clinical Operations - Unassigned Cases', () => {
    it('should map UNASSIGNED to cases without doctors and not resolved', async () => {
      prisma.caseAssignment.findMany.mockResolvedValue([
        { id: '1', doctorId: null, status: 'PENDING' },
        { id: '2', doctorId: null, status: 'ADMIN_ESCALATED' }
      ]);

      const cases = await AdminService.getClinicalCases('UNASSIGNED');
      
      expect(prisma.caseAssignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            doctorId: null,
            status: { not: 'RESOLVED' }
          }
        })
      );
      expect(cases).toHaveLength(2);
    });
  });

  describe('Emergency Center - Active Emergencies', () => {
    it('should properly shape the emergency payload, ignore resolved cases, and calculate SLA breach', async () => {
      const pastSLA = new Date(Date.now() - 10000).toISOString();
      const futureSLA = new Date(Date.now() + 10000).toISOString();

      prisma.emergencyEvent.findMany.mockResolvedValue([
        {
          id: 'em-1',
          source: 'CHAT',
          visit: {
            caseAssignment: { doctorId: 'doc-1', status: 'ACCEPTED', slaDeadline: pastSLA }
          }
        },
        {
          id: 'em-2',
          source: 'DOCTOR',
          visit: {
            caseAssignment: { doctorId: null, status: 'RESOLVED', slaDeadline: pastSLA }
          }
        },
        {
          id: 'em-3',
          source: 'PATIENT_APP',
          visit: {
            caseAssignment: { doctorId: null, status: 'PENDING', slaDeadline: futureSLA }
          }
        }
      ]);

      const emergencies = await AdminService.getEmergencies('active');
      
      // em-2 is resolved, so it should be filtered out
      expect(emergencies).toHaveLength(2);
      
      // em-1 breached SLA
      expect(emergencies[0]).toMatchObject({
        id: 'em-1',
        status: 'ACCEPTED',
        assignedDoctorId: 'doc-1',
        slaBreach: true
      });

      // em-3 has not breached SLA
      expect(emergencies[1]).toMatchObject({
        id: 'em-3',
        status: 'PENDING',
        assignedDoctorId: null,
        slaBreach: false
      });
      
      // Should not erroneously filter by source = 'active'
      expect(prisma.emergencyEvent.findMany).toHaveBeenCalledWith(
        expect.not.objectContaining({
          where: expect.objectContaining({ source: 'active' })
        })
      );
    });
  });
});
