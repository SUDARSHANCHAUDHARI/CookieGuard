"use strict";

const DEFENSES = [
  {
    id: "lid",
    className: "defense-lid",
    message: "Lid lockdown! Access to the cookie has been sealed.",
    tone: "clunk",
  },
  {
    id: "pull",
    className: "defense-pull",
    message: "Cookie recall! The snack has been pulled back to safety.",
    tone: "zip",
  },
  {
    id: "move",
    className: "defense-move",
    message: "Table shuffle! The entire jar changed position.",
    tone: "scuttle",
  },
  {
    id: "arms",
    className: "defense-arms",
    message: "Tiny arms deployed. They are surprisingly firm.",
    tone: "boing",
  },
  {
    id: "broccoli",
    className: "defense-broccoli",
    message: "Snack substitution! Please enjoy this responsible broccoli.",
    tone: "swap",
  },
  {
    id: "under",
    className: "defense-under",
    message: "Under-jar hideout! The cookie slipped out of reach.",
    tone: "drop",
  },
  {
    id: "warning",
    className: "defense-warning",
    message: "Official warning: step away from the baked goods.",
    tone: "alarm",
  },
  {
    id: "empty",
    className: "defense-empty",
    message: "Nothing to see here. This jar is definitely, absolutely empty.",
    tone: "bluff",
  },
  {
    id: "fakes",
    className: "defense-fakes",
    message: "Decoy batch released! Which cookie is the real one?",
    tone: "pop",
  },
  {
    id: "hand",
    className: "defense-hand",
    message: "Pointer patrol! A cartoon hand pushes your grab away.",
    tone: "push",
  },
];

const DEFENSE_CLASS_NAMES = DEFENSES.map((defense) => defense.className);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

class CookieGuardGame {
  constructor() {
    this.scene = document.querySelector("#kitchenScene");
    this.actor = document.querySelector("#jarActor");
    this.cookie = document.querySelector("#cookie");
    this.progress = document.querySelector("#attemptProgress");
    this.attemptCount = document.querySelector("#attemptCount");
    this.banner = document.querySelector("#defenseBanner");
    this.bannerText = document.querySelector("#defenseText");
    this.liveRegion = document.querySelector("#liveRegion");
    this.soundButton = document.querySelector("#soundToggle");
    this.resetButton = document.querySelector("#resetButton");
    this.fakeCookies = document.querySelector("#fakeCookies");
    this.cartoonHand = document.querySelector("#cartoonHand");
    this.rewardPlate = document.querySelector("#rewardPlate");
    this.rewardLabel = this.rewardPlate.querySelector(".reward-label");
    this.celebration = document.querySelector("#celebration");

    this.attempts = 0;
    this.isBusy = false;
    this.isComplete = false;
    this.hasHalfCookie = false;
    this.activePointerId = null;
    this.pointerOrigin = { x: 0, y: 0 };
    this.lastPointer = null;
    this.dragTarget = { x: 0, y: 0 };
    this.dragCurrent = { x: 0, y: 0 };
    this.dragFrame = null;
    this.defenseTimer = null;
    this.jarX = 0;
    this.audioContext = null;
    this.soundEnabled = this.readSoundPreference();
    this.defenseBag = this.createDefenseBag();

    this.bindEvents();
    this.updateSoundControl();
    this.updateProgress();
  }

  bindEvents() {
    this.cookie.addEventListener("pointerdown", (event) => this.startDrag(event));
    this.cookie.addEventListener("pointermove", (event) => this.moveDrag(event));
    this.cookie.addEventListener("pointerup", (event) => this.finishDrag(event));
    this.cookie.addEventListener("pointercancel", () => this.cancelDrag());
    this.cookie.addEventListener("keydown", (event) => this.handleKeyboard(event));
    this.cookie.addEventListener("click", (event) => {
      if (event.detail === 0 && !event.defaultPrevented) {
        this.tryCookie();
      }
    });
    this.soundButton.addEventListener("click", () => this.toggleSound());
    this.resetButton.addEventListener("click", () => this.reset());
    window.addEventListener("resize", () => this.keepJarOnTable());
  }

