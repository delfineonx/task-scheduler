// Copyright (c) 2025 chmod (NlGBOB)
// Copyright (c) 2025 delfineonx
// This product includes "Task Scheduler" created by chmod and delfineonx.
// Licensed under the Apache License, Version 2.0 (the "License").

globalThis.TS={
default:{tag:null},C:[null,null,"__default__",1,()=>{},{},null,null,null,[{str:null,style:{color:"#ff9d87",fontWeight:"600",fontSize:"1rem"}}]],K:{},L:{},P:{},o:1,a:0,t:0,D:{get 1(){let S=TS,C=S.C,L=S.L,P=S.P,s=S.K[S.t],K=s[0],G=s[1],O=s[2],i=S.a,g=undefined,l=!1;try{while(!0){C[0]=K[i];g=G[i];l=+(L[g]===O[i]);C[!(O[i]>P[g])<<2]();delete C[5+l*2][g];delete C[5+l*3][g];i=++S.a;if(i<K.length){continue}break}delete S.K[S.t];S.a=0}catch(e){let r=+(e.message==="out of memory");C[9][0].str="Scheduler ["+g+"]: "+e.name+": "+e.message+".";S.D[(r^1)<<1];delete C[5+l*2][g];delete C[5+l*3][g];delete C[5+r][S.t];S.a*=r^1;S.D[r^1]}},get 2(){api.broadcastMessage(TS.C[9]);++TS.a}},
run(k,y,a){let S=TS;C=S.C,d=(y|0)*.02|0;d=d&~(d>>31);let t=S.t+d;C[0]=[[],[],[]];C[1]=S.K[t];let s=S.K[t]=C[+!!C[1]];C[1]=null;let i=s[0].length;C[0]=k;s[0][i]=C[(typeof k!=="function")<<2];C[0]=a;let g=s[1][i]=C[(typeof a!=="string")<<1];S.L[g]=s[2][i]=++S.o;C[0]=S.P[g];S.P[g]=C[!C[0]*3]},
stop(g){TS.C[5+!!TS.P[g]*3][g]=++TS.o;delete TS.C[5][g]},tick(){TS.D[+!!TS.K[TS.t]];TS.t++}
};
{const C=TS.C;const d=TS.default;C[6]=TS.K;C[7]=TS.L;C[8]=TS.P;Object.defineProperty(d,"tag",{configurable:!1,get:()=>{return C[2]},set:v=>{C[2]=v}})}
Object.seal(TS);
globalThis.Scheduler=TS;
void 0;
