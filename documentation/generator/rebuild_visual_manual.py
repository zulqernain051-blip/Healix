"""Build a screenshot-verified Healix manual from the live capture inventory.

Every image used is a captured Healix page. Uncaptured routes are kept in the
completeness report, never represented by a placeholder in the PDF.
"""
from collections import Counter, defaultdict
from html import escape
from pathlib import Path
import json
import re

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A3
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output'
CAPTURES = json.loads((ROOT / 'inventory/manual_capture_results.json').read_text(encoding='utf-8'))
MOBILE = json.loads((ROOT / 'inventory/screens_v2.json').read_text(encoding='utf-8'))
EDGES = json.loads((ROOT / 'inventory/navigation_v2.json').read_text(encoding='utf-8'))
FORM_FIELDS = json.loads((ROOT / 'inventory/form_fields.json').read_text(encoding='utf-8'))

NAVY = colors.HexColor('#113B54')
TEAL = colors.HexColor('#008E86')
MUTED = colors.HexColor('#5B6876')
LIGHT = colors.HexColor('#EAF5F5')

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='CoverTitleHealix', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=28, leading=34, textColor=NAVY, alignment=TA_CENTER, spaceAfter=22))
styles.add(ParagraphStyle(name='LeadHealix', parent=styles['Normal'], fontSize=11, leading=16, textColor=MUTED, alignment=TA_CENTER, spaceAfter=14))
styles.add(ParagraphStyle(name='ModuleHealix', parent=styles['Heading1'], fontSize=22, leading=27, textColor=NAVY, spaceBefore=10, spaceAfter=17))
styles.add(ParagraphStyle(name='ScreenHealix', parent=styles['Heading2'], fontSize=19, leading=23, textColor=NAVY, spaceBefore=3, spaceAfter=12))
styles.add(ParagraphStyle(name='SubHealix', parent=styles['Heading3'], fontSize=12, leading=16, textColor=TEAL, spaceBefore=9, spaceAfter=4))
styles.add(ParagraphStyle(name='BodyHealix', parent=styles['Normal'], fontSize=11, leading=15, textColor=NAVY, spaceAfter=6))
styles.add(ParagraphStyle(name='SmallHealix', parent=styles['Normal'], fontSize=9, leading=12, textColor=NAVY, spaceAfter=4))

def p(text, style='BodyHealix'):
    return Paragraph(escape(str(text)).replace('\n','<br/>'), styles[style])

TITLE_OVERRIDES = {
    '/(patient)/(tabs)/home':'Patient Dashboard',
    '/(patient)/(tabs)/requests':'My Requests',
    '/(patient)/requests/new':'Create Care Request',
    '/(patient)/(tabs)/records':'Health Records',
    '/(patient)/(tabs)/messages':'Patient Messages',
    '/(patient)/health':'Health Overview',
    '/(nurse)/(tabs)/home':'Nurse Dashboard',
    '/(nurse)/(tabs)/visits':'My Visits',
    '/(nurse)/(tabs)/marketplace':'Nurse Marketplace',
    '/(doctor)/(tabs)/home':'Doctor Dashboard',
    '/admin':'Admin Command Center',
    '/auth/forgot':'Forgot Password',
    '/auth/reset':'Reset Password',
    '/auth/role-select':'Choose Account Role',
    '/auth/verify-otp':'Verify Account Code',
    '/auth/mfa-verify':'Verify MFA Code',
    '/auth/change-password':'Change Password',
}

def title(s):
    return TITLE_OVERRIDES.get(s['route'],s['title'])

def footer(c, doc):
    c.setStrokeColor(colors.HexColor('#DCE6EB'))
    c.line(55, 42, A3[0]-55, 42)
    c.setFont('Helvetica', 7)
    c.setFillColor(MUTED)
    c.drawString(55, 27, 'HEALIX  /  VISUAL USER MANUAL  /  OCTOBER 2026')
    c.drawRightString(A3[0]-55, 27, str(doc.page))

def clean_visible(text):
    bits = [re.sub(r'\s+', ' ', x).strip() for x in text.splitlines()]
    out = []
    for bit in bits:
        if len(bit) < 3 or bit.startswith('??') or bit in out: continue
        if re.fullmatch(r'[\W\d]+', bit): continue
        out.append(bit[:95])
    return out

