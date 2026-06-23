// OGL is bundled locally for production.
import { Renderer, Camera, Transform, Geometry, Program, Mesh, Vec3, Plane, Texture } from 'ogl';

// ─── Utility functions (from morpho module 66287) ────────────────────────────
const randomRange    = (a, b) => a + Math.random() * (b - a);
const randomBoolean  = (p = 0.5) => Math.random() < p;
const randomSign     = () => Math.random() > 0.5 ? 1 : -1;
const limitRange     = (min, v, max) => Math.max(min, Math.min(v, max));
const distPts        = (a, b) => Math.sqrt((b.x-a.x)**2 + (b.y-a.y)**2);
const smoothstep     = (a, b, v) => {
  const t = limitRange(0, (v - a) / (b - a), 1);
  return t * t * (3 - 2 * t);
};

// Skewed random: ai(min, max, skew=-0.25, a=10)
function ai(min, max, skew = 0, a = 10) {
  if (min >= max) return min;
  skew = Math.max(-1, Math.min(1, skew));
  if (skew === 0) return min + Math.random() * (max - min);
  return min + Math.pow(Math.random(), Math.pow(a, -skew)) * (max - min);
}

// ─── GLSL Simplex Noise + Cloud (from morpho module 61578) ───────────────────
const GLSL_SNOISE = `
vec3 _mod289v3(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec2 _mod289v2(vec2 x){ return x - floor(x*(1.0/289.0))*289.0; }
vec3 _permute(vec3 x){ return _mod289v3(((x*34.0)+1.0)*x); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1  = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = _mod289v2(i);
  vec3 p = _permute(_permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m = max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m = m*m; m = m*m;
  vec3 xv = 2.0*fract(p*C.www)-1.0;
  vec3 h  = abs(xv)-0.5;
  vec3 ox = floor(xv+0.5);
  vec3 a0 = xv-ox;
  m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x  = a0.x *x0.x  + h.x *x0.y;
  g.yz = a0.yz*x12.xz + h.yz*x12.yw;
  return 130.0*dot(m,g);
}`;

const GLSL_COMPLEX_CLOUD = `
float complexCloudPattern(vec2 uv, float t){
  float o = 0.0;
  uv *= cloudFrequency;
  t  *= cloudSpeed;
  vec2 vel = vec2(t*0.1);
  o += snoise(uv+vel)*0.25+0.25;
  float a = snoise(uv*vec2(cos(t*0.15),sin(t*0.1))*0.1)*3.1415;
  vel = vec2(cos(a),sin(a));
  o += snoise(uv+vel)*0.25+0.25;
  o = fract(o);
  return o*cloudAmplitude;
}`;

// ─── Vertex Shader ────────────────────────────────────────────────────────────
// Matches morpho.org's particle vertex shader exactly (WebGL2 / GLSL 300 es)
const VERT = `#version 300 es
precision highp float;

in  vec3 position;
out vec4 vColor;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float time;
uniform float pointSize;
uniform vec2  mousePosition;
uniform bool  hasMouseMoved;
uniform float lessDotAlpha;

// ── constants from source ──
const float showEvery                     = 4.0;
const vec3  blueColor1                    = vec3(0.102, 0.843, 0.624); // #1ad79f (brand color mid)
const vec3  blueColor2                    = vec3(0.55, 0.95, 0.8); // #8cf2cc (light brand)
const vec3  blueColor3                    = vec3(0.04, 0.4, 0.3); // #0a6633 (dark brand)
const float colorBlendFactor              = 0.5;
const float colorBlendOffset              = -0.05;
const float basePointSize                 = 5.8;
const float distancePointSizeMultiplier   = -0.5;
const float mouseInfluenceRadius          = 0.2;
const float mouseSizeBoost                = 1.3;
const float farAlphaBase                  = 2.85;
const float farAlphaMultiplier            = 0.4;
const float cloudFrequency                = 0.08;
const float cloudAmplitude                = 2.4;
const float cloudSpeed                    = 4.0;
const float uvFactor                      = 10.0;
const float centerAlphaMin                = 0.3;
const float centerAlphaPowerFactor        = 0.9;
const float centerAlphaScaleX             = 0.8;
const float centerAlphaScaleY             = 1.7;
const float centerParticlesBrightnessDist = 0.4;
const float centerParticlesBrightnessPow  = 2.4;
const float centerParticlesWhiteFactor    = 1.2;
const float topPoleSoftenStart            = 0.86;
const float topPoleSoftenEnd              = 0.98;
const float zoomParticleSizeMin           = 0.72;

${GLSL_SNOISE}
${GLSL_COMPLEX_CLOUD}

void main(){
  vec3 pos     = position;
  vec4 clipPos = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_Position  = clipPos;

  // Particle density control (show 1/4 when lessDotAlpha=0)
  float every  = max(showEvery, 1.0);
  float rem    = mod(float(gl_VertexID), every);
  float vis    = (1.0 - step(0.5, rem)) + lessDotAlpha;

  // Point size with depth
  float psBase = (basePointSize + clipPos.z * distancePointSizeMultiplier) * pointSize;
  vec3  ndc    = clipPos.xyz / clipPos.w;
  float topPole = smoothstep(topPoleSoftenStart, topPoleSoftenEnd, -pos.z);
  float poleSize = mix(1.0, 0.42, topPole);
  float zoomSize = mix(zoomParticleSizeMin, 1.0, lessDotAlpha);

  if(hasMouseMoved){
    float md  = distance(ndc.xy, mousePosition);
    float prx = 1.0 - smoothstep(0.0, mouseInfluenceRadius, md);
    float sm  = position.y < 0.0 ? 1.0 : (1.0 + prx * mouseSizeBoost);
    gl_PointSize = psBase * sm * poleSize * zoomSize;
  } else {
    gl_PointSize = psBase * poleSize * zoomSize;
  }

  // Cloud color (using pos in object space)
  vec2 uv = vec2(0.5 + pos.x * uvFactor, 0.5 + pos.z * uvFactor);
  vec3 w  = vec3(
    complexCloudPattern(uv * 1.0, +time * 0.8) - 0.1,
    complexCloudPattern(uv * 1.4, -time * 1.3) - 0.1,
    complexCloudPattern(uv * 0.7, +time * 0.6) - 0.1
  );
  w *= colorBlendFactor;
  w += colorBlendOffset;
  vec3 color = w.x * blueColor1 + w.y * blueColor2 + w.z * blueColor3;
  color *= mix(1.0, 0.72, topPole);

  // Alpha: depth-based
  float farAlpha = clamp(farAlphaBase - clipPos.z * farAlphaMultiplier, 0.0, 1.0);

  // Alpha: center void
  float dim = centerAlphaPowerFactor
    - distance(vec2(pos.x * centerAlphaScaleX, pos.z * centerAlphaScaleY), vec2(0.0));
  float centerAlpha = 1.0 - clamp(dim, 0.0, 1.0 - centerAlphaMin);

  // Center brightness (particle switching)
  if(lessDotAlpha > 0.0){
    float clearance = centerParticlesBrightnessDist * lessDotAlpha;
    float d2 = distance(vec2(0.0), vec2(pos.x, pos.z));
    if(d2 < clearance){
      centerAlpha += abs(d2 - clearance) * centerParticlesBrightnessPow;
      color *= centerParticlesWhiteFactor;
    }
  }

  farAlpha -= 1.0 - centerAlpha;
  farAlpha *= vis;
  vColor = vec4(color, farAlpha);
}`;

