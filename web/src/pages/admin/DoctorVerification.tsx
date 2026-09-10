import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../store/admin';
import { FileText, Check, X, ShieldAlert, Award } from 'lucide-react';

export default function DoctorVerification() {
  const {
    pendingDoctors, fetchPendingDoctors,
    doctorsList, fetchAllDoctors,
    approveDoctor, rejectDoctor, revokeDoctor,
    isLoading
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'PENDING' | 'VERIFIED'>('PENDING');

  // Modal Control
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [modalAction, setModalAction] = useState<'REJECT' | 'REVOKE' | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (activeTab === 'PENDING') {
      fetchPendingDoctors().catch(() => {});
    } else {
      fetchAllDoctors('VERIFIED').catch(() => {});
    }
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this doctor?')) return;
    try {
      await approveDoctor(id);
      alert('Doctor verified successfully');
      fetchPendingDoctors().catch(() => {});
    } catch (e: any) {
      alert(e.message || 'Approval failed');
    }
  };

  const handleRejectOpen = (doctor: any) => {
    setSelectedDoctor(doctor);
    setModalAction('REJECT');
    setReason('');
  };

  const handleRevokeOpen = (doctor: any) => {
    setSelectedDoctor(doctor);
    setModalAction('REVOKE');
    setReason('');
  };

  const handleActionSubmit = async () => {
    if (!selectedDoctor || reason.length < 10) return;
    try {
      if (modalAction === 'REJECT') {
        await rejectDoctor(selectedDoctor.id, reason);
        alert('Doctor application rejected');
        fetchPendingDoctors().catch(() => {});
      } else {
        await revokeDoctor(selectedDoctor.id, reason);
        alert('Doctor credentials revoked');
        fetchAllDoctors('VERIFIED').catch(() => {});
      }
      setModalAction(null);
      setSelectedDoctor(null);
    } catch (e: any) {
      alert(e.message || 'Action failed');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Doctor Credential Pipeline</h2>
        <p className="page-subtitle">Inspect medical licenses, PMDC certifications, and background verification records</p>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${activeTab === 'PENDING' ? 'active' : ''}`} onClick={() => setActiveTab('PENDING')}>
          Pending Queue ({pendingDoctors.length})
        </button>
        <button className={`tab-btn ${activeTab === 'VERIFIED' ? 'active' : ''}`} onClick={() => setActiveTab('VERIFIED')}>
          Verified Registry
        </button>
      </div>

      {activeTab === 'PENDING' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pendingDoctors.map((doctor: any) => (
            <div key={doctor.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{doctor.user.fullName}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Email: {doctor.user.email} | Phone: {doctor.user.phone}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'var(--surface)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px' }}>
                      <strong>PMDC Number:</strong> {doctor.pmdcNumber}
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Submitted Verification Documents</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {(doctor.user.documents || []).map((doc: any) => (
                        <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} />
                          <span>{doc.documentType}</span>
                        </a>
                      ))}
                      {(doctor.user.documents || []).length === 0 && (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No verification documents uploaded.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-danger" onClick={() => handleRejectOpen(doctor)}>
                    <X size={16} />
                    Reject
                  </button>
                  <button className="btn btn-primary" onClick={() => handleApprove(doctor.id)}>
                    <Check size={16} />
                    Verify & Approve
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pendingDoctors.length === 0 && (
            <div className="empty-state">
              <CheckCircle2Icon />
              <h3>All caught up!</h3>
              <p>No doctor credential verification requests are currently pending in the operations queue.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Email / Phone</th>
                  <th>PMDC Registration</th>
                  <th>Approval Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctorsList.map((doctor: any) => (
                  <tr key={doctor.id}>
                    <td style={{ fontWeight: '600' }}>{doctor.user.fullName}</td>
                    <td>
                      <div>{doctor.user.email}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{doctor.user.phone}</div>
                    </td>
                    <td>{doctor.pmdcNumber}</td>
                    <td>{doctor.verificationApprovedAt ? new Date(doctor.verificationApprovedAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRevokeOpen(doctor)}>
                        Revoke Credentials
                      </button>
                    </td>
                  </tr>
                ))}
                {doctorsList.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>No verified doctors in registry.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalAction && selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">{modalAction === 'REJECT' ? 'Reject Credential Application' : 'Revoke Verified Credentials'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Action target: <strong>{selectedDoctor.user.fullName}</strong>.
            </p>
            <div className="form-group">
              <label className="form-label">Justification / Reason (min 10 chars)</label>
              <textarea
                className="form-input"
                style={{ height: '100px', resize: 'none' }}
                placeholder="Log the reason for auditing/notifications..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setModalAction(null); setSelectedDoctor(null); }}>Cancel</button>
              <button className="btn btn-danger" disabled={reason.length < 10} onClick={handleActionSubmit}>
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper icon component
function CheckCircle2Icon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2" style={{ color: 'var(--blue)' }}>
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
