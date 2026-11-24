// Procedural rain and analogue lab sounds. No recordings or sample assets.
const SOUND_KEY = 'room.sound';
const TAU = Math.PI * 2;
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo));
const pref = () => { try { return localStorage.getItem(SOUND_KEY) !== 'off'; } catch { return true; } };
const store = (on) => { try { localStorage.setItem(SOUND_KEY, on ? 'on' : 'off'); } catch { /* Storage unavailable. */ } };
export const EFFECT_NAMES = Object.freeze(['slide_clunk', 'paper', 'page_turn', 'door', 'static', 'crt_on', 'keys', 'plotter', 'lightbox', 'lamp', 'shutter', 'steam', 'rain_on', 'rain_off', 'reel', 'clock_tick', 'drawer', 'glass', 'tram_bell_far']);
export const VOICE_NAMES = Object.freeze([
  ...EFFECT_NAMES, 'rain_street', 'rain_window', 'projector_fan', 'city',
]);
const SCENE_BEDS = Object.freeze(['rain_street', 'rain_window', 'projector_fan', 'city']);
const LOOPS = new Set(SCENE_BEDS);
const SCENES = new Set(['street', 'lab']);
const UNLOCKING = ['pointerdown', 'keydown', 'touchend', 'click'];
const SCENE_FADE = 1.2;
function validateScene(scene) {
  if (!SCENES.has(scene)) throw new RangeError(`Unknown audio scene: ${scene}`);
  return scene;
}
const DURATIONS = { paper: .7, city: 32, rain_street: 24, rain_window: 24,
  projector_fan: 12, slide_clunk: .56, door: 1.15, tram_bell_far: 3.2, page_turn: .58, static: .85, crt_on: .7, keys: .16, plotter: .8, lightbox: .4, lamp: .16, shutter: .24, steam: 1.2, rain_on: .7, rain_off: .55, reel: .9, clock_tick: .12, drawer: .65, glass: .7 };
function random(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
}
function hash(name) { return [...name].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619), 2166136261) >>> 0; }

