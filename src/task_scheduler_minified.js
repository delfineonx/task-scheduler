// Copyright (c) 2025 chmod (NlGBOB)
// Copyright (c) 2025 delfineonx
// This product includes "Task Scheduler" created by chmod and delfineonx.
// Licensed under the Apache License, Version 2.0 (the "License").

{
const S={default:{tag:null},C:[null,null,"__default__",1,()=>{},"Scheduler: Critical Error: tasks overflow.",null,null,null,null,{},[{str:null,style:{color:"#ff9d87",fontWeight:"600",fontSize:"1rem"}}]],T:{},L:{},P:{},o:1,a:0,t:0,D:{get 1(){let C=S.C,L=S.L,P=S.P,s=S.T[S.t],K=s[0],G=s[1],O=s[2],i=S.a,g=void 0,l=!0,k,r;try{do{C[0]=K[i];g=G[i];l=+(L[g]!==O[i]);C[!(O[i]>P[g])<<2]();delete C[8+(l<<1)][g];delete C[9+l][g];i=++S.a}while(i<K.length);delete S.T[S.t];S.a=0}catch(e){k=e.stack;r=(e.message==="out of memory"&k[7]+k[8]+k[9]==="run")^1;C[0]="Scheduler ["+g+"]: "+e.name+": "+e.message+".";C[11][0].str=C[(r^1)*5];api.broadcastMessage(S.C[11]);C[6+(r^1)*4].a++;delete C[10].a;delete C[8+(l<<1)][g];delete C[9+l][g];delete C[7+r*3][S.t];S.a*=r;S.D[r]}}},run(k,y,a){let C=S.C,d=((y|0)*.02)|0;d=d&~(d>>31);let t=S.t+d;C[0]=[[],[],[]];C[1]=S.T[t];let s=S.T[t]=C[+!!C[1]];C[1]=null;let i=s[0].length;C[0]=k;s[0][i]=C[(typeof k!=="function")<<2];C[0]=a;let g=s[1][i]=C[(typeof a!=="string")<<1];S.L[g]=s[2][i]=++S.o;C[0]=S.P[g];S.P[g]=C[!C[0]*3]},stop(g){S.C[9+!S.P[g]][g]=++S.o;delete S.C[10][g]},tick(){S.D[+!!S.T[S.t]];S.t++}};
let C=S.C;C[6]=S;C[7]=S.T;C[8]=S.L;C[9]=S.P;Object.defineProperty(S.default,"tag",{configurable:!1,get:()=>{return C[2]},set:v=>{C[2]=v}});
Object.seal(S);globalThis.Scheduler=globalThis.TS=S;void 0
}

