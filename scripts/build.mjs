import {readFile,writeFile,mkdir,readdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,relative} from 'node:path';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const web=resolve(root,'web'),assets={};
const mimes={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
async function collect(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=resolve(dir,entry.name);if(entry.isDirectory()){await collect(file);continue;}const ext=extname(file),binary=['.jpg','.png'].includes(ext),bytes=await readFile(file);assets['/'+relative(web,file).replaceAll('\\','/')]={type:mimes[ext]||'text/plain; charset=utf-8',binary,content:binary?bytes.toString('base64'):bytes.toString('utf8')};}}
await collect(web);
const source=await readFile(resolve(root,'worker/index.js'),'utf8');if(!source.includes('/* EMBED_ASSETS */ {}'))throw new Error('Asset placeholder missing');
await mkdir(resolve(root,'dist/server'),{recursive:true});await mkdir(resolve(root,'dist/.openai'),{recursive:true});
await writeFile(resolve(root,'dist/server/index.js'),source.replace('/* EMBED_ASSETS */ {}',()=>JSON.stringify(assets)));
await copyFile(resolve(root,'.openai/hosting.json'),resolve(root,'dist/.openai/hosting.json'));
console.log(`Built ${Object.keys(assets).length} assets into dist/server/index.js`);
