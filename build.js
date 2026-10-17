// Build index.html from tpl.html + core.js + dist.json
const fs=require('fs');
const core=fs.readFileSync(__dirname+'/core.js','utf8');
const dist=fs.readFileSync(__dirname+'/dist.json','utf8').trim();
const tpl=fs.readFileSync(__dirname+'/tpl.html','utf8');
fs.writeFileSync(__dirname+'/index.html',tpl.split('/*CORE*/').join(core).split('/*DIST*/').join(dist));
console.log('built index.html');
