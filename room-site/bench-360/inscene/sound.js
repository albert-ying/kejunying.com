// round20-desk
// round17b
// round17
import { createAudio, EFFECT_NAMES } from './audio.js';

// Round 12 brief (11 Nov): 13 px bordered sound capsule, amber when playing.
// Colour and face follow host.js's #ead2a5 focus mark and Courier room chrome.
const engines = new WeakMap();
const effects = new Set(EFFECT_NAMES);
const glyph = '<svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 8h3l4-4v12l-4-4H3z"/><path data-sound-waves d="M13 6q5 4 0 8M15 3q8 7 0 14"/></svg>';

// round14-music: select once per visit; the capsule and radio share this score.
export function selectRoomMusic(search = globalThis.location?.search ?? '') {
  const choice = new URLSearchParams(search).get('music');
  const scores = {
    a: { id: 'a', title: 'After the last experiment', duration: 160, stem: 'soundtrack', gain: 1 },
    b: { id: 'b', title: 'The tide below the window', duration: 150, stem: 'night-lab-b', gain: 1 },
    golden: { id: 'golden', title: 'Golden hour', duration: 160, stem: 'golden-hour', gain: 1.9953 },
  };
  const score = scores[choice === 'b' || choice === 'golden' ? choice : 'a'];
  const opus = typeof document === 'undefined' || !!document.createElement('audio').canPlayType('audio/ogg; codecs=\"opus\"');
  const urls = [`/assets/audio/${score.stem}.${opus ? 'ogg' : 'm4a'}`]; // round16b: choose before fetching
  return Object.freeze({ ...score, urls: Object.freeze(urls) });
}

