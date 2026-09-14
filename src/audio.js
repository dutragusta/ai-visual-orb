export class AudioEngine {
  constructor() {
    this.context = null;
    this.analyser = null;
    this.data = null;
    this.stream = null;
    this.enabled = false;
  }

  async start() {
    if (this.enabled) return true;
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    this.context = new AudioContext();
    const source = this.context.createMediaStreamSource(this.stream);
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.82;
    source.connect(this.analyser);
    this.data = new Uint8Array(this.analyser.frequencyBinCount);
    this.enabled = true;
    return true;
  }

  getLevel() {
    if (!this.analyser || !this.data) return 0;
    this.analyser.getByteFrequencyData(this.data);
    let sum = 0;
    for (const value of this.data) sum += value;
    return (sum / this.data.length) / 255;
  }

  getBass() {
    if (!this.analyser || !this.data) return 0;
    this.analyser.getByteFrequencyData(this.data);
    const count = Math.max(1, Math.floor(this.data.length * 0.08));
    let sum = 0;
    for (let i = 0; i < count; i++) sum += this.data[i];
    return (sum / count) / 255;
  }

  stop() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.context?.close();
    this.stream = null;
    this.context = null;
    this.analyser = null;
    this.data = null;
    this.enabled = false;
  }
}