// ─── Fragment Shader ──────────────────────────────────────────────────────────
const FRAG = `#version 300 es
precision highp float;

in  vec4 vColor;
out vec4 fragColor;

const float radius         = 0.45;
const float edge           = 0.0;
const vec2  center         = vec2(0.5);
const float alphaThreshold = 0.05;

void main(){
  if(vColor.a <= alphaThreshold) discard;
  float d          = distance(gl_PointCoord, center);
  float alpha      = 1.0 - smoothstep(radius - edge, radius, d);
  float brightness = alpha * vColor.a;
  if(brightness <= alphaThreshold) discard;
  fragColor = vec4(vColor.rgb, brightness);
}`;

// ─── Butterfly logo: dissolve shaders (from morpho modules ao / ad) ───────────
const LOGO_VERT = `#version 300 es
precision highp float;
in  vec3 position;
in  vec2 uv;
out vec2 vUv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const LOGO_FRAG = `#version 300 es
precision highp float;
in  vec2 vUv;
out vec4 fragColor;

uniform float opacity;
uniform float dissolve;
uniform float frame;
uniform sampler2D textureMap;

const float noiseDefinition       = 80.0;
const float dissolveStart         = -1.5;
const float introDissolveFactor   = 50.0;
const float opacityDissolveFactor = 2.4;

${GLSL_SNOISE}

