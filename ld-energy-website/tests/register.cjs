// Test-only TypeScript/alias loader using the repository's existing compiler.
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const load = Module._load
Module._load = function (id, ...rest) {
  if (id === '@cloudflare/next-on-pages') return { getRequestContext() { throw new Error('Test runner has no Worker bindings') } }
  return load.call(this, id, ...rest)
}
const resolve = Module._resolveFilename
Module._resolveFilename = function (id, ...rest) {
  return resolve.call(this, id.startsWith('@/') ? path.join(__dirname, '..', id.slice(2)) : id, ...rest)
}
require.extensions['.ts'] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  }).outputText
  module._compile(output, filename)
}
