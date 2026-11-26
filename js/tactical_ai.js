/**
 * TacticalAI — 21-Player State Machine & Goalkeeper AI
 * States: IDLE, SUPPORT_ATTACK, MAKE_RUN, PRESS_BALL, MARK_ZONE, GOALKEEPER_TRACK, GOALKEEPER_DIVE
 */
(function (global) {
  'use strict';

  const DIFFICULTY_TUNING = {
    amateur: {
      aiSpeedScale: 0.78,
      passError: 0.14,
      shotError: 2.2,
      reactionSec: 0.48,
      pressCount: 1,
      gkDiveSpeed: 7.2
    },
    nacional: {
      aiSpeedScale: 0.92,
      passError: 0.06,
      shotError: 1.25,
      reactionSec: 0.25,
      pressCount: 2,
      gkDiveSpeed: 9.4
    },
    reducido: {
      aiSpeedScale: 1.02,
      passError: 0.025,
      shotError: 0.65,
      reactionSec: 0.12,
      pressCount: 2,
      gkDiveSpeed: 11.4
    }
  };

  class TacticalAI {
    constructor(physics) {
      this.physics = physics;
    }

    getTuning(difficulty) {
      return DIFFICULTY_TUNING[difficulty] || DIFFICULTY_TUNING.nacional;
    }

    /**
     * Finds the best teammate in the intended direction (or closest open teammate).
     */
    findPassTarget(passer, players, dirX, dirZ) {
      const hasDir = Math.hypot(dirX, dirZ) > 0.2;
      let best = null;
      let bestScore = -Infinity;

      for (const p of players) {
        if (p.team !== passer.team || p.id === passer.id) continue;
        const dx = p.x - passer.x;
        const dz = p.z - passer.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 2.0 || dist > 56) continue;

        let align = 0.4;
        if (hasDir) {
          align = (dx / dist) * dirX + (dz / dist) * dirZ;
          if (align < -0.15) continue;
        }
        const distPenalty = Math.abs(dist - 16) * 0.02;
        const score = align * 2.2 - distPenalty + (p.role === 'GK' ? -0.8 : 0);
        if (score > bestScore) {
          bestScore = score;
          best = p;
        }
      }
      return best;
    }

    /**
     * Executes a pass from `passer` to `target` (ground or lobbed).
     */
    executePass(matchState, passer, target, isLob = false) {
      const b = matchState.ball;
      let tx = target ? target.x + (target.vx || 0) * 0.28 : passer.x + Math.sin(passer.rotY) * 16;
      let tz = target ? target.z + (target.vz || 0) * 0.28 : passer.z + Math.cos(passer.rotY) * 16;

      if (passer.team === 'away') {
        const err = this.getTuning(matchState.difficulty).passError || 0;
        if (err > 0) {
          tx += (Math.random() - 0.5) * err * 14;
          tz += (Math.random() - 0.5) * err * 14;
        }
      }

      // Clamp target inside field
      tx = Math.max(-33, Math.min(33, tx));
      tz = Math.max(-50, Math.min(50, tz));

      const dx = tx - b.x;
      const dz = tz - b.z;
      const dist = Math.max(1.5, Math.hypot(dx, dz));
      const nx = dx / dist;
      const nz = dz / dist;

      passer.rotY = Math.atan2(nx, nz);

      if (isLob) {
        const speed = Math.min(25, Math.max(12, dist * 0.68));
        const vy = Math.min(11.5, Math.max(5.5, dist * 0.22));
        this.physics.kickBall(matchState, passer, nx * speed, vy, nz * speed, false);
      } else {
        const speed = Math.min(24, Math.max(11, dist * 0.85 + 5.5));
        this.physics.kickBall(matchState, passer, nx * speed, 0.4, nz * speed, false);
      }

      if (passer.team === 'home') matchState.stats.homePasses += 1;
      else matchState.stats.awayPasses += 1;
    }

    /**
     * Updates all AI-controlled players (10 Gimnasia teammates + 11 Away players).
     */
    update(matchState, dt, opponentMeta) {
      const tuning = this.getTuning(matchState.difficulty);
      const b = matchState.ball;
      const players = matchState.players;
      const activeHome = players[matchState.activeHomeIndex];
      const owner = matchState.ownerPlayerId !== null
        ? players.find((p) => p.id === matchState.ownerPlayerId)
        : null;

      // Determine closest non-GK presser per team
      const closestAway = this._findClosestFieldPlayer(players, 'away', b.x, b.z);
      const closestHomeSupport = this._findClosestFieldPlayer(players, 'home', b.x, b.z, activeHome ? activeHome.id : -1);
      const ballIsLoose = matchState.ownerPlayerId === null;

      const awayAggression = opponentMeta ? opponentMeta.aggression || 0.72 : 0.72;

      for (let i = 0; i < players.length; i++) {
        const p = players[i];
        if (p.team === 'home' && i === matchState.activeHomeIndex) {
          continue; // Controlled by human
        }

        if (p.pickupCooldown > 0) p.pickupCooldown -= dt;
        if (p.tackleCooldown > 0) p.tackleCooldown -= dt;
        if (p.stealCooldown > 0) p.stealCooldown -= dt;
        if (p.aiDecisionTimer > 0) p.aiDecisionTimer -= dt;

        // Handle active slide tackle slide
        if (p.tackleTimer > 0) {
          p.tackleTimer -= dt;
          p.x += p.vx * dt;
          p.z += p.vz * dt;
          continue;
        }

        if (p.role === 'GK') {
          this._updateGoalkeeper(matchState, p, dt, tuning);
          continue;
        }

        const isHome = p.team === 'home';
        const attackDirZ = isHome ? -1 : 1; // Home attacks -Z, Away attacks +Z
        const teamHasBall = !ballIsLoose && matchState.possessionTeam === p.team;

        // If THIS AI player currently owns the ball (Opponent AI)
        if (owner && owner.id === p.id) {
          this._updateBallCarrierAI(matchState, p, dt, tuning, attackDirZ, awayAggression);
          continue;
        }

        // State selection
        let targetX = p.baseX;
        let targetZ = p.baseZ;
        let sprint = false;

        if (teamHasBall) {
          // Attacking phase: shift formation toward ball & make runs
          const ballAdvance = b.z * 0.42;
          targetX = p.baseX + (b.x - p.baseX) * 0.22;
          targetZ = p.baseZ + ballAdvance * 0.45 + attackDirZ * 10;

          if (p.role === 'FW') {
            p.aiState = 'MAKE_RUN';
            targetZ += attackDirZ * 8;
            sprint = Math.abs(b.z - p.z) < 28;
            if (isHome && owner && owner.team === 'home' && Math.hypot(b.x - p.x, b.z - p.z) > 10 && Math.random() < 0.018) {
              p.callingPassTimer = 0.85;
            }
          } else {
            p.aiState = 'SUPPORT_ATTACK';
          }
        } else {
          // Defending or loose ball phase: closest player on EACH team contests the ball!
          const distToBall = Math.hypot(b.x - p.x, b.z - p.z);
          const isPrimaryPresser =
            (!isHome && closestAway && closestAway.id === p.id) ||
            (isHome && closestHomeSupport && closestHomeSupport.id === p.id && ballIsLoose && distToBall < 18);

          if (isPrimaryPresser) {
            p.aiState = 'PRESS_BALL';
            targetX = b.x;
            targetZ = b.z;
            sprint = true;
          } else {
            p.aiState = 'MARK_ZONE';
            // Compact defensive block shifted toward ball
            targetX = p.baseX * 0.78 + b.x * 0.28;
            targetZ = p.baseZ * 0.65 + b.z * 0.35 - attackDirZ * 6;
          }
        }

        targetX = Math.max(-33.5, Math.min(33.5, targetX));
        targetZ = Math.max(-50.5, Math.min(50.5, targetZ));

        this._movePlayerToward(p, targetX, targetZ, dt, sprint, tuning.aiSpeedScale);
      }
    }

    _updateBallCarrierAI(matchState, p, dt, tuning, attackDirZ, aggression) {
      const b = matchState.ball;
      const goalZ = attackDirZ * 52.5;
      const distToGoal = Math.hypot(0 - p.x, goalZ - p.z);

      // Shoot if in range and clear angle!
      if (distToGoal < 26 && p.aiDecisionTimer <= 0) {
        const aimX = (Math.random() - 0.5) * (3.2 + tuning.shotError);
        const dx = aimX - b.x;
        const dz = goalZ - b.z;
        const d = Math.hypot(dx, dz);
        const speed = 23 + Math.random() * 5;
        const vy = 2.6 + Math.random() * 2.8;
        this.physics.kickBall(matchState, p, (dx / d) * speed, vy, (dz / d) * speed, true);
        matchState.stats.awayShots += 1;
        if (Math.abs(aimX) < 3.66) matchState.stats.awayShotsOnTarget += 1;
        p.aiDecisionTimer = tuning.reactionSec * 2;
        return;
      }

      // Check pressure from nearby defenders -> pass!
      const nearestThreat = this._findNearestOpponent(matchState.players, p);
      if (nearestThreat && nearestThreat.dist < 5.5 && p.aiDecisionTimer <= 0) {
        const target = this.findPassTarget(p, matchState.players, 0, attackDirZ);
        if (target) {
          this.executePass(matchState, p, target, Math.random() < 0.18);
          p.aiDecisionTimer = tuning.reactionSec * 2.2;
          return;
        }
      }

      // Otherwise dribble toward goal with slight lateral weave
      const weaveX = Math.sin(p.id * 1.7 + matchState.elapsedRealSec * 1.4) * 5;
      const tx = Math.max(-24, Math.min(24, p.x * 0.65 + weaveX));
      this._movePlayerToward(p, tx, goalZ * 0.88, dt, aggression > 0.72, tuning.aiSpeedScale);
    }

    _updateGoalkeeper(matchState, gk, dt, tuning) {
      const b = matchState.ball;
      const isHome = gk.team === 'home';
      const goalLineZ = isHome ? 50.8 : -50.8;
      const towardFieldZ = isHome ? -1 : 1;

      // If GK owns the ball, clear / pass to a teammate after brief hold
      if (matchState.ownerPlayerId === gk.id) {
        gk.aiState = 'IDLE';
        if (gk.aiDecisionTimer <= 0) {
          const target = this.findPassTarget(gk, matchState.players, 0, towardFieldZ);
          this.executePass(matchState, gk, target, true);
          gk.aiDecisionTimer = 0.6;
        }
        return;
      }

      // Detect incoming shot toward this GK's goal
      const ballMovingToGoal = isHome ? b.vz > 7.5 : b.vz < -7.5;
      const distToGoal = Math.abs(b.z - goalLineZ);

      if (ballMovingToGoal && distToGoal < 26) {
        gk.aiState = 'GOALKEEPER_DIVE';
        // Predict X at goalLineZ
        const t = Math.max(0.05, Math.abs((goalLineZ - b.z) / b.vz));
        const predX = Math.max(-3.6, Math.min(3.6, b.x + b.vx * t));
        const dx = predX - gk.x;
        const step = Math.sign(dx) * Math.min(Math.abs(dx), tuning.gkDiveSpeed * dt);
        gk.x += step;
        gk.z += (goalLineZ - gk.z) * Math.min(1, dt * 6);
        gk.rotY = Math.atan2(b.x - gk.x, b.z - gk.z);
        return;
      }

      // Normal angle-narrowing tracking
      gk.aiState = 'GOALKEEPER_TRACK';
      const trackX = Math.max(-3.3, Math.min(3.3, b.x * 0.24));
      const trackZ = goalLineZ + (distToGoal < 18 ? towardFieldZ * 2.2 : 0);
      this._movePlayerToward(gk, trackX, trackZ, dt, false, tuning.aiSpeedScale * 0.9);
      gk.rotY = Math.atan2(b.x - gk.x, b.z - gk.z);
    }

    _movePlayerToward(p, tx, tz, dt, sprint, speedScale) {
      const dx = tx - p.x;
      const dz = tz - p.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.25) {
        p.vx *= 0.8;
        p.vz *= 0.8;
        return;
      }

      const canSprint = sprint && p.stamina > 0.15;
      const maxSpeed = p.speed * speedScale * (canSprint ? 1.24 : 0.92);
      if (canSprint) {
        p.stamina = Math.max(0, p.stamina - dt * 0.22);
      } else {
        p.stamina = Math.min(1, p.stamina + dt * 0.16);
      }

      const nx = dx / dist;
      const nz = dz / dist;
      p.vx = nx * maxSpeed;
      p.vz = nz * maxSpeed;
      p.x += p.vx * dt;
      p.z += p.vz * dt;
      p.rotY = Math.atan2(nx, nz);
    }

    _findClosestFieldPlayer(players, team, x, z, excludeId = -1) {
      let best = null;
      let bestDist = Infinity;
      for (const p of players) {
        if (p.team !== team || p.role === 'GK' || p.id === excludeId) continue;
        const d = Math.hypot(p.x - x, p.z - z);
        if (d < bestDist) {
          bestDist = d;
          best = p;
        }
      }
      return best;
    }

    _findNearestOpponent(players, self) {
      let best = null;
      let bestDist = Infinity;
      for (const p of players) {
        if (p.team === self.team) continue;
        const d = Math.hypot(p.x - self.x, p.z - self.z);
        if (d < bestDist) {
          bestDist = d;
          best = p;
        }
      }
      return best ? { player: best, dist: bestDist } : null;
    }
  }

  global.TacticalAI = TacticalAI;
})(window);