void main(){
  vec4 tex = texture(textureMap, vUv);
  if(tex.a <= 0.01) discard;

  // Pixel-grid noise dissolve
  vec2  cell = floor(vUv * noiseDefinition);
  float rnd  = snoise(cell);

  // Bias dissolve to radiate from the edges inward
  float d = 0.5 - distance(vUv, vec2(0.5));
  rnd = mix(rnd, d, 0.8);

  // Reveal progress: intro grows with dissolve counter; exit pulls it back with opacity
  float edge         = 0.05;
  float revealFactor = dissolveStart + min(dissolve / introDissolveFactor, 2.5);
  revealFactor      -= (1.0 - opacity) * opacityDissolveFactor;
  float reveal       = smoothstep(rnd, rnd + edge, revealFactor);

  float alpha = tex.a * clamp(reveal, 0.0, 1.0);
  if(alpha <= 0.01) discard;
  fragColor = vec4(tex.rgb, alpha);
}`;

// ─── Brand logo shader ────────────────────────────────────────────────────────
const BRAND_FRAG = `#version 300 es
precision highp float;
in  vec2 vUv;
out vec4 fragColor;
uniform sampler2D textureMap;
uniform float opacity;
uniform float focus;
void main(){
  vec4 tex = texture(textureMap, vUv);
  float alpha = tex.a * opacity;
  if(alpha <= 0.01) discard;
  float gray = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
  vec3 inactive = vec3(gray * 0.62 + 0.12);
  vec3 color = mix(inactive, tex.rgb, focus);
  fragColor = vec4(color, alpha * mix(0.48, 1.0, focus));
}`;

// Brand data: first 32 entries are used by the two visible orbit rings.
// Assets are drawn into canvas textures so the whole orbit remains WebGL.
const CIRCLE_FLAG_BASE = 'https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/';
const BRAND_DATA = [
  // ring 0 — 12 flags
  { label: 'US', src: `${CIRCLE_FLAG_BASE}us.svg`, circleFlag: true, color: '#3c7cff' },
  { label: 'UK', src: `${CIRCLE_FLAG_BASE}gb.svg`, circleFlag: true, color: '#315bc7' },
  { label: 'Germany', src: `${CIRCLE_FLAG_BASE}de.svg`, circleFlag: true, color: '#f1c232' },
  { label: 'France', src: `${CIRCLE_FLAG_BASE}fr.svg`, circleFlag: true, color: '#315bc7' },
  { label: 'Japan', src: `${CIRCLE_FLAG_BASE}jp.svg`, circleFlag: true, color: '#d02f44' },
  { label: 'Canada', src: `${CIRCLE_FLAG_BASE}ca.svg`, circleFlag: true, color: '#e0313f' },
  { label: 'Brazil', src: `${CIRCLE_FLAG_BASE}br.svg`, circleFlag: true, color: '#26a269' },
  { label: 'India', src: `${CIRCLE_FLAG_BASE}in.svg`, circleFlag: true, color: '#ff8f2d' },
  { label: 'Australia', src: `${CIRCLE_FLAG_BASE}au.svg`, circleFlag: true, color: '#315bc7' },
  { label: 'Singapore', src: `${CIRCLE_FLAG_BASE}sg.svg`, circleFlag: true, color: '#e0313f' },
  { label: 'South Korea', src: `${CIRCLE_FLAG_BASE}kr.svg`, circleFlag: true, color: '#315bc7' },
  { label: 'Netherlands', src: `${CIRCLE_FLAG_BASE}nl.svg`, circleFlag: true, color: '#ef4b4b' },
  // ring 1 — 20 logos
  { label: 'Client A', src: 'assets/clients/logoipsum-426.svg', color: '#52ffa8' },
  { label: 'Client B', src: 'assets/clients/logoipsum-380.svg', color: '#58a6ff' },
  { label: 'Client C', src: 'assets/clients/logoipsum-418.svg', color: '#f4f8f5' },
  { label: 'Client D', src: 'assets/clients/logoipsum-430.svg', color: '#7dffdf' },
  { label: 'Client E', src: 'assets/clients/logoipsum-360.svg', color: '#80a9ff' },
  { label: 'Client F', src: 'assets/clients/logoipsum-367.svg', color: '#f6fff9' },
  { label: 'Client G', src: 'assets/clients/logoipsum-414.svg', color: '#47e7c2' },
  { label: 'Client H', src: 'assets/clients/logoipsum-402.svg', color: '#99f7c8' },
  { label: 'ISO 27001', src: 'assets/badge-iso-27001.svg', color: '#1ad79f' },
  { label: 'ISO 50001', src: 'assets/badge-iso-50001.svg', color: '#5ee8c0' },
  { label: 'Grid Leader', src: 'assets/badge-g2-grid-leader.svg', color: '#ff7448' },
  { label: 'Security', src: 'assets/badge-g2-top50-security.svg', color: '#ff9a47' },
  // ring 2 — 15 logos
  { label: 'PHP', src: 'assets/php-logo.svg', color: '#8993be' },
  { label: 'Java', src: 'assets/java-logo.svg', color: '#f89820' },
  { label: 'cURL', src: 'assets/curl-logo.svg', color: '#f7f7f7' },
  { label: 'OpenAI', src: 'assets/ai/openai-chatgpt.svg', color: '#12d99f' },
  { label: 'Perplexity', src: 'assets/ai/perplexity.svg', color: '#20c8d9' },
  { label: 'Client A', src: 'assets/clients/logoipsum-426.svg', color: '#52ffa8' },
  { label: 'Client B', src: 'assets/clients/logoipsum-380.svg', color: '#58a6ff' },
  { label: 'Client C', src: 'assets/clients/logoipsum-418.svg', color: '#f4f8f5' },
  { label: 'Client D', src: 'assets/clients/logoipsum-430.svg', color: '#7dffdf' },
  { label: 'Client E', src: 'assets/clients/logoipsum-360.svg', color: '#80a9ff' },
  { label: 'Client F', src: 'assets/clients/logoipsum-367.svg', color: '#f6fff9' },
  { label: 'Client G', src: 'assets/clients/logoipsum-414.svg', color: '#47e7c2' },
  { label: 'Trustpilot', src: 'assets/ratings/trustpilot.svg', color: '#00b67a' },
  { label: 'Capterra', src: 'assets/ratings/capterra.svg', color: '#2879ff' },
  { label: 'G2', src: 'assets/ratings/g2.svg', color: '#ff6b3d' },
];

function makeBrandCanvas(label, color, texture, src, circleFlag = false) {
  const c = document.createElement('canvas');
  c.width = c.height = 192;
  const ctx = c.getContext('2d');

  function paintBase() {
    ctx.clearRect(0, 0, 192, 192);
    ctx.beginPath();
    ctx.arc(96, 96, 73, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(246, 251, 249, 0.96)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(96, 96, 73, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.82)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function paintFallback() {
    paintBase();
    const initials = label.split(/\s+/).map(part => part[0]).join('').slice(0, 3).toUpperCase();
    const fs = initials.length > 2 ? 34 : initials.length > 1 ? 42 : 54;
    ctx.font = `800 ${fs}px Inter,sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 96, 98);
    if (texture) {
      texture.image = c;
      texture.needsUpdate = true;
    }
  }

  if (circleFlag && src) {
    ctx.clearRect(0, 0, 192, 192);
  } else {
    paintFallback();
  }

  if (src && texture) {
    const img = new Image();
    img.onload = () => {
      if (circleFlag) {
        ctx.clearRect(0, 0, 192, 192);
      } else {
        paintBase();
      }
      const maxW = circleFlag ? 146 : 104;
      const maxH = circleFlag ? 146 : 64;
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1.2);
      const w = img.width * ratio;
      const h = img.height * ratio;
      ctx.drawImage(img, 96 - w / 2, 96 - h / 2, w, h);
      texture.image = c;
      texture.needsUpdate = true;
    };
    img.onerror = paintFallback;
    if (/^https?:\/\//.test(src)) {
      img.crossOrigin = 'anonymous';
    }
    img.src = src;
  }

  return c;
}

// ─── OGL Setup ────────────────────────────────────────────────────────────────
const renderer = new Renderer({ dpr: Math.min(devicePixelRatio, 2), antialias: false, alpha: true, webgl2: true });
const gl = renderer.gl;
document.getElementById('gl-container').appendChild(gl.canvas);
gl.clearColor(0, 0, 0, 0);

const camera = new Camera(gl);
// Slight elevation so the equatorial plane is seen at an angle (not edge-on),
// matching morpho.org's framing — otherwise the centerAlpha void collapses to a flat line.
camera.position.set(0, 1.15, 4.35);
camera.perspective({ fov: 50, far: 200, near: 0.1, aspect: gl.canvas.width / gl.canvas.height });

