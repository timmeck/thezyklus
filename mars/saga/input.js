export class Input {
  constructor() {
    this.keys = new Set();
    this.touch = { x: 0, y: 0, jump: false, line: false, action: false };
    this.edges = {};
    this.padPrevious = [];
    this.enabled = false;
    const bindings = {
      Space: "jump",
      KeyE: "action",
      KeyX: "line",
      ShiftLeft: "line",
      Escape: "pause",
      KeyM: "map",
    };
    window.addEventListener("keydown", (event) => {
      if (!this.enabled || event.target.matches("input,select,textarea"))
        return;
      if (
        ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          event.code,
        )
      )
        event.preventDefault();
      if (!this.keys.has(event.code) && bindings[event.code])
        this.edges[bindings[event.code]] = true;
      this.keys.add(event.code);
    });
    window.addEventListener("keyup", (event) => this.keys.delete(event.code));
    window.addEventListener("blur", () => this.clear());
    for (const action of ["jump", "line", "action"]) {
      const button = document.getElementById(`touch-${action}`);
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        this.touch[action] = true;
        this.edges[action] = true;
        button.dataset.held = "true";
      });
      const release = () => {
        this.touch[action] = false;
        if(action==='action')this.touch.aimX=this.touch.aimY=0;
        delete button.dataset.held;
      };
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("lostpointercapture", release);
    }
    const fire=document.getElementById('touch-action');
    fire.addEventListener('pointermove',event=>{if(!this.touch.action)return;const b=fire.getBoundingClientRect();const dx=(event.clientX-b.x-b.width/2)/45,dy=(event.clientY-b.y-b.height/2)/45,len=Math.max(1,Math.hypot(dx,dy));this.touch.aimX=dx/len;this.touch.aimY=dy/len;});
    const stick = document.getElementById("stick");
    let pointer = null;
    const move = (event) => {
      if (event.pointerId !== pointer) return;
      const box = stick.getBoundingClientRect(),
        dx = (event.clientX - box.x - box.width / 2) / (box.width * 0.34),
        dy = (event.clientY - box.y - box.height / 2) / (box.height * 0.34),
        length = Math.max(1, Math.hypot(dx, dy));
      this.touch.x = Math.abs(dx) > 0.15 ? dx / length : 0;
      this.touch.y = Math.abs(dy) > 0.15 ? dy / length : 0;
      stick.style.setProperty("--dx", `${this.touch.x * 28}px`);
      stick.style.setProperty("--dy", `${this.touch.y * 28}px`);
    };
    stick.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      pointer = event.pointerId;
      stick.setPointerCapture(pointer);
      move(event);
    });
    stick.addEventListener("pointermove", move);
    const release = () => {
      pointer = null;
      this.touch.x = this.touch.y = 0;
      stick.style.setProperty("--dx", "0px");
      stick.style.setProperty("--dy", "0px");
    };
    stick.addEventListener("pointerup", release);
    stick.addEventListener("pointercancel", release);
    stick.addEventListener("lostpointercapture", release);
  }
  clear() {
    this.keys.clear();
    for (const key of Object.keys(this.touch))
        this.touch[key] = ["x","y","aimX","aimY"].includes(key) ? 0 : false;
    this.edges = {};
    this.arena?.clear();
    const pad = [...(navigator.getGamepads?.() || [])].find(Boolean);
    this.padPrevious = pad ? pad.buttons.map((button) => button.pressed) : [];
  }
  read() {
    const has = (...codes) => codes.some((code) => this.keys.has(code));
    const pad = [...(navigator.getGamepads?.() || [])].find(Boolean);
    const buttons = pad ? pad.buttons.map((button) => button.pressed) : [];
    const axis = (value) => (Math.abs(value || 0) > 0.18 ? value : 0);
    const pressed = (index) => buttons[index] && !this.padPrevious[index];
    const movementX=this.touch.x||axis(pad?.axes[0])||Number(buttons[15]||has('KeyD','ArrowRight'))-Number(buttons[14]||has('KeyA','ArrowLeft'));
    const movementY=this.touch.y||axis(pad?.axes[1])||Number(buttons[13]||has('KeyS','ArrowDown'))-Number(buttons[12]||has('KeyW','ArrowUp'));
    const useHeld=Boolean(this.touch.action||has('KeyE')||buttons[2]);
    const result = {
      x:movementX,
      y:movementY,
      jump: this.touch.jump || has("Space") || buttons[0],
      jumpPressed: Boolean(this.edges.jump || pressed(0)),
      line: this.touch.line || has("KeyX", "ShiftLeft") || buttons[1],
      actionPressed: Boolean(this.edges.action || pressed(2)),
      shoot: this.touch.action || has("KeyF","KeyE") || buttons[2],
      action: useHeld,
      aimX: axis(pad?.axes[2]), aimY: axis(pad?.axes[3]),
      fire: this.touch.jump || has("Space", "KeyF") || buttons[0],
      winch: this.touch.line || has("KeyX", "ShiftLeft") || buttons[1],
      crouch: movementY > 0.6 || Boolean(buttons[3]),
      pause: Boolean(this.edges.pause || pressed(9)),
      map: Boolean(this.edges.map || pressed(8)),
    };
    if(this.arena && this.duelMode?.()){
      this.arena.setActive(this.enabled);this.arena.pollGamepads();
      this.arena.setTouchStick(this.touch.x,this.touch.y);
      this.arena.setTouchAim(this.touch.aimX||0,this.touch.aimY||0);
      this.arena.setTouch('jump',this.touch.jump);this.arena.setTouch('shoot',this.touch.action);this.arena.setTouch('special',this.touch.line);
      const a=this.arena.read(pad?'gamepad'+pad.index:'keyboard1',true);
      Object.assign(result,{x:a.move||result.x,jumpPressed:a.jump||result.jumpPressed,shoot:a.shoot||result.shoot,line:a.special||result.line,aimX:a.aimX,aimY:a.aimY});
    }
    this.edges = {};
    this.padPrevious = buttons;
    return result;
  }
}
