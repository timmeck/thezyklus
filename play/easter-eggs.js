(() => {
  'use strict';
  const key = 'zyklus-easter-eggs-v1';
  const details = ['emptyDesk','poolNews','pageCorner','wallPlants','wrongSide','audibleAir'];
  function allDetails(progress) { return details.every(id => progress['detail_' + id] === true); }
  function create(storage) {
    let wins = 0, races = 0;
    try {
      const saved = JSON.parse(storage.getItem(key) || '{}');
      const valid = n => Number.isSafeInteger(n) && n >= 0 && n <= 1000000;
      if (valid(saved.wins) && valid(saved.races) && saved.wins <= saved.races) {
        wins = saved.wins; races = saved.races;
      }
    } catch {}
    return {
      get wins() { return wins; },
      get unlocked() { return wins >= 3; },
      recordRace(won) {
        const before = wins;
        races = Math.min(1000000, races + 1);
        if (won === true) wins = Math.min(races, wins + 1);
        try { storage.setItem(key, JSON.stringify({ wins, races })); } catch {}
        return { wins, unlocked: wins >= 3, newlyUnlocked: before < 3 && wins >= 3 };
      },
      allDetails,
      appendReward(parent, progress) {
        if (!allDetails(progress)) return;
        const card = document.createElement('article'); card.className = 'notebook-reward';
        const title = document.createElement('h3'); title.textContent = 'Worth a closer look.';
        const image = document.createElement('img'); image.src = 'notebook-sketch.png';
        image.alt = 'A pencil sketch of the pool, its ladder and stairs.';
        const caption = document.createElement('p'); caption.textContent = 'Six small details. A page to keep.';
        card.append(title, image, caption); parent.append(card);
      }
    };
  }
  if (typeof module !== 'undefined') module.exports = { create, allDetails };
  if (typeof window !== 'undefined') {
    let storage; try { storage = window.localStorage; } catch {}
    window.zyklusEggs = create(storage);
  }
})();
