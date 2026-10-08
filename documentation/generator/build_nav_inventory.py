"""
build_nav_inventory.py
Builds the TRUE screen inventory + navigation graph + hierarchy for the Healix mobile app
from the actual source code. Output: documentation/inventory/{screens_v2,navigation_v2}.json

Hierarchy method: BFS from each module's home screen over real navigation edges
(navigate()/router.push/replace/Link/href/Redirect found in the screen file and in the
components it imports). Tab-bar screens are children of Home (reached via the tab bar).
Screens with no inbound in-app link are reported honestly, never given a fake parent.
"""
import os, re, json, collections

ROOT = r"F:\class Data\FYP Project\Proposal\Project\Healix"
APP = os.path.join(ROOT, "mobile", "src", "app")
SRC = os.path.join(ROOT, "mobile", "src")
INV = os.path.join(ROOT, "documentation", "inventory")

MODULES = {  # folder -> (chapter no, name, role, prefix, home route)
    "auth":      (2, "Authentication", "All users", "AUTH", "/auth/login"),
    "(patient)": (3, "Patient", "Patient", "PAT", "/(patient)/(tabs)/home"),
    "(nurse)":   (4, "Nurse", "Nurse", "NUR", "/(nurse)/(tabs)/home"),
    "(doctor)":  (5, "Doctor", "Doctor", "DOC", "/(doctor)/(tabs)/home"),
    "admin":     (6, "Administrator", "Admin", "ADM", "/admin"),
}

def route_of(rel):
    r = "/" + rel.replace("\\", "/")[:-4]
    r = re.sub(r"/index$", "", r)
    return r or "/"

def module_of(route):
    for folder in MODULES:
        if route == f"/{folder}" or route.startswith(f"/{folder}/"):
            return folder
    return "common"

# ---- discover screens (non-layout) ---------------------------------------
screens = {}
for dp, _, files in os.walk(APP):
    for f in files:
        if f.endswith(".tsx") and f != "_layout.tsx":
            full = os.path.join(dp, f)
            rel = os.path.relpath(full, APP)
            route = route_of(rel)
            screens[route] = {"route": route, "file": os.path.relpath(full, ROOT).replace("\\", "/"),
                              "fullpath": full, "module": module_of(route)}

def norm_target(t):
    t = t.split("?")[0]
    t = re.sub(r"\$\{[^}]*\}", "[id]", t)
    t = re.sub(r"/(index)$", "", t)
    return t.rstrip("/") or "/"

def match_route(t):
    t = norm_target(t)
    if t in screens: return t
    # dynamic: [id] segment
    for r in screens:
        pat = "^" + re.sub(r"\[[^\]]+\]", "[^/]+", re.escape(r).replace(r"\[", "[").replace(r"\]", "]")) + "$"
        pat = re.sub(r"\[\^/\]\+", "[^/]+", pat)
        try:
            if re.match("^" + re.sub(r"\\\[[^\]]+\\\]", "[^/]+", re.escape(r)) + "$", t): return r
        except re.error:
            pass
    # route group omitted, e.g. '/visits/x'
    return None

NAV_PATTERNS = [
    r"navigate\(\s*([`'\"])(.+?)\1",
    r"replace\(\s*([`'\"])(.+?)\1",
    r"router\.(?:push|replace|navigate)\(\s*([`'\"])(.+?)\1",
    r"href=\{?\s*([`'\"])(.+?)\1",
    r"pathname:\s*([`'\"])(.+?)\1",
    r"\b(?:route|path):\s*([`'\"])(/\(?[a-z]+.*?)\1",   # data-driven menu arrays
    r"([`'\"])(/(?:\((?:patient|nurse|doctor)\)|admin|auth)/[^`'\"\s]*)\1",  # any route-shaped literal
]

def read(p):
    try:
        with open(p, encoding="utf-8") as fh: return fh.read()
    except Exception: return ""

def resolve_import(from_file, spec):
    if not spec.startswith("."): return None
    base = os.path.normpath(os.path.join(os.path.dirname(from_file), spec))
    for ext in (".tsx", ".ts", "/index.tsx", "/index.ts"):
        if os.path.exists(base + ext): return base + ext
    return None

