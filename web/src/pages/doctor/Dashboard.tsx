import React, { useState, useEffect } from 'react';
import { useDoctorStore } from '../../store/doctor';
import { AlertCircle, Clock, ShieldAlert } from 'lucide-react';

export default function Dashboard({ onSelectCase }: { onSelectCase: (caseId: string) => void }) {
  const { queue, highRiskQueue, fetchQueue, fetchHighRiskQueue, acceptCase, isLoading } = useDoctorStore();
  const [filter, setFilter] = useState<'ALL' | 'HIGH'>('ALL');

  useEffect(() => {
    if (filter === 'ALL') {
      fetchQueue().catch(() => {});
    } else {
      fetchHighRiskQueue().catch(() => {});
    }
  }, [filter]);

  const activeQueue = filter === 'ALL' ? queue : highRiskQueue;

  const handleAccept = async (caseId: string) => {
    if (!window.confirm('Accept this clinical case escalation?')) return;
    try {
      await acceptCase(caseId);
      alert('Case accepted successfully');
      if (filter === 'ALL') fetchQueue().catch(() => {});
      else fetchHighRiskQueue().catch(() => {});
    } catch (e: any) {
      alert(e.message || 'Action failed');
    }
  };

  const getSlaClass = (remainingMinutes?: number) => {
    if (remainingMinutes === undefined) return '';
    if (remainingMinutes <= 5) return 'sla-critical';
    return '';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Clinical Escalation Queue</h2>
        <p className="page-subtitle">Inspect patient telemetry, evaluate abnormal vitals, and approve diagnoses/careplans</p>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>
          Active Cases Queue ({queue.length})
        </button>
        <button className={`tab-btn ${filter === 'HIGH' ? 'active' : ''}`} onClick={() => setFilter('HIGH')}>
          High-Risk Alerts Only ({highRiskQueue.length})
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Escalation Risk</th>
                <th>SLA Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeQueue.map((item: any) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{item.visit?.request?.patient?.user?.fullName || 'Patient'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {item.visit?.request?.patientId.slice(0, 8)}...</div>
                  </td>
                  <td>
                    <span className={`badge ${item.riskTier === 'HIGH' ? 'badge-red' : 'badge-amber'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {item.riskTier === 'HIGH' && <ShieldAlert size={12} />}
                      {item.riskTier}
                    </span>
                  </td>
                  <td>
                    <div className={getSlaClass(item.remainingMinutes)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} />
                      <span>{item.remainingMinutes !== undefined ? `${item.remainingMinutes} Mins Left` : new Date(item.slaDeadline).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.status === 'ACCEPTED' ? 'badge-green' : 'badge-amber'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {item.status === 'PENDING' ? (
                        <button className="btn btn-primary btn-sm" onClick={() => handleAccept(item.id)}>
                          Accept Case
                        </button>
                      ) : (
                        <button className="btn btn-success btn-sm" onClick={() => onSelectCase(item.id)}>
                          Review & Action
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {activeQueue.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={32} style={{ color: 'var(--text-muted)' }} />
                      <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Clinical queue is clear</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No home visits or patient assessments currently require doctor escalation.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
