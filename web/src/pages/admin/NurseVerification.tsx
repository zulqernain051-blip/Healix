import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../store/admin';
import { FileText, Check, X, ShieldAlert, Award } from 'lucide-react';

export default function NurseVerification() {
  const {
    pendingNurses, fetchPendingNurses,
    nursesList, fetchAllNurses,
    approveNurse, rejectNurse, revokeNurse,
    isLoading
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'PENDING' | 'VERIFIED'>('PENDING');

  // Modal Control
  const [selectedNurse, setSelectedNurse] = useState<any | null>(null);
  const [modalAction, setModalAction] = useState<'REJECT' | 'REVOKE' | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (activeTab === 'PENDING') {
      fetchPendingNurses().catch(() => {});
    } else {
      fetchAllNurses('VERIFIED').catch(() => {});
    }
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this nurse?')) return;
    try {
      await approveNurse(id);
      alert('Nurse verified successfully');
      fetchPendingNurses().catch(() => {});
    } catch (e: any) {
      alert(e.message || 'Approval failed');
    }
  };

  const handleRejectOpen = (nurse: any) => {
    setSelectedNurse(nurse);
    setModalAction('REJECT');
    setReason('');
  };

  const handleRevokeOpen = (nurse: any) => {
    setSelectedNurse(nurse);
    setModalAction('REVOKE');
    setReason('');
  };

  const handleActionSubmit = async () => {
    if (!selectedNurse || reason.length < 10) return;
    try {
      if (modalAction === 'REJECT') {
        await rejectNurse(selectedNurse.id, reason);
        alert('Nurse application rejected');
        fetchPendingNurses().catch(() => {});
      } else {
        await revokeNurse(selectedNurse.id, reason);
        alert('Nurse credentials revoked');
        fetchAllNurses('VERIFIED').catch(() => {});
      }
      setModalAction(null);
      setSelectedNurse(null);
    } catch (e: any) {
      alert(e.message || 'Action failed');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Nurse Credential Pipeline</h2>
        <p className="page-subtitle">Inspect diplomas, license registries, background reports, and PNC certifications</p>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${activeTab === 'PENDING' ? 'active' : ''}`} onClick={() => setActiveTab('PENDING')}>
          Pending Queue ({pendingNurses.length})
        </button>
        <button className={`tab-btn ${activeTab === 'VERIFIED' ? 'active' : ''}`} onClick={() => setActiveTab('VERIFIED')}>
          Verified Registry
        </button>
      </div>

      {activeTab === 'PENDING' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pendingNurses.map((nurse: any) => (
            <div key={nurse.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{nurse.user.fullName}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Email: {nurse.user.email} | Phone: {nurse.user.phone}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'var(--surface)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px' }}>
                      <strong>PNC Registration:</strong> {nurse.pncNumber}
                    </div>
                    {nurse.experience !== null && (
                      <div style={{ background: 'var(--surface)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px' }}>
                        <strong>Experience:</strong> {nurse.experience} Years
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Submitted Verification Documents</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {(nurse.user.documents || []).map((doc: any) => (
                        <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} />
                          <span>{doc.documentType}</span>
                        </a>
                      ))}
                      {(nurse.user.documents || []).length === 0 && (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No verification documents uploaded.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-danger" onClick={() => handleRejectOpen(nurse)}>
                    <X size={16} />
                    Reject
                  </button>
                  <button className="btn btn-primary" onClick={() => handleApprove(nurse.id)}>
                    <Check size={16} />
                    Verify & Approve
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pendingNurses.length === 0 && (
            <div className="empty-state">
              <CheckCircle2Icon />
              <h3>All caught up!</h3>
              <p>No nurse credential verification requests are currently pending in the operations queue.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nurse Name</th>
                  <th>Email / Phone</th>
                  <th>PNC Registration</th>
                  <th>Approval Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {nursesList.map((nurse: any) => (
                  <tr key={nurse.id}>
                    <td style={{ fontWeight: '600' }}>{nurse.user.fullName}</td>
                    <td>
                      <div>{nurse.user.email}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{nurse.user.phone}</div>
                    </td>
                    <td>{nurse.pncNumber}</td>
                    <td>{nurse.verificationApprovedAt ? new Date(nurse.verificationApprovedAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRevokeOpen(nurse)}>
                        Revoke Credentials
                      </button>
                    </td>
                  </tr>
                ))}
                {nursesList.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>No verified nurses in registry.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalAction && selectedNurse && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">{modalAction === 'REJECT' ? 'Reject Credential Application' : 'Revoke Verified Credentials'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Action target: <strong>{selectedNurse.user.fullName}</strong>.
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
              <button className="btn btn-ghost" onClick={() => { setModalAction(null); setSelectedNurse(null); }}>Cancel</button>
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
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2" style={{ color: 'var(--emerald)' }}>
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