  startDrag(event) {
    if (this.isBusy || this.isComplete || event.button !== 0) {
      return;
    }

    event.preventDefault();
    this.ensureAudioContext();
    this.activePointerId = event.pointerId;
    this.pointerOrigin = { x: event.clientX, y: event.clientY };
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.cookie.classList.add("is-dragging");
    this.cookie.setPointerCapture?.(event.pointerId);
  }

  moveDrag(event) {
    if (event.pointerId !== this.activePointerId || this.isBusy || this.isComplete) {
      return;
    }

    event.preventDefault();
    this.lastPointer = { x: event.clientX, y: event.clientY };

    const deltaX = event.clientX - this.pointerOrigin.x;
    const deltaY = event.clientY - this.pointerOrigin.y;
    const sceneBounds = this.scene.getBoundingClientRect();
    const cookieBounds = this.cookie.getBoundingClientRect();
    const margin = 16;
    const currentX = this.dragCurrent.x;
    const currentY = this.dragCurrent.y;
    const baseLeft = cookieBounds.left - currentX;
    const baseRight = cookieBounds.right - currentX;
    const baseTop = cookieBounds.top - currentY;
    const baseBottom = cookieBounds.bottom - currentY;

    const minX = sceneBounds.left + margin - baseLeft;
    const maxX = sceneBounds.right - margin - baseRight;
    const minY = sceneBounds.top + margin - baseTop;
    const maxY = sceneBounds.bottom - margin - baseBottom;

    this.dragTarget.x = this.applyEdgeResistance(deltaX, minX, maxX);
    this.dragTarget.y = this.applyEdgeResistance(deltaY, minY, maxY);
    this.requestDragFrame();
  }

  finishDrag(event) {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    event.preventDefault();
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.releasePointerCapture(event.pointerId);
    this.activePointerId = null;
    this.cookie.classList.remove("is-dragging");
    this.resetDragPosition();
    this.tryCookie();
  }

  cancelDrag() {
    this.activePointerId = null;
    this.cookie.classList.remove("is-dragging");
    this.resetDragPosition();
  }