def purpose(screen):
    screen_name = title(screen).lower()
    module = screen['module']
    if 'login' in screen_name: return 'Sign in to the Healix account for the selected role.'
    if 'register' in screen_name: return 'Create a new Healix account using the visible registration form.'
    if 'dashboard' in screen_name or screen_name == 'home': return f'Open the {module.lower()} workspace and its visible quick actions.'
    if 'request' in screen_name: return 'Review or enter a home-care request using the controls shown on this screen.'
    if 'visit' in screen_name: return 'Review visit information and the actions currently offered for that visit.'
    if 'message' in screen_name or 'chat' in screen_name: return 'View conversations and communicate through the available messaging controls.'
    if 'profile' in screen_name or 'settings' in screen_name: return 'Review or change the account information exposed by this screen.'
    if 'verification' in screen_name: return 'Review the verification information and controls shown for this role.'
    if 'record' in screen_name or 'vitals' in screen_name: return 'Review the patient information and clinical records available to this account.'
    return f'Use the implemented {title(screen)} view in the {module} area.'

all_screens = [x for x in CAPTURES if x.get('route') not in ('/','/(patient)/health/recurring')]
documented = [x for x in all_screens if x.get('screenshot') and (ROOT/x['screenshot']).is_file()]
by_num = {x['number']:x for x in documented}
by_route = {x['route']:x for x in documented if x['platform']=='Mobile'}
outgoing = defaultdict(list)
for edge in EDGES:
    if edge['from'] in by_route and edge['to'] in by_route:
        outgoing[edge['from']].append(edge)
for edges in outgoing.values():
    edges.sort(key=lambda x:(x.get('action') or '',x['to']))

VERIFIED_ACTIONS = {
    '/auth/login':[('Sign Up','2.1.3 Choose Account Role'),('Forgot Password?','2.1.1 Forgot Password')],
    '/(patient)/(tabs)/home':[('Request Care','3.1.9 Create Care Request'),('Requests','3.1.5 My Requests'),('Records','3.1.4 Health Records'),('Messages','3.1.2 Patient Messages'),('Profile','3.1.3 Profile')],
    '/(nurse)/(tabs)/home':[('My Visits','4.1.5 My Visits'),('Marketplace','4.1.2 Nurse Marketplace'),('Messages','4.1.3 Messages'),('Profile','4.1.4 Profile')],
}
FIELD_NAMES = {
    '/auth/login':['Email or Phone Number','Password'],
    '/auth/register':['Full Name','Email Address','Phone Number','Password','CNIC Number'],
    '/auth/forgot':['Email or Phone Number'],
    '/auth/reset':['6-Digit OTP Reset Code','New Password','Confirm New Password'],
    '/(patient)/requests/new':['Notes / Description','Special Requirements','Expected Duration (minutes)','Preferred Date','Detailed Address'],
    '/(patient)/profile/edit':['Full Name','Date of Birth','Gender','Address','Latitude','Longitude'],
    '/admin/config':['Platform Commission Fee','Doctor Response Timeout','Geofence Radius','Message Encryption Mode'],
}
FORM_STEPS = {
    '/auth/login':['Enter the account email or phone number and password.','Select Sign In to open the workspace for that account role.'],
    '/auth/register':['Choose the account role on the preceding screen.','Enter the visible personal and credential fields.','Submit the registration form and follow the verification flow shown by the app.'],
    '/auth/forgot':['Enter the account email or phone number.','Request a reset code, then use the Reset Password screen.'],
    '/auth/reset':['Enter the reset code and a new password twice.','Submit the reset form.'],
    '/(patient)/requests/new':['Select a care template or Custom Request.','Enter the care notes and any special requirements.','Choose schedule, date, time window, and service location.','Select Submit Request.'],
    '/(patient)/profile/edit':['Edit the visible personal and location fields.','Select Save Profile to submit the changes.'],
    '/admin/config':['Review each setting and its displayed value.','Edit a value and select its adjacent Save control.'],
}

module_order = ['Authentication','Patient','Nurse','Doctor','Administrator','Web Authentication','Web Administrator','Web Doctor','Common']
modules = [m for m in module_order if any(x['module']==m for x in documented)]

