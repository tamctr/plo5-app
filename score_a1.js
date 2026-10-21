// PLO5 preflop points — HYBRID: Approach 1 (patched additive) for opening/entering + raised-pot adjustment (3 rules)
// alt = raised-pot points: use when facing a raise/3-bet from a tight range (fitted to HU equity vs top-25% openers and vs AA+3 random).
// Built 2026-10-21 by /workspace/plo5-approaches/build.py. Weights fitted on simulated equities (see report.md).
// score(hand) -> {points, percentile, tier, breakdown}. hand: "AsAhKsQhJd" | "As Ah Ks Qh Jd" | array of card strings.
// percentile = share of all 2,598,960 PLO5 hands scoring fewer points (ties count half), exact enumeration.
// shared helpers (inlined into each scorer)
const R='23456789TJQKA',S='shdc';
function parse(h){if(Array.isArray(h))h=h.join('');h=h.replace(/[\s,]/g,'');if(h.length!==10)throw new Error('need 5 cards');
 const r=[],s=[];for(let i=0;i<10;i+=2){const a=R.indexOf(h[i].toUpperCase()),b=S.indexOf(h[i+1].toLowerCase());if(a<0||b<0)throw new Error('bad card '+h.substr(i,2));r.push(a);s.push(b);}
 if(new Set(r.map((x,i)=>x*4+s[i])).size!==5)throw new Error('duplicate card');return [r,s];}
function info(r,s){const n=r.length,cnt=Array(13).fill(0);r.forEach(x=>cnt[x]++);
 const prs=[];for(let x=12;x>=0;x--)if(cnt[x]>=2)prs.push(x);
 const groups=[];for(let su=0;su<4;su++){const m=[];for(let i=0;i<n;i++)if(s[i]===su)m.push(i);if(m.length>=2){let top=-1;m.forEach(i=>{if(r[i]>top)top=r[i];});groups.push({su,top,n:m.length,m});}}
 groups.sort((a,b)=>b.top-a.top||b.n-a.n);
 // best 5-rank window (ace plays 1 and 14); ties -> higher window
 const has=new Set(r.map(x=>x+2));if(cnt[12])has.add(1);let best=0,bw=0;
 for(let lo=10;lo>=1;lo--){let k=0;for(let v=lo;v<lo+5;v++)if(has.has(v))k++;if(k>best){best=k;bw=lo;}}
 const inWin=i=>{const v=r[i]+2;return (v>=bw&&v<bw+5)||(r[i]===12&&bw===1);};
 return {cnt,prs,groups,best,bw,inWin};}
function plevel(p){return p===12?'A':p===11?'K':p===10?'Q':p===9?'J':p===8?'T':p>=5?'97':'62';}

// Approach 1: patched additive
const F1=['pA','pK','pQ','pJ','pT','p97','p62','p2hi','p2mid','p2lo','trips','tripsHi','quads',
 's1A','s1K','s1Q','s1T','s1L','s2A','s2K','s2Q','s2T','s2L','s3','s4','pairSuit',
 'run5','run4','run3','runHi','runLo','hA','hK','hQ','hJ','hT','lowDang','hiDang','AAds','AAdang','KKds','tripsFH','lowTwoPair','tripsConn'];
const L1={pA:'Top pair AA',pK:'Top pair KK',pQ:'Top pair QQ',pJ:'Top pair JJ',pT:'Top pair TT',p97:'Top pair 99-77',p62:'Top pair 66-22',
 p2hi:'Second pair TT+',p2mid:'Second pair 99-66',p2lo:'Second pair 55-22',trips:'Trips (dead 3rd card)',tripsHi:'Trips are TTT+',quads:'Quads',
 s1A:'Best suit A-high',s1K:'Best suit K-high',s1Q:'Best suit Q/J-high',s1T:'Best suit T-8-high',s1L:'Best suit 7-high or lower',
 s2A:'Second suit A-high',s2K:'Second suit K-high',s2Q:'Second suit Q/J-high',s2T:'Second suit T-8-high',s2L:'Second suit 7-high or lower',
 s3:'3 cards in one suit',s4:'4+ cards in one suit',pairSuit:'Suit made only by paired cards',
 run5:'5 ranks in a 5-rank window',run4:'4 ranks in a 5-rank window',run3:'3 ranks in a 5-rank window',runHi:'Run window tops at Q+',runLo:'Run window tops at 7 or lower',
 hA:'Has an Ace',hK:'Has a King',hQ:'Has a Queen',hJ:'Has a Jack',hT:'Has a Ten',lowDang:'Low dangler (2-6, unpaired, unsuited, outside run)',hiDang:'Dangler 7+',
 AAds:'AA and double-suited',tripsFH:'Trips + another pair (full-house shape)',tripsConn:'Trips rank sits inside a 3+ card run',lowTwoPair:'Two pair, both 99 or lower',AAdang:'AA + each dangler',KKds:'KK and double-suited'};
