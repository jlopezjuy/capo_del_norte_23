/**
 * PhysicsEngine — 60 Hz Fixed-Timestep 3D Football Physics
 */
(function (global) {
  'use strict';

  const PITCH = {
    HALF_W: 35.0,
    HALF_L: 52.5,
    GOAL_HALF_W: 3.66,
    GOAL_HEIGHT: 2.44,
    GOAL_DEPTH: 2.0,
    POST_RADIUS: 0.08,
    BALL_RADIUS: 0.34,
    GRAVITY: -21.5
  };

  class PhysicsEngine {
    constructor(callbacks = {}) {
      this.onGoal = callbacks.onGoal || (() => {});
      this.onOut = callbacks.onOut || (() => {});
      this.onPostHit = callbacks.onPostHit || (() => {});
      this.onKick = callbacks.onKick || (() => {});
      this.postCooldown = 0;
    }

    /**
     * Advances ball physics by one fixed step (dt = 1/60)
     */
    stepBall(matchState, dt) {
      const b = matchState.ball;
      if (this.postCooldown > 0) this.postCooldown -= dt;

      // If a player is actively dribbling the ball, keep it smoothly at their feet
      if (matchState.ownerPlayerId !== null) {
        const owner = matchState.players.find((p) => p.id === matchState.ownerPlayerId);
        if (owner) {
          const dirX = Math.sin(owner.rotY);
          const dirZ = Math.cos(owner.rotY);
          const targetX = owner.x + dirX * 0.72;
          const targetZ = owner.z + dirZ * 0.72;
          b.x += (targetX - b.x) * Math.min(1, dt * 24);
          b.z += (targetZ - b.z) * Math.min(1, dt * 24);
          b.y = PITCH.BALL_RADIUS;
          b.vx = owner.vx;
          b.vy = 0;
          b.vz = owner.vz;
          return;
        } else {
          matchState.ownerPlayerId = null;
        }
      }

      // Free ball integration
      b.vy += PITCH.GRAVITY * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.z += b.vz * dt;

      // Air drag
      b.vx *= 1 - 0.14 * dt;
      b.vz *= 1 - 0.14 * dt;

      // Ground collision & grass friction
      if (b.y <= PITCH.BALL_RADIUS) {
        b.y = PITCH.BALL_RADIUS;
        if (b.vy < -1.8) {
          b.vy = -b.vy * 0.56;
        } else {
          b.vy = 0;
        }
        // Grass rolling friction
        const grassDrag = Math.pow(0.28, dt);
        b.vx *= grassDrag;
        b.vz *= grassDrag;
      }

      // Goalpost & Crossbar collisions (North z = -52.5, South z = +52.5)
      this._collideGoalposts(b);

      // Check Goal or Net physics
      const inGoalX = Math.abs(b.x) < PITCH.GOAL_HALF_W - 0.08;
      const underBar = b.y < PITCH.GOAL_HEIGHT - 0.04;

      if (matchState.phase === 'PLAYING') {
        // North goal (-Z): Gimnasia scores!
        if (b.z < -PITCH.HALF_L - PITCH.BALL_RADIUS * 0.5 && inGoalX && underBar) {
          this.onGoal('home');
          this._dampInNet(b, -1);
          return;
        }
        // South goal (+Z): Opponent scores!
        if (b.z > PITCH.HALF_L + PITCH.BALL_RADIUS * 0.5 && inGoalX && underBar) {
          this.onGoal('away');
          this._dampInNet(b, 1);
          return;
        }

        // Out of bounds: Sidelines (Throw-in)
        if (Math.abs(b.x) > PITCH.HALF_W + PITCH.BALL_RADIUS) {
          const sideX = b.x > 0 ? PITCH.HALF_W : -PITCH.HALF_W;
          const clampedZ = Math.max(-PITCH.HALF_L + 1, Math.min(PITCH.HALF_L - 1, b.z));
          this.onOut({ type: 'THROW_IN', x: sideX, z: clampedZ });
          return;
        }

        // Out of bounds: Endlines (Corner or Goal Kick)
        if (Math.abs(b.z) > PITCH.HALF_L + PITCH.BALL_RADIUS && (!inGoalX || !underBar)) {
          const endSide = b.z < 0 ? 'north' : 'south';
          this.onOut({ type: 'ENDLINE', endSide, x: b.x, z: b.z });
          return;
        }
      } else if (matchState.phase === 'GOAL_CELEBRATION' || matchState.phase === 'PENALTIES') {
        if (b.z < -PITCH.HALF_L && inGoalX) this._dampInNet(b, -1);
        if (b.z > PITCH.HALF_L && inGoalX) this._dampInNet(b, 1);
      }
    }

    _dampInNet(b, signZ) {
      const backZ = signZ * (PITCH.HALF_L + PITCH.GOAL_DEPTH - PITCH.BALL_RADIUS);
      if (signZ < 0 && b.z < backZ) {
        b.z = backZ;
        b.vz = Math.abs(b.vz) * 0.18;
        b.vx *= 0.4;
      } else if (signZ > 0 && b.z > backZ) {
        b.z = backZ;
        b.vz = -Math.abs(b.vz) * 0.18;
        b.vx *= 0.4;
      }
      if (Math.abs(b.x) > PITCH.GOAL_HALF_W - PITCH.BALL_RADIUS) {
        b.x = Math.sign(b.x) * (PITCH.GOAL_HALF_W - PITCH.BALL_RADIUS);
        b.vx *= -0.25;
      }
      if (b.y > PITCH.GOAL_HEIGHT - PITCH.BALL_RADIUS) {
        b.y = PITCH.GOAL_HEIGHT - PITCH.BALL_RADIUS;
        b.vy *= -0.25;
      }
    }

    _collideGoalposts(b) {
      const minDist = PITCH.BALL_RADIUS + PITCH.POST_RADIUS;
      const goalZs = [-PITCH.HALF_L, PITCH.HALF_L];
      const postXs = [-PITCH.GOAL_HALF_W, PITCH.GOAL_HALF_W];

      for (const gz of goalZs) {
        // Vertical posts
        if (b.y <= PITCH.GOAL_HEIGHT + PITCH.BALL_RADIUS) {
          for (const px of postXs) {
            const dx = b.x - px;
            const dz = b.z - gz;
            const dist = Math.hypot(dx, dz);
            if (dist < minDist && dist > 0.0001) {
              const nx = dx / dist;
              const nz = dz / dist;
              b.x = px + nx * minDist;
              b.z = gz + nz * minDist;
              const dot = b.vx * nx + b.vz * nz;
              if (dot < 0) {
                b.vx = (b.vx - 2 * dot * nx) * 0.72;
                b.vz = (b.vz - 2 * dot * nz) * 0.72;
                if (this.postCooldown <= 0) {
                  this.postCooldown = 0.25;
                  this.onPostHit();
                }
              }
            }
          }
        }
        // Horizontal crossbar
        if (Math.abs(b.x) <= PITCH.GOAL_HALF_W + PITCH.BALL_RADIUS) {
          const dy = b.y - PITCH.GOAL_HEIGHT;
          const dz = b.z - gz;
          const dist = Math.hypot(dy, dz);
          if (dist < minDist && dist > 0.0001) {
            const ny = dy / dist;
            const nz = dz / dist;
            b.y = PITCH.GOAL_HEIGHT + ny * minDist;
            b.z = gz + nz * minDist;
            const dot = b.vy * ny + b.vz * nz;
            if (dot < 0) {
              b.vy = (b.vy - 2 * dot * ny) * 0.72;
              b.vz = (b.vz - 2 * dot * nz) * 0.72;
              if (this.postCooldown <= 0) {
                this.postCooldown = 0.25;
                this.onPostHit();
              }
            }
          }
        }
      }
    }

    /**
     * Predicts where an airborne ball will land on the grass (y = BALL_RADIUS).
     */
    predictDropPoint(ball) {
      if (ball.y <= PITCH.BALL_RADIUS + 0.25 && Math.abs(ball.vy) < 1.0) {
        return { x: ball.x, z: ball.z, visible: false };
      }
      // Solve y(t) = y0 + vy*t + 0.5*g*t^2 = R
      const a = 0.5 * PITCH.GRAVITY;
      const b = ball.vy;
      const c = ball.y - PITCH.BALL_RADIUS;
      const disc = b * b - 4 * a * c;
      if (disc < 0) return { x: ball.x, z: ball.z, visible: false };
      const t = (-b - Math.sqrt(disc)) / (2 * a);
      if (t <= 0.04 || t > 4.0) return { x: ball.x, z: ball.z, visible: false };
      return {
        x: Math.max(-PITCH.HALF_W - 2, Math.min(PITCH.HALF_W + 2, ball.x + ball.vx * t * 0.92)),
        z: Math.max(-PITCH.HALF_L - 2, Math.min(PITCH.HALF_L + 2, ball.z + ball.vz * t * 0.92)),
        visible: true
      };
    }

    /**
     * Applies a kick impulse to the ball and clears ownership.
     */
    kickBall(matchState, player, vx, vy, vz, isShot = false) {
      matchState.ownerPlayerId = null;
      matchState.lastTouchTeam = player.team;
      matchState.lastTouchPlayerId = player.id;
      player.pickupCooldown = 0.26;

      matchState.ball.vx = vx;
      matchState.ball.vy = vy;
      matchState.ball.vz = vz;
      matchState.ball.y = Math.max(PITCH.BALL_RADIUS, matchState.ball.y);

      const speed = Math.hypot(vx, vy, vz);
      this.onKick(Math.min(1.0, speed / 26), isShot);
    }

    /**
     * Resolves player-to-player soft collision and keeps all players inside field apron.
     */
    resolvePlayerCollisions(players) {
      const minSep = 1.05;
      for (let i = 0; i < players.length; i++) {
        const a = players[i];
        // Clamp within outer grass apron (never trapped outside)
        a.x = Math.max(-PITCH.HALF_W - 3.2, Math.min(PITCH.HALF_W + 3.2, a.x));
        a.z = Math.max(-PITCH.HALF_L - 3.2, Math.min(PITCH.HALF_L + 3.2, a.z));

        for (let j = i + 1; j < players.length; j++) {
          const b = players[j];
          const dx = b.x - a.x;
          const dz = b.z - a.z;
          const dist = Math.hypot(dx, dz);
          if (dist < minSep && dist > 0.001) {
            const push = (minSep - dist) * 0.5;
            const nx = dx / dist;
            const nz = dz / dist;
            a.x -= nx * push;
            a.z -= nz * push;
            b.x += nx * push;
            b.z += nz * push;
          }
        }
      }
    }
  }

  global.PITCH_CONSTANTS = PITCH;
  global.PhysicsEngine = PhysicsEngine;
})(window);
