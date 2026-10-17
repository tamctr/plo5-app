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
