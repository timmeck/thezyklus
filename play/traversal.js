(() => {
  'use strict';
  const obstacles = [
    { x: 830, width: 42, height: 22, bottom: 565, kind: 'low', hint: 'Space · Jump over the container' },
    { x: 1020, width: 65, height: 31, bottom: 479, kind: 'overhead', hint: 'S / ↓ · Crouch beneath the container' }
  ];
  function resolve(scene, previousX, nextX, jump, crouch, rolling) {
    if (scene !== 'delivery') return { x: nextX, blocked: false, hint: '' };
    const direction = Math.sign(nextX - previousX);
    const ordered = direction < 0 ? obstacles.slice().reverse() : obstacles;
    for (const obstacle of ordered) {
      const left = obstacle.x - obstacle.width / 2, right = obstacle.x + obstacle.width / 2;
      const pass = obstacle.kind === 'low' ? jump >= 26 : (crouch > .65 || rolling > 0) && jump < 3;
      if (pass) continue;
      if (previousX <= left && nextX > left && direction > 0)
        return { x: left, blocked: true, hint: obstacle.hint };
      if (previousX >= right && nextX < right && direction < 0)
        return { x: right, blocked: true, hint: obstacle.hint };
      // Releasing crouch or landing inside cannot leave the actor embedded.
      // A short correction uses the nearest edge; moving away remains possible.
      if (previousX > left && previousX < right && nextX > left && nextX < right)
        return { x: previousX - left <= right - previousX ? left : right, blocked: true, hint: obstacle.hint };
    }
    return { x: nextX, blocked: false, hint: '' };
  }
  function draw(ctx, images, scene) {
    if (scene !== 'delivery' || !images.cargo?.naturalWidth) return;
    const im = images.cargo;
    ctx.save();
    for (const o of obstacles) {
      const left = o.x - o.width / 2, top = o.bottom - o.height;
      if (o.kind === 'overhead') {
        ctx.lineWidth = 1.7; ctx.strokeStyle = '#626a68';
        ctx.beginPath();
        for (const ropeX of [left + 8, left + o.width - 8]) { ctx.moveTo(ropeX, 214); ctx.lineTo(ropeX, top + 2); }
        ctx.stroke();
      }
      ctx.fillStyle = '#0006'; ctx.beginPath();
      ctx.ellipse(o.x, 566, o.width * .57, 3, 0, 0, Math.PI * 2); ctx.fill();
      // Tight source crop avoids the opaque background around the existing art.
      ctx.drawImage(im, im.naturalWidth * .02, im.naturalHeight * .16,
        im.naturalWidth * .96, im.naturalHeight * .67, left, top, o.width, o.height);
      ctx.fillStyle = '#d1b974'; ctx.fillRect(left + 5, top + 2, 7, 1);
    }
    ctx.restore();
  }
  function requiresDuck(scene,x){return scene==='delivery'&&obstacles.some(o=>o.kind==='overhead'&&x>o.x-o.width/2&&x<o.x+o.width/2)}
  const api = Object.freeze({ resolve, draw, requiresDuck });
  if (typeof window !== 'undefined') window.zyklusTraversal = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
