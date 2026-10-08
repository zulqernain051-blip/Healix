import json
import os

def check_completeness():
    base_dir = r"F:\class Data\FYP Project\Proposal\Project\Healix"
    inv_path = os.path.join(base_dir, "documentation", "inventory", "screens.json")
    md_path = os.path.join(base_dir, "documentation", "output", "Healix_User_Manual.md")
    
    with open(inv_path, 'r', encoding='utf-8') as f:
        screens = json.load(f)
        
    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()
        
    audit = {
        "screens_discovered": len(screens),
        "screens_documented": 0,
        "missing_screens": [],
        "screenshots": "0 - Marked as UNAVAILABLE"
    }
    
    for s in screens:
        # Check if screen ID is in markdown
        if f"`{s['id']}`" in md_content:
            audit["screens_documented"] += 1
        else:
            audit["missing_screens"].append(s['id'])
            
    out_path = os.path.join(base_dir, "documentation", "output", "User_Manual_Completeness_Audit.json")
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(audit, f, indent=2)
        
    print(json.dumps(audit, indent=2))

if __name__ == "__main__":
    check_completeness()
