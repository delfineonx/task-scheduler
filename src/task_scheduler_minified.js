// Copyright (c) 2025 delfineonx, chmod, FrostyCaveman
// This product includes "Task Scheduler" created by delfineonx, chmod, FrostyCaveman.
// Licensed under the Apache License, Version 2.0.

{
let TS_={currentTick:0,run:null,stop:null,isGroupActive:null,cancel:null,isTaskActive:null,getGroupId:null,tick:null},U="__default__",K=Object.create(null),C=Object.create(null),S=Object.create(null),O=1,T=0,A=0,I=1,E=1,V=!1,L=!0;
TS_.run=(f,d,g)=>{g??=U;d=(d|0)*.02|0;d=d&~(d>>31);let n=T+d+(!d&I),q=K[n],c=C[g],i=0;if(!q&&d){if(c===void 0){c=1;S[g]=1}else if(~c&1){c++}K[n]=[[f],[g],[++O]];C[g]=c+2}else if(q&&d){if(c===void 0){c=1;S[g]=1}else if(~c&1){c++}i=q[2].length;q[0][i]=f;q[1][i]=g;q[2][i]=++O;C[g]=c+2}else if(!I){i=-1;f()}else if(!q&&!d){if(c===void 0){c=1;S[g]=1}else if(~c&1){c++}q=K[n]=[[f],[g],[++O]];C[g]=c+2;try{f();q[2][0]=1}catch(e){q[2][0]=1;api.broadcastMessage("Scheduler ["+g+"]: "+e.name+": "+e.message+".",{color:"#ff9d87"})}}else{if(c===void 0){c=1;S[g]=1}else if(~c&1){c++}i=q[2].length;q[0][i]=f;q[1][i]=g;q[2][i]=++O;C[g]=c+2;try{f();q[2][i]=1}catch(e){q[2][i]=1;api.broadcastMessage("Scheduler ["+g+"]: "+e.name+": "+e.message+".",{color:"#ff9d87"})}}return[n,i]};
TS_.stop=g=>{g??=U;if(C[g]&1){C[g]--;S[g]=++O}};
TS_.isGroupActive=g=>{g??=U;return!!(C[g]&1)};
TS_.cancel=k=>{let q=K[k[0]],i=k[1]>>>0;if(!q||i>=q[2].length){return}q[2][i]=1};
TS_.isTaskActive=k=>{let q=K[k[0]],i=k[1]>>>0;if(!q||i>=q[2].length){return!1}return q[2][i]>S[q[1][i]]};
TS_.getGroupId=k=>{let q=K[k[0]],i=k[1]>>>0;if(!q||i>=q[1].length){return null}return q[1][i]};
TS_.tick=()=>{let q=K[TS_.currentTick=T+=I];I=0;if(q){let X=q[0],Y=q[1],Z=q[2],g,o;do{try{while(o=Z[A]){g=Y[A];if(E){V=o>S[g];L=(C[g]-=2)<2}E=0;if(L){delete C[g];delete S[g];L=!1}if(V){X[A]()}E=1;A++}delete K[T];A=0;break}catch(e){E=1;A++;api.broadcastMessage("Scheduler ["+g+"]: "+e.name+": "+e.message+".",{color:"#ff9d87"})}}while(!0)}I=1};
Object.seal(TS_);
globalThis.TS=TS_;
void 0
}