const scene = new Transform();
const brandScene = new Transform();
brandScene.setParent(scene);

// ─── Particle System ──────────────────────────────────────────────────────────
const NUM = 12000;
const positions = new Float32Array(NUM * 3);

function createParticle() {
  // v: polar angle fraction, biased toward poles via skewed random
  const v0  = randomBoolean(0.5) ? ai(3e-4, 0.48, -0.25) : 0.9997 - ai(0, 0.48, -0.25);
  const r0  = randomRange(80, 200);         // initial radius (far for intro)
  const rd  = randomRange(0.985, 1.015);    // target radius ≈ 1
  const rs  = randomRange(0.9, 1.1);        // radius scale noise
  const l   = randomRange(1.5e-4, 4.5e-4); // azimuth drift speed

  // Orbit speed proportional to latitude (more at equator)
  const orbitR = 0.022 - 0.022 * Math.abs(0.5 - v0) * 1.6;
  const ou  = randomRange(1, 2) * orbitR * randomSign();
  const ov  = randomRange(1, 2) * orbitR * randomSign();
  const wob = 0.003 * randomRange(1, 5);   // wobble amplitude
  const smt = randomRange(5, 16);          // smooth speed

  const flipCheck = (v, dt) => (v < 0.1 || v > 0.9) && randomBoolean(1e-4 * dt);

  const s = {
    u: randomRange(0, 1),
    v: v0,
    vd: flipCheck(v0, 30) ? 1 - v0 : v0,
    r: r0, r2: 1, r2d: 1, rd,
    mu: 0, mv: 0,
    mui: randomRange(0, 2 * Math.PI),
    mvi: randomRange(0, 2 * Math.PI),
    h: 0,
    mdvu: 0, mdvv: 0, mdvud: 0, mdvvd: 0,
  };

  return {
    get u()    { return s.u + s.mu + s.mdvu; },
    get v()    { return s.v + s.mv + s.mdvv; },
    get r()    { return s.r; },
    get r2()   { return s.r2; },
    get h()    { return s.h; },
    set h(x)   { s.h = x; },
    get mdvud(){ return s.mdvud; }, set mdvud(x){ s.mdvud = x; },
    get mdvvd(){ return s.mdvvd; }, set mdvvd(x){ s.mdvvd = x; },

    update(dt, frame) {
      s.mdvud *= 0.92;
      s.mdvvd *= 0.92;
      s.mdvu  -= (s.mdvu - s.mdvud) / (100 / dt);
      s.mdvv  -= (s.mdvv - s.mdvvd) / (100 / dt);

      s.u -= l * dt;

      if (Math.abs(s.v - s.vd) > 0.05) {
        const e = 0.5 - Math.abs(0.5 - s.v);
        s.r2d   = 1 - Math.min(0.8, 2 * e) * rs;
        s.u    += l * dt * 3;
      } else {
        s.r2d = 1;
      }

      s.r2 -= (s.r2 - s.r2d) / (10 / dt);
      s.v  -= (s.v - s.vd)   / (frame < 40 ? 30 : 400 / dt);
      s.r  -= (s.r - s.rd - s.h) / (smt / dt);

      if (s.v > 0.05 && s.v < 0.95) {
        const e  = 1 + 40 * s.h;
        s.mui   += ou * dt * e;
        s.mvi   += ov * dt * e;
        s.mu     = Math.sin(s.mui) * wob;
        s.mv     = Math.cos(s.mvi) * wob;
      }

      // Random hemisphere flip when at poles
      const flipDt = dt * (frame < 60 ? (60 - frame) * 0.3 : 1);
      if (flipCheck(s.v, flipDt)) s.vd = 1 - s.vd;
    },

    reset() { s.r = r0; s.rd = rd; },
  };
}

const particles = Array.from({ length: NUM }, createParticle);

// ─── Geometry + Program ───────────────────────────────────────────────────────
const geometry = new Geometry(gl, {
  position: { size: 3, data: positions },
});

const program = new Program(gl, {
  vertex:   VERT,
  fragment: FRAG,
  uniforms: {
    // Declare these so OGL auto-updates them each frame
    modelViewMatrix:  { value: new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]) },
    projectionMatrix: { value: new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]) },
    time:          { value: 0 },
    pointSize:     { value: window.innerHeight / 1024 },
    mousePosition: { value: [0, 0] },
    hasMouseMoved: { value: false },
    lessDotAlpha:  { value: 1.0 },
  },
  transparent: true,
  depthWrite:  false,
  depthTest:   false,
});

// Force additive blending (SRC_ALPHA, ONE) — same as original
program.blendFunc = { src: gl.SRC_ALPHA, dst: gl.ONE };

const mesh = new Mesh(gl, { geometry, program, mode: gl.POINTS });
mesh.rotation.x = Math.PI / 2;
mesh.setParent(scene);

// ─── Center logo (dissolve) — ROLA mark, rendered white ───────────────────────
const logoTex = new Texture(gl, {
  generateMipmaps: false,
  minFilter: gl.LINEAR, magFilter: gl.LINEAR,
  wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE,
});
// ROLA graphic mark (same paths as the nav logo) in white, centered on a
// transparent square so the dissolve shader gets clean rgb=white + alpha=shape.
const ROLA_LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">' +
    '<g transform="translate(64 96) scale(16)" fill="#ffffff">' +
      '<path d="M13 4a5 5 0 0 1 0 10v4a9 9 0 1 0-9-9h4a5 5 0 0 1 5-5"/>' +
      '<path d="M2 15a5 5 0 0 1 5 5h4a9 9 0 0 0-9-9z" opacity="0.4"/>' +
    '</g>' +
  '</svg>';
const logoCanvas = document.createElement('canvas');
logoCanvas.width = logoCanvas.height = 512;
const logoImg = new Image();
logoImg.onload = () => {
  const ctx = logoCanvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);
  ctx.drawImage(logoImg, 0, 0, 512, 512);
  logoTex.image = logoCanvas;
  logoTex.needsUpdate = true;
};
logoImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ROLA_LOGO_SVG);

