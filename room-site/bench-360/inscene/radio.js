// round27-r: baked desk radio and the shared interaction descriptor.
export async function createRadio({a,sound,mode}){
 const n=a.contentNative,T=n.toolkit,V=T.Vector3,program=sound.radio||await sound.radioReady;
 if(!program)throw Error('Radio programme is unavailable');
 const base='/bench-360/radio/',geometry=fetch(base+'geometry.json.gz').then(response=>{
  if(!response.ok)throw Error('Radio geometry HTTP '+response.status);
  return new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).json();
 });
 const root=new T.Group();root.name='live_radio27';
 const lamp={value:0},groups=new Map(),loadedTextures=[];
 async function texture(name){const r=await fetch(base+name);if(!r.ok)throw Error('Radio texture HTTP '+r.status);const bitmap=await createImageBitmap(await r.blob()),canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;canvas.getContext('2d').drawImage(bitmap,0,0);bitmap.close();const t=n.texture(canvas,'radio27-'+name,{sharedPool:false});t.name='radio27.'+name;loadedTextures.push(t);return t;}
 const [data,map,contact]=await Promise.all([geometry,texture('combined.png'),texture('contact.png')]);
 const shader=(tex,shadow=false,diffuseGain=1,weave=false)=>new T.ShaderMaterial({transparent:shadow,depthWrite:!shadow,side:T.DoubleSide,uniforms:{map:{value:tex},diffuseGain:{value:diffuseGain},weave:{value:weave?1:0},lamp,dialCentre:{value:new V(...data.dial)},deskCentre:{value:new T.Vector2(data.dial[0]-.035,data.dial[2]+.08)}},vertexShader:'varying vec2 v;varying vec3 world;void main(){v=uv;world=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:shadow?'uniform sampler2D map;uniform float lamp;uniform vec2 deskCentre;varying vec2 v;varying vec3 world;void main(){float ao=texture2D(map,v).r;float shadow=clamp((1.-ao)*.65,0.,.48);gl_FragColor=vec4(0.,0.,0.,shadow);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}':'uniform sampler2D map;uniform float lamp;uniform float diffuseGain,weave;uniform vec3 dialCentre;varying vec2 v;varying vec3 world;void main(){vec3 c=texture2D(map,v).rgb*diffuseGain;vec2 threads=vec2(dot(world.xz,vec2(.921,.389)),world.y)*680.;vec2 fade=1.-smoothstep(vec2(.28),vec2(.85),fwidth(threads));vec2 strand=sin(6.28318*threads);float interlace=cos(3.14159*floor(threads.x))*cos(3.14159*floor(threads.y));c*=1.+weave*(.18*dot(strand,fade)+.14*interlace*strand.x*strand.y*fade.x*fade.y);float r=length(world-dialCentre);float dial=1.-smoothstep(.023,.026,r);c+=vec3(.30,.125,.018)*lamp*dial*exp(-r*r/ .00065);gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
 const material=shader(map),clothMaterial=shader(map,false,1.44,true),shadowMaterial=shader(contact,true);
 // The clear cover keeps the printed scale and needle behind glass.
 const glassMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{lamp},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float lamp;varying vec2 v;void main(){vec2 p=(v-.5)*2.;float edge=pow(clamp(length(p),0.,1.),6.);float glint=exp(-pow((p.x+p.y*.6+.65)*10.,2.))*.06;gl_FragColor=vec4(vec3(.45,.56,.58)+vec3(.08,.035,.0)*lamp,edge*.075+glint);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});

 // Coalesce the model's small knurls and markings into one draw per moving part.
 for(const mesh of data.meshes){
  // The tuning spindle runs under the separate title window.
  if(/dial pin$/.test(mesh.name))continue;
  const kind=/dial graduation/.test(mesh.name)?'scale':/station mark/.test(mesh.name)?'marks':/woven speaker/.test(mesh.name)?'cloth':mesh.group;mesh.group=kind;const g=groups.get(kind)||{position:[],uv:[]};for(const key of ['position','uv'])g[key].push(...mesh[key]);groups.set(mesh.group,g);}
 const scaleMaterial=new T.ShaderMaterial({uniforms:{lamp},vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float lamp;void main(){gl_FragColor=vec4(mix(vec3(.22,.24,.19),vec3(.72,.52,.25),lamp),1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'}),redMaterial=new T.ShaderMaterial({vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'void main(){gl_FragColor=vec4(.48,.032,.018,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
 const moving={};
 for(const [group,attrs]of groups){const g=n.geometry(new T.BufferGeometry());for(const [key,array]of Object.entries(attrs))g.setAttribute(key,new T.Float32BufferAttribute(array,key==='uv'?2:3));
 if(group==='marks'){
  const p=g.attributes.position,[cx,cy,cz]=data.dial;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i)-cx,y=p.getY(i)-cy,z=p.getZ(i)-cz,u=x*.921+z*.389;
   const r=Math.hypot(u,y),scale=1+.0035/Math.max(r,1e-5);
   p.setXYZ(i,cx+x+(scale-1)*u*.921,cy+scale*y,cz+z+(scale-1)*u*.389);
  }
 }
 g.computeBoundingSphere();const mesh=new T.Mesh(g,group==='contact'?shadowMaterial:group==='glass'?glassMaterial:group==='scale'?scaleMaterial:['needle','marks'].includes(group)?redMaterial:group==='cloth'?clothMaterial:material);mesh.name='live_radio27_'+group;mesh.userData={picking_id:'radio27',source_name:'radio27_'+group,planarReflectionExcluded:true};if(group==='contact'){mesh.raycast=()=>{};mesh.renderOrder=2;}root.add(mesh);if(['power','volume','needle'].includes(group)){const pivot=new V(...data[group==='needle'?'dial':group]),p=g.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)-pivot.x,p.getY(i)-pivot.y,p.getZ(i)-pivot.z);if(group==='needle')for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),across=x*.921+z*.389;
  const r=Math.hypot(across,y),gain=r>1e-5?(.0205+r*.13)/r:1;
  p.setXYZ(i,x+(gain-1)*across*.921,y*gain,z+(gain-1)*across*.389);
 }g.computeBoundingSphere();mesh.position.copy(pivot);moving[group]=mesh;}}
 // round27-r: keep passive neighbours clear without editing the shared baked stage.
 const neighbourMoves=[];
 function clearanceShift(name){return /coiled_lead_workstation_tail|(?:^|__)crt_video(?:__|$)/.test(name)?new V(-.25,0,0):/whale|shark/i.test(name)?new V(.41,0,0) /* round27-f: 3 cm more sill clearance */:/stapler/i.test(name)?new V(-.21,0,.07):null}
 function clearNeighbours(){a.scene.updateMatrixWorld(true);a.scene.traverse(mesh=>{if(!mesh.isMesh||mesh.name.startsWith('live_'))return;const g=mesh.geometry,p=g?.attributes.position;if(!p)return;
  if(mesh.userData.batchSources){mesh.userData.batchSources.forEach((record,i)=>{const shift=clearanceShift(record?.source_name||'');if(!shift)return;const m=new T.Matrix4();mesh.getMatrixAt(i,m);m.premultiply(mesh.matrixWorld.clone().invert().multiply(new T.Matrix4().makeTranslation(...shift.toArray())).multiply(mesh.matrixWorld));mesh.setMatrixAt(i,m);neighbourMoves.push({name:record.source_name,shift:shift.toArray()})});return;}
  const rows=mesh.userData.mergedSources;if(rows){for(const row of rows){const shift=clearanceShift(row.source.source_name);if(!shift)continue;const local=shift.clone().applyMatrix4(mesh.matrixWorld.clone().invert()).sub(new V().applyMatrix4(mesh.matrixWorld.clone().invert())),ids=new Set();for(let j=row.firstFace*3;j<row.endFace*3;j++)ids.add(g.index?g.index.getX(j):j);for(const i of ids)p.setXYZ(i,p.getX(i)+local.x,p.getY(i)+local.y,p.getZ(i)+local.z);p.needsUpdate=true;neighbourMoves.push({name:row.source.source_name,shift:shift.toArray()})}g.computeBoundingSphere();}
  else {const shift=clearanceShift(mesh.userData.source_name||mesh.name);if(shift){mesh.position.add(shift);mesh.updateMatrix();mesh.updateMatrixWorld(true);neighbourMoves.push({name:mesh.userData.source_name||mesh.name,shift:shift.toArray()})}}
 });}
 clearNeighbours();dispatchEvent(new CustomEvent('room-geometry-relocated27',{detail:neighbourMoves}));
 const contactMesh=root.children.find(m=>m.name==='live_radio27_contact');
 if(contactMesh){const warmMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.CustomBlending,blendSrc:T.OneFactor,blendDst:T.OneFactor,blendSrcAlpha:T.ZeroFactor,blendDstAlpha:T.OneFactor,uniforms:{lamp,origin:{value:new T.Vector2(data.dial[0],data.dial[2])},centre:{value:new T.Vector2(data.dial[0]-.045,data.dial[2]+.105)}},vertexShader:'varying vec3 w;void main(){w=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float lamp;uniform vec2 centre;uniform vec2 origin;varying vec3 w;void main(){vec2 p=w.xz-centre;float r=length(w.xz-origin);float pool=exp(-dot(p*vec2(8.,9.),p*vec2(8.,9.)))*(1.-smoothstep(.19,.25,r));gl_FragColor=vec4(vec3(.065,.025,.004)*pool*lamp,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'}),pool=new T.Mesh(n.geometry(contactMesh.geometry.clone()),warmMaterial);const pp=pool.geometry.attributes.position;for(let i=0;i<pp.count;i++)pp.setXYZ(i,data.origin[0]+(pp.getX(i)-data.origin[0])*1.5,pp.getY(i),data.origin[2]+(pp.getZ(i)-data.origin[2])*4.);pool.geometry.computeBoundingSphere();pool.name='live_radio27_lamp_pool';pool.position.y=.0003;pool.renderOrder=3;pool.raycast=()=>{};pool.userData.planarReflectionExcluded=true;root.add(pool);}
 a.scene.add(root);root.updateMatrixWorld(true);
 const frontCenter=new V(...(data.front||[data.origin[0],data.origin[1]+.075,data.origin[2]+.057])),dialPoint=new V(...data.dial),box=new T.Box3().setFromObject(root),bodyBox=new T.Box3(new V(data.origin[0]-.13,data.origin[1],data.origin[2]-.05),new V(data.origin[0]+.13,data.origin[1]+.155,data.origin[2]+.07));
 const hit=document.createElement('button');hit.id='radio27-hit';hit.type='button';hit.setAttribute('aria-keyshortcuts','R E Enter');hit.style.cssText='position:fixed;z-index:14;background:transparent;color:transparent;border:0;padding:0;cursor:pointer;';document.body.append(hit);
 const prompt=document.createElement('div');prompt.id='radio27-prompt';prompt.setAttribute('role','status');document.body.append(prompt);
 const style=document.createElement('style');
 style.textContent='#radio27-hit:focus-visible{outline:1px solid #ead2a5;outline-offset:3px}#radio27-prompt{position:fixed;z-index:16;pointer-events:none;color:#ece5d5;font:13px "Courier New";text-shadow:0 1px 3px #000;background:#081319dc;padding:5px 7px;opacity:0}#radio27-prompt span{display:block;font-size:11px;margin-top:3px}#radio27-prompt[data-show]{opacity:1}#radio27-dial{position:fixed;width:1px;height:1px;clip-path:inset(50%);overflow:hidden}';
 document.head.append(style);
 const dialNormal=new V(-Math.sin(.4),0,Math.cos(.4)),dialRight=new V(Math.cos(.4),0,Math.sin(.4));
 const printWidth=1280,printHeight=848;
 const typeCanvas=document.createElement('canvas');typeCanvas.width=256;typeCanvas.height=283;
 const ink=typeCanvas.getContext('2d');
 let typeMap=n.texture(typeCanvas,'radio-dial-ink',{mips:false,sharedPool:false});
 const typeMaterial=new T.ShaderMaterial({
  uniforms:{map:{value:typeMap},lamp},depthWrite:false,
  vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D map;uniform float lamp;varying vec2 v;void main(){float ink=texture2D(map,v).r;vec3 stock=mix(vec3(.025,.017,.009),vec3(.090,.049,.012),lamp);vec3 letters=mix(vec3(.63,.52,.34),vec3(.96,.83,.56),lamp);gl_FragColor=vec4(mix(stock,letters,ink),1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
 });
 const typeGeometry=n.geometry(new T.PlaneGeometry(.0355,.0235));
 const uv=typeGeometry.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));
 const typeFace=new T.Mesh(typeGeometry,typeMaterial);typeFace.name='live_radio27_dial_ink';
 typeFace.position.copy(dialPoint).addScaledVector(dialNormal,-.00082);
 typeFace.position.y-=.001;
 typeFace.rotation.y=-.4;typeFace.renderOrder=0;typeFace.raycast=()=>{};
 typeFace.userData.planarReflectionExcluded=true;root.add(typeFace);
 const disc=document.createElement('div');disc.id='radio27-dial';disc.hidden=true;disc.tabIndex=-1;disc.setAttribute('role','dialog');disc.setAttribute('aria-label','Change station');disc.setAttribute('aria-modal','true');
 const stationButtons=program.stations.map((station,i)=>{const b=document.createElement('button');b.type='button';b.textContent=station.name;b.setAttribute('role','radio');b.onclick=e=>{e.stopPropagation();choose(i);closeDial()};disc.append(b);return b});
 const centre=document.createElement('button');centre.type='button';centre.onclick=e=>{e.stopPropagation();program.next(candidate);paintDial()};disc.append(centre);document.body.append(disc);
 let focus=false,opened=false,candidate=program.state.station,original=candidate,press=null,holdTimer=0,suppressClick=0,volumeDrag=null,registered=false,lastFrame=0,smoothedLamp=program.state.on?1:0,knobPower=0,knobVolume=(program.state.volume-.5)*Math.PI*1.5,needleLevel=0,meter=null,screen=null,screenView=null,screenFov=0,screenAspect=0,lastLabel='',returnView='home',openingPointer=null,needleAngle=candidate*2*Math.PI/3,painted='';
 const events=[];const event=(kind,extra={})=>{events.push({kind,at:performance.now(),...extra});if(events.length>256)events.shift()};
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 const point=p=>{const v=p.clone().project(a.camera);return {x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2,front:v.z<1}};
 const promptText=()=>({verb:program.state.on?'Switch off':'Switch on',noun:'the radio',secondary:'Hold · Change station'});
 function power(){sound.tactile?.('stop',.65);program.power();event('switch',{on:program.state.on});updateLabel()}
 function updateLabel(){const p=promptText(),label=p.verb+' '+p.noun;hit.setAttribute('aria-label',label);if(label!==lastLabel){prompt.innerHTML='<kbd>E</kbd> '+label+'<span>'+p.secondary+'</span>';lastLabel=label;}}
 function printLines(value,y,size,lineHeight,face='Arial'){
  const limit=1166;
  ink.font=size+'px '+face;
  let lines=[value];
  if(ink.measureText(value).width>limit){
   const words=value.split(/\s+/);
   let shortest=Infinity;
   for(let i=1;i<words.length;i++){
    const pair=[words.slice(0,i).join(' '),words.slice(i).join(' ')];
    const width=Math.max(...pair.map(row=>ink.measureText(row).width));
    if(width<shortest){shortest=width;lines=pair}
   }
  }
  lines.forEach((row,i)=>ink.fillText(row,printWidth/2,y+(i-(lines.length-1)/2)*lineHeight,limit));
 }
 function dialPrintDensity(close){
  const width=close?512:256;
  if(typeCanvas.width===width)return;
  n.releaseTexture(typeMap);
  typeCanvas.width=width;typeCanvas.height=Math.round(width*848/768);
  typeMap=typeMaterial.uniforms.map.value=n.texture(typeCanvas,'radio-dial-ink',{mips:false,sharedPool:false});
  painted='';paintDial();n.update(typeMap);
 }
 function paintDial(){
  const piece=program.stations[candidate].pieces[program.state.pieces[candidate]];
  const signature=candidate+':'+piece.work+':'+piece.performerAsStated;
  if(signature===painted)return;
  painted=signature;ink.setTransform(typeCanvas.width/printWidth,0,0,typeCanvas.height/printHeight,0,0);ink.clearRect(0,0,printWidth,printHeight);ink.fillStyle='#000';ink.fillRect(0,0,printWidth,printHeight);ink.textAlign='center';ink.textBaseline='middle';ink.fillStyle='#fff';
  ink.strokeStyle='#ffffff59';ink.lineWidth=7;ink.strokeRect(12,12,printWidth-24,printHeight-24);
  printLines(program.stations[candidate].name,184,174,162);
  printLines(piece.work,493,153,149);
  if(piece.performerAsStated)printLines(piece.performerAsStated,744,60,62,'Courier New');
  typeMap.needsUpdate=true;
  centre.textContent=piece.work;centre.setAttribute('aria-label',piece.work+' · Next piece');
  stationButtons.forEach((b,i)=>b.setAttribute('aria-checked',String(i===candidate)));
 }
 function detent(){sound.tactile?.('radio-detent',.8);program.noise(.2);event('detent',{candidate,staticMilliseconds:200})}
 function choose(next){const value=((next%program.stations.length)+program.stations.length)%program.stations.length;if(value===candidate)return;candidate=value;paintDial();detent()}
 let openingCamera;
 function openDial(input){
  if(opened||mode())return;
  opened=true;openingPointer=input?.pointerId??press?.pointer??null;if(press)press.dial=true;
  original=program.state.station;candidate=original;dialPrintDensity(true);paintDial();hit.removeAttribute('data-hold');focus=true;
  returnView=a.state.view==='radio_dial32'?returnView:a.state.view;
  a.interaction.cancelNavigation();
  const cam=a.camera.clone();cam.position.copy(dialPoint).addScaledVector(dialNormal,.269).addScaledVector(dialRight,-.048);
  cam.position.y+=.041;
  cam.lookAt(dialPoint.clone().addScaledVector(dialRight,-.040).add(new V(0,-.007,0)));cam.updateMatrixWorld(true);
  const pose={matrix:cam.matrixWorld.toArray(),fov:37};
  a.states.views.radio_dial32=pose;if(a.states.cameras)a.states.cameras.radio_dial32=pose;
  openingCamera=a.dollyTo('radio_dial32',reduced()?1:920);
  disc.inert=false;disc.hidden=false;disc.focus({preventScroll:true});event('dial-open',{station:original});
 }
 function closeDial(returnCamera=true){
  if(!opened)return;
  opened=false;disc.inert=true;disc.hidden=true;
  program.station(candidate);program.power(true);paintDial();
  a.renderer.domElement.focus({preventScroll:true});
  if(returnCamera){
   const opening=openingCamera, destination=returnView;
   void opening.then(async result=>{
    if(opened||opening!==openingCamera)return;
    // Let a released hold settle its approach before reversing the camera.
    if(!result?.cancelled)await a.dollyTo(destination,reduced()?1:1340);
    if(!opened&&opening===openingCamera)dialPrintDensity(false);
   });
  }else dialPrintDensity(false);
  event('dial-close',{commit:true,station:program.state.station});
 }
 const dialDirection=new V(),dialHit=new V();
 function aim(e){
  if(!opened)return;
  dialDirection.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2,.5).unproject(a.camera).sub(a.camera.position);
  const along=dialHit.copy(dialPoint).sub(a.camera.position).dot(dialNormal)/dialDirection.dot(dialNormal);
  if(!(along>0))return;
  dialHit.copy(a.camera.position).addScaledVector(dialDirection,along).sub(dialPoint);
  const x=dialHit.dot(dialRight)/.025,y=dialHit.y/.0278,r=Math.hypot(x,y);
  if(r<.48)return 'piece';
  if(r>1.14)return;
  const angle=(Math.atan2(x,y)+2*Math.PI)%(2*Math.PI);choose(Math.round(angle/(2*Math.PI/3)));return 'station';
 }
 function start(e){if(e.button>0)return;e.preventDefault();e.stopImmediatePropagation();press={x:e.clientX,y:e.clientY,at:performance.now(),pointer:e.pointerId};hit.setPointerCapture?.(e.pointerId);hit.dataset.hold='';focus=true;event('press');holdTimer=setTimeout(()=>{openDial();suppressClick=performance.now()+500},250);}
 function release(e){if(!press)return;e.preventDefault();e.stopImmediatePropagation();clearTimeout(holdTimer);hit.removeAttribute('data-hold');const held=performance.now()-press.at;press=null;if(opened){aim(e);closeDial()}else if(held<250)power();suppressClick=performance.now()+500;event('release',{held});}
 hit.addEventListener('pointerdown',start);hit.addEventListener('pointerup',release);hit.addEventListener('pointercancel',()=>{clearTimeout(holdTimer);press=null;hit.removeAttribute('data-hold');if(opened)closeDial()});hit.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();if(performance.now()>suppressClick)opened?closeDial():power()});
 hit.onpointerenter=()=>{focus=true};hit.onpointerleave=()=>{if(document.activeElement!==hit&&!opened)focus=false};hit.onfocus=()=>{focus=true};hit.onblur=()=>{if(!opened)focus=false};
 hit.addEventListener('pointermove',e=>{if(press&&opened)aim(e)});

 function wheel(e){e.preventDefault();e.stopImmediatePropagation();if(e.shiftKey){program.volume(program.state.volume-Math.sign(e.deltaY)*.04);sound.tactile?.('tick',.25)}else{if(!opened)openDial();choose(candidate+Math.sign(e.deltaY))}}
 hit.addEventListener('wheel',wheel,{passive:false});
 window.addEventListener('wheel',e=>{if(opened&&e.target===a.renderer.domElement)wheel(e)},{capture:true,passive:false});
 // The physical right knob has its own rim drag, projected each frame.
 const tuneHit=document.createElement('button');tuneHit.id='radio33-tune';tuneHit.type='button';
 tuneHit.setAttribute('aria-label','Change station');tuneHit.style.cssText=hit.style.cssText+'z-index:15;cursor:grab;';document.body.append(tuneHit);
 let tuneDrag;
 tuneHit.onpointerdown=e=>{if(e.button!==0)return;e.stopPropagation();tuneHit.setPointerCapture(e.pointerId);tuneDrag={x:e.clientX,y:e.clientY,station:candidate,moved:false};};
 tuneHit.onpointermove=e=>{if(!tuneDrag)return;const delta=e.clientX-tuneDrag.x+tuneDrag.y-e.clientY;
  if(Math.abs(delta)>12)tuneDrag.moved=true;
  if(tuneDrag.moved)choose(tuneDrag.station+Math.round(delta/34));
 };
 tuneHit.onpointerup=e=>{e.stopPropagation();if(tuneDrag?.moved)tuneHit.dataset.dragged='';tuneDrag=null;};
 tuneHit.onpointercancel=()=>{tuneDrag=null;delete tuneHit.dataset.dragged;};
 tuneHit.onclick=e=>{e.stopPropagation();if(!('dragged' in tuneHit.dataset))choose(candidate+1);delete tuneHit.dataset.dragged;};
 tuneHit.addEventListener('wheel',wheel,{passive:false});
 const volumeHit=document.createElement('button');volumeHit.id='radio27-volume';volumeHit.type='button';volumeHit.setAttribute('aria-label','Radio volume');volumeHit.style.cssText=hit.style.cssText+'z-index:15;cursor:grab;';document.body.append(volumeHit);
 volumeHit.addEventListener('pointerdown',e=>{e.preventDefault();e.stopImmediatePropagation();focus=true;gripVolume(e);volumeHit.setPointerCapture(e.pointerId);volumeHit.style.cursor='grabbing';event('volume-grip')});
 function gripVolume(e){const c=point(new V(...data.volume));return volumeDrag={x:e.clientX,y:e.clientY,cx:c.x,cy:c.y,value:program.state.volume,last:0,degrees:0}}
 function moveVolume(e){if(!volumeDrag)return;const d=volumeDrag,dx=e.clientX-d.x,dy=e.clientY-d.y,ax=d.x-d.cx,ay=d.y-d.cy,bx=e.clientX-d.cx,by=e.clientY-d.cy,r0=Math.hypot(ax,ay),r1=Math.hypot(bx,by),cross=ax*by-ay*bx;d.degrees+=r0<1||r1<1?(dx-dy)*1.2:Math.atan2(cross,ax*bx+ay*by)*(r0+r1)*.5*1.2;d.x=e.clientX;d.y=e.clientY;const detent=Math.round(d.degrees/15);program.volume(d.value+d.degrees/270);if(detent!==d.last){sound.tactile?.('tick',.24);d.last=detent}}
 volumeHit.addEventListener('pointermove',moveVolume);
 const endVolume=e=>{if(!volumeDrag)return;e.preventDefault();e.stopImmediatePropagation();volumeDrag=null;volumeHit.style.cursor='grab';event('volume-release')};volumeHit.addEventListener('pointerup',endVolume);volumeHit.addEventListener('pointercancel',endVolume);volumeHit.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault()});volumeHit.addEventListener('wheel',e=>{e.preventDefault();e.stopImmediatePropagation();program.volume(program.state.volume-Math.sign(e.deltaY)*.04)},{passive:false});
 // round27-f
 const descriptor={id:'radio27',object:root,bounds:()=>bodyBox,anchor:()=>frontCenter.clone(),prompt:promptText,primary:power,secondary:{hold:openDial,wheel,drag:{start:e=>{const c=point(new V(...data.volume));if(Math.hypot(e.clientX-c.x,e.clientY-c.y)>24)return false;gripVolume(e);return true},move:moveVolume,end:()=>{volumeDrag=null}}},key:'R',views:['home','rear'],state:()=>program.snapshot()};
 function register(){if(!registered&&window.roomGrammar?.register){window.roomGrammar?.register(descriptor);registered=true;event('grammar-registered')}}register();
 // Capture the fallback before the existing room's R shortcut and canvas handlers.
 const keyDown=e=>{if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest?.('input,textarea,select,[contenteditable]')||mode()&&!opened)return;const key=e.key.toLowerCase();if(opened){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeDial();return}if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' '].includes(e.key)&&!(e.target.closest?.('#scene-controls')&&['Enter',' '].includes(e.key))){e.preventDefault();e.stopImmediatePropagation();if(e.key==='Enter'||e.key===' ')closeDial();else choose(candidate+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1));return}if(e.key==='Tab'&&disc.contains(e.target)&&e.target!==stationButtons[e.shiftKey?0:stationButtons.length-1]){e.preventDefault();e.stopImmediatePropagation();const buttons=[...stationButtons,centre],index=buttons.indexOf(document.activeElement);buttons[(index+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();return}}
  if((key==='r'&&!registered)||((registered?window.roomGrammar?.focus==='radio27':focus)&&['[',']'].includes(e.key))||(!registered&&focus&&['e','Enter'].includes(e.key))){e.preventDefault();e.stopImmediatePropagation();if(e.key==='['||e.key===']'){program.volume(program.state.volume+(e.key===']'?.04:-.04));return}if(e.repeat)return;focus=true;hit.focus({preventScroll:true});press={at:performance.now(),keyboard:true};hit.dataset.hold='';event('press',{key:e.key});holdTimer=setTimeout(openDial,250);}}
 const keyUp=e=>{if(registered&&opened&&['r','e','enter'].includes(e.key.toLowerCase())){e.preventDefault();e.stopImmediatePropagation();closeDial();return;}if(!press?.keyboard)return;if(!['r','e','enter'].includes(e.key.toLowerCase()))return;e.preventDefault();e.stopImmediatePropagation();clearTimeout(holdTimer);hit.removeAttribute('data-hold');if(opened)closeDial();else if(!press.dial)power();press=null;};
 window.addEventListener('pointermove',e=>{if(registered&&opened&&e.target===a.renderer.domElement)aim(e)},true);
 window.addEventListener('pointerdown',e=>{
  if(!opened||e.target!==a.renderer.domElement)return;
  e.preventDefault();e.stopImmediatePropagation();
 },true);
 window.addEventListener('pointerup',e=>{
  if(!registered||!opened||e.target!==a.renderer.domElement)return;
  const target=aim(e);
  if(target==='piece'&&e.pointerId!==openingPointer){program.next(candidate);paintDial();}
  else closeDial();
 },true);
 window.addEventListener('click',e=>{
  if(opened&&e.target.closest?.('#scene-sections,#scene-name,#scene-credits'))closeDial(false);
 },true);
 window.addEventListener('keydown',keyDown,true);window.addEventListener('keyup',keyUp,true);
 function attachMeter(){
  const pieces=[];a.scene.updateMatrixWorld(true);
  a.scene.traverse(mesh=>{if(!mesh.isMesh||mesh.name.startsWith('live_'))return;const g=mesh.geometry,p=g?.attributes.position;if(!p)return;const ids=new Set(),ranges=mesh.userData.mergedSources;
   if(mesh.userData.batchSources){for(const [instance,record]of mesh.userData.batchSources.entries())if(/multimeter_needle/.test(record?.source_name||'')){const info=mesh._geometryInfo[mesh._instanceInfo[instance].geometryIndex],matrix=new T.Matrix4();mesh.getMatrixAt(instance,matrix);const world=mesh.matrixWorld.clone().multiply(matrix),bounds=new T.Box3();for(let i=info.vertexStart;i<info.vertexStart+info.vertexCount;i++)bounds.expandByPoint(new V().fromBufferAttribute(p,i).applyMatrix4(world));const pivot=bounds.getCenter(new V());pivot.y=bounds.min.y;pieces.push({mesh,instance,matrix,world,pivot});}return;}

   if(ranges){for(const row of ranges)if(/multimeter_needle/.test(row.source.source_name||''))for(let j=row.firstFace*3;j<row.endFace*3;j++)ids.add(g.index?g.index.getX(j):j)}
   else{const picks=g.getAttribute('_pick_id')||g.getAttribute('_PICK_ID');if(picks){for(let i=0;i<p.count;i++)if(/multimeter_needle/.test(a.objectManifest.objects[Math.round(picks.getX(i))-1]?.source_name||''))ids.add(i)}else if(/multimeter_needle/.test(mesh.userData.source_name||mesh.name))for(let i=0;i<p.count;i++)ids.add(i)}
   if(ids.size){const values=[...ids].map(i=>({i,p:new V().fromBufferAttribute(p,i)})),bounds=new T.Box3();for(const v of values)bounds.expandByPoint(v.p);const pivot=bounds.getCenter(new V());pivot.y=bounds.min.y;pieces.push({mesh,g,p,values,pivot,normal:g.attributes.normal?.array.slice()});}
  });return pieces;
 }
 function frame(now){
  const dt=Math.min(50,Math.max(0,now-(lastFrame||now)));lastFrame=now;register();const wanted=program.state.on?1:0;smoothedLamp+=Math.sign(wanted-smoothedLamp)*Math.min(Math.abs(wanted-smoothedLamp),dt/600);lamp.value=smoothedLamp;
  const settle=1-Math.exp(-dt/90);knobVolume+=((program.state.volume-.5)*Math.PI*1.5-knobVolume)*settle;
  if(moving.volume)moving.volume.quaternion.setFromAxisAngle(dialNormal,knobVolume);
  if(moving.needle){
   const target=(opened?candidate:program.state.station)*2*Math.PI/3;
   const delta=target-needleAngle;needleAngle+=Math.atan2(Math.sin(delta),Math.cos(delta))*settle;
   moving.needle.quaternion.setFromAxisAngle(dialNormal,-needleAngle);
  }
  if(moving.power){
   knobPower=needleAngle*.58+(wanted?.23:0)+(press?.12:0);
   moving.power.quaternion.setFromAxisAngle(dialNormal,knobPower);
   moving.power.position.set(...data.power).addScaledVector(dialNormal,press?-.002:0);
  }
  if(!a.establishedAt)return;
  const p=point(frontCenter),live=!mode()&&['home','turn_around'].includes(a.state.view)&&p.front;
  const hidden=!live||registered;
  tuneHit.hidden=!opened;
  if(hit.hidden!==hidden){hit.hidden=hidden;volumeHit.hidden=hidden;}
  // Retain the hit rectangle while the projected radio stays in place.
  if(!screen||Math.hypot(p.x-screen.center.x,p.y-screen.center.y)>.02||
    a.camera.fov!==screenFov||a.camera.aspect!==screenAspect||a.state.view!==screenView){
   const corners=data.corners.map(p=>point(new V(...p)));
   const xs=corners.map(v=>v.x),ys=corners.map(v=>v.y),left=Math.min(...xs),top=Math.min(...ys);
   const width=Math.max(...xs)-left,height=Math.max(...ys)-top;
   screen={left,top,width,height,center:p};
   screenFov=a.camera.fov;screenAspect=a.camera.aspect;screenView=a.state.view;
   const tune=point(new V(...data.power));
   Object.assign(tuneHit.style,{left:tune.x-31+'px',top:tune.y-31+'px',width:'62px',height:'62px'});
   const v=point(new V(...data.volume));
   Object.assign(volumeHit.style,{left:v.x-16+'px',top:v.y-16+'px',width:'32px',height:'32px'});
   if(!registered){
    Object.assign(hit.style,{left:left+'px',top:top+'px',width:Math.max(32,width)+'px',height:Math.max(32,height)+'px'});
    prompt.style.left=Math.max(8,Math.min(innerWidth-210,left+width+10))+'px';
    prompt.style.top=Math.max(60,Math.min(innerHeight-60,top))+'px';
   }
  }
  if(!registered)prompt.toggleAttribute('data-show',focus&&live&&!opened);
  program.spatial(Math.max(-.65,Math.min(.65,(p.x/innerWidth-.5)*1.3)),a.state.view==='turn_around');
  const oldMeterLevel=needleLevel,level=program.level;needleLevel+=(Math.min(1,level*18)-needleLevel)*(1-Math.exp(-dt/100));if(!program.state.on)needleLevel=0;
  if(meter===null||!meter.length&&Math.floor(now/1000)!==api.lastMeterRetry){meter=attachMeter();api.lastMeterRetry=Math.floor(now/1000);}if(Math.abs(needleLevel-oldMeterLevel)>1e-5)for(const piece of meter){if(piece.instance!==undefined){const around=new T.Matrix4().makeTranslation(...piece.pivot.toArray()).multiply(new T.Matrix4().makeRotationZ(needleLevel*.7)).multiply(new T.Matrix4().makeTranslation(-piece.pivot.x,-piece.pivot.y,-piece.pivot.z)),local=piece.mesh.matrixWorld.clone().invert().multiply(around).multiply(piece.world);piece.mesh.setMatrixAt(piece.instance,local);continue;}const c=Math.cos(needleLevel*.7),s=Math.sin(needleLevel*.7);for(const v of piece.values){const dx=v.p.x-piece.pivot.x,dy=v.p.y-piece.pivot.y;piece.p.setXYZ(v.i,piece.pivot.x+c*dx-s*dy,piece.pivot.y+s*dx+c*dy,v.p.z)}piece.p.needsUpdate=true;}
  api.proof={screen,lamp:smoothedLamp,meter:needleLevel,meterPieces:meter.length,registered,needleAngle,knobAngle:knobPower,state:program.snapshot(),dial:point(dialPoint),stations:opened?program.stations.map((_,i)=>{
    const angle=i*2*Math.PI/3,v=dialPoint.clone().addScaledVector(dialRight,.019*Math.sin(angle));v.y+=.021*Math.cos(angle);return point(v);
   }):null,textures:loadedTextures.map(t=>[t.image.width,t.image.height]),groups:groups.size};
 }
 const api={root,neighbourMoves,descriptor,events,program,frame,openDial,closeDial,get dialOpen(){return opened},get candidate(){return candidate},get focus(){return focus},proof:{}};window.roomRadio=api;program.onChange(()=>{updateLabel();if(!opened)candidate=program.state.station;paintDial()});updateLabel();paintDial();frame(performance.now());event('ready');return api;
}
