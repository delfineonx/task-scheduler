// Copyright (c) 2025 delfineonx, chmod, FrostyCaveman
// This product includes "Task Scheduler" created by delfineonx, chmod, FrostyCaveman.
// Licensed under the Apache License, Version 2.0.

{
  let _TS={
    run:null,
    stop:null,
    tick:null
  },
  K={},
  L={},
  P={},
  o=0,
  T=0,
  a=0,
  c=!1;
  _TS.run=(f,s,g)=>{
    let d=(s|0)*.02|0,
      t=T+(d&~(d>>31)),
      l=K[t];
    if(!l){
      K[t]=[[f],[g],[++o]];
      L[g]=o
    }else{
      let i=l[0].length;
      l[0][i]=f;
      l[1][i]=g;
      l[2][i]=++o;
      L[g]=o
    }
  };
  _TS.stop=(g)=>{
    P[g]=++o
  };
  _TS.tick=()=>{
    let l=K[T];
    if(l){
      let F=l[0],
        G=l[1],
        O=l[2],
        g,
        r;
      do{
        try{
          while(r=O[a]){
            g=G[a];
            c||=r<P[g];
            if(r===L[g]){
              delete L[g];
              delete P[g]
            }
            if(!c){
              F[a]()
            }
            c=false;
            a++
          }
          delete K[T];
          a=0;
          break
        }catch(e){
          c=false;
          a++;
          if((e.message!=="out of memory")||(e.stack[7]+e.stack[8]+e.stack[9]!=="run")){
            api.broadcastMessage("Scheduler ["+g+"]: "+e.name+": "+e.message+".",{color:"#ff9d87"})
          }else{
            delete K[T];
            a=0;
            api.broadcastMessage("Scheduler: Memory Error: tasks overflow.",{color:"#ff9d87"});
            break
          }
        }
      }while(true)
    }
    T++
  };
  Object.freeze(_TS);
  globalThis.TS=_TS;
  void 0
}

