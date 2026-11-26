/**
 * CrowdSystem — Hinchada Viva GPU-Instanced (onBeforeCompile) + Mascota del Lobo + Calidad Adaptativa
 */
(function (global) {
  'use strict';

  class CrowdSystem {
    constructor() {
      this.meshes = [];
      this.mascot = null;
      this.uniforms = {
        uTime: { value: 0 },
        uExcitement: { value: 0.12 },
        uWaveActive: { value: 0.0 },
        uGoalBurst: { value: 0.0 },
        uFrustration: { value: 0.0 }
      };
      this.quality = 'high';
    }

    registerInstancedCrowd(mesh) {
      if (!mesh || !mesh.isInstancedMesh) return;
      const maxCount = mesh.count;
      const phases = new Float32Array(maxCount);
      const groups = new Float32Array(maxCount);
      for (let i = 0; i < maxCount; i++) {
        phases[i] = Math.random() * Math.PI * 2;
        groups[i] = i % 4;
      }
      mesh.geometry.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));
      mesh.geometry.setAttribute('aGroup', new THREE.InstancedBufferAttribute(groups, 1));
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();

      const mat = mesh.material.clone();
      const uniforms = this.uniforms;
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = uniforms.uTime;
        shader.uniforms.uExcitement = uniforms.uExcitement;
        shader.uniforms.uWaveActive = uniforms.uWaveActive;
        shader.uniforms.uGoalBurst = uniforms.uGoalBurst;
        shader.uniforms.uFrustration = uniforms.uFrustration;

        shader.vertexShader =
          `
          attribute float aPhase;
          attribute float aGroup;
          uniform float uTime;
          uniform float uExcitement;
          uniform float uWaveActive;
          uniform float uGoalBurst;
          uniform float uFrustration;
          ` + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          float instAngle = atan(instanceMatrix[3][2], instanceMatrix[3][0]);
          float groupSpeed = 1.0 + aGroup * 0.22;
          float jumpFreq = mix(3.2, 9.6, max(uExcitement, uGoalBurst)) * groupSpeed;
          float standUp = smoothstep(0.35, 0.85, uExcitement) * 0.16;
          float hop = abs(sin(uTime * jumpFreq + aPhase * 3.1)) * (0.03 + uExcitement * 0.20 + uGoalBurst * 0.44);
          float sway = sin(uTime * 2.8 + aPhase * 2.0) * (0.025 + uFrustration * 0.08) * step(0.45, position.y);
          float frustDip = -uFrustration * 0.14 * step(0.55, position.y);
          float wave = uWaveActive * max(0.0, sin(instAngle * 2.0 - uTime * 5.2)) * 0.58;
          transformed.x += sway;
          transformed.y += standUp + hop + wave + frustDip;
          `
        );
      };
      mesh.material = mat;
      this.meshes.push({ mesh, maxCount });
      this.applyQuality(this.quality);
    }

    setMascot(mascotGroup) {
      this.mascot = mascotGroup;
    }

    applyQuality(profile) {
      this.quality = profile;
      const ratio = profile === 'low' ? 0.35 : profile === 'medium' ? 0.70 : 1.0;
      this.meshes.forEach(({ mesh, maxCount }) => {
        mesh.count = Math.max(1, Math.floor(maxCount * ratio));
      });
    }

    update(elapsed, excitement, isGoal, waveActive = false, frustration = 0) {
      this.uniforms.uTime.value = elapsed;
      this.uniforms.uExcitement.value += (excitement - this.uniforms.uExcitement.value) * 0.1;
      this.uniforms.uGoalBurst.value += ((isGoal ? 1.0 : 0.0) - this.uniforms.uGoalBurst.value) * 0.16;
      this.uniforms.uWaveActive.value += ((waveActive ? 1.0 : 0.0) - this.uniforms.uWaveActive.value) * 0.12;
      this.uniforms.uFrustration.value += (frustration - this.uniforms.uFrustration.value) * 0.12;

      if (this.mascot) {
        const parts = this.mascot.userData;
        const jumpAmp = isGoal ? 0.65 : 0.08 + excitement * 0.22;
        const freq = isGoal ? 10.0 : 4.2 + excitement * 3.0;
        this.mascot.position.y = Math.abs(Math.sin(elapsed * freq)) * jumpAmp;
        if (parts.armL && parts.armR) {
          parts.armL.rotation.z = 0.6 + Math.sin(elapsed * freq) * (isGoal ? 0.9 : 0.35);
          parts.armR.rotation.z = -0.6 - Math.sin(elapsed * freq) * (isGoal ? 0.9 : 0.35);
        }
        if (parts.tail) {
          parts.tail.rotation.y = Math.sin(elapsed * 9.0) * 0.55;
        }
      }
    }
  }

  global.CrowdSystem = CrowdSystem;
})(window);
