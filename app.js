import * as THREE from 'three';
import { gsap } from 'gsap';

/* Utilities */
const qs = (s, r = document) => r.querySelector(s);

/* Footer year */
qs('#year').textContent = new Date().getFullYear();

/* Reveal on scroll */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

/* Three.js scene: subtle particle halo */
const canvas = qs('#scene');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const group = new THREE.Group();
scene.add(group);

const count = 600;
const radius = 3.2;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(count * 3);
const sizes = new Float32Array(count);
for (let i = 0; i < count; i++) {
  const r = radius + (Math.random() - 0.5) * 0.35;
  const a = Math.random() * Math.PI * 2;
  const t = (Math.random() - 0.5) * 0.45;
  positions[i * 3] = Math.cos(a) * r;
  positions[i * 3 + 1] = t;
  positions[i * 3 + 2] = Math.sin(a) * r;
  sizes[i] = Math.random() * 1.4 + 0.4;
}
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

const material = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0.0 }, uColor: { value: new THREE.Color('#D4AF37') } },
  vertexShader: `
    uniform float uTime;
    attribute float aSize;
    varying float vAlpha;
    void main() {
      vec3 p = position;
      float wobble = sin(uTime * 0.6 + p.x * 0.7 + p.z * 0.4) * 0.03;
      p.y += wobble;
      vAlpha = 0.35 + 0.35 * sin(uTime * 0.5 + p.x * 0.6);
      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = aSize * (160.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    varying float vAlpha;
    void main() {
      vec2 uv = gl_PointCoord.xy - vec2(0.5);
      float d = dot(uv, uv);
      float alpha = smoothstep(0.25, 0.0, d) * vAlpha;
      gl_FragColor = vec4(uColor, alpha);
    }
  `
});
const points = new THREE.Points(geometry, material);
group.add(points);

let targetRot = 0, currentRot = 0;
let t = 0;

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width, height = rect.height;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize, { passive: true });
resize();

function animate() {
  t += 0.016;
  material.uniforms.uTime.value = t;
  currentRot += (targetRot - currentRot) * 0.04;
  group.rotation.y = currentRot;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

/* Parallax / mouse influence */
let rect = null;
function updateRect(){ rect = canvas.getBoundingClientRect(); }
updateRect();
window.addEventListener('resize', updateRect);
window.addEventListener('scroll', updateRect, { passive: true });
window.addEventListener('pointermove', (e) => {
  if (!rect) return;
  const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  targetRot = nx * 0.3;
});

/* Resize observer to ensure canvas fits hero */
const ro = new ResizeObserver(resize);
ro.observe(qs('.hero-canvas-wrap'));

/* Gallery lightbox */
const thumbs = Array.from(document.querySelectorAll('.gallery .item'));
const lb = document.getElementById('lightbox');
const lbImg = lb?.querySelector('.lb-img');
let gi = 0;
function openLB(i){ gi = (i+thumbs.length)%thumbs.length; lbImg.src = thumbs[gi].href; lb.classList.add('open'); lb.removeAttribute('hidden'); }
function closeLB(){ lb.classList.remove('open'); lb.setAttribute('hidden',''); }
thumbs.forEach((a,i)=>a.addEventListener('click',e=>{ e.preventDefault(); openLB(i); }));
lb?.addEventListener('click', e=>{ if(e.target===lb) closeLB(); });
lb?.querySelector('.lb-close')?.addEventListener('click', closeLB);
lb?.querySelector('.lb-prev')?.addEventListener('click', ()=>openLB(gi-1));
lb?.querySelector('.lb-next')?.addEventListener('click', ()=>openLB(gi+1));
window.addEventListener('keydown', e=>{ if(!lb?.classList.contains('open')) return; if(e.key==='Escape') closeLB(); if(e.key==='ArrowLeft') openLB(gi-1); if(e.key==='ArrowRight') openLB(gi+1); });

/* Form submission effect (no backend assumed) */
const form = document.querySelector('.apply');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button'); const status = form.querySelector('.form-status');
  btn.disabled = true; btn.textContent = 'Submitting...'; status.textContent = '';
  try {
    const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Submission failed');
    form.reset(); status.textContent = 'Application received. We will be in touch.'; 
  } catch (err) {
    status.textContent = String(err.message || err);
  } finally {
    btn.disabled = false; btn.textContent = 'Submit Application';
  }
});

document.addEventListener('DOMContentLoaded', ()=>{
  const track = document.querySelector('.marquee .track');
  if (track && !track.dataset.duplicated) {
    track.innerHTML = track.innerHTML + track.innerHTML; // seamless loop
    track.dataset.duplicated = '1';
  }
  // Replace any empty legacy SVG sigils with the visible PNG
  document.querySelectorAll('.sigil-svg').forEach(svg=>{
    const img = new Image();
    img.src = './circular-sigil.png';
    img.alt = 'Society Sigil';
    img.className = 'sigil-img';
    svg.replaceWith(img);
  });
});

try { document.documentElement.style.scrollBehavior = 'smooth'; } catch {}

gsap.fromTo('.sigil-img',{ scale:0.98, opacity:0.95 },{ scale:1, opacity:1, duration:2.2, ease:'sine.inOut', yoyo:true, repeat:-1 });