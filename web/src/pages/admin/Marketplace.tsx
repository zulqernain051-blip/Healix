import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../store/admin';
import { Layers, ShieldAlert, Trash2 } from 'lucide-react';

export default function Marketplace() {
  const { offers, fetchOffers, removeOffer, isLoading } = useAdminStore();
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [reason, setReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOffers(statusFilter).catch(() => {});
  }, [statusFilter]);

  const handleRemoveOpen = (offer: any) => {
    setSelectedOffer(offer);
    setReason('');
  };

  const handleRemoveSubmit = async () => {
    if (!selectedOffer || reason.length < 5) return;
    try {
      await removeOffer(selectedOffer.id, reason);
      alert('Offer moderated and removed successfully');
      setSelectedOffer(null);
      fetchOffers(statusFilter).catch(() => {});
    } catch (e: any) {
      alert(e.message || 'Action failed');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Marketplace Monitor & Moderation</h2>
        <p className="page-subtitle">Oversee active competitive nurse bids and remove non-compliant offers from listings</p>
      </div>

      <div className="toolbar">
        <select className="form-input" style={{ width: '200px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Offer Statuses</option>
          <option value="PENDING">Pending (Active)</option>
          <option value="ACCEPTED">Accepted by Patient</option>
          <option value="REJECTED">Rejected</option>
          <option value="EXPIRED">Expired</option>
          <option value="REMOVED">Removed by Admin</option>
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nurse</th>
                <th>Patient Listing</th>
                <th>Price Term</th>
                <th>Message</th>
                <th>Status</th>
                <th>Submitted At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer: any) => (
                <tr key={offer.id}>
                  <td style={{ fontWeight: '600' }}>{offer.nurse.user.fullName}</td>
                  <td>
                    <div>Listing ID: {offer.listing.id.slice(0, 8)}...</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Patient: {offer.listing.careRequest.patient.user.fullName}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--teal-light)' }}>PKR {offer.price}</div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{offer.priceType}</div>
                  </td>
                  <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={offer.message}>
                    {offer.message || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>}
                  </td>
                  <td>
                    <span className={`badge ${
                      offer.status === 'ACCEPTED' ? 'badge-green' :
                      offer.status === 'PENDING' ? 'badge-amber' :
                      offer.status === 'REJECTED' ? 'badge-gray' :
                      offer.status === 'EXPIRED' ? 'badge-purple' :
                      'badge-red'
                    }`}>
                      {offer.status}
                    </span>
                  </td>
                  <td>{new Date(offer.createdAt).toLocaleString()}</td>
                  <td>
                    {offer.status === 'PENDING' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleRemoveOpen(offer)}>
                        <Trash2 size={13} />
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No marketplace offers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Modal */}
      {selectedOffer && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title" style={{ color: 'var(--red)' }}>Moderate Marketplace Offer</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              You are removing the bid submitted by <strong>{selectedOffer.nurse.user.fullName}</strong>.
            </p>
            <div className="form-group">
              <label className="form-label">Moderation Reason (min 5 chars)</label>
              <textarea
                className="form-input"
                style={{ height: '85px', resize: 'none' }}
                placeholder="Log reason (e.g., spam, pricing policy violation)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setSelectedOffer(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={reason.length < 5} onClick={handleRemoveSubmit}>
                Remove Offer from Marketplace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
