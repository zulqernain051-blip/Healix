import React, { useState, useEffect } from 'react';
import { useDoctorStore } from '../../store/doctor';
import {
  FileText, Check, Brain, Clipboard, ClipboardList, ShieldAlert,
  Plus, Trash2, Heart, HeartPulse, Activity
} from 'lucide-react';

export default function CaseReview({ caseId, onBack }: { caseId: string; onBack: () => void }) {
  const {
    caseReview, fetchCaseReview,
    submitDiagnosis, submitCarePlan, submitPrescription, submitDecision, submitAiFeedback,
    isLoading
  } = useDoctorStore();

  const [activeFormTab, setActiveFormTab] = useState<'DIAGNOSIS' | 'CAREPLAN' | 'PRESCRIPTION' | 'DECISION' | 'CDSS'>('DIAGNOSIS');

  // Form states
  const [diagCode, setDiagCode] = useState('');
  const [diagDesc, setDiagDesc] = useState('');
  const [diagNotes, setDiagNotes] = useState('');

  const [planTitle, setPlanTitle] = useState('');
  const [planGoals, setPlanGoals] = useState(['']);
  const [planInts, setPlanInts] = useState(['']);
  const [planWeeks, setPlanWeeks] = useState(4);

  const [meds, setMeds] = useState([{ drugName: '', dosage: '', frequency: '', durationDays: 7, instructions: '' }]);

  const [decRec, setDecRec] = useState('');
  const [decType, setDecType] = useState('MONITOR'); // MONITOR, ESCALATE, ADMIT, DISCHARGE
  const [decUrgency, setDecUrgency] = useState('ROUTINE'); // ROUTINE, URGENT, EMERGENCY

  const [cdssAgree, setCdssAgree] = useState(true);
  const [cdssText, setCdssText] = useState('');

  useEffect(() => {
    fetchCaseReview(caseId).catch(() => {});
  }, [caseId]);

  if (isLoading && !caseReview) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!caseReview) return null;

  const { visit, patient, riskAssessments, aiSummary } = caseReview;
  const latestVitals = visit?.vitals?.[0] || {};
  const symptoms = visit?.symptoms || [];

  const handleAddGoal = () => setPlanGoals([...planGoals, '']);
  const handleRemoveGoal = (i: number) => setPlanGoals(planGoals.filter((_, idx) => idx !== i));
  const handleAddInt = () => setPlanInts([...planInts, '']);
  const handleRemoveInt = (i: number) => setPlanInts(planInts.filter((_, idx) => idx !== i));

  const handleAddMed = () => setMeds([...meds, { drugName: '', dosage: '', frequency: '', durationDays: 7, instructions: '' }]);
  const handleRemoveMed = (i: number) => setMeds(meds.filter((_, idx) => idx !== i));

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeFormTab === 'DIAGNOSIS') {
        await submitDiagnosis(caseId, { code: diagCode, description: diagDesc, notes: diagNotes });
        alert('Diagnosis submitted successfully');
      } else if (activeFormTab === 'CAREPLAN') {
        await submitCarePlan(caseId, { title: planTitle, goals: planGoals.filter(Boolean), interventions: planInts.filter(Boolean), durationWeeks: planWeeks });
        alert('Care plan submitted successfully');
      } else if (activeFormTab === 'PRESCRIPTION') {
        await submitPrescription(caseId, { medications: meds.filter(m => m.drugName) });
        alert('Prescription submitted successfully');
      } else if (activeFormTab === 'DECISION') {
        await submitDecision(caseId, { recommendation: decRec, actionType: decType, urgency: decUrgency });
        alert('Clinical decision recorded');
      } else if (activeFormTab === 'CDSS') {
        await submitAiFeedback(caseId, { agree: cdssAgree, feedbackText: cdssText });
        alert('AI feedback logged');
      }
      fetchCaseReview(caseId).catch(() => {});
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Case Review: {patient?.user?.fullName || 'Patient'}</h2>
          <p className="page-subtitle">SLA Escalation Case Audit and Action Panel</p>
        </div>
        <button className="btn btn-ghost" onClick={onBack}>Back to Queue</button>
      </div>

      <div className="case-detail">
        {/* Left Panel: Telemetry & AI Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Vitals */}
          <div className="card">
            <h3 className="card-title">
              <HeartPulse size={16} style={{ color: 'var(--red)' }} />
              Latest Vitals Telemetry
            </h3>
            <div className="vitals-grid">
              <div className="vital-box">
                <div className="vital-value">{latestVitals.systolic || 'N/A'}/{latestVitals.diastolic || 'N/A'}</div>
                <div className="vital-label">BP (mmHg)</div>
              </div>
              <div className="vital-box">
                <div className="vital-value">{latestVitals.heartRate || 'N/A'}</div>
                <div className="vital-label">Pulse (bpm)</div>
              </div>
              <div className="vital-box">
                <div className="vital-value">{latestVitals.oxygenSaturation || 'N/A'}%</div>
                <div className="vital-label">SpO2</div>
              </div>
              <div className="vital-box">
                <div className="vital-value">{latestVitals.temperature || 'N/A'}°C</div>
                <div className="vital-label">Temp</div>
              </div>
            </div>
          </div>

          {/* Symptoms & Notes */}
          <div className="card">
            <h3 className="card-title">Symptoms & Clinical Notes</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {symptoms.map((s: any) => (
                <span key={s.id} className="badge badge-amber">
                  {s.symptomName} ({s.severity})
                </span>
              ))}
              {symptoms.length === 0 && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No symptoms declared</span>}
            </div>
            <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>Nurse Notes:</strong> {visit?.notes || 'No notes submitted'}
            </div>
          </div>

          {/* AI Clinical Insight Card */}
          {aiSummary && (
            <div className="card" style={{ borderLeft: '4px solid var(--purple)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                <Brain size={120} style={{ color: 'var(--purple)' }} />
              </div>
              <h3 className="card-title" style={{ color: 'var(--purple)' }}>
                <Brain size={18} style={{ color: 'var(--purple)' }} />
                AI Clinical Decision Support (CDSS)
              </h3>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-primary)' }}>{aiSummary.summary}</p>
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--purple)', fontWeight: '700', marginBottom: '6px' }}>Recommendations</h4>
                <ul style={{ paddingLeft: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {aiSummary.recommendations.map((rec: string, i: number) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Action Forms */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="card-title">
            <ClipboardList size={16} />
            Clinical Actions
          </h3>

          <div className="tab-bar" style={{ flexWrap: 'wrap' }}>
            <button className={`tab-btn ${activeFormTab === 'DIAGNOSIS' ? 'active' : ''}`} onClick={() => setActiveFormTab('DIAGNOSIS')}>Diagnose</button>
            <button className={`tab-btn ${activeFormTab === 'CAREPLAN' ? 'active' : ''}`} onClick={() => setActiveFormTab('CAREPLAN')}>Care Plan</button>
            <button className={`tab-btn ${activeFormTab === 'PRESCRIPTION' ? 'active' : ''}`} onClick={() => setActiveFormTab('PRESCRIPTION')}>Prescribe</button>
            <button className={`tab-btn ${activeFormTab === 'DECISION' ? 'active' : ''}`} onClick={() => setActiveFormTab('DECISION')}>Decision</button>
            <button className={`tab-btn ${activeFormTab === 'CDSS' ? 'active' : ''}`} onClick={() => setActiveFormTab('CDSS')}>AI Feedback</button>
          </div>

          <form onSubmit={handleFormSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            {activeFormTab === 'DIAGNOSIS' && (
              <>
                <div className="form-group">
                  <label className="form-label">ICD-10 Code</label>
                  <input type="text" className="form-input" placeholder="e.g. I10 (Hypertension)" value={diagCode} onChange={(e) => setDiagCode(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input type="text" className="form-input" placeholder="Clinical description..." value={diagDesc} onChange={(e) => setDiagDesc(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Clinical Notes</label>
                  <textarea className="form-input" style={{ height: '100px', resize: 'none' }} placeholder="Clinical reasoning..." value={diagNotes} onChange={(e) => setDiagNotes(e.target.value)} />
                </div>
              </>
            )}

            {activeFormTab === 'CAREPLAN' && (
              <>
                <div className="form-group">
                  <label className="form-label">Plan Title</label>
                  <input type="text" className="form-input" placeholder="e.g. Post-stroke rehab plan" value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Plan Goals</label>
                  {planGoals.map((goal, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <input type="text" className="form-input" placeholder={`Goal ${idx + 1}`} value={goal} onChange={(e) => {
                        const newGoals = [...planGoals]; newGoals[idx] = e.target.value; setPlanGoals(newGoals);
                      }} required />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveGoal(idx)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleAddGoal}><Plus size={14} /> Add Goal</button>
                </div>
                <div className="form-group">
                  <label className="form-label">Plan Interventions</label>
                  {planInts.map((int, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <input type="text" className="form-input" placeholder={`Intervention ${idx + 1}`} value={int} onChange={(e) => {
                        const newInts = [...planInts]; newInts[idx] = e.target.value; setPlanInts(newInts);
                      }} required />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveInt(idx)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleAddInt}><Plus size={14} /> Add Intervention</button>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (Weeks)</label>
                  <input type="number" className="form-input" value={planWeeks} onChange={(e) => setPlanWeeks(+e.target.value)} required />
                </div>
              </>
            )}

            {activeFormTab === 'PRESCRIPTION' && (
              <>
                <div className="form-group" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                  <label className="form-label">Medications</label>
                  {meds.map((med, idx) => (
                    <div key={idx} style={{ border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                      <div className="form-group">
                        <input type="text" className="form-input" placeholder="Drug Name" value={med.drugName} onChange={(e) => {
                          const newMeds = [...meds]; newMeds[idx].drugName = e.target.value; setMeds(newMeds);
                        }} required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input type="text" className="form-input" placeholder="Dosage" value={med.dosage} onChange={(e) => {
                          const newMeds = [...meds]; newMeds[idx].dosage = e.target.value; setMeds(newMeds);
                        }} required />
                        <input type="text" className="form-input" placeholder="Frequency" value={med.frequency} onChange={(e) => {
                          const newMeds = [...meds]; newMeds[idx].frequency = e.target.value; setMeds(newMeds);
                        }} required />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <input type="number" className="form-input" placeholder="Days" value={med.durationDays} onChange={(e) => {
                          const newMeds = [...meds]; newMeds[idx].durationDays = +e.target.value; setMeds(newMeds);
                        }} required />
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveMed(idx)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleAddMed}><Plus size={14} /> Add Medication</button>
                </div>
              </>
            )}

            {activeFormTab === 'DECISION' && (
              <>
                <div className="form-group">
                  <label className="form-label">Action Recommendation</label>
                  <textarea className="form-input" style={{ height: '80px', resize: 'none' }} placeholder="Clinical escalation decisions..." value={decRec} onChange={(e) => setDecRec(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Escalation Action Type</label>
                  <select className="form-input" value={decType} onChange={(e) => setDecType(e.target.value)}>
                    <option value="MONITOR">Continued Home Monitoring</option>
                    <option value="ESCALATE">Escalate to Specialized Unit</option>
                    <option value="ADMIT">Direct ER / Hospital Admission</option>
                    <option value="DISCHARGE">Discharge Escalation Queue</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Clinical Urgency</label>
                  <select className="form-input" value={decUrgency} onChange={(e) => setDecUrgency(e.target.value)}>
                    <option value="ROUTINE">Routine Follow-up</option>
                    <option value="URGENT">Urgent Intervention Needed</option>
                    <option value="EMERGENCY">Emergency Response</option>
                  </select>
                </div>
              </>
            )}

            {activeFormTab === 'CDSS' && (
              <>
                <div className="form-group">
                  <label className="form-label">Do you agree with the AI clinical recommendations?</label>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    <button type="button" className={`btn ${cdssAgree ? 'btn-success' : 'btn-ghost'}`} onClick={() => setCdssAgree(true)}>I Agree</button>
                    <button type="button" className={`btn ${!cdssAgree ? 'btn-danger' : 'btn-ghost'}`} onClick={() => setCdssAgree(false)}>I Disagree</button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">CDSS Review Feedback Notes</label>
                  <textarea className="form-input" style={{ height: '100px', resize: 'none' }} placeholder="Provide clinical rationale for review templates..." value={cdssText} onChange={(e) => setCdssText(e.target.value)} />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: 'auto' }}>
              Submit Clinical Record
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
