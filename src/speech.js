export class SpeechController {
  constructor({ onStart, onResult, onEnd, onError }) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.supported = Boolean(Recognition);
    this.onStart = onStart;
    this.onResult = onResult;
    this.onEnd = onEnd;
    this.onError = onError;
    this.active = false;

    if (!this.supported) return;
    this.recognition = new Recognition();
    this.recognition.lang = 'pt-BR';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => { this.active = true; this.onStart?.(); };
    this.recognition.onresult = (event) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) text += event.results[i][0].transcript;
      this.onResult?.(text.trim(), event.results[event.results.length - 1].isFinal);
    };
    this.recognition.onend = () => { this.active = false; this.onEnd?.(); };
    this.recognition.onerror = (event) => { this.active = false; this.onError?.(event.error); };
  }

  start() {
    if (!this.supported) throw new Error('Speech Recognition não é suportado neste navegador.');
    if (!this.active) this.recognition.start();
  }

  stop() {
    if (this.active) this.recognition.stop();
  }
}

export function speak(text, { onStart, onEnd } = {}) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = 1.02;
  utterance.pitch = 1.0;
  utterance.onstart = onStart;
  utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}
