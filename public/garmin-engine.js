"use strict";
var GarminEngine = (() => {
  var U = Object.defineProperty;
  var Se = Object.getOwnPropertyDescriptor;
  var ve = Object.getOwnPropertyNames;
  var Te = Object.prototype.hasOwnProperty;
  var Re = (e, t) => {
      for (var i in t) U(e, i, { get: t[i], enumerable: !0 });
    },
    Ke = (e, t, i, a) => {
      if ((t && typeof t == "object") || typeof t == "function")
        for (let n of ve(t))
          !Te.call(e, n) &&
            n !== i &&
            U(e, n, {
              get: () => t[n],
              enumerable: !(a = Se(t, n)) || a.enumerable,
            });
      return e;
    };
  var we = (e) => Ke(U({}, "__esModule", { value: !0 }), e);
  var Ce = {};
  Re(Ce, {
    CANVAS_SIZE: () => r,
    CIQ_PALETTE: () => l,
    DEVICE_PROFILES: () => c,
    FLASH_STORAGE_KEY: () => Y,
    GRAVITY: () => ee,
    GROUND_Y: () => g,
    GarminWatchEngine: () => z,
    JUMP_FORCE: () => te,
    PLAYER_HEIGHT: () => D,
    PLAYER_WIDTH: () => q,
    PLAYER_X: () => C,
    VARIABLE_RAM_COSTS: () => Q,
    allocateFlashVariable: () => re,
    allocateVariable: () => W,
    clearFlashStorage: () => Le,
    createInitialState: () => x,
    jettisonOldestVariable: () => ie,
    loadPersistedFlashStorage: () => Z,
    renderCanvasFrame: () => oe,
    savePersistedFlashStorage: () => H,
    startGame: () => ae,
    triggerGarbageCollection: () => le,
    updateGameSimulation: () => ne,
    wipeScreenFog: () => Fe,
  });
  var $ = (e, t, i) => Math.min(i, Math.max(t, e));
  var P = class {
    constructor(t) {
      this.cachedSnapshot = null;
      this.subscribers = new Set();
      this.eventListeners = new Map();
      this.state = t;
    }
    getSnapshot() {
      return (
        this.cachedSnapshot === null &&
          (this.cachedSnapshot = this.createSnapshot()),
        this.cachedSnapshot
      );
    }
    resize(t, i, a) {}
    destroy() {
      (this.subscribers.clear(), this.eventListeners.clear());
    }
    subscribe(t) {
      return (
        this.subscribers.add(t),
        () => {
          this.subscribers.delete(t);
        }
      );
    }
    invalidateSnapshot() {
      this.cachedSnapshot = null;
    }
    notifySubscribers() {
      this.cachedSnapshot = this.createSnapshot();
      for (let t of this.subscribers) t();
    }
    on(t, i) {
      let a = this.eventListeners.get(t);
      return (
        a || ((a = new Set()), this.eventListeners.set(t, a)),
        a.add(i),
        () => {
          (a?.delete(i), a && a.size === 0 && this.eventListeners.delete(t));
        }
      );
    }
    emit(t, i) {
      let a = this.eventListeners.get(t);
      if (a) for (let n of a) n(i);
    }
  };
  var c = {
      fenix: {
        id: "fenix",
        name: "F\u0113nix 5 (32KB)",
        ramLimitKb: 32,
        flashLimitKb: 64,
        description: "Hard: Brutal 32KB RAM ceiling & 64KB Flash limit",
        color: "#ef4444",
      },
      forerunner: {
        id: "forerunner",
        name: "Forerunner 245 (64KB)",
        ramLimitKb: 64,
        flashLimitKb: 256,
        description: "Medium: 64KB memory limit & 256KB Flash capacity",
        color: "#eab308",
      },
      edge: {
        id: "edge",
        name: "Edge 1030 (128KB)",
        ramLimitKb: 128,
        flashLimitKb: 512,
        description: "Casual: 128KB generous heap & 512KB Flash storage",
        color: "#22c55e",
      },
    },
    Q = { int: 0.2, float: 0.4, string: 0.8, array: 1.6 },
    l = {
      black: "#000000",
      white: "#FFFFFF",
      lightGray: "#AAAAAA",
      darkGray: "#555555",
      red: "#FF0000",
      darkRed: "#AA0000",
      orange: "#FF5500",
      yellow: "#FFAA00",
      green: "#00AA00",
      brightGreen: "#00FF00",
      blue: "#0000FF",
      darkBlue: "#0000AA",
      cyan: "#00AAAA",
      brightCyan: "#00FFFF",
      purple: "#AA00AA",
      magenta: "#FF00FF",
    },
    Y = "garmin_simulator_flash_storage";
  function Z() {
    if (typeof window > "u") return [];
    try {
      if (typeof window.localStorage?.getItem == "function") {
        let e = window.localStorage.getItem(Y);
        if (e) {
          let t = JSON.parse(e);
          if (Array.isArray(t)) return t;
        }
      }
    } catch {}
    return [];
  }
  function H(e) {
    if (!(typeof window > "u"))
      try {
        typeof window.localStorage?.setItem == "function" &&
          window.localStorage.setItem(Y, JSON.stringify(e));
      } catch {}
  }
  var r = 280,
    g = 205,
    C = 52,
    q = 20,
    D = 24,
    ee = 0.65,
    te = -10.5;
  function x(e = "fenix", t = 0, i) {
    let a = i || Z(),
      n =
        a.length > 0
          ? a
          : [{ id: 1, name: "sys_log.dat", sizeKb: 4, allocatedAt: 0 }],
      o = Number(n.reduce((d, b) => d + b.sizeKb, 0).toFixed(2));
    return {
      gameState: "idle",
      device: e,
      playerY: g - D,
      playerVy: 0,
      isGrounded: !0,
      score: 0,
      highScore: t,
      distanceMeters: 0,
      variables: [
        { id: 1, name: "appCtx", type: "int", sizeKb: 0.2, allocatedAt: 0 },
        {
          id: 2,
          name: "displayGfx",
          type: "array",
          sizeKb: 1.6,
          allocatedAt: 0,
        },
      ],
      allocatedRamKb: 1.8,
      flashVariables: n,
      flashFiles: n,
      allocatedFlashKb: o,
      obstacles: [],
      isLightOn: !1,
      battery: 100,
      lightActiveDurationMs: 0,
      fogLevel: 0,
      thermalStress: 0,
      fogWipes: [],
      isGcActive: !1,
      gcTimerMs: 0,
      heartRate: 135,
      crashReport: null,
      lastAllocTime: 0,
      lastObstacleTime: 0,
      consecutiveDodges: 0,
    };
  }
  function ae(e, t) {
    let i = t || e.device;
    return { ...x(i, e.highScore), gameState: "playing" };
  }
  function ie(e) {
    if (e.gameState !== "playing" || e.variables.length === 0)
      return { state: e };
    let [t, ...i] = e.variables,
      a = Math.max(0.2, e.allocatedRamKb - t.sizeKb);
    return {
      state: {
        ...e,
        variables: i,
        allocatedRamKb: Number(a.toFixed(2)),
        score: e.score + 5,
      },
      popped: t,
    };
  }
  function le(e) {
    if (e.gameState !== "playing" || e.isGcActive)
      return { state: e, freedKb: 0 };
    let t = Number((2 + Math.random() * 2).toFixed(2)),
      i = 0,
      a = [];
    for (let o = 0; o < e.variables.length; o++) {
      let d = e.variables[o];
      i < t && e.variables.length - a.length > 2 ? (i += d.sizeKb) : a.push(d);
    }
    let n = Math.max(0.4, Number((e.allocatedRamKb - i).toFixed(2)));
    return {
      state: {
        ...e,
        isGcActive: !0,
        gcTimerMs: 500,
        variables: a,
        allocatedRamKb: n,
        score: e.score + 10,
      },
      freedKb: i,
    };
  }
  function W(e, t, i) {
    let a = Q[t],
      n = Number((e.allocatedRamKb + a).toFixed(2)),
      o = c[e.device].ramLimitKb,
      d = {
        id: Date.now() + Math.random(),
        name: i || `${t}_${Math.floor(Math.random() * 900 + 100)}`,
        type: t,
        sizeKb: a,
        allocatedAt: Date.now(),
      };
    if (n > o) {
      let b = {
        errorType: "Out Of Memory",
        file: "MonkeyC_Alloc.mc",
        line: 12,
        stackTrace: [
          `Failed to allocate ${a}KB (${t})`,
          `Heap: ${n}KB / ${o}KB`,
          "at Rez.Fonts.drawGlyph() [Rez.mc:88]",
          "at Garmin_Schvitz_App.onUpdate() [App.mc:42]",
        ],
        heapUsedKb: n,
        heapLimitKb: o,
      };
      return {
        state: {
          ...e,
          allocatedRamKb: n,
          gameState: "crashed",
          crashReport: b,
        },
        crashed: !0,
      };
    }
    return {
      state: { ...e, variables: [...e.variables, d], allocatedRamKb: n },
      crashed: !1,
    };
  }
  function re(e, t = 4, i) {
    let a = Number((e.allocatedFlashKb + t).toFixed(2)),
      n = c[e.device].flashLimitKb,
      o = {
        id: Date.now() + Math.random(),
        name: i || `nv_data_${Math.floor(Math.random() * 900 + 100)}.bin`,
        sizeKb: t,
        allocatedAt: Date.now(),
      };
    if (a > n) {
      let b = {
        errorType: "Out Of Storage",
        file: "FlashNVStorage.mc",
        line: 28,
        stackTrace: [
          `Failed to allocate ${t}KB to NVRAM Flash`,
          `Out of Storage: ${a}KB / ${n}KB limit exceeded`,
          "at Application.Storage.setValue() [Storage.mc:104]",
          "at Garmin_Schvitz_App.saveState() [App.mc:95]",
        ],
        heapUsedKb: e.allocatedRamKb,
        heapLimitKb: c[e.device].ramLimitKb,
        flashUsedKb: a,
        flashLimitKb: n,
      };
      return {
        state: {
          ...e,
          allocatedFlashKb: a,
          gameState: "crashed",
          crashReport: b,
        },
        crashed: !0,
      };
    }
    let d = [...e.flashVariables, o];
    return (
      H(d),
      {
        state: { ...e, flashVariables: d, flashFiles: d, allocatedFlashKb: a },
        crashed: !1,
      }
    );
  }
  function Le(e) {
    return (
      H([]),
      { ...e, flashVariables: [], flashFiles: [], allocatedFlashKb: 0 }
    );
  }
  function Fe(e, t, i, a = 28) {
    let n = [...e.fogWipes.slice(-15), { x: t, y: i, radius: a }],
      o = Math.max(0, e.fogLevel - 0.22);
    return { ...e, fogWipes: n, fogLevel: o };
  }
  function ne(e, t) {
    if (e.gameState !== "playing" || e.battery <= 0) {
      if (e.gameState === "playing" && e.battery <= 0) {
        let f = Math.max(0, e.score - 50);
        return {
          ...e,
          battery: 0,
          isLightOn: !1,
          score: f,
          gameState: "shutdown",
          crashReport: {
            errorType: "Power Loss",
            file: "PowerManager.mc",
            line: 1,
            stackTrace: [
              "CRITICAL VOLTAGE BROWNOUT DETECTED",
              "Battery power dropped to 0.0%",
              "Engine updates & physics halted",
              "Power loss penalty applied: -50 PTS",
            ],
            heapUsedKb: e.allocatedRamKb,
            heapLimitKb: c[e.device].ramLimitKb,
            flashUsedKb: e.allocatedFlashKb,
            flashLimitKb: c[e.device].flashLimitKb,
          },
        };
      }
      return e;
    }
    let i = Number.isFinite(t) ? $(t, 0, 5e3) : 0;
    if (e.isGcActive) {
      let s = e.gcTimerMs - i,
        f = c[e.device].ramLimitKb,
        h = e.allocatedRamKb / f,
        p = (1e-4 + (e.isLightOn ? 3e-4 : 0)) * i,
        v = Math.max(0, e.battery - p),
        L = e.isLightOn;
      v <= 0 && (L = !1);
      let K = e.lightActiveDurationMs;
      e.isLightOn ? (K += i) : (K = Math.max(0, K - i * 0.5));
      let ge = e.isLightOn ? Math.min(1, K / 6e3) : 0,
        ue = h > 0.8 ? Math.min(1, 0.4 + (h - 0.8) * 3) : 0,
        I = Math.max(ge, ue, 1),
        T = e.thermalStress ?? 0;
      I > T
        ? (T = Math.min(I, T + 5e-4 * i))
        : (T = Math.max(I, T - (1 / 14900) * i));
      let F = e.fogLevel;
      if (
        (T > F
          ? (F = Math.min(T, F + 4e-4 * i))
          : (F = Math.max(T, F - (1 / 14900) * i)),
        v <= 0)
      ) {
        let ye = Math.max(0, e.score - 50);
        return {
          ...e,
          battery: 0,
          isLightOn: !1,
          score: ye,
          gameState: "shutdown",
          isGcActive: !1,
          gcTimerMs: 0,
          crashReport: {
            errorType: "Power Loss",
            file: "PowerManager.mc",
            line: 1,
            stackTrace: [
              "CRITICAL VOLTAGE BROWNOUT DETECTED",
              "Battery power dropped to 0.0%",
              "Engine updates & physics halted",
              "Power loss penalty applied: -50 PTS",
            ],
            heapUsedKb: e.allocatedRamKb,
            heapLimitKb: c[e.device].ramLimitKb,
            flashUsedKb: e.allocatedFlashKb,
            flashLimitKb: c[e.device].flashLimitKb,
          },
        };
      }
      return s <= 0
        ? {
            ...e,
            battery: Number(v.toFixed(2)),
            isLightOn: L,
            lightActiveDurationMs: K,
            thermalStress: Number(T.toFixed(3)),
            fogLevel: Number(F.toFixed(3)),
            isGcActive: !1,
            gcTimerMs: 0,
          }
        : {
            ...e,
            battery: Number(v.toFixed(2)),
            isLightOn: L,
            lightActiveDurationMs: K,
            thermalStress: Number(T.toFixed(3)),
            fogLevel: Number(F.toFixed(3)),
            gcTimerMs: s,
          };
    }
    let a = i / 16.666,
      n = e.battery,
      o = e.lightActiveDurationMs,
      A = (1e-4 + (e.isLightOn ? 3e-4 : 0)) * i;
    n = Math.max(0, n - A);
    let u = e.isLightOn;
    if ((n <= 0 && ((u = !1), (n = 0)), n <= 0)) {
      let f = Math.max(0, e.score - 50);
      return {
        ...e,
        battery: 0,
        isLightOn: !1,
        score: f,
        gameState: "shutdown",
        crashReport: {
          errorType: "Power Loss",
          file: "PowerManager.mc",
          line: 1,
          stackTrace: [
            "CRITICAL VOLTAGE BROWNOUT DETECTED",
            "Battery power dropped to 0.0%",
            "Engine updates & physics halted",
            "Power loss penalty applied: -50 PTS",
          ],
          heapUsedKb: e.allocatedRamKb,
          heapLimitKb: c[e.device].ramLimitKb,
          flashUsedKb: e.allocatedFlashKb,
          flashLimitKb: c[e.device].flashLimitKb,
        },
      };
    }
    e.isLightOn ? (o += i) : (o = Math.max(0, o - i * 0.5));
    let k = c[e.device].ramLimitKb,
      w = e.allocatedRamKb / k,
      V = e.isLightOn ? Math.min(1, o / 6e3) : 0,
      se = w > 0.8 ? Math.min(1, 0.4 + (w - 0.8) * 3) : 0,
      he = e.isGcActive ? 0.8 : 0,
      _ = Math.max(V, se, he),
      R = e.thermalStress ?? 0;
    _ > R
      ? (R = Math.min(_, R + 5e-4 * i))
      : (R = Math.max(_, R - (1 / 14900) * i));
    let M = e.fogLevel;
    R > M
      ? (M = Math.min(R, M + 4e-4 * i))
      : (M = Math.max(R, M - (1 / 14900) * i));
    let B = e.playerY + e.playerVy * a,
      j = e.playerVy + ee * a,
      X = !1,
      J = g - D;
    B >= J && ((B = J), (j = 0), (X = !0));
    let de = e.distanceMeters + 0.25 * a,
      N = e.score + Math.round(1 * a),
      me = Math.max(e.highScore, N),
      ce = $(130 + Math.floor(N * 0.05), 120, 188),
      m = {
        ...e,
        playerY: B,
        playerVy: j,
        isGrounded: X,
        battery: Number(n.toFixed(2)),
        isLightOn: u,
        lightActiveDurationMs: o,
        thermalStress: Number(R.toFixed(3)),
        fogLevel: Number(M.toFixed(3)),
        distanceMeters: Number(de.toFixed(1)),
        score: N,
        highScore: me,
        heartRate: ce,
      },
      O = Date.now(),
      fe = e.device === "fenix" ? 3200 : e.device === "forerunner" ? 4e3 : 5e3;
    if (O - e.lastAllocTime > fe) {
      let s = ["int", "float", "string", "array"],
        f = s[Math.floor(Math.random() * s.length)],
        h = W(m, f);
      if (h.crashed) return h.state;
      m = { ...h.state, lastAllocTime: O };
    }
    let pe = [...m.obstacles],
      G = [],
      E = null;
    for (let s of pe) {
      let f = s.x - s.speed * a,
        h = {
          left: C + 2,
          right: C + q - 2,
          top: m.playerY + 2,
          bottom: m.playerY + D - 2,
        },
        y = {
          left: f + 2,
          right: f + s.width - 2,
          top: s.y + 2,
          bottom: s.y + s.height - 2,
        };
      if (
        h.right > y.left &&
        h.left < y.right &&
        h.bottom > y.top &&
        h.top < y.bottom
      ) {
        if (s.type === "mem_token" && s.variablePayload) {
          let p = W(m, s.variablePayload);
          if (p.crashed) return p.state;
          m = p.state;
          continue;
        } else if (s.type === "flash_token") {
          let p = re(m, 4);
          if (p.crashed) return p.state;
          m = p.state;
          continue;
        } else if (s.type === "watchdog") {
          E = {
            errorType: "Watchdog Tripped",
            file: "Garmin_Schvitz_App.mc",
            line: 42,
            stackTrace: [
              "Watchdog Tripped: App Execution > 5000ms",
              "at System.println() [Core.mc:12]",
              "at Garmin_Schvitz_App.onTimer() [App.mc:42]",
            ],
            heapUsedKb: m.allocatedRamKb,
            heapLimitKb: c[m.device].ramLimitKb,
          };
          break;
        } else if (s.type === "null_pointer" || s.type === "stack_overflow") {
          E = {
            errorType:
              s.type === "null_pointer" ? "Null Pointer" : "Symbol Not Found",
            file: "Garmin_Schvitz_App.mc",
            line: 77,
            stackTrace: [
              "Symbol Not Found Error in Garmin_Schvitz_App.mc:77",
              `Failed symbol: :${s.label.toLowerCase()}`,
              "at Ui.View.findDrawableById() [Ui.mc:104]",
            ],
            heapUsedKb: m.allocatedRamKb,
            heapLimitKb: c[m.device].ramLimitKb,
          };
          break;
        }
      }
      f + s.width > 0 && G.push({ ...s, x: f });
    }
    if (E) return { ...m, gameState: "crashed", crashReport: E, obstacles: G };
    let be = 1800 + Math.random() * 1200;
    if (
      O - m.lastObstacleTime > be &&
      G.length < 3 &&
      G.reduce((f, h) => Math.max(f, h.x), 0) < 190
    ) {
      let f = [
          "null_pointer",
          "watchdog",
          "stack_overflow",
          "mem_token",
          "flash_token",
        ],
        h = f[Math.floor(Math.random() * f.length)],
        y = 16,
        S = 20,
        p = g - S,
        v = "NULL",
        L;
      if (h === "null_pointer") ((v = "NULL"), (y = 16), (S = 20), (p = g - S));
      else if (h === "watchdog") ((v = "DOG"), (y = 20), (S = 28), (p = g - S));
      else if (h === "stack_overflow")
        ((v = "STK"), (y = 18), (S = 24), (p = g - S));
      else if (h === "mem_token") {
        let K = ["int", "float", "string", "array"];
        ((L = K[Math.floor(Math.random() * K.length)]),
          (v = L.slice(0, 3).toUpperCase()),
          (y = 14),
          (S = 14),
          (p = g - 36 - Math.floor(Math.random() * 20)));
      } else
        h === "flash_token" &&
          ((v = "NV"),
          (y = 14),
          (S = 14),
          (p = g - 32 - Math.floor(Math.random() * 20)));
      (G.push({
        id: Date.now() + Math.random(),
        x: r + 10,
        y: p,
        width: y,
        height: S,
        type: h,
        label: v,
        speed: 2.2 + Math.min(2, m.score * 0.005),
        variablePayload: L,
      }),
        (m.lastObstacleTime = O));
    }
    return { ...m, obstacles: G };
  }
  function oe(e, t) {
    if (
      (e.save(),
      e.clearRect(0, 0, r, r),
      e.beginPath(),
      e.arc(r / 2, r / 2, r / 2 - 2, 0, Math.PI * 2),
      e.clip(),
      t.gameState === "shutdown" || t.battery <= 0)
    ) {
      (Ee(e, t), e.restore());
      return;
    }
    ((e.fillStyle = t.isLightOn ? "#0c1f2d" : l.black),
      e.fillRect(0, 0, r, r),
      (e.strokeStyle = "rgba(255, 255, 255, 0.03)"),
      (e.lineWidth = 1));
    for (let a = 0; a < r; a += 6)
      (e.beginPath(), e.moveTo(a, 0), e.lineTo(a, r), e.stroke());
    for (let a = 0; a < r; a += 6)
      (e.beginPath(), e.moveTo(0, a), e.lineTo(r, a), e.stroke());
    ((e.fillStyle = l.darkGray),
      e.fillRect(0, g, r, r - g),
      (e.fillStyle = l.cyan),
      e.fillRect(0, g, r, 2),
      (e.fillStyle = l.lightGray));
    let i = (t.distanceMeters * 10) % 24;
    for (let a = -i; a < r; a += 24) e.fillRect(a, g + 4, 12, 2);
    if (t.gameState === "crashed" && t.crashReport) {
      (Pe(e, t), e.restore());
      return;
    }
    Me(e, C, t.playerY, t.isGcActive);
    for (let a of t.obstacles) Ge(e, a);
    (t.isGcActive &&
      ((e.fillStyle = "rgba(0, 0, 170, 0.4)"),
      e.fillRect(0, 0, r, r),
      (e.fillStyle = l.brightCyan),
      (e.font = "bold 10px monospace"),
      (e.textAlign = "center"),
      e.fillText("GC FREEZE (500ms)", r / 2, 95),
      (e.fillStyle = l.white),
      (e.font = "8px monospace"),
      e.fillText("RECLAIMING HEAP...", r / 2, 108)),
      t.battery < 15 &&
        t.battery > 0 &&
        ((e.fillStyle = "rgba(0, 0, 0, 0.45)"), e.fillRect(0, 0, r, r)),
      Ae(e, t),
      t.fogLevel > 0.05 && Oe(e, t),
      e.restore());
  }
  function Ae(e, t) {
    let i = c[t.device].ramLimitKb,
      a = Math.min(1, t.allocatedRamKb / i),
      n = c[t.device].flashLimitKb,
      o = Math.min(1, t.allocatedFlashKb / n);
    ((e.font = "bold 9px monospace"),
      (e.textAlign = "left"),
      (e.fillStyle =
        t.battery < 15 ? l.red : t.battery < 30 ? l.yellow : l.green),
      e.fillText(`BAT: ${Math.round(t.battery)}%`, 45, 40),
      t.battery < 15 &&
        t.battery > 0 &&
        ((e.fillStyle = l.red),
        e.fillRect(45, 43, 62, 10),
        (e.fillStyle = l.white),
        (e.font = "bold 7px monospace"),
        e.fillText("\u26A0\uFE0F LOW POWER", 47, 51)),
      (e.textAlign = "right"),
      (e.fillStyle = l.lightGray),
      (e.font = "bold 9px monospace"),
      e.fillText(t.device.toUpperCase(), r - 45, 40),
      (e.textAlign = "center"),
      (e.fillStyle = l.white),
      (e.font = "bold 11px monospace"),
      e.fillText(`${t.score} PTS`, r / 2, 52));
    let d = 214,
      b = 160,
      A = 6,
      u = (r - b) / 2;
    ((e.fillStyle = "rgba(0, 0, 0, 0.85)"),
      e.fillRect(u - 4, d - 12, b + 8, 48),
      (e.strokeStyle = l.darkGray),
      e.strokeRect(u - 4, d - 12, b + 8, 48),
      (e.font = "bold 7.5px monospace"),
      (e.textAlign = "left"),
      (e.fillStyle = a > 0.85 ? l.red : a > 0.65 ? l.yellow : l.brightCyan),
      e.fillText(
        `RAM: ${t.allocatedRamKb.toFixed(1)} / ${i.toFixed(0)} KB`,
        u,
        d - 3
      ),
      (e.fillStyle = l.darkGray),
      e.fillRect(u, d, b, A));
    let k = Math.max(0, b * a);
    ((e.fillStyle = a > 0.9 ? l.red : a > 0.7 ? l.yellow : l.brightGreen),
      e.fillRect(u, d, k, A));
    let w = d + 14;
    ((e.fillStyle = o > 0.85 ? l.red : o > 0.65 ? l.yellow : l.orange),
      e.fillText(
        `FLASH: ${t.allocatedFlashKb.toFixed(1)} / ${n.toFixed(0)} KB`,
        u,
        w - 2
      ),
      (e.fillStyle = l.darkGray),
      e.fillRect(u, w, b, A));
    let V = Math.max(0, b * o);
    ((e.fillStyle = o > 0.9 ? l.red : o > 0.7 ? l.yellow : l.orange),
      e.fillRect(u, w, V, A),
      (e.font = "6.5px monospace"),
      (e.fillStyle = l.lightGray),
      e.fillText(
        `NV FILES: ${t.flashVariables.length} saved (${t.allocatedFlashKb.toFixed(1)}KB)`,
        u,
        w + 13
      ));
  }
  function Me(e, t, i, a) {
    (e.save(),
      e.translate(t, i),
      (e.fillStyle = a ? l.cyan : "#8B4513"),
      e.fillRect(4, 6, 12, 14),
      (e.fillStyle = a ? l.brightCyan : "#A0522D"),
      e.fillRect(2, 0, 16, 8),
      (e.fillStyle = "#D2B48C"),
      e.fillRect(0, 2, 3, 4),
      e.fillRect(17, 2, 3, 4),
      (e.fillStyle = "#F5DEB3"),
      e.fillRect(5, 3, 10, 5),
      (e.fillStyle = l.black),
      e.fillRect(7, 3, 2, 2),
      e.fillRect(11, 3, 2, 2),
      (e.fillStyle = l.red),
      e.fillRect(2, 0, 16, 2),
      (e.strokeStyle = "#8B4513"),
      (e.lineWidth = 2),
      e.beginPath(),
      e.moveTo(4, 16),
      e.quadraticCurveTo(-4, 12, -2, 6),
      e.stroke(),
      (e.fillStyle = l.black),
      e.fillRect(6, 20, 3, 4),
      e.fillRect(11, 20, 3, 4),
      e.restore());
  }
  function Ge(e, t) {
    (e.save(),
      e.translate(t.x, t.y),
      t.type === "mem_token"
        ? ((e.fillStyle = l.yellow),
          e.fillRect(0, 0, t.width, t.height),
          (e.strokeStyle = l.orange),
          e.strokeRect(0, 0, t.width, t.height),
          (e.fillStyle = l.black),
          (e.font = "bold 6px monospace"),
          (e.textAlign = "center"),
          e.fillText(t.label, t.width / 2, t.height / 2 + 2))
        : t.type === "flash_token"
          ? ((e.fillStyle = l.orange),
            e.fillRect(0, 0, t.width, t.height),
            (e.strokeStyle = l.yellow),
            e.strokeRect(0, 0, t.width, t.height),
            (e.fillStyle = l.black),
            (e.font = "bold 6px monospace"),
            (e.textAlign = "center"),
            e.fillText("NV", t.width / 2, t.height / 2 + 2))
          : t.type === "null_pointer"
            ? ((e.fillStyle = l.red),
              e.beginPath(),
              e.moveTo(t.width / 2, 0),
              e.lineTo(t.width, t.height),
              e.lineTo(0, t.height),
              e.closePath(),
              e.fill(),
              (e.fillStyle = l.white),
              (e.font = "bold 5px monospace"),
              (e.textAlign = "center"),
              e.fillText("NULL", t.width / 2, t.height - 2))
            : t.type === "watchdog"
              ? ((e.fillStyle = l.purple),
                e.fillRect(0, 0, t.width, t.height),
                (e.strokeStyle = l.magenta),
                e.strokeRect(0, 0, t.width, t.height),
                (e.fillStyle = l.white),
                (e.font = "bold 6px monospace"),
                (e.textAlign = "center"),
                e.fillText("DOG", t.width / 2, 10),
                e.fillText("5s", t.width / 2, 20))
              : ((e.fillStyle = l.darkRed),
                e.fillRect(0, 0, t.width, t.height),
                (e.strokeStyle = l.red),
                e.strokeRect(0, 0, t.width, t.height),
                (e.fillStyle = l.white),
                (e.font = "bold 5px monospace"),
                (e.textAlign = "center"),
                e.fillText("STK", t.width / 2, t.height / 2 + 2)),
      e.restore());
  }
  function Oe(e, t) {
    e.save();
    let i = Math.min(0.85, t.fogLevel);
    ((e.fillStyle = `rgba(220, 240, 255, ${i})`),
      e.fillRect(0, 0, r, r),
      (e.globalCompositeOperation = "destination-out"));
    for (let a of t.fogWipes) {
      let n = e.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius);
      (n.addColorStop(0, "rgba(0, 0, 0, 1.0)"),
        n.addColorStop(0.7, "rgba(0, 0, 0, 0.8)"),
        n.addColorStop(1, "rgba(0, 0, 0, 0)"),
        (e.fillStyle = n),
        e.beginPath(),
        e.arc(a.x, a.y, a.radius, 0, Math.PI * 2),
        e.fill());
    }
    (e.restore(),
      t.fogLevel > 0.4 &&
        (e.save(),
        (e.fillStyle = l.yellow),
        (e.font = "bold 8px monospace"),
        (e.textAlign = "center"),
        e.fillText("\u26A0\uFE0F OVERHEAT: SWIPE TO WIPE", r / 2, 75),
        e.restore()));
  }
  function Ee(e, t) {
    ((e.fillStyle = "#050508"),
      e.fillRect(0, 0, r, r),
      (e.fillStyle = l.red),
      (e.font = "bold 11px monospace"),
      (e.textAlign = "center"),
      e.fillText("\u26A1 POWER DEPLETED \u26A1", r / 2, 75),
      (e.fillStyle = l.yellow),
      (e.font = "bold 9px monospace"),
      e.fillText("BROWNOUT SHUTDOWN", r / 2, 92),
      (e.fillStyle = l.white),
      (e.font = "8px monospace"),
      e.fillText("0.0% BATTERY REMAINING", r / 2, 112),
      (e.fillStyle = l.lightGray),
      (e.font = "7.5px monospace"),
      e.fillText("System halted to protect NV flash", r / 2, 128),
      e.fillText(`Final Score: ${t.score} PTS`, r / 2, 144),
      (e.fillStyle = l.brightGreen),
      (e.font = "bold 9px monospace"),
      e.fillText("PRESS START TO REBOOT", r / 2, 185));
  }
  function Pe(e, t) {
    let i = t.crashReport;
    if (!i) return;
    ((e.fillStyle = "#000088"),
      e.fillRect(0, 0, r, r),
      (e.fillStyle = l.brightCyan),
      (e.font = "bold 10px monospace"),
      (e.textAlign = "center"),
      e.fillText("CONNECT IQ ERROR", r / 2, 45),
      (e.fillStyle = l.white),
      (e.font = "bold 8px monospace"),
      e.fillText(i.errorType.toUpperCase(), r / 2, 60),
      (e.fillStyle = l.yellow),
      (e.font = "7px monospace"),
      e.fillText(`File: ${i.file}:${i.line}`, r / 2, 74),
      (e.font = "6.5px monospace"),
      (e.textAlign = "left"),
      (e.fillStyle = l.lightGray));
    let a = 92;
    for (let n of i.stackTrace) (e.fillText(n.slice(0, 42), 24, a), (a += 11));
    if (
      ((e.fillStyle = l.white),
      (e.font = "bold 7.5px monospace"),
      (e.textAlign = "center"),
      i.errorType === "Out Of Storage")
    ) {
      let n = i.flashUsedKb ?? t.allocatedFlashKb,
        o = i.flashLimitKb ?? c[t.device].flashLimitKb;
      e.fillText(`FLASH: ${n.toFixed(1)} / ${o.toFixed(1)} KB`, r / 2, 175);
    } else
      e.fillText(
        `PEAK RAM: ${i.heapUsedKb.toFixed(1)} / ${i.heapLimitKb.toFixed(1)} KB`,
        r / 2,
        175
      );
    (e.fillText(`SCORE: ${t.score}  |  HI: ${t.highScore}`, r / 2, 190),
      (e.fillStyle = l.brightGreen),
      (e.font = "bold 9px monospace"),
      e.fillText("PRESS START TO REBUILD", r / 2, 218));
  }
  var z = class extends P {
    constructor(t = "fenix") {
      super(x(t));
    }
    init() {}
    startGame() {
      ((this.state = ae(this.state, this.state.device)),
        this.notifySubscribers());
    }
    triggerGc() {
      let { state: t } = le(this.state);
      ((this.state = t), this.notifySubscribers());
    }
    jettisonOldest() {
      let { state: t } = ie(this.state);
      ((this.state = t), this.notifySubscribers());
    }
    jump() {
      this.state.isGrounded &&
        this.state.gameState === "playing" &&
        ((this.state.playerVy = te),
        (this.state.isGrounded = !1),
        this.notifySubscribers());
    }
    pressButton(t) {
      t === "start"
        ? this.state.gameState === "idle" ||
          this.state.gameState === "crashed" ||
          this.state.gameState === "shutdown"
          ? this.startGame()
          : this.state.gameState === "playing" && this.jump()
        : t === "down"
          ? this.triggerGc()
          : t === "back"
            ? this.jettisonOldest()
            : t === "light" &&
              ((this.state.isLightOn = !this.state.isLightOn),
              this.notifySubscribers());
    }
    update(t) {
      (this.state.gameState === "playing" &&
        (this.state = ne(this.state, t * 1e3)),
        this.invalidateSnapshot());
    }
    render(t, i) {
      t && oe(t, this.state);
    }
    createSnapshot() {
      return {
        device: this.state.device,
        gameState: this.state.gameState,
        batteryPercent: Math.round(this.state.battery),
        cpuLoadPercent: Math.round(
          (this.state.allocatedRamKb /
            (c[this.state.device]?.ramLimitKb || 32)) *
            100
        ),
        allocatedRamKb: this.state.allocatedRamKb,
        allocatedFlashKb: this.state.allocatedFlashKb,
        temperatureC: Math.round(37 + this.state.thermalStress * 15),
        score: this.state.score,
        highScore: this.state.highScore,
      };
    }
  };
  return we(Ce);
})();
