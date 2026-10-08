const fs = require('fs');
const path = require('path');
const storeDir = path.join('f:/class Data/FYP Project/Proposal/Project/Healix/mobile/src/store');
const files = fs.readdirSync(storeDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(storeDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to catch imports and getApiUrl block
  const importRegex = /import\s+\{\s*Platform\s*\}\s+from\s+'react-native';\s*import\s+Constants\s+from\s+'expo-constants';\s*const\s+getApiUrl[\s\S]*?const\s+API_URL\s*=\s*getApiUrl\(\);/g;
  
  if (importRegex.test(content)) {
    content = content.replace(importRegex, "import { apiClient } from '../api/client';");
  } else {
    // try fallback 
    const fallbackRegex = /const\s+getApiUrl[\s\S]*?const\s+API_URL\s*=\s*getApiUrl\(\);/g;
    content = content.replace(fallbackRegex, "");
    
    // Add import manually after zustand
    content = content.replace(/import\s+\{\s*create\s*\}\s+from\s+'zustand';/, "import { create } from 'zustand';\nimport { apiClient } from '../api/client';");
  }

  // Also catch expo-secure-store if we want to remove it since apiClient handles it, but maybe they use it manually.
  
  // Replace the fetch calls. 
  content = content.replace(/await\s+fetch\(\s*`\$\{API_URL\}/g, "await apiClient.fetch(`");

  fs.writeFileSync(filePath, content);
  console.log('Updated', file);
});
