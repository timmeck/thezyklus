// A small correction is available only when the touch stick is at rest.
// Explicit aim vectors, including precision drags, always pass through intact.
export const TOUCH_AIM_ASSIST = Object.freeze({
  cone: Math.PI / 16,
  correction: Math.PI / 32,
  range: 400,
});

export function touchAimAssist(state, fighter, frame, enabled = true) {
  if (!enabled || !frame.shoot || frame.aimX || frame.aimY || !fighter.alive || fighter.respawn > 0)
    return frame;
  const facing = fighter.facing < 0 ? -1 : 1;
  let nearest = null;
  let distance = TOUCH_AIM_ASSIST.range;
  for (const target of state.fighters) {
    if (target === fighter || target.index === fighter.index || !target.alive || target.respawn > 0)
      continue;
    const dx = (target.x - fighter.x) * facing;
    const dy = target.y - fighter.y;
    const reach = Math.hypot(dx, dy);
    if (dx <= 0 || reach >= distance || Math.abs(Math.atan2(dy, dx)) > TOUCH_AIM_ASSIST.cone)
      continue;
    nearest = { x: dx, y: dy };
    distance = reach;
  }
  if (!nearest) return frame;
  const angle = Math.max(-TOUCH_AIM_ASSIST.correction,
    Math.min(TOUCH_AIM_ASSIST.correction, Math.atan2(nearest.y, nearest.x)));
  return { ...frame, aimX: Math.cos(angle) * facing, aimY: Math.sin(angle) };
}
