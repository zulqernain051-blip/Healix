import json
import os
import re

def extract_ui_elements(file_path):
    if not os.path.exists(file_path):
        return [], []
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find buttons, touchables, links, inputs
    # Buttons: <Button ... title="X" /> or <TouchableOpacity><Text>X</Text>
    # Links: <Link href="/path">...
    
    actions = []
    elements = []
    
    # 1. <Link href="/path">
    links = re.finditer(r'<Link[^>]+href=\{?[\'"`]([^\'"`]+)[\'"`]\}?[^>]*>', content)
    for match in links:
        href = match.group(1)
        actions.append({"action": f"Tap Link to {href}", "result": f"Navigates to {href}"})
        elements.append({"name": "Navigation Link", "description": f"Navigates to {href}"})
        
    # 2. <Button title="Title" />
    buttons = re.finditer(r'<Button[^>]+title=\{?[\'"`]([^\'"`]+)[\'"`]\}?[^>]*/>', content)
    for match in buttons:
        title = match.group(1)
        actions.append({"action": f"Tap '{title}'", "result": "Executes primary action"})
        elements.append({"name": f"'{title}' Button", "description": "Triggers associated action"})
        
    # 3. Router.push / Router.replace
    routers = re.finditer(r'router\.(push|replace)\([\'"`]([^\'"`]+)[\'"`]\)', content)
    for match in routers:
        method = match.group(1)
        target = match.group(2)
        actions.append({"action": "Interactive element trigger", "result": f"Navigates to {target} ({method})"})
        
    # 4. Inputs
    inputs = re.finditer(r'<(TextInput|Input)[^>]*placeholder=\{?[\'"`]([^\'"`]+)[\'"`]\}?[^>]*>', content)
    for match in inputs:
        placeholder = match.group(2)
        elements.append({"name": f"Input: {placeholder}", "description": "Text entry field"})

    return elements, actions

def process_screens():
    base_dir = r"F:\class Data\FYP Project\Proposal\Project\Healix"
    inv_path = os.path.join(base_dir, "documentation", "inventory", "screens.json")
    
    with open(inv_path, 'r') as f:
        screens = json.load(f)
        
    for s in screens:
        source_file = os.path.join(base_dir, s['sourceFile'])
        elements, actions = extract_ui_elements(source_file)
        
        # Fallbacks if none found
        if not elements:
            elements = [{"name": "Main View Container", "description": "Displays screen content"}]
        if not actions:
            actions = [{"action": "Scroll", "result": "Views additional content"}]
            
        s['ui_elements'] = elements
        s['ui_actions'] = actions
        
    with open(inv_path, 'w') as f:
        json.dump(screens, f, indent=2)

if __name__ == "__main__":
    process_screens()
    print("UI Elements Extracted.")
