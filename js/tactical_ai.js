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
     * Executes a pass from `passer` to `target` (ground, lobbed, or through-ball into space).
     */
    executePass(matchState, passer, target, isLob = false, isThrough = false) {
      const b = matchState.ball;
      const attackDirZ = passer.team === 'home' ? -1 : 1;
      const leadTime = isThrough ? 0.56 : 0.28;
      const spacePush = isThrough ? attackDirZ * 5.2 : 0;
      let tx = target ? target.x + (target.vx || 0) * leadTime : passer.x + Math.sin(passer.rotY) * (isThrough ? 21 : 16);
      let tz = target ? target.z + (target.vz || 0) * leadTime + spacePush : passer.z + Math.cos(passer.rotY) * (isThrough ? 21 : 16);

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
      passer.kickPower = isLob ? 0.65 : (isThrough ? 0.72 : 0.45);
      passer.kickAnimTimer = 0.26;

      if (isLob) {
        const speed = Math.min(25, Math.max(12, dist * 0.68));
        const vy = Math.min(11.5, Math.max(5.5, dist * 0.22));
        this.physics.kickBall(matchState, passer, nx * speed, vy, nz * speed, false);
      } else if (isThrough) {
        const speed = Math.min(26, Math.max(13, dist * 0.92 + 6.5));
        this.physics.kickBall(matchState, passer, nx * speed, 0.45, nz * speed, false);
      } else {
        const speed = Math.min(24, Math.max(11, dist * 0.85 + 5.5));
        this.physics.kickBall(matchState, passer, nx * speed, 0.35, nz * speed, false);
      }

      if (passer.team === 'home') matchState.stats.homePasses += 1;
      else matchState.stats.awayPasses += 1;
    }

    /**
     * Safe long goalkeeper clearance / punt:
     * Never rolls/chips a weak ball into pressers inside the box.
     * Picks an unmarked teammate >= 18m upfield, or punts high & wide past midfield.
     */
    executeGoalkeeperDistribution(matchState, gk) {
      const b = matchState.ball;
      const players = matchState.players;
      const isHome = gk.team === 'home';
      const towardFieldZ = isHome ? -1 : 1;
      const goalLineZ = isHome ? 52.5 : -52.5;

      // Score field teammates that are safely outside the box & open
      let bestTarget = null;
      let bestScore = -Infinity;

      for (const p of players) {
        if (p.team !== gk.team || p.role === 'GK') continue;
        const distFromGoal = Math.abs(p.z - goalLineZ);
        if (distFromGoal < 19) continue; // Never pass short inside/near our own penalty box

        const dx = p.x - gk.x;
        const dz = p.z - gk.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 18 || dist > 62) continue;

        // Check closest opponent to this teammate
        let minOppDist = 99;
        for (const opp of players) {
          if (opp.team === gk.team) continue;
          const dOpp = Math.hypot(opp.x - p.x, opp.z - p.z);
          if (dOpp < minOppDist) minOppDist = dOpp;
        }
        if (minOppDist < 4.8) continue; // Too tightly marked

        // Prefer wide flanks & mid-long targets with lots of open space
        const widthBonus = Math.abs(p.x) * 0.08;
        const spaceBonus = Math.min(14, minOppDist) * 0.45;
        const distBonus = -Math.abs(dist - 36) * 0.06;
        const score = spaceBonus + widthBonus + distBonus;
        if (score > bestScore) {
          bestScore = score;
          bestTarget = p;
        }
      }

      let tx;
      let tz;
      if (bestTarget) {
        tx = bestTarget.x + (bestTarget.vx || 0) * 0.35;
        tz = bestTarget.z + (bestTarget.vz || 0) * 0.35 + towardFieldZ * 2.5;
      } else {
        // Fallback: clear high & wide past midfield toward the less crowded flank
        let leftOpps = 0;
        let rightOpps = 0;
        for (const opp of players) {
          if (opp.team === gk.team) continue;
          if (opp.x < 0) leftOpps += 1;
          else rightOpps += 1;
        }
        const safeFlank = leftOpps <= rightOpps ? -1 : 1;
        tx = safeFlank * (16 + Math.random() * 10);
        tz = towardFieldZ * 6; // Clearly past halfway line
      }

      tx = Math.max(-31, Math.min(31, tx));
      tz = Math.max(-46, Math.min(46, tz));

      const dx = tx - b.x;
      const dz = tz - b.z;
      const dist = Math.max(20, Math.hypot(dx, dz));
      const nx = dx / dist;
      const nz = dz / dist;

      // Launch high from goalkeeper punt height so nearby strikers can NEVER block it point-blank
      b.y = 1.25;
      b.gkPuntGraceTimer = 0.28;
      gk.rotY = Math.atan2(nx, nz);
      gk.kickPower = 0.95;
      gk.kickAnimTimer = 0.34;
      gk.pickupCooldown = 0.55;

      const speed = Math.min(31, Math.max(23.5, dist * 0.62 + 6.5));
      const vy = Math.min(13.0, Math.max(9.8, dist * 0.24 + 2.0));
      this.physics.kickBall(matchState, gk, nx * speed, vy, nz * speed, false);

      if (gk.team === 'home') matchState.stats.homePasses += 1;
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

      // Determine closest non-GK pressers per team (honoring tuning.pressCount!)
      const ownerIsGK = !!(owner && owner.role === 'GK');
      const awayPressers = ownerIsGK && owner.team === 'home'
        ? []
        : this._findClosestFieldPlayers(players, 'away', b.x, b.z, tuning.pressCount || 1);
      const awayPresserIds = new Set(awayPressers.map((p) => p.id));
      const closestHomeSupport = ownerIsGK && owner.team === 'away'
        ? null
        : this._findClosestFieldPlayer(players, 'home', b.x, b.z, activeHome ? activeHome.id : -1);
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
        if (p.diveTimer > 0) p.diveTimer = Math.max(0, p.diveTimer - dt);
        if (p.headerTimer > 0) p.headerTimer = Math.max(0, p.headerTimer - dt);
        if (p.dribbleTimer > 0) p.dribbleTimer = Math.max(0, p.dribbleTimer - dt);

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
          if (ownerIsGK && owner.team === p.team) {
            // Spread wide and push upfield to give the GK clean long distribution targets!
            p.aiState = 'SUPPORT_ATTACK';
            targetX = p.baseX * 1.15;
            targetZ = p.baseZ + attackDirZ * 14;
            sprint = false;
          } else {
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
          }
        } else {
          // Defending or loose ball phase: closest pressers on EACH team contest the ball!
          // NEVER press or camp in front of an opposing GK holding the ball — retreat outside the box!
          const distToBall = Math.hypot(b.x - p.x, b.z - p.z);
          const isPrimaryPresser =
            !ownerIsGK && (
              (!isHome && awayPresserIds.has(p.id)) ||
              (isHome && closestHomeSupport && closestHomeSupport.id === p.id && ballIsLoose && distToBall < 18)
            );

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
            if (ownerIsGK && owner.team !== p.team) {
              // Respect the penalty area when opposing GK holds the ball (retreat >= 18m from their goal line)
              if (owner.team === 'home') {
                targetZ = Math.min(targetZ, 30.0);
              } else {
                targetZ = Math.max(targetZ, -30.0);
              }
            }
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

      // If GK owns the ball, hold safely (unstealable), face upfield, and punt long past pressers
      if (matchState.ownerPlayerId === gk.id) {
        gk.aiState = 'IDLE';
        gk.vx = 0;
        gk.vz = 0;
        gk.stealCooldown = Math.max(gk.stealCooldown || 0, 0.5);
        gk.rotY = isHome ? Math.PI : 0;
        if (gk.aiDecisionTimer <= 0) {
          this.executeGoalkeeperDistribution(matchState, gk);
          gk.aiDecisionTimer = 0.65;
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
        const speedBoost = gk.diveTimer > 0 ? 1.28 : 1.0;
        const step = Math.sign(dx) * Math.min(Math.abs(dx), tuning.gkDiveSpeed * speedBoost * dt);
        gk.x += step;
        gk.z += (goalLineZ - gk.z) * Math.min(1, dt * 6);
        gk.rotY = Math.atan2(b.x - gk.x, b.z - gk.z);
        // Trigger visual open-play diving save animation when shot is close & angled!
        if (gk.diveTimer <= 0 && distToGoal < 16 && Math.abs(b.vz) > 12.5 && Math.abs(dx) > 0.55) {
          gk.diveTimer = 0.56;
          gk.diveDir = dx < 0 ? (isHome ? 1 : -1) : (isHome ? -1 : 1);
        }
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

    _findClosestFieldPlayers(players, team, x, z, count = 1, excludeId = -1) {
      const list = [];
      for (const p of players) {
        if (p.team !== team || p.role === 'GK' || p.id === excludeId) continue;
        list.push({ p, d: Math.hypot(p.x - x, p.z - z) });
      }
      list.sort((a, b) => a.d - b.d);
      return list.slice(0, Math.max(1, count)).map((item) => item.p);
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
