import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../store/admin';
import { Search, Download, Calendar } from 'lucide-react';

export default function AuditLogs() {
  const { auditLogsData, fetchAuditLogs } = useAdminStore();
  const [adminId, setAdminId] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAuditLogs({ adminId, action, entityType, fromDate, toDate, page, limit: 25 }).catch(() => {});
  }, [adminId, action, entityType, fromDate, toDate, page]);

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('healix_web_token');
      const res = await fetch('/api/v1/admin/audit-logs/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ adminId, action, entityType, fromDate, toDate }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      alert(e.message || 'Export failed');
    }
  };

  const lData = auditLogsData || { logs: [], total: 0, pages: 1 };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="page-title">Compliance Audit Trail</h2>
          <p className="page-subtitle">Inspect append-only record of administrator actions, credential verification, and system configuration edits</p>
        </div>
        <button className="btn btn-primary" onClick={handleExport}>
          <Download size={16} />
          Export to CSV
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box" style={{ maxWidth: '250px' }}>
          <Search />
          <input
            type="text"
            className="form-input"
            placeholder="Filter by action name..."
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
          />
        </div>

        <select className="form-input" style={{ width: '180px' }} value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1); }}>
          <option value="">All Entities</option>
          <option value="USER">User Account</option>
          <option value="NURSE">Nurse Profile</option>
          <option value="DOCTOR">Doctor Profile</option>
          <option value="OFFER">Marketplace Offer</option>
          <option value="CONFIG">System Config</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="date" className="form-input" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input type="date" className="form-input" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Admin Actor</th>
                <th>Action</th>
                <th>Target User</th>
                <th>Entity Info</th>
                <th>Reason / Justification</th>
              </tr>
            </thead>
            <tbody>
              {lData.logs.map((log: any) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{log.admin?.fullName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.admin?.email}</div>
                  </td>
                  <td>
                    <span className="badge badge-purple" style={{ fontSize: '11px' }}>{log.action}</span>
                  </td>
                  <td>
                    {log.targetUser ? (
                      <>
                        <div style={{ fontWeight: '500' }}>{log.targetUser.fullName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.targetUser.role}</div>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>
                    )}
                  </td>
                  <td>
                    {log.entityType ? (
                      <>
                        <span className="badge badge-teal" style={{ fontSize: '10px' }}>{log.entityType}</span>
                        {log.entityId && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>ID: {log.entityId.slice(0, 8)}</div>}
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '13px' }}>{log.reason || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No reason recorded</span>}</span>
                  </td>
                </tr>
              ))}
              {lData.logs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>No audit logs recorded matching search criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {lData.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span style={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>Page {page} of {lData.pages}</span>
            <button className="btn btn-ghost btn-sm" disabled={page === lData.pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
