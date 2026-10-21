// ==CORE== shared by page, worker and node
function eval5(a,b,c,d,e){
  var r0=a>>2,r1=b>>2,r2=c>>2,r3=d>>2,r4=e>>2;
  var fl=((a&3)===(b&3))&&((a&3)===(c&3))&&((a&3)===(d&3))&&((a&3)===(e&3));
  var cnt=[0,0,0,0,0,0,0,0,0,0,0,0,0];cnt[r0]++;cnt[r1]++;cnt[r2]++;cnt[r3]++;cnt[r4]++;
  var mask=(1<<r0)|(1<<r1)|(1<<r2)|(1<<r3)|(1<<r4);
  var st=-1;
  if(((mask>>>0)&(mask-1))!==0 || true){
    var bits=0;for(var i=0;i<13;i++)if(cnt[i])bits++;
    if(bits===5){
      for(var h=12;h>=4;h--){var m=31<<(h-4);if((mask&m)===m){st=h;break;}}
      if(st<0&&mask===0x100F)st=3; // wheel A2345
    }
  }
  if(st>=0&&fl)return 8e6+st;
  // build kicker key ordered by (count desc, rank desc)
  var q=-1,t=-1,p1=-1,p2=-1,k=0;
  for(var r=12;r>=0;r--){var n=cnt[r];if(n===4)q=r;else if(n===3)t=r;else if(n===2){if(p1<0)p1=r;else p2=r;}}
  var kick=0;
  if(q>=0){for(r=12;r>=0;r--)if(cnt[r]===1)kick=r;return 7e6+q*13+kick;}
  if(t>=0&&p1>=0)return 6e6+t*13+p1;
  if(fl){kick=0;for(r=12;r>=0;r--)if(cnt[r])kick=kick*13+r;return 5e6+kick;}
  if(st>=0)return 4e6+st;
  kick=0;for(r=12;r>=0;r--)if(cnt[r]===1)kick=kick*13+r;
  if(t>=0)return 3e6+t*169+kick;
  if(p2>=0)return 2e6+(p1*13+p2)*13+kick;
  if(p1>=0)return 1e6+p1*2197+kick;
  return kick;
}
var H2=[],B3=[];
(function(){for(var i=0;i<5;i++)for(var j=i+1;j<5;j++){H2.push([i,j]);for(var k=j+1;k<5;k++)B3.push([i,j,k]);}})();
function evalPLO(h,b){var best=0;for(var x=0;x<10;x++){var p=H2[x],c1=h[p[0]],c2=h[p[1]];for(var y=0;y<10;y++){var q=B3[y];var v=eval5(c1,c2,b[q[0]],b[q[1]],b[q[2]]);if(v>best)best=v;}}return best;}
// Monte Carlo: equity of hero vs nOpp random hands; ties split
function mcEquity(hero,nOpp,trials,rnd){
  rnd=rnd||Math.random;var used=new Array(52).fill(false);hero.forEach(function(c){used[c]=true;});
  var deck=[];for(var c=0;c<52;c++)if(!used[c])deck.push(c);
  var need=5*nOpp+5,eq=0,n=deck.length,opp=[],board=[0,0,0,0,0];
  for(var o=0;o<nOpp;o++)opp.push([0,0,0,0,0]);
  for(var t=0;t<trials;t++){
    for(var i=0;i<need;i++){var j=i+Math.floor(rnd()*(n-i));var tmp=deck[i];deck[i]=deck[j];deck[j]=tmp;}
    var idx=0;for(o=0;o<nOpp;o++)for(i=0;i<5;i++)opp[o][i]=deck[idx++];
    for(i=0;i<5;i++)board[i]=deck[idx++];
    var hv=evalPLO(hero,board),win=true,ties=1;
    for(o=0;o<nOpp;o++){var v=evalPLO(opp[o],board);if(v>hv){win=false;break;}if(v===hv)ties++;}
    if(win)eq+=1/ties;
  }
  return eq/trials;
}
// Head-to-head: exact hands h1 vs h2, random board. Returns {w1,w2,t} fractions
function mcH2H(h1,h2,trials,rnd){
  rnd=rnd||Math.random;var used=new Array(52).fill(false);
  h1.concat(h2).forEach(function(c){if(used[c])throw new Error('duplicate card '+c);used[c]=true;});
  var deck=[];for(var c=0;c<52;c++)if(!used[c])deck.push(c);
  var n=deck.length,b=[0,0,0,0,0],w1=0,w2=0,t=0;
  for(var k=0;k<trials;k++){
    for(var i=0;i<5;i++){var j=i+Math.floor(rnd()*(n-i));var tmp=deck[i];deck[i]=deck[j];deck[j]=tmp;b[i]=deck[i];}
    var v1=evalPLO(h1,b),v2=evalPLO(h2,b);if(v1>v2)w1++;else if(v2>v1)w2++;else t++;
  }
  return {w1:w1/trials,w2:w2/trials,t:t/trials};
}
var RANKS='23456789TJQKA',SUITS='shdc';
function parseHand(s){var out=[];for(var i=0;i<s.length;i+=2)out.push(RANKS.indexOf(s[i])*4+SUITS.indexOf(s[i+1]));return out;}
function heuristicOld(h){
  var br=[],score=0,rk=h.map(function(c){return c>>2;}),su=h.map(function(c){return c&3;});
  var cnt=new Array(13).fill(0);rk.forEach(function(r){cnt[r]++;});
  var used=[false,false,false,false,false];
  function add(l,v){if(v){br.push([l,v]);score+=v;}}
  // pairs
  var prs=[];for(var r=12;r>=0;r--)if(cnt[r]>=2)prs.push(r);
  if(prs.length){var p=prs[0],pv=p===12?8:p===11?6:p===10?5:p===9?4:p===8?3:p>=5?2:1;add('Pair '+RANKS[p]+RANKS[p],pv);
    if(prs.length>1&&prs[1]>=8)add('Second pair '+RANKS[prs[1]]+RANKS[prs[1]],1);
    rk.forEach(function(r,i){if(cnt[r]>=2)used[i]=true;});}
  for(r=0;r<13;r++)if(cnt[r]>=3)add((cnt[r]===4?'Quads ':'Trips ')+RANKS[r],-3);
  // rundown: values 1..14 (ace both)
  var has={};rk.forEach(function(r){has[r+2]=true;if(r===12)has[1]=true;});
  var cats=[[5,4,8,'5-card rundown'],[4,3,6,'4 connected'],[4,4,4,'4 with one gap'],[3,2,2,'3 connected'],[3,3,1,'3 with one gap']];
  var run=null;
  for(var ci=0;ci<cats.length&&!run;ci++){var need=cats[ci][0],span=cats[ci][1];
    for(var top=14;top>=1+span&&!run;top--){if(!has[top]||!has[top-span])continue;var c=0,mem=[];for(var v=top-span;v<=top;v++)if(has[v]){c++;mem.push(v);}
      if(c>=need)run={cat:cats[ci],top:top,mem:mem};}}
  if(run){add(run.cat[3]+' ('+run.mem.slice().reverse().map(function(v){return RANKS[(v===1?14:v)-2];}).join('')+')',run.cat[2]);
    if(run.top>=10)add('Run top card T+',2);else if(run.top<=7)add('Run top card ≤7',-2);
    rk.forEach(function(r,i){if(run.mem.indexOf(r+2)>=0||(r===12&&run.mem.indexOf(1)>=0))used[i]=true;});}
  // suits
  var sc=[0,0,0,0];su.forEach(function(s){sc[s]++;});
  var groups=[];for(var s=0;s<4;s++)if(sc[s]>=2){var mx=-1;h.forEach(function(c){if((c&3)===s&&(c>>2)>mx)mx=c>>2;});groups.push({s:s,top:mx,n:sc[s],v:mx===12?3:mx===11?1:0.5});}
  groups.sort(function(a,b){return b.v-a.v||b.top-a.top;});
  groups.slice(0,2).forEach(function(g,i){add((i?'Second suit ':'Suited ')+RANKS[g.top]+'-high '+'♠♥♦♣'[g.s],g.v);});
  groups.forEach(function(g){if(g.n>=3)add(g.n+' of one suit','♠♥♦♣'[g.s]&&-1);su.forEach(function(x,i){if(x===g.s)used[i]=true;});});
  var aceSuit={};groups.forEach(function(g){if(g.top===12)aceSuit[g.s]=true;});
  var dang=used.filter(function(u){return !u;}).length;if(dang)add(dang+' dangler'+(dang>1?'s':''),-2*dang);
  var low=0;h.forEach(function(c){if((c>>2)<=3&&!aceSuit[c&3])low++;});if(low)add(low+' card'+(low>1?'s':'')+' 5 or lower',-low);
  var tier=score>=16?'Premium':score>=12?'Open any position':score>=8?'Late position':score>=5?'Limp/call in position':'Fold';
  return {score:score,breakdown:br,tier:tier};
}
// New PLO5 point system (coach refit vs 4-way equity, 1 pt ~ 0.67pp). Features = old breakdown items (see plo5-weights/feat.js).
var W={pAA:8,pKK:5.9,pQQ:5.55,pJJ:3.95,pTT:2.77,p97:0,p62:-0.46,pair2T:4.39,trips:-12,run5:3.23,run4c:0.78,run4g:0.58,run3c:-0.31,run3g:-0.31,topT:3.05,top7:-0.44,suitA:6.85,suitK:6.39,suitO:4.01,suit3:-1.56,dang:0,low:-2.05};
function heuristicLinear(h){
  var o=heuristicOld(h),br=[],score=0;
  o.breakdown.forEach(function(b){var l=b[0],v=b[1],k,n=1;
    if(l.indexOf('Pair ')===0){var p=RANKS.indexOf(l[5]);k=p===12?'pAA':p===11?'pKK':p===10?'pQQ':p===9?'pJJ':p===8?'pTT':p>=5?'p97':'p62';}
    else if(l.indexOf('Second pair')===0)k='pair2T';
    else if(l.indexOf('Trips')===0||l.indexOf('Quads')===0)k='trips';
    else if(l.indexOf('5-card')===0)k='run5';else if(l.indexOf('4 connected')===0)k='run4c';else if(l.indexOf('4 with')===0)k='run4g';
    else if(l.indexOf('3 connected')===0)k='run3c';else if(l.indexOf('3 with')===0)k='run3g';
    else if(l==='Run top card T+')k='topT';else if(l.indexOf('Run top card')===0)k='top7';
    else if(l.indexOf('Suited')===0||l.indexOf('Second suit')===0)k=v===3?'suitA':v===1?'suitK':'suitO';
    else if(/of one suit/.test(l))k='suit3';else if(/dangler/.test(l)){k='dang';n=-v/2;}else if(/5 or lower/.test(l)){k='low';n=-v;l=l.replace('5 or lower','2–5 (not in A-suit)');}
    var pts=Math.round(W[k]*n*100)/100;score+=W[k]*n;br.push([l,pts,k]);});
  score=Math.round(score*100)/100;
  var tier=score>=12.3?'Premium':score>=8.6?'Open any position':score>=5.5?'Late position':score>=3.4?'Limp/call in position':'Fold';
  return {score:score,breakdown:br,tier:tier,old:o};
}
// MAIN SCORE: coach's "Approach 1 patched additive" + raised-pot alt (score_a1.js = plo5-approaches/score_6.js verbatim)
var A1=(typeof A1!=='undefined'&&A1)?A1:require('./score_a1.js');
function handStr(h){return h.map(function(c){return RANKS[c>>2]+SUITS[c&3];}).join('');}
function heuristic(h){var r=A1.score(handStr(h));
  return {score:r.points,percentile:r.percentile,tier:r.tier,breakdown:r.breakdown,alt:r.alt,altBreakdown:r.altBreakdown,linear:heuristicLinear(h).score};}
if(typeof module!=='undefined')module.exports={eval5:eval5,evalPLO:evalPLO,mcEquity:mcEquity,parseHand:parseHand,heuristic:heuristic,heuristicLinear:heuristicLinear,heuristicOld:heuristicOld,handStr:handStr,W:W,mcH2H:mcH2H};
// ==ENDCORE==
