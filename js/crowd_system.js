/**
 * CrowdSystem — Living GPU-Instanced Stadium Crowd (onBeforeCompile)
 * Articulated arms & scarves (aPart), sit/stand/jump/wave/frustration choreography,
 * proportional away-sector preservation across quality tiers & sculpted 3D Wolf Mascot animation.
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
        uGoalTeam: { value: 0.0 },
        uFrustration: { value: 0.0 }
      };
      this.quality = 'high';
      this.awayFlags = [];
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
      if (!mesh.geometry.getAttribute('aTeam')) {
        const teams = new Float32Array(maxCount);
        mesh.geometry.setAttribute('aTeam', new THREE.InstancedBufferAttribute(teams, 1));
      }
      if (!mesh.geometry.getAttribute('aPart')) {
        const vertCount = mesh.geometry.attributes.position ? mesh.geometry.attributes.position.count : 0;
        mesh.geometry.setAttribute('aPart', new THREE.BufferAttribute(new Float32Array(vertCount), 1));
      }
      mesh.geometry.computeBoundingSphere();
      mesh.frustumCulled = false;

      const mat = mesh.material.clone();
      const uniforms = this.uniforms;
      mat.customProgramCacheKey = () => 'crowd_living_gpu_v2';
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = uniforms.uTime;
        shader.uniforms.uExcitement = uniforms.uExcitement;
        shader.uniforms.uWaveActive = uniforms.uWaveActive;
        shader.uniforms.uGoalBurst = uniforms.uGoalBurst;
        shader.uniforms.uGoalTeam = uniforms.uGoalTeam;
        shader.uniforms.uFrustration = uniforms.uFrustration;

        shader.vertexShader =
          `
          attribute float aPhase;
          attribute float aGroup;
          attribute float aTeam;
          attribute float aPart;
          uniform float uTime;
          uniform float uExcitement;
          uniform float uWaveActive;
          uniform float uGoalBurst;
          uniform float uGoalTeam;
          uniform float uFrustration;
          varying float vCrowdPart;
          varying float vCrowdPhase;
          varying float vCrowdLocalY;
          varying float vCrowdLocalX;
          varying float vCrowdTeam;
          ` + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          vCrowdPart = aPart;
          vCrowdPhase = aPhase;
          vCrowdLocalY = position.y;
          vCrowdLocalX = position.x;
          vCrowdTeam = aTeam;

          float instAngle = atan(instanceMatrix[3][2], instanceMatrix[3][0]);
          float groupSpeed = 1.0 + aGroup * 0.22;
          float isHomeFan = 1.0 - step(0.5, aTeam);
          float fanCelebrating = 0.0;
          float fanFrustrated = uFrustration * isHomeFan;
          if (uGoalTeam > 0.25) {
            fanCelebrating = isHomeFan * uGoalBurst;
            fanFrustrated = max(fanFrustrated, (1.0 - isHomeFan) * uGoalBurst);
          } else if (uGoalTeam < -0.25) {
            fanCelebrating = (1.0 - isHomeFan) * uGoalBurst;
            fanFrustrated = max(fanFrustrated, isHomeFan * uGoalBurst);
          }

          // True circumferential stadium Mexican Wave ("La Ola Celeste")
          float waveCrest = pow(max(0.0, sin(instAngle - uTime * 3.8)), 3.0) * uWaveActive * isHomeFan;

          float activeExcite = mix(uExcitement, uExcitement * 0.22, step(0.1, fanFrustrated));
          float exciteDrive = max(activeExcite, max(fanCelebrating, waveCrest));
          float jumpFreq = mix(3.2, 10.2, max(activeExcite, fanCelebrating)) * groupSpeed;

          // Seated idle -> visibly stand up as excitement rises
          float standUp = mix(-0.05, 0.22, smoothstep(0.24, 0.78, exciteDrive));
          float hop = abs(sin(uTime * jumpFreq + aPhase * 3.1)) * (0.025 + activeExcite * 0.16 + fanCelebrating * 0.46);
          float waveJump = waveCrest * 0.56;
          float sway = sin(uTime * 2.6 + aPhase * 2.0) * (0.022 + fanFrustrated * 0.065) * step(0.40, position.y);
          float frustDip = -fanFrustrated * 0.16 * step(0.45, position.y);

          // Articulated Left Arm (aPart == 2.0) & Right Arm (aPart == 3.0)
          if (aPart > 1.5 && aPart < 3.5) {
            float isLeftArm = step(aPart, 2.5);
            float sideSign = mix(1.0, -1.0, isLeftArm);
            vec3 shoulder = vec3(sideSign * 0.28, 0.63, 0.0);
            vec3 rel = transformed - shoulder;

            float idleRaise = 0.08 + 0.06 * sin(uTime * 2.4 + aPhase * 2.0 + sideSign);
            float exciteRaise = smoothstep(0.32, 0.85, activeExcite) * (1.25 + 0.42 * sin(uTime * 7.6 * groupSpeed + aPhase * 3.2));
            float goalRaise = fanCelebrating * (2.48 + 0.42 * sin(uTime * 11.5 * groupSpeed + aPhase * 4.2 + sideSign * 0.4));
            float waveRaise = waveCrest * 2.85;
            float cheerRaise = max(idleRaise, max(exciteRaise, max(goalRaise, waveRaise)));

            // Frustrated fans clutch their heads
            float frustRaise = 2.28 + 0.08 * sin(uTime * 4.0 + aPhase);
            float armRaise = mix(cheerRaise, frustRaise, clamp(fanFrustrated, 0.0, 1.0));

            float theta = sideSign * armRaise;
            float cs = cos(theta);
            float sn = sin(theta);
            float rx = rel.x * cs - rel.y * sn;
            float ry = rel.x * sn + rel.y * cs;
            rx *= mix(1.0, 0.44, clamp(fanFrustrated, 0.0, 1.0));
            transformed = shoulder + vec3(rx, ry, rel.z);
          }

          // Overhead Scarf Strip (aPart == 4.0)
          if (aPart > 3.5) {
            float hasScarf = step(0.32, fract(aPhase * 7.31));
            float scarfDrive = hasScarf * clamp(
              max(fanCelebrating, max(waveCrest * 1.15, smoothstep(0.42, 0.85, activeExcite))) * (1.0 - fanFrustrated),
              0.0,
              1.0
            );
            if (scarfDrive < 0.04) {
              transformed = vec3(0.0, 0.58, 0.0);
            } else {
              transformed.x *= mix(0.35, 1.05, scarfDrive);
              transformed.y = mix(0.76, transformed.y, scarfDrive)
                + sin(position.x * 7.0 + uTime * 10.5 + aPhase * 5.0) * 0.055 * scarfDrive
                + sin(uTime * 11.5 * groupSpeed + aPhase * 4.2) * 0.045 * fanCelebrating;
              transformed.z += cos(position.x * 6.0 + uTime * 8.5 + aPhase * 3.0) * 0.065 * scarfDrive;
            }
          }

          transformed.x += sway;
          transformed.y += standUp + hop + waveJump + frustDip;
          `
        );

        shader.fragmentShader =
          `
          varying float vCrowdPart;
          varying float vCrowdPhase;
          varying float vCrowdLocalY;
          varying float vCrowdLocalX;
          varying float vCrowdTeam;
          ` + shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <color_fragment>',
          `
          #include <color_fragment>
          vec3 skinTone = mix(vec3(0.84, 0.63, 0.49), vec3(0.58, 0.39, 0.28), fract(vCrowdPhase * 3.17));
          vec3 hairTone = mix(vec3(0.10, 0.08, 0.07), vec3(0.26, 0.18, 0.12), fract(vCrowdPhase * 5.23));
          if (vCrowdPart < 0.5) {
            if (vCrowdLocalY < 0.22) {
              diffuseColor.rgb = mix(diffuseColor.rgb * 0.32, vec3(0.10, 0.13, 0.18), 0.72);
            }
          } else if (vCrowdPart < 1.5) {
            diffuseColor.rgb = vCrowdLocalY > 0.88 ? hairTone : skinTone;
          } else if (vCrowdPart < 3.5) {
            if (vCrowdLocalY < 0.46) {
              diffuseColor.rgb = skinTone;
            }
          } else {
            float stripe = step(0.5, fract(vCrowdLocalX * 5.5 + 0.5));
            vec3 homeScarfA = vec3(0.05, 0.60, 0.92);
            vec3 scarfWhite = vec3(0.88, 0.92, 0.96);
            vec3 scarfA = vCrowdTeam > 0.5 ? diffuseColor.rgb : homeScarfA;
            diffuseColor.rgb = mix(scarfA, scarfWhite, stripe);
          }
          `
        );
      };

      mesh.material = mat;
      this.meshes.push({ mesh, maxCount });
      this.applyQuality(this.quality);
    }

    setAwayFlags(flags) {
      this.awayFlags = Array.isArray(flags) ? flags : [];
    }

    setAwayColors(primaryColor, secondaryColor = 0xffffff) {
      const c1 = new THREE.Color(primaryColor !== undefined ? primaryColor : 0xfacc15);
      const c2 = new THREE.Color(secondaryColor !== undefined ? secondaryColor : 0x0f172a);
      this.meshes.forEach(({ mesh }) => {
        const awayIndices = mesh.userData && mesh.userData.awayIndices;
        if (!awayIndices || !awayIndices.length) return;
        for (let k = 0; k < awayIndices.length; k++) {
          const idx = awayIndices[k];
          mesh.setColorAt(idx, (k % 3 === 0) ? c2 : c1);
        }
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      });
      this.awayFlags.forEach((f, idx) => {
        if (f && f.clothMat) {
          f.clothMat.color.copy(idx % 2 === 0 ? c1 : c2);
        }
      });
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

    update(elapsed, excitement, isGoal, waveActive = false, frustration = 0, goalTeam = 0) {
      this.uniforms.uTime.value = elapsed;
      this.uniforms.uExcitement.value += (excitement - this.uniforms.uExcitement.value) * 0.1;
      this.uniforms.uGoalBurst.value += ((isGoal ? 1.0 : 0.0) - this.uniforms.uGoalBurst.value) * 0.16;
      if (isGoal && goalTeam !== 0) {
        this.uniforms.uGoalTeam.value = goalTeam;
      } else if (!isGoal && this.uniforms.uGoalBurst.value < 0.05) {
        this.uniforms.uGoalTeam.value = 0.0;
      }
      this.uniforms.uWaveActive.value += ((waveActive ? 1.0 : 0.0) - this.uniforms.uWaveActive.value) * 0.12;
      this.uniforms.uFrustration.value += (frustration - this.uniforms.uFrustration.value) * 0.12;

      if (this.mascot) {
        const mascotCelebrate = isGoal && goalTeam >= 0;
        const mascotSad = (isGoal && goalTeam < 0) || frustration > 0.35;
        const parts = this.mascot.userData || {};

        const jumpAmp = mascotCelebrate ? 0.72 : (mascotSad ? 0.015 : 0.07 + excitement * 0.24);
        const freq = mascotCelebrate ? 10.5 : (mascotSad ? 2.2 : 4.2 + excitement * 3.2);
        this.mascot.position.y = Math.abs(Math.sin(elapsed * freq)) * jumpAmp;
        this.mascot.rotation.y = mascotCelebrate
          ? Math.sin(elapsed * 5.2) * 0.45
          : Math.sin(elapsed * 1.8) * 0.16;

        // Shoulder-pivoted arms: raise high & wave on cheer/goal, droop on frustration
        if (parts.armL && parts.armR) {
          if (mascotCelebrate) {
            parts.armL.rotation.z = -2.45 + Math.sin(elapsed * 12.0) * 0.48;
            parts.armR.rotation.z = 2.45 - Math.sin(elapsed * 12.0 + 0.5) * 0.48;
          } else if (mascotSad) {
            parts.armL.rotation.z = -0.25;
            parts.armR.rotation.z = 0.25;
          } else {
            const cheerAmt = 0.55 + excitement * 1.35;
            parts.armL.rotation.z = -cheerAmt + Math.sin(elapsed * freq) * 0.32;
            parts.armR.rotation.z = cheerAmt - Math.sin(elapsed * freq + 0.6) * 0.32;
          }
        }

        if (parts.head) {
          parts.head.rotation.y = mascotSad ? Math.sin(elapsed * 6.5) * 0.28 : Math.sin(elapsed * 2.5) * 0.14;
          parts.head.rotation.x = mascotSad ? 0.22 : (mascotCelebrate ? -0.14 + Math.sin(elapsed * 9.0) * 0.12 : Math.sin(elapsed * 3.2) * 0.06);
        }

        if (parts.tail) {
          parts.tail.rotation.y = Math.sin(elapsed * (mascotCelebrate ? 14.0 : 8.5)) * (mascotSad ? 0.12 : 0.58);
        }

        if (parts.scarfL && parts.scarfR) {
          const flutter = mascotCelebrate ? 0.36 : 0.14 + excitement * 0.16;
          parts.scarfL.rotation.x = 0.15 + Math.sin(elapsed * 7.5) * flutter;
          parts.scarfR.rotation.x = 0.12 + Math.cos(elapsed * 8.2) * flutter;
        }

        if (parts.earL && parts.earR) {
          const earBounce = Math.sin(elapsed * freq) * (mascotCelebrate ? 0.12 : 0.04);
          parts.earL.rotation.z = 0.22 + earBounce;
          parts.earR.rotation.z = -0.22 - earBounce;
        }
      }
    }
  }

  global.CrowdSystem = CrowdSystem;
})(window);
