// Copyright (c) 2025 delfineonx, chmod, FrostyCaveman
// This product includes "Task Scheduler" created by delfineonx, chmod, FrostyCaveman.
// Licensed under the Apache License, Version 2.0.

{
let TS_={run:null,stop:null,tick:null},U="__default__",K={},C={},P={},O=0,T=0,A=0,R=!1,L=!1,N=0;
TS_.run=(k,d,g)=>{g??=U;d=(d|0)*.02|0;let t=T+(d&~(d>>31)),l=K[t];if(!l){K[t]=[[k],[g],[++O]];C[g]=(C[g]|0)+1}else{let i=l[0].length;l[0][i]=k;l[1][i]=g;l[2][i]=++O;C[g]=(C[g]|0)+1}};
TS_.stop=g=>{g??=U;if((C[g]|0)>0){P[g]=++O}};
TS_.tick=()=>{let l=K[T];if(l){let k=l[0],g=l[1],p=l[2],a,o;do{try{while(o=p[A]){a=g[A];if(!R){L=P[a]>o;N=C[a]--}R=!0;if(N<2){delete C[a];delete P[a]}if(!L){k[A]()}R=!1;A++}delete K[T];A=0;break}catch(e){R=!1;A++;if((e.message!=="out of memory")||(e.stack[7]+e.stack[8]+e.stack[9]!=="run")){api.broadcastMessage("Scheduler ["+a+"]: "+e.name+": "+e.message+".",{color:"#ff9d87"})}else{K={};C={};P={};A=0;api.broadcastMessage("Scheduler: Memory Error: tasks overflow.",{color:"#ff9d87"});break}}}while(!0)}T++};
Object.freeze(TS_);
globalThis.TS=TS_;
void 0
}

