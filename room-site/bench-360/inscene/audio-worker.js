// Renders one voice at a time and transfers samples without copying them.
import { synthesizeVoice } from './audio.js';

self.onmessage = ({ data: { name } }) => {
  try {
    const pcm = synthesizeVoice(name);
    self.postMessage({ name, pcm }, pcm.channels.map(channel => channel.buffer));
  } catch (error) {
    self.postMessage({ name, error: error.message });
  }
};
