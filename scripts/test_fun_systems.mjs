import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function createStubThree() {
  class Vec3 { constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; } set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } setScalar(s) { this.x = s; this.y = s; this.z = s; return this; } copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; } clone() { return new Vec3(this.x, this.y, this.z); } }
  class Obj {
    constructor() {
      this.position = new Vec3();
      this.rotation = new Vec3();
      this.scale = new Vec3(1, 1, 1);
      this.matrix = {};
      this.children = [];
      this.visible = true;
      this.userData = {};
      this.material = { color: { setHex() {} }, opacity: 1, dispose() {} };
      this.geometry = { dispose() {} };
    }
    add(...items) { this.children.push(...items); }
    lookAt() {}
    updateMatrix() {}
    setMatrixAt() {}
    setColorAt() {}
  }
  Obj.prototype.instanceMatrix = { needsUpdate: false };
  Obj.prototype.instanceColor = { needsUpdate: false };
  return {
    Group: Obj,
    Mesh: Obj,
    InstancedMesh: Obj,
    Object3D: Obj,
    Color: class { constructor() {} setHex() {} },
    Matrix4: class { compose() {} makeRotationFromEuler() {} },
    Quaternion: class { setFromEuler() {} },
    Euler: class {},
    Vector3: Vec3,
    RingGeometry: class { rotateX() {} rotateY() {} rotateZ() {} dispose() {} },
    CircleGeometry: class { rotateX() {} rotateY() {} rotateZ() {} dispose() {} },
    CylinderGeometry: class { rotateX() {} rotateY() {} rotateZ() {} dispose() {} },
    TorusGeometry: class { dispose() {} },
    ConeGeometry: class { dispose() {} },
    SphereGeometry: class { dispose() {} },
    IcosahedronGeometry: class { rotateX() {} rotateY() {} rotateZ() {} dispose() {} },
    OctahedronGeometry: class { rotateX() {} rotateY() {} rotateZ() {} dispose() {} },
    PlaneGeometry: class { rotateX() {} rotateY() {} rotateZ() {} dispose() {} },
    BoxGeometry: class { rotateX() {} rotateY() {} rotateZ() {} dispose() {} },
    BufferGeometry: class { setAttribute() {} dispose() {} },
    BufferAttribute: class {},
    MeshBasicMaterial: class { dispose() {} },
    MeshLambertMaterial: class { dispose() {} },
    MeshPhongMaterial: class { dispose() {} },
    PointsMaterial: class { dispose() {} },
    Points: Obj,
    DoubleSide: 2,
    AdditiveBlending: 2
  };
}

const storage = new Map();
const ctx = {
  window: {},
  console,
  Math,
  Set,
  Map,
  Array,
  Object,
  Number,
  JSON,
  performance: { now: () => 0 },
  THREE: createStubThree(),
  localStorage: {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v))
  }
};
ctx.window = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);

for (const file of [
  'js/brand_registry.js',
  'js/mascot_controller.js',
  'js/arcade_challenge.js',
  'js/goal_celebration_director.js'
]) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx);
}

// 1. MascotEventDirector deterministic safety & preference tests
const director = new ctx.MascotEventDirector();
assert.ok(ctx.MascotEventDirector.EVENTS.length >= 10, 'Expected at least 10 Lobito events');

// Must NEVER allow break event or pitch entry during active PLAYING
assert.equal(director.canTriggerBreakEvent({ phase: 'PLAYING', elapsedRealSec: 200 }), false);
const playingEvt = director.triggerEvent('murguero', { phase: 'PLAYING', celebrationActive: false, challengeActive: false, force: true });
assert.ok(playingEvt === null || playingEvt.allowPitchEntry === false, 'MascotEventDirector must NEVER allow pitch entry during PLAYING');
director.cancel();

// Break event in HALFTIME must succeed and allow pitch entry
const halfEvt = director.triggerEvent('murguero', { phase: 'HALFTIME', celebrationActive: false, challengeActive: false });
assert.ok(halfEvt && halfEvt.allowPitchEntry === true, 'Break event in HALFTIME must allow pitch entry');

// Transitioning to PLAYING must immediately cancel an active pitch-entry event
director.update(0.016, { phase: 'PLAYING', elapsedRealSec: 10, celebrationActive: false, challengeActive: false });
assert.equal(director.active, null, 'Active pitch event must cancel immediately when PLAYING resumes');

// Frequency 'off' blocks all events
director.setFrequency('off');
assert.equal(director.canTriggerBreakEvent({ phase: 'HALFTIME', elapsedRealSec: 200 }), false);
director.setFrequency('occasional');

// 2. ArcadeChallengeManager deterministic scoring, combo, crossbar & medals tests
let audioHits = 0;
const fakeAudio = { playChallengeHit: () => { audioHits += 1; } };
const scene = new ctx.THREE.Group();
const challenge = new ctx.ArcadeChallengeManager(scene, fakeAudio);

const startState = challenge.start('targets');
assert.equal(startState.score, 0);
assert.equal(startState.combo, 1);

const hit1 = challenge.checkBallShot({ x: 2.65, y: 1.85, z: -52.3 }, -51.5);
assert.ok(hit1 && hit1.pointsAwarded === 300, 'Top corner target should award 300 pts at x1');
assert.equal(audioHits, 1);

const hit2 = challenge.checkBallShot({ x: -2.65, y: 0.58, z: -52.3 }, -51.5);
assert.ok(hit2 && hit2.pointsAwarded === 400, 'Bottom corner target at x2 combo should award 400 pts');
assert.ok(challenge.score >= 700, 'Score should unlock sniper_600 medal');

challenge.onMiss();
assert.equal(challenge.combo, 1, 'Miss must reset combo to 1');

challenge.start('crossbar');
const barHit = challenge.checkBallShot({ x: 0.5, y: 2.42, z: -52.3 }, -51.5);
assert.ok(barHit && barHit.pointsAwarded === 400, 'Crossbar hit should award 400 pts');

const medals = ctx.ArcadeChallengeManager.getMedals();
assert.equal(medals.find((m) => m.id === 'sniper_600').unlocked, true);
assert.equal(medals.find((m) => m.id === 'crossbar_king').unlocked, true);

// 3. GoalCelebrationDirector accessibility & anti-repeat tests
const celDir = new ctx.GoalCelebrationDirector(scene);
celDir.reduceMotion = true;
celDir.noFlash = true;
const cel = celDir.start({
  isHomeGoal: true,
  teamName: 'San Salvador Celeste',
  awayId: 'gnf',
  awayShort: 'GNF',
  awayHex: '#facc15',
  scorerName: 'T. Cardozo',
  scorerNumber: 9,
  minute: 88,
  isFirstGoal: true,
  isEqualizer: false,
  isComeback: false,
  isDecisive: true,
  isStoppageTime: false,
  scoreHome: 1,
  scoreAway: 0,
  shotDistance: 18
});
assert.ok(cel && cel.id);
const upd = celDir.update(0.016, 1.0, { x: 0, z: -40 }, { x: 0, y: 1.2, z: -52.5 });
assert.equal(upd.flashAlpha, 0, 'noFlash must suppress flashAlpha');
assert.equal(upd.timeScale, 1, 'reduceMotion must suppress slowMo');
assert.ok(Math.abs(upd.shakeOffset.x) === 0, 'reduceMotion must suppress shake');

console.log('FUN_SYSTEMS_TEST_PASS: MascotEventDirector, ArcadeChallengeManager, Medals & GoalCelebrationDirector verified.');
