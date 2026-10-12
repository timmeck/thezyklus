(function (root, factory) {
  'use strict';
  const story = factory();
  if (typeof module === 'object' && module.exports) module.exports = story;
  else root.FightStoryK02 = story;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return {
    location: 'Level Two · 2422 · The press cellar under Section Three',
    intro: [
      {speaker: 'Narrator', text: 'Every four seconds the big press comes down overhead. The lamp swings. Dust comes off the ceiling. Up there, nobody hears a thing.'},
      {speaker: 'Narrator', text: 'Three weeks since the pump room. The bruise is on his ribs, where nobody looks on Monday.'},
      {speaker: 'Kobb', text: "Three days' rations. Winner takes six."},
      {speaker: 'Kobb', text: "That's Zarr. Nights on the big press. Feed, stamp. Feed, stamp."},
      {speaker: 'Kobb', text: 'She never hits once.'},
      {speaker: 'Erek', text: 'Meaning what.'},
      {speaker: 'Kobb', text: "Meaning there's always a second one."}
    ],
    victory: [
      {speaker: 'Narrator', text: "The press comes down. Zarr doesn't get up with it."},
      {speaker: 'Zarr', text: 'You waited for the second.'},
      {speaker: 'Erek', text: 'Always two.'},
      {speaker: 'Kobb', text: 'Six days. Count them.'},
      {speaker: 'Narrator', text: "On the stair, a man in a clean shirt watches a moment too long. By the time the lamp swings back, he's gone."}
    ],
    defeat: [
      {speaker: 'Narrator', text: 'The second one always lands. Everybody in the cellar knew that. Now he does too.'},
      {speaker: 'Kobb', text: 'Three days gone. Again?'}
    ],
    rematch: [{speaker: 'Kobb', text: "Same stake. She's on till six."}],
    training: "When both her fists come up, two are coming. Don't answer the first. When she shakes her hands out, hit her.",
    feedback: [
      "You hit back after her first punch. There's always a second. Wait for it.",
      'You dropped your guard after one. Keep it up until both have gone.',
      "You waited too long. When she shakes her hands out, that's your moment.",
      'She pushed you back to the wall. Step away before her fists come up.'
    ]
  };
});
