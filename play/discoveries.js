(() => {
  'use strict';
  // Optional observations. They never replace a chapter objective.
  const entries = [
    { id: 'emptyDesk', scene: 'main', x: 420, requires: ['home'],
      label: 'Remember the empty desk', title: 'Not a single sheet',
      text: 'Mother\'s desk was clean this morning. Not a single sheet of paper. The door was open on a Wednesday. Malin only opens it on Mondays.' },
    { id: 'poolNews', scene: 'main', x: 1170, requires: ['bela'],
      label: 'Remember the news at the pool', title: 'On the wall',
      text: 'The news was running while they had coffee. Juna noticed the investigator on the screen. Lian laughed with the others, without thinking.' },
    { id: 'pageCorner', scene: 'university', x: 545, requires: ['university'],
      label: 'Look at the corner of the page', title: 'Written down anyway',
      text: 'Lian wrote the number in the corner of her page. Between 1.5 and 2%. Three years. Always the same direction. Ravn had finished with the question. She had not.' },
    { id: 'wallPlants', scene: 'outerRing', x: 460, requires: ['bela', 'torenMorning'],
      label: 'Look at the plants', title: 'The longer way',
      text: 'Plants on the walls. Lian takes the longer way home for them. Gardens for people who have never seen a real one.' },
    { id: 'wrongSide', scene: 'delivery', x: 650, requires: ['torenNight'],
      label: 'Look towards the homes', title: 'The wrong side',
      text: 'The delivery corridor runs behind the homes. The same high ceilings. Bright, still air. Through the passages, familiar rooms seen from the wrong side.' },
    { id: 'audibleAir', scene: 'levelNine', x: 550, requires: ['arrivalNine'],
      label: 'Listen to the hall', title: 'You can hear the air',
      text: 'The air moves here. Doors, voices, wagons. The ceiling is 2.70 metres high. Lian does not need to duck. She wants to.' }
  ];
  const journal = Object.freeze(Object.fromEntries(entries.map(({ id, title, text }) => [id, Object.freeze({ title, text })])));
  const lianRecap = Object.freeze([
    Object.freeze({ title: 'The question', text: 'Three years of readings. Heat missing every time. The cause is still unknown.' }),
    Object.freeze({ title: 'One level', text: 'Lian and Toren reached the transfer hall on Level Nine. Two open places on the shift list let them through.' }),
    Object.freeze({ title: 'Somebody thought of them', text: 'After work: two rations, water and a room. They do not know who arranged it. Or why.' })
  ]);
  window.zyklusDiscoveries = Object.freeze({
    spots(scene, progress = {}) {
      return entries.filter(e => e.scene === scene && e.requires.every(key => progress[key] === true))
        .map(({ id, x, label, title, text }) => ({ id, x, label, title, text }));
    },
    journal,
    recap(progress = {}) { return progress.episodeEnd === true ? lianRecap.slice() : []; },
    total: entries.length
  });
})();
