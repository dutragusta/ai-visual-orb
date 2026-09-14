import * as THREE from 'three';

const TAU = Math.PI * 2;

export class NeuralOrb {
  constructor(scene) {
    this.scene = scene;
    this.count = 9000;
    this.positions = new Float32Array(this.count * 3);
    this.base = new Float32Array(this.count * 3);
    this.sizes = new Float32Array(this.count);
    this.phase = new Float32Array(this.count);
    this.speed = new Float32Array(this.count);
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this._createParticles();
    this._createConnections();
    this._createCoreGlow();
  }

  _createParticles() {
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 0.42) * 3.5;
      const theta = Math.acos(THREE.MathUtils.randFloatSpread(2));
      const phi = Math.random() * TAU;
      const shell = 0.72 + Math.random() * 0.5;
      this.base[i3] = Math.sin(theta) * Math.cos(phi) * r * shell;
      this.base[i3 + 1] = Math.cos(theta) * r * shell * 0.92;
      this.base[i3 + 2] = Math.sin(theta) * Math.sin(phi) * r * shell;
      this.positions[i3] = this.base[i3];
      this.positions[i3 + 1] = this.base[i3 + 1];
      this.positions[i3 + 2] = this.base[i3 + 2];
      this.sizes[i] = Math.random() < 0.07 ? 2.8 : 1.0 + Math.random() * 1.8;
      this.phase[i] = Math.random() * TAU;
      this.speed[i] = 0.3 + Math.random() * 1.2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(this.phase, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uAudio: { value: 0 },
        uState: { value: 0 },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aPhase;
        uniform float uTime;
        uniform float uAudio;
        uniform float uState;
        varying float vGlow;
        void main() {
          vec3 p = position;
          float pulse = sin(uTime * (0.8 + aPhase * 0.1) + aPhase * 6.2831) * 0.035;
          float audio = uAudio * (0.12 + sin(aPhase * 8.0 + uTime) * 0.035);
          p *= 1.0 + pulse + audio;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(aSize * (230.0 / -mv.z) * (1.0 + uAudio * 1.8), 0.7, 9.0);
          vGlow = 0.35 + uAudio * 0.65 + 0.2 * sin(uTime * 1.4 + aPhase * 6.2831);
        }
      `,
      fragmentShader: `
        varying float vGlow;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float alpha = smoothstep(0.5, 0.05, d) * vGlow;
          if (alpha < 0.01) discard;
          vec3 core = vec3(1.0, 0.55, 0.12);
          vec3 white = vec3(1.0, 0.86, 0.62);
          gl_FragColor = vec4(mix(core, white, smoothstep(0.1, 0.45, 1.0 - d)), alpha);
        }
      `,
    });

    this.particles = new THREE.Points(geometry, material);
    this.group.add(this.particles);
  }

  _createConnections() {
    const lines = [];
    for (let i = 0; i < 150; i++) {
      const a = Math.floor(Math.random() * this.count);
      const b = Math.floor(Math.random() * this.count);
      const a3 = a * 3;
      const b3 = b * 3;
      lines.push(
        this.base[a3], this.base[a3 + 1], this.base[a3 + 2],
        this.base[b3], this.base[b3 + 1], this.base[b3 + 2],
      );
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
    this.lines = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0xff8a28, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.group.add(this.lines);
  }

  _createCoreGlow() {
    const geometry = new THREE.SphereGeometry(1.35, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff8d25, transparent: true, opacity: 0.035, blending: THREE.AdditiveBlending, depthWrite: false });
    this.glow = new THREE.Mesh(geometry, material);
    this.group.add(this.glow);
  }

  update(time, audioLevel = 0, state = 'idle') {
    const statePower = { idle: 0.15, listening: 0.65, thinking: 0.4, speaking: 0.8 }[state] ?? 0.15;
    this.particles.material.uniforms.uTime.value = time;
    this.particles.material.uniforms.uAudio.value = THREE.MathUtils.lerp(this.particles.material.uniforms.uAudio.value, audioLevel + statePower * 0.08, 0.08);
    this.particles.material.uniforms.uState.value = statePower;

    const targetScale = 1 + audioLevel * 0.32 + statePower * 0.05;
    this.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
    this.group.rotation.y += 0.0008 + audioLevel * 0.004;
    this.group.rotation.x = Math.sin(time * 0.12) * 0.06;
    this.lines.material.opacity = 0.10 + audioLevel * 0.18 + statePower * 0.04;
    this.glow.scale.setScalar(1 + audioLevel * 1.5 + Math.sin(time * 1.8) * 0.05);
    this.glow.material.opacity = 0.025 + audioLevel * 0.055;
  }
}
