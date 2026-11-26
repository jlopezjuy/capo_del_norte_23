/**
 * CrowdSystem — GPU-Instanced Animated Crowd Shader (onBeforeCompile) + Quality Density Scaling
 */
(function (global) {
  'use strict';

  class CrowdSystem {
    constructor() {
      this.meshes = [];
      this.uniforms = {
        uTime: { value: 0 },
        uExcitement: { value: 0.1 },
        uWaveActive: { value: 0.0 },
        uGoalBurst: { value: 0.0 }
      };
      this.quality = 'high';
    }

    registerInstancedCrowd(mesh) {
      if (!mesh || !mesh.isInstancedMesh) return;
      const maxCount = mesh.count;
      const phases = new Float32Array(maxCount);
      for (let i = 0; i < maxCount; i++) {
        phases[i] = Math.random() * Math.PI * 2;
      }
      mesh.geometry.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));

      // Clone material safely so shader patch applies cleanly
      const mat = mesh.material.clone();
      const uniforms = this.uniforms;
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = uniforms.uTime;
        shader.uniforms.uExcitement = uniforms.uExcitement;
        shader.uniforms.uWaveActive = uniforms.uWaveActive;
        shader.uniforms.uGoalBurst = uniforms.uGoalBurst;

        shader.vertexShader =
          `
          attribute float aPhase;
          uniform float uTime;
          uniform float uExcitement;
          uniform float uWaveActive;
          uniform float uGoalBurst;
          ` + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          float instAngle = atan(instanceMatrix[3][2], instanceMatrix[3][0]);
          float jumpFreq = mix(3.4, 9.5, max(uExcitement, uGoalBurst));
          float hop = abs(sin(uTime * jumpFreq + aPhase * 3.0)) * (0.04 + uExcitement * 0.22 + uGoalBurst * 0.42);
          float wave = uWaveActive * max(0.0, sin(instAngle * 2.0 - uTime * 5.2)) * 0.55;
          transformed.y += hop + wave;
          `
        );
      };
      mesh.material = mat;
      this.meshes.push({ mesh, maxCount });
      this.applyQuality(this.quality);
    }

    applyQuality(profile) {
      this.quality = profile;
      const ratio = profile === 'low' ? 0.35 : profile === 'medium' ? 0.70 : 1.0;
      this.meshes.forEach(({ mesh, maxCount }) => {
        mesh.count = Math.max(1, Math.floor(maxCount * ratio));
      });
    }

    update(elapsed, excitement, isGoal, waveActive = false) {
      this.uniforms.uTime.value = elapsed;
      this.uniforms.uExcitement.value += (excitement - this.uniforms.uExcitement.value) * 0.1;
      this.uniforms.uGoalBurst.value += ((isGoal ? 1.0 : 0.0) - this.uniforms.uGoalBurst.value) * 0.15;
      this.uniforms.uWaveActive.value += ((waveActive ? 1.0 : 0.0) - this.uniforms.uWaveActive.value) * 0.12;
    }
  }

  global.CrowdSystem = CrowdSystem;
})(window);
