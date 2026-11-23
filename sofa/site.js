// Please Mind the Sofa · kleine Dinge, die ohne JavaScript nur fehlen, nicht kaputtgehen.
(() => {
  const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1 · Video erst auf Klick (youtube-nocookie), Kapitel springen mit
  const player = document.querySelector('.player');
  const spiel = (t = 0) => {
    if (!player) return;
    const id = player.dataset.yt;
    player.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&start=${t}&rel=0&cc_load_policy=1" title="Please Mind the Sofa · Episode 1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  };
  player?.querySelector('.player-start')?.addEventListener('click', () => spiel(0));
  document.querySelectorAll('.chapters button').forEach(b => b.addEventListener('click', () => {
    spiel(+b.dataset.t); player.scrollIntoView({behavior: ruhig ? 'auto' : 'smooth', block: 'center'});
  }));

  // 2 · Karten umdrehen
  document.querySelectorAll('.card-inner').forEach(b => b.addEventListener('click', () => {
    const c = b.closest('.card'); c.classList.toggle('turned');
    b.setAttribute('aria-pressed', c.classList.contains('turned'));
  }));

  // 3 · Applaus-Schild leuchtet, wenn man daran vorbeiscrollt
  const strip = document.querySelector('.applause-strip');
  if (strip && 'IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { strip.classList.add('lit'); setTimeout(() => strip.classList.remove('lit'), 1800); }
    }), {threshold: 1}).observe(strip);
  }

  // 4 · Lichtadern lesen
  const fig = document.getElementById('vein-figure'), txt = document.getElementById('mood-text');
  const T = {
    gold: '<b>Gold: proud.</b> Someone has just said “three hundred and twelve”. Possibly him.',
    ash: '<b>Ash: deflated.</b> Gerald has mentioned the new machine again.',
    coral: '<b>Coral: tender.</b> He will deny it. The veins will not.',
    blue: '<b>Blue: sad.</b> Also, the fridge thinks it is winter.',
    blink: '<b>Flicker: he is lying.</b> Badly. Everyone in the room already knows.'
  };
  const knoepfe = [...document.querySelectorAll('.moods button')];
  const setze = b => {
    knoepfe.forEach(k => k.setAttribute('aria-checked', k === b));
    fig.dataset.mood = b.dataset.mood; txt.innerHTML = T[b.dataset.mood];
  };
  knoepfe.forEach((b, i) => {
    b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
    b.addEventListener('click', () => setze(b));
    b.addEventListener('keydown', e => {
      const d = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[e.key]; if (!d) return;
      e.preventDefault(); const n = knoepfe[(i + d + knoepfe.length) % knoepfe.length];
      knoepfe.forEach(k => k.tabIndex = -1); n.tabIndex = 0; n.focus(); setze(n);
    });
  });

  // 5 · Hausregel 1: das Sofa an der Leine
  const basin = document.getElementById('basin'); if (!basin) return;
  const svg = basin.querySelector('svg'), sofa = document.getElementById('sofa'), rope = document.getElementById('rope');
  const note = document.getElementById('sofa-note'), reset = document.getElementById('sofa-reset');
  const RUHE = 330, LEINE = 270, BOLLER = {x: 71, y: 140};
  let x = RUHE, v = 0, ziel = RUHE, zieht = false, los = false, wipp = 0, t0 = performance.now();
  const saetze = ['Drag the sofa. Gently.', 'The leash holds. For now.', 'Careful. That rope is older than Ben.', 'Please. Mind. The sofa.'];
  const punkt = e => { const r = svg.getBoundingClientRect(); return (e.clientX - r.left) * 800 / r.width; };
  const zeichne = now => {
    wipp = ruhig ? 0 : Math.sin((now - t0) / 700) * 3;
    const y = 150 + wipp;
    sofa.setAttribute('transform', `translate(${x} ${y}) rotate(${ruhig ? 0 : Math.sin((now - t0) / 900) * 1.6 + v * .08})`);
    const ex = x - 118, ey = y + 16, spann = Math.min(1, Math.max(0, (ex - BOLLER.x) / LEINE));
    const durch = 40 * (1 - spann);
    rope.setAttribute('d', `M${BOLLER.x} ${BOLLER.y} Q ${(BOLLER.x + ex) / 2} ${Math.max(BOLLER.y, ey) + durch} ${ex} ${ey}`);
    rope.style.stroke = spann > .92 ? '#e2463a' : '';
    sofa.setAttribute('aria-valuenow', Math.round((x - 200) / 6));
  };
  const schritt = now => {
    if (los) { v += .02; x += v; if (x > 980) x = 980; }
    else if (!zieht) { v += (ziel - x) * .02; v *= .9; x += v; }
    zeichne(now); requestAnimationFrame(schritt);
  };
  const reiss = () => {
    los = true; basin.classList.add('lost'); reset.hidden = false; v = 2;
    note.textContent = 'You untied the leash. You lost the sofa. (Rule 1.)';
  };
  const bewege = nx => {
    if (los) return;
    x = Math.max(200, nx);
    const ex = x - 118, dehn = (ex - BOLLER.x) / LEINE;
    note.textContent = saetze[Math.min(3, Math.max(0, Math.floor(dehn * 4 - 1)))];
    if (dehn > 1.3) reiss();
  };
  sofa.addEventListener('pointerdown', e => { if (los) return; zieht = true; sofa.setPointerCapture(e.pointerId); });
  sofa.addEventListener('pointermove', e => { if (zieht) bewege(punkt(e)); });
  const ende = () => { zieht = false; v = 0; };
  sofa.addEventListener('pointerup', ende); sofa.addEventListener('pointercancel', ende);
  sofa.addEventListener('keydown', e => {
    const d = {ArrowRight: 18, ArrowLeft: -18}[e.key]; if (!d) return;
    e.preventDefault(); zieht = true; bewege(x + d); clearTimeout(sofa._t); sofa._t = setTimeout(ende, 400);
  });
  reset.addEventListener('click', () => {
    los = false; basin.classList.remove('lost'); reset.hidden = true; x = -150; v = 0; ziel = RUHE;
    note.textContent = 'Retrieved from floor three. Again.'; sofa.focus();
  });
  requestAnimationFrame(schritt);
})();