  handleKeyboard(event) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    const cookieBounds = this.cookie.getBoundingClientRect();
    this.lastPointer = {
      x: cookieBounds.left + cookieBounds.width / 2,
      y: cookieBounds.top + cookieBounds.height / 2,
    };
    this.ensureAudioContext();
    this.tryCookie();
  }

  applyEdgeResistance(value, minimum, maximum) {
    if (value < minimum) {
      return minimum + (value - minimum) * 0.16;
    }
    if (value > maximum) {
      return maximum + (value - maximum) * 0.16;
    }
    return value;
  }

  requestDragFrame() {
    if (this.dragFrame !== null) {
      return;
    }

    const update = () => {
      const smoothing = prefersReducedMotion.matches ? 1 : 0.42;
      this.dragCurrent.x += (this.dragTarget.x - this.dragCurrent.x) * smoothing;
      this.dragCurrent.y += (this.dragTarget.y - this.dragCurrent.y) * smoothing;
      this.cookie.style.setProperty("--drag-x", `${this.dragCurrent.x.toFixed(2)}px`);
      this.cookie.style.setProperty("--drag-y", `${this.dragCurrent.y.toFixed(2)}px`);

      const isSettled =
        Math.abs(this.dragTarget.x - this.dragCurrent.x) < 0.2 &&
        Math.abs(this.dragTarget.y - this.dragCurrent.y) < 0.2;

      if (isSettled) {
        this.dragFrame = null;
        return;
      }
      this.dragFrame = window.requestAnimationFrame(update);
    };

    this.dragFrame = window.requestAnimationFrame(update);
  }

  resetDragPosition() {
    if (this.dragFrame !== null) {
      window.cancelAnimationFrame(this.dragFrame);
      this.dragFrame = null;
    }
    this.dragTarget = { x: 0, y: 0 };
    this.dragCurrent = { x: 0, y: 0 };
    this.cookie.style.setProperty("--drag-x", "0px");
    this.cookie.style.setProperty("--drag-y", "0px");
  }

  releasePointerCapture(pointerId) {
    try {
      if (this.cookie.hasPointerCapture?.(pointerId)) {
        this.cookie.releasePointerCapture(pointerId);
      }
    } catch {
      // The browser may have already released capture when a pointer leaves the viewport.
    }
  }

  tryCookie() {
    if (this.isBusy || this.isComplete) {
      return;
    }

    this.attempts += 1;
    this.updateProgress();

    if (this.attempts >= 15) {
      this.completeGame();
      return;
    }

    const defense = this.nextDefense();
    this.activateDefense(defense, this.attempts === 10);
  }

  activateDefense(defense, grantsHalfCookie) {
    this.clearDefense();
    this.isBusy = true;
    this.actor.classList.add("is-busy", defense.className);
    this.cookie.setAttribute("aria-disabled", "true");
    this.banner.classList.remove("is-success");
    this.banner.classList.add("is-alert");
    this.bannerText.textContent = defense.message;
    this.announce(`Attempt ${this.attempts}. ${defense.message}`);
    this.markDefenseSeen(defense.id);
    this.prepareDefense(defense.id);
    this.playDefenseSound(defense.tone);

    const duration = prefersReducedMotion.matches ? 260 : 1250;
    this.defenseTimer = window.setTimeout(() => {
      this.defenseTimer = null;
      this.actor.classList.remove(defense.className, "is-busy");
      this.cookie.removeAttribute("aria-disabled");
      this.banner.classList.remove("is-alert");
      this.clearFakeCookies();
      this.isBusy = false;

      if (grantsHalfCookie) {
        this.awardHalfCookie();
      } else {
        this.bannerText.textContent = "Defense held. Try another grab.";
      }
    }, duration);
  }

  prepareDefense(defenseId) {
    if (defenseId === "move") {
      this.moveJarAcrossTable();
    }
    if (defenseId === "fakes") {
      this.createFakeCookies();
    }
    if (defenseId === "hand") {
      this.placeCartoonHand();
    }
  }

  moveJarAcrossTable() {
    const sceneBounds = this.scene.getBoundingClientRect();
    const actorBounds = this.actor.getBoundingClientRect();
    const available = Math.max(0, (sceneBounds.width - actorBounds.width) / 2 - 24);
    if (available < 24) {
      this.jarX = 0;
    } else {
      const direction = this.jarX >= 0 ? -1 : 1;
      const distance = available * (0.55 + Math.random() * 0.4);
      this.jarX = direction * distance;
    }
    this.actor.style.setProperty("--jar-x", `${this.jarX.toFixed(1)}px`);
  }

  keepJarOnTable() {
    const sceneBounds = this.scene.getBoundingClientRect();
    const actorBounds = this.actor.getBoundingClientRect();
    const available = Math.max(0, (sceneBounds.width - actorBounds.width) / 2 - 18);
    this.jarX = Math.max(-available, Math.min(available, this.jarX));
    this.actor.style.setProperty("--jar-x", `${this.jarX.toFixed(1)}px`);
  }

  createFakeCookies() {
    const placements = [
      { x: -128, y: -60, r: -22 },
      { x: 126, y: -70, r: 31 },
      { x: -148, y: 74, r: 14 },
      { x: 142, y: 78, r: -15 },
      { x: 0, y: -112, r: 8 },
    ];

    const fragment = document.createDocumentFragment();
    placements.forEach((placement, index) => {
      const decoy = document.createElement("span");
      decoy.className = "fake-cookie";
      decoy.style.setProperty("--fake-x", `${placement.x}px`);
      decoy.style.setProperty("--fake-y", `${placement.y}px`);
      decoy.style.setProperty("--fake-r", `${placement.r}deg`);
      decoy.style.setProperty("--delay", `${index * 55}ms`);
      fragment.append(decoy);
    });
    this.fakeCookies.append(fragment);
  }

  clearFakeCookies() {
    this.fakeCookies.replaceChildren();
  }

  placeCartoonHand() {
    const actorBounds = this.actor.getBoundingClientRect();
    const cookieBounds = this.cookie.getBoundingClientRect();
    const pointerX = this.lastPointer?.x ?? cookieBounds.left + cookieBounds.width / 2;
    const pointerY = this.lastPointer?.y ?? cookieBounds.top + cookieBounds.height / 2;
    const localX = pointerX - actorBounds.left - 46;
    const localY = pointerY - actorBounds.top - 42;
    this.cartoonHand.style.setProperty("--hand-x", `${localX.toFixed(1)}px`);
    this.cartoonHand.style.setProperty("--hand-y", `${localY.toFixed(1)}px`);
  }

  awardHalfCookie() {
    this.hasHalfCookie = true;
    this.scene.classList.add("has-half-cookie");
    this.rewardPlate.setAttribute("aria-hidden", "false");
    this.banner.classList.add("is-success");
    this.bannerText.textContent = "Ten attempts! Half a cookie has been released.";
    this.announce("Milestone reached. You earned half a cookie. Five more attempts free the complete cookie.");
    this.playRewardSound();
  }

  completeGame() {
    this.clearDefense();
    this.isBusy = false;
    this.isComplete = true;
    this.resetDragPosition();
    this.actor.classList.remove("is-busy", ...DEFENSE_CLASS_NAMES);
    this.cookie.removeAttribute("aria-disabled");

    const cookieBounds = this.cookie.getBoundingClientRect();
    const plateBounds = this.rewardPlate.getBoundingClientRect();
    const releaseX = plateBounds.left + plateBounds.width / 2 - (cookieBounds.left + cookieBounds.width / 2);
    const releaseY = plateBounds.top + plateBounds.height / 2 - (cookieBounds.top + cookieBounds.height / 2);
    this.cookie.style.setProperty("--release-x", `${releaseX.toFixed(1)}px`);
    this.cookie.style.setProperty("--release-y", `${releaseY.toFixed(1)}px`);

    this.scene.classList.add("has-half-cookie", "game-complete");
    this.rewardPlate.setAttribute("aria-hidden", "false");
    this.rewardLabel.textContent = "The whole cookie!";
    this.cookie.disabled = true;
    this.cookie.setAttribute("aria-label", "The complete cookie has been released");
    this.banner.classList.remove("is-alert");
    this.banner.classList.add("is-success");
    this.bannerText.textContent = "Cookie released! Persistence defeats pantry security.";
    this.announce("Attempt 15. Cookie released! You won the complete cookie.");
    this.createCelebration();
    this.playVictorySound();
  }

  createCelebration() {
    this.celebration.replaceChildren();
    const colors = ["#e84855", "#ffd76a", "#274c77", "#a7d8c8", "#fff4c7"];
    const count = prefersReducedMotion.matches ? 12 : 40;
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < count; index += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.setProperty("--x", `${3 + Math.random() * 94}%`);
      piece.style.setProperty("--delay", `${Math.random() * 650}ms`);
      piece.style.setProperty("--spin", `${180 + Math.random() * 720}deg`);
      piece.style.setProperty("--confetti-color", colors[index % colors.length]);
      if (prefersReducedMotion.matches) {
        piece.classList.add("is-still");
        piece.style.setProperty("--still-y", `${12 + Math.random() * 70}%`);
      }
      fragment.append(piece);
    }
    this.celebration.append(fragment);
  }

  createDefenseBag() {
    const bag = [...DEFENSES];
    for (let index = bag.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [bag[index], bag[swapIndex]] = [bag[swapIndex], bag[index]];
    }
    return bag;
  }

  nextDefense() {
    if (this.defenseBag.length === 0) {
      this.defenseBag = this.createDefenseBag();
    }
    return this.defenseBag.shift();
  }

  markDefenseSeen(defenseId) {
    document.querySelector(`[data-defense="${defenseId}"]`)?.classList.add("is-seen");
  }

  updateProgress() {
    const cappedAttempts = Math.min(this.attempts, 15);
    const percentage = (cappedAttempts / 15) * 100;
    this.attemptCount.textContent = String(cappedAttempts).padStart(2, "0");
    this.progress.style.setProperty("--progress", `${percentage}%`);
    this.progress.setAttribute("aria-valuenow", String(cappedAttempts));
    this.progress.setAttribute("aria-valuetext", `${cappedAttempts} of 15 attempts`);
  }

  clearDefense() {
    if (this.defenseTimer !== null) {
      window.clearTimeout(this.defenseTimer);
      this.defenseTimer = null;
    }
    this.actor.classList.remove("is-busy", ...DEFENSE_CLASS_NAMES);
    this.cookie.removeAttribute("aria-disabled");
    this.clearFakeCookies();
  }

  reset() {
    this.clearDefense();
    this.cancelDrag();
    this.attempts = 0;
    this.isBusy = false;
    this.isComplete = false;
    this.hasHalfCookie = false;
    this.jarX = 0;
    this.lastPointer = null;
    this.defenseBag = this.createDefenseBag();

    this.scene.classList.remove("has-half-cookie", "game-complete");
    this.actor.removeAttribute("style");
    this.cookie.disabled = false;
    this.cookie.removeAttribute("style");
    this.cookie.setAttribute("aria-label", "Try to take the final cookie");
    this.rewardPlate.setAttribute("aria-hidden", "true");
    this.rewardLabel.textContent = "Your half";
    this.banner.classList.remove("is-alert", "is-success");
    this.bannerText.textContent = "Final cookie secured. For now.";
    this.celebration.replaceChildren();
    document.querySelectorAll("#defenseList .is-seen").forEach((item) => item.classList.remove("is-seen"));
    this.updateProgress();
    this.announce("CookieGuard reset. The final cookie is protected again.");
    this.playTone(310, 0.08, "triangle", 0.05);
  }

  announce(message) {
    this.liveRegion.textContent = "";
    window.setTimeout(() => {
      this.liveRegion.textContent = message;
    }, 20);
  }

  readSoundPreference() {
    try {
      return window.localStorage.getItem("cookieguard-sound") !== "off";
    } catch {
      return true;
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (this.soundEnabled) {
      this.ensureAudioContext();
      this.playTone(440, 0.08, "sine", 0.06);
      window.setTimeout(() => this.playTone(660, 0.1, "sine", 0.05), 80);
    }
    try {
      window.localStorage.setItem("cookieguard-sound", this.soundEnabled ? "on" : "off");
    } catch {
      // Sound still works when storage is unavailable (for example, in strict privacy mode).
    }
    this.updateSoundControl();
    this.announce(`Sound ${this.soundEnabled ? "on" : "off"}.`);
  }

  updateSoundControl() {
    this.soundButton.setAttribute("aria-pressed", String(this.soundEnabled));
    this.soundButton.setAttribute("aria-label", this.soundEnabled ? "Mute sound" : "Turn on sound");
  }

  ensureAudioContext() {
    if (!this.soundEnabled) {
      return null;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return null;
    }
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  playTone(frequency, duration = 0.1, wave = "sine", volume = 0.045, delay = 0) {
    const context = this.ensureAudioContext();
    if (!context || !this.soundEnabled) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  playDefenseSound(tone) {
    const sounds = {
      clunk: [[150, 0.12, "square", 0.035, 0]],
      zip: [[650, 0.16, "sawtooth", 0.025, 0], [310, 0.12, "triangle", 0.035, 0.09]],
      scuttle: [[180, 0.05, "square", 0.025, 0], [210, 0.05, "square", 0.025, 0.08], [175, 0.05, "square", 0.025, 0.16]],
      boing: [[230, 0.22, "sine", 0.06, 0], [460, 0.12, "sine", 0.035, 0.08]],
      swap: [[420, 0.08, "triangle", 0.04, 0], [290, 0.13, "triangle", 0.04, 0.08]],
      drop: [[240, 0.11, "sine", 0.05, 0], [120, 0.14, "square", 0.025, 0.1]],
      alarm: [[620, 0.08, "square", 0.025, 0], [490, 0.08, "square", 0.025, 0.11], [620, 0.08, "square", 0.025, 0.22]],
      bluff: [[260, 0.13, "sine", 0.04, 0], [220, 0.18, "sine", 0.035, 0.13]],
      pop: [[480, 0.07, "sine", 0.05, 0], [600, 0.07, "sine", 0.045, 0.07], [720, 0.07, "sine", 0.04, 0.14]],
      push: [[190, 0.12, "sawtooth", 0.025, 0], [130, 0.15, "sine", 0.05, 0.1]],
    };
    (sounds[tone] || sounds.clunk).forEach((parameters) => this.playTone(...parameters));
  }

  playRewardSound() {
    [[440, 0], [554, 0.1], [659, 0.2]].forEach(([frequency, delay]) => {
      this.playTone(frequency, 0.16, "triangle", 0.045, delay);
    });
  }

  playVictorySound() {
    [[392, 0], [494, 0.11], [587, 0.22], [784, 0.36], [988, 0.5]].forEach(([frequency, delay], index) => {
      this.playTone(frequency, index === 4 ? 0.45 : 0.18, "triangle", 0.05, delay);
    });
  }
}

new CookieGuardGame();
