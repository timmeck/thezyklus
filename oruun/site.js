'use strict';
// Claude may switch this after Tim's game test and copying the game to /oruun/play/.
const PLAY_LIVE = false;
const entry = document.querySelector('#play-entry');
if (PLAY_LIVE && entry) {
  const link = document.createElement('a');
  link.className = 'button primary';
  link.href = '/oruun/play/';
  link.textContent = 'Play UNDER-LID →';
  entry.replaceChildren(link);
}
const jump = document.querySelector('#chapter-jump');
if (jump) jump.hidden = false;
jump?.addEventListener('submit', event => {
  event.preventDefault();
  const value = document.querySelector('#page-jump').value;
  const page = document.getElementById('page-' + value);
  if (page) {
    page.focus({ preventScroll: true });
    page.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    history.replaceState(null, '', '#page-' + value);
  }
});
