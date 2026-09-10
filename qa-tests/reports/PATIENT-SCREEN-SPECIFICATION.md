# PATIENT SCREEN SPECIFICATIONS

## Screen 1 — Dashboard

### Basic Information
* Screen number: 1
* Screen name: Dashboard
* Route: /home
* File: home/index.tsx
* Parent screen: Root
* Screen type: Tab/Root

### Interactive Elements

#### Button / Control
Action: Navigate to /(patient)/profile
Destination Route: /(patient)/profile

#### Button / Control
Action: Navigate to /(patient)/notifications
Destination Route: /(patient)/notifications

#### Button / Control
Action: Navigate to /(patient)/records/risk-history
Destination Route: /(patient)/records/risk-history

#### Button / Control
Action: Navigate to /(patient)/requests
Destination Route: /(patient)/requests

#### Button / Control
Action: Navigate to /(patient)/requests
Destination Route: /(patient)/requests

#### Button / Control
Action: Navigate to /(patient)/requests/new
Destination Route: /(patient)/requests/new

#### Button / Control
Action: Navigate to /(patient)/records
Destination Route: /(patient)/records

#### Button / Control
Action: Navigate to /(patient)/ai
Destination Route: /(patient)/ai

#### Button / Control
Action: Navigate to /(patient)/health/prescriptions
Destination Route: /(patient)/health/prescriptions

#### Button / Control
Action: Navigate to /(patient)/records/vitals
Destination Route: /(patient)/records/vitals

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 1.1 — Notifications

### Basic Information
* Screen number: 1.1
* Screen name: Notifications
* Route: /notifications
* File: notifications/index.tsx
* Parent screen: 1
* Screen type: Tab/Root

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 1.2 — AI Assistant

### Basic Information
* Screen number: 1.2
* Screen name: AI Assistant
* Route: /ai
* File: ai/index.tsx
* Parent screen: 1
* Screen type: Tab/Root

### Interactive Elements

#### Button / Control
Action: Navigate to /(patient)/home
Destination Route: /(patient)/home

#### Button / Control
Action: Navigate to /(patient)/home
Destination Route: /(patient)/home

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 1.3 — Health Overview

### Basic Information
* Screen number: 1.3
* Screen name: Health Overview
* Route: /health
* File: health/index.tsx
* Parent screen: 1
* Screen type: Tab/Root

### Interactive Elements

#### Button / Control
Action: Navigate to /(patient)/records/vitals
Destination Route: /(patient)/records/vitals

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 1.3.1 — Medical History

### Basic Information
* Screen number: 1.3.1
* Screen name: Medical History
* Route: /health/medical
* File: health/medical.tsx
* Parent screen: 1.3
* Screen type: Stack

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 1.3.2 — Caregivers

### Basic Information
* Screen number: 1.3.2
* Screen name: Caregivers
* Route: /health/caregivers
* File: health/caregivers.tsx
* Parent screen: 1.3
* Screen type: Stack

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 1.3.3 — Care Plans

### Basic Information
* Screen number: 1.3.3
* Screen name: Care Plans
* Route: /health/careplans
* File: health/careplans.tsx
* Parent screen: 1.3
* Screen type: Stack

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 1.3.4 — Clinical Outcomes

### Basic Information
* Screen number: 1.3.4
* Screen name: Clinical Outcomes
* Route: /health/clinical-outcomes
* File: health/clinical-outcomes.tsx
* Parent screen: 1.3
* Screen type: Stack

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 1.3.5 — Prescriptions

### Basic Information
* Screen number: 1.3.5
* Screen name: Prescriptions
* Route: /health/prescriptions
* File: health/prescriptions.tsx
* Parent screen: 1.3
* Screen type: Stack

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 1.3.6 — Recurring Care

### Basic Information
* Screen number: 1.3.6
* Screen name: Recurring Care
* Route: /health/recurring
* File: health/recurring.tsx
* Parent screen: 1.3
* Screen type: Stack

### Interactive Elements

#### Button / Control
Action: Navigate to /(patient)/requests
Destination Route: /(patient)/requests

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 1.4 — Medical Records

### Basic Information
* Screen number: 1.4
* Screen name: Medical Records
* Route: /records
* File: records/index.tsx
* Parent screen: 1
* Screen type: Tab/Root

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 1.4.1 — Vitals

