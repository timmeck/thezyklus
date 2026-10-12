(function (root, factory) {
  'use strict';
  const story = factory();
  if (typeof module === 'object' && module.exports) module.exports = story;
  else root.FightStoryK04 = story;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return {
    location: 'Level Two · 2422 · The old cold store behind the night kitchens',
    intro: [
      {speaker:'Narrator', text:'A cold store. The cold went years ago. The walls kept the heat instead. Thirty-nine degrees, and no echo at all.'},
      {speaker:'Narrator', text:"The lights still work, every one of them. Twelve people on the empty shelves, collars up. The light's too good for more."},
      {speaker:'Kobb', text:"Five days' rations. Winner takes ten."},
      {speaker:'Kobb', text:"That's Lutz. Tests pipe joints. Pumps them up and waits for the one that gives."},
      {speaker:'Kobb', text:'Fourteen years in here. Never once had a mark on Monday.'},
      {speaker:'Erek', text:'Never?'},
      {speaker:'Kobb', text:"He doesn't come to you. See the drain? Cross it, and he will."}
    ],
    victory: [
      {speaker:'Narrator', text:"Lutz sits down on the lowest shelf and puts his ear defenders on. For him, it's over when he can't hear it."},
      {speaker:'Lutz', text:'You let me come to you.'},
      {speaker:'Erek', text:'Only as far as the drain.'},
      {speaker:'Kobb', text:'Ten days. Count them.'},
      {speaker:'Kobb', text:'Somebody had five on you tonight. First time anyone has.'}
    ],
    defeat: [
      {speaker:'Narrator', text:"He stood on the drain one breath too long. In here, nothing echoes. There's just the floor."},
      {speaker:'Kobb', text:'Five days gone. Again?'}
    ],
    rematch: [{speaker:'Kobb', text:"Same stake. He'll still be behind the drain."}],
    training: "He won't come to you. Step over the drain. When his arms come apart, get back behind it. While he's bent over the drain, hit him.",
    feedback: [
      "You hit his arms. They don't open for that. Step over the drain instead.",
      'You guarded when his arms came apart. That one goes through. Get back behind the drain.',
      'You stayed on his side of the drain. When his arms come apart, step back.',
      "You waited too long after he missed. While he's bent over the drain, hit him."
    ]
  };
});
