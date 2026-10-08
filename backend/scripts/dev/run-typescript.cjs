// Local runner for environments where tsx cannot read Windows user information.
const fs=require('fs'), ts=require('typescript'), path=require('path');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,filename);
require(path.resolve(process.argv[2]));
