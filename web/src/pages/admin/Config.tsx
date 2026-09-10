import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../store/admin';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function Config() {
  const { configs, fetchConfigs, updateConfig, isLoading } = useAdminStore();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchConfigs().catch(() => {});
  }, []);

  const handleEditOpen = (cfg: any) => {
    setEditingKey(cfg.key);
    setNewValue(cfg.value);
    setReason('');
  };

  const handleSave = async () => {
    if (!editingKey || !newValue) return;
    try {
      await updateConfig(editingKey, newValue, reason);
      alert('Config updated successfully');
      setEditingKey(null);
    } catch (e: any) {
      alert(e.message || 'Update failed');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Platform Configuration</h2>
        <p className="page-subtitle">Configure fees, SLA timers, risk engine bounds, and toggle experimental feature flags</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        <div className="card">
          <h3 className="card-title">Global Settings Registry</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Configuration Key</th>
                  <th>Current Value</th>
                  <th>Last Updated</th>
                  <th>Change Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {configs.map((cfg: any) => (
                  <tr key={cfg.key}>
                    <td style={{ fontWeight: '700', fontSize: '13px' }}>{cfg.key}</td>
                    <td>
                      <span className="badge badge-teal" style={{ fontSize: '13px', padding: '4px 10px' }}>
                        {cfg.value}
                      </span>
                    </td>
                    <td>{new Date(cfg.updatedAt).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {cfg.changeReason || <span style={{ fontStyle: 'italic' }}>None specified</span>}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEditOpen(cfg)}>
                        Edit Key
                      </button>
                    </td>
                  </tr>
                ))}
                {configs.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>No configurations seeded. Update database config.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Editing Modal */}
      {editingKey && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">Modify Platform Property</h3>
            <div className="form-group">
              <label className="form-label">Key Name</label>
              <input type="text" className="form-input" value={editingKey} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">New Value</label>
              <input
                type="text"
                className="form-input"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Enter value..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Change Justification / Reason</label>
              <textarea
                className="form-input"
                style={{ height: '70px', resize: 'none' }}
                placeholder="Operational audit justification..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setEditingKey(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                <Save size={15} />
                Save Config
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
