# PATIENT NAVIGATION GRAPH

`mermaid
graph TD
    HOME[Screen 1 - Dashboard] -->|Tap Notifications| NOTIF[Screen 1.1 - Notifications]
    HOME -->|Tap AI| AI[Screen 1.2 - AI Assistant]
    HOME -->|Tap Health| HEALTH[Screen 1.3 - Health Overview]
    HEALTH -->|Tap Medical History| MEDICAL[Screen 1.3.1 - Medical History]
    HEALTH -->|Tap Care Plans| CAREPLANS[Screen 1.3.3 - Care Plans]
    HOME -->|Tap Records| RECORDS[Screen 1.4 - Medical Records]
    RECORDS -->|Tap Vitals| VITALS[Screen 1.4.1 - Vitals]
    
    HOME -->|Tab Nav| REQ[Screen 2 - Care Requests]
    REQ -->|Tap New Request| NEWREQ[Screen 2.1 - Create Care Request]
    REQ -->|Tap Request Card| REQDETAIL[Screen 2.2 - Request Details]
    
    HOME -->|Tab Nav| MKT[Screen 3 - Marketplace]
    MKT -->|Tap Offer| OFFERDETAIL[Screen 3.1 - Offers List]
    MKT -->|Tap Contracts| CONTRACTS[Screen 3.2 - Contracts]
    CONTRACTS -->|Tap Contract| CONTRACTDETAIL[Screen 3.3 - Contract Details]
    
    HOME -->|Tab Nav| VISITS[Screen 4 - Visits]
    VISITS -->|Tap Visit Card| VISITDETAIL[Screen 4.1 - Visit Details]
    
    HOME -->|Tab Nav| MSG[Screen 5 - Messages]
    MSG -->|Tap Chat| CHAT[Screen 5.1 - Chat]
    
    HOME -->|Tab Nav| PROFILE[Screen 6 - Profile]
    PROFILE -->|Tap Edit| EDITPROFILE[Screen 6.1 - Edit Profile]
    PROFILE -->|Tap Settings| SETTINGS[Screen 6.3 - Settings]
`