const logoProgram = new Program(gl, {
  vertex:   LOGO_VERT,
  fragment: LOGO_FRAG,
  uniforms: {
    modelViewMatrix:  { value: new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]) },
    projectionMatrix: { value: new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]) },
    textureMap: { value: logoTex },
    opacity:    { value: 1 },
    dissolve:   { value: 0 },
    frame:      { value: 0 },
  },
  transparent: true,
  depthWrite:  false,
  depthTest:   false,
});
logoProgram.blendFunc = { src: gl.SRC_ALPHA, dst: gl.ONE }; // additive, same as particles

const logoMesh = new Mesh(gl, {
  geometry: new Plane(gl, { width: 0.42, height: 0.42 }),
  program:  logoProgram,
});
logoMesh.setParent(scene);

// ─── Brand orbit rings ───────────────────────────────────────────────────────
const ORBIT_LAYERS    = [12, 20];     // logos per ring
const ORBIT_R_START   = 0.52;         // inner ring radius
const ORBIT_R_END     = 1.18;         // outer ring radius
const ORBIT_SPEED     = 0.001;        // revolution speed (slow, like Morpho)
const ORBIT_SIZE      = 0.092;        // logo quad world size
const ORBIT_R_DECAY   = 0.055;        // effective radius decay per layer
const ORBIT_SCALE_DEC   = 0.16;  // outer rings scale down
const ORBIT_INNER_R_SCALE = 0.78;  // inner ring orbit radius
const ORBIT_OUTER_R_SCALE = 0.86;  // outer ring orbit radius
const ORBIT_ALPHA_DEC   = 0.05;  // outer rings slightly less opaque
const ORBIT_RETRACT     = 0.12;  // rings retract toward center when zoomed in
const ORBIT_RETRACT_SPD = 20;    // damping speed for retract

let brandT = 0;
const brandObjects = [];
let bdIdx = 0;

ORBIT_LAYERS.forEach((count, layerIdx) => {
  // Morpho formula: frac = layerIdx / totalLayers (NOT length-1)
  const frac   = layerIdx / ORBIT_LAYERS.length;
  const baseRRaw = ORBIT_R_START + frac * (ORBIT_R_END - ORBIT_R_START);
  const baseR  = layerIdx === 0 ? baseRRaw * ORBIT_INNER_R_SCALE : baseRRaw * ORBIT_OUTER_R_SCALE;
  const dir    = layerIdx % 2 === 0 ? 1 : -1;  // alternate CW / CCW

  for (let i = 0; i < count; i++) {
    if (bdIdx >= BRAND_DATA.length) break;
    const data = BRAND_DATA[bdIdx++];
    const phi  = (i / count) * Math.PI * 2;

    const tex = new Texture(gl, {
      generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE,
    });
    tex.image       = makeBrandCanvas(data.label, data.color, tex, data.src, data.circleFlag);
    tex.needsUpdate = true;

    const prog = new Program(gl, {
      vertex:   LOGO_VERT,
      fragment: BRAND_FRAG,
      uniforms: {
        modelViewMatrix:  { value: new Float32Array(16) },
        projectionMatrix: { value: new Float32Array(16) },
        textureMap: { value: tex },
        opacity:    { value: 0 },
        focus:      { value: layerIdx === 0 ? 1 : 0 },
      },
      transparent: true,
      depthWrite: false,
      depthTest:  false,
    });
    prog.blendFunc = { src: gl.SRC_ALPHA, dst: gl.ONE_MINUS_SRC_ALPHA };

    const plane = new Mesh(gl, {
      geometry: new Plane(gl, { width: ORBIT_SIZE, height: ORBIT_SIZE }),
      program: prog,
    });
    plane.setParent(brandScene);
    plane.scale.set(0.00001);

    brandObjects.push({
      plane, prog, phi, baseR, dir, layerIdx,
      curR: baseR,   // damped current radius (for retract effect)
      curScale: 0,
      focus: layerIdx === 0 ? 1 : 0,
      focusVelocity: 0,
    });
  }
});

function updateBrands(dt, scrollProg, activeSegment) {
  brandT += ORBIT_SPEED * dt;
  // Morpho formula: k = limitRange(0, -1 + 2*scrollProg, 1)  →  k starts at scrollProg=0.5
  const k = limitRange(0, -1 + 2 * scrollProg, 1);

  brandObjects.forEach((b, i) => {
    // Retract rings toward center as zoom progresses (brandRetractFactor=0.4)
    const retractedR = b.baseR * (1 - k * ORBIT_RETRACT);
    b.curR -= (b.curR - retractedR) / (ORBIT_RETRACT_SPD / dt);

    const angle = b.phi + brandT * b.dir;
    // Apply circle radius decay per layer (brandCircleRadiusDecay=0.13)
    const effR  = b.curR * (1 - b.layerIdx * ORBIT_R_DECAY);

    b.plane.position.x = Math.sin(angle) * effR;
    b.plane.position.y = Math.cos(angle) * effR;
    b.plane.position.z = 0.05 + i * 0.0008;

    // Scale grows with k; outer layers scale down (brandLayerScaleDecay=0.28)
    const scaleK = k > 0.005 ? k * (1 - b.layerIdx * ORBIT_SCALE_DEC) : 0;
    b.curScale  += (scaleK - b.curScale) * Math.min(1, 0.08 * dt);
    b.plane.scale.set(Math.max(0.00001, b.curScale));

    // Opacity: outer layers slightly less opaque (brandLayerOpacityDecay=0.04)
    const alpha = limitRange(0, k * (1 - b.layerIdx * ORBIT_ALPHA_DEC), 1);
    b.prog.uniforms.opacity.value = alpha;

    const targetFocus = b.layerIdx === activeSegment ? 1 : 0;
    const focusStiffness = 0.055;
    const focusDamping = 0.78;
    b.focusVelocity += (targetFocus - b.focus) * focusStiffness * dt;
    b.focusVelocity *= Math.pow(focusDamping, dt);
    b.focus = limitRange(0, b.focus + b.focusVelocity * dt, 1);
    b.prog.uniforms.focus.value = b.focus;
  });
}

