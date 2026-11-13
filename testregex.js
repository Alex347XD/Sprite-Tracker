const s = '{id:"water",...ne,summonCost:100}';
console.log(s.replace(/\.\.\.ne,?/g, ''));
console.log('done');