md = ['# Healix - Visual User Manual (Verified Screens Edition)', '',
      'This visual edition is rebuilt from the existing Healix_User_Manual.md. Screens below are included only when an actual Healix rendering was captured. The attached completeness report lists every route that could not be captured. Expo mobile routes were captured from the live Expo web preview, not a native device.', '',
      '## How to read this manual', '',
      'Each numbered screen shows its real application image, route, role, entry action, visible controls, and verified navigation. Indented numbering represents a confirmed parent-child route. A separate module entry indicates no confirmed parent route.', '',
      '## Navigation hierarchy', '']
story = [Spacer(1,70), p('HEALIX', 'CoverTitleHealix'), p('Visual User Manual - Verified Screens Edition','CoverTitleHealix'),
         p('Current implemented screens  |  Screenshot-verified edition  |  October 2026','LeadHealix'),
         Spacer(1,20), p(f'{len(documented)} rendered screens documented across {len(modules)} application areas.','LeadHealix'),
         p('Screens without a verified image are tracked in the completeness report. Mobile images are from the live Expo web preview.','LeadHealix'), PageBreak(),
         p('Contents','ModuleHealix'),
         p('How to read this manual; Module overview; Navigation hierarchy; Authentication; Patient; Nurse; Doctor; Administrator; Web Authentication; Web Administrator; Web Doctor; Common; Screen index; Navigation index; Workflow index; Glossary.'),
         Spacer(1,10),p('How to read this manual','ModuleHealix'),
         p('Follow the numbered screen sections from a module entry to its child screens. Every image is a capture of a running Healix application. The route is the implemented navigation target; the entry action is based on the verified route inventory. Separate entries identify screens with no confirmed parent navigation.'),
         p('Module overview','ModuleHealix')]
for m in modules:
    n=sum(x['module']==m for x in documented)
    story.append(p(f'{m}: {n} captured screen(s)'))
story.extend([Spacer(1,9),p('Navigation hierarchy','ModuleHealix')])

for module in modules:
    story.append(p(module,'SubHealix'))
    md.append(f'### {module}')
    md.append('')
    for s in documented:
        if s['module']!=module: continue
        depth=max(0,s['number'].count('.')-1)
        text=f"{s['number']} {title(s)}"
        indented=ParagraphStyle(name=f'NavIndent{depth}',parent=styles['SmallHealix'],leftIndent=depth*17)
        story.append(Paragraph(escape(text),indented))
        md.append(f"{'  '*depth}- {s['number']} {title(s)}")
    md.append('')
story.append(PageBreak())