// Logo/camera progress is damped toward the wheel target for a softer zoom.
let scrollProgress = 0;          // damped value used for camera/rendering
let scrollTarget   = 0;          // direct wheel intent
let scrollVelocity = 0;
let logoOpacity    = 1;
// Scroll budget stages:
//   0 → 1            sphere zooms in, inner brand ring appears
//   1 → OUTER_RING_AT focus stays on the inner ring
//   OUTER_RING_AT→COVER_START  outer logo ring takes focus (explore the orbit)
//   COVER_START → SCROLL_MAX   scene washes out, then the white page/content takes over
// The cover only begins once the outer ring has been reached, so users get to
// scroll through the full orbit (incl. the outer logos) before the page covers.
const SCROLL_MAX    = 4;
const OUTER_RING_AT = 1.5;
const COVER_ENABLED = true;
const COVER_START   = OUTER_RING_AT + (SCROLL_MAX - OUTER_RING_AT) * 0.52;
const COVER_RANGE   = SCROLL_MAX - COVER_START;
const coverScrollEl = document.querySelector('.home-cover__scroll');
window.addEventListener('wheel', e => {
  // Once the white page has fully covered the hero, hand scrolling over to it.
  if (document.documentElement.classList.contains('home-cover-scrollable')) {
    // Only pull the hero back when the page is at its very top and we scroll up.
    if (e.deltaY < 0 && (!coverScrollEl || coverScrollEl.scrollTop <= 0)) {
      homeUiReturnLock = false;
      scrollTarget = limitRange(0, scrollTarget + e.deltaY * 0.0012, SCROLL_MAX);
    }
    return;
  }
  if (e.deltaY > 0) homeUiReturnLock = false;
  scrollTarget = limitRange(0, scrollTarget + e.deltaY * 0.0012, SCROLL_MAX);
}, { passive: true });

// ─── Mouse interaction ────────────────────────────────────────────────────────
// Mouse position in [-0.5, 0.5] normalized screen space
const mouse  = { x: 0, y: 0 };
const smooth = { x: 0, y: 0 };
let mouseMoved = false;

window.addEventListener('mousemove', e => {
  mouse.x    = e.clientX / window.innerWidth  - 0.5;
  mouse.y    = e.clientY / window.innerHeight - 0.5;
  mouseMoved = true;
});
window.addEventListener('touchmove', e => {
  const t = e.touches[0];
  mouse.x = t.clientX / window.innerWidth  - 0.5;
  mouse.y = t.clientY / window.innerHeight - 0.5;
  mouseMoved = true;
}, { passive: true });

// Project particle local pos → screen [-0.5, 0.5] for hover detection
function projectToScreen(lx, ly, lz) {
  // mesh.rotation.x = PI/2: local(x,y,z) → world(x, -z, y)
  const wx = lx, wy = -lz, wz = ly;

  const vx = wx - camera.position.x;
  const vy = wy - camera.position.y;
  const vz = wz - camera.position.z;   // view depth (negative = in front when camera.z > 0)

  const f   = 1.0 / Math.tan((50 * Math.PI / 180) / 2);
  const ar  = window.innerWidth / window.innerHeight;
  const cw  = -vz;             // perspective divide (positive = in front of camera)
  if (cw <= 0) return null;
  return { x: (f / ar * vx) / cw / 2, y: (f * vy) / cw / 2 };
}

// ─── Resize ───────────────────────────────────────────────────────────────────
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.perspective({ fov: 50, far: 200, near: 0.1, aspect: gl.canvas.width / gl.canvas.height });
  program.uniforms.pointSize.value = window.innerHeight / 1024;
}
window.addEventListener('resize', resize);
resize();

// ─── Particle update + position buffer write ──────────────────────────────────
function updateParticles(dt, frame) {
  mesh.updateMatrixWorld();

  for (let i = 0; i < NUM; i++) {
    const p = particles[i];
    p.update(dt, frame);

    const az   = 2 * Math.PI * p.u;
    const pol  = Math.acos(Math.max(-1, Math.min(1, 2 * p.v - 1)));
    const sinP = Math.sin(pol);
    const px   = sinP * Math.cos(az) * p.r * p.r2;
    const py   = sinP * Math.sin(az) * p.r * p.r2;
    const pz   = Math.cos(pol) * p.r;

    // Mouse proximity → push particles
    if (mouseMoved && py > -0.15 && pz > -0.82) {
      const sc = projectToScreen(px, py, pz);
      if (sc) {
        const facing = 1 + Math.min(0, py / 0.15);
        const dist   = distPts(sc, smooth);
        if (dist < 0.06) {
          const edge   = 0.06 - dist;
          const latFac = limitRange(0.2, p.v < 0.5 ? 10 * p.v : 10 - 10 * p.v, 1);
          p.h          = 1.4 * edge * facing;
          p.mdvud     -= 230 * (mouse.x - smooth.x) * edge * facing * latFac;
          p.mdvvd     += 230 * (mouse.y - smooth.y) * edge * facing * latFac;
        } else {
          p.h = 0;
        }
      } else {
        p.h = 0;
      }
    } else {
      p.h = 0;
    }

    positions[i * 3]     = px;
    positions[i * 3 + 1] = py;
    positions[i * 3 + 2] = pz;
  }

  geometry.attributes.position.needsUpdate = true;
}