// The same PCM function supplies browser playback and offline WAV previews.
export function synthesizeVoice(request, { sampleRate = 32000, seed = hash(request), duration } = {}) {
  if (!VOICE_NAMES.includes(request)) throw new RangeError(`Unknown audio voice: ${request}`);
  if (!Number.isFinite(sampleRate) || sampleRate < 8000 || sampleRate > 192000)
    throw new RangeError('Audio sample rate must be between 8000 and 192000 Hz');
  const name = request;
  const looping = LOOPS.has(name);
  const seconds = duration ?? DURATIONS[name];
  if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 180) throw new RangeError('Invalid voice duration');
  const n = Math.round(seconds * sampleRate);
  const channels = [new Float32Array(n), new Float32Array(n)];
  const rng = random(seed);
  const edge = (t, end = seconds, attack = .008, release = .05) =>
    Math.min(1, t / attack) * Math.min(1, Math.max(0, end - t) / release);
  for (let c = 0; c < 2; c++) {
    const out = channels[c];
    let lp = 0, slow = 0, rainLow = 0, rainLow2 = 0;
    const rainCutoff = name === 'rain_window' ? 480 : 3400;
    const rainAlpha = 1 - Math.exp(-TAU * rainCutoff / sampleRate);
    for (let i = 0; i < n; i++) {
      const t = i / sampleRate, u = t / seconds;
      const w = rng() * 2 - 1;
      lp += (1 - Math.exp(-TAU * 1200 / sampleRate)) * (w - lp);
      slow += (1 - Math.exp(-TAU * 130 / sampleRate)) * (w - slow);
      let y = 0;
      if (name === 'rain_street' || name === 'rain_window') {
        // The closed window attenuates and rolls off both the wash and droplets.
        rainLow += rainAlpha * (w - rainLow);
        rainLow2 += rainAlpha * (rainLow - rainLow2);
        const swell = .88 + .08 * Math.sin(TAU * 2 * u + c * .4)
          + .04 * Math.sin(TAU * 5 * u);
        y = name === 'rain_street'
          ? (.028 * rainLow + .009 * slow) * swell
          : (.029 * rainLow2 + .012 * slow) * swell;
      } else if (name === 'projector_fan') {
        // Airflow, motor fundamental and blade passage; not an electrical buzz.
        y = (.018 * lp + .010 * slow) * (.88 + .12 * Math.sin(TAU * 24 * t));
        y += .004 * Math.sin(TAU * 96 * t) + .0018 * Math.sin(TAU * 192 * t);
        y *= .94 + .06 * Math.sin(TAU * u);
      } else if (name === 'slide_clunk') {
        const hit = (at, strength, pitch) => {
          const d = t - at;
          return d < 0 ? 0 : strength * (1 - Math.exp(-d * 1900))
            * (lp * 2.3 + .35 * Math.sin(TAU * pitch * d)) * Math.exp(-d * 65);
        };
        y = hit(.025, .075, 195) + hit(.24, .052, 280);
        y += .025 * lp * Math.sin(Math.PI * u) ** 2;
      } else if (name === 'door') {
        const latch = (at, strength) => {
          const d = t - at;
          return d < 0 ? 0 : strength * (1 - Math.exp(-d * 1300))
            * (lp * 1.8 + .3 * Math.sin(TAU * 145 * d)) * Math.exp(-d * 36);
        };
        y = latch(.045, .068) + latch(.82, .092);
        y += (.017 * slow + .004 * Math.sin(TAU * (115 * t + 16 * t * t)))
          * Math.sin(Math.PI * u) ** 2;
      } else if (name === 'tram_bell_far') {
        for (const at of [.05, .52]) {
          const d = t - at;
          if (d >= 0) y += .021 * (1 - Math.exp(-d * 170)) * Math.exp(-d * 2.7)
            * (Math.sin(TAU * 659 * d) + .26 * Math.sin(TAU * 1319 * d)
              + .10 * Math.sin(TAU * 1778 * d));
        }
        y *= c === 0 ? .8 : 1;
      } else if (name === 'city') {
        // Low, distant traffic, without intelligible voices or electrical buzz.
        y = .0048 * Math.sin(TAU * 110 * t + .045 * Math.sin(TAU * t / seconds));
        y += .0024 * Math.sin(TAU * 165 * t + c * .4) + .012 * slow;
        y *= .8 + .2 * Math.cos(TAU * 2 * t / seconds + c * .3);
      } else if (name === 'paper' || name === 'page_turn') {
        y = .036 * (w - lp) * (.28 + .72 * Math.sin(TAU * 7 * t) ** 2) * Math.sin(Math.PI * u) ** 2;
        y += .008 * lp * Math.sin(Math.PI * u);
      }
      // Short object voices share only the envelope and seeded noise source.
      if (name === 'static') y = (w - lp) * (.35 + .65 * Math.sin(Math.PI * u));
      else if (name === 'crt_on') y = Math.sin(TAU * (65 * t + 80 * t * t)) * Math.exp(-t * 10) + .12 * w * Math.exp(-t * 28);
      else if (name === 'keys') y = (lp + .4 * Math.sin(TAU * 720 * t)) * Math.exp(-t * 65);
      else if (name === 'plotter') y = .5 * Math.sin(TAU * (185 * t + 60 * t * t)) * Math.sin(Math.PI * u) + .2 * lp;
      else if (name === 'lightbox') y = .5 * Math.sin(TAU * 880 * t) * Math.exp(-t * 16) + .5 * w * Math.exp(-t * 60);
      else if (name === 'lamp') y = (lp + .6 * Math.sin(TAU * 380 * t)) * Math.exp(-t * 55);
      else if (name === 'shutter') { const d = Math.max(0, t - .075); y = lp * (Math.exp(-t * 60) + (t > .075 ? .8 * Math.exp(-d * 80) : 0)); }
      else if (name === 'steam') y = (w - lp) * Math.sin(Math.PI * u) ** 2;
      else if (name === 'rain_on' || name === 'rain_off') y = lp * Math.sin(Math.PI * u) * (name === 'rain_on' ? u : 1 - u);
      else if (name === 'reel') y = lp * (.15 + .85 * Math.max(0, Math.cos(TAU * 18 * t)) ** 8) * Math.sin(Math.PI * u);
      else if (name === 'clock_tick') y = (Math.sin(TAU * 1450 * t) + lp) * Math.exp(-t * 95);
      else if (name === 'drawer') y = .6 * slow * Math.sin(Math.PI * u) + lp * Math.exp(-Math.max(0, t - .48) * 40) * (t > .48 ? 1 : 0);
      else if (name === 'glass') y = (Math.sin(TAU * 1420 * t) + .4 * Math.sin(TAU * 2310 * t)) * Math.exp(-t * 10);
      out[i] = looping ? y : y * edge(t);
    }
  }
  if (name === 'rain_street' || name === 'rain_window') {
    // Seeded Poisson drop events, wrapped through the loop boundary.
    for (let c = 0; c < 2; c++) {
      const inside = name === 'rain_window', rate = inside ? 9 : 34;
      const dropAlpha = 1 - Math.exp(-TAU * (inside ? 430 : 2400) / sampleRate);
      for (let at = rng() / rate; at < seconds; at += -Math.log(Math.max(1e-8, 1 - rng())) / rate) {
        const first = Math.floor(at * sampleRate), pitch = (inside ? 320 : 780) * (.75 + rng() * .5);
        const amplitude = (inside ? .008 : .0085) * (.3 + rng());
        let drop = 0;
        for (let j = 0; j < Math.round(sampleRate * .1); j++) {
          const t = j / sampleRate;
          drop += dropAlpha * ((rng() * 2 - 1) - drop);
          const hit = inside ? .5 * Math.sin(TAU * pitch * t) + drop : drop;
          channels[c][(first + j) % n] += amplitude * hit
            * Math.exp(-t * (inside ? 70 : 115)) * Math.min(1, t / .002);
        }
      }
    }
  }
  if (looping) {
    // Blend the edges without a periodic fade-out.
    const f = Math.min(Math.round(sampleRate * .08), Math.floor(n / 2));
    for (const out of channels) {
      for (let i = 0; i < f; i++) {
        const k = .5 - .5 * Math.cos(Math.PI * i / Math.max(1, f - 1));
        out[n - f + i] = out[n - f + i] * (1 - k) + out[i] * k;
      }
      const delta = out[0] - out[n - 1];
      for (let i = 0; i < f; i++) out[n - f + i] += delta * (.5 - .5 * Math.cos(Math.PI * (i + 1) / f));
    }
  }
  if (!looping) {
    let peak = 0;
    for (const channel of channels) for (const value of channel) peak = Math.max(peak, Math.abs(value));
    if (peak > 0) for (const channel of channels) for (let i = 0; i < channel.length; i++) channel[i] *= .167 / peak;
  }
  return { channels, sampleRate, duration: n / sampleRate, loop: looping };
}
function bufferFrom(ctx, pcm) {
  const b = ctx.createBuffer(pcm.channels.length, pcm.channels[0].length, pcm.sampleRate);
  pcm.channels.forEach((data, c) => b.copyToChannel(data, c));
  return b;
}
// Voices render off the main thread: the four beds take about 550 ms of CPU, and a
// visitor's first gesture must never wait for them. Where a module worker cannot
// start, they render one at a time between tasks, after the gesture has been served.
function createRenderer(onVoice) {
  let worker = null, queue = [], fallback = false, timer = 0, stopped = false;
  const finish = (name, pcm) => { if (!stopped) { try { onVoice(name, pcm); } catch (error) { console.warn('[room audio] voice failed', name, error); } } };
  function drain() {
    if (stopped || timer) return;
    timer = setTimeout(() => {
      timer = 0;
      const name = queue.shift();
      if (name) { try { finish(name, synthesizeVoice(name)); } catch (error) { console.warn('[room audio] voice unavailable', name, error); } }
      if (queue.length) drain();
    }, 40);
  }
  function degrade() {
    fallback = true; worker?.terminate(); worker = null; drain();
  }
  return {
    request(names) {
      queue.push(...names);
      if (fallback) { drain(); return; }
      try {
        worker ??= new Worker(new URL('./audio-worker.js', import.meta.url), { type: 'module' });
        worker.onerror = event => { event.preventDefault(); degrade(); };
        worker.onmessage = ({ data }) => {
          if (data.error) { degrade(); return; }
          queue = queue.filter((name) => name !== data.name);
          finish(data.name, data.pcm);
          if (!queue.length) { worker?.terminate(); worker = null; }
        };
        for (const name of names) worker.postMessage({ name });
      } catch { degrade(); }
    },
    stop() { stopped = true; clearTimeout(timer); worker?.terminate(); worker = null; queue = []; },
  };
}
// Resampling and codec priming can leave a small endpoint discontinuity.
// Correct only the last 4 ms; no silence or whole-track crossfade is added.
export function prepareMusicLoop(buffer, duration = 160) {
  const end = Math.min(buffer.length, Math.round(duration * buffer.sampleRate));
  const frames = Math.min(Math.floor(end / 2), Math.round(buffer.sampleRate * .004));
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c), delta = data[0] - data[end - 1];
    for (let i = 0; i < frames; i++) data[end - frames + i] += delta * (.5 - .5 * Math.cos(Math.PI * (i + 1) / frames));
  }
  return buffer;
}
export function ambientMix({ proximity = 0, scene = 'street' } = {}) {
  validateScene(scene);
  const near = clamp(proximity), inside = scene === 'lab';
  return { rain_street: inside ? 0 : .90 - .18 * near,
    rain_window: inside ? .82 + .10 * near : 0,
    projector_fan: inside ? .70 : 0, city: inside ? .12 : .45 };
}

