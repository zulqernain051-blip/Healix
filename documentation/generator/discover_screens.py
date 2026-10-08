import os
import glob
import json

def discover_mobile_screens(base_dir):
    screens = []
    app_dir = os.path.join(base_dir, 'mobile', 'src', 'app')
    
    # Use rg or glob
    for root, dirs, files in os.walk(app_dir):
        for file in files:
            if file.endswith('.tsx') and not file.startswith('+'):
                # _layout.tsx usually aren't 'screens' in the traditional sense, but they are routes
                is_layout = file == '_layout.tsx'
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, app_dir)
                
                # Determine route string
                route = rel_path.replace('\\', '/').replace('.tsx', '')
                if route.endswith('/index'):
                    route = route[:-6]
                if route == 'index':
                    route = '/'
                    
                # Determine module based on path
                module = 'Common'
                if '(patient)' in rel_path: module = 'Patient'
                elif '(nurse)' in rel_path: module = 'Nurse'
                elif '(doctor)' in rel_path: module = 'Doctor'
                elif '(admin)' in rel_path or 'admin' in rel_path: module = 'Admin'
                elif 'auth' in rel_path: module = 'Auth'
                
                # Determine ID
                clean_route = route.replace('(', '').replace(')', '').replace('[', '').replace(']', '').replace('/', '-').upper()
                if clean_route == '': clean_route = 'ROOT'
                if clean_route.startswith('-'): clean_route = clean_route[1:]
                
                prefix = module[:3].upper()
                screen_id = f"MOB-{prefix}-{clean_route}"
                
                screen = {
                    'id': screen_id,
                    'name': f"Mobile {route}",
                    'platform': 'mobile',
                    'module': module,
                    'route': route,
                    'screenType': 'Layout' if is_layout else 'Screen',
                    'sourceFile': os.path.relpath(full_path, base_dir).replace('\\', '/')
                }
                screens.append(screen)
    return screens

def discover_web_screens(base_dir):
    screens = []
    pages_dir = os.path.join(base_dir, 'web', 'src', 'pages')
    
    if not os.path.exists(pages_dir):
        return screens
        
    for root, dirs, files in os.walk(pages_dir):
        for file in files:
            if file.endswith('.tsx'):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, pages_dir)
                route = rel_path.replace('\\', '/').replace('.tsx', '')
                
                module = 'Web'
                if 'admin' in rel_path.lower(): module = 'Admin'
                elif 'doctor' in rel_path.lower(): module = 'Doctor'
                
                clean_route = route.replace('/', '-').upper()
                prefix = module[:3].upper()
                screen_id = f"WEB-{prefix}-{clean_route}"
                
                screen = {
                    'id': screen_id,
                    'name': f"Web {route}",
                    'platform': 'web',
                    'module': module,
                    'route': route,
                    'screenType': 'Page',
                    'sourceFile': os.path.relpath(full_path, base_dir).replace('\\', '/')
                }
                screens.append(screen)
    return screens

if __name__ == "__main__":
    base_dir = r"F:\class Data\FYP Project\Proposal\Project\Healix"
    out_path = os.path.join(base_dir, "documentation", "inventory", "screens.json")
    
    mob_screens = discover_mobile_screens(base_dir)
    web_screens = discover_web_screens(base_dir)
    
    all_screens = mob_screens + web_screens
    
    # Filter out API routes if any somehow got in
    all_screens = [s for s in all_screens if '+api' not in s['sourceFile']]
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(all_screens, f, indent=2)
        
    print(f"Discovered {len(mob_screens)} mobile screens and {len(web_screens)} web screens. Total: {len(all_screens)}")
