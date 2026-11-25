// round26c: one presentation clock shared by paper, camera, light and phosphor.
window.roomMotion26c??={value:0,last:null,tick(t){if(this.last!==t){if(this.last!==null)this.value+=Math.min(34,Math.max(0,t-this.last));this.last=t;}return this.value;}};
// round25-l: the existing held-sheet painter can run before room geometry.
if(matchMedia('(pointer:fine) and (min-width:801px)').matches){
 const context=JSON.parse(document.querySelector('#room-route').textContent),q=new URLSearchParams(location.search);
 let seen=false;try{seen=sessionStorage.getItem('room.newspaper.seen')==='1'}catch{}
 const key=context.key||(!q.has('computer')&&!q.has('view')&&!seen?'about':null);
 const eligible=['about','papers','contact','lab-join'].includes(key)||context.roomPath?.startsWith('/room/papers/');
 if(eligible){
  const openingURL=location.href;
  const openingTitle=document.title;
  const firstNewspaper=!context.key&&typeof window.roomLoading?.showWaitingWelcome==='function';
  const proof=window.earlyReading25={key,startedAt:performance.now(),frames:[],turns:[],errors:[],visible:false,page:Math.max(0,Number(q.get('page')||1)-1)};
  let sheetURL26b=null;let broadsheet;let worker,serial=0,state,id,size,metadata,assets={},shown=false,closed=false,painting=false,presentation=0;let resolveHandover26;const handover=new Promise(resolve=>resolveHandover26=resolve);
  let resolveRelease;const released=new Promise(resolve=>resolveRelease=resolve);
  const adjacent26b=new Map();const jobs=new Map(),shared=new Map(),originalFetch=window.fetch.bind(window);
  // Reuse source bytes across the early painter, welcome and native reader.
  window.fetch=(input,init)=>{const u=new URL(typeof input==='string'||input instanceof URL?input:input.url,location.href);if(u.origin===location.origin&&(u.pathname==='/content/about-presence.json'||u.pathname.startsWith('/content/photos/'))&&(!init?.method||init.method==='GET')){if(!shared.has(u.pathname))shared.set(u.pathname,originalFetch(input,init).then(r=>{if(!r.ok){shared.delete(u.pathname);throw Error('Reader asset HTTP '+r.status+' '+u.pathname)}return r}));return shared.get(u.pathname).then(r=>r.clone());}return originalFetch(input,init)};
  const get=async url=>{const r=await fetch(url);if(!r.ok)throw Error('Reader HTTP '+r.status+' '+url);return r.json()};
  const request=async message=>{await ready;return new Promise((resolve,reject)=>{const n=++serial;jobs.set(n,{resolve,reject});worker.postMessage({...message,job:n})})};const job=(op,extra={})=>request({id,state:{...state,page:proof.page,assets},op,size,...extra});
  const root=document.createElement('div'),sheet=document.createElement('img'),mirror=document.createElement('div'),pill=document.createElement('button'),targets=document.createElement('div');
  // round25-l: stock, ink and page proportions come from the round24 presence painter.
  // The exit uses the host's Courier, amber ink and dark capsule.
  const style=document.createElement('style');style.textContent='html[data-early-reading25] #hint,html[data-early-reading25] #scene-controls,html[data-early-reading25] #scene-legend,html[data-early-reading25] #scene-sections,html[data-early-reading25] #scene-name{visibility:hidden!important}';document.head.append(style);
  // round26-k: a complete painted page rises over the retained computer view.
  root.id='early-reader25';root.hidden=true;root.style.cssText='position:fixed;inset:0;z-index:25;overflow:hidden;background:rgba(0,0,0,.58)';
  sheet.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);height:85vh;width:auto;max-width:90vw;object-fit:contain;outline:none';sheet.tabIndex=0;sheet.setAttribute('aria-label','Read the newspaper');
  mirror.className='scene-mirror';mirror.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:normal';mirror.setAttribute('aria-live','polite');
  pill.id='early-reader25-exit';pill.style.cssText='position:absolute;right:20px;bottom:24px;border:1px solid #ead2a5;border-radius:99px;padding:8px 16px;background:#1d1b18;color:#ead2a5;font:13px Courier New,monospace';
  // round26b: move the carrier so the canvas raster never enters untransformed.
  const carrier=document.createElement('div');carrier.style.cssText='position:absolute;inset:0;will-change:transform;pointer-events:none';sheet.style.pointerEvents='auto';carrier.append(sheet);root.append(carrier,mirror,targets,pill);document.body.append(root);
  // round27-f: fetch the profile while the painter starts.
  const profileSource=['about','quotation-1','quotation-2'].includes(key)?get('/content/about-presence.json'):null;
  const rawRequest=message=>new Promise((resolve,reject)=>{const n=++serial;jobs.set(n,{resolve,reject});worker.postMessage({...message,job:n});});
  async function pageAssets(page){const result=await rawRequest({id,state:{...state,page},op:'images'});await Promise.all((result.images||[]).map(async ph=>{if(assets[ph.href])return;const r=await fetch(ph.href);if(!r.ok)throw Error('Reader photo HTTP '+r.status);const bitmap=await createImageBitmap(await r.blob());if(closed){bitmap.close();return;}assets[ph.href]=bitmap;const bytes=2*sheet.width*sheet.height*4+Object.values(assets).reduce((sum,image)=>sum+image.width*image.height*4,0)+(state.pdfImage?state.pdfImage.width*state.pdfImage.height*4:0);proof.activeSurfaceBytes=bytes;proof.surfaceBytes=Math.max(proof.surfaceBytes||0,bytes);}));}
  const ready=(async()=>{
   const response=await fetch('/bench-360/inscene/paint.worker.js');if(!response.ok)throw Error('Reader painter HTTP '+response.status);const url=URL.createObjectURL(new Blob([await response.text()],{type:'text/javascript'}));worker=new Worker(url,{type:'module'});URL.revokeObjectURL(url);worker.onmessage=({data})=>{const j=jobs.get(data.job);if(!j){data.bitmap?.close();return}jobs.delete(data.job);data.error?j.reject(Error(data.error)):j.resolve(data)};worker.onerror=e=>{for(const j of jobs.values())j.reject(Error(e.message));jobs.clear()};
   if(['about','quotation-1','quotation-2'].includes(key)){id='presence';size=[2048,1638];state={profile:await profileSource};await pageAssets(proof.page);}
   else if(key==='papers'){id='reprint';size=[1764,2352];const catalogue=await get('/bench-360/inscene/catalogues/papers.json');state={view:'contents',items:catalogue.items,records:catalogue.items,scroll:0};}
   else{const routes=await import('/bench-360/inscene/route-admission.js'),admission=routes.default[key],r=await get('/content/surfaces/records/'+(admission?.record||key)+'.json');id=key==='contact'||key==='lab-join'?'contact':'reprint';size=id==='contact'?[2352,1568]:[1764,2352];let next=r.reader?.first,html='';while(next){const batch=await get(next);for(const part of batch.parts||[]){const response=await fetch(part.href);html+=await response.text()}next=batch.next;}state={record:r,view:'item',html,readerHTML:html,fragments:[html]};
 if(id==='contact'){const body=async r=>{let next=r.reader?.first,html='';while(next){const batch=await get(next);for(const part of batch.parts||[])html+=await(await fetch(part.href)).text();next=batch.next;}return{record:r,html,readerHTML:html,fragments:[html]}};const contact=key==='contact'?r:await get('/content/surfaces/records/contact.json'),join=key==='lab-join'?r:await get('/content/surfaces/records/lab-join.json');state.contactRecord=contact;state.contactState=await body(contact);state.joinState=await body(join);state.identity=await get('/content/surfaces/records/person-albert.json');}
 if(id==='reprint'){const response=await fetch('/content/papers/'+key+'.json');if(response.ok){const pdf=await response.json();if(pdf.available&&pdf.pages?.length){state.pdf=pdf;proof.page=Math.min(proof.page,pdf.pages.length-1);const image=await fetch(pdf.pages[proof.page].reading.href);if(!image.ok)throw Error('Paper page HTTP '+image.status);state.pdfImage=await createImageBitmap(await image.blob());}}}}
   sheet.width=size[0];sheet.height=size[1];proof.activeSurfaceBytes=2*sheet.width*sheet.height*4+Object.values(assets).reduce((n,b)=>n+b.width*b.height*4,0)+(state.pdfImage?state.pdfImage.width*state.pdfImage.height*4:0);proof.surfaceBytes=proof.activeSurfaceBytes;proof.preparedAt=performance.now();
  })().catch(e=>{proof.errors.push(String(e));throw e});ready.catch(()=>{});
  function updateTargets(){targets.replaceChildren();const box=sheet.getBoundingClientRect(),pw=id==='presence'?2560:id==='contact'?3300:1536,ph=2048;
   for(const region of metadata?.regions||[]){const button=document.createElement(region.href?'a':'button');button.className='early-reader25-target'+(id==='presence'&&region.href?' newspaper-link':'');button.setAttribute('aria-label',region.label);button.style.cssText=`position:absolute;left:${box.x+region.x/pw*box.width}px;top:${box.y+region.y/ph*box.height}px;width:${region.width/pw*box.width}px;height:${region.height/ph*box.height}px;border:0;background:transparent;color:transparent;cursor:pointer`;if(region.href)button.href=region.href;button.tabIndex=region.href?0:-1;if(id==='presence'&&region.href){const mark=on=>{for(const el of targets.querySelectorAll('a'))if(el.getAttribute('href')===region.href)el.classList.toggle('newspaper-hover',on);};button.onpointerenter=()=>mark(true);button.onpointerleave=()=>mark(false);button.onfocus=()=>mark(true);button.onblur=()=>mark(false);}button.onclick=e=>{if(region.action){e.preventDefault();if(String(region.action).includes('next'))turn(1);else if(String(region.action).includes('prev'))turn(-1);else if(/^page:\d+$/.test(String(region.action)))turn(Number(String(region.action).split(':')[1])-proof.page);else if(String(region.action).startsWith('select:'))requestNative(String(region.action).slice(7));}};targets.append(button);}
  }
  async function paint(){if(painting||closed)return;painting=true;try{await ready;if(id==='presence')await pageAssets(proof.page);if(state.pdf?.available&&proof.pdfPage!==proof.page){const href=state.pdf.pages[proof.page].reading.href,response=await fetch(href);if(!response.ok)throw Error('Paper page HTTP '+response.status);state.pdfImage?.close();state.pdfImage=await createImageBitmap(await response.blob());proof.pdfPage=proof.page;}const cached26b=adjacent26b.get(proof.page);adjacent26b.delete(proof.page);const result=cached26b?await cached26b:await job('paint',{withMetadata:true,earlyBlob26b:true});if(closed){result.bitmap.close();return;}// round25b: present the worker bitmap without a second raster copy.
// round26-k: a 2D backing keeps Chrome's transformed sheet in the composited layer tree.
// round26b: a decoded image avoids Chrome's first transformed-canvas exposure.
const url26b=URL.createObjectURL(result.blob26b);sheet.src=url26b;await sheet.decode();if(sheetURL26b)URL.revokeObjectURL(sheetURL26b);sheetURL26b=url26b;
if(id==='presence'){
 try{
  if(!broadsheet){broadsheet=waitingBroadsheet();carrier.prepend(broadsheet.canvas);}
  broadsheet.draw(result.bitmap);sheet.style.opacity='0';
 }catch(error){proof.errors.push('Early paper mesh: '+error.message);}
}
result.bitmap.close();
metadata=result;proof.page=Math.max(0,Math.min(proof.page,(metadata.pages||1)-1));if(state.pdf?.available)metadata.pages=state.pdf.pages.length;mirror.innerHTML=metadata.mirror;for(const link of mirror.querySelectorAll('a,button'))link.tabIndex=-1;updateTargets();proof.paintedAt=performance.now();if(!state.pdf?.available)prepareAdjacent26b();}finally{painting=false}}
  // round26b: prepare both paper directions while the current leaf is read.
  function prepareAdjacent26b(){const count=metadata?.pages||1;if(count<2)return;const pages=[(proof.page+1)%count,(proof.page-1+count)%count];for(const [page,promise]of adjacent26b)if(!pages.includes(page)){adjacent26b.delete(page);promise.then(r=>r.bitmap.close()).catch(()=>{});}for(const page of pages)if(!adjacent26b.has(page)){const promise=(async()=>{if(id==='presence')await pageAssets(page);return job('paint',{withMetadata:true,earlyBlob26b:true,state:{...state,page,assets}});})();adjacent26b.set(page,promise);promise.catch(error=>{adjacent26b.delete(page);proof.errors.push('Neighbor preparation: '+error.message)});}}
  async function show(){
   if(closed||shown||firstNewspaper&&window.benchProof?.establishedAt)return;
   shown=true;
   const current=++presentation,stillShowing=()=>!closed&&presentation===current;
   if(firstNewspaper)proof.dismissed=false;
   else document.querySelector('#load-hint')?.remove();
   try{
    const handover=(async()=>{
     while(!window.benchProof?.welcomeHandover26d&&stillShowing())await new Promise(resolve=>requestAnimationFrame(resolve));
     if(stillShowing())await window.benchProof?.welcomeHandover26d?.();
    })();
    await prepared;
    if(window.benchProof?.roomReady)await handover;
    else void handover.catch(error=>proof.errors.push('Welcome handover: '+error.message));
    if(!stillShowing())return;
    root.inert=false;sheet.style.transform='translate(-50%,-50%)';sheet.style.top='50%';carrier.style.transform='translate3d(0,92.5vh,0)';root.hidden=false;root.style.pointerEvents='auto';pill.hidden=false;document.documentElement.dataset.earlyReading25='';root.style.background='rgba(0,0,0,0)';// round26c: the backing dim shares the capped sheet clock. // round26b: dim behind the paper only.

 // round26-k: reserve the sheet's composite layer before its 420 ms rise.
 sheet.style.top='50%';carrier.style.willChange='transform';carrier.style.transform='translate3d(0,92.5vh,0)';
 // round27-f: prepared already reserved this decoded sheet for two frames.
 if(closed)return;
 // round26b: explicit frame presentation also records the first visible paper edge.
 // round26c: the top edge starts at the lower frame edge, already facing the reader.
 sheet.style.transform='translate(-50%,-50%)';const startRise26c=92.5;
 let start26b=null,lastRiseFrame=null,presenceElapsed=0;
 const ease26b=x=>{let lo=0,hi=1,t=x;for(let i=0;i<18;i++){const v=3*(1-t)*(1-t)*t*.45+3*(1-t)*t*t*.2+t*t*t;if(v<x)lo=t;else hi=t;t=(lo+hi)/2;}return 3*(1-t)*t*t+t*t*t;};
 const rise={cancel(){},finished:new Promise(resolve=>{function frame(now){
  if(!stillShowing()){resolve();return;}
  const clock=roomMotion26c.tick(now);
  if(start26b===null)start26b=clock;
  // Advance the newspaper by at most one display interval after a delayed composite.
  if(lastRiseFrame!==null)presenceElapsed+=Math.min(1000/60,now-lastRiseFrame);
  lastRiseFrame=now;
  const elapsed=id==='presence'?presenceElapsed:clock-start26b;
  const duration=id==='presence'?880:520;
  const t=matchMedia('(prefers-reduced-motion:reduce)').matches?1:Math.min(1,elapsed/duration);
 // round26d: retain 520 ms with cubic velocity ends and a bounded middle speed.
 const edge=.33,span=1-edge,g=x=>x*x*x*(1-.5*x),u=t<edge?edge*g(t/edge)/span:t>1-edge?1-edge*g((1-t)/edge)/span:(t-.5*edge)/span;carrier.style.transform=`translate3d(0,${startRise26c*(1-u)}vh,0)`;
 const falloff=ease26b(Math.min(1,elapsed/400));
 root.style.background=`rgba(0,0,0,${(id==='presence'?.375:.18)*falloff})`;
 if(id==='presence')root.style.backdropFilter=`blur(${2.5*falloff}px)`;if(t<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);})};
 rise.finished.then(()=>{if(!stillShowing())return;carrier.style.transform='none';rise.cancel();document.title=(key==='about'?'About':key==='contact'?'Contact':key==='papers'?'Papers':state.record?.title||key)+' | 「应可钧」Kejun Albert Ying';if(key==='about')history.replaceState(history.state,'','/room/about/'+(proof.page?'?page='+(proof.page+1):''));proof.readableAt=performance.now();updateTargets();sheet.focus({preventScroll:true});resolveHandover26();}).catch(()=>resolveHandover26());
 proof.visible=true;
 if(!window.benchProof?.roomReady){
  const intro=window.roomLoading;
  if(intro?.showEarlyReader)intro.showEarlyReader(firstNewspaper);
  else if(intro){intro.dismissWelcome();document.querySelector('#load').hidden=true;}
 }else if(firstNewspaper)window.roomLoading?.showEarlyReader(true);
 dispatchEvent(new Event('early-reader25-ready'));}catch(e){resolveHandover26();shown=false;proof.errors.push(String(e));dispatchEvent(new CustomEvent('early-reader25-ready',{detail:{error:String(e)}}));console.warn('Early reader unavailable',e)}}
  // round26c: protect the old leaf before binding the next decoded image.
  async function turn(delta){if(!proof.visible||painting||proof.turning)return;const started=performance.now();window.roomPageTurning25=true;proof.turning=true;let old;try{
   old=document.createElement('img');old.width=sheet.width;old.height=sheet.height;old.src=sheet.src;await old.decode();old.style.cssText=sheet.style.cssText;old.style.pointerEvents='none';old.style.opacity='1';old.style.zIndex='1';carrier.append(old);
   proof.page=(proof.page+delta+(metadata?.pages||1))%(metadata?.pages||1);await paint();let start=null;const direction=Math.sign(delta)||1;
   await new Promise(resolve=>{function frame(t){if(closed){resolve();return;}const clock=roomMotion26c.tick(t);if(start===null)start=clock;const f=Math.min(1,(clock-start)/220),u=f*f*(3-2*f);old.style.clipPath=direction>0?`inset(0 0 0 ${u*100}%)`:`inset(0 ${u*100}% 0 0)`;old.style.translate=`${-direction*u*sheet.getBoundingClientRect().width}px`;if(f<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame)});
   proof.turns.push({started,finished:performance.now(),page:proof.page});
  }finally{old?.remove();proof.turning=false;window.roomPageTurning25=false;}}

  function requestNative(next){window.benchProof?.queueRoomIntent(()=>window.inScene.open(next),next);}
  function release(){if(closed)return;resolveHandover26();resolveRelease();closed=true;for(const promise of adjacent26b.values())promise.then(r=>r.bitmap.close()).catch(()=>{});adjacent26b.clear();proof.turning=false;window.roomPageTurning25=false;proof.activeSurfaceBytes=0;proof.visible=false;proof.releasedAt=performance.now();delete document.documentElement.dataset.earlyReading25;style.remove();if(sheetURL26b)URL.revokeObjectURL(sheetURL26b);broadsheet?.release();sheet.src='';sheet.width=sheet.height=1;root.remove();if(!proof.workerBorrowed)worker?.terminate();state?.pdfImage?.close();for(const image of Object.values(assets))image.close();assets={};shared.clear();}
  function dismiss(){
   proof.dismissed=true;
   if(firstNewspaper){
    history.replaceState(history.state,'',openingURL);
    document.title=openingTitle;
    if(!window.benchProof?.establishedAt){
     presentation++;
     shown=false;
     root.hidden=true;
     root.inert=true;
     proof.visible=false;
     delete proof.readableAt;
     delete document.documentElement.dataset.earlyReading25;
     resolveHandover26();
     window.roomLoading?.showWaitingWelcome();
     return;
    }
   }
   if(!context.key){
    sessionStorage.setItem('room.newspaper.seen','1');
    if(!firstNewspaper)history.replaceState(history.state,'',openingURL);
   }
   release();
  }
  if(firstNewspaper)addEventListener('room-established',()=>{
   if(proof.dismissed){
    sessionStorage.setItem('room.newspaper.seen','1');
    release();
   }
  },{once:true});
  function outsideSheet(event){
   if(event.target!==root)return false;
   const bounds=sheet.getBoundingClientRect();
   return event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom;
  }
  let waitingLook=null;
  document.addEventListener('pointerdown',event=>{
   if(proof.visible&&!window.benchProof?.establishedAt&&event.isPrimary&&event.button===0&&outsideSheet(event)){
    waitingLook={id:event.pointerId,x:event.clientX,y:event.clientY};
   }
  },true);
  document.addEventListener('pointermove',event=>{
   if(waitingLook?.id!==event.pointerId||!proof.visible)return;
   if(Math.hypot(event.clientX-waitingLook.x,event.clientY-waitingLook.y)<=6&&!proof.pendingLook)return;
   if(firstNewspaper){
    waitingLook=null;
    dismiss();
    event.preventDefault();event.stopImmediatePropagation();
    return;
   }
   proof.pendingLook={x:waitingLook.x,y:waitingLook.y,toX:event.clientX,toY:event.clientY};
   root.style.opacity='0';
   event.preventDefault();event.stopImmediatePropagation();
  },true);
  for(const type of ['pointerup','pointercancel'])document.addEventListener(type,event=>{
   if(waitingLook?.id!==event.pointerId)return;
   waitingLook=null;
   if(!proof.pendingLook||!proof.visible)return;
   event.preventDefault();event.stopImmediatePropagation();
   dismiss();
   window.benchProof?.interaction?.applyWaitingLook();
  },true);
  function adoptBroadsheet(){
   if(!broadsheet||window.inScene?.held!=='profile'||matchMedia('(prefers-reduced-motion:reduce)').matches){release();return;}
   if(proof.adoptionStarted)return;
   proof.adoptionStarted=performance.now();
   let first=null;
   function frame(now){
    if(closed)return;
    first??=now;
    const t=Math.min(1,(now-first)/260),u=t*t*(3-2*t);
    proof.adoption=u;
    root.style.background=`rgba(0,0,0,${1-.625/(1-.375*u)})`;
    root.style.backdropFilter=`blur(${2.5*Math.sqrt(1-u*u)}px)`;
    carrier.style.opacity=1-u;
    pill.style.opacity=1-u;
    if(t<1)requestAnimationFrame(frame);else release();
   }
   requestAnimationFrame(frame);
  }
  // Native adoption starts after the first rise reaches its reading pose.
  const update=()=>{if(closed)return;const a=window.benchProof,loading=window.roomLoading?.snapshot;if(!shown&&!proof.dismissed&&loading?.welcomeCompletedAt&&loading?.skipped)void show();pill.textContent=firstNewspaper||a?.roomReady?'Put the paper down · Esc':'Room arriving · '+Math.floor((loading?.fraction||0)*100)+'%';pill.setAttribute('aria-disabled',String(!firstNewspaper&&!a?.roomReady));if(proof.visible&&proof.readableAt&&!painting&&!window.roomPageTurning25&&a?.roomReady&&window.inScene&&!window.inSceneProof.active&&a.establishedAt){if(['presence','reprint'].includes(id)&&proof.page!==inScene.state.page&&window.inScene.resumeEarlyReader25){if(!proof.handoffPending){proof.handoffPending=true;void inScene.resumeEarlyReader25(proof.page).then(result=>{if(result===false)release()}).finally(()=>{proof.handoffPending=false;update()});}}else{adoptBroadsheet();}}if(!closed)setTimeout(update,80)};
  pill.onclick=()=>{
   if(firstNewspaper){dismiss();if(window.benchProof?.establishedAt)void window.inScene?.home({push:false});return;}
   if(!window.benchProof?.roomReady)return;
   release();void window.inScene?.home({push:false});
  };
  document.addEventListener('keydown',e=>{
   if(!proof.visible)return;
   if(e.code==='Space'&&!window.benchProof?.rearReady&&!e.target.closest?.('a,button')){
    e.preventDefault();e.stopImmediatePropagation();return;
   }
   if(!['Escape','ArrowRight','ArrowLeft','PageDown','PageUp'].includes(e.key))return;
   e.preventDefault();e.stopImmediatePropagation();
   if(e.key==='Escape'){
    delete proof.pendingLook;
    dismiss();
    if(window.benchProof?.establishedAt&&(window.inScene?.mode||window.inSceneProof?.active===key)){
     void window.inScene.home({push:false});
    }
   }else void turn(['ArrowLeft','PageUp'].includes(e.key)?-1:1);
  },true);
  sheet.onclick=e=>{if(e.target===sheet)void turn(1)};addEventListener('resize',resizePaper);function resizePaper(){if(!closed&&shown){broadsheet?.draw();updateTargets();}}// round25d: prepare the newspaper before Home without waiting for the welcome.
  const prepared=paint().then(async()=>{if(closed||shown)return;root.hidden=false;root.inert=true;carrier.style.transform='translate3d(0,101vh,0)';root.style.background='transparent';root.style.pointerEvents='none';pill.hidden=true;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));proof.prewarmedAt26c=performance.now();});prepared.catch(()=>{});window.roomEarlyReader={show,turn,release,dismiss,outsideSheet,proof,prepared,handover,released,firstNewspaper,get opening(){return shown&&!closed;},adoptPainter(){if(closed||!proof.preparedAt||proof.errors.length)return null;proof.workerBorrowed=true;return{request}}};update();
 }
}

