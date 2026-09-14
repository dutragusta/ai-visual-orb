import * as THREE from 'three';
import { NeuralOrb } from './particles.js';
import { AudioEngine } from './audio.js';
import { SpeechController, speak } from './speech.js';
import { askAI } from './ai.js';
import { OrbState, STATES } from './state.js';
import '../style.css';

const sceneEl = document.querySelector('#scene');
const statusEl = document.querySelector('#status');
const statusText = document.querySelector('#statusText');
const transcriptEl = document.querySelector('#transcript');
const responseEl = document.querySelector('#response');
const micButton = document.querySelector('#micButton');
const demoButton = document.querySelector('#demoButton');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030610);
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 10.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
sceneEl.appendChild(renderer.domElement);

const orb = new NeuralOrb(scene);
const audio = new AudioEngine();
const state = new OrbState();
let demoTimer = null;
let demoPhase = 0;
let latestAudio = 0;

const labels = {
  idle: 'Aguardando',
  listening: 'Ouvindo',
  thinking: 'Pensando',
  speaking: 'Respondendo',
};

state.subscribe((next) => {
  statusEl.dataset.state = next;
  statusText.textContent = labels[next];
});

function setTranscript(text) {
  transcriptEl.textContent = text || 'Fale comigo';
}

function setResponse(text) {
  responseEl.textContent = text || '';
}

async function startListening() {
  try {
    await audio.start();
    speech.start();
  } catch (error) {
    console.error(error);
    setResponse('Não consegui acessar o microfone. Verifique a permissão do navegador.');
    state.set(STATES.IDLE);
  }
}

const speech = new SpeechController({
  onStart() {
    state.set(STATES.LISTENING);
    setResponse('');
  },
  onResult(text, isFinal) {
    setTranscript(text);
    if (isFinal) handleQuestion(text);
  },
  onEnd() {
    if (state.current === STATES.LISTENING) state.set(STATES.THINKING);
  },
  onError(error) {
    console.warn('Speech recognition:', error);
    if (error !== 'aborted' && error !== 'no-speech') setResponse(`Reconhecimento de voz: ${error}.`);
    state.set(STATES.IDLE);
  },
});

async function handleQuestion(text) {
  state.set(STATES.THINKING);
  setTranscript(text);
  try {
    const answer = await askAI(text);
    setResponse(answer);
    speak(answer, {
      onStart: () => state.set(STATES.SPEAKING),
      onEnd: () => state.set(STATES.IDLE),
    });
  } catch (error) {
    console.error(error);
    setResponse('A IA encontrou um problema ao processar isso.');
    state.set(STATES.IDLE);
  }
}

micButton.addEventListener('click', async () => {
  if (!speech.supported) {
    setResponse('Este navegador não oferece Speech Recognition. Tente Chrome/Edge.');
    return;
  }
  if (speech.active) speech.stop();
  else await startListening();
});

demoButton.addEventListener('click', () => {
  if (demoTimer) {
    clearInterval(demoTimer);
    demoTimer = null;
    state.set(STATES.IDLE);
    setTranscript('Fale comigo');
    setResponse('');
    return;
  }

  const sequence = [
    [STATES.LISTENING, 'Escutando você...'],
    [STATES.THINKING, 'Processando sinais neurais...'],
    [STATES.SPEAKING, 'Resposta gerada.'],
    [STATES.IDLE, 'Fale comigo'],
  ];
  let i = 0;
  const step = () => {
    const [next, text] = sequence[i++ % sequence.length];
    state.set(next);
    if (next === STATES.SPEAKING) setResponse(text);
    else if (next === STATES.LISTENING || next === STATES.THINKING) setTranscript(text);
    else { setTranscript(text); setResponse(''); }
  };
  step();
  demoTimer = setInterval(step, 1700);
});

function animate(ms) {
  requestAnimationFrame(animate);
  const time = ms * 0.001;
  const micLevel = audio.enabled ? audio.getLevel() : 0;
  demoPhase += 0.016;
  const demoLevel = demoTimer ? 0.12 + (Math.sin(demoPhase * 3.2) + 1) * 0.16 : 0;
  latestAudio = THREE.MathUtils.lerp(latestAudio, Math.max(micLevel, demoLevel), 0.18);
  orb.update(time, latestAudio, state.current);
  renderer.render(scene, camera);
}
animate(0);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

addEventListener('pointermove', (event) => {
  const x = (event.clientX / innerWidth - 0.5) * 0.25;
  const y = (event.clientY / innerHeight - 0.5) * 0.18;
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, x, 0.025);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, -y, 0.025);
  camera.lookAt(0, 0, 0);
});
