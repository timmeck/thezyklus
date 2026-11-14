// Original MARS game adaptation. Volume additions enter only through release.js.
export const RANKS=['Applicant','Deck Candidate','Recovery Cadet','Camera-Ready Cadet','Gravity Specialist','Decorated Liability','Rescue Officer','Certified Airborne Hero (Provisional)'];
export const COURSE=[
 {id:'lowg',title:'Low-g procedures',section:'01 / KNOW YOUR LEGS',arena:'deck',duration:65,icon:'recovery',
 rule:'Air-jump. Press JUMP after your last air jump to recover. Catch an edge and steer in. Fire ↑ ↓, land 3 hits, use SPECIAL.',
 order:'Use every air jump, then JUMP once more for recovery. Walk off an edge, then steer back to climb. Drag FIRE to aim.',target:'AIR JUMP · RECOVER · CLIMB · AIM ↑ ↓ · 3 HITS · SPECIAL',
 medal:'THE ORDER OF MOSTLY UPRIGHT CONDUCT',commendation:'For occupying several approved altitudes without a reservation.',
 headline:'YOUR CAREER IS LOOKING UP.',copy:'Join the fleet. See the ceiling. Meet it personally.',poll:'97% of floors recommend a softer cadet.'},
 {id:'rescue',title:'Recovery under fire',section:'02 / BRING SOMETHING BACK',arena:'yard',duration:65,icon:'rescue',
 rule:'Touch the yellow practice capsule. Bring it to the cyan recovery bay twice. Your blaster still works.',
 order:'A rescue ends at the bay. The applause starts too early.',target:'DELIVER 2 PRACTICE CAPSULES',
 medal:'THE CROSS OF UNEXPECTEDLY RETURNED EQUIPMENT',commendation:'For returning fleet property with an impressively low number of new corners.',
 headline:'EXCITING RETURN OPPORTUNITIES.',copy:'Our recovery service brings you back. Your dignity travels separately.',poll:'100% of recovered capsules were available for comment.'},
 {id:'camera',title:'Camera suitability',section:'03 / BE SEEN TO SUCCEED',arena:'studio',duration:75,icon:'camera',
 rule:'Only hits made while YOU are inside the gold camera beam earn broadcast points. Earn 10.',
 order:'Work inside the gold beam. The lens has seniority.',target:'10 ON-CAMERA HITS',
 medal:'THE GOLDEN ORDER OF VISIBLE EFFORT',commendation:'For excellent courage within the approved aspect ratio.',
 headline:'COURAGE. NOW IN FRAME.',copy:'An unfilmed achievement is just exercise.',poll:'100% prefer our coverage. Unfilmed opinions excluded.'},
 {id:'centrifuge',title:'Centrifuge discipline',section:'04 / RESPECT THE FLOOR',arena:'gravity',duration:75,icon:'gravity',
 rule:'Stand on a platform for 8 seconds during heavy-g and land 6 hits. Watch the gravity warning.',
 order:'Heavy legs. Small steps. Everyone returns.',target:'8s HEAVY-g FOOTING · 6 HITS',
 medal:'THE DISTINGUISHED SERVICE TO FLOORING',commendation:'For repeatedly confirming that the floor was still present.',
 headline:'GROW YOUR POTENTIAL MASS.',copy:'The fleet gives you weight. The centrifuge collects it.',poll:'9 out of 9 instructors are standing outside the centrifuge.'},
 {id:'medal',title:'Medal bearing under load',section:'05 / CARRY THE GLORY',arena:'deck',duration:75,icon:'medal',
 rule:'The leader wears an increasingly heavy medal. Carry it for 8 seconds and land 10 hits.',
 order:'Lead by example. Brace for the decoration.',target:'8s WITH THE MEDAL · 10 HITS',
 medal:'THE GRAND MEDAL OF MEDAL SUPPORT',commendation:'For carrying the weight of public approval without suitable lifting equipment.',
 headline:'SUCCESS HAS SUBSTANCE.',copy:'Win a medal. Become less mobile. Inspire the competition.',poll:'Medal satisfaction: heavy. Sample size: one neck.'},
 {id:'salvage',title:'Equipment recovery',section:'06 / NOTHING IS SPARE',arena:'airlock',duration:75,icon:'tools',
 rule:'Collect 3 supply drops and land 8 hits. Pressure pulls are announced. Keep a jump in reserve.',
 order:'Bring the equipment home. Preferably with its operator.',target:'3 SUPPLY DROPS · 8 HITS',
 medal:'THE ORDER OF REUSABLE HEROISM',commendation:'For making damaged equipment feel wanted.',
 headline:'A CAREER WITH PARTS.',copy:'Build a brighter future from the previous brighter future.',poll:'98% reusable. Remaining 2% still airborne.'},
 {id:'final',title:'Live audience examination',section:'07 / EVERYONE COMES BACK',arena:'studio',duration:100,icon:'salute',
 rule:'Finish in the top two, land 12 on-camera hits and use 3 specials. The leader carries the medal.',
 order:'Keep your exit. Keep your crew. Give the camera something useful.',target:'TOP 2 · 12 ON-CAMERA HITS · 3 SPECIALS',
 medal:'THE SEVENFOLD ORDER OF EVENTUAL LANDING',commendation:'For exemplary flying, including the portions originally intended as walking.',
 headline:'YOUR FINEST HOUR. EDITED.',copy:'Graduate today. Receive a certificate light enough to survive.',poll:'Public confidence: 100%. Gravity has declined the survey.'}
];