for module in modules:
    screens=[x for x in documented if x['module']==module]
    story.append(p(module,'ModuleHealix'))
    story.append(p(f'{len(screens)} screen(s) captured from the running Healix application.'))
    md.append(f'## {module}')
    md.append('')
    for s in screens:
        screen_title=f"{s['number']} {title(s)}"
        parent_screen=by_num.get(s.get('parent'))
        raw_entry=s.get('entryAction')
        entry=(raw_entry if raw_entry and parent_screen and (
            raw_entry.lower() in parent_screen.get('visibleText','').lower() or s.get('entryKind')=='tab'
        ) else None)
        if s['module'].startswith('Web '): entry=raw_entry
        if s['route']=='/auth/login': entry='Open Healix while signed out'
        if s.get('isModuleRoot') and s['module'] not in ('Authentication','Common'):
            entry=f"Sign in with a {s['role'].lower()} account"
        if parent_screen:
            for label,target in VERIFIED_ACTIONS.get(parent_screen['route'],[]):
                if target.split()[0]==s['number']: entry=label
            if not entry and s.get('entryKind') in ('tab','layout-menu'):
                entry=f"Use the {title(s)} tab or menu item"
        story.append(p(screen_title,'ScreenHealix'))
        metadata=[
            ['Screen ID',s['id'],'Role',s['role']],
            ['Platform',s.get('capturePlatform',s['platform']),'Route',s['route']],
            ['Parent',s.get('parent') or 'Module entry / no confirmed parent','Entry',entry or 'Not verified'],
        ]
        table=Table([[p(c,'SmallHealix') for c in row] for row in metadata],colWidths=[75,270,70,305],hAlign='LEFT')
        table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),LIGHT),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#D3E5E5')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6)]))
        story += [table,Spacer(1,8)]
        screenshot=ROOT/s['screenshot']
        width,height=PILImage.open(screenshot).size
        scale=min(720/width,500/height)
        story.append(Image(str(screenshot),width=width*scale,height=height*scale))
        story.append(p('Purpose','SubHealix'))
        story.append(p(purpose(s)))
        visible=clean_visible(s.get('visibleText',''))
        shown=visible[9:18] if s['platform']=='Mobile' and s['module'] in ('Patient','Nurse','Doctor') and len(visible)>11 else visible[:9]
        story.append(p('What the user sees','SubHealix'))
        story.append(p('Visible labels include: '+', '.join(shown)+'.' if shown else 'The screenshot shows the currently rendered application state.'))
        if s['route'] in FORM_STEPS:
            story.append(p('How to use','SubHealix'))
            for step_no,step in enumerate(FORM_STEPS[s['route']],1):
                story.append(p(f'{step_no}. {step}'))
        fields=FORM_FIELDS.get(s['route'],[])
        if fields:
            story.append(p('Visible form fields','SubHealix'))
            names=FIELD_NAMES.get(s['route'],[])
            rows=[[p('Field','SmallHealix'),p('Input','SmallHealix'),p('Required marker','SmallHealix')]]
            for i,field in enumerate(fields):
                name=names[i] if i<len(names) else field['placeholder'] or field['near'][:50] or f'Field {i+1}'
                marked=field['required'] or ('*' in field['near'] and name.lower().split()[0] in field['near'].lower())
                rows.append([p(name,'SmallHealix'),p(field['type'],'SmallHealix'),p('Shown' if marked else 'Not shown','SmallHealix')])
            form_table=Table(rows,colWidths=[340,170,210],hAlign='LEFT')
            form_table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),LIGHT),('LINEBELOW',(0,0),(-1,0),0.7,TEAL),('VALIGN',(0,0),(-1,-1),'TOP')]))
            story.append(form_table)
        if entry and s.get('parent'):
            story += [p('How to reach this screen','SubHealix'),p(f"From {s.get('parent') or 'its entry point'}, use {entry}.")]
        moves=[]
        if s['platform']=='Mobile':
            moves=VERIFIED_ACTIONS.get(s['route'],[])
            if not moves and s.get('parent') and re.search(r'\bback\b',s.get('visibleText',''),re.I):
                moves=[('Back',f"Return to {s['parent']}")]
        elif s['module'] in ('Web Administrator','Web Doctor') and s['number'].endswith('.1'):
            for child in screens[1:]: moves.append((f"Click {title(child)} in the sidebar",f"{child['number']} {title(child)}"))
        elif s['module']=='Web Authentication':
            moves=[('Sign In as Administrator','8.1 Dashboard'),('Sign In as Doctor','9.1 Case Queue')]
        if moves:
            action_table=Table([[p('User action','SmallHealix'),p('Result','SmallHealix')]]+[[p(a,'SmallHealix'),p(b,'SmallHealix')] for a,b in moves],colWidths=[330,390],hAlign='LEFT')
            action_table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),LIGHT),('LINEBELOW',(0,0),(-1,0),0.7,TEAL),('VALIGN',(0,0),(-1,-1),'TOP')]))
            story.append(KeepTogether([p('Action to result','SubHealix'),action_table]))
        related=', '.join(n for n in s.get('children',[]) if n in by_num)
        if not related and s['module'] in ('Web Administrator','Web Doctor') and s['number'].endswith('.1'):
            related=', '.join(child['number'] for child in screens[1:])
        related=related or 'No verified child screen'
        story.append(KeepTogether([p('Navigation','SubHealix'),p(f"Previous: {s.get('parent') or 'module entry'}  |  Current: {s['number']}  |  Child screens: {related}")]))
        story.append(PageBreak())
        md += [f"### {screen_title}", '',f"Screen ID: `{s['id']}`  ",f"Platform: {s.get('capturePlatform',s['platform'])}  ",f"Role: {s['role']}  ",f"Route: `{s['route']}`  ",f"Parent: {s.get('parent') or 'Module entry / no confirmed parent'}  ",f"Entry action: {entry or 'No in-app entry action verified'}",'',f"![Actual Healix screen]({Path('..')/s['screenshot']})",'',f"**Purpose:** {purpose(s)}",'',f"**What the user sees:** {', '.join(shown)}.",'', '**Action to result**','', '| Action | Result |','| --- | --- |']
        md += [f'| {a} | {b} |' for a,b in moves]
        if s['route'] in FORM_STEPS:
            md += ['','**How to use**','']+[f'{i}. {step}' for i,step in enumerate(FORM_STEPS[s['route']],1)]
        if fields:
            md += ['','**Visible form fields**','','| Field | Input | Required marker |','| --- | --- | --- |']
            for i,field in enumerate(fields):
                name=FIELD_NAMES.get(s['route'],[])[i] if i<len(FIELD_NAMES.get(s['route'],[])) else field['placeholder'] or field['near'][:50] or f'Field {i+1}'
                marked=field['required'] or ('*' in field['near'] and name.lower().split()[0] in field['near'].lower())
                md.append(f"| {name} | {field['type']} | {'Shown' if marked else 'Not shown'} |")
        md += ['',f"**Navigation:** {s.get('parent') or 'Module entry'} -> {s['number']} -> {related}",'']
    # A new module starts on a fresh page after its final screen.

