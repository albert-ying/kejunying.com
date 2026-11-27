const INTRO_DATA={"welcome":{"text":"Hello, I'm Kejun Albert Ying (应可钧), an incoming assistant professor. My lab opens in the Bay Area in January 2027.\n\nI'm a postdoctoral fellow with Tony Wyss-Coray at Stanford University and David Baker at the University of Washington, and I earned my Ph.D. at Harvard Medical School with Vadim Gladyshev.\n\nI build AI for biology and aging: foundation models and world models of biological data, and agents that discover aging interventions.\n\nOur latest work is HealthFlux, a world model of human health that predicts 1,256 diseases and death over twenty years.\n\nSolve aging first, and with time, we'll solve all remaining challenges of humanity.","lines":[{"text":"Hello, I'm Kejun Albert Ying (应可钧), an incoming assistant professor. My lab opens in the Bay Area in January 2027.","photos":[{"key":"harvard-talk","at":0}]},{"text":"I'm a postdoctoral fellow with Tony Wyss-Coray at Stanford University and David Baker at the University of Washington, and I earned my Ph.D. at Harvard Medical School with Vadim Gladyshev.","photos":[{"key":"stanford","at":50},{"key":"uw","at":93},{"key":"harvard","at":144}]},{"text":"I build AI for biology and aging: foundation models and world models of biological data, and agents that discover aging interventions.","photos":[]},{"text":"Our latest work is HealthFlux, a world model of human health that predicts 1,256 diseases and death over twenty years.","photos":[]},{"text":"Solve aging first, and with time, we'll solve all remaining challenges of humanity.","photos":[]}],"photos":{"harvard-talk":"/content/photos/harvard-talk-colour.webp","stanford":"/content/photos/stanford-colour.webp","uw":"/content/photos/uw-colour.webp","harvard":"/content/photos/harvard-colour.webp"}},"slides":[{"kind":"photo","key":"harvard-talk","image":"/content/photos/harvard-talk-colour.webp"}],"previewPoster":[[970,156],[1387,109],[1386,377],[970,381]],"poster":[[861.653661,97.149897],[1393.453592,51.000301],[1411.705563,363.060417],[865.128321,380.7183]]};// Projector stock and mono type follow painters/slides.js. The 3.5 s cadence
// and 160 ms shutter follow the recorded reference loading and work strips.
// Content is injected from the frozen home block and round 11 records at build.
// round17: resting projection reuses this composition without loading progress.
let photoPaperGrain; // round21-o: reused low-strength print grain
function paintIntro(ctx, slide, state) {
 const W=768,H=512,ink='#ece5d5',blue='#0c247a';
 ctx.clearRect(0,0,W,H);ctx.fillStyle=state.dark?'#000':blue;ctx.fillRect(0,0,W,H);
 if(state.dark)return;const glow=ctx.createRadialGradient(384,245,0,384,245,460);glow.addColorStop(0,'#202d40');glow.addColorStop(1,'#0d1524');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
 ctx.textBaseline='alphabetic';ctx.textAlign='left';
 function text(value,x,y,width,size=34,leading=size*1.23){
  ctx.font=size+'px "Courier New", "Songti SC", monospace';ctx.fillStyle=ink;
  for(const paragraph of String(value||'').split('\n')){
   let row='';for(const word of paragraph.split(/\s+/)){const next=row?row+' '+word:word;if(row&&ctx.measureText(next).width>width){ctx.fillText(row,x,y);y+=leading;row=word}else row=next}ctx.fillText(row,x,y);y+=leading;
  }return y;
 }
 // round17b: a two-line typed name leads at Home; supporting text keeps its size.
 if(state.rest&&slide.kind==='name'){
  ctx.font='700 110px "Courier New", monospace';ctx.fillStyle=ink;
  const rows=['Kejun Albert','Ying'];for(const [i,row]of rows.entries()){ctx.save();ctx.translate(48,166+i*120);ctx.scale(Math.min(1,674/ctx.measureText(row).width),1);ctx.fillText(row,0,0);ctx.restore();}
  text('应可钧',48,359,674,47);text(slide.role,48,438,674,31);return;
 }
 // round19-p: the print itself fills the projector; its border is photographic stock.
 // round21-o: original ARDD figure fills the screen above its caption line.
 if(slide.kind==='talk-figure'&&state.image){const im=state.image,s=Math.min(W/im.width,448/im.height);ctx.drawImage(im,(W-im.width*s)/2,(448-im.height*s)/2,im.width*s,im.height*s);ctx.font='19px "Courier New", monospace';let title=slide.title;const suffix=' · 6th TimePie Longevity Forum · 2025';while(title&&ctx.measureText(title+'…'+suffix).width>720)title=title.slice(0,-1);ctx.fillStyle=ink;ctx.fillText(title.trimEnd()+'…'+suffix,24,491);return;}
 if(slide.kind==='photo'&&state.image){const img=state.image,s=Math.min(720/img.width,470/img.height);const x=(W-img.width*s)/2,y=(H-img.height*s)/2,w=img.width*s,h=img.height*s;ctx.save();ctx.filter='blur(.16px)';ctx.drawImage(img,x,y,w,h);ctx.filter='none';ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.04;ctx.fillStyle='#ebe6d9';ctx.fillRect(x,y,w,h);if(!photoPaperGrain){photoPaperGrain=new OffscreenCanvas(128,128);const q=photoPaperGrain.getContext('2d');q.fillStyle='#777';q.globalAlpha=.025;let seed=204819;for(let i=0;i<750;i++){seed=(seed*1664525+1013904223)>>>0;q.fillRect(seed%128,(seed>>>8)%128,1,1);}}ctx.globalAlpha=.35;ctx.fillStyle=ctx.createPattern(photoPaperGrain,'repeat');ctx.fillRect(x,y,w,h);ctx.restore();return;}
 if(state.ready){text(slide.name,48,154,674,47);text(slide.role,48,251,674,29);}
 else if(slide.kind==='name'){text(slide.name,48,155,674,47);text(slide.role,48,252,674,31);}
 else if(slide.kind==='field'){text(slide.title,48,137,674,41,57);}
 else if(slide.kind==='news'){
  text(slide.title,48,65,674,36);let y=111;
  for(const item of slide.items){text(item.date,48,y,140,18);y=text(item.text,190,y,530,20,23)+18;}
 }else if(slide.kind==='theme'){
  text(slide.title,48,89,674,38);if(slide.subtitle!==slide.title)text(slide.subtitle,48,143,674,29); // round16-ux
  if(state.image){const s=Math.min(630/state.image.width,(state.rest?338:232)/state.image.height);ctx.drawImage(state.image,(W-state.image.width*s)/2,166,state.image.width*s,state.image.height*s);}
 }else{
  text(slide.title,48,83,674,slide.kind==='paper'?30:32,38);
  if(state.image){const s=Math.min(660/state.image.width,(state.rest?275:207)/state.image.height);ctx.drawImage(state.image,(W-state.image.width*s)/2,159,state.image.width*s,state.image.height*s);}
  text(slide.meta,48,state.rest?476:391,674,22);
 }
 // Transfer bytes and the current assembly phase are separate facts.
 if(!state.ready&&!state.rest){
  ctx.fillStyle=ink;ctx.globalAlpha=.3;ctx.fillRect(48,414,594,3);ctx.globalAlpha=1;ctx.fillRect(48,414,594*state.fraction,3);
  text(Math.floor(Math.min(state.ready?1:.99,state.fraction)*100)+'%',660,426,90,27);
  text((state.fraction===1?'Downloaded · ':'')+state.phase,48,452,690,21);
 }
}