// ─── UI elements for scroll-driven exit ──────────────────────────────────────
const rootEl = document.documentElement;
const orbitCopyEl = document.querySelector('.orbit-copy');
const orbitCopyLabelEl = document.querySelector('.orbit-copy__stat-label');
const orbitCopyValueEl = document.querySelector('.orbit-copy__stat-value');
const ORBIT_COPY_STATES = [
  { label: 'Supported Countries', value: '265' },
  { label: 'Support Services', value: '10,000' },
];
let activeOrbitSegment = 0;
let renderedOrbitSegment = -1;
let homeUiWasExiting = false;
let homeUiReturnTimer = null;
let homeUiReturnLock = false;
let coverRenderedProgress = -1;
let heroRenderedOpacity = -1;
let coverPhase = 0;   // 0→1 while the next page rises (drives the sphere shrink)

function clearHomeUiInlineStyles() {
  document.querySelectorAll('#nav,.home-hero-eyebrow,.home-hero-h1,.home-stat,.scroll-cue').forEach(el => {
    el.style.opacity = '';
    el.style.transform = '';
    el.style.filter = '';
  });
}

function resetOrbitCopyTextAnimation() {
  if (!orbitCopyLabelEl || !orbitCopyValueEl) return;
  orbitCopyLabelEl.style.animation = 'none';
  orbitCopyValueEl.style.animation = 'none';
  orbitCopyLabelEl.offsetHeight;
  orbitCopyValueEl.offsetHeight;
  orbitCopyLabelEl.style.animation = '';
  orbitCopyValueEl.style.animation = '';
}

function showOrbitCopySegment(segment) {
  if (!orbitCopyEl || !orbitCopyLabelEl || !orbitCopyValueEl) return;
  const nextState = ORBIT_COPY_STATES[segment];
  renderedOrbitSegment = segment;
  orbitCopyEl.classList.remove('is-visible');
  orbitCopyLabelEl.textContent = nextState.label;
  orbitCopyValueEl.textContent = nextState.value;
  resetOrbitCopyTextAnimation();
  requestAnimationFrame(() => orbitCopyEl.classList.add('is-visible'));
}

function hideOrbitCopy() {
  if (!orbitCopyEl) return;
  orbitCopyEl.classList.remove('is-visible');
  renderedOrbitSegment = -1;
}

function replayHomeUiEntrance() {
  clearHomeUiInlineStyles();
  scrollTarget = 0;
  scrollProgress = 0;
  scrollVelocity = 0;
  homeUiReturnLock = true;
  rootEl.classList.remove('home-ui-returning');
  // Keep the exit state during the reflow so presented styles cannot flash in.
  rootEl.offsetHeight;
  rootEl.classList.add('home-ui-returning');
  rootEl.classList.remove('home-ui-exiting');
  clearTimeout(homeUiReturnTimer);
  homeUiReturnTimer = setTimeout(() => {
    rootEl.classList.remove('home-ui-returning');
  }, 1500);
}

function syncHomeUiExit() {
  const uiScroll = Math.max(scrollTarget, scrollProgress);
  if (homeUiReturnLock && uiScroll < 0.12) {
    rootEl.classList.remove('home-ui-exiting');
    return;
  }
  if (uiScroll > 0.035) {
    homeUiWasExiting = true;
    rootEl.classList.remove('home-ui-returning');
    rootEl.classList.add('home-ui-exiting');
  } else if (scrollTarget < 0.008 && scrollProgress < 0.008) {
    if (homeUiWasExiting) {
      homeUiWasExiting = false;
      replayHomeUiEntrance();
    } else {
      rootEl.classList.remove('home-ui-exiting');
    }
  }
}

function syncHomeCover() {
  if (!COVER_ENABLED) {
    coverPhase = 0;
    if (coverRenderedProgress !== 0) {
      rootEl.style.setProperty('--home-cover-progress', '0');
      rootEl.style.setProperty('--home-cover-wash', '0');
      rootEl.style.setProperty('--home-cover-content-opacity', '0');
      rootEl.style.setProperty('--home-cover-content-y', '48vh');
      coverRenderedProgress = 0;
    }
    if (heroRenderedOpacity !== 1) {
      rootEl.style.setProperty('--home-hero-opacity', '1');
      heroRenderedOpacity = 1;
    }
    rootEl.classList.remove('home-cover-visible', 'home-cover-complete', 'home-cover-scrollable');
    return;
  }

  let raw = limitRange(0, (scrollProgress - COVER_START) / COVER_RANGE, 1);
  if (raw > 0.985) raw = 1;
  if (raw < 0.015) raw = 0;
  const washProgress = smoothstep(0, 0.62, raw);
  const pageProgress = smoothstep(0.22, 1, raw);
  coverPhase = pageProgress;
  const heroOpacity = 1 - smoothstep(0.18, 0.95, raw);

  // First wash the dark scene, then fade in the white page and content.
  if (Math.abs(raw - coverRenderedProgress) > 0.001) {
    const contentProgress = smoothstep(0.72, 1, raw);
    const contentY = Math.round((1 - contentProgress) * window.innerHeight * 0.48);
    rootEl.style.setProperty('--home-cover-progress', pageProgress.toFixed(4));
    rootEl.style.setProperty('--home-cover-wash', washProgress.toFixed(4));
    rootEl.style.setProperty('--home-cover-content-opacity', contentProgress.toFixed(4));
    rootEl.style.setProperty('--home-cover-content-y', `${contentY}px`);
    coverRenderedProgress = raw;
  }
  if (Math.abs(heroOpacity - heroRenderedOpacity) > 0.001) {
    rootEl.style.setProperty('--home-hero-opacity', heroOpacity.toFixed(4));
    heroRenderedOpacity = heroOpacity;
  }
  rootEl.classList.toggle('home-cover-visible', pageProgress > 0.015);
  rootEl.classList.toggle('home-cover-complete', pageProgress > 0.86);
  // Page becomes natively scrollable only once it has fully faded in.
  rootEl.classList.toggle('home-cover-scrollable', raw >= 1);
}

