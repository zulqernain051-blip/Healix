# Healix Test Master Register

## Scenarios
- **SCENARIO 001** — COMPLETE NORMAL CARE JOURNEY (Patient -> Request -> Marketplace -> Contract -> Visit -> Vitals -> Risk -> Doctor Assignment -> Case Review -> Diagnosis/Prescription/CarePlan -> Resolution)
- **SCENARIO 002** — THREE NURSE BIDS / SECOND NURSE SELECTED (Verify 3 offers, select 1, others rejected)
- **SCENARIO 003** — RECURRING CARE (Test recurring pattern generation and downstream visits)
- **SCENARIO 004** — HIGH RISK CASE (Must verify risk triggers automatic doctor assignment)
- **SCENARIO 005** — CRITICAL / EMERGENCY CASE (Must verify Professional Broadcast SLA and Admin Escalation timeout)
- **SCENARIO 006** — DOCTOR CLINICAL JOURNEY
- **SCENARIO 007** — CARE PLAN → NURSING CARE (Test "Keep Current Nurse" bypass vs Marketplace)
- **SCENARIO 008** — PATIENT OUTCOME / CASE CLOSURE
- **SCENARIO 009** — LOW / NORMAL RISK (Verify NO escalation)
- **SCENARIO 010** — MULTIPLE PATIENTS (Security/Data isolation)
- **SCENARIO 011** — MULTIPLE NURSES (Competing bids isolation)
- **SCENARIO 012** — DOCTOR LOAD BALANCING
- **SCENARIO 013** — ADMIN OVERRIDE
- **SCENARIO 014** — KEEP CURRENT NURSE
- **SCENARIO 015** — VISIT STATE MACHINE (Test invalid transitions)
- **SCENARIO 016-020** — VITALS, SYMPTOMS, REMARKS, COMPLETION, VERIFICATION
- **SCENARIO 021-022** — AUTHENTICATION, ROLE ACCESS
- **SCENARIO 023-024** — COMMUNICATION, NOTIFICATIONS
- **SCENARIO 025-028** — FAILURE CONDITIONS, REFRESH/RELOAD, DOUBLE CLICK/DUPLICATE, CONCURRENT ACTIONS

## Combinations
- **A**: ONE_TIME + Nurse 1 + Normal Risk
- **B**: ONE_TIME + Nurse 2 + HIGH Risk
- **C**: RECURRING + Nurse 3 + Normal Risk
- **D**: RECURRING + Keep Current Nurse
- **E**: HIGH Risk + Automatic Doctor Assignment
- **F**: HIGH Risk + No immediately available professional
- **G**: CRITICAL Risk + Professional accepts
- **H**: CRITICAL Risk + No professional accepts → escalation
- **I**: Admin overrides Doctor assignment
- **J**: Patient cancels request before contract
- **K**: Patient cancels/changes request after offer
- **L**: Nurse rejects/does not accept where supported
- **M**: Doctor resolves case
- **N**: Doctor creates nursing follow-up
- **O**: Invalid/unauthorized user attempts the same operation
