// round19-q: quality ownership for items 1, 2, and 7.
// round17b
// round17
import {sourceBlocks,plain,provenanceHTML} from './painters/reader.js';
import cfg,{motionDuration} from './config.js';
import {openRoomTab,outsideRoom} from './new-tab.js'; // round14-links
import {homography, matrix} from './homography.js';

// CRT colour and 1024 × 768 raster follow painters/crt.js. The live face uses
// the same four measured screen_crt corners, rather than a viewport overlay.
const W=1024,H=768,INK='#b5d9c6',BG='#080f0d';
// Inverse barrel map for the DOM phosphor. The same coefficient is used in
// the native screen shader. The curved source glass remains in front of it.
function mountPhosphorOptics(){
 const map=document.createElement('canvas');map.width=128;map.height=96;
 const ctx=map.getContext('2d'),pixels=ctx.createImageData(map.width,map.height);
 const scale=32;
 for(let y=0;y<map.height;y++)for(let x=0;x<map.width;x++){
  const u=(x+.5)/map.width-.5,v=(y+.5)/map.height-.5;
  const radius2=u*u+v*v,index=4*(y*map.width+x);
  pixels.data[index]=255*(.5+.05*u*radius2*W/scale);
  pixels.data[index+1]=255*(.5+.05*v*radius2*H/scale);
  pixels.data[index+3]=255;
 }
 ctx.putImageData(pixels,0,0);
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('aria-hidden','true');svg.setAttribute('width','0');svg.setAttribute('height','0');
 svg.style.position='absolute';
 svg.innerHTML=`<filter id="computer-phosphor" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage href="${map.toDataURL()}" preserveAspectRatio="none" result="tube"/><feDisplacementMap in="SourceGraphic" in2="tube" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
 document.body.append(svg);
}
const PROGRAMS=['home','news','programs','mail','browser']; // round22-a
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const excerpt=value=>{const source=String(value||''),line=(source.match(/^.*?[.!?](?=\s+[A-Z]|$)/)?.[0]||source).trim();return line.length>160?line.slice(0,157).replace(/\s+\S*$/,'')+'…':line;};
function finishComputerMaterials(room){
 const receipt={glass:0,bezel:0,lamp:0};
 room.scene.traverse(mesh=>{
  if(!mesh.isMesh)return;
  for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
   if(!material||material.userData.computerFinish33)continue;
   const glass=Boolean(material.userData.sourceFresnelIOR);
   const bezel=material.name.startsWith('crt_rounded_bezel/');
   const lamp=/^crt_(?:green_power_lamp|(?:power_)?(?:led|indicator|pilot))/i.test(material.name);
   if(!glass&&!bezel&&!lamp)continue;
   material.userData.computerFinish33=true;
   const prior=material.onBeforeCompile.bind(material),key=material.customProgramCacheKey.bind(material);
   material.onBeforeCompile=shader=>{
    prior(shader);
    if(glass)shader.fragmentShader=shader.fragmentShader
     .replace('vec2(.48-.34*glassDirection.x,.56-.055*glassDirection.y)',
      'vec2(.54-.084*glassDirection.x,.27+.036*glassDirection.y)')
     .replace('vec3 windowRadiance=texture2D(crtReflectedWindow,clamp(reflectedPane,.01,.99),2.).rgb;',
      'vec3 skyPatch=texture2D(crtReflectedWindow,clamp(reflectedPane,.06,.94),5.).rgb; float dusk=dot(skyPatch,vec3(.2126,.7152,.0722)); vec3 windowRadiance=mix(vec3(.11,.20,.31),vec3(.31,.43,.51),smoothstep(.03,.65,dusk));')
     .replace('3.6*f*upperGlass*paneBar','1.32*f*upperGlass*mix(.65,1.,paneBar)');
    if(bezel)shader.fragmentShader=shader.fragmentShader.replace('reflectedLight.directDiffuse*=paperShade;',`
      vec3 texturePoint=crtBezelWorld*1630.;
      float grain=sin(texturePoint.x+texturePoint.z)*sin(texturePoint.y-texturePoint.z);
      float footprint=max(length(dFdx(texturePoint)),length(dFdy(texturePoint)));
      paperShade*=1.+.046*grain*(1.-smoothstep(.65,2.7,footprint));
      float edge=pow(1.-abs(dot(normal,geometryViewDir)),3.);
      // LED centre from the packed lamp mesh after the room's CRT swivel.
      vec3 lampDistance=(crtBezelWorld-vec3(-.211472,1.055400,-.315552))*188.;
      reflectedLight.indirectDiffuse+=vec3(.007,.011,.012)*edge;
      reflectedLight.indirectDiffuse+=vec3(.005,.027,.014)*exp(-dot(lampDistance,lampDistance));
      reflectedLight.directDiffuse*=paperShade;`);
   };
   material.customProgramCacheKey=()=>key()+'-instrument33';
   if(lamp&&material.emissiveIntensity>0)material.emissiveIntensity*=1.12;
   material.needsUpdate=true;
   receipt[glass?'glass':bezel?'bezel':'lamp']++;
  }
 });
 if(window.inSceneProof){
  const old=window.inSceneProof.computerFinish33||{glass:0,bezel:0,lamp:0};
  for(const key of Object.keys(receipt))old[key]+=receipt[key];
  window.inSceneProof.computerFinish33=old;
 }
}
export function createComputer({api,sound}) {
 const room=api.room||api,T=room.contentNative.toolkit;
 finishComputerMaterials(room);
 void room.afterEnter?.().then(()=>finishComputerMaterials(room)).catch(error=>console.warn('Computer material finish:',error.message));
 // Two RGBA compositor buffers for the terminal and its largest iframe.
 room.setReaderSurfaceBytes?.(2*(1024*768+1024*320)*4);
 let pendingChoice=0; // round22-a: Escape can cancel a manual before its content arrives.
 let program='news',detail=null,news=[],talks=[],manuals=[],contacts=[],browser=null;
 // round24: retain each index independently of its detail.
 let pointerPosition=null,restoringList=false;
 const positions=JSON.parse(sessionStorage.getItem('room.computer.positions')||'{}');
 const remember=()=>{if(!detail&&visible){positions[program]={scroll:panel.querySelector('#computer-body')?.scrollTop||0,selected};sessionStorage.setItem('room.computer.positions',JSON.stringify(positions));}};
 const localDocuments=new Map();
 const motion=matchMedia('(prefers-reduced-motion:reduce)');
 let fadeEpoch=0,lastProjection='';
 let lastBlink=0,cursor=true,idleNews=null,browserAssetsPromise;
 let powered=false,visible=false,booting=false,selected=0,command='',message='',epoch=0,typing=0,finishTyping=null,loadPromise;
 const read=new Set();try{JSON.parse(localStorage.getItem('room.computer.read')||'[]').forEach(k=>read.add(k));}catch{}
 const panel=document.createElement('section');panel.id='scene-computer';panel.hidden=true;panel.setAttribute('aria-label','Laboratory computer');
 const css=document.createElement('style');css.textContent=`
 #scene-computer{position:fixed;left:0;top:0;width:1024px;height:768px;z-index:5;opacity:0;transition:none;transform-origin:0 0;background:transparent;color:${INK};font:400 42px/1.2 Menlo,Consolas,monospace;border-radius:5% / 4%;overflow:hidden;box-sizing:border-box;display:flex;text-shadow:0 0 2px #b5d9c66c}
 #computer-raster{position:relative;width:100%;height:100%;display:flex;flex-direction:column;padding:48px 62px 38px;filter:url(#computer-phosphor)}
 /* round16-ux: list extent and a persistent way back. */
 #computer-list-status{font-size:28px;min-height:34px;padding-top:8px}#computer-body .computer-back{position:sticky;top:0;z-index:2;background:#080f0d;border-bottom:2px solid currentColor;width:100%}#computer-body{scrollbar-gutter:stable;overflow-anchor:none;scroll-padding-block:24px}
 #scene-computer[hidden]{display:none}#scene-computer *{box-sizing:border-box;font-family:Menlo,Consolas,monospace;font-weight:400}#scene-computer button,#scene-computer input,#scene-computer a{font:inherit;color:inherit}#scene-computer button{background:none;border:0;text-align:left;padding:8px 5px;cursor:pointer}#scene-computer button:not([data-item]):hover,#scene-computer button:not([data-item]):focus-visible,#scene-computer button[aria-current]{background:${INK};color:${BG};outline:0;text-shadow:none}#scene-computer header{display:flex;justify-content:space-between;align-items:center;font-size:32px;border-bottom:2px solid currentColor;padding-bottom:7px}#scene-computer nav{display:flex;gap:15px;flex-wrap:wrap;font-size:30px;padding:8px 0}#computer-body{overflow-wrap:anywhere;flex:1;min-height:0;overflow:auto;scrollbar-width:thin;scrollbar-color:${INK} ${BG}}#computer-body>button{display:block}#computer-body h1,#computer-body h2{font:inherit;font-weight:400;margin:16px 0}#computer-body p{margin:13px 0}#computer-body pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;margin:13px 0}#computer-body code{font:inherit}#computer-body ol{padding:0;list-style:none;margin:0}#computer-body li button{width:100%;display:block;margin:6px 0}#computer-body small{display:block;font-size:34px;line-height:1.3}#scene-computer footer{border-top:2px solid currentColor;font-size:28px;padding-top:9px}#computer-command{display:flex;gap:12px}#computer-command button{flex:0 0 auto;white-space:nowrap;overflow-wrap:normal}#computer-command input::placeholder{font:inherit;color:#b5d9c699}#computer-command input{flex:1;width:0;min-width:0;background:transparent;border:0;outline:none;font-size:32px}#computer-address{white-space:nowrap;overflow-x:auto;font-size:30px;min-height:40px}#computer-body:has(iframe) h1{font-size:32px;overflow-wrap:anywhere;margin:8px 0}#scene-computer iframe{width:100%;height:320px;border:1px solid ${INK};background:white}#scene-computer img{display:block;max-width:100%;height:250px;object-fit:contain;margin:12px auto}#scene-computer:has([data-new-tab]) header{font-size:28px}#scene-computer header .computer-new-tab{font-size:28px;padding:5px;margin:0;white-space:nowrap}#scene-computer .computer-new-tab{display:inline-block;border:2px solid currentColor;padding:10px;text-decoration:none;margin:14px 0}#scene-computer .computer-new-tab:focus-visible{outline:3px solid currentColor}#scene-computer::after{content:'';pointer-events:none;position:absolute;inset:0;border-radius:inherit;background:repeating-linear-gradient(0deg,rgb(0 0 0 / .08) 0 1px,transparent 1px 3px)}#scene-computer[data-booting] {animation:computer-warm var(--motion-object) var(--motion-ease)}@keyframes computer-warm{from{filter:brightness(.08);clip-path:inset(49% 4%)}to{filter:brightness(1);clip-path:inset(0)}}@media(prefers-reduced-motion:reduce){#scene-computer{animation:none!important}}`;
 // round22-b: six or more dated items fit the phosphor reading surface.
 css.textContent+=`#computer-body .computer-news{font-size:24px;line-height:1.16}#computer-body .computer-news li button{display:grid;grid-template-columns:168px minmax(0,1fr);column-gap:20px;padding:4px 0;margin:2px 0}#computer-body .computer-news time{font-size:22px;color:#7b9a8b;white-space:nowrap}#computer-body .computer-news span{display:block}#computer-body [data-item]{opacity:var(--entry-opacity,1)}
 #computer-body [data-item][data-cut]{opacity:0;pointer-events:none}
 #computer-body [data-item][aria-current]{background:#31463d;color:${INK}}
 #computer-body [data-item][aria-current] time{color:inherit}`;
 document.head.append(css);document.body.append(panel);mountPhosphorOptics();
 // round26c: crossfade the native summary and live document at the start of a lean.
 let phosphorEpoch26c=0,panelOpacity26c=0;
 function phosphor26c(to){if(to)finishComputerMaterials(room);const epoch=++phosphorEpoch26c,from=panelOpacity26c;let start=null;return new Promise(resolve=>{function tick(t){if(epoch!==phosphorEpoch26c){resolve();return;}const now=window.roomMotion26c.tick(t);if(start===null)start=now;const f=motion.matches?1:Math.min(1,(now-start)/160);panelOpacity26c=from+(to-from)*f;panel.style.opacity=String(panelOpacity26c);room.setCRTTextGain?.(1-panelOpacity26c);if(f<1)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick)});}
 function effect(name){try{typeof sound==='function'?sound(name):sound?.effect(name)}catch(error){console.warn('Computer sound unavailable',error.message)}}
 const local=async url=>{if(new URL(url,location.href).origin!==location.origin)throw Error('Computer data must be local');if(api.local)return api.local(url);const r=await fetch(url);if(!r.ok)throw Error('Computer HTTP '+r.status+' '+url);return r;};
 const json=async url=>(await local(url)).json();
 const record=key=>api.record?api.record(key):json('/content/surfaces/records/'+key+'.json');
 async function load(){return loadPromise??=(async()=>{let next='/content/surfaces/lists/news/1.json';const items=[];while(next){const list=await json(next);items.push(...list.items);next=list.next;}news=items.sort((a,b)=>b.date.localeCompare(a.date));const [m,c]=await Promise.all([json('/bench-360/inscene/catalogues/software.json'),record('contact')]); // round22-a
manuals=m.items;contacts=c.fields.emails;paintRest();})().catch(error=>{loadPromise=null;message='Could not load the directory. Try again.';console.error('Computer directory',error);throw error;});}
 function idleLine(){return news[0]?news[0].date+'  '+news[0].text:'News';}
 // round16-ux: repeat program selections do not add history entries.
 function save(push=true){const state={program,detail,browser,selected};const old=history.state?.computer;if(JSON.stringify(old)===JSON.stringify(state))push=false;history[push?'pushState':'replaceState']({...history.state,computer:state,inScene:{...history.state?.inScene,key:'computer',mode:'computer'}},'','/?computer='+program+(detail?'&item='+encodeURIComponent(detail.key||detail.recordId||''):'')+(program==='browser'&&browser?'&url='+encodeURIComponent(browser.url):''));api.onState?.();}
 async function readerHTML(r){let url=r.reader?.first,html='';while(url){const batch=await json(url);for(const part of batch.parts||[])html+=await(await local(part.href)).text();url=batch.next;}return html+provenanceHTML(r);}
 function recordText(r){return r?.nativeHTML||'';}
 function link(url,title,description=''){return `<button data-url="${esc(url)}" data-title="${esc(title)}" data-description="${esc(description)}">${esc(title)} ↗</button>`;}
 function list(items,kind){if(kind==='news')return '<ol class="computer-news">'+items.map(r=>`<li><button data-item="${esc(r.recordId)}" data-kind="news"><time>${esc(r.date)}</time><span>${esc(r.text)}</span></button></li>`).join('')+'</ol>'; // round22-b
 return '<ol>'+items.map((r,i)=>`<li><button data-item="${esc(r.key||r.recordId)}" data-kind="${kind}" ${selected===i?'aria-current="true"':''}>${kind==='news'?'':(i+1)+'. '}${esc(r.date||r.fields?.date||r.fields?.year||'')}  ${esc(r.text||r.title)}${r.fields?.event?'<small>'+esc(r.fields.event)+'</small>':''}</button></li>`).join('')+'</ol>';}
 const PAGE_LIMIT=1500000;
 async function bounded(response,remaining){if(!response.ok)throw Error('Browser HTTP '+response.status);const reader=response.body.getReader(),parts=[];let bytes=0;try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>remaining)throw Error('This page exceeds the Browser download limit');parts.push(value)}}finally{await reader.cancel().catch(()=>{});}return new Blob(parts);}
 async function prepareDocument(url){
  const u=new URL(url);if(u.origin!==location.origin)return;if(localDocuments.has(url)){browser.pageBudget=localDocuments.get(url).budget;browser.paperSource=localDocuments.get(url).paperSource||null;if(!browser.title)browser.title=localDocuments.get(url).title;return;}
  // round16-papers: keyboard drops read one local PDF page per Browser view.
  const paper=u.pathname.match(/^\/(?:paper-reader|papers)\/([a-z0-9-]+)\/(?:([0-9]+)\/)?$/);
  if(paper&&cfg.pdfPaperKeys.includes(paper[1])){const response=await fetch('/content/papers/'+paper[1]+'.json'),manifest=await bounded(response,PAGE_LIMIT-700),doc=JSON.parse(await manifest.text()),index=Math.max(0,Math.min(doc.pages.length-1,Number(paper[2]||1)-1)),page=doc.pages[index];let images=[],counted=manifest.size+700;const root='/paper-reader/'+paper[1]+'/';let html='<main aria-label="'+esc(doc.title)+'">';browser.paperSource=doc.openPaperHref;if(!browser.title)browser.title=doc.title;
   if(page){const blob=await bounded(await fetch(page.reading.href),PAGE_LIMIT-counted-700),decoded=await createImageBitmap(blob),scale=Math.min(1,2048/decoded.width),canvas=new OffscreenCanvas(Math.round(decoded.width*scale),Math.round(decoded.height*scale));try{canvas.getContext('2d',{willReadFrequently:true}).drawImage(decoded,0,0,canvas.width,canvas.height);}finally{decoded.close()}const preview=await canvas.convertToBlob({type:'image/webp',quality:.95}),buffer=new Uint8Array(await preview.arrayBuffer());let binary='';for(const value of buffer)binary+=String.fromCharCode(value);const display='data:image/webp;base64,'+btoa(binary);counted+=blob.size+700;images=[page.reading.href];html+='<nav style="position:sticky;top:0;background:#080f0d;font:24px/1.35 Courier New;padding-bottom:8px">'+(index?'<a href="'+root+index+'/">Previous</a> · ':'')+'Page '+(index+1)+' of '+doc.pages.length+(index+1<doc.pages.length?' · <a href="'+root+(index+2)+'/">Next</a>':'')+'</nav><img data-source-page="'+page.reading.href+'" src="'+display+'" alt="PDF page '+(index+1)+'" style="width:100%;height:auto">';}else html+='<p>The PDF is unavailable. Read the citation and source.</p>';
   html+='<p><a href="'+esc(doc.openPaperHref)+'">Open paper ↗</a></p></main>';counted+=new TextEncoder().encode(html).length;if(counted>PAGE_LIMIT)throw Error('This paper page exceeds the Browser download limit');const result='<!doctype html><html><head><base href="'+location.origin+'"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src \'self\' data:; style-src \'unsafe-inline\'; base-uri \'self\'"></head><body>'+html+'</body></html>';browser.pageBudget={limit:PAGE_LIMIT,countedBytes:counted,images};localDocuments.set(url,{html:result,budget:browser.pageBudget,paperSource:browser.paperSource,title:browser.title});while(localDocuments.size>2)localDocuments.delete(localDocuments.keys().next().value);return;}
  if(/\.(?:pdf|png|jpe?g|gif|webp|svg|json|txt)$/i.test(u.pathname)){browser.card=true;browser.notice='Open this file in a new tab.';return;}
  browserAssetsPromise??=(async()=>{const r=await fetch('/browser-assets/index.json'),blob=await bounded(r,PAGE_LIMIT-700);return {data:JSON.parse(await blob.text()),bytes:blob.size+700};})().catch(e=>{browserAssetsPromise=null;throw e});
  const index=await browserAssetsPromise,response=await fetch(u.href),blob=await bounded(response,PAGE_LIMIT-index.bytes-700);
  if(!/html/i.test(blob.type||response.headers.get('content-type')||'')){browser.card=true;browser.notice='Open this file in a new tab.';return;}
  const source=new DOMParser().parseFromString(await blob.text(),'text/html');if(!browser.title)browser.title=source.querySelector('main h1,h1')?.textContent.trim()||source.title.split(' | ')[0]||'Page';const doc=document.implementation.createHTMLDocument(source.title),main=source.querySelector('main')||source.body;doc.body.append(...[...main.childNodes].map(n=>doc.importNode(n,true)));
  for(const node of doc.querySelectorAll('script,noscript,base,link,style,source,meta'))node.remove();
  for(const node of doc.querySelectorAll('*'))for(const attr of [...node.attributes])if(/^on/i.test(attr.name)||['style','srcset','sizes','poster','background','ping','target'].includes(attr.name))node.removeAttribute(attr.name);
  for(const frame of doc.querySelectorAll('iframe,embed,object,video,audio')){const raw=frame.getAttribute('src')||frame.getAttribute('data');const link=doc.createElement('a');link.href=raw?new URL(raw,u.href).href:u.href;link.textContent='Open recording';frame.replaceWith(link);}
  const resources=new Map();
  for(const image of doc.querySelectorAll('img')){const original=new URL(image.getAttribute('src')||'',u.href),key=decodeURIComponent(original.pathname),asset=index.data.images[key];if(!asset||![location.hostname,'kejunying.com','www.kejunying.com'].includes(original.hostname)){const link=doc.createElement('a');link.href=original.href;link.textContent=image.alt||'Open image';image.replaceWith(link);continue;}image.src=asset.href;image.width=asset.width;image.removeAttribute('height');image.loading='lazy';image.decoding='async';resources.set(asset.href,asset.bytes+700);}
  const counted=blob.size+700+index.bytes+[...resources.values()].reduce((a,b)=>a+b,0);if(counted>PAGE_LIMIT)throw Error('This page exceeds the Browser download limit');
  const base=doc.createElement('base');base.href=u.href;doc.head.prepend(base);const policy=doc.createElement('meta');policy.httpEquiv='Content-Security-Policy';policy.content="default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'self'; form-action 'none'";doc.head.prepend(policy);
  const result='<!doctype html>'+doc.documentElement.outerHTML;browser.pageBudget={limit:PAGE_LIMIT,countedBytes:counted,documentBytes:blob.size,indexBytes:index.bytes,images:[...resources.keys()]};localDocuments.set(url,{html:result,budget:browser.pageBudget,paperSource:browser.paperSource,title:browser.title});while(localDocuments.size>2)localDocuments.delete(localDocuments.keys().next().value);
 }
 function body(){ // round17b: warm phosphor over the requested content, without a boot menu.
  if(program==='home')return ''; // round17b: historical home aliases news before rendering.
  if(program==='news'){if(detail)return '<h1>'+esc(detail.date)+'</h1><p>'+esc(detail.text)+'</p>'+(detail.link?link(detail.link,'Read the source',detail.text):'');return list(news,'news');}
  if(program==='programs'){if(detail)return '<h1>'+esc(detail.title)+'</h1>'+recordText(detail);return list(manuals,'programs')+'<form id="computer-command"><label for="computer-input">&gt;</label><input id="computer-input" aria-label="Command" placeholder="ls or man NAME" autocomplete="off"></form>' ;}
  if(program==='mail')return '<p>Contact Kejun Albert Ying</p>'+contacts.map((c,i)=>`<p>${i+1}. <a href="${esc(c.href)}">${esc(c.address)}</a></p>`).join('')+'<small>Choose an address to open your mail program.</small>';
  if(program==='browser'){if(!browser)return '<form id="computer-command"><input id="computer-input" aria-label="Page address" placeholder="Page address" autocomplete="off"><button type="submit">Open</button></form>'; // round17b
const u=new URL(browser.url),frame=frameAllowed(u)&&!browser.card;return '<div id="computer-address" aria-label="Page address">'+esc(browser.typed??browser.url)+'</div><h1>'+esc(browser.title||u.hostname)+'</h1>'+(!browser.loading&&frame?`<iframe title="${esc(browser.title||'Browser page')}" sandbox="${u.origin===location.origin?'allow-same-origin':'allow-scripts allow-same-origin'}" referrerpolicy="no-referrer" allow="autoplay; encrypted-media; picture-in-picture" ${localDocuments.has(browser.url)?'srcdoc="'+esc(localDocuments.get(browser.url).html)+'"':'src="'+esc(browser.url)+'"'}></iframe>`:'<p>'+esc(browser.notice||browser.description||u.hostname)+'</p>');}
  return '';
 }
 // round17: one home list, no inner exit, and one source-opening control.
 // round17b: content first, one program row, no menu home or command-name row.
 function render(){if(visible&&!panel.hidden){const fade=panel.animate([{filter:'brightness(1)'},{filter:'brightness(.15)',offset:.5},{filter:'brightness(1)'}],{duration:160,easing:'linear'});fade.pause();let start=null;const tick=t=>{const now=window.roomMotion26c.tick(t);if(start===null)start=now;fade.currentTime=Math.min(160,now-start);if(now-start<160)requestAnimationFrame(tick);else fade.finish();};requestAnimationFrame(tick); // round26c
}panel.dataset.program=program; // round22-a
 const top=panel.querySelector('#computer-body')?.scrollTop||0;panel.innerHTML='<div id="computer-raster"><nav aria-label="Computer programs">'+PROGRAMS.slice(1).filter(p=>p!=='browser'||!!browser).map(p=>`<button data-program="${p}" ${program===p?'aria-current="page"':''}>${p[0].toUpperCase()+p.slice(1)}</button>`).join('')+'</nav>'+(program==='browser'&&browser?'<header><a class="computer-new-tab" data-new-tab href="'+esc(browser.paperSource||browser.url)+'" target="_blank" rel="noopener noreferrer">Open in new tab</a></header>':'')+'<main id="computer-body">'+body()+'</main><div id="computer-list-status" role="status"></div><div role="status">'+esc(message)+'</div></div>';panel.querySelector('#computer-body').scrollTop=top;const area=panel.querySelector('#computer-body'),status=panel.querySelector('#computer-list-status');const rows=[...area.querySelectorAll('ol > li > [data-item]')];const scrollCue=()=>{
  const top=area.scrollTop,bottom=top+area.clientHeight;
  const more=area.scrollHeight>area.clientHeight+8;
  status.textContent=more?(bottom<area.scrollHeight-8?'More below ↓ · scroll or use ↑ ↓':'↑ More above'):'';
  // Reserve enough room for complete descenders and the full selection bar.
  const edge=area.offsetTop;
  for(const row of rows){
   const y=row.offsetTop-edge,height=row.offsetHeight,above=y-top,below=bottom-y-height;
   const cut=height<=area.clientHeight&&(above<-.5||below<-.5);
   const fade=height>area.clientHeight?1:Math.max(0,Math.min(1,top>0?above/24:1,bottom<area.scrollHeight-.5?below/24:1));
   row.toggleAttribute('data-cut',cut);
   row.style.setProperty('--entry-opacity',fade.toFixed(3));
  }
 };area.addEventListener('scroll',scrollCue,{passive:true});area.addEventListener('scrollend',()=>{if(area.isConnected&&!restoringList)remember();});requestAnimationFrame(scrollCue);const iframe=panel.querySelector('iframe');if(iframe&&browser?.kind==='video'){iframe.tabIndex=-1;iframe.style.pointerEvents='none';panel.querySelector('[data-program=talks]')?.focus({preventScroll:true});} // round16-ux: Play starts the recording while the room keeps Escape.
 if(iframe&&(iframe.hasAttribute('srcdoc')||new URL(iframe.src).origin===location.origin))iframe.addEventListener('load',()=>{try{const doc=iframe.contentDocument,style=doc.createElement('style');style.textContent="html,body{background:#080f0d!important;color:#b5d9c6!important;font:400 40px/1.35 Menlo,Consolas,monospace!important}body{padding:16px!important;margin:0!important}main{width:auto!important;max-width:none!important;margin:0!important}img{display:block;max-width:100%;height:auto}a,button{color:#b5d9c6!important}header,footer,.site-header,.site-footer{display:none!important}";doc.head.append(style);doc.addEventListener('click',e=>{const link=e.target.closest('a[href],button[data-player]');if(!link)return;e.preventDefault();e.stopImmediatePropagation();const raw=link.dataset.player||link.getAttribute('href'),url=new URL(raw,doc.baseURI);open(url.href,{title:link.textContent.trim(),kind:link.dataset.player?'video':'page'}).catch(fail);},true);doc.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();api.exit?.();}},true);}catch(error){console.warn('Computer local page',error.message);}});paintRest();}
  let restReady=!room.onEnter;
  // The entry fade owns the glass until its idle title is fully visible.
  function paintRest(forceSummary26c=false,entryShade=null){if(!restReady&&entryShade===null)return;if(!api.texture||!forceSummary26c&&visible)return;const v=api.texture(),c=v.ctx;c.fillStyle=BG;c.fillRect(0,0,W,H);c.fillStyle=INK;
  // The shader dims these glyphs as the interactive phosphor fades in.
  if(forceSummary26c||!visible&&room.state.view==='home'){
   const rows=['Kejun Albert Ying 应可钧','Incoming assistant professor','AI for biology and aging','Lab opens January 2027'];
   c.fillStyle='#719d85';
   const sx=.82, width=856;
   let size=72;
   const heading=85;
   c.font='400 '+heading+'px Menlo';
   const headingScale=Math.min(sx,width/c.measureText(rows[0]).width);
   c.save();c.scale(headingScale,1);c.fillText(rows[0],68/headingScale,160);c.restore();
   while((c.font=size+'px Menlo',Math.max(...rows.slice(1).map(row=>c.measureText(row).width*sx)))>width)size-=2;
   c.save();c.scale(sx,1);c.font=size+'px Menlo';rows.slice(1).forEach((row,i)=>c.fillText(row,68/sx,[260,362,464][i]));c.restore();
   idleNews={headline:rows,fontSize:size,headingSize:heading,headingScale,horizontalScale:sx,width,noScrolling:true};
   if(cursor)c.fillRect(928,607,14,45);
  }
  else {c.font="28px Menlo";c.fillText('YING LAB / '+program.toUpperCase(),62,70);if(program!=='home')c.fillText('News   Programs   Mail',62,112); /* round17 */c.font="32px Menlo";let y=174;if(booting)wrap(c,'Phosphor display warming… Memory ready. News spool mounted. 5 programs ready.',62,y,900,43,10);else if(program==='home'){for(const [i,p]of PROGRAMS.slice(1).entries())c.fillText((i+1)+'. '+p,62,210+i*65);}else if(!detail&&['news','talks','programs'].includes(program)){const data=program==='news'?news:program==='talks'?talks:manuals;for(const [i,r]of data.slice(selected,selected+5).entries()){y=wrap(c,(selected+i+1)+'. '+(r.date||r.fields?.date||r.fields?.year||'')+' '+(r.text||r.title),62,y,900,36,2)+16;}}else{const txt=program==='browser'?browser?.url+' '+(browser?.title||'')+' '+(browser?.description||''):program==='mail'?contacts.map(c=>c.address).join('  '):detail?.text||[detail?.title,detail?.fields?.date,detail?.fields?.description].filter(Boolean).join(' ');wrap(c,txt||'Choose a program',62,y,900,42,10);}}
  if(entryShade>0){c.fillStyle=`rgba(5,11,8,${entryShade})`;c.fillRect(0,0,W,H);}
  api.upload?.(v);}
 function wrap(c,text,x,y,width,leading,max){let line='',n=0;for(const word of String(text).split(/\s+/)){if(c.measureText(line+' '+word).width>width&&line){c.fillText(line,x,y);y+=leading;if(++n>=max)return y;line=word;}else line+=(line?' ':'')+word;}if(line){c.fillText(line,x,y);y+=leading;}return y;}
 function frameAllowed(u){return u.origin===location.origin||u.protocol==='https:'&&u.hostname==='www.youtube-nocookie.com'&&/^\/embed\/[\w-]+$/.test(u.pathname);}
 function videoURL(raw){try{const u=new URL(raw);if(u.protocol!=='https:'||!['www.youtube.com','youtube.com','www.youtube-nocookie.com','youtu.be','m.youtube.com'].includes(u.hostname))return null;const id=u.pathname.startsWith('/embed/')?u.pathname.slice(7):u.hostname==='youtu.be'?u.pathname.slice(1):u.pathname==='/watch'?u.searchParams.get('v'):null;if(!/^[\w-]{11}$/.test(id||''))return null;return 'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0';}catch{return null;}}
 // round16-ux: never show a terminal whose entry was cancelled during boot or travel.
 // round26-k: the destination is printed on the glass before the visitor leans in.
 async function enter(token){++fadeEpoch;await load();if(token!==epoch)return;if(!powered){powered=true;effect('crt_on');}booting=false;delete panel.dataset.booting;render();if(!detail){const savedScroll26c=positions[program]?.scroll||0;panel.querySelector('#computer-body')?.scrollTo(0,savedScroll26c);requestAnimationFrame(()=>{if(token===epoch&&!detail)panel.querySelector('#computer-body')?.scrollTo(0,savedScroll26c);});}paintRest(true);visible=true;panel.hidden=false;panelOpacity26c=0;panel.style.opacity='0';const fade=phosphor26c(1);await Promise.all([api.enter?.(),fade]);if(token!==epoch)return;panel.querySelector('#computer-body')?.scrollTo(0,detail?0:(positions[program]?.scroll||0));}


 async function show(next='news',{push=true,resume=null}={}){if(room.queueRoomIntent&&(!room.roomReady||!room.entered||!room.establishedAt)){room.queueRoomIntent(()=>show(next,{push,resume}),'Computer');return;}if(!PROGRAMS.includes(next)||next==='home'||next==='browser'&&!browser&&!resume?.browser)next='news'; // round22-a
remember();finishTyping?.();const token=++epoch;clearInterval(typing);program=next;detail=resume?.detail||null;browser=resume?.browser||browser;selected=resume?.selected??positions[next]?.selected??-1;command='';message='';await enter(token);if(token!==epoch)return;if(next==='browser'&&browser&&!browser.loading)await prepareDocument(browser.url);if(token!==epoch)return;render();if(push)save();else api.onState?.();await new Promise(requestAnimationFrame);if(token!==epoch)return;panel.querySelector('#computer-body').scrollTo(0,detail?0:(positions[next]?.scroll||0));if(!detail&&selected>=0)panel.querySelectorAll('#computer-body [data-item]')[selected]?.focus({preventScroll:true});else panel.querySelector('[data-program="'+(next==='home'?'news':next)+'"]')?.focus({preventScroll:true});return token;}
 async function open(url,{title='',description='',kind='page'}={}){if(kind!=='video'&&outsideRoom(url))return openRoomTab(url); // round14-links
if(room.queueRoomIntent&&(!room.roomReady||!room.entered||!room.establishedAt)){room.queueRoomIntent(()=>open(url,{title,description,kind}),'Computer');return;}if(kind==='news'){const shown=await show('news');if(shown!==epoch)return false;const key=String(url).split('#')[1]||url;if(news.some(r=>r.recordId===key))return choose(key,'news');return;}if(kind==='program'){const shown=await show('programs',{push:false});if(shown!==epoch)return false;const name=String(url).split('#').pop().replace(/\/$/,'').split('/').pop().toLowerCase(),entry=manuals.find(r=>[r.key,r.key.replace(/^software-/,''),r.title,r.fields?.name].some(v=>String(v||'').toLowerCase()===name));if(entry)return choose(entry.key,'programs');return open(url,{title,description,kind:'page'});}if(kind==='mail'||String(url).startsWith('mailto:')){await show('mail');return;}let u;try{u=new URL(url,location.href);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)throw Error('Use an HTTP or HTTPS address');}catch(error){message='Use an HTTP or HTTPS address.';render();return false;}if(kind==='video'){const v=videoURL(u.href);if(v)u=new URL(v);else if(outsideRoom(u.href))return openRoomTab(u.href);}browser=null;const shown=await show('browser',{push:false});if(shown!==epoch)return false;if(u.origin===location.origin&&(u.pathname==='/'||u.pathname.startsWith('/room/')))u.pathname=u.pathname==='/'?'/text/':u.pathname.replace(/^\/room/,'');browser={url:u.href,title,kind,description:excerpt(description),typed:'',loading:true};render();const token=epoch;let at=0;await new Promise(resolve=>{finishTyping=()=>{clearInterval(typing);finishTyping=null;resolve();};typing=setInterval(()=>{if(token!==epoch){finishTyping?.();return;}at=matchMedia('(prefers-reduced-motion:reduce)').matches?u.href.length:Math.min(u.href.length,at+Math.max(1,Math.ceil(u.href.length/10) /* round17: 200 ms address reveal */));browser.typed=u.href.slice(0,at);const address=panel.querySelector('#computer-address');if(address)address.textContent=browser.typed;if(at>=u.href.length){finishTyping?.();}},20);});if(token!==epoch)return;await prepareDocument(browser.url);if(token!==epoch)return;browser.loading=false;render();save();}
 async function choose(key,kind=program){if(pointerPosition){positions[program]=pointerPosition;sessionStorage.setItem('room.computer.positions',JSON.stringify(positions));pointerPosition=null;}else remember();const token=++epoch;pendingChoice=token;selected=0;message='';if(kind==='news'){detail=news.find(r=>r.recordId===key);if(detail){read.add(key);try{localStorage.setItem('room.computer.read',JSON.stringify([...read]));}catch{}}}else {const r=await record(key);if(token!==epoch)return;const nativeHTML=await readerHTML(r);if(token!==epoch)return;detail={...r,nativeHTML};}if(pendingChoice===token)pendingChoice=0;program=kind;render();panel.querySelector('#computer-body').scrollTo(0,0);save();}
 async function execute(value){const [verb,...args]=value.trim().split(/\s+/),arg=args.join(' ');command='';effect('keys');if(!verb)return;if(verb==='help'){message='1–3 programs · ↑ ↓ choose · Enter opens · Esc leaves · ls · man NAME · news · open URL';render();return;}if(verb==='ls')return show('programs');if(verb==='man'){const shown=await show('programs');if(shown!==epoch)return false;const entry=manuals.find(r=>[r.key,r.key.replace(/^software-/,''),r.fields?.name,r.title].some(v=>String(v).toLowerCase()===arg.toLowerCase()));if(entry)return choose(entry.key,'programs');message='Program not found. Type ls.';render();return;}if(PROGRAMS.includes(verb))return show(verb);if(verb==='open'&&arg)return open(arg);message='Command not found. Type help.';render();}
 // round24: focused phosphor rows own the arrow cursor.
 panel.addEventListener('pointerdown',e=>{if(!detail&&e.target.closest('[data-item]'))pointerPosition={scroll:panel.querySelector('#computer-body').scrollTop,selected:[...panel.querySelectorAll('#computer-body [data-item]')].indexOf(e.target.closest('[data-item]'))};},true);
 panel.addEventListener('focusin',e=>{const rows=[...panel.querySelectorAll('#computer-body [data-item]')],i=rows.indexOf(e.target);if(i>=0){selected=i;rows.forEach((b,n)=>b.toggleAttribute('aria-current',n===i));if(!restoringList&&!pointerPosition)e.target.scrollIntoView({block:'nearest',behavior:motion.matches?'instant':'smooth'});if(!restoringList&&!pointerPosition)remember();}});
 async function back(){const saved={...positions[program]};restoringList=true;try{await show(program,{push:false});panel.querySelector('#computer-body').scrollTop=saved.scroll||0;}finally{restoringList=false;}}
 function scroll(delta,target){let area=target?.closest?.('#computer-body');if(!area)area=panel.querySelector('#computer-body');area?.scrollBy({top:delta*1024/Math.max(1,panel.getBoundingClientRect().width),behavior:motion.matches?'instant':'smooth'});remember();}
 panel.addEventListener('input',e=>{if(e.target.id==='computer-input'){command=e.target.value;paintRest();}});
 panel.addEventListener('submit',e=>{e.preventDefault();(program==='browser'&&!browser?open(e.target.querySelector('input').value):execute(command)).catch(fail);});
 function fail(error){message='This item could not load. Choose a program to retry.';console.error('Computer item',error);render();}
 panel.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b)return;if(b.matches('button[type=submit]'))return;if(b.matches('[data-new-tab]')||b.getAttribute('href')?.startsWith('mailto:'))return;e.preventDefault();e.stopPropagation();effect('keys');let result;if(b.hasAttribute('data-leave'))result=api.exit?.();else if(b.dataset.program)result=show(b.dataset.program);else if(b.dataset.item)result=choose(b.dataset.item,b.dataset.kind);else if(b.hasAttribute('data-back'))result=show(program);else if(b.dataset.play)result=open(b.dataset.play,{title:detail.title,description:detail.fields.event,kind:'video'});else if(b.dataset.url)result=open(b.dataset.url,{title:b.dataset.title,description:b.dataset.description});Promise.resolve(result).catch(fail);});
 document.addEventListener('keydown',e=>{if(!visible||e.ctrlKey||e.metaKey||e.altKey)return;const input=e.target.matches?.('input,textarea');if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();api.exit?.();return;}if(input)return;const buttons=[...panel.querySelectorAll(program==='home'?'#computer-body [data-program]':'#computer-body [data-item]')];if(/^\d$/.test(e.key)&&Number(e.key)>0){e.preventDefault();e.stopImmediatePropagation();show(PROGRAMS[Number(e.key)]||program).catch(fail);return;}if(['ArrowUp','ArrowDown'].includes(e.key)&&buttons.length){e.preventDefault();e.stopImmediatePropagation();selected=(selected+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons.forEach((b,i)=>b.toggleAttribute('aria-current',i===selected));buttons[selected].focus({preventScroll:true});buttons[selected].scrollIntoView({block:'nearest',behavior:motion.matches?'instant':'smooth'});paintRest();return;}if(e.key.length===1&&(e.key!==' '||!e.target.closest('a,button'))){e.preventDefault();e.stopImmediatePropagation();const input=panel.querySelector('input');if(!input)return;input.focus({preventScroll:true});input.value=command=e.key;paintRest();}},true);
 function cancelPending(){if(!pendingChoice)return false;++epoch;pendingChoice=0;detail=null;render();return true;} // round22-a
 function cancel(){remember();pendingChoice=0;++epoch;finishTyping?.();program='news';detail=null;browser=null;selected=0;command='';message='';clearInterval(typing);booting=false;delete panel.dataset.booting;visible=false;panel.style.opacity='0';panel.hidden=true;room.setCRTTextGain?.(1);panel.querySelector('iframe')?.remove();} // round16-ux
 function hide(){remember();if(panel.hidden)return Promise.resolve();const token=++fadeEpoch;finishTyping?.();++epoch;paintRest(true);return phosphor26c(0).then(()=>{if(token===fadeEpoch){visible=false;panel.hidden=true;panel.querySelector('iframe')?.remove();paintRest(true);}});}

 function frame(){
  if(!visible){if(window.roomLoading?.snapshot.welcomeRetained){window.roomLoading.tickWelcome();return;}if(room.state.view==='home'){const next=matchMedia('(prefers-reduced-motion: reduce)').matches||Math.floor(performance.now()/700)%2===0;if(next!==cursor){cursor=next;paintRest();}}return;}
  // round26c: the DOM face stays mapped to the glass throughout the lean.
  // round19-q: inscribe the flat 4:3 live document inside the tube so glyphs retain their aspect.
  const ps=(room.monitor23?.glass||cfg.crt).map(p=>new T.Vector3(...p)) // round23
,center=ps.reduce((v,p)=>v.add(p),new T.Vector3()).multiplyScalar(.25),right=ps[1].clone().sub(ps[0]),down=ps[3].clone().sub(ps[0]),fit=Math.min(1,right.length()/down.length()/(W/H));
  const corners=ps.map(p=>{const offset=p.clone().sub(center),vertical=down.clone().normalize();return p.clone().addScaledVector(vertical,-offset.dot(vertical)*(1-fit)).project(room.camera)}).map(p=>[(p.x+1)*innerWidth/2,(1-p.y)*innerHeight/2]);const h=homography([[0,0],[W,0],[W,H],[0,H]],corners);if(h){const projection=matrix(h).join(',');if(projection!==lastProjection){panel.style.transform='matrix3d('+projection+')';lastProjection=projection;}}
 }

 const computer={open,show,choose,back,scroll,cancelPending,idleLine,hide,cancel,frame,rest:paintRest,execute,ready:load,restore:s=>show(s.program,{push:false,resume:s}),get state(){return{program,detail,browser,powered,visible,booting,layerOpacity:Number(panel.style.opacity||0),layerHidden:panel.hidden,newsCount:news.length,selected,positions,idleNews}}};
 // round14-welcome: replace the note with the sourced news line at entry.
 // round26d: the welcome has faded to black before the News phosphor rises.
 room.onEnter?.(async()=>{
  window.roomLoading?.dismissWelcome();
  let start=null;
  await new Promise(resolve=>{
   const frame=t=>{
    const now=window.roomMotion26c.tick(t);
    start??=now;
    const progress=Math.min(1,(now-start)/160);
    paintRest(false,1-progress);
    if(progress<1)requestAnimationFrame(frame);else resolve();
   };
   requestAnimationFrame(frame);
  });
  restReady=true;
 });
 return computer;
}
