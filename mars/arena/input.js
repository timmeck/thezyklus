const EMPTY_INPUT = Object.freeze({
  move: 0,
  jump: false,
  shoot: false,
  special: false,
  aimX: 0,
  aimY: 0,
});
export const KEYBOARD_BINDINGS = Object.freeze({
  keyboard1: {
    left: "KeyA",
    right: "KeyD",
    up: "KeyW",
    down: "KeyS",
    jump: ["Space"],
    shoot: "KeyF",
    special: "KeyG",
  },
  keyboard2: {
    left: "ArrowLeft",
    right: "ArrowRight",
    up: "ArrowUp",
    down: "ArrowDown",
    jump: ["ShiftRight"],
    shoot: "KeyK",
    special: "KeyL",
  },
  keyboard3: {
    left: "KeyN",
    right: "KeyM",
    up: "KeyI",
    down: "Comma",
    jump: ["KeyH"],
    shoot: "KeyY",
    special: "KeyU",
  },
  keyboard4: {
    left: "Numpad4",
    right: "Numpad6",
    up: "Numpad8",
    down: "Numpad2",
    jump: ["Numpad5"],
    shoot: "Numpad0",
    special: "NumpadDecimal",
  },
});
const GAMEPLAY_KEYS = new Set(
  Object.values(KEYBOARD_BINDINGS).flatMap((binding) => [
    binding.left,
    binding.right,
    binding.up,
    binding.down,
    ...binding.jump,
    binding.shoot,
    binding.special,
  ]),
);
GAMEPLAY_KEYS.add("KeyZ");
const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, Number(value) || 0));

function editable(target) {
  return Boolean(
    target?.isContentEditable ||
      target?.closest?.(
        'input, select, textarea, [contenteditable]:not([contenteditable="false"]), [role="textbox"]',
      ),
  );
}

function dialogOpen(allowPause = false) {
  return Boolean(
    globalThis.document?.querySelector(
      'dialog[open], [role="dialog"][aria-modal="true"]' + (allowPause ? ':not(#pause-overlay)' : ''),
    ),
  );
}

function buttonDown(pad, index) {
  const button = pad.buttons?.[index];
  return Boolean(button?.pressed || button?.value > 0.45);
}

function stick(value, deadzone = 0.18) {
  const axis = clamp(value, -1, 1);
  if (Math.abs(axis) <= deadzone) return 0;
  return (Math.sign(axis) * (Math.abs(axis) - deadzone)) / (1 - deadzone);
}

export class InputManager {
  constructor({ onPause = () => {}, onGamepadChange = () => {}, onInputMethod = () => {} } = {}) {
    this.onPause = onPause;
    this.onGamepadChange = onGamepadChange;
    this.onInputMethod = onInputMethod;
    this.active = false;
    this.suspended = Boolean(globalThis.document?.hidden);
    this.keys = new Set();
    this.touch = { ...EMPTY_INPUT };
    this.touchPresses = new Set();
    this.touchShotAim = null;
    this.mouse = { active: false, down: false, pressed: false, x: 0, y: 0 };
    this.gamepads = new Map();
    this.menuDown = new Map();
    this.gamepadSignature = "";

    globalThis.window?.addEventListener("keydown", (event) => {
      if (
        !this.active ||
        this.suspended ||
        editable(event.target) ||
        dialogOpen(event.code === "Escape" || event.code === "KeyP")
      )
        return;
      if (event.code === "Escape" || event.code === "KeyP") {
        event.preventDefault();
        if (!event.repeat) this.onPause();
        return;
      }
      if (!GAMEPLAY_KEYS.has(event.code)) return;
      this.mouse.active = false;
      this.onInputMethod('keyboard');
      event.preventDefault();
      this.keys.add(event.code);
    });
    globalThis.window?.addEventListener("keyup", (event) => {
      this.keys.delete(event.code);
      if (
        this.active &&
        !editable(event.target) &&
        !dialogOpen() &&
        GAMEPLAY_KEYS.has(event.code)
      )
        event.preventDefault();
    });
    globalThis.window?.addEventListener("blur", () => {
      this.suspended = true;
      this.clear();
    });
    globalThis.window?.addEventListener("focus", () => {
      this.suspended = Boolean(globalThis.document?.hidden);
    });
    globalThis.document?.addEventListener("visibilitychange", () => {
      this.suspended = Boolean(globalThis.document.hidden);
      if (this.suspended) this.clear();
    });
    globalThis.window?.addEventListener("gamepadconnected", () =>
      this.pollGamepads(),
    );
    globalThis.window?.addEventListener("gamepaddisconnected", () =>
      this.pollGamepads(),
    );
    this.pollGamepads();
  }

  setActive(active) {
    this.active = Boolean(active);
    if (!this.active) this.clear();
  }

  clear() {
    this.keys.clear();
    this.touch = { ...EMPTY_INPUT };
    this.touchPresses.clear();
    this.touchShotAim = null;
    this.mouse.active = false;
    this.mouse.down = false;
    this.mouse.pressed = false;
  }

  setTouch(action, value) {
    if (action === "move") this.touch.move = clamp(value, -1, 1);
    else if (action === "jump" || action === "shoot" || action === "special"){
      if(value&&!this.touch[action])this.touchPresses.add(action);
      this.touch[action] = Boolean(value);
      if (action === 'shoot' && value) this.touchShotAim = { aimX: this.touch.aimX, aimY: this.touch.aimY };
    }
    if (value) this.mouse.active = false;
  }

  setTouchAim(x, y) {
    this.touch.aimX = clamp(x, -1, 1);
    this.touch.aimY = clamp(y, -1, 1);
    if (this.touch.shoot && this.touchPresses.has('shoot'))
      this.touchShotAim = { aimX: this.touch.aimX, aimY: this.touch.aimY };
  }

