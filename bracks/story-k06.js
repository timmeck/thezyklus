(function (root, factory) {
  'use strict';
  const story = factory();
  if (typeof module === 'object' && module.exports) module.exports = story;
  else root.FightStoryK06 = story;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return {
    location: "Level Two · 2422 · Behind the barber's",
    intro: [
      {speaker:'Narrator', text:"The back of a barber's, after closing. Forty-two degrees. The chair's pushed to the wall, and there's a cloth over the mirror."},
      {speaker:'Narrator', text:'Fifteen people on the floor along the walls. Somebody swept the hair into a corner first.'},
      {speaker:'Kobb', text:"Seven days' rations. Winner takes fourteen."},
      {speaker:'Kobb', text:"That's Gustav. Cuts hair. Twenty years in here."},
      {speaker:'Erek', text:'So?'},
      {speaker:'Kobb', text:"He'll show you everything he's got. Then he puts two of them together."}
    ],
    victory: [
      {speaker:'Narrator', text:'Gustav sits down in his own chair. He lifts the cloth off the mirror, looks, and puts it back.'},
      {speaker:'Gustav', text:'You looked again.'},
      {speaker:'Erek', text:'Every time.'},
      {speaker:'Kobb', text:'Fourteen days. Count them.'}
    ],
    defeat: [
      {speaker:'Narrator', text:"Now he's on the floor with everybody else."},
      {speaker:'Kobb', text:'Seven days gone. Again?'}
    ],
    rematch: [{speaker:'Kobb', text:"Same stake. He's got nobody booked till nine."}],
    training: 'Arm out and still: the long one. Guard it. Feet together, elbows in: a short one. Step back. After every short one, look again: if the arm goes out, guard. When he steps back behind his arms, wait. When he looks down at his feet, hit him.',
    feedback: [
      'You stepped back when his arm went out. The long one reaches you anyway. Guard it.',
      "You hit him between punches. He wasn't done. Wait until he looks at his feet.",
      "After the short one, his arm went out and you didn't guard. Look again after every short one.",
      'He looked down at his feet and you were still out of reach. Step in then, and hit him.'
    ]
  };
});
