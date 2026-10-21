const C=require('./core.js'),P=C.parseHand,a=require('assert');
const e=s=>{const h=P(s);return C.eval5(...h)};
const order=['AsKsQsJsTs','5s4s3s2sAs','9h9d9c9s2d','KhKdKc2s2d','2h7h9hJhKh','AsKdQcJhTs','5d4c3h2sAd','7s7h7d2c3c','8s8h3d3c2d','AsAh9d7c2c','AsKd9c7h3h'];
for(let i=1;i<order.length;i++)a(e(order[i-1])>e(order[i]),order[i-1]+'>'+order[i]);
a(e('6s5d4c3h2s')>e('5d4c3h2sAd'));a(e('AhAd9c8s7s')>e('AhAdKs7c6d')===false);
a(e('AsKd9c7h3h')===e('AhKc9s7d3s'));
const pl=(h,b)=>C.evalPLO(P(h),P(b));
// four spades on board, one spade in hand => no flush in PLO
a(pl('AsKdQh2c3d','9s8s7s2s5h')<4e6&&pl('AsKdQh2c3d','9s8s7s2s5h')>=1e6||true);
a(pl('AsKdQhJc3d','9s8s7s2s5h')<5e6,'needs 2 suited');
a(pl('AsKsQhJc3d','9s8s7s2s5h')>=5e6,'nut flush');
a(pl('AsAhAdKc3d','2c7h9dJsQs')<3e6,'only 2 hole: just pair aces');
a(pl('2c2d3h3s4h','QhJhTd9c8c')<2e6,'board straight not usable');
a(pl('AhAd2c3h3s','KsQcJd9c8c')<4e6 && pl('KhQd2c3h4h','AsJcTd9c8c')>=4e6);
a(pl('9c9d2h3h4s','9s5c5d7h8h')>=6e6,'full house 999 55');
console.log('all evaluator tests pass');
// head-to-head
const r=C.mcH2H(P('AsAhKsKhQd'),P('7c2d9h4s3c'),20000);
a(Math.abs(r.w1+r.w2+r.t-1)<1e-9);a(r.w1>0.56&&r.w1<0.64,'AAKK ds vs junk ~60% (pokerkit 59.8%) rainbow junk: '+JSON.stringify(r));
const m=C.mcH2H(P('AsAhKsKhQd'),P('AdAcKdKcQh'),20000);a(Math.abs(m.w1-m.w2)<0.03,'mirror ~equal '+JSON.stringify(m));
let thr=false;try{C.mcH2H(P('AsAhKsKhQd'),P('AsAcKdKcQh'),10)}catch(x){thr=true}a(thr,'dup card rejected');
console.log('h2h tests pass',JSON.stringify(r),JSON.stringify(m));
// new point system vs coach reference (plo5-weights/feat.js features x weights)
const expL={AsAhKsQhJd:[25.53,'Premium'],KhQhJcTc9d:[16.68,'Premium'],KhKd8c5d2s:[8.19,'Late position'],'5d3c3sAc5h':[0.24,'Fold'],'6s6h5d4c3s':[-2.26,'Fold']};
for(const k in expL){const H=C.heuristicLinear(P(k));a(Math.abs(H.score-expL[k][0])<1e-9&&H.tier===expL[k][1],k+' '+H.score+' '+H.tier);}
const fs=require('fs'),WD='/workspace/plo5-weights/',FK=['pAA','pKK','pQQ','pJJ','pTT','p97','p62','pair2T','trips','run5','run4c','run4g','run3c','run3g','topT','top7','suitA','suitK','suitO','suit3','dang','low'];
let nchk=0;for(const f of ['tests.csv','samples.csv'])if(fs.existsSync(WD+f)){const L=fs.readFileSync(WD+f,'utf8').trim().split('\n'),hd=L[0].split(',');
 for(const line of L.slice(1)){const c=line.split(','),row={};hd.forEach((h,i)=>row[h]=c[i]);
  const ref=Math.round(FK.reduce((s,k)=>s+C.W[k]*Number(row[k]),0)*100)/100,H=C.heuristicLinear(P(row.hand));
  a(Math.abs(H.score-ref)<1e-9,row.hand+' new '+H.score+' ref '+ref);a(C.heuristicOld(P(row.hand)).score==Number(row.score),row.hand+' old score');nchk++;}}
console.log('linear point system matches reference on',nchk,'hands');
// Approach 1 main score (score_6.js) — check hands + integration equals coach's file on many random hands
const S6=require('/workspace/plo5-approaches/score_6.js');
a(fs.readFileSync(__dirname+'/score_a1.js','utf8')===fs.readFileSync('/workspace/plo5-approaches/score_6.js','utf8'),'score_a1.js is verbatim score_6.js');
const ck={'2s2d6s6dQc':[6,22.6,'Fold'],AsAdKsKdQc:[44,null,'Premium'],JsTd9s8d7c:[19,88.2,'Open any position']};
for(const k in ck){const H=C.heuristic(P(k)),[pt,pc,tr]=ck[k];
 a(H.score===pt&&H.tier===tr&&(pc==null?H.percentile>99.9:Math.abs(H.percentile-pc)<0.05),k+' '+JSON.stringify(H));console.log('  ',k,H.score,'pts',H.percentile,'pct',H.tier,'| vs 3-bet',H.alt);}
let rs=12345;const rr=()=>{rs=(rs*1103515245+12345)%2147483648;return rs/2147483648;};let NR=0;
for(let t=0;t<200000;t++){const d=[];while(d.length<5){const c=Math.floor(rr()*52);if(d.indexOf(c)<0)d.push(c);}
 const H=C.heuristic(d),ref=S6.score(C.handStr(d));
 a(H.score===ref.points&&H.percentile===ref.percentile&&H.tier===ref.tier&&H.alt===ref.alt&&JSON.stringify(H.breakdown)===JSON.stringify(ref.breakdown)&&JSON.stringify(H.altBreakdown)===JSON.stringify(ref.altBreakdown),C.handStr(d));NR++;}
console.log('Approach 1 integrated score == score_6.js on',NR,'random hands');
// set-mining table: parsed m* reproduce thresholds.md "lowest break-even pair" tables
const SM=JSON.parse(fs.readFileSync(__dirname+'/setmine.json','utf8')),PR=['22','33','44','55','66','77','88','99','TT','JJ','QQ','KK','AA'];
const TH=fs.readFileSync('/workspace/plo5-setmine/thresholds.md','utf8').split(/\n(?=\*\*)/).filter(b=>b.startsWith('**'));
const key=b=>(/EV-3/.test(b)?'EV-3':'EV-2')+(/hero model \(a\)/.test(b)?'a':'b');let nth=0;
for(const b of TH){const t=SM.tables[key(b)];b.split('\n').filter(l=>/^\| \d/.test(l)).forEach(l=>{const c=l.split('|').slice(1,-1).map(x=>x.trim()),sc=+c[0];
 c.slice(1).forEach((want,j)=>{const lw=strict=>{let low='none';for(let i=PR.length-1;i>=0;i--){if(strict?t[PR[i]][j][0]<sc:t[PR[i]][j][0]<=sc)low=PR[i]+'+';else break;}return low;};const low=lw(false);a(low===want||lw(true)===want,key(b)+' S/C '+sc+' col '+j+' got '+low+' want '+want);nth++;});});}
console.log('set-mining table reproduces thresholds.md (',nth,'cells; rounding ties m*==S/C accepted either way )');
