// Build index.html from tpl.html + score_a1.js + core.js + dist.json + setmine.json
const fs=require('fs'),rd=f=>fs.readFileSync(__dirname+'/'+f,'utf8');
// score_a1.js is the coach's score_6.js verbatim; wrap it so its top-level names don't leak into core's scope
const a1='var A1=(function(){var module={exports:{}};\n'+rd('score_a1.js')+'\n;return module.exports;})();\n';
const out=rd('tpl.html').split('/*CORE*/').join(a1+rd('core.js')).split('/*DIST*/').join(rd('dist.json').trim()).split('/*SETMINE*/').join(rd('setmine.json').trim());
fs.writeFileSync(__dirname+'/index.html',out);
console.log('built index.html');