function feat1(r,s){const I=info(r,s),f={};F1.forEach(k=>f[k]=0);const {cnt,prs,groups}=I;
 if(prs.length){f['p'+plevel(prs[0])]=1;if(prs.length>1){const q=prs[1];f[q>=8?'p2hi':q>=4?'p2mid':'p2lo']=1;}}
 for(let x=0;x<13;x++){if(cnt[x]===3){f.trips++;if(x>=8)f.tripsHi++;}if(cnt[x]===4)f.quads++;}
 const lv=t=>t===12?'A':t===11?'K':t>=9?'Q':t>=6?'T':'L';
 if(groups[0])f['s1'+lv(groups[0].top)]=1;if(groups[1])f['s2'+lv(groups[1].top)]=1;
 groups.forEach(g=>{if(g.n===3)f.s3++;if(g.n>=4)f.s4++;if(g.m.every(i=>cnt[r[i]]>=2))f.pairSuit++;});
 if(I.best>=3){f['run'+I.best]=1;const top=I.bw+4;if(top>=12)f.runHi=1;if(top<=7)f.runLo=1;}
 [['hA',12],['hK',11],['hQ',10],['hJ',9],['hT',8]].forEach(([k,x])=>{if(cnt[x])f[k]=1;});
 const suited=new Set();groups.forEach(g=>g.m.forEach(i=>suited.add(i)));let dang=0;
 for(let i=0;i<5;i++){if(cnt[r[i]]>=2||suited.has(i)||(I.best>=3&&I.inWin(i)))continue;dang++;if(r[i]<=4)f.lowDang++;else f.hiDang++;}
 if(f.trips&&prs.length>1)f.tripsFH=1;if(f.trips&&I.best>=3){for(let x=0;x<13;x++)if(cnt[x]===3){const i=r.indexOf(x);if(I.inWin(i))f.tripsConn=1;}}if(prs.length>1&&prs[0]<=7&&!f.trips)f.lowTwoPair=1;
 const ds=groups.length>=2?1:0;if(prs[0]===12){f.AAds=ds;f.AAdang=dang;}if(prs[0]===11)f.KKds=ds;
 return f;}

const W={"pA": 12, "pK": 9, "pQ": 7, "pJ": 5, "pT": 4, "p97": 3, "p62": -1, "p2hi": 6, "p2mid": 5, "p2lo": 2, "trips": -18, "tripsHi": 3, "quads": -36, "s1A": 5, "s1K": 4, "s1Q": 3, "s1T": 1, "s1L": 0, "s2A": 10, "s2K": 6, "s2Q": 5, "s2T": 4, "s2L": 3, "s3": -2, "s4": -4, "pairSuit": 0, "run5": 7, "run4": 4, "run3": 2, "runHi": 0, "runLo": -4, "hA": 3, "hK": 2, "hQ": 2, "hJ": 2, "hT": 3, "lowDang": 0, "hiDang": 1, "AAds": 2, "AAdang": -1, "KKds": 1, "tripsFH": 6, "lowTwoPair": -1, "tripsConn": 2};
const WC={};
const PCT={"-37": 0.002, "-36": 0.005, "-35": 0.005, "-34": 0.005, "-33": 0.006, "-32": 0.009, "-31": 0.011, "-30": 0.012, "-29": 0.012, "-28": 0.014, "-27": 0.015, "-26": 0.016, "-25": 0.017, "-24": 0.018, "-23": 0.019, "-22": 0.019, "-21": 0.03, "-20": 0.05, "-19": 0.079, "-18": 0.121, "-17": 0.155, "-16": 0.236, "-15": 0.363, "-14": 0.467, "-13": 0.543, "-12": 0.62, "-11": 0.746, "-10": 0.899, "-9": 0.997, "-8": 1.057, "-7": 1.146, "-6": 1.254, "-5": 1.36, "-4": 1.518, "-3": 1.767, "-2": 2.181, "-1": 2.816, "0": 3.781, "1": 5.303, "2": 7.258, "3": 9.742, "4": 13.115, "5": 17.474, "6": 22.582, "7": 27.785, "8": 33.583, "9": 39.82, "10": 46.082, "11": 52.518, "12": 58.692, "13": 64.615, "14": 69.918, "15": 74.498, "16": 78.326, "17": 81.931, "18": 85.398, "19": 88.177, "20": 90.563, "21": 92.316, "22": 93.59, "23": 94.674, "24": 95.58, "25": 96.422, "26": 97.024, "27": 97.459, "28": 97.813, "29": 98.104, "30": 98.398, "31": 98.638, "32": 98.849, "33": 99.065, "34": 99.301, "35": 99.497, "36": 99.59, "37": 99.684, "38": 99.781, "39": 99.866, "40": 99.931, "41": 99.959, "42": 99.97, "43": 99.978, "44": 99.988, "45": 99.996};
const CUT={"Premium": 20, "Open any position": 16, "Late position": 12, "Limp/call": 10}; // minimum points for each tier (Premium>=90th pct, Open>=75, Late>=55, Limp>=40)
function tier(p){return p>=90?'Premium':p>=75?'Open any position':p>=55?'Late position':p>=40?'Limp/call':'Fold';}
function pts(hand){const [r,s]=parse(hand);const f=feat1(r,s);let points=0;const breakdown=[];
 for(const k of F1){const v=(f[k]||0)*(W[k]||0);if(v){points+=v;breakdown.push([L1[k]+(f[k]>1?' x'+f[k]:''),v]);}}
 return {points,breakdown};}
const ADJ={"AA": 40, "DS": 7, "SP": -7};
function rp(hand){const [r,s]=parse(hand);const f=feat1(r,s);const a={AA:f.pA,DS:f.s2A+f.s2K+f.s2Q+f.s2T+f.s2L,SP:f.pT+f.p97+f.p62};
 const LB={AA:'Raised pot: AA',DS:'Raised pot: double-suited',SP:'Raised pot: best pair TT or lower'};let v=0;const bd=[];
 for(const k in ADJ){const x=a[k]*ADJ[k];if(x){v+=x;bd.push([LB[k],x]);}}return {adj:v,bd};}
function score(hand){const {points,breakdown}=pts(hand);const R2=rp(hand);const percentile=PCT[points]!==undefined?PCT[points]:(points<MINP?0:100);return {points,percentile,tier:tier(percentile),breakdown,alt:points+R2.adj,altBreakdown:R2.bd};}
const MINP=-37,MAXP=45;
module.exports={score,rp,ADJ,pts,W,WC,PCT,CUT,MINP,MAXP,tier,parse};
