/**
 * MatchState — Serializable Match State (Online-Ready for WebSocket / WebRTC)
 */
(function (global) {
  'use strict';

  class MatchState {
    constructor() {
      this.reset();
    }

    reset(config = {}) {
      this.phase = config.phase || 'LOBBY'; // LOBBY, KICKOFF, PLAYING, GOAL_CELEBRATION, SET_PIECE, HALFTIME, PAUSED, FULLTIME, PENALTIES
      this.half = 1;
      this.halfDurationRealSec = config.halfDurationRealSec || 180; // 2, 3, or 5 mins
      this.elapsedRealSec = 0;
      this.difficulty = config.difficulty || 'nacional'; // amateur, nacional, reducido
      this.matchId = config.matchId || null;

      this.scoreHome = 0;
      this.scoreAway = 0;
      this.lastGoalTeam = null;
      this.lastScorerName = '';
      this.celebrationTimer = 0;
      this.kickoffTeam = 'home';
      this.kickoffTimer = 0;

      this.possessionTeam = null;
      this.ownerPlayerId = null;
      this.lastTouchTeam = 'home';
      this.lastTouchPlayerId = null;

      this.activeHomeIndex = 9; // T. Cardozo (#9) default

      this.setPiece = null; // { type: 'THROW_IN' | 'CORNER' | 'GOAL_KICK', team, x, z, timer }

      this.stats = {
        homePossessionTicks: 1,
        awayPossessionTicks: 1,
        homeShots: 0,
        awayShots: 0,
        homeShotsOnTarget: 0,
        awayShotsOnTarget: 0,
        homePasses: 0,
        homePassesCompleted: 0,
        awayPasses: 0,
        awayPassesCompleted: 0
      };

      this.penalties = {
        active: false,
        round: 1,
        turn: 'home', // 'home' | 'away'
        homeScore: 0,
        awayScore: 0,
        homeHistory: [], // 'G' | 'M'
        awayHistory: [],
        phase: 'AIMING', // AIMING | FLIGHT | RESULT
        timer: 0,
        aimX: 0,
        power: 0.7
      };

      this.ball = { x: 0, y: 0.34, z: 0, vx: 0, vy: 0, vz: 0 };
      this.players = [];
    }

    getDisplayClock() {
      const progress = Math.min(1, this.elapsedRealSec / Math.max(1, this.halfDurationRealSec));
      const baseMin = this.half === 1 ? 0 : 45;
      const totalGameSecs = Math.floor(progress * 45 * 60);
      const mins = baseMin + Math.floor(totalGameSecs / 60);
      const secs = totalGameSecs % 60;
      return {
        mins,
        secs,
        text: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
        halfLabel: this.half === 1 ? '1°T' : '2°T'
      };
    }

    getPossessionPercent() {
      const total = this.stats.homePossessionTicks + this.stats.awayPossessionTicks;
      const homePct = Math.round((this.stats.homePossessionTicks / total) * 100);
      return { home: homePct, away: 100 - homePct };
    }

    /**
     * Produces a lightweight JSON-serializable snapshot for multiplayer sync / replays.
     */
    toJSON() {
      return {
        phase: this.phase,
        half: this.half,
        elapsedRealSec: Number(this.elapsedRealSec.toFixed(2)),
        scoreHome: this.scoreHome,
        scoreAway: this.scoreAway,
        possessionTeam: this.possessionTeam,
        ownerPlayerId: this.ownerPlayerId,
        activeHomeIndex: this.activeHomeIndex,
        ball: {
          x: Number(this.ball.x.toFixed(3)),
          y: Number(this.ball.y.toFixed(3)),
          z: Number(this.ball.z.toFixed(3)),
          vx: Number(this.ball.vx.toFixed(3)),
          vy: Number(this.ball.vy.toFixed(3)),
          vz: Number(this.ball.vz.toFixed(3))
        },
        players: this.players.map((p) => ({
          id: p.id,
          team: p.team,
          x: Number(p.x.toFixed(2)),
          z: Number(p.z.toFixed(2)),
          rotY: Number(p.rotY.toFixed(2)),
          stamina: Number(p.stamina.toFixed(2))
        })),
        stats: { ...this.stats }
      };
    }

    /**
     * Applies an authoritative snapshot received from a WebSocket/WebRTC host.
     */
    applySnapshot(snap) {
      if (!snap) return;
      this.phase = snap.phase;
      this.half = snap.half;
      this.elapsedRealSec = snap.elapsedRealSec;
      this.scoreHome = snap.scoreHome;
      this.scoreAway = snap.scoreAway;
      this.possessionTeam = snap.possessionTeam;
      this.ownerPlayerId = snap.ownerPlayerId;
      this.activeHomeIndex = snap.activeHomeIndex;
      if (snap.ball) Object.assign(this.ball, snap.ball);
      if (snap.stats) Object.assign(this.stats, snap.stats);
    }
  }

  global.MatchState = MatchState;
})(window);
