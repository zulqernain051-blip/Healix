import React, { useState, useEffect } from 'react';
import { useDoctorStore } from '../../store/doctor';
import { Calendar, Plus, Save, Clock } from 'lucide-react';

export default function HomeVisits() {
  const { homeVisits, fetchHomeVisits, scheduleHomeVisit } = useDoctorStore();
  const [patientId, setPatientId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [purpose, setPurpose] = useState('');
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchHomeVisits().catch(() => {});
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !scheduledAt || !purpose) return;
    try {
      await scheduleHomeVisit({ patientId, scheduledAt, purpose });
      alert('Home visit scheduled successfully');
      setOpenModal(false);
      setPatientId('');
      setScheduledAt('');
      setPurpose('');
    } catch (e: any) {
      alert(e.message || 'Action failed');
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Doctor Home Visits</h2>
          <p className="page-subtitle">Schedule, track, and document home care visits for patients under active plans</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpenModal(true)}>
          <Plus size={16} />
          Schedule Visit
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Scheduled At</th>
                <th>Purpose</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {homeVisits.map((visit: any) => (
                <tr key={visit.id}>
                  <td style={{ fontWeight: '600' }}>Patient: {visit.patientId.slice(0, 8)}...</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{new Date(visit.scheduledAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td>{visit.purpose}</td>
                  <td>
                    <span className={`badge ${
                      visit.status === 'COMPLETED' ? 'badge-green' :
                      visit.status === 'SCHEDULED' ? 'badge-amber' :
                      'badge-red'
                    }`}>
                      {visit.status}
                    </span>
                  </td>
                </tr>
              ))}
              {homeVisits.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>No home visits scheduled yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">Schedule New Doctor Home Visit</h3>
            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Patient ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter patient ID uuid..."
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Purpose of Visit</label>
                <textarea
                  className="form-input"
                  style={{ height: '70px', resize: 'none' }}
                  placeholder="e.g. Post-stroke follow-up, BP check..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setOpenModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Calendar size={15} />
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
