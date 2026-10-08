import { useCallback, useEffect, useState } from 'react';
import { api } from '../../store/auth';

const transitions: Record<string, string[]> = { REQUESTED: ['SCHEDULED', 'CANCELLED'], SCHEDULED: ['EN_ROUTE', 'CANCELLED'], EN_ROUTE: ['ARRIVED', 'CANCELLED'], ARRIVED: ['COMPLETED', 'CANCELLED'] };
export default function HomeVisits() {
  const [visits, setVisits] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [patientId, setPatientId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [update, setUpdate] = useState<{ id: string; status: string } | null>(null);
  const [findings, setFindings] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => { try { const [v, p] = await Promise.all([api('GET', '/doctors/home-visits'), api('GET', '/doctors/home-visits/patients')]); setVisits(v); setPatients(p); setError(''); } catch (e: any) { setError(e.message); } finally { setLoading(false); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const run = async (task: () => Promise<unknown>) => { setBusy(true); setError(''); try { await task(); setOpenModal(false); setUpdate(null); await refresh(); } catch (e: any) { setError(e.message); } finally { setBusy(false); } };
  return <div className="page"><div className="page-header"><h2 className="page-title">Doctor Home Visits</h2><p>Schedule visits for patients from your cases and record the outcome.</p><button className="btn btn-primary" disabled={busy || !patients.length} onClick={() => setOpenModal(true)}>Schedule Visit</button><button className="btn btn-ghost" onClick={() => void refresh()}>Refresh</button></div>
    {error && <p role="alert" style={{ color: 'var(--red)' }}>{error}</p>}
    {loading ? <p>Loading visits...</p> : <div className="card"><div className="table-container"><table><thead><tr><th>Patient</th><th>Scheduled</th><th>Status</th><th>Clinical notes</th><th>Actions</th></tr></thead><tbody>{visits.map(v => <tr key={v.id}><td>{v.patients?.user?.fullName || 'Patient'}</td><td>{new Date(v.scheduledAt).toLocaleString()}</td><td>{v.status.replaceAll('_', ' ')}</td><td>{v.findings || 'No findings recorded'}{v.outcomeNotes && <p>{v.outcomeNotes}</p>}</td><td>{transitions[v.status]?.map(status => <button key={status} className="btn btn-ghost" disabled={busy} onClick={() => { setFindings(v.findings || ''); setNotes(v.outcomeNotes || ''); setUpdate({ id: v.id, status }); }}>{status.replaceAll('_', ' ')}</button>)}</td></tr>)}{!visits.length && !error && <tr><td colSpan={5}>No visits scheduled.</td></tr>}</tbody></table></div>{!patients.length && !error && <p>Patients become available for scheduling after a case is assigned to you.</p>}</div>}
    {openModal && <div className="modal-overlay"><form className="modal" onSubmit={e => { e.preventDefault(); void run(() => api('POST', '/doctors/home-visits', { patientId, scheduledAt: new Date(scheduledAt).toISOString() })); }}><h3>Schedule Doctor Visit</h3><label className="form-group">Patient<select className="form-input" required value={patientId} onChange={e => setPatientId(e.target.value)}><option value="">Select your patient</option>{patients.map(p => <option key={p.id} value={p.id}>{p.user.fullName}</option>)}</select></label><label className="form-group">Date & time<input className="form-input" type="datetime-local" required value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} /></label>{error && <p role="alert">{error}</p>}<button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setOpenModal(false)}>Cancel</button><button className="btn btn-primary" disabled={busy}>Schedule</button></form></div>}
    {update && <div className="modal-overlay"><form className="modal" onSubmit={e => { e.preventDefault(); void run(() => api('PUT', `/doctors/home-visits/${update.id}`, { status: update.status, findings, outcomeNotes: notes })); }}><h3>Mark visit {update.status.replaceAll('_', ' ')}</h3><label>Clinical findings<textarea className="form-input" required={update.status === 'COMPLETED'} value={findings} onChange={e => setFindings(e.target.value)} /></label><label>Outcome notes<textarea className="form-input" value={notes} onChange={e => setNotes(e.target.value)} /></label>{error && <p role="alert">{error}</p>}<button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setUpdate(null)}>Cancel</button><button className="btn btn-primary" disabled={busy}>Confirm</button></form></div>}
  </div>;
}