story.append(p('Screen index','ModuleHealix'))
md += ['## Screen index','', '| Number | Screen | Role | Platform | Route |','| --- | --- | --- | --- | --- |']
for s in documented:
    story.append(p(f"{s['number']}  {title(s)}  |  {s['role']}  |  {s['route']}",'SmallHealix'))
    md.append(f"| {s['number']} | {title(s)} | {s['role']} | {s.get('capturePlatform',s['platform'])} | `{s['route']}` |")
story += [PageBreak(),p('Navigation index','ModuleHealix')]
md += ['','## Navigation index','']
documented_edges=[]
for source,actions in VERIFIED_ACTIONS.items():
    if source not in by_route: continue
    a=by_route[source]
    for label,target in actions:
        num=target.split()[0]
        if num not in by_num: continue
        b=by_num[num]
        story.append(p(f"{a['number']} {title(a)}  ->  {label}  ->  {b['number']} {title(b)}",'SmallHealix'))
        md.append(f"- {a['number']} {title(a)} -> {label} -> {b['number']} {title(b)}")
        documented_edges.append((a,b,label))
for e in EDGES:
    if e.get('kind')!='tab' or e['from'] not in by_route or e['to'] not in by_route: continue
    a,b=by_route[e['from']],by_route[e['to']]
    label=e.get('action') or 'Bottom tab bar'
    if any(x[0]['route']==a['route'] and x[1]['route']==b['route'] for x in documented_edges): continue
    story.append(p(f"{a['number']} {title(a)}  ->  {label}  ->  {b['number']} {title(b)}",'SmallHealix'))
    md.append(f"- {a['number']} {title(a)} -> {label} -> {b['number']} {title(b)}")
    documented_edges.append((a,b,label))
for module in ('Web Administrator','Web Doctor'):
    ss=[x for x in documented if x['module']==module]
    if ss:
        for x in ss[1:]:
            story.append(p(f"{ss[0]['number']} {ss[0]['title']}  ->  sidebar: {x['title']}  ->  {x['number']} {x['title']}",'SmallHealix'))
            md.append(f"- {ss[0]['number']} {ss[0]['title']} -> sidebar: {x['title']} -> {x['number']} {x['title']}")
for label,target in [('Sign In as Administrator','8.1'),('Sign In as Doctor','9.1')]:
    if target in by_num:
        story.append(p(f"7.1 Web Login  ->  {label}  ->  {target} {title(by_num[target])}",'SmallHealix'))
        md.append(f"- 7.1 Web Login -> {label} -> {target} {title(by_num[target])}")
        documented_edges.append(('7.1',target,label))

story += [PageBreak(),p('Workflow index','ModuleHealix')]
md += ['','## Workflow index','']
workflows=[
    ('Patient request', ['2.1','3.1','3.1.5','3.1.9']),
    ('Patient records', ['2.1','3.1','3.1.4']),
    ('Nurse visit overview', ['2.1','4.1','4.1.5']),
    ('Web administrator review', ['7.1','8.1','8.3']),
    ('Web doctor review', ['7.1','9.1','9.2']),
]
for label,nums in workflows:
    present=[n for n in nums if n in by_num]
    if len(present)<2: continue
    flow=' -> '.join(f"{n} {title(by_num[n])}" for n in present)
    story += [p(label,'SubHealix'),p(flow)]
    md += [f'- **{label}:** {flow}']
