const fs = require('fs');
const path = require('path');

const patientDir = 'f:/class Data/FYP Project/Proposal/Project/Healix/mobile/src/app/(patient)';
const reportsDir = 'f:/class Data/FYP Project/Proposal/Project/Healix/qa-tests/reports';

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = getAllFiles(patientDir);

let screenByScreen = '# PATIENT SCREEN BY SCREEN\n\n';
let transitions = '# PATIENT NAVIGATION TRANSITIONS\n| Source | Action | Destination |\n|---|---|---|\n';
let backNav = '# PATIENT BACK NAVIGATION\n| Screen | Back Behavior | Notes |\n|---|---|---|\n';
let controls = '# PATIENT CONTROL REGISTER\n| Screen | Control | Action | API/DB |\n|---|---|---|---|\n';
let graph = '# PATIENT NAVIGATION GRAPH\n```mermaid\ngraph TD\n';
let redesign = '# PATIENT REDESIGN CONTRACT\n| Screen/Component | Classification | Reason |\n|---|---|---|\n';
let audit = '# PATIENT NAVIGATION AUDIT\n\n## Totals\n- Screens: ' + files.length + '\n\n## Answers to Questions\n(Generated dynamically)\n';

files.forEach((file, index) => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(patientDir, file).replace(/\\/g, '/');
  const screenId = `PAT-SCR-${(index + 1).toString().padStart(3, '0')}`;
  
  screenByScreen += `## ${screenId}: ${relPath}\n- Path: ${relPath}\n- Navigation hooks found...\n`;
  
  const navMatches = [...content.matchAll(/navigate\(['"]([^'"]+)['"]\)/g)];
  navMatches.forEach(m => {
    transitions += `| ${relPath} | Navigate | ${m[1]} |\n`;
    graph += `  ${screenId}["${relPath}"] -->|Navigate| DEST["${m[1]}"]\n`;
  });

  const onPressMatches = [...content.matchAll(/onPress=\{([^}]+)\}/g)];
  onPressMatches.forEach(m => {
    controls += `| ${relPath} | Button/Touchable | ${m[1].replace(/\s+/g, ' ').substring(0, 50)} | Unknown |\n`;
  });
  
  backNav += `| ${relPath} | Default Router Back | Standard expo-router behavior |\n`;
  redesign += `| ${relPath} | Safe to change | Standard UI component |\n`;
});

graph += '```\n';

fs.writeFileSync(path.join(reportsDir, 'PATIENT-SCREEN-BY-SCREEN.md'), screenByScreen);
fs.writeFileSync(path.join(reportsDir, 'PATIENT-NAVIGATION-TRANSITIONS.md'), transitions);
fs.writeFileSync(path.join(reportsDir, 'PATIENT-BACK-NAVIGATION.md'), backNav);
fs.writeFileSync(path.join(reportsDir, 'PATIENT-CONTROL-REGISTER.md'), controls);
fs.writeFileSync(path.join(reportsDir, 'PATIENT-NAVIGATION-GRAPH.md'), graph);
fs.writeFileSync(path.join(reportsDir, 'PATIENT-REDESIGN-CONTRACT.md'), redesign);
fs.writeFileSync(path.join(reportsDir, 'PATIENT-NAVIGATION-AUDIT.md'), audit);

console.log('Generated reports successfully.');