const BASE_FINAL = { ...COURSE[6] };
export function applyVolumeContent(release = {}) {
 Object.assign(COURSE[6], BASE_FINAL);
 delete COURSE[6].examiner;
 delete COURSE[6].examinerSource;
 if (release.available?.includes(2) && release.finalExaminer) {
  const data = release.finalExaminer;
  COURSE[6].examiner = data.name;
  COURSE[6].examinerSource = data.source;
  COURSE[6].copy = data.copy;
  COURSE[6].order = data.order;
 }
 return COURSE;
}

export const SIGNATURES={
 iona:{passive:'FIRST FOOTING',detail:'Air steering is 12% sharper. Long reach; short hesitation.',seal:'RETURN ROUTE / INCLUDED',pitch:'She finds a handhold before the briefing finds a point.'},
 rook:{passive:'RESERVE CONFIDENCE',detail:'Jetpack recharges 25% faster while airborne.',seal:'CONFIDENCE / PRESSURE TESTED',pitch:'Every escape deserves a name longer than the escape.'},
 sera:{passive:'BACK ON YOUR FEET',detail:'Hit stun is 25% shorter. The head count continues.',seal:'ALL CREW / ACCOUNTED FOR',pitch:'She counts people before medals.'},
 tavi:{passive:'SALVAGE INSTINCT',detail:'Collect broken parts after nearby hits: repair 4 strain and recharge tools, once per 3 seconds.',seal:'PREVIOUSLY BROKEN / APPROVED',pitch:'Nothing is scrap until he has complimented the hinge.'},
 beam:{passive:'GOOD LIGHTING',detail:'Heals 1 strain a second while the camera films him.',seal:'INDEPENDENTLY SELF-ENDORSED',pitch:'The worse the landing, the better the lighting.'},
 pip:{passive:'SECOND CHANCE',detail:'A safe landing after an air jump repairs 3 strain, once per 5 seconds.',seal:'STILL HERE / VERIFIED',pitch:'Relief is a perfectly respectable flight technique.'}
};
export const COMMS={
 ringout:['Exemplary remote retrieval!','A record-breaking distance from the problem.','The rescue drone has requested a pay rise.','Excellent! The outside has been inspected.'],
 own:['Tactical self-assessment. Very thorough.','An independent test of the recovery budget.'],
 heavy:['An impact worthy of a larger medal.','Training contact. Promotional enthusiasm.'],
 safety:['CITIZEN SAFETY / Keep all limbs inside your confidence.','CITIZEN SAFETY / Do not salute while holding a tether release.','CITIZEN SAFETY / Falling is permitted. Staying fallen requires supervision.'],
 tickers:['FLEET RECRUITMENT / Free travel. Landing sold separately.','RECOVERY SERVICE / Every cadet returned. Some assembly required.','VICTORY WINDOW / Bringing you the good angle since before this incident.','TRAINING ONLY — PROBABLY / Blasters contain foam and unreasonable expectations.'],
};
export function assess(match,index){
 const f=match.fighters[0],t=match.training,s=f.stats;
 const checks=[[t.travel>=110,Boolean(t.airJump),s.hits>=3,t.specials>=1,Boolean(t.aimUp&&t.aimDown),Boolean(t.recoveryMove),Boolean(t.ledgeClimb)],[t.deliveries>=2],[t.points>=10],[t.heavyTime>=8,s.hits>=6],[t.medalTime>=8,s.hits>=10],[s.pickups>=3,s.hits>=8],[match.rankings.indexOf(0)<2,t.points>=12,t.specials>=3]][index];
 const passed=checks.every(Boolean),merit=s.hits+s.ringouts*4-s.recoveries*2;
 return {passed,checks,grade:passed?(merit>30?'A+':merit>14?'A':'B'):'RETAKE',rank:RANKS[passed?index+1:index],comment:passed?COURSE[index].commendation:'The footage shows potential. The exercise requests evidence.'};
}
export function progressText(state){
 const t=state.training,s=state.fighters[0].stats;
 return {
 lowg:'AIR '+(t.airJump?'✓':'○')+' · RECOVER '+(t.recoveryMove?'✓':'○')+' · CLIMB '+(t.ledgeClimb?'✓':'○')+' · AIM '+(t.aimUp?'↑':'○')+(t.aimDown?'↓':'○')+' · HITS '+Math.min(3,s.hits)+'/3',
 rescue:'CAPSULES '+t.deliveries+'/2 · '+(t.carrying?'CYAN BAY '+(t.bayX>state.fighters[0].x?'→':'←'):'YELLOW CAPSULE '+(t.capsule.x>state.fighters[0].x?'→':'←')),
 camera:'ON-CAMERA HITS '+t.points+'/10 · '+(state.fighters[0].onCamera?'IN FRAME':'FIND THE GOLD BEAM'),
 centrifuge:'HEAVY-g '+t.heavyTime.toFixed(1)+'/8s · HITS '+s.hits+'/6',
 medal:'MEDAL '+t.medalTime.toFixed(1)+'/8s · HITS '+s.hits+'/10',
 salvage:'SUPPLIES '+s.pickups+'/3 · HITS '+s.hits+'/8',
 final:'ON-CAMERA '+t.points+'/12 · SPECIALS '+t.specials+'/3 · FINISH TOP 2'
 }[state.lesson]||'';
}
export function pictogram(kind){
 if(kind==='recovery')return '<svg viewBox="0 0 200 150" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 132h48M76 132h45M145 88h45M26 116V85l-10 12m10-12 11 12M26 68V37l-10 12m10-12 11 12M89 112V54m-11 14 11-14 11 14M82 120l7 17 7-17M151 100v24l-12 13m12-13 12 13m-12-29 17-18 10 3"/><circle cx="151" cy="97" r="6"/></g></svg>';
 const extra={jump:'<path d="M90 120Q115 15 165 52m-14-20 15 20-24 4"/>',rescue:'<rect x="123" y="75" width="35" height="51" rx="5"/><path d="M88 76h35m-12-12 12 12-12 12M120 132h55"/>',camera:'<rect x="124" y="50" width="37" height="28"/><path d="m161 56 17-8v32l-17-8M143 78v53m-20 0 20-24 22 24"/>',gravity:'<path d="M132 30v65m-15-15 15 15 15-15M110 122h65"/>',medal:'<path d="m130 30 12 40 13-40"/><circle cx="142" cy="86" r="22"/>',tools:'<path d="m136 40-10 15 8 18-18 43 13 5 17-43 19-7 5-20-13 12-15-6z"/>',salute:'<path d="m94 67 18-26-25-13M126 112l22-13 22 13m-22-13V68"/><circle cx="148" cy="54" r="9"/>'}[kind]||'';
 return '<svg viewBox="0 0 200 150" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cx="62" cy="37" r="11"/><path d="M61 50v44m0-32-24 19m24-19 29 12M61 94l-20 37m20-37 21 37M25 137h76"/>'+extra+'</g></svg>';
}


export const CHECK_LABELS=[['110 movement','air jump','3 hits','1 special','fire up and down','recovery move','ledge climb'],['2 capsule deliveries'],['10 on-camera hits'],['8 seconds of heavy-g footing','6 hits'],['8 seconds with medal','10 hits'],['3 supply drops','8 hits'],['top-two finish','12 on-camera hits','3 specials']];
