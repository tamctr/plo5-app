const C=require('./core.js');const [seed,n,tr]=process.argv.slice(2).map(Number);
let s=seed;const rnd=()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648;};
const out=[];for(let i=0;i<n;i++){const d=[...Array(52).keys()];for(let j=0;j<5;j++){const k=j+Math.floor(Math.random()*(52-j));[d[j],d[k]]=[d[k],d[j]];}
const h=d.slice(0,5);out.push([C.mcEquity(h,3,tr),C.heuristic(h).score]);}
console.log(JSON.stringify(out));
