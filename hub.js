// Progressive enhancement only: show the door nearest the viewport centre.
const legacy = ['watch', 'play', 'world', 'people'];
function redirectLegacy() {
 const anchor = location.hash.slice(1);
 if (legacy.includes(anchor)) location.replace('zyklus/#' + anchor);
}
redirectLegacy();
window.addEventListener('hashchange', redirectLegacy);
const stops = [...document.querySelectorAll('.time-stop')];
if ('IntersectionObserver' in window) {
 const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting));
 }, { rootMargin: '-15% 0px -20% 0px', threshold: 0.12 });
 stops.forEach(stop => observer.observe(stop));
}