// The waiting introduction can draw the broadsheet before Three is admitted.
// Its small context only owns the current print and the three stock leaves.
function waitingBroadsheet(){
 const canvas=document.createElement('canvas');
 canvas.setAttribute('aria-hidden','true');
 canvas.style.cssText='position:absolute;left:50%;top:50%;width:min(108.54vh,90vw);height:auto;aspect-ratio:1.25;transform:translate(-50%,-50%);pointer-events:none';
 const gl=canvas.getContext('webgl2',{alpha:true,antialias:false,depth:true,preserveDrawingBuffer:false});
 if(!gl)throw Error('Early broadsheet WebGL 2 context unavailable');
 const vertex=`#version 300 es
 in vec2 point;
 uniform float leaf;
 out vec2 uv;
 out vec3 panel;
 out vec3 normal;
 void main(){
  uv=point;
  float x=2.*uv.x-1., y=2.*uv.y-1., f=uv.y-.535;
  float ridge=.0033*exp(-abs(f)*165.);
  float bow=.012*(1.-x*x)+ridge;
  panel=vec3(x*.5,-y*.4,bow-leaf*.009);
  normal=normalize(vec3(.048*x,-sign(f)*.68*exp(-abs(f)*165.),1.));
  float depth=1.+.029*y+.038*x-2.*panel.z;
  float rim=1.-smoothstep(.004,.028,min(uv.y,1.-uv.y));
  float edge=sign(-y)*rim*(.017*(1.-x*x)-.008*x);
  gl_Position=vec4(.974*x-.025+leaf*.022,(-.987*y+edge)*depth-.007-leaf*.020,.12+leaf*.18,depth);
 }`;
 const fragment=`#version 300 es
 precision highp float;
 in vec2 uv;
 in vec3 panel,normal;
 uniform sampler2D image;
 uniform float leaf;
 out vec4 color;
 float hash21(vec2 p){
  vec3 h=fract(vec3(p.xyx)*.1031);h+=dot(h,h.yzx+33.33);return fract((h.x+h.y)*h.z);
 }
 float noise21(vec2 p){
  vec2 i=floor(p), f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+1.),f.x),f.y);
 }
 void main(){
  vec2 edge=min(uv,1.-uv);
  if(length(max(vec2(.0015)-edge,0.))>.0015)discard;
  float cold=max(0.,dot(normalize(normal),normalize(vec3(.48,.70,-1.8)-panel)));
  float warm=max(0.,dot(normalize(normal),normalize(vec3(-.72,.12,-.20)-panel)));
  float fold=uv.y-.535;
  float crease=.046*exp(-2.773*(((fold+.0052)/.0081)*((fold+.0052)/.0081)))
   -.111*exp(-2.773*((fold/.00328)*(fold/.00328)))-.030*exp(-((fold/.019)*(fold/.019)));
  float grain=.015*(2.*hash21(floor(uv*vec2(2250.,1860.)))-1.)+.020*(2.*noise21(uv*vec2(18.,15.))-1.);
  vec3 illumination=clamp(vec3(.976+.018*cold+.025*warm+grain+crease)
   +vec3(-.008,-.004,.004),vec3(.80),vec3(1.));
  vec3 stock=vec3(.922,.902,.851);
  vec3 print=leaf<.5?texture(image,uv).rgb:stock;
  float exposed=min(1.-uv.x,1.-uv.y);
  if(leaf>.5)illumination*=.86-.13*smoothstep(.001,.016,exposed);
  if(min(edge.x,edge.y)<.0015)illumination*=mix(.72,1.10,step(min(uv.x,uv.y),.002));
  color=vec4(print*illumination,1.);
 }`;
 function compile(type,source){
  const shader=gl.createShader(type);
  gl.shaderSource(shader,source);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));
  return shader;
 }
 const program=gl.createProgram(),vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
 gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
 gl.deleteShader(vs);gl.deleteShader(fs);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);
 const rows=[0,.12,.26,.40,.521,.528,.532,.535,.538,.542,.549,.70,.85,1],points=[];
 for(let j=1;j<rows.length;j++)for(let i=0;i<24;i++){
  const x=i/24,r=(i+1)/24,y=rows[j-1],b=rows[j];
  points.push(x,y,r,y,r,b,x,y,r,b,x,b);
 }
 const mesh=gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER,mesh);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);
 const point=gl.getAttribLocation(program,'point'), leaf=gl.getUniformLocation(program,'leaf');
 gl.enableVertexAttribArray(point);gl.vertexAttribPointer(point,2,gl.FLOAT,false,0,0);
 const ink=gl.createTexture();
 gl.bindTexture(gl.TEXTURE_2D,ink);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 function draw(print){
  const width=Math.min(innerWidth*.9,innerHeight*1.0854);
  const pixelWidth=Math.round(width*Math.min(2,devicePixelRatio));
  if(canvas.width!==pixelWidth){
   canvas.width=pixelWidth;canvas.height=Math.round(pixelWidth*.8);
  }
  if(print){
   gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,print);
  }
  gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);
  gl.enable(gl.DEPTH_TEST);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  for(let i=2;i>=0;i--){gl.uniform1f(leaf,i);gl.drawArrays(gl.TRIANGLES,0,points.length/2);}
 }
 function release(){
  gl.deleteTexture(ink);gl.deleteBuffer(mesh);gl.deleteProgram(program);
  gl.getExtension('WEBGL_lose_context')?.loseContext();canvas.remove();
 }
 return {canvas,draw,release};
}