  cancelTouchShot() {
    this.touchPresses.delete('shoot');
    this.touchShotAim = null;
  }

  bindMouse(canvas, aimAt) {
    this.aimAt = aimAt;
    const track = event => {
      if (event.pointerType !== 'mouse' || !this.active || this.suspended || dialogOpen()) return false;
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;
      this.mouse.active = true;
      this.onInputMethod('mouse');
      return true;
    };
    canvas.addEventListener('pointermove', track);
    canvas.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !track(event)) return;
      event.preventDefault();
      canvas.focus({ preventScroll: true });
      canvas.setPointerCapture(event.pointerId);
      this.mouse.down = true;
      this.mouse.pressed = true;
    });
    canvas.addEventListener('pointerleave', () => {
      if (!this.mouse.down) this.mouse.active = false;
    });
    const release = () => { this.mouse.down = false; };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', () => {
      this.mouse.pressed = false;
      this.mouse.active = false;
      release();
    });
    canvas.addEventListener('lostpointercapture', release);
  }

  touchFrame() {
    const frame = { ...this.touch };
    for (const action of this.touchPresses) frame[action] = true;
    if (!this.touch.shoot && this.touchPresses.has('shoot') && this.touchShotAim)
      Object.assign(frame, this.touchShotAim);
    this.touchPresses.clear();
    this.touchShotAim = null;
    return frame;
  }

  pollGamepads() {
    let pads = [];
    try {
      pads = Array.from(globalThis.navigator?.getGamepads?.() || []).filter(
        (pad) => pad?.connected,
      );
    } catch {
      // Some embedded browsers expose the API while blocking its use.
    }
    this.gamepads = new Map(pads.map((pad) => [pad.index, pad]));
    for (const pad of pads) {
      if(this.active&&(pad.buttons?.some(b=>b.pressed)||pad.axes?.some(v=>Math.abs(v)>.25))){
        this.mouse.active = false;
        this.onInputMethod('gamepad',pad.index);
      }
      const menu = buttonDown(pad, 9);
      const previous = this.menuDown.get(pad.index) || false;
      this.menuDown.set(pad.index, menu);
      if (
        menu &&
        !previous &&
        this.active &&
        !this.suspended &&
        !dialogOpen(true) &&
        !editable(globalThis.document?.activeElement)
      )
        this.onPause();
    }
    for (const index of this.menuDown.keys()) {
      if (!this.gamepads.has(index)) this.menuDown.delete(index);
    }
    const signature = pads.map((pad) => `${pad.index}/${pad.id}`).join("|");
    if (signature !== this.gamepadSignature) {
      this.gamepadSignature = signature;
      this.onGamepadChange(this.connected());
    }
    return this.connected();
  }

  connected() {
    return [...this.gamepads.values()].map((pad) => ({
      index: pad.index,
      id: pad.id,
    }));
  }

  read(binding = "keyboard1", primary = binding === "keyboard1") {
    if (
      !this.active ||
      this.suspended ||
      dialogOpen() ||
      editable(globalThis.document?.activeElement)
    )
      return { ...EMPTY_INPUT };
    if (binding === "touch") {
      return this.touchFrame();
    }
    const keyboard = KEYBOARD_BINDINGS[binding];
    let frame = { ...EMPTY_INPUT };
    if (keyboard) {
      frame = {
        move: Number(this.keys.has(keyboard.right)) - Number(this.keys.has(keyboard.left)),
        jump: keyboard.jump.some(key => this.keys.has(key)),
        shoot: this.keys.has(keyboard.shoot) || (binding === 'keyboard3' && this.keys.has('KeyZ')),
        special: this.keys.has(keyboard.special),
        aimX: Number(this.keys.has(keyboard.right)) - Number(this.keys.has(keyboard.left)),
        aimY: Number(this.keys.has(keyboard.down)) - Number(this.keys.has(keyboard.up)),
      };
    } else {
      const match = /^gamepad([0-3])$/.exec(binding);
      const pad = match ? this.gamepads.get(Number(match[1])) : null;
      if (pad) {
        const dpad = Number(buttonDown(pad, 15)) - Number(buttonDown(pad, 14));
        const aimX = clamp(pad.axes?.[2], -1, 1), aimY = clamp(pad.axes?.[3], -1, 1);
        const aimLength = Math.hypot(aimX, aimY);
        frame = {
          move: dpad || stick(pad.axes?.[0]),
          jump: buttonDown(pad, 0),
          shoot: buttonDown(pad, 2) || buttonDown(pad, 7),
          special: buttonDown(pad, 1) || buttonDown(pad, 3),
          aimX: aimLength > 0.22 ? aimX / aimLength : 0,
          aimY: aimLength > 0.22 ? aimY / aimLength : 0,
        };
      }
    }
    // Pointer devices belong to the first crew seat, even when its selected
    // keyboard or controller binding has been changed in Local crew.
    if (primary) {
      const touch = this.touchFrame();
      frame.move = clamp(frame.move + touch.move, -1, 1);
      frame.jump ||= touch.jump;
      frame.shoot ||= touch.shoot;
      frame.special ||= touch.special;
      if (touch.shoot || touch.aimX || touch.aimY) {
        frame.aimX = touch.aimX;
        frame.aimY = touch.aimY;
      }
      if (this.mouse.active && this.aimAt) {
        Object.assign(frame, this.aimAt(this.mouse.x, this.mouse.y));
        frame.shoot ||= this.mouse.down || this.mouse.pressed;
        this.mouse.pressed = false;
      }
    }
    return frame;
  }
}
