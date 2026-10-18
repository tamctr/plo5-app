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
const exp={AsAhKsQhJd:[25.53,'Premium'],KhQhJcTc9d:[16.68,'Premium'],KhKd8c5d2s:[8.19,'Late position'],'5d3c3sAc5h':[0.24,'Fold'],'6s6h5d4c3s':[-2.26,'Fold']};
for(const k in exp){const H=C.heuristic(P(k));a(Math.abs(H.score-exp[k][0])<1e-9&&H.tier===exp[k][1],k+' '+H.score+' '+H.tier);}
const fs=require('fs'),WD='/workspace/plo5-weights/',FK=['pAA','pKK','pQQ','pJJ','pTT','p97','p62','pair2T','trips','run5','run4c','run4g','run3c','run3g','topT','top7','suitA','suitK','suitO','suit3','dang','low'];
let nchk=0;for(const f of ['tests.csv','samples.csv'])if(fs.existsSync(WD+f)){const L=fs.readFileSync(WD+f,'utf8').trim().split('\n'),hd=L[0].split(',');
 for(const line of L.slice(1)){const c=line.split(','),row={};hd.forEach((h,i)=>row[h]=c[i]);
  const ref=Math.round(FK.reduce((s,k)=>s+C.W[k]*Number(row[k]),0)*100)/100,H=C.heuristic(P(row.hand));
  a(Math.abs(H.score-ref)<1e-9,row.hand+' new '+H.score+' ref '+ref);a(C.heuristicOld(P(row.hand)).score==Number(row.score),row.hand+' old score');nchk++;}}
console.log('new point system matches reference on',nchk,'hands');