// round14-music: a per-score gain keeps effect and ambience levels independent.
export function createAudio({ volume = .8, soundtrackUrls, musicDuration = 160, musicGain = 1.9953, scene = 'street', autoStart = true } = {}) {
  validateScene(scene);
  let userGestureSeen = false, entered = false;
  let enabled = pref(), ctx = null, master = null, musicBus = null, disposed = false;
  let proximity = 0, camera = null, rainEnabled = true;
  let wanted = true, musicBuffer = null, loading = null, music = null, epoch = 0, offset = 0;
  let error = null, revision = 0, resumeRevision = 0;
  const buffers = new Map(), beds = new Map(), voices = new Set(), connected = new Set();
  const bedTargets = new Map(), rendering = new Set(), listeners = new Set();
  const waiting = [];
  let encoded = null, prefetched = null, duckUntil = 0;
  // round16b: one selected codec per visit, including failed decodes.
  const opus = typeof document === 'undefined' || !!document.createElement('audio').canPlayType('audio/ogg; codecs="opus"');
  const candidates = soundtrackUrls ?? ['/assets/audio/soundtrack.ogg', '/assets/audio/soundtrack.m4a'];
  const selected = candidates.find(path => new URL(path, globalThis.location?.href ?? import.meta.url).pathname.endsWith(opus ? '.ogg' : '.m4a')) ?? candidates[0];
  const urls = selected ? [new URL(selected, globalThis.location?.href ?? import.meta.url).href] : [];
  const notify = () => listeners.forEach(fn => { try { fn(api.playing); } catch (error) { console.warn('[room audio] listener failed', error); } });
  const renderer = createRenderer((name, pcm) => {
    rendering.delete(name);
    if (!ctx || disposed) return;
    try { buffers.set(name, bufferFrom(ctx, pcm)); } catch (error) { console.warn('[room audio] buffer unavailable', name, error); return; }
    if (LOOPS.has(name) && !beds.has(name)) {
      beds.set(name, voice(name, { gain: 0, loop: true }));
      bedTargets.delete(name); updateBeds(SCENE_FADE);
    }
    for (let i = waiting.length - 1; i >= 0; i--) if (waiting[i].name === name) {
      const item = waiting.splice(i, 1)[0];
      if (performance.now() - item.at < 700) api.play(name, item.options);
    }
  });
  // Effects first: they are short, and one may be waiting on a click.
  function renderVoices() {
    const names = VOICE_NAMES.filter((name) => !buffers.has(name) && !rendering.has(name));
    if (!names.length) return;
    names.forEach((name) => rendering.add(name));
    renderer.request(names);
  }
  const remember = (...nodes) => { nodes.forEach((node) => connected.add(node)); return nodes[0]; };
  const length = () => Math.min(musicDuration, musicBuffer?.duration ?? musicDuration);
  const time = () => (offset + (music && ctx ? Math.max(0, ctx.currentTime - epoch) : 0)) % length();
  function ramp(param, value, duration = .15) {
    const at = ctx.currentTime;
    if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(at);
    else { const held = param.value; param.cancelScheduledValues(at); param.setValueAtTime(held, at); }
    param.linearRampToValueAtTime(value, at + Math.max(.005, duration));
  }
  function voice(name, { gain = 1, pan = 0, loop = LOOPS.has(name) } = {}) {
    if (!ctx || disposed || !buffers.has(name)) return null;
    const source = ctx.createBufferSource(), level = ctx.createGain(), panner = ctx.createStereoPanner();
    source.buffer = buffers.get(name); source.loop = loop;
    level.gain.value = clamp(gain, 0, 2); panner.pan.value = clamp(pan, -1, 1);
    source.connect(level); level.connect(panner); panner.connect(master);
    const handle = { name, source, gain: level.gain,
      stop(fade = .04) {
        if (handle.stopped) return;
        handle.stopped = true; ramp(level.gain, 0, fade);
        try { source.stop(ctx.currentTime + Math.max(.01, fade) + .01); } catch { /* Already ended. */ }
      } };
    source.onended = () => { source.disconnect(); level.disconnect(); panner.disconnect(); voices.delete(handle); };
    source.start(); voices.add(handle); return handle;
  }
  function updateBeds(fade = .25) {
    if (!ctx) return;
    for (const [name, amount] of Object.entries(ambientMix({ proximity, scene }))) {
      const gain = !rainEnabled && name.startsWith('rain_') ? 0 : amount;
      const bed = beds.get(name);
      // Per-frame camera/light updates must not restart an unchanged fade.
      if (bed && bedTargets.get(name) !== gain) {
        ramp(bed.gain, gain * 3.1623, fade); bedTargets.set(name, gain);
      }
    }
  }
  function build() {
    master = remember(ctx.createGain()); master.gain.value = 0;
    // A compressor protects overlapping interactions; ordinary levels stay below it.
    const safety = remember(ctx.createDynamicsCompressor());
    safety.threshold.value = -12; safety.knee.value = 6; safety.ratio.value = 12;
    safety.attack.value = .002; safety.release.value = .12;
    master.connect(safety); safety.connect(ctx.destination);
    musicBus = remember(ctx.createGain()); musicBus.gain.value = 0; musicBus.connect(master);
    // iOS leaves a context suspended until a gesture it accepts, and a context can be
    // interrupted later, so the unlocking listeners stay until it is really running.
    ctx.onstatechange = () => { notify(); };
    renderVoices();
  }
  // Cache encoded bytes before Enter without opening the audio device.
  function prefetch() {
    if (disposed || !enabled || musicBuffer || encoded || prefetched) return prefetched ?? Promise.resolve(encoded);
    prefetched = (async () => {
      for (const url of urls) {
        try {
          const response = await fetch(url, { priority: 'low' });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const bytes = await response.arrayBuffer();
          if (!disposed) encoded = { url, bytes };
          return encoded;
        } catch (failure) { error = `Soundtrack fetch failed: ${failure.message}`; }
      }
      console.warn('[room audio]', error); return null;
    })().catch(failure => { error = failure.message; console.warn('[room audio]', error); return null; })
      .finally(() => { prefetched = null; });
    return prefetched;
  }
  async function loadMusic() {
    if (musicBuffer) return musicBuffer;
    if (loading) return loading;
    const thisContext = ctx;
    loading = (async () => {
      const cached = await prefetch();
      const failures = [];
      for (const url of urls) {
        try {
          let bytes;
          if (url === cached?.url) bytes = cached.bytes.slice(0);
          else { const response = await fetch(url, { priority: 'low' }); if (!response.ok) throw new Error(`HTTP ${response.status}`); bytes = await response.arrayBuffer(); }
          // Retry the same selected bytes once; a transient decoder failure never fetches another codec.
          let buffer;
          try { buffer = await thisContext.decodeAudioData(bytes.slice(0)); }
          catch { buffer = await thisContext.decodeAudioData(bytes.slice(0)); }
          if (disposed || ctx !== thisContext) return null;
          if (buffer.duration < musicDuration - .05) throw new Error(`Truncated soundtrack: ${buffer.duration}s`);
          musicBuffer = prepareMusicLoop(buffer, musicDuration); encoded = null; error = null; return musicBuffer;
        } catch (err) { failures.push(`${url}: ${err.message}`); }
      }
      if (!disposed) { error = `Soundtrack unavailable. ${failures.join('; ')}`; console.warn('[room audio]', error); }
      return null;
    })().catch(failure => { error = failure.message; console.warn('[room audio]', error); return null; }).finally(() => { loading = null; });
    return loading;
  }
  async function playMusic(fade = .8) {
    const token = revision;
    if (!wanted || !enabled || !ctx || disposed || token !== revision) return;
    const buffer = await loadMusic();
    if (!buffer || disposed || !wanted || !enabled || token !== revision || music || ctx.state !== 'running') return;
    const source = ctx.createBufferSource();
    source.buffer = buffer; source.loop = true; source.loopEnd = length();
    source.connect(musicBus); music = source; epoch = ctx.currentTime;
    source.start(0, offset % length()); ramp(musicBus.gain, musicGain * (ctx.currentTime < duckUntil ? .31624 : 1), fade); // round14-music
    source.onended = () => source.disconnect();
  }
  function pauseMusic(fade = 1.7) {
    if (!ctx) return;
    if (ctx.state !== 'running') {
      detachMusic(); musicBus.gain.cancelScheduledValues(ctx.currentTime);
      musicBus.gain.setValueAtTime(0, ctx.currentTime); return;
    }
    ramp(musicBus.gain, 0, fade);
    const source = music;
    if (!source) return;
    // Keep the clock advancing through the fade, then freeze on its last sample.
    const stopAt = ctx.currentTime + fade;
    source.stop(stopAt);
    source.onended = () => {
      source.disconnect();
      if (music === source) { offset = (offset + stopAt - epoch) % length(); music = null; }
    };
  }
  function detachMusic() {
    if (!music) return;
    offset = time();
    const source = music; music = null;
    source.onended = () => source.disconnect();
    try { source.stop(); } catch { /* Already stopped. */ }
  }
  function unlock(event) {
    if (!event.isTrusted || (event.type === 'keydown' && event.repeat)) return;
    userGestureSeen = true;
    if (autoStart || entered) api.start();
  }
  function unlisten() {
    if (typeof document === 'undefined') return;
    for (const type of UNLOCKING) document.removeEventListener(type, unlock, true);
  }
  const api = {
    get enabled() { return enabled; },
    get running() { return !!ctx && ctx.state === 'running'; },
    // Sound is playing only when it is wanted and the context has really started.
    get playing() { return enabled && !!ctx && ctx.state === 'running'; },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    get context() { return ctx; },
    get output() { return master; }, // round27-r: share the room master and safety compressor.
    get volume() { return volume; },
    get currentTime() { return time(); },
    get duration() { return length(); },
    get centrifuge() { return wanted; },
    get musicPlaying() { return !!music; },
    get error() { return error; },
    get mix() { return ambientMix({ proximity, scene }); },
    get scene() { return scene; },
    setScene(next) {
      validateScene(next);
      if (disposed || next === scene) return scene;
      scene = next; updateBeds(SCENE_FADE); return scene;
    },
    setVolume(value) { volume = clamp(value); if (ctx && enabled) ramp(master.gain, volume); },
    update(_, listener) {
      const view = listener ?? camera;
      if (view?.position) api.setCamera(view, { update: false });
      updateBeds();
    },
    // Positions are in runtime (glTF/Three) axes: Y up, facade Z = 0.
    setCamera(view, { facade = [0, 0, 0], update = true } = {}) {
      camera = view;
      const p = view.position ?? view;
      const x = p.x ?? p[0], z = p.z ?? p[2];
      if (Number.isFinite(x) && Number.isFinite(z)) {
        const dx = Math.max(0, Math.abs(x - facade[0]) - 1.6);
        const distance = Math.hypot(dx, z - facade[2]);
        proximity = clamp(1 - distance / 4.5);
      }
      if (update) updateBeds();
    },
    setRainEnabled(on) { rainEnabled = !!on; updateBeds(.5); },
    setRainMix(values = {}) {
      if ('proximity' in values) proximity = clamp(values.proximity);
      updateBeds(); return ambientMix({ proximity, scene });
    },
    prefetch,
    enter() { userGestureSeen = true; entered = true; store(enabled); return api.start(); },
    start() {
      if (disposed) return false;
      // start() remains callable by the engine, but cannot bypass user activation.
      if (!ctx && !userGestureSeen) return false;
      if (ctx) { if (enabled) api.resume(); return true; }
      // With Sound off nothing is built until it is switched on.
      if (!enabled) return false;
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AC) return false;
      try {
        // round26c: open the device asynchronously after gesture authorization.
        const routed=typeof AC.prototype.setSinkId==='function';
        ctx = new AC({ latencyHint: 'interactive', ...(routed?{sinkId:{type:'none'}}:{}) }); build();
        if(routed)void ctx.setSinkId('').catch(error=>console.warn('[room audio] output unavailable',error.message));
        api.resume(); ramp(master.gain, volume, .7); notify();
        return true;
      } catch (err) {
        error = err.message; console.warn('[room audio] unavailable', err);
        api.dispose(); return false;
      }
    },
    setEnabled(on, { start = true } = {}) {
      enabled = !!on; store(enabled); resumeRevision++;
      if (enabled && !ctx) { if (start) api.start(); notify(); return; }
      if (!ctx) { notify(); return; }
      if (enabled) { api.resume(); renderVoices(); }
      else {
        const token = resumeRevision;
        // Immediate silence also avoids a queued resume leaking sound.
        master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(0, ctx.currentTime);
        ctx.suspend().then(() => { if (token !== resumeRevision && enabled) api.resume(); })
          .catch((err) => console.warn('[room audio] suspend failed', err));
      }
      notify();
    },
    toggle() { api.setEnabled(!enabled); return enabled; },
    play(name, options = {}) {
      if (!VOICE_NAMES.includes(name) || !ctx || !enabled || ctx.state !== 'running' || disposed) return null;
      if (name === 'rain_on') api.setRainEnabled(true);
      if (name === 'rain_off') api.setRainEnabled(false);
      if (name === 'static') { duckUntil = ctx.currentTime + .85; ramp(musicBus.gain, musicGain * .31624, .035); musicBus.gain.setValueAtTime(musicGain * .31624, duckUntil); musicBus.gain.linearRampToValueAtTime(musicGain, duckUntil + .25); } // round14-music
      if (beds.has(name)) {
        const bed = beds.get(name); bedTargets.delete(name);
        ramp(bed.gain, clamp(options.gain ?? 1, 0, 2)); return bed;
      }
      // An effect still rendering plays when it lands, if that is soon enough to fit.
      if (!buffers.has(name)) { waiting.push({ name, options, at: performance.now() }); if (waiting.length > 8) waiting.shift(); return null; }
      // Bound concurrent effects so repeated pointer input cannot stack forever.
      const effects = [...voices].filter((v) => !v.stopped && !beds.has(v.name));
      if (effects.length >= 8) effects[0].stop(.01);
      return voice(name, options);
    },
    setCentrifuge(on, { fade } = {}) {
      const next = !!on;
      if (next === wanted) return wanted;
      revision++; wanted = next;
      if (next) { detachMusic(); void playMusic(fade ?? .8).catch(err => console.warn('[room audio] music failed', err)); }
      else if (ctx) pauseMusic(fade ?? 1.7);
      return wanted;
    },
    toggleCentrifuge(options) { return api.setCentrifuge(!wanted, options); },
    setMusicEnabled(on, options) { return api.setCentrifuge(on, options); },
    suspend() { if (ctx && ctx.state === 'running') ctx.suspend().catch((err) => console.warn('[room audio] suspend failed', err)); },
    resume() {
      if (!ctx || !enabled || disposed) return;
      const token = resumeRevision;
      // Call resume synchronously within the gesture for Safari.
      ctx.resume().then(() => {
        if (disposed || !enabled || token !== resumeRevision) return;
        ramp(master.gain, volume, .35); if (wanted && !music) void playMusic().catch(err => console.warn('[room audio] music failed', err)); notify();
      }).catch((err) => console.warn('[room audio] resume failed', err));
    },
    dispose() {
      if (disposed) return;
      disposed = true; revision++; unlisten(); renderer.stop(); listeners.clear(); waiting.length = 0; encoded = null;
      for (const v of voices) { try { v.source?.stop(); v.stop?.(0); } catch { /* Ended. */ } }
      voices.clear(); beds.clear(); bedTargets.clear(); buffers.clear(); detachMusic(); musicBuffer = null;
      connected.forEach((node) => node.disconnect()); connected.clear();
      if (ctx) { ctx.onstatechange = null; ctx.close().catch((err) => console.warn('[room audio] close failed', err)); }
      ctx = null; master = null; musicBus = null;
    },
  };
  if (typeof document !== 'undefined') for (const type of UNLOCKING) document.addEventListener(type, unlock, true);
  return api;
}