def label_near(content, idx):
    """Best-effort: visible text of the control that triggers navigation at idx."""
    # menu-array object: look for title:/label:/name: in the same object literal
    ostart = content.rfind("{", 0, idx)
    oend = content.find("}", idx)
    if ostart != -1 and oend != -1 and oend - ostart < 700:
        m = re.search(r"\b(?:title|label|name)\s*:\s*['\"`]([^'\"`]{2,50})['\"`]", content[ostart:oend])
        if m: return m.group(1)
    window = content[idx: idx + 900]
    m = re.search(r">\s*([A-Z][A-Za-z0-9 '&/\-\+,\.]{2,40})\s*</(?:Text|ThemedText|AppText)>", window)
    if m: return m.group(1).strip()
    m = re.search(r"title=[\"']([^\"']+)[\"']", content[max(0, idx - 300): idx + 300])
    if m: return m.group(1)
    back = content[max(0, idx - 700): idx]
    ms = re.findall(r">\s*([A-Z][A-Za-z0-9 '&/\-\+,\.]{2,40})\s*</(?:Text|ThemedText|AppText)>", back)
    return ms[-1].strip() if ms else None

edges = []   # (src_route, dst_route, action_label, kind, via_file)
unresolved = collections.defaultdict(set)
for route, s in screens.items():
    files = [s["fullpath"]]
    seen = set(files)
    content = read(s["fullpath"])
    for spec in re.findall(r"from\s+['\"](\.[^'\"]+)['\"]", content):
        p = resolve_import(s["fullpath"], spec)
        if p and p not in seen and "/app/" not in p.replace("\\", "/") and ("components" in p or "hooks" in p):
            files.append(p); seen.add(p)
    for fp in files:
        c = read(fp)
        for pat in NAV_PATTERNS:
            for m in re.finditer(pat, c):
                tgt = m.group(2)
                if not tgt.startswith("/"): continue
                dst = match_route(tgt)
                if dst is None:
                    unresolved[route].add(tgt); continue
                if dst == route: continue
                edges.append((route, dst, label_near(c, m.start()), "push/replace/link", os.path.relpath(fp, ROOT).replace("\\", "/")))
        for m in re.finditer(r"<Redirect\s+href=\{?\s*(?:\{\s*pathname:\s*)?([`'\"])(.+?)\1", c):
            dst = match_route(m.group(2))
            if dst and dst != route: edges.append((route, dst, "(automatic redirect)", "redirect", os.path.relpath(fp, ROOT).replace("\\", "/")))

# ---- layout-level navigation (tab bar / More menu) -> attributed to module home ----
for folder, (_, _, _, _, home) in MODULES.items():
    if home not in screens: continue
    for lay in (os.path.join(APP, folder, "(tabs)", "_layout.tsx"), os.path.join(APP, folder, "_layout.tsx")):
        c = read(lay)
        if not c: continue
        for pat in NAV_PATTERNS:
            for m in re.finditer(pat, c):
                tgt = m.group(2)
                if not tgt.startswith("/"): continue
                dst = match_route(tgt)
                if dst and dst != home:
                    lab = label_near(c, m.start())
                    edges.append((home, dst, (("More menu / tab bar → " + lab) if lab else "More menu / tab bar"), "layout-menu", os.path.relpath(lay, ROOT).replace("\\", "/")))

# ---- tab bar edges (home -> other tabs) ----------------------------------
tab_edges = []
for folder, (_, _, _, _, home) in MODULES.items():
    if "(tabs)" not in home: continue
    for r, s in screens.items():
        if r.startswith(f"/{folder}/(tabs)/") and r != home:
            tab_edges.append((home, r, "Bottom tab bar → " + r.rsplit("/", 1)[1].title(), "tab", "(tabs)/_layout.tsx"))
edges += tab_edges

# ---- dedupe, BFS hierarchy ------------------------------------------------
uniq = {}
for e in edges:
    k = (e[0], e[1])
    if k not in uniq or (uniq[k][2] is None and e[2]): uniq[k] = e