export function createSound({ api } = {}) {
  if (api && engines.has(api)) return engines.get(api);
  let entered = false, engine = null, recording=false, program=null,programReady=null; // round24
  const music = selectRoomMusic(); // round14-music
  const listeners = new Set(), capsules = new Map(), warned = new Set();
  const warn = (operation, error) => {
    if (warned.has(operation)) return;
    warned.add(operation); console.warn('[room sound]', operation, error?.message ?? error);
  };
  // Every public operation is contained, including rejected browser audio promises.
  const safely = (operation, fn, fallback) => {
    try {
      const result = fn();
      if (result?.then) return result.catch(error => { warn(operation, error); return fallback; });
      return result;
    } catch (error) { warn(operation, error); return fallback; }
  };
  // round14-welcome: the loader captures gestures before this module exists.
  const hasGesture=()=>!!window.roomGestureSeen;
  const playing = () => safely('state', () => !!engine?.playing, false);
  function notify() {
    const on = playing();if(engine?.enabled)seaWindow();if(tactileBus)tactileBus.gain.value=engine?.enabled?engine.volume:0; // round14-feel
    for (const element of capsules.keys()) {
      element.setAttribute('aria-pressed', String(on));
      element.dataset.sound = on ? 'on' : engine?.enabled ? hasGesture()?'ready':'waiting' : 'off';
      const musicOn=on&&(program?.state.on??true);
      element.querySelector('[data-sound-label]').textContent = (musicOn?'Mute music':'Play music')+(musicOn&&program?.playing?' · '+program.title:'');
      element.querySelector('[data-sound-waves]').style.visibility = on ? 'visible' : 'hidden';
      element.title = musicOn?'Mute music':'Play music';
      element.setAttribute('aria-label', element.querySelector('[data-sound-label]').textContent);
    }
    program?.sync();
    for (const fn of listeners) safely('listener', () => fn(on));
  }
  // round14-feel: short tactile voices are ready synchronously after unlock.
  // They share the engine's consent, volume and context; no new asset or request.
  let tactileNoise=null,tactileBus=null,tactileAnalyser=null,tactileSamples=null;
  const voices={
    'paper-lift':{duration:.15,attack:.019,level:.030,noise:760},
    'paper-page':{duration:.19,attack:.032,level:.034,noise:1540},
    'slide-seat':{duration:.067,attack:.002,level:.023,pitch:2420,end:1450},
    'radio-detent':{duration:.045,attack:.002,level:.023,pitch:1020,end:420},
    'plotter-servo':{duration:.15,attack:.008,level:.015,pitch:220,end:95,wave:'triangle'},
    'film-lid':{duration:.12,attack:.003,level:.024,pitch:570,end:260,wave:'triangle'}
  };
  const tactileEvents=[];
  function tactile(kind='tick',strength=1){
    return safely('tactile',()=>{
      const ctx=engine?.context;if(!engine?.enabled||ctx?.state!=='running')return null;
      if(!tactileBus){tactileBus=ctx.createGain();tactileAnalyser=ctx.createAnalyser();tactileAnalyser.fftSize=512;tactileSamples=new Float32Array(512);tactileBus.connect(tactileAnalyser);tactileAnalyser.connect(ctx.destination);}
      tactileBus.gain.value=engine.volume;
      const voice=voices[kind] || (kind==='rustle' ? {duration:.09,level:.045,noise:1100}:
        kind==='stop' ? {duration:.07,level:.018,pitch:190,end:95}:{duration:.035,level:.018,pitch:930,end:420});
      const at=ctx.currentTime,g=ctx.createGain(),duration=voice.duration;
      g.gain.setValueAtTime(0,at);
      g.gain.linearRampToValueAtTime(Math.min(1,Math.max(0,strength))*voice.level,at+(voice.attack||.002));
      g.gain.exponentialRampToValueAtTime(.00001,at+duration);g.connect(tactileBus);
      let source,filter;
      if(voice.noise){
        if(!tactileNoise){
          tactileNoise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.22),ctx.sampleRate);
          const data=tactileNoise.getChannelData(0);let seed=14;
          for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1;}
        }
        source=ctx.createBufferSource();source.buffer=tactileNoise;
        filter=ctx.createBiquadFilter();filter.type='highpass';filter.frequency.value=voice.noise;
        source.connect(filter);filter.connect(g);
      }else{
        source=ctx.createOscillator();source.type=voice.wave||'sine';
        source.frequency.setValueAtTime(voice.pitch,at);
        source.frequency.exponentialRampToValueAtTime(voice.end,at+duration);source.connect(g);
      }
      source.onended=()=>{source.disconnect();filter?.disconnect();g.disconnect();};source.start(at);source.stop(at+duration);
      const event={at:performance.now(),kind,strength,audioTime:at,baseLatency:ctx.baseLatency||0,outputLatency:ctx.outputLatency||0};tactileEvents.push(event);if(tactileEvents.length>256)tactileEvents.shift();return event;
    },null);
  }
  let rustleSource=null,rustleGain=null;
  function dragRustle(speed=0){return safely('drag rustle',()=>{const ctx=engine?.context;if(!engine?.enabled||ctx?.state!=='running')speed=0;if(speed<=.002){if(rustleSource){rustleSource.stop();rustleSource.disconnect();rustleGain.disconnect();rustleSource=rustleGain=null;}return;}if(!rustleSource){const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate),ctx.sampleRate),data=buffer.getChannelData(0);let seed=20;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=(seed/2147483648-1)*.12;}rustleSource=ctx.createBufferSource();rustleSource.buffer=buffer;rustleSource.loop=true;rustleGain=ctx.createGain();rustleSource.connect(rustleGain);rustleGain.connect(ctx.destination);rustleSource.start();tactileEvents.push({at:performance.now(),kind:'drag-rustle-start',continuous:true});}rustleGain.gain.setTargetAtTime(Math.min(.12,speed*.1)*engine.volume,ctx.currentTime,.025);},null);}
  // round27-f: a procedural sea is independent of the recorded score.
  let sea=null,seaOpen=false;
  function seaWindow(open=seaOpen){seaOpen=!!open;return safely('window sea',()=>{const ctx=engine?.context;if(!ctx||ctx.state!=='running')return;const at=ctx.currentTime;if(!sea){const buffer=ctx.createBuffer(1,ctx.sampleRate*8,ctx.sampleRate),samples=buffer.getChannelData(0);let seed=2705,previous=0;for(let i=0;i<samples.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;previous=previous*.97+(seed/2147483648-1)*.03;samples[i]=previous*2;}
   const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),swell=ctx.createOscillator(),depth=ctx.createGain();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=750;gain.gain.value=.016;swell.frequency.value=.085;depth.gain.value=.006;swell.connect(depth);depth.connect(gain.gain);source.connect(filter);filter.connect(gain);gain.connect(engine.output);source.start();swell.start();sea={source,filter,gain,swell,depth};}
   const gain=seaOpen?.016*Math.pow(10,6/20):.016;for(const [param,value]of [[sea.gain.gain,gain],[sea.depth.gain,seaOpen?.006*Math.pow(10,6/20):.006],[sea.filter.frequency,seaOpen?1900:750]]){param.cancelAndHoldAtTime?.(at);param.linearRampToValueAtTime(value,at+.5);}sound.seaProof={procedural:true,open:seaOpen,gain,cutoff:seaOpen?1900:750,rampSeconds:.5,openGainDB:6,seed:2705};},null);}
  const sound = {
    get enabled(){return !!engine?.enabled;}, // round14-welcome
    seaWindow,dragRustle,tactile,tactileEvents,
    get tactileLevel(){
      if(!tactileAnalyser)return 0;
      tactileAnalyser.getFloatTimeDomainData(tactileSamples);
      let sum=0;for(const sample of tactileSamples)sum+=sample*sample;
      return Math.sqrt(sum/tactileSamples.length);
    }, // round14-feel
    get music(){return program?{id:program.piece().key,title:program.piece().work,urls:[program.piece().stem+'.ogg']}:music},
    get radio(){return program},get radioReady(){return programReady}, // round27-r

    enter() {
      entered = true;if(recording)return; // round24
      if(!hasGesture()){notify();return;}
      safely('enter', () => { engine?.setMusicEnabled(false, { fade: .8 }); engine?.enter(); });
      notify();
    },
    recording(on) {recording=!!on;program?.recording(on);if(recording)engine?.suspend();else if(entered&&engine?.enabled)engine?.resume();notify();}, // round24
    set(on) {
      safely('switch', () => {
        if(tactileBus&&!on)tactileBus.gain.value=0; // round14-feel
        engine?.setMusicEnabled(false, { fade: .04 });
        engine?.setEnabled(!!on, { start: entered&&hasGesture() });
        if (on) { program?.sync(); if (entered&&hasGesture()) engine?.enter(); }
      });
      if(recording)engine?.suspend();notify();
    },
    playing,
    onChange(fn) { listeners.add(fn); safely('listener', () => fn(playing())); return () => listeners.delete(fn); },
    effect(name,options) { if (effects.has(name)) return safely('effect', () => engine?.play(name,options)); },
    setCamera(position, forward) {
      safely('camera', () => {
        const p = position?.position ?? position;
        if (!p) return;
        engine?.setCamera({ position: p });
        const ctx = engine?.context, listener = ctx?.listener;
        const values = vector => vector && [vector.x ?? vector[0], vector.y ?? vector[1], vector.z ?? vector[2]];
        const xyz = values(p), direction = values(forward);
        if (listener && xyz?.every(Number.isFinite)) {
          if (listener.positionX) [listener.positionX.value, listener.positionY.value, listener.positionZ.value] = xyz;
          else listener.setPosition(...xyz);
          if (direction?.every(Number.isFinite)) {
            if (listener.forwardX) {
              [listener.forwardX.value, listener.forwardY.value, listener.forwardZ.value] = direction;
              listener.upX.value = 0; listener.upY.value = 1; listener.upZ.value = 0;
            } else listener.setOrientation(...direction, 0, 1, 0);
          }
        }
      });
    },
    mountCapsule(element) {
      return safely('capsule', () => {
        if (!element || capsules.has(element)) return;
        if (!document.querySelector('#room-sound-style')) {
          const style = document.createElement('style'); style.id = 'room-sound-style';
          style.textContent = `[data-room-sound]{cursor:pointer}[data-room-sound] svg{display:none} /* round17: shell owns all sound chrome */`;
          document.head.append(style);
        }
        element.dataset.roomSound = '';
        if (element.tagName === 'BUTTON') element.type = 'button';
        else { element.setAttribute('role', 'button'); element.tabIndex = 0; }
        element.setAttribute('aria-label', 'Room sound');
        element.innerHTML = glyph + '<span data-sound-label></span>';
        const toggle = () => {
          const turnOn=!(playing()&&(program?.state.on??true));
          if(turnOn&&program&&!program.state.on)program.power(true);
          sound.set(turnOn);
        };
        element.onclick = event => { event.preventDefault(); event.stopPropagation(); toggle(); };
        const key = event => { if (element.tagName !== 'BUTTON' && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); toggle(); } };
        element.addEventListener('keydown', key);
        capsules.set(element, key); notify();
        return () => { capsules.delete(element); element.onclick = null; element.removeEventListener('keydown', key); };
      });
    },
  };
  safely('boot', () => {
    // round14-music: keep the effect bus unchanged; the new masters are -22 LUFS.
    engine = createAudio({ scene: 'lab', autoStart: false, soundtrackUrls: [],
      musicDuration: music.duration, musicGain: music.gain });
    engine.setMusicEnabled(false,{fade:0});
    programReady=(api?.afterEnter?.()||Promise.resolve()).then(()=>import('./radio-program.js')).then(({createRadioProgram})=>{program=createRadioProgram({engine,onChange:notify});window.roomRadioProgram=program;if(recording)program.recording(true);notify();return program}).catch(error=>{warn('radio',error);return null});
    engine.onChange(notify);
    setInterval(()=>{if(program?.playing&&performance.now()-program.titleAt>=5000&&performance.now()-program.titleAt<6100)notify()},1000);
    // round25-l: boot does not download an inaudible soundtrack.
    // The switch and entered listener request audio. // round25-l
    if (typeof api?.onEnter === 'function') api.onEnter(() => sound.enter());
  });
  // round14-welcome: first pointer/key anywhere starts music after entry.
  addEventListener('room-gesture',()=>{if(entered&&engine?.enabled&&!playing())sound.enter();else notify()});
  if (api) engines.set(api, sound);
  return sound;
}
