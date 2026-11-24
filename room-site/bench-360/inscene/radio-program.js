// round27-r: one complete recording at a time, after the master sound gesture.
import {radioStations} from './radio-stations.js';
const KEY='room.radio27';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export function createRadioProgram({engine,onChange=()=>{}}){
 let saved={};try{saved=JSON.parse(sessionStorage.getItem(KEY)||'{}')}catch{}
 const state={on:saved.on!==false,station:clamp(saved.station|0,0,2),volume:clamp(Number.isFinite(saved.volume)?saved.volume:1),pieces:[0,0,0],recording:false,loading:false,error:null};
 state.pieces=state.pieces.map((_,i)=>clamp(saved.pieces?.[i]|0,0,radioStations[i].pieces.length-1));
 const events=[],requests=[];let audio=null,ctx=null,gain=null,filter=null,pan=null,analyser=null,source=null,blob=null,loaded=null,abort=null,revision=0,timer=0,delayUntil=0,lastSpatial='',lastTitleAt=0,spatialGain=1,fadeUntil=0;
 const samples=new Float32Array(256),listeners=new Set();
 const piece=()=>radioStations[state.station].pieces[state.pieces[state.station]];
 const event=(kind,extra={})=>{events.push({kind,at:performance.now(),...extra});if(events.length>256)events.shift()};
 const persist=()=>{try{sessionStorage.setItem(KEY,JSON.stringify({on:state.on,station:state.station,volume:state.volume,pieces:state.pieces}))}catch{}};
 function tell(){persist();onChange();for(const fn of listeners)fn();}
 function ramp(param,to,seconds){const at=ctx.currentTime;if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(at);else{param.cancelScheduledValues(at);param.setValueAtTime(param.value,at)}param.linearRampToValueAtTime(to,at+seconds)}
 function build(){
  if(ctx||!engine.context||engine.context.state!=='running')return;
  ctx=engine.context;audio=new Audio();audio.preload='none';
  audio.addEventListener('ended',()=>next());
  audio.addEventListener('error',()=>{if(audio.getAttribute('src')){state.error='Radio recording unavailable';event('playback-error',{code:audio.error?.code});tell()}});
  source=ctx.createMediaElementSource(audio);gain=ctx.createGain();gain.gain.value=0;filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=16000;pan=ctx.createStereoPanner();analyser=ctx.createAnalyser();analyser.fftSize=512;
  source.connect(filter);filter.connect(pan);pan.connect(gain);gain.connect(analyser);analyser.connect(engine.output);
 }
 function unload(){revision++;abort?.abort();abort=null;state.loading=false;if(audio){audio.pause();audio.removeAttribute('src');audio.load()}if(blob)URL.revokeObjectURL(blob);blob=null;loaded=null;}
 async function load(){
  if(!audio||!state.on||!engine.enabled||state.recording)return;
  const track=piece();if(loaded===track.key||state.loading)return;
  unload();const token=revision,controller=abort=new AbortController(),opus=!!audio.canPlayType('audio/ogg; codecs="opus"'),url=track.stem+(opus?'.ogg':'.m4a');state.loading=true;requests.push({url,at:performance.now(),soundOn:engine.enabled,radioOn:state.on});
  try{const response=await fetch(url,{signal:controller.signal,priority:'low'});if(!response.ok)throw Error('HTTP '+response.status);const data=await response.blob();if(token!==revision)return;blob=URL.createObjectURL(data);audio.src=blob;loaded=track.key;state.loading=false;state.error=null;lastTitleAt=performance.now();event('piece',{station:state.station,key:track.key});tell();sync();}
  catch(error){if(error.name==='AbortError')return;state.loading=false;state.error=error.message;event('fetch-error',{url,message:error.message});tell()}
 }
 function sync(){
  if(!engine.enabled||!state.on||state.recording){if(audio&&!audio.paused){if(gain&&ctx?.state==='running'){ramp(gain.gain,0,.4);clearTimeout(timer);timer=setTimeout(()=>{if(!engine.enabled||!state.on||state.recording)audio?.pause()},410)}else audio.pause()}return;}
  build();if(!ctx||ctx.state!=='running')return;
  if(!loaded){void load();return;}
  if(loaded!==piece().key){void load();return;}
  const wait=Math.max(0,delayUntil-performance.now());clearTimeout(timer);
  timer=setTimeout(()=>{if(!state.on||!engine.enabled||state.recording||!audio)return;const wasPaused=audio.paused;if(wasPaused){gain.gain.cancelScheduledValues(ctx.currentTime);gain.gain.setValueAtTime(0,ctx.currentTime);fadeUntil=performance.now()+800;}audio.play().then(()=>{ramp(gain.gain,state.volume*spatialGain,.8);event('play',{key:piece().key});if(wasPaused)onChange()}).catch(error=>{state.error=error.message;event('play-error',{message:error.message});tell()})},wait);
 }
 function noise(duration=.2){
  if(!engine.enabled||!ctx||ctx.state!=='running')return;
  const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),d=b.getChannelData(0);let seed=27;
  for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;d[i]=(seed/2147483648-1)*Math.sin(Math.PI*i/d.length)*.016;}
  const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=b;g.gain.value=state.volume;const location=ctx.createStereoPanner();location.pan.value=pan?.pan.value||0;s.connect(g);g.connect(location);location.connect(engine.output);s.onended=()=>{s.disconnect();g.disconnect();location.disconnect()};s.start();event('static',{duration});
 }
 function power(on=!state.on){if(state.on===!!on)return;state.on=!!on;event('power',{on:state.on});if(state.on){delayUntil=performance.now()+250;build();noise(.25)}tell();sync()}
 function station(index){const n=((index%3)+3)%3;if(n===state.station)return;state.station=n;unload();delayUntil=performance.now()+200;event('station',{station:n});tell();sync()}
 function next(index=state.station){state.station=((index%3)+3)%3;state.pieces[state.station]=(state.pieces[state.station]+1)%radioStations[state.station].pieces.length;unload();event('next',{key:piece().key});tell();sync()}
 function volume(value){state.volume=clamp(value);if(gain&&state.on&&engine.enabled&&!state.recording)ramp(gain.gain,state.volume*spatialGain,.08);event('volume',{volume:state.volume});tell()}
 function spatial(x,rear){if(!ctx)return;const key=x.toFixed(2)+rear;if(key===lastSpatial)return;lastSpatial=key;spatialGain=rear?.72:1;pan.pan.setTargetAtTime(clamp(x,-.65,.65),ctx.currentTime,.2);filter.frequency.setTargetAtTime(rear?3600:16000,ctx.currentTime,.25);if(gain&&state.on&&engine.enabled&&!state.recording&&!audio?.paused&&performance.now()>=fadeUntil)gain.gain.setTargetAtTime(state.volume*(rear?.72:1),ctx.currentTime,.25)}
 return {state,events,requests,piece,stations:radioStations,sync,power,station,next,volume,noise,spatial,
  get title(){return piece().pill||piece().work},get titleAt(){return lastTitleAt},
  get playing(){return !!audio&&!audio.paused&&state.on&&engine.enabled&&!state.recording},
  get audio(){return audio},get analyser(){return analyser},
  get level(){if(!analyser||!state.on||!engine.enabled||state.recording||audio?.paused)return 0;analyser.getFloatTimeDomainData(samples);return Math.sqrt(samples.reduce((s,x)=>s+x*x,0)/samples.length)},
  recording(on){state.recording=!!on;event('recording',{on:!!on});if(on)audio?.pause();else sync();tell()},
  onChange(fn){listeners.add(fn);return()=>listeners.delete(fn)},
  snapshot(){return {...state,pieces:[...state.pieces],piece:piece().key,playing:this.playing,time:audio?.currentTime||0,level:this.level,pan:pan?.pan.value??0,cutoff:filter?.frequency.value??16000,spatialGain}}
 };
}
