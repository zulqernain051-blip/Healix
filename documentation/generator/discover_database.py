import re
import json
import os

def parse_prisma(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    models = []
    current_model = None
    
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if not line or line.startswith('//'):
            continue
            
        model_match = re.match(r'model\s+(\w+)\s*{', line)
        enum_match = re.match(r'enum\s+(\w+)\s*{', line)
        
        if model_match:
            current_model = {
                'name': model_match.group(1),
                'type': 'model',
                'fields': [],
                'relationships': []
            }
        elif enum_match:
            current_model = {
                'name': enum_match.group(1),
                'type': 'enum',
                'values': []
            }
        elif line == '}' and current_model:
            models.append(current_model)
            current_model = None
        elif current_model and current_model['type'] == 'model':
            # Parse field
            # e.g., id String @id @default(uuid())
            # patientId String?
            parts = line.split()
            if not parts or line.startswith('@@'):
                continue
                
            field_name = parts[0]
            field_type = parts[1]
            
            is_optional = field_type.endswith('?')
            is_array = field_type.endswith('[]')
            clean_type = field_type.replace('?', '').replace('[]', '')
            
            attributes = ' '.join(parts[2:])
            is_pk = '@id' in attributes
            is_fk = '@relation' in attributes
            
            field = {
                'name': field_name,
                'type': clean_type,
                'isOptional': is_optional,
                'isArray': is_array,
                'isPrimaryKey': is_pk,
                'isForeignKey': is_fk,
                'attributes': attributes
            }
            current_model['fields'].append(field)
            
            if is_fk or (clean_type not in ['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json']):
                 current_model['relationships'].append({
                     'field': field_name,
                     'target': clean_type,
                     'relation': attributes
                 })
                 
        elif current_model and current_model['type'] == 'enum':
            if not line.startswith('@@'):
                current_model['values'].append(line)

    return models

if __name__ == "__main__":
    prisma_path = r"F:\class Data\FYP Project\Proposal\Project\Healix\backend\prisma\schema.prisma"
    out_path = r"F:\class Data\FYP Project\Proposal\Project\Healix\documentation\inventory\database.json"
    
    models = parse_prisma(prisma_path)
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(models, f, indent=2)
        
    print(f"Discovered {len(models)} database models/enums.")
