const EMPTY_INPUT = Object.freeze({
  move: 0,
  jump: false,
  shoot: false,
  special: false,
  aimY: 0,
});
const KEYBOARD_BINDINGS = Object.freeze({
  keyboard1: {
    left: "KeyA",
    right: "KeyD",
    jump: ["KeyW", "Space"],
    shoot: "KeyF",
    special: "KeyG",
  },
  keyboard2: {
    left: "ArrowLeft",
    right: "ArrowRight",
    jump: ["ArrowUp"],
    shoot: "KeyK",
    special: "KeyL",
  },
  keyboard3: {
    left: "KeyN",
    right: "KeyM",
    jump: ["KeyH"],
    shoot: "KeyY",
    special: "KeyU",
  },
  keyboard4: {
    left: "Numpad4",
    right: "Numpad6",
    jump: ["Numpad8"],
    shoot: "Numpad0",
    special: "NumpadDecimal",
  },
});
const GAMEPLAY_KEYS = new Set(
  Object.values(KEYBOARD_BINDINGS).flatMap((binding) => [
    binding.left,
    binding.right,
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
  }

  setTouch(action, value) {
    if (action === "move") this.touch.move = clamp(value, -1, 1);
    else if (action === "aimY") this.touch.aimY = clamp(value, -0.65, 0.65);
    else if (action === "jump" || action === "shoot" || action === "special"){
      if(value&&!this.touch[action])this.touchPresses.add(action);
      this.touch[action] = Boolean(value);
    }
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
      if(this.active&&(pad.buttons?.some(b=>b.pressed)||pad.axes?.some(v=>Math.abs(v)>.25)))this.onInputMethod('gamepad',pad.index);
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

  read(binding = "keyboard1") {
    if (
      !this.active ||
      this.suspended ||
      dialogOpen() ||
      editable(globalThis.document?.activeElement)
    )
      return { ...EMPTY_INPUT };
    if (binding === "touch") {
      const frame={...this.touch};
      for(const action of this.touchPresses)frame[action]=true;
      this.touchPresses.clear();return frame;
    }
    const keyboard = KEYBOARD_BINDINGS[binding];
    if (keyboard) {
      const frame = {
        move:
          Number(this.keys.has(keyboard.right)) -
          Number(this.keys.has(keyboard.left)),
        jump: keyboard.jump.some((key) => this.keys.has(key)),
        shoot:
          this.keys.has(keyboard.shoot) ||
          (binding === "keyboard3" && this.keys.has("KeyZ")),
        special: this.keys.has(keyboard.special),
        aimY: 0,
      };
      if (binding === "keyboard1") {
        frame.move = clamp(frame.move + this.touch.move, -1, 1);
        frame.jump ||= this.touch.jump;
        frame.shoot ||= this.touch.shoot;
        frame.special ||= this.touch.special;
        for(const action of this.touchPresses)frame[action]=true;
        this.touchPresses.clear();
        frame.aimY = this.touch.aimY;
      }
      return frame;
    }
    const match = /^gamepad([0-3])$/.exec(binding);
    const pad = match ? this.gamepads.get(Number(match[1])) : null;
    if (!pad) return { ...EMPTY_INPUT };
    const dpad = Number(buttonDown(pad, 15)) - Number(buttonDown(pad, 14));
    return {
      move: dpad || stick(pad.axes?.[0]),
      jump: buttonDown(pad, 0),
      shoot: buttonDown(pad, 2) || buttonDown(pad, 7),
      special: buttonDown(pad, 1) || buttonDown(pad, 3),
      aimY: stick(pad.axes?.[1]) * 0.65,
    };
  }
}