// ─── Animation Loop ───────────────────────────────────────────────────────────
const TARGET_MS = 1000 / 60;
let startMs     = null;
let lastMs      = null;
let frameAccum  = 0;
let textReady   = false;
let textVisible = false;
let uiPresented = false;
let orbitCopyRevealFrames = 0;

function loop(nowMs) {
  requestAnimationFrame(loop);

  if (!startMs) { startMs = nowMs; lastMs = nowMs; }
  const elapsed = nowMs - lastMs;
  lastMs = nowMs;

  const dt = limitRange(0.1, elapsed / TARGET_MS, 3);
  frameAccum += dt;

  const spring = 0.105;
  const damping = 0.68;
  scrollVelocity += (scrollTarget - scrollProgress) * spring * dt;
  scrollVelocity *= Math.pow(damping, dt);
  scrollProgress = limitRange(0, scrollProgress + scrollVelocity * dt, SCROLL_MAX);
  if ((scrollProgress === 0 && scrollVelocity < 0) || (scrollProgress === SCROLL_MAX && scrollVelocity > 0)) {
    scrollVelocity = 0;
  }
  const sceneProgress = limitRange(0, scrollProgress, 1);
  const zoomProgress = sceneProgress * sceneProgress * (3 - 2 * sceneProgress);
  activeOrbitSegment = scrollProgress < OUTER_RING_AT ? 0 : 1;
  syncHomeCover();

  // As the white page fades in over the hero, the whole sphere/logo cluster
  // shrinks toward the centre (instead of the page sliding up over a static sphere).
  const coverEase  = coverPhase * coverPhase * (3 - 2 * coverPhase);
  scene.scale.set(1 - coverEase * 0.5);

  // Smooth mouse
  const c = 14 / dt;
  smooth.x -= (smooth.x - mouse.x) / c;
  smooth.y -= (smooth.y - mouse.y) / c;

  // Scroll dollies the camera toward the sphere → it grows to fill the view
  // (morpho.org's "scroll = zoom in" effect). At full scroll the camera ends
  // up close enough that the sphere overflows the screen edges. baseY also
  // eases to 0 so the camera faces the sphere head-on and it stays centred.
  const baseZ = 4.35, nearZ = 1.2;
  const targetZ = baseZ - (baseZ - nearZ) * zoomProgress;
  const baseY   = 1.15 * (1 - zoomProgress);

  // Camera gently follows mouse, drifting around its base position.
  // Fade the follow out as we zoom in (scrollProgress → 1) so the enlarged
  // sphere stays put instead of swaying with the mouse (which feels dizzying).
  const cc     = 8 / dt;
  const follow = 0.7 * (1 - zoomProgress);
  camera.position.x -= (camera.position.x - (0     - smooth.x * follow)) / cc;
  camera.position.y -= (camera.position.y - (baseY + smooth.y * follow)) / cc;
  camera.position.z -= (camera.position.z - targetZ)                     / cc;

  // lookAt Y eases from 0.4 → 0 as scroll progresses, centering the sphere
  const lookY = 0.4 * Math.max(0, 1 - zoomProgress * 2.5);
  camera.lookAt(new Vec3(0, lookY, 0));

  // Update particle shader uniforms
  program.uniforms.time.value          = (nowMs - startMs) / 1000;
  program.uniforms.mousePosition.value = [2 * smooth.x, -2 * smooth.y];
  program.uniforms.hasMouseMoved.value = mouseMoved;
  // Scroll thins particles out (morpho's lessDotAlpha), matching the logo dissolve
  program.uniforms.lessDotAlpha.value  = limitRange(0, 1 - 1.15 * zoomProgress, 1);

  // Drive butterfly logo: intro dissolve via ever-growing counter, exit via opacity
  logoOpacity -= (logoOpacity - (1 - zoomProgress)) / (8 / dt);
  logoProgram.uniforms.opacity.value  = logoOpacity;
  logoProgram.uniforms.dissolve.value = frameAccum;
  logoProgram.uniforms.frame.value    = frameAccum;

  updateParticles(dt, frameAccum);
  updateBrands(dt, sceneProgress, activeOrbitSegment);

  // Trigger text entrance once sphere has fully formed (~100 frames ≈ 1.7s at 60fps)
  if (!textReady && frameAccum > 100) {
    textReady   = true;
    textVisible = true;
    rootEl.classList.add('anim');
  }
  if (!uiPresented && frameAccum > 155) {
    uiPresented = true;
    rootEl.classList.add('home-ui-presented');
  }

  // As the sphere expands, the entire homepage UI performs one staged exit.
  if (textVisible) syncHomeUiExit();
  if (orbitCopyEl) {
    if (sceneProgress > 0.62) {
      orbitCopyRevealFrames += dt;
    } else {
      orbitCopyRevealFrames = 0;
    }

    const copyReady = orbitCopyRevealFrames > 8;
    if (copyReady) {
      if (activeOrbitSegment !== renderedOrbitSegment) {
        showOrbitCopySegment(activeOrbitSegment);
      }
    } else if (sceneProgress < 0.82) {
      hideOrbitCopy();
    }

    // Exit the centre metric before the white page/content takes over.
    if (coverPhase > 0.001) {
      const exitProgress = smoothstep(0, 0.48, coverPhase);
      const s = 1 - exitProgress * 0.26;
      const y = -42 - exitProgress * 14;
      orbitCopyEl.style.opacity = Math.max(0, 1 - exitProgress).toFixed(3);
      orbitCopyEl.style.filter = `blur(${(exitProgress * 6).toFixed(2)}px)`;
      orbitCopyEl.style.transform = `translate(-50%, ${y.toFixed(2)}%) scale(${s.toFixed(3)})`;
    } else {
      orbitCopyEl.style.opacity = '';
      orbitCopyEl.style.filter = '';
      orbitCopyEl.style.transform = '';
    }
  }

  // All objects in one pass — OGL applies per-program blendFunc per object
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  renderer.render({ scene, camera });
}

requestAnimationFrame(loop);
