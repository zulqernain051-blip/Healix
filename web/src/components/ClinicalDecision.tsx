import { useState } from 'react';
import { api } from '../store/auth';

export default function ClinicalDecision({ caseId, patient, onSaved }: { caseId?: string; patient: any; onSaved: () => void }) {
  const [decision, setDecision] = useState(caseId ? 'CONTINUE_MONITORING' : 'REQUEST_EMERGENCY');
  const [justification, setJustification] = useState('');
  const [latitude, setLatitude] = useState(patient?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(patient?.longitude?.toString() || '');
  const [tier, setTier] = useState('HIGH');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [hospitalId, setHospitalId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [success, setSuccess] = useState('');
  const search = async () => { setBusy(true); setError(''); setHospitalId(''); try { if (!latitude.trim() || !longitude.trim()) throw new Error('Enter the patient location'); const params = new URLSearchParams({ patientId: patient.id, latitude, longitude, affordabilityTier: tier }); const found = await api('GET', `/hospitals/recommend?${params}`); setHospitals(found); if (!found.length) setError('No hospitals match this search. Change the budget or contact admin.'); } catch (e: any) { setError(e.message); } finally { setBusy(false); } };
  const submit = async () => { setBusy(true); setError(''); try { if (caseId) await api('POST', `/cases/${caseId}/decision`, { decision, justification: justification.trim(), hospitalId: hospitalId || undefined, autoDispatch: decision === 'REQUEST_EMERGENCY' }); else await api('POST', '/dispatch', { patientId: patient.id, hospitalId, justification: justification.trim() }); setConfirmation(false); setSuccess(decision === 'REQUEST_EMERGENCY' ? 'Ambulance dispatch created. Open Dispatches & Admissions from the sidebar to track it.' : 'Clinical decision recorded.'); onSaved(); } catch (e: any) { setError(e.message); } finally { setBusy(false); } };
  return <div>
    <label>Clinical action<select className="form-input" value={decision} disabled={!caseId || busy} onChange={e => { setDecision(e.target.value); setSuccess(''); }}><option value="CONTINUE_MONITORING">Continue Monitoring</option><option value="RECOMMEND_ADMISSION">Recommend Hospital Admission</option><option value="REQUEST_EMERGENCY">Dispatch Ambulance</option></select></label>
    <label>Clinical justification<textarea className="form-input" value={justification} onChange={e => setJustification(e.target.value)} minLength={10} /></label>
    {decision === 'REQUEST_EMERGENCY' && <><h4>Destination Hospital</h4><label>Patient Latitude<input className="form-input" type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)} /></label><label>Patient Longitude<input className="form-input" type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)} /></label><label>Budget<select className="form-input" value={tier} onChange={e => setTier(e.target.value)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">Any</option></select></label><button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void search()}>Find Hospitals</button>{hospitals.map(h => <label key={h.id} style={{ display: 'block', margin: '12px 0' }}><input type="radio" name="hospital" checked={hospitalId === h.id} disabled={h.capacityStatus === 'FULL' || busy} onChange={() => setHospitalId(h.id)} /> {h.name} · {h.distance.toFixed(1)} km · {h.capacityStatus} · {h.isCharity ? 'Charity' : h.affordabilityTier}<br />{h.staleCapacityWarning ? 'Capacity update is stale — confirm availability.' : 'Capacity updated recently.'}</label>)}</>}
    {error && <p role="alert" style={{ color: 'var(--red)' }}>{error}</p>}{success && <p role="status">{success}</p>}
    <button type="button" className="btn btn-primary" disabled={busy || !!success || justification.trim().length < 10 || (decision === 'REQUEST_EMERGENCY' && !hospitalId)} onClick={() => setConfirmation(true)}>Review and Confirm</button>
    {confirmation && <div className="modal-overlay"><div className="modal" role="dialog" aria-modal="true"><h3>Confirm Clinical Decision</h3><p>{decision === 'REQUEST_EMERGENCY' ? `Request a Healix ambulance to ${hospitals.find(h => h.id === hospitalId)?.name}. ${caseId ? 'The case closes after successful dispatch.' : 'The assigned emergency remains tracked until the trip is completed.'}` : 'Record this clinical decision.'}</p><p>{justification}</p>{error && <p role="alert">{error}</p>}<button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setConfirmation(false)}>Cancel</button><button type="button" className="btn btn-primary" disabled={busy} onClick={() => void submit()}>{busy ? 'Saving…' : 'Confirm'}</button></div></div>}
  </div>;
}
