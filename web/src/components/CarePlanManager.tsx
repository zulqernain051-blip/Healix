import { useEffect, useState } from 'react';
import { api, useAuthStore } from '../store/auth';
export default function CarePlanManager({ patientId, refreshKey = 0 }: { patientId: string; refreshKey?: number }) {
 const user = useAuthStore(state => state.user);
 const [plans, setPlans] = useState<any[]>([]), [record, setRecord] = useState<any>(null), [draft, setDraft] = useState<any>(null);
 const [reason, setReason] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false), [metrics, setMetrics] = useState<any>(null);
 const load = async () => { setError(''); try { const [items, adherence] = await Promise.all([api('GET', `/patients/${patientId}/care-plans`), api('GET', `/patients/${patientId}/compliance`)]); setPlans(items); setMetrics(adherence); } catch(e:any) { setError(e.message); } };
 useEffect(() => { setRecord(null); setDraft(null); void load(); }, [patientId, refreshKey]);
 const open = async (id: string) => { setBusy(true); setError(''); try { setRecord(await api('GET', `/care-plans/${id}/history`)); setDraft(null); } catch(e:any) { setError(e.message); } finally { setBusy(false); } };
 const save = async () => { setBusy(true); setError(''); try {
  const milestones = draft.milestones.map((item:any) => { const target = new Date(`${item.targetDate}T00:00:00`); if (!Number.isFinite(target.getTime())) throw new Error('Choose a valid target date'); return { id: item.id, title: item.title, targetDate: target.toISOString() }; });
  await api('PUT', `/care-plans/${record.current.id}`, { version: draft.version, reason, title: draft.title, description: draft.description, milestones });
  setRecord(await api('GET', `/care-plans/${record.current.id}/history`)); setDraft(null); await load();
 } catch(e:any) { setError(e.message); } finally { setBusy(false); } };
 const updateMilestone = (index:number, values:any) => setDraft((previous:any) => ({ ...previous, milestones: previous.milestones.map((item:any, i:number) => i === index ? { ...item, ...values } : item) }));
 return <section className="card"><h3 className="card-title">Care plans, revisions and adherence</h3>
  {metrics && <p>Last 30 days: {metrics.completedVisits}/{metrics.dueVisits} due visits completed; {metrics.takenDoses}/{metrics.dueDoses} scheduled doses recorded taken. {metrics.dueDoses === 0 ? 'No due scheduled doses; medication adherence is unmeasured.' : `Dose adherence ${metrics.medicationCompliance}%. Within two hours: ${metrics.medicationTimingCompliance}% (informational timing measure).`} Visit trend: {metrics.trend.replaceAll('_',' ')}.</p>}
  {error && <p role="alert" style={{ color: 'var(--red)' }}>{error}</p>}
  <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => void load()}>Refresh plans</button>
  {!plans.length && <p>No care plans recorded.</p>}{plans.map(plan => <div key={plan.id}><button className="btn btn-ghost" type="button" disabled={busy} onClick={() => void open(plan.id)}>{plan.title} · Version {plan.version} · {Math.round(plan.progress)}%</button></div>)}
  {record && <div><h4>{record.current.title} · Version {record.current.version}</h4><p>{record.current.description}</p><ul>{record.current.milestones.map((item:any) => <li key={item.id}>{item.completed ? 'Completed' : 'Pending'}: {item.title} · {new Date(item.targetDate).toLocaleDateString()}</li>)}</ul>
   {record.current.doctorId === (user?.doctorId || user?.doctor?.id) && !draft && <button className="btn btn-primary" type="button" onClick={() => { setReason(''); setDraft({ ...record.current, description: record.current.description || '', milestones: record.current.milestones.map((item:any) => ({ ...item, targetDate: item.targetDate.slice(0,10) })) }); }}>Revise care plan</button>}
   {draft && <form onSubmit={event => { event.preventDefault(); void save(); }}><label>Plan title<input className="form-input" required minLength={3} value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })}/></label><label>Description<textarea className="form-input" value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })}/></label>
    {draft.milestones.map((item:any, index:number) => <div key={item.id || `new-${index}`}><label>Milestone<input className="form-input" required minLength={3} value={item.title} onChange={event => updateMilestone(index,{ title: event.target.value })}/></label><label>Target date<input type="date" className="form-input" required value={item.targetDate} onChange={event => updateMilestone(index,{ targetDate: event.target.value })}/></label>{!item.completed && <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => setDraft({ ...draft, milestones: draft.milestones.filter((_:any, i:number) => i !== index) })}>Remove pending milestone</button>}</div>)}
    <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => setDraft({ ...draft, milestones: [...draft.milestones,{ title: '', targetDate: '' }] })}>Add milestone</button>
    <label>Reason for revision<textarea className="form-input" required minLength={10} value={reason} onChange={event => setReason(event.target.value)}/></label><button className="btn btn-primary" disabled={busy || !draft.milestones.length} type="submit">{busy ? 'Saving…' : `Save version ${draft.version + 1}`}</button><button className="btn btn-ghost" disabled={busy} type="button" onClick={() => setDraft(null)}>Cancel edit</button>
   </form>}
   <h4>Version history</h4>{!record.history.length && <p>No revisions recorded.</p>}{record.history.map((revision:any) => <details key={revision.id}><summary>Version {revision.version} · {revision.reason} · {new Date(revision.createdAt).toLocaleString()}</summary><p>Recorded by {revision.changedBy}</p><p>{revision.snapshot.title}: {revision.snapshot.description}</p><ul>{revision.snapshot.milestones.map((item:any) => <li key={item.id}>{item.title} · {new Date(item.targetDate).toLocaleDateString()}</li>)}</ul></details>)}
  </div>}
 </section>;
}