edges = list(uniq.values())
out_adj = collections.defaultdict(list)
for e in edges: out_adj[e[0]].append(e)
in_adj = collections.defaultdict(list)
for e in edges: in_adj[e[1]].append(e)

parent = {}
order = {}
def bfs(root, folder):
    q = collections.deque([root]); seen = {root}
    parent[root] = None
    while q:
        cur = q.popleft()
        kids = sorted(out_adj[cur], key=lambda e: (e[3] != "tab", e[1]))
        for e in kids:
            d = e[1]
            if d in seen or module_of(d) != folder: continue
            seen.add(d); parent[d] = e; q.append(d)
    return seen

reached = set()
for folder, (_, _, _, _, home) in MODULES.items():
    if home in screens: reached |= bfs(home, folder)

# Orphans: no inbound in-app path from module home. Attach as 'unlinked' to module root
orphans = [r for r in screens if r not in reached and module_of(r) in MODULES]
common = [r for r in screens if module_of(r) == "common"]

# numbering
def children_of(r):
    ks = [d for d, e in parent.items() if e and e[0] == r]
    return sorted(ks, key=lambda d: (parent[d][3] != "tab", d))

numbers = {}
def number(r, num):
    numbers[r] = num
    for i, k in enumerate(children_of(r), 1): number(k, f"{num}.{i}")
for folder, (ch, *_rest) in MODULES.items():
    home = MODULES[folder][4]
    if home in screens: number(home, f"{ch}.1")
    base = 2
    for r in sorted([o for o in orphans if module_of(o) == folder]):
        numbers[r] = f"{ch}.{base}"; base += 1
for i, r in enumerate(sorted(common), 1):
    numbers[r] = f"1.{i}"

def title_of(route):
    last = route.rstrip("/").split("/")[-1]
    if last.startswith("["): last = route.rstrip("/").split("/")[-2] + " detail"
    if last == "": last = "root"
    return re.sub(r"[-_]", " ", last).title()

result = []
for r, s in sorted(screens.items(), key=lambda kv: [int(x) for x in numbers.get(kv[0], "99").split(".")]):
    folder = s["module"]
    meta = MODULES.get(folder, (1, "Common", "All users", "CMN", None))
    pe = parent.get(r)
    result.append({
        "number": numbers.get(r),
        "id": f"{meta[3]}-" + re.sub(r"[^A-Z0-9]+", "-", re.sub(r"^/\(?[a-z]+\)?/?", "", r).upper().replace("(TABS)", "TAB")).strip("-") or "ROOT",
        "title": title_of(r), "module": meta[1], "role": meta[2], "platform": "Mobile",
        "route": r, "sourceFile": s["file"],
        "parent": (numbers.get(pe[0]) if pe else None),
        "parentRoute": (pe[0] if pe else None),
        "entryAction": (pe[2] if pe else None),
        "entryKind": (pe[3] if pe else None),
        "children": [numbers[k] for k in children_of(r)],
        "otherEntryPoints": [{"from": numbers.get(e[0]), "fromRoute": e[0], "action": e[2]} for e in in_adj[r] if not pe or e[0] != pe[0]],
        "isModuleRoot": any(r == m[4] for m in MODULES.values()),
        "hasInboundLink": bool(in_adj[r]) or any(r == m[4] for m in MODULES.values()),
        "unresolvedNavTargets": sorted(unresolved.get(r, [])),
    })

os.makedirs(INV, exist_ok=True)
json.dump(result, open(os.path.join(INV, "screens_v2.json"), "w", encoding="utf-8"), indent=2)
json.dump([{"from": e[0], "to": e[1], "action": e[2], "kind": e[3], "viaFile": e[4]} for e in edges],
          open(os.path.join(INV, "navigation_v2.json"), "w", encoding="utf-8"), indent=2)

print("mobile user-facing screens:", len(screens))
print("navigation edges:", len(edges), "(tab edges:", len(tab_edges), ")")
print("reached via BFS:", len(reached), "| orphans (no inbound link):", len(orphans), "| common:", len(common))
for o in sorted(orphans): print("  ORPHAN", o, "in:", [e[0] for e in in_adj[o]])
print("unresolved nav targets:", {k: sorted(v) for k, v in unresolved.items()})
