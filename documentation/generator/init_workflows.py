import json
import os

workflows = [
    {
        "id": "WF-001",
        "name": "User Registration & Multi-Role Identity Verification",
        "objective": "Onboard a new user with proper credentials and enforce role-based verification.",
        "actors": ["Patient", "Nurse", "Doctor", "Admin"],
        "preconditions": "User is unauthenticated.",
        "steps": [
            "User selects role and submits registration details.",
            "Backend creates User and Role-specific profile.",
            "System sends OTP via SMS/Email.",
            "User verifies OTP.",
            "For professionals (Nurse/Doctor), Admin performs credential audit.",
            "Account activated upon Admin approval."
        ],
        "status": "FULLY IMPLEMENTED"
    },
    {
        "id": "WF-002",
        "name": "Patient Care Request & Marketplace Bidding",
        "objective": "Broadcast a clinical need to the local network of nurses.",
        "actors": ["Patient", "Nurse"],
        "preconditions": "Patient is logged in.",
        "steps": [
            "Patient specifies care tier, schedule, and budget.",
            "CareRequest is created and broadcasted.",
            "Nurses in the vicinity receive alert.",
            "Nurses submit bids.",
            "Patient reviews bids and accepts one."
        ],
        "status": "FULLY IMPLEMENTED"
    },
    {
        "id": "WF-003",
        "name": "Contract Acceptance & Generation",
        "objective": "Formally bind a Nurse to a Patient's Care Request.",
        "actors": ["Patient", "Nurse", "System"],
        "preconditions": "Bid is accepted.",
        "steps": [
            "System generates a digital CareContract.",
            "Both parties acknowledge terms.",
            "Contract status transitions to EXECUTED.",
            "Scheduled Visits are automatically provisioned."
        ],
        "status": "FULLY IMPLEMENTED"
    },
    {
        "id": "WF-004",
        "name": "In-Home Clinical Visit Execution & CDSS Logging",
        "objective": "Execute scheduled visit and capture physiological telemetry.",
        "actors": ["Nurse", "Patient", "CDSS Engine"],
        "preconditions": "Visit is scheduled.",
        "steps": [
            "Nurse arrives and taps 'Start Visit'.",
            "Nurse administers e-MAR medications.",
            "Nurse logs 7 core vital signs.",
            "CDSS Engine fuses metrics into a Risk Score.",
            "Visit is marked COMPLETED."
        ],
        "status": "FULLY IMPLEMENTED"
    },
    {
        "id": "WF-005",
        "name": "Acute Deterioration & Doctor Escalation",
        "objective": "Automatically alert a physician when CDSS detects critical decline.",
        "actors": ["CDSS Engine", "SLA Worker", "Doctor"],
        "preconditions": "CDSS Score >= 50 (HIGH/CRITICAL).",
        "steps": [
            "CDSS engine flags vitals as CRITICAL.",
            "System generates ClinicalReview and starts SLA timer.",
            "Doctor is notified via push alert.",
            "Doctor reviews patient telemetry.",
            "Doctor signs off on intervention."
        ],
        "status": "FULLY IMPLEMENTED"
    },
    {
        "id": "WF-006",
        "name": "Ambulance Dispatch & Paramedic Handover",
        "objective": "Physician triggers emergency transport for critical patient.",
        "actors": ["Doctor", "System", "Paramedic"],
        "preconditions": "Doctor reviews an escalated ClinicalReview.",
        "steps": [
            "Doctor taps 'Dispatch Ambulance'.",
            "System locates nearest Ambulance.",
            "AmbulanceDispatch record created.",
            "Paramedic is alerted and real-time chat initiated.",
            "Paramedic transports patient to Hospital."
        ],
        "status": "BACKEND ONLY"
    },
    {
        "id": "WF-007",
        "name": "Doctor Diagnosis & Digital Prescription",
        "objective": "Physician alters patient's regimen remotely.",
        "actors": ["Doctor", "System"],
        "preconditions": "Doctor is evaluating a patient case.",
        "steps": [
            "Doctor opens Prescription Builder.",
            "Selects medication, dosage, route, frequency.",
            "System verifies contraindications.",
            "Prescription is cryptographically signed and added to CarePlan."
        ],
        "status": "FULLY IMPLEMENTED"
    },
    {
        "id": "WF-008",
        "name": "Offline Synchronization Queue",
        "objective": "Preserve data integrity during rural visits with no connectivity.",
        "actors": ["Nurse Mobile App", "System"],
        "preconditions": "Nurse loses internet connection.",
        "steps": [
            "Nurse logs vitals.",
            "Network fails; vitals saved to local SQLite/AsyncStorage Queue.",
            "Device regains connection.",
            "Background worker flushes queue to backend.",
            "Data reconciliation confirmed."
        ],
        "status": "FULLY IMPLEMENTED"
    },
    {
        "id": "WF-009",
        "name": "Professional License Auditing",
        "objective": "Administrators manually verify nurse and doctor credentials.",
        "actors": ["Admin", "Nurse", "Doctor"],
        "preconditions": "Professional registers account.",
        "steps": [
            "Professional uploads license details.",
            "Admin views Pending Verification queue.",
            "Admin audits license against state boards.",
            "Admin clicks 'Approve'.",
            "Professional account unlocks clinical features."
        ],
        "status": "FULLY IMPLEMENTED"
    }
]

if __name__ == "__main__":
    base_dir = r"F:\class Data\FYP Project\Proposal\Project\Healix"
    out_path = os.path.join(base_dir, "documentation", "inventory", "workflows.json")
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(workflows, f, indent=2)
        
    print(f"Generated {len(workflows)} workflows.")
