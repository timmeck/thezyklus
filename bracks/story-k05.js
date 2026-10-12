(function (root, factory) {
  'use strict';
  const story = factory();
  if (typeof module === 'object' && module.exports) module.exports = story;
  else root.FightStoryK05 = story;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return {
    location: 'Level Two · 2422 · The bakehouse in the night kitchens',
    intro: [
      {speaker:'Narrator', text:'The bakehouse, between the night batch and the morning one. The ovens are banked. Forty-three degrees, and a red line of light round every door.'},
      {speaker:'Narrator', text:"Twenty-five people leaning on the dough troughs. They'll all go home with flour on them."},
      {speaker:'Kobb', text:"Six days' rations. Winner takes twelve."},
      {speaker:'Kobb', text:"That's Petra. Nights in here. Puts the bread in. Knocks the dough back."},
      {speaker:'Erek', text:'And?'},
      {speaker:'Kobb', text:'Stands one way for each. Fights the same.'}
    ],
    victory: [
      {speaker:'Narrator', text:'Petra sits down on a flour sack. The white comes up round her and settles again.'},
      {speaker:'Petra', text:'You knew which.'},
      {speaker:'Erek', text:'You told me.'},
      {speaker:'Kobb', text:'Twelve days. Count them.'}
    ],
    defeat: [
      {speaker:'Narrator', text:"There's flour on his back. That brushes off."},
      {speaker:'Kobb', text:'Six days gone. Again?'}
    ],
    rematch: [{speaker:'Kobb', text:"Same stake. First batch isn't till five."}],
    training: 'Tall and side-on: one long one. Guard it. Low and wide: two short ones. Step back and let both go. When her hands go to her back, hit her.',
    feedback: [
      'You stepped back when she stood tall. The long one reaches you anyway. Guard it.',
      'You went in after the first low one. Low means two. Let both go.',
      'You guarded the low ones until there was nothing left. Step back from those. Save your guard for the long one.',
      'Her hands went to her back and you were still out of reach. Step in then, and hit her.'
    ]
  };
});
