(function (root, factory) {
  'use strict';
  const story = factory();
  if (typeof module === 'object' && module.exports) module.exports = story;
  else root.FightStory = story;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return {
    location: 'Level Two · 2422 · The pump room under Hall Seven',
    intro: [
      {speaker: 'Narrator', text: "Forty-four degrees. A chalk circle on the concrete. Forty people sitting on the pipes, and not one of them was ever here."},
      {speaker: 'Narrator', text: "Erek Bracks is eighteen. He isn't here for the crowd. He's here so there's food at home on Thursday."},
      {speaker: 'Kobb', text: "Stake's two days' rations. Winner takes four."},
      {speaker: 'Kobb', text: 'One rule. Nothing that shows on Monday. Every bruise costs somebody something.'},
      {speaker: 'Erek', text: 'Fine.'},
      {speaker: 'Kobb', text: "That's Hask. Loads crates in the shaft. Hits like he's lifting one."},
      {speaker: 'Kobb', text: 'Watch his shoulder.'}
    ],
    victory: [
      {speaker: 'Narrator', text: 'Hask sits down on the concrete, and stays there.'},
      {speaker: 'Kobb', text: 'Four days. Count them in front of me.'},
      {speaker: 'Erek', text: 'I can count.'},
      {speaker: 'Narrator', text: "Up on the pipes, somebody writes his name down. He doesn't see who."}
    ],
    defeat: [
      {speaker: 'Narrator', text: "The concrete is warm. That's the first thing he notices."},
      {speaker: 'Kobb', text: 'Two days gone. Want them back?'}
    ],
    rematch: [{speaker: 'Kobb', text: 'Same stake. Same Hask.'}],
    training: 'When his shoulder goes back, step away. When his arm hangs, hit him.',
    feedback: [
      'You hit while his shoulder was going back. Step away first.',
      'You stayed in front of him. When the shoulder goes back, get out of reach.',
      "You waited too long. When his arm hangs, that's your moment.",
      'You were out of breath. Stand back, let it come back, then go in.'
    ]
  };
});
