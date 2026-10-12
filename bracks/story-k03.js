(function (root, factory) {
  'use strict';
  const story = factory();
  if (typeof module === 'object' && module.exports) module.exports = story;
  else root.FightStoryK03 = story;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return {
    location: 'Level Two · 2422 · The dry tank under the laundry ring',
    intro: [
      {speaker: 'Narrator', text: 'A round concrete tank, empty for twenty years. Thirty-three degrees, and an echo that gives every punch back twice.'},
      {speaker: 'Narrator', text: "The crowd stands on the rim and looks down. Down there, there's nowhere to go but round."},
      {speaker: 'Kobb', text: "Four days' rations. Winner takes eight."},
      {speaker: 'Kobb', text: "That's Yann. Fits pipes in the shafts. Reaches things nobody else can."},
      {speaker: 'Erek', text: 'How far?'},
      {speaker: 'Kobb', text: 'Far. Then sometimes not far at all. Watch which.'}
    ],
    victory: [
      {speaker: 'Narrator', text: 'Yann sits down against the curve of the wall. The echo takes a moment to stop.'},
      {speaker: 'Yann', text: 'You stopped stepping back.'},
      {speaker: 'Erek', text: 'Only for the long one.'},
      {speaker: 'Kobb', text: 'Eight days. Count them.'},
      {speaker: 'Kobb', text: "Somebody asked me your name tonight. I said I didn't know it. They wrote it down anyway."}
    ],
    defeat: [
      {speaker: 'Narrator', text: 'The long one came from further away than he thought. The tank gave it back twice.'},
      {speaker: 'Kobb', text: 'Four days gone. Again?'}
    ],
    rematch: [{speaker: 'Kobb', text: "Same stake. He's not going anywhere."}],
    training: "When he rocks back on his heel, the long one's coming: guard. When his shoulder drops, the short one: step back, then hit him.",
    feedback: [
      'You stepped back from the long one. It reaches you anyway. Guard it.',
      'You guarded the short one and he kept you there. Step out of reach instead.',
      'You mixed them up. Heel back means long. Shoulder down means short.',
      'You waited too long after the short one. Step back, then straight in.'
    ]
  };
});