// round17
// Inlined by build-shell.py so the first two slides need no asset request.
(()=>{
 // round26-k: canonical early-reader addresses do not discard runtime diagnostics.
 window.roomStartSearch26??=location.search;
 const $=s=>document.querySelector(s),root=document.documentElement,box=$('#load'),body=$('#load-body'),canvas=$('#load-slide'),ctx=canvas.getContext('2d'),phase=$('#load-phase'),bytes=$('#load-bytes'),progress=$('#load-progress'),enter=$('#room-skip'),choice=$('#room-load-choice'),sound=$('#load-sound');
 const deck=INTRO_DATA.slides,name=deck[0],start=performance.now(),images=new Map(),events=[];
 // round21-o: finish remaining characters at 3x after readiness; skip queues safely.
 let readyAt=0,readyTyped=0,skipped=false,welcomeCompletedAt=0,welcomeRetained=true;
 let readingEarly=false,arrivingAtBench=false,entryRequested=false,enterClick,entryTimer,paintCallback,geometryCallback,timer,previous=-1,lastPaint=0,lastImage='',native=false,ready=false,stopped=false,first=false,fraction=0,phaseText='Setting up the room',current=0,dark=false,revision=0,preloading=false,lastSlideAt=start,hasChanged=false;
 const arrivalProgress=$('#room-arrival-progress');
 function updateArrivalProgress(){
  if(arrivalProgress.hidden)return;
  const label='Room arriving · '+(ready?100:Math.min(99,Math.floor(fraction*100)))+'%';
  if(arrivalProgress.textContent!==label)arrivalProgress.textContent=label;
 }
 function showArrivalProgress(){
  arrivalProgress.hidden=false;
  box.dataset.arrivalProgress='';
  updateArrivalProgress();
 }
 const phone=window.roomPhone35;
 $('#load-text').href=phone.textURL;
 const audio=import('/bench-360/inscene/sound.js').then(({createSound})=>{
  const soundEngine=window.roomSound??=createSound();
  soundEngine.mountCapsule(sound);
  return soundEngine;
 });
 audio.catch(console.warn);
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 // round14-welcome: this capture listener also sees gestures before modules load.
 let soundEnabled=true;
 try{soundEnabled=localStorage.getItem('room.sound')!=='off'}catch{}
 window.roomGestureSeen=false;
 function soundLabel(){sound.textContent=soundEnabled?'Sound':'Sound off';sound.dataset.sound=soundEnabled&&!window.roomGestureSeen?'waiting':soundEnabled?'ready':'off';sound.setAttribute('aria-pressed','false');sound.title=soundEnabled?'Switch sound off':'Switch sound on'}
 function gesture(event){if(!event.isTrusted||event.type==='keydown'&&event.repeat)return;window.roomGestureSeen=true;if(!window.roomSound)soundLabel();dispatchEvent(new Event('room-gesture'))}
 addEventListener('pointerdown',gesture,true);addEventListener('keydown',gesture,true);
 sound.onclick=()=>{soundEnabled=!soundEnabled;try{localStorage.setItem('room.sound',soundEnabled?'on':'off')}catch{}soundLabel()};soundLabel();
 // The frozen CRT's Courier raster and phosphor colours continue into the room.
 const welcomeCanvas=$('#load-welcome'),welcomeCtx=welcomeCanvas.getContext('2d'),welcomeText=INTRO_DATA.welcome.text;
 $('#load-welcome-text').textContent=welcomeText;
 let welcomeLayout;
 // round19-p: photograph changes follow the exact typed line and character.
 function welcomePhoto(count=typed){let offset=0,key=null;for(const line of INTRO_DATA.welcome.lines||[]){if(count<offset)break;for(const photo of line.photos||[])if(count>=offset+photo.at)key=photo.key;offset+=line.text.length+2;}return key;}

 // round26d: independent opacity layers avoid the filtered-group compositor stall.
 const phosphor26=document.createElement('div');phosphor26.id='welcome-phosphor26';
 phosphor26.style.cssText='position:absolute;left:0;top:0;width:1024px;height:768px;transform-origin:0 0;pointer-events:none;border-radius:5% / 4%;overflow:hidden;background:radial-gradient(ellipse at 50% 44%,#101d17,#050b08);color:#b5d9c6;font:25px/32px Menlo,Consolas,monospace';
 const glyphStyle26=document.createElement('style');glyphStyle26.textContent='@keyframes phosphor26{from{opacity:0}to{opacity:1}}@keyframes cursor26{0%,49%{opacity:1}50%,100%{opacity:0}}';document.head.append(glyphStyle26);
 const typedText=document.createElement('div');
 typedText.style.cssText='position:absolute;left:62px;top:44px;width:900px;text-shadow:0 0 1.8px #b5d9c680';
 const welcomeGlyphs=[];
 let introOffset=0;
 for(const paragraph of welcomeText.split('\n\n')){
  const row=document.createElement('p');row.style.cssText='margin:0 0 32px;white-space:pre-wrap';row.setAttribute('aria-hidden','true');
  for(const ch of paragraph){
   if(ch===' '){row.append(ch);introOffset++;continue;}
   const glyph=document.createElement('span');glyph.textContent=ch;
   glyph.style.cssText=`opacity:0;animation:phosphor26 60ms linear ${introOffset/60}s forwards`;
   row.append(glyph);welcomeGlyphs.push(glyph);introOffset++;
  }
  typedText.append(row);introOffset+=2;
 }
 const cursor26=document.createElement('span');cursor26.hidden=true;
 const percentage26=document.createElement('span');percentage26.dataset.welcomePercentage='';percentage26.setAttribute('aria-hidden','true');percentage26.style.cssText='position:absolute;right:0;bottom:0';
 const prompt28=document.createElement('p');prompt28.style.cssText='position:relative;margin:0;white-space:nowrap';
 const waiting28=document.createElement('span');waiting28.style.visibility='hidden';waiting28.innerHTML='Tap to come in <span aria-hidden="true" style="animation:cursor26 1060ms linear infinite">▌</span>';
 prompt28.append(waiting28,percentage26);typedText.append(prompt28);phosphor26.append(typedText,cursor26);
 let awaiting28=false,revealed28=false;box.append(phosphor26);welcomeCanvas.style.opacity='0';
 const y26=44+prompt28.offsetTop;
 const invitationNode33r=waiting28,enterInvitation33r=$('#load-hint');
 invitationNode33r.parentNode.insertBefore(enterInvitation33r,invitationNode33r);
 enterInvitation33r.replaceChildren(...invitationNode33r.childNodes);invitationNode33r.replaceWith();
 enterInvitation33r.hidden=true;enterInvitation33r.setAttribute('aria-label','Tap to come in');
 enterInvitation33r.style.cssText=invitationNode33r.style.cssText+';position:static;margin:0;border:0;background:none;padding:0;color:inherit;font:inherit;pointer-events:auto;cursor:pointer;white-space:nowrap;visibility:visible';
 let welcomePaintCallback,welcomeGeometry,typed=-1,welcomeRevision=0,lastCursor,lastFraction=-1; // round17-views
 function fitWelcome(corners){if(!corners){const s=Math.min(innerWidth/1440,innerHeight/900),dx=(innerWidth-1440*s)/2,dy=(innerHeight-900*s)/2;corners=[[330.768,157.5],[1109.232,157.5],[1109.232,742.5],[330.768,742.5]] /* round21-o: rectangle from the loading camera */.map(([x,y])=>[dx+(720+(x-720)*1.36923-24)*s,dy+(450+(y-450)*1.36923+38)*s])}fit(corners,welcomeCanvas,1024,768);phosphor26.style.transform=welcomeCanvas.style.transform}
 // round20-desk: flat baselines with at most .75 canvas px of edge curvature.
 // round25d: cache glyph advances without another canvas or texture.
 const glyphWidths25=new Map();let paintedLines25=[],paintedCursor25=-1,paintedSize25='';
 function tubeLine(ctx,line,x,y){let offset=0;for(const ch of line){const key=ctx.font+'|'+ch;let w=glyphWidths25.get(key);if(w===undefined){w=ctx.measureText(ch).width;glyphWidths25.set(key,w)}const u=Math.min(1,Math.abs((x+offset-642)/642)),edge=Math.max(0,(u-.7)/.3);ctx.fillText(ch,x+offset,y+.75*edge*edge);offset+=w;}}
 function drawWelcome(){
  if(!welcomeRetained)return; // round26d: dismissed glyphs never repaint the blank cover.
  const now=performance.now(),count=Math.min(welcomeText.length,skipped||revealed28?welcomeText.length:Math.floor((now-start)*60/1000)),cursor=count===welcomeText.length&&Math.floor((now-start)/530)%2===0;
  if(count===typed&&cursor===lastCursor&&lastFraction===fraction)return;typed=count;lastCursor=cursor;lastFraction=fraction; // round17-views
  const ctx=welcomeCtx;ctx.setTransform(welcomeCanvas.width/1024,0,0,welcomeCanvas.height/768,0,0);const canvasSize25=welcomeCanvas.width+'/'+welcomeCanvas.height,full25=paintedSize25!==canvasSize25;if(full25){paintedSize25=canvasSize25;paintedLines25=[];paintedCursor25=-1;}ctx.shadowBlur=0;const glass=ctx.createRadialGradient(512,340,120,512,384,650);glass.addColorStop(0,'#101d17');glass.addColorStop(1,'#050b08');if(full25){ctx.fillStyle=glass;ctx.fillRect(0,0,1024,768);}ctx.fillStyle='#b5d9c6';ctx.shadowColor='#b5d9c680';ctx.shadowBlur=1.8;ctx.font='25px Menlo,Consolas,monospace';ctx.textBaseline='top';
  const lines=[];for(const para of welcomeText.slice(0,count).split('\n')){let line='';for(const word of para.split(' ')){const next=line?line+' '+word:word;if(ctx.measureText(next).width>900&&line){lines.push(line);line=word}else line=next}lines.push(line)}
  welcomeLayout={rows:lines.length,visibleRows:lines.length,font:25,lineHeight:32,horizontalScale:1,xHeight:ctx.measureText('x').actualBoundingBoxAscent+ctx.measureText('x').actualBoundingBoxDescent};
  // round25d: repaint only changed lines and the cursor on the existing glass.
  const visible=lines,cursorRow25=cursor?visible.length-1:-1;
  for(let i=0;i<Math.max(visible.length,paintedLines25.length);i++)if(full25||visible[i]!==paintedLines25[i]||i===paintedCursor25||i===cursorRow25){ctx.shadowBlur=0;ctx.fillStyle=glass;ctx.fillRect(0,42+i*32,1024,32);ctx.shadowBlur=1.8;ctx.fillStyle='#b5d9c6';if(visible[i]!==undefined)tubeLine(ctx,visible[i],62,44+i*32);if(i===cursorRow25)ctx.fillRect(62+Math.min(900,ctx.measureText(visible[i]||'').width),44+i*32,18,32);}
  paintedLines25=visible;paintedCursor25=cursorRow25;
  ctx.shadowBlur=0;ctx.fillStyle=glass;ctx.fillRect(850,y26-2,174,32);ctx.shadowBlur=1.8;ctx.fillStyle='#b5d9c6';
  // round17-views: the last tube line is the sole loading percentage.
  const pct=Math.floor(Math.min(ready&&count===welcomeText.length?1:.99,fraction)*100)+'%';tubeLine(ctx,pct,962-ctx.measureText(pct).width,y26);
  // round26b: completed glyphs retain their final compositor state.
  if(count===welcomeText.length&&!welcomeCompletedAt){welcomeCompletedAt=now;events.push({at:now,kind:'welcome-complete'});dispatchEvent(new Event('welcome-complete26'));scheduleEntry();}
  percentage26.textContent=Math.floor(Math.min(ready&&count===welcomeText.length?1:.99,fraction)*100)+'%';percentage26.hidden=ready&&count===welcomeText.length;if(skipped||revealed28)for(const span of welcomeGlyphs){span.style.animation='none';span.style.opacity='1';}
  welcomeRevision++;welcomePaintCallback?.({canvas:welcomeCanvas,revision:welcomeRevision,typed:count,cursor});
 }
 function scheduleEntry(){if(!welcomeCompletedAt||stopped)return; // round25-l
  // Coordinator, 21 November (Albert: "let the opening animation finish, no matter how fast the loading is"):
  // the introduction never leaves on a timer. It stays, with a waiting line, until the visitor comes in.
  if(!skipped){if(!awaiting28){awaiting28=true;cursor26.style.display='none';const hint=$('#load-hint');if(hint){hint.hidden=false;}events.push({at:performance.now(),kind:'welcome-waiting'});dispatchEvent(new Event('welcome-waiting28'));}return;}
  if(!ready)return;clearTimeout(entryTimer);entryTimer=setTimeout(()=>{if(!stopped)enterClick?.()},0);}
 function fit(corners,target=body,width=768,height=512){
  if(!corners){const s=Math.min(innerWidth/1440,innerHeight/900),dx=(innerWidth-1440*s)/2,dy=(innerHeight-900*s)/2;corners=(matchMedia('(min-width:801px) and (pointer:fine)').matches?INTRO_DATA.poster:INTRO_DATA.previewPoster).map(([x,y])=>[dx+x*s,dy+y*s]);}
  const from=[[0,0],[width,0],[width,height],[0,height]],a=[],b=[];
  for(let i=0;i<4;i++){const[u,v]=from[i],[x,y]=corners[i];a.push([u,v,1,0,0,0,-u*x,-v*x],[0,0,0,u,v,1,-u*y,-v*y]);b.push(x,y)}
  const r=a.map((v,i)=>[...v,b[i]]);for(let c=0;c<8;c++){let p=c;for(let j=c+1;j<8;j++)if(Math.abs(r[j][c])>Math.abs(r[p][c]))p=j;[r[c],r[p]]=[r[p],r[c]];const q=r[c][c];if(Math.abs(q)<1e-12)return;for(let k=c;k<=8;k++)r[c][k]/=q;for(let j=0;j<8;j++)if(j!==c){const q=r[j][c];for(let k=c;k<=8;k++)r[j][k]-=q*r[c][k]}}
  const h=r.map(v=>v[8]);target.style.transform='matrix3d('+[h[0],h[3],0,h[6],h[1],h[4],0,h[7],0,0,1,0,h[2],h[5],0,1].join(',')+')';
 }
 function draw(){
 // round19-p
  if(stopped||readingEarly||arrivingAtBench)return;const now=performance.now();let index=current;if(!ready&&now-lastSlideAt>=3500){index=(current+1)%deck.length;lastSlideAt=now;hasChanged=true}if(ready)index=0;const nextDark=!ready&&!reduced&&hasChanged&&now-lastSlideAt<160,baseSlide=ready?name:deck[index],photoKey=welcomePhoto(),photoURL=INTRO_DATA.welcome.photos?.[photoKey],slide=photoURL&&welcomeRetained?{kind:'photo',key:photoKey,image:photoURL}:baseSlide,image=images.get(slide.image); // round19-p
  const changed=index!==previous||nextDark!==dark||lastImage!==slide.image;
  current=index;dark=nextDark;lastImage=slide.image;
  paintIntro(ctx,slide,{fraction,phase:phaseText,ready,dark,image});revision++;lastPaint=performance.now();
  if(index!==previous){events.push({at:lastPaint,index,key:slide.key,kind:slide.kind});previous=index;}
  $('#load-title').textContent=ready?name.name:slide.title||slide.name;
  paintCallback?.({canvas,revision,changed,dark,slide,index,fraction,ready});
 }
 // Download priority stays below the first room tier; decode only the slide
 // currently shown and its next image, releasing older decoded bitmaps.
 async function preload(){
  if(!first||stopped||readingEarly||arrivingAtBench||preloading)return;preloading=true; // round19-p
  const wants=[...new Set(Object.values(INTRO_DATA.welcome.photos||{}))].filter(url=>!/avatar/.test(url)); // round19-p

  for(const[url,img]of images)if(!wants.includes(url)){img.close();images.delete(url)}
  try{for(const url of wants){if(images.has(url))continue;try{const response=await fetch(url,{priority:'low'});if(!response.ok)throw Error('Intro image HTTP '+response.status);const blob=await response.blob();let bitmap;if(blob.type.includes('svg')){const svg=new DOMParser().parseFromString(await blob.text(),'image/svg+xml');svg.documentElement.setAttribute('width','600');svg.documentElement.setAttribute('height','270');const local=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));try{const img=new Image();img.src=local;await img.decode();bitmap=await createImageBitmap(img)}finally{URL.revokeObjectURL(local)}}else bitmap=await createImageBitmap(blob);if(stopped||!wants.includes(url)){bitmap.close();continue}images.set(url,bitmap);draw()}catch(error){events.push({at:performance.now(),image:url,error:String(error)})}}}finally{preloading=false}
 }
 window.roomLoading={
  canvas,welcomeCanvas,welcomePeak:[1600,1200],events,data:INTRO_DATA,fit,
  attachWelcome(fn,geometry){welcomePaintCallback=fn;welcomeGeometry=geometry;fitWelcome(geometry());welcomeCanvas.style.visibility='visible'; // round19c: the DOM welcome remains at native backing density until entry.
 typed=-1;drawWelcome()},
  get snapshot(){return{index:current,key:deck[current]?.key,fraction,phase:phaseText,ready,native,dark,revision,welcomeTyped:typed,welcomeRevision,welcomeCompletedAt,skipped,entryRequested,welcomeWaiting:awaiting28,welcomeRetained,welcomeRate:60,welcomeFont:25,welcomeLayout,welcomeLines:welcomeText.split('\n').length,images:[...images.keys()]};},
  tickWelcome:drawWelcome,dismissWelcome(){welcomeRetained=false;welcomePaintCallback=null},
  showEarlyReader(keepWelcome=false){
   readingEarly=true;
   if(keepWelcome){delete box.dataset.waitingWelcome;showArrivalProgress();return;}
   box.hidden=true;clearInterval(timer);this.dismissWelcome();
  },
  showWaitingWelcome(){
   readingEarly=false;
   box.hidden=false;
   box.dataset.waitingWelcome='';
   enterInvitation33r.hidden=false;
   showArrivalProgress();
   drawWelcome();
  },
  beginBenchArrival(){
   arrivingAtBench=true;
   paintCallback=null;
   showArrivalProgress();
  },
  bindEnter(fn){enterClick=fn;scheduleEntry()},soundOn:()=>window.roomSound?.enabled??soundEnabled,
  attach(fn,geometry){native=true;paintCallback=fn;geometryCallback=geometry;const reveal=()=>{if(stopped||parseFloat(getComputedStyle($('#loading-poster')).opacity)<.02){canvas.style.visibility='hidden';return}setTimeout(reveal,40)};reveal();fit(geometry());draw();},
  first(){first=true;void preload()},
  progress(n,total){fraction=Math.min(1,Math.max(0,total?n/total:0));updateArrivalProgress();bytes.textContent=`${(n/1e6).toFixed(1)} of ${(total/1e6).toFixed(1)} MB`;progress.max=total;progress.value=n;if(performance.now()-lastPaint>180)draw()},
  phase(text){phaseText=text;phase.textContent=text;draw()},
  queued(label){const q=$('#load-queued');q.hidden=true;q.textContent=''},
  ready(){readyTyped=Math.max(0,typed);readyAt=performance.now();ready=true;fraction=1;updateArrivalProgress();phaseText='The room is ready';phase.textContent=phaseText;enter.hidden=true;choice.hidden=true;progress.hidden=true;box.dataset.ready='';fit(geometryCallback?.());draw();readyAt= /* round19-p */performance.now();events.push({at:readyAt,kind:'ready'});if(welcomeCompletedAt)percentage26.hidden=true;scheduleEntry()},
  enter(){stopped=true;clearInterval(timer);clearTimeout(entryTimer);events.push({at:performance.now(),kind:'entry'});box.hidden=true;arrivalProgress.hidden=true;phosphor26.remove();welcomeRetained=false;welcomePaintCallback=null;welcomeCanvas.width=welcomeCanvas.height=1;root.removeAttribute('data-room-loading');paintCallback=null;for(const img of images.values())img.close();images.clear()},
  choice(fn,total){phaseText='Choose whether to load the full room';phase.textContent=`The full room is ${(total/1e6).toFixed(1)} MB.`;choice.hidden=false;box.dataset.choice='';choice.onclick=()=>{choice.hidden=true;delete box.dataset.choice;fn()};draw()},
  failed(retry){phaseText='Try loading again or read as text';phase.textContent=phaseText;enter.hidden=true;sound.hidden=true;choice.hidden=false;choice.textContent='Try loading again';box.dataset.choice='';choice.onclick=()=>{choice.hidden=true;delete box.dataset.choice;retry()};draw()},
  preview(){this.enter()}
 };
 // round25c: welcome input is consumed before any room listener can queue it.
 const skipWelcome=(requestRoom=false)=>{
  skipped=true;
  if(requestRoom){
   enterInvitation33r.hidden=true;
   showArrivalProgress();
   if(window.roomSound)window.roomSound.enter();
   else void audio.then(engine=>engine.enter());
  }if(window.roomEarlyReader?.firstNewspaper)showArrivalProgress();if(requestRoom){entryRequested=true;window.benchProof?.enterFromWelcome?.();}drawWelcome();if(ready)setTimeout(()=>{if(!stopped)enterClick?.()},0);else window.roomEarlyReader?.show()};
 const advanceWelcome=()=>{if(welcomeCompletedAt)skipWelcome(true);else{revealed28=true;drawWelcome();}};  const welcomeOwnsInput25=()=>!stopped&&!readingEarly&&!window.earlyReading25?.visible;
 const swallow=event=>{event.preventDefault();event.stopImmediatePropagation()};
 function firstReaderKey(event){
  const reader=window.roomEarlyReader;
  if(!reader?.firstNewspaper||window.benchProof?.establishedAt||event.repeat)return false;
  if(event.key==='Escape'&&reader.opening){swallow(event);reader.dismiss();return true;}
  if(box.hasAttribute('data-waiting-welcome')&&event.key!=='Tab'){
   if(event.target.closest?.('#load-text,#load-sound,#room-load-choice'))return false;
   swallow(event);
   if(event.key==='Enter')void reader.show();
   return true;
  }
  return false;
 }
 addEventListener('keydown',event=>{
  if(!welcomeOwnsInput25()||firstReaderKey(event))return;
  const controls=[enterInvitation33r,$('#load-text'),choice,sound].filter(el=>!el.hidden&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
  if(event.key==='Tab'){
   swallow(event);
   const current=controls.indexOf(document.activeElement);
   const start=current<0?(event.shiftKey?controls.length-1:0):(current+(event.shiftKey?-1:1)+controls.length)%controls.length;
   controls[start]?.focus({preventScroll:true});return;
  }
  if(controls.includes(event.target)&&event.key!=='Escape')return;
  swallow(event);if(event.repeat)return;
  if(event.key==='Escape')skipWelcome();else if(event.key==='Enter'||event.key===' ')advanceWelcome();
 },true);
 for(const type of ['pointerdown','pointerup','pointermove','keyup','wheel'])addEventListener(type,event=>{if(welcomeOwnsInput25()&&!event.target.closest?.('#load-text,#load-hint,#room-load-choice,#load-sound'))swallow(event)},{capture:true,passive:false});
 enter.onclick=event=>{swallow(event);skipWelcome(true)};enterInvitation33r.onclick=event=>{
  if(box.hasAttribute('data-waiting-welcome'))swallow(event);
  else enter.onclick(event);
 };
 addEventListener('click',event=>{if(welcomeOwnsInput25()&&event.isTrusted&&!event.target.closest?.('#load-text,#load-hint,#room-load-choice,#load-sound')){swallow(event);if(box.hasAttribute('data-waiting-welcome'))return;if(event.target.closest?.('#load-hint'))skipWelcome(true);else advanceWelcome()}},true);
 // WebKit does not always produce a click on the welcome backdrop.
 const welcomeTapAllowed=event=>event.isTrusted&&welcomeOwnsInput25()&&
  !box.hasAttribute('data-waiting-welcome')&&
  !event.target.closest?.('#load-text,#load-hint,#room-load-choice,#load-sound');
 let welcomeTouch;
 const withinTapDistance=touch=>Math.hypot(touch.clientX-welcomeTouch.clientX,touch.clientY-welcomeTouch.clientY)<=10;
 addEventListener('touchstart',event=>{
  welcomeTouch=welcomeTapAllowed(event)&&event.touches.length===1?event.touches[0]:null;
 },true);
 addEventListener('touchmove',event=>{
  if(welcomeTouch&&(event.touches.length!==1||!withinTapDistance(event.touches[0])))welcomeTouch=null;
 },true);
 addEventListener('touchcancel',()=>{welcomeTouch=null},true);
 addEventListener('touchend',event=>{
  const touch=event.changedTouches[0];
  const tap=welcomeTouch&&touch?.identifier===welcomeTouch.identifier&&
   !event.touches.length&&withinTapDistance(touch)&&welcomeTapAllowed(event);
  welcomeTouch=null;
  if(!tap)return;
  // Cancel the compatibility click so a tap during typing only reveals the line.
  swallow(event);
  advanceWelcome();
 },{capture:true,passive:false});
 window.roomLoad=state=>{if(state==='fail'){roomLoading.failed(()=>location.reload());return}if(state==='preview'||state==='first'&&new URLSearchParams(location.search).get('tier')==='first')roomLoading.preview()};
 window.roomFit=()=>{};addEventListener('resize',()=>{fit(geometryCallback?.());fitWelcome(welcomeGeometry?.())});
 fit();fitWelcome();draw();drawWelcome();timer=setInterval(()=>{drawWelcome();draw();void preload();if(geometryCallback)fit(geometryCallback());if(welcomeGeometry)fitWelcome(welcomeGeometry()) // round21-o
},16);
})();