### Basic Information
* Screen number: 1.4.1
* Screen name: Vitals
* Route: /records/vitals
* File: records/vitals.tsx
* Parent screen: 1.4
* Screen type: Stack

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 1.4.2 — Risk History

### Basic Information
* Screen number: 1.4.2
* Screen name: Risk History
* Route: /records/risk-history
* File: records/risk-history.tsx
* Parent screen: 1.4
* Screen type: Stack

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 2 — Care Requests

### Basic Information
* Screen number: 2
* Screen name: Care Requests
* Route: /requests
* File: requests/index.tsx
* Parent screen: Root
* Screen type: Tab/Root

### Interactive Elements

#### Button / Control
Action: Navigate to /(patient)/requests/new
Destination Route: /(patient)/requests/new

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 2.1 — Create Care Request

### Basic Information
* Screen number: 2.1
* Screen name: Create Care Request
* Route: /requests/new
* File: requests/new.tsx
* Parent screen: 2
* Screen type: Stack

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 2.2 — Request Details

### Basic Information
* Screen number: 2.2
* Screen name: Request Details
* Route: /requests/[id]
* File: requests/[id].tsx
* Parent screen: 2
* Screen type: Dynamic

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 3 — Marketplace

### Basic Information
* Screen number: 3
* Screen name: Marketplace
* Route: /marketplace
* File: marketplace/index.tsx
* Parent screen: Root
* Screen type: Tab/Root

### Interactive Elements

#### Button / Control
Action: Navigate to /(patient)/marketplace/contracts
Destination Route: /(patient)/marketplace/contracts

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 3.1 — Offers List

### Basic Information
* Screen number: 3.1
* Screen name: Offers List
* Route: /marketplace/[id]
* File: marketplace/[id].tsx
* Parent screen: 3
* Screen type: Dynamic

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 3.2 — Contracts

### Basic Information
* Screen number: 3.2
* Screen name: Contracts
* Route: /marketplace/contracts
* File: marketplace/contracts/index.tsx
* Parent screen: 3
* Screen type: Tab/Root

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 3.3 — Contract Details

### Basic Information
* Screen number: 3.3
* Screen name: Contract Details
* Route: /marketplace/contracts/[id]
* File: marketplace/contracts/[id].tsx
* Parent screen: 3
* Screen type: Dynamic

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 4 — Visits

### Basic Information
* Screen number: 4
* Screen name: Visits
* Route: /visits
* File: visits/index.tsx
* Parent screen: Root
* Screen type: Tab/Root

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 4.1 — Visit Details

### Basic Information
* Screen number: 4.1
* Screen name: Visit Details
* Route: /visits/[id]
* File: visits/[id].tsx
* Parent screen: 4
* Screen type: Dynamic

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 5 — Messages

### Basic Information
* Screen number: 5
* Screen name: Messages
* Route: /messages
* File: messages/index.tsx
* Parent screen: Root
* Screen type: Tab/Root

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 5.1 — Chat

### Basic Information
* Screen number: 5.1
* Screen name: Chat
* Route: /messages/chat
* File: messages/chat.tsx
* Parent screen: 5
* Screen type: Stack

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 6 — Profile

### Basic Information
* Screen number: 6
* Screen name: Profile
* Route: /profile
* File: profile/index.tsx
* Parent screen: Root
* Screen type: Tab/Root

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 6.1 — Edit Profile

### Basic Information
* Screen number: 6.1
* Screen name: Edit Profile
* Route: /profile/edit
* File: profile/edit.tsx
* Parent screen: 6
* Screen type: Stack

### Interactive Elements

#### Button / Control
Action: Navigate to /(patient)/profile
Destination Route: /(patient)/profile

#### Button / Control
Action: Navigate to /(patient)/profile
Destination Route: /(patient)/profile

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 6.2 — Emergency Contacts

### Basic Information
* Screen number: 6.2
* Screen name: Emergency Contacts
* Route: /profile/emergency-contacts
* File: profile/emergency-contacts.tsx
* Parent screen: 6
* Screen type: Stack

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

## Screen 6.3 — Settings

### Basic Information
* Screen number: 6.3
* Screen name: Settings
* Route: /profile/settings
* File: profile/settings.tsx
* Parent screen: 6
* Screen type: Stack

### Interactive Elements

*No major navigation buttons detected via static scan. May rely on tabs.*

### API & DB Effects
No direct data mutations detected on this screen.

---

