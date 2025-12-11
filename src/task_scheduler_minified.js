// Copyright (c) 2025 delfineonx, chmod, FrostyCaveman
// This product includes "Task Scheduler" created by delfineonx, chmod, FrostyCaveman.
// Licensed under the Apache License, Version 2.0.

{
let TS_={run:null,stop:null,tick:null},F=()=>{},U="__default__",K={},C={},P={},O=0,T=0,A=0,I=1,S=0,L=!1,N=0;
TS_.run=(k,d,g)=>{g??=U;d=(d|0)*.02|0;d=d&~(d>>31);let t=T+d,q=K[t],i=0;if(!q){q=K[t]=[[k],[g],[++O]];C[g]=(C[g]|0)+1}else{i=q[0].length;q[0][i]=k;q[1][i]=g;q[2][i]=++O;C[g]=(C[g]|0)+1}if(!d){k();q[0][i]=F}return()=>{if(K[t]){K[t][0][i]=F}}};
TS_.stop=g=>{g??=U;if(C[g]>0){P[g]=++O}};
TS_.tick=()=>{let q=K[T+=I];I=0;if(q){let k=q[0],g=q[1],o=q[2],a,p;do{try{while(p=o[A]){a=g[A];if(S){L=P[a]>p;N=C[a]--}S=0;if(N<2){delete C[a];delete P[a]}if(!L){k[A]()}S=1;A++}delete K[T];A=0;break}catch(e){S=1;A++;if((e.message!=="out of memory")||(e.stack[7]+e.stack[8]+e.stack[9]!=="run")){api.broadcastMessage("Scheduler ["+a+"]: "+e.name+": "+e.message+".",{color:"#ff9d87"})}else{K={};C={};P={};A=0;I=1;S=0;api.broadcastMessage("Scheduler: Memory Error: tasks overflow.",{color:"#ff9d87"});break}}}while(!0)}I=1};
Object.freeze(TS_);
globalThis.TS=TS_;
void 0
}