story += [Spacer(1,12),p('Glossary','ModuleHealix'),p('Expo web preview: the implemented React Native application rendered in a desktop browser. It is not a native-device screenshot.'),p('Module entry: a role landing screen or a route for which the current navigation audit found no confirmed parent.'),p('Dynamic route: a detail page requiring an existing record identifier.')]
md += ['','## Glossary','', '- **Expo web preview:** the implemented React Native app rendered in a browser, not a native-device capture.','- **Module entry:** role landing screen or route without a confirmed parent.','- **Dynamic route:** detail page requiring an existing record.']

OUT.mkdir(parents=True,exist_ok=True)
pdf=OUT/'Healix_User_Manual.pdf'
SimpleDocTemplate(str(pdf),pagesize=A3,rightMargin=55,leftMargin=55,topMargin=55,bottomMargin=58,title='Healix - Complete Visual User Manual',author='Healix Project').build(story,onFirstPage=footer,onLaterPages=footer)
(OUT/'Healix_User_Manual.md').write_text('\n'.join(md)+'\n',encoding='utf-8')

actual_count=len(MOBILE)-2+11 # Root and recurring alias are redirects, plus 11 web views.
missing=[x for x in all_screens if x not in documented]
missing.append({'number':'9.3','title':'Case Review','module':'Web Doctor','route':'/doctor [selected case]','captureStatus':'No existing case assignment in development database'})
report_lines=[
    '# Healix User Manual Completeness Report','',
    'Assessment date: 2026-10-04. Counts are based on the current source inventory and live captures. The mobile inventory excludes the `/` and `/(patient)/health/recurring` redirects as non-screens. The web inventory counts login, seven administrator views, two doctor tabs, and case review.','',
    f'- Total actual screens discovered: **{actual_count}**',
    f'- Total screens documented with a real Healix rendering: **{len(documented)}**',
    f'- Total missing screen sections: **{actual_count-len(documented)}**',
    f'- Total screenshots required: **{actual_count}**',
    f'- Total real Healix screenshots captured: **{len(documented)}**',
    f'- Native-device mobile screenshots captured: **0** (Expo web preview captures are identified as such)',
    '- Total placeholder screenshots: **0**',
    f'- Screens without verified hierarchy/parent: **{sum(not x.get("parent") and not x.get("isModuleRoot") and x["module"] not in ("Web Authentication","Web Administrator","Web Doctor") for x in documented)}**',
    '- Total application areas/modules discovered: **9** (mobile authentication, patient, nurse, doctor, admin, common; web authentication, admin, doctor)',
    f'- Total documented areas/modules: **{len(modules)}**',
    f'- Source-extracted mobile navigation relationships: **{len(EDGES)}**',
    f'- Navigation relationships between documented screens: **{len(documented_edges)+sum(max(0,sum(x["module"]==m for x in documented)-1) for m in ("Web Administrator","Web Doctor"))}**','',
    'The manual is **incomplete** against the requested native-device and all-screens standard. A live Expo web preview is an actual rendering of the Healix mobile code but does not establish native-device visual parity. Dynamic detail routes could not be captured because the existing development database has no care requests, visits, contracts, listings, or case assignments. No records were fabricated for documentation.','',
    '## Uncaptured screens','',
    '| Number | Module | Route | Reason |','| --- | --- | --- | --- |',
]
for x in missing:
    report_lines.append(f"| {x.get('number','')} | {x['module']} | `{x['route']}` | {x.get('captureStatus','No capture')} |")
report_lines += ['','## Validation','',
    f'- Captured PNG files referenced by manual: {len(documented)}; all files exist.',
    '- PDF contains only referenced real Healix captures; uncaptured routes have no substituted image.',
    '- Existing manual text was reviewed. Generic claims based solely on files, including layout files counted as screens, were removed.',
    '- Navigation edges come from the source inventory; routes not confirmed by captured screens remain in this report rather than being presented as completed journeys.',
]
(OUT/'Healix_User_Manual_Completeness_Report.md').write_text('\n'.join(report_lines)+'\n',encoding='utf-8')
print('PDF',pdf)
print('DOCUMENTED',len(documented),'ACTUAL',actual_count,'MISSING',actual_count-len(documented),'MODULES',len(modules))
