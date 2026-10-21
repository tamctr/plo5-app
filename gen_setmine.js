// Regenerate setmine.json from the set-mining report (break-even S/C tables, EV-3 + EV-2, hero models a/b)
const fs=require('fs'),src=process.argv[2]||'/workspace/plo5-setmine/report.md';
const L=fs.readFileSync(src,'utf8').split('\n');
const COLS=['R1','R2','R3','R5','T1','T3'];
const out={source:'plo5-setmine/report.md',cols:COLS,tables:{}};
let model=null;
for(let i=0;i<L.length;i++){
  if(/^## Hero model \(a\)/.test(L[i]))model='a';else if(/^## Hero model \(b\)/.test(L[i]))model='b';
  const m=/^\*\*Break-even implied-odds multiple S\/C — (EV-[23]) /.exec(L[i]);if(!m||!model)continue;
  let j=i+1;while(!/^\| Pair \|/.test(L[j]))j++;
  const hdr=L[j].split('|').slice(2,-1).map(s=>s.trim());if(hdr.join()!==COLS.join())throw new Error('cols '+hdr);
  const t={};for(j+=2;/^\| /.test(L[j]);j++){const c=L[j].split('|').slice(1,-1).map(s=>s.trim());
    t[c[0]]=c.slice(1).map(x=>{const v=/^([\d.]+) ±([\d.]+)$/.exec(x);if(!v)throw new Error('cell '+x);return [+v[1],+v[2]];});}
  if(Object.keys(t).length!==13)throw new Error('rows');out.tables[m[1]+model]=t;}
if(Object.keys(out.tables).sort().join()!=='EV-2a,EV-2b,EV-3a,EV-3b')throw new Error('tables '+Object.keys(out.tables));
fs.writeFileSync(__dirname+'/setmine.json',JSON.stringify(out));console.log('setmine.json:',Object.keys(out.tables).join(' '));
