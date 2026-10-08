// Local preview of the real API and exported Expo application.
require('dotenv').config();
const fs = require('fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  module._compile(result.outputText, filename);
};
const path = require('path');
const express = require('express');
const app = require('../../src/app.ts').default;
app.listen(3000, '127.0.0.1', () => console.log('Healix API and web: http://127.0.0.1:3000'));
const preview = express();
const root = path.resolve(__dirname, '../../../scratch/nurse-patient-web');
preview.use(express.static(root, { extensions: ['html'], redirect: false }));
preview.get('*', (_req, res) => res.sendFile(path.join(root, 'index.html')));
preview.listen(8083, '127.0.0.1', () => console.log('Healix Expo preview: http://127.0.0.1:8083/auth/login'));
