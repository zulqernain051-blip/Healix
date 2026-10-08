import os
import re
import json

def discover_apis(base_dir):
    backend_dir = os.path.join(base_dir, 'backend', 'src')
    apis = []
    
    # Regex to catch router.METHOD('/path', ...)
    route_pattern = re.compile(r'router\.(get|post|put|patch|delete)\s*\(\s*[\'"`]([^\'"`]+)[\'"`]')
    
    for root, dirs, files in os.walk(backend_dir):
        for file in files:
            if file.endswith('.ts') and not file.endswith('.test.ts'):
                full_path = os.path.join(root, file)
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                matches = route_pattern.findall(content)
                for method, path in matches:
                    rel_path = os.path.relpath(full_path, backend_dir).replace('\\', '/')
                    
                    # Try to infer module
                    module = 'Common'
                    if 'features' in rel_path or 'domains' in rel_path:
                        parts = rel_path.split('/')
                        idx = parts.index('features') if 'features' in parts else parts.index('domains')
                        if len(parts) > idx + 1:
                            module = parts[idx + 1].capitalize()
                            
                    api_id = f"API-{method.upper()}-{path.replace('/', '-').strip('-').upper()}"
                    
                    apis.append({
                        'id': api_id,
                        'method': method.upper(),
                        'path': path,
                        'module': module,
                        'sourceFile': os.path.relpath(full_path, base_dir).replace('\\', '/')
                    })
    
    # Deduplicate
    unique_apis = {f"{api['method']}:{api['path']}": api for api in apis}.values()
    return list(unique_apis)

if __name__ == "__main__":
    base_dir = r"F:\class Data\FYP Project\Proposal\Project\Healix"
    out_path = os.path.join(base_dir, "documentation", "inventory", "apis.json")
    
    apis = discover_apis(base_dir)
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(apis, f, indent=2)
        
    print(f"Discovered {len(apis)} API endpoints.")
