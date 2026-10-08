const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function loadTs(file, mocks = {}, globals = {}) {
  const filename = path.resolve(__dirname, '..', file);
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  const localRequire = (id) => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (id.startsWith('.')) return loadTs(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), id)) + '.ts', mocks, globals);
    return require(id);
  };
  vm.runInNewContext(js, { module, exports: module.exports, require: localRequire, console, process, Headers, Response, FormData, Blob, URL, setTimeout, clearTimeout, ...globals }, { filename });
  return module.exports;
}
module.exports = { loadTs };
