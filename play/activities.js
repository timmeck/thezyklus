/* Episode-one adaptations. Fictional sample readings illustrate the observed range. */
(() => {
  'use strict';
  const host = document.createElement('section');
  host.id = 'activities'; host.hidden = true; host.setAttribute('role', 'dialog');
  host.setAttribute('aria-modal', 'true'); host.setAttribute('aria-labelledby', 'activityTitle');
  document.querySelector('main').append(host);
  let type, callback, completed = false, raf = 0, previousFocus, offsets, stage, moving, started, position, from, target, moveStart, canAdvance = false;
  const $ = s => host.querySelector(s);
  function finish() { if (!completed) { completed = true; if (callback) callback(type); } }
  function close() {
    if (host.hidden) return;
    host.hidden = true; cancelAnimationFrame(raf); callback = null;
    window.dispatchEvent(new Event('activity-close'));
    if (previousFocus?.isConnected) previousFocus.focus();
  }
  function shell(kicker, title, subtitle, body) {
    host.innerHTML = `<div class="activity-shell"><div class="activity-head"><div><small>${kicker}</small><h2 id="activityTitle">${title}</h2><p>${subtitle}</p></div><button class="activity-exit" aria-label="Return to the city">Return to the city <span>×</span></button></div>${body}<div class="activity-foot"><span>ZYKLUS · EPISODE 01</span><span>ESC · Return to the city</span></div></div>`;
    $('.activity-exit').onclick = close;
  }
  function measure() {
    offsets = [0, 0];
    shell('UNIVERSITY · LIAN’S NOTES', 'The numbers do not add up.', 'Check the instruments. Then compare what goes in with what comes out.', `
      <div class="measure-workspace"><div class="measure-machines">
        ${['INPUT', 'OUTPUT', 'REFERENCE'].map((label, i) => `<div class="measure-machine"><div class="instrument-screws">● <span>●</span></div><small>0${i + 1} / ${label}</small><div class="instrument-dial"><span class="dial-line"></span><span class="dial-needle" data-needle="${i}"></span><span class="dial-center"></span></div><output class="instrument-value" data-value="${i}"></output><span class="instrument-unit">HEAT UNITS</span><div class="instrument-calibration">${i < 2 ? `<span>Zero reading: <b data-zero="${i}"></b></span><div class="instrument-controls"><button data-offset="${i}" data-delta="-1" aria-label="${label} — decrease correction">−</button><output data-offset-value="${i}">0</output><button data-offset="${i}" data-delta="1" aria-label="${label} — increase correction">+</button></div>` : '<span class="reference-ok">● REFERENCE STABLE</span><p>Zero reading 0<br>Reference value 1000</p>'}</div></div>`).join('')}
      </div><aside class="measure-notes"><small>PROBLEM 11</small><h3>Measurement error?</h3><p>An instrument must read <strong>0</strong> when tested at zero. Use the correction buttons to adjust both instruments.</p><div class="measure-formula">Missing heat ÷ input × 100</div><label for="measureAnswer">How much is missing in this sample?</label><div class="measure-answer"><input id="measureAnswer" type="number" min="0" max="100" step="0.1" inputmode="decimal" placeholder="0.0"><span>%</span></div><button class="activity-primary" id="measureCheck">Check calculation</button><p class="measure-sample">Game sample. In the episode, Lian reports 1.5–2% missing over three years.</p></aside></div><div class="activity-feedback" id="activityFeedback" role="status">Both zero readings are wrong. Start with calibration.</div>`);
    host.querySelectorAll('[data-offset]').forEach(b => b.onclick = () => {
      const i = +b.dataset.offset; offsets[i] = Math.max(-6, Math.min(6, offsets[i] + +b.dataset.delta)); renderMeasure();
    });
    $('#measureCheck').onclick = () => {
      const feedback = $('#activityFeedback');
      if (offsets[0] !== -3 || offsets[1] !== 2) { feedback.textContent = 'The instruments are not ready. Set both zero readings to 0.'; return; }
      const raw = $('#measureAnswer').value.trim();
      if (!raw || Math.abs(Number(raw.replace(',', '.')) - 1.6) > .001) { feedback.textContent = 'After calibration, 16 of 1000 units are missing. Divide 16 by 1000, then multiply by 100.'; return; }
      feedback.innerHTML = '<strong>CALCULATION CHECKED</strong> · 1.6% is missing. The instruments agree. The question remains: where does the heat go?';
      host.classList.add('activity-solved'); host.querySelectorAll('[data-offset]').forEach(b => b.disabled = true); $('#measureAnswer').disabled = true; $('#measureCheck').textContent = 'Recorded in notebook'; $('#measureCheck').disabled = true; finish();
    };
    renderMeasure();
  }
  function renderMeasure() {
    [1003 + offsets[0], 982 + offsets[1], 1000].forEach((v, i) => { $(`[data-value="${i}"]`).textContent = v; $(`[data-needle="${i}"]`).style.transform = `rotate(${(v - 990) * 2}deg)`; });
    [3 + offsets[0], -2 + offsets[1]].forEach((v, i) => { $(`[data-zero="${i}"]`).textContent = v > 0 ? '+' + v : v; $(`[data-zero="${i}"]`).className = v === 0 ? 'zero-ok' : ''; $(`[data-offset-value="${i}"]`).textContent = offsets[i] > 0 ? '+' + offsets[i] : offsets[i]; });
    if (!completed && offsets[0] === -3 && offsets[1] === 2) $('#activityFeedback').textContent = 'Both zero readings are correct. Input: 1000. Output: 984. Compare the readings.';
  }
  function delivery() {
    stage = 0; moving = false; canAdvance = false; position = 25; started = performance.now();
    shell('THE DELIVERY CORRIDOR · LEVEL TEN', 'Wait for the moment.', 'Three short moves to the door. Watch the light. Move when it goes dark.', `
      <div class="delivery-scene"><div class="delivery-grade"></div><div class="delivery-scan"></div><div class="delivery-topline"><span>THE DELIVERY CORRIDOR</span><span class="delivery-phase" id="deliveryPhase">READY</span></div><div class="delivery-waypoints">${[25, 50, 73, 90].map((x, i) => `<span style="left:${x}%" data-station="${i}"><i></i>${i ? '0' + i : 'START'}</span>`).join('')}</div><div class="delivery-lian"><div></div></div><div class="delivery-vignette"></div></div>
      <div class="delivery-dashboard"><div><small>SIGNAL LIGHT</small><div class="delivery-phasebar"><i></i></div><p id="deliveryAdvice">Wait for the light to go dark.</p></div><div class="delivery-progress"><span>PASSAGE</span><strong id="deliveryCount">0 <em>/ 3</em></strong></div><button class="activity-primary" id="deliveryAdvance">Move · Space</button></div><div class="activity-feedback" id="activityFeedback" role="status">Watch the light change. Each move takes just over half a second.</div>`);
    $('#deliveryAdvance').onclick = advance;
    raf = requestAnimationFrame(drawDelivery);
  }
  function phaseAt(now) { return ((now - started) % 4400) / 4400; }
  function isSafe(now) { const p = phaseAt(now); return p >= .48 && p < .92; }
  function advance() {
    if (type !== 'delivery' || moving || completed) return;
    const now = performance.now();
    if (!canAdvance) { $('#activityFeedback').textContent = 'Too soon. Lian returns to the first cover. Wait for the next dark interval.'; $('.delivery-scene').classList.add('delivery-caught'); stage = 0; position = 25; renderStations(); return; }
    $('.delivery-scene').classList.remove('delivery-caught'); moving = true; from = position; target = [25, 50, 73, 90][stage + 1]; moveStart = now; $('#deliveryAdvance').disabled = true;
  }
  function renderStations() { $('#deliveryCount').innerHTML = `${stage} <em>/ 3</em>`; host.querySelectorAll('[data-station]').forEach(e => e.classList.toggle('reached', +e.dataset.station <= stage)); }
  function drawDelivery(now) {
    if (host.hidden || type !== 'delivery') return;
    const p = phaseAt(now), safe = isSafe(now), enough = safe && p <= .77;
    canAdvance = enough;
    $('.delivery-scene').classList.toggle('delivery-safe', safe || completed);
    $('#deliveryPhase').textContent = completed ? 'WAY CLEAR' : enough ? 'MOVE NOW' : safe ? 'LIGHT RETURNING' : 'STAY IN COVER';
    $('.delivery-phasebar i').style.width = `${p * 100}%`;
    $('#deliveryAdvice').textContent = completed ? 'You are through.' : enough ? 'The light is dark. Time for one move.' : 'Stay still. Watch the light.';
    if (moving) {
      const t = Math.min(1, (now - moveStart) / 600); position = from + (target - from) * t;
      if (t === 1) { moving = false; stage++; renderStations(); $('#deliveryAdvance').disabled = false; $('#activityFeedback').textContent = 'In cover. Watch the light before moving again.';
        if (stage === 3) { $('#activityFeedback').innerHTML = '<strong>DOOR REACHED</strong> · Lian is through. For once, an ordinary route is enough.'; $('#deliveryAdvance').disabled = true; $('#deliveryAdvance').textContent = 'Through safely'; host.classList.add('activity-solved'); finish(); }
      }
    }
    $('#deliveryAdvance').disabled = moving || completed || !enough;
    $('.delivery-lian').style.left = `${position}%`; $('.delivery-lian').classList.toggle('walking', moving);
    raf = requestAnimationFrame(drawDelivery);
  }
  window.zyklusActivities = { open(nextType, onComplete) {
    if (!['measure', 'delivery'].includes(nextType)) return;
    cancelAnimationFrame(raf); previousFocus = document.activeElement; type = nextType; callback = onComplete; completed = false; host.classList.remove('activity-solved'); host.hidden = false;
    if (type === 'measure') measure(); else delivery();
    $('.activity-exit').focus();
  }, close };
  document.addEventListener('keydown', e => {
    if (host.hidden) return;
    e.stopImmediatePropagation();
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Enter' && type === 'measure' && document.activeElement === $('#measureAnswer')) { e.preventDefault(); $('#measureCheck').click(); }
    if (e.code === 'Space' && type === 'delivery') { e.preventDefault(); if (!e.repeat) advance(); }
    if (e.key === 'Tab') {
      const els = [...host.querySelectorAll('button:not(:disabled),input:not(:disabled)')]; const first = els[0], last = els.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, true);
  document.addEventListener('keyup', e => { if (!host.hidden) e.stopImmediatePropagation(); }, true);
})();


