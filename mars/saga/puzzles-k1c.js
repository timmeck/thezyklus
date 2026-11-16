// Mechanical play spaces for K1C. These are game adaptations, not new manga lore.
// A room's task is earned by changing a machine, carrying a real weight or
// completing a traversal. Walking up to a terminal never completes a task.
const station=(id,x,y,kind,label,extra={})=>({id,x,y,kind,label,...extra});
const S=station;
export const PUZZLES={
 1:{id:'balance-beam',kind:'balance',title:'Equal arms, equal weight',clue:'The beam carries 3 left and 5 right. Move one unit from right to left.',target:[4,4],initial:[3,5],stations:[S('left',265,500,'pan','LEFT PAN · move one unit'),S('right',675,300,'pan','RIGHT PAN · move one unit')],stages:2},
 2:{id:'draught-and-duct',kind:'fluid',title:'A quiet duct',clue:'Foam follows the open pipe. Isolate the inlet, open the drain, then crawl under the pipe.',target:[0,1],stations:[S('inlet',290,490,'valve','INLET · open / shut'),S('drain',875,490,'valve','DRAIN · open / shut'),S('finish',940,600,'bell','DELIVERY HATCH · test the duct')],initial:[1,0],stages:3},
 3:{id:'lever-ratio',kind:'balance',title:'The short arm needs twice the load',clue:'The short left arm is half as long. Its load must be twice the right load. Six units altogether.',target:[4,2],initial:[2,4],stations:[S('left',270,485,'pan','SHORT ARM · move one unit'),S('right',860,485,'pan','LONG ARM · move one unit')],stages:4},
 4:{id:'return-knot',kind:'expert',title:'The return knot · optional',clue:'Optional hard route. Catch all three upper eyes without touching the floor. The ordinary door stays open.',stations:[S('eye-a',300,360,'eye','FIRST EYE'),S('eye-b',570,245,'eye','SECOND EYE'),S('eye-c',860,165,'eye','RETURN KNOT')],stages:3,optional:true},
 5:{id:'tension-latches',kind:'tension',title:'Unload a latch before pulling it',clue:'The lower brace takes the strain. Close it; pull the upper latch with LINE; release the lower brace last.',stations:[S('brace',310,490,'brace','LOWER BRACE · secure / release'),S('catch',680,380,'catch','UPPER CATCH · hold LINE'),S('finish',905,490,'bell','TOOL RACK · check tension')],stages:3},
 7:{id:'three-anchor-crossing',kind:'swing',title:'Three eyes across the open spine',clue:'Jump, hold LINE, swing right. Release before the next eye, then catch again. The amber pads are local recovery points.',stations:[S('eye-a',330,205,'eye','FIRST ANCHOR'),S('eye-b',585,170,'eye','SECOND ANCHOR'),S('eye-c',835,205,'eye','THIRD ANCHOR')],stages:3},
 8:{id:'foam-lock',kind:'fluid',title:'Let the foam do the lifting',clue:'The inlet fills; the low drain empties. Close the drain and open the inlet. A floating cage still needs its catch pulled.',target:[1,0],initial:[0,1],stations:[S('inlet',280,480,'valve','INLET · open / shut'),S('drain',805,470,'valve','LOW DRAIN · open / shut'),S('finish',520,370,'catch','FLOAT CATCH · hold LINE')],stages:3},
 9:{id:'crosswind',kind:'wind',title:'Two vanes, one sheltered crossing',clue:'The upper arrow must turn the wind down; the lower arrow must turn it away from the walkway. Read the arrows, then test at the mast.',target:[2,1],initial:[0,0],stations:[S('upper',535,385,'vane','UPPER VANE · turn'),S('lower',270,490,'vane','LOWER VANE · turn'),S('finish',810,280,'bell','WIND MAST · test shelter')],stages:3},
10:{id:'lift-ballast',kind:'lift',title:'A lift works against a weight',clue:'Load the loose ballast in the cradle. Ride the balanced lift and pull the top stop. Unloaded lifts return to the bottom.',stations:[S('weight',255,490,'weight','BALLAST · take / put down'),S('cradle',680,600,'cradle','LIFT CRADLE · load ballast'),S('finish',535,375,'catch','TOP STOP · hold LINE')],stages:3},
11:{id:'cargo-columns',kind:'cargo',title:'Crew is not cargo',clue:'Put the three freight weights in the freight cradle. Leave the yellow training dummy on its own marked seat.',stations:[S('weight-a',260,490,'weight','FREIGHT ONE · 1 unit'),S('weight-b',520,380,'weight','FREIGHT TWO · 2 units'),S('weight-c',960,380,'weight','FREIGHT THREE · 3 units'),S('dummy',180,600,'dummy','YELLOW DUMMY · not freight'),S('cradle',925,490,'cradle','FREIGHT CRADLE · deposit')],stages:3},
12:{id:'closing-schott',kind:'shutter-run',title:'One clean run',clue:'USE the crank. Cross the two low steps and reach the far release before the amber strip empties. A miss returns you to the crank.',stations:[S('crank',225,600,'crank','START CRANK · open the shutter'),S('finish',935,600,'bell','FAR RELEASE · secure the shutter')],stages:1},
13:{id:'five-places',kind:'seats',title:'Five places, one moving tray',clue:'Three trays: two places, two places, one place. Seat the single tray in the middle; the paired trays go to the ends.',target:[2,1,2],initial:[1,2,2],stations:[S('left',275,490,'tray','LEFT TRAY · swap with held tray'),S('middle',580,390,'tray','MIDDLE TRAY · swap with held tray'),S('right',895,490,'tray','RIGHT TRAY · swap with held tray')],stages:3},
14:{id:'pressure-sleeve',kind:'sleeve',title:'Pressure before the clamp',clue:'Vent the sleeve before opening it. Insert the soft seal, close the clamp, then restore pressure.',stations:[S('vent',265,490,'valve','VENT · depressurise / pressurise'),S('sleeve',515,380,'clamp','SLEEVE · open / close'),S('seal',855,490,'weight','SOFT SEAL · collect / insert')],stages:4},
15:{id:'wind-catch',kind:'wind-catch',title:'Let a gust load the line',clue:'Pulling against the wind loads the catch. Brace left of the rail, hold LINE during the gust, then use the unloaded release above.',stations:[S('catch',340,480,'catch','WIND CATCH · brace and hold LINE'),S('finish',560,370,'crank','RAIL RELEASE · release the stored load')],stages:2},
17:{id:'service-return',kind:'return',title:'Secure the return before moving the lift',clue:'Hook the upper safety eye with LINE. Lower the empty cradle, step to its load plate, then open the return latch.',stations:[S('eye',555,380,'catch','SAFETY EYE · hold LINE'),S('lower',275,490,'crank','EMPTY CRADLE · lower'),S('plate',825,600,'plate','LOAD PLATE · stand here'),S('finish',865,490,'clamp','RETURN LATCH · release')],stages:4},
18:{id:'floating-ballast',kind:'ballast',title:'A weight can also be a float',clue:'A sealed light drum floats; an open drum sinks. Seal the drum, put it in the foam cradle and pull the raised eye.',stations:[S('drum',265,485,'weight','DRUM · take / set down'),S('cap',540,375,'clamp','DRUM CAP · seal / open'),S('cradle',850,485,'cradle','FOAM CRADLE · place the drum'),S('finish',630,375,'catch','RAISED EYE · hold LINE')],stages:4},
19:{id:'rescue-checklist',kind:'checklist',title:'A working checklist',clue:'Pressure holds only with the vent shut. A harness holds only with its pin through both loops. Test the rescue eye last, under load.',stations:[S('vent',285,490,'valve','PRESSURE VENT · shut / open'),S('pin',575,380,'clamp','HARNESS PIN · cycle loops'),S('load',885,490,'weight','RESCUE LOAD · attach / remove'),S('finish',700,600,'catch','RESCUE EYE · hold LINE to load-test')],stages:4},
21:{id:'contact-bridge',kind:'bridge',title:'Make a path without joining the rails',clue:'The rails must stay separate. Turn the first bridge across, leave the middle gap open, turn the last bridge across.',target:[1,0,1],initial:[0,1,0],stations:[S('first',275,490,'rail','FIRST BRIDGE · turn'),S('middle',550,380,'rail','MIDDLE GAP · turn'),S('last',865,490,'rail','LAST BRIDGE · turn'),S('finish',930,600,'bell','THRESHOLD · test separate rails')],stages:4},
22:{id:'dark-drones',kind:'dark',title:'Carry light, ground the watchers',clue:'The light pockets show the next scanner. Jump its amber sight line; hold LINE close by to ground it. Three pockets lead to the exit.',stations:[S('lamp-a',290,490,'lamp','FIRST LIGHT POCKET'),S('lamp-b',520,380,'lamp','SECOND LIGHT POCKET'),S('lamp-c',840,270,'lamp','THIRD LIGHT POCKET')],stages:3},
23:{id:'contact-lengths',kind:'rhythm',title:'Read length, not brightness',clue:'Two short marks. One long. Use the contact faces in that order. The long face is a held note, not two short notes.',sequence:['short-a','short-b','long'],stations:[S('short-a',280,480,'short','FIRST SHORT CONTACT'),S('short-b',875,480,'short','SECOND SHORT CONTACT'),S('long',555,370,'long','LONG CONTACT · hold USE')],stages:3},
24:{id:'empty-interval',kind:'interval',title:'The empty interval does work',clue:'Low, then high. Step away from both contacts before making the silence. The empty plate must stay empty.',stations:[S('low',285,490,'low','LOW CONTACT'),S('high',875,270,'high','HIGH CONTACT'),S('finish',560,380,'quiet','QUIET PLATE · leave it empty')],stages:3},
25:{id:'low-resonance',kind:'resonance',title:'More foam, lower voice',clue:'Foam damps the upper rail. Fill the lower bowl, leave the high vent open, then compare the low contact.',target:[1,1],initial:[0,0],stations:[S('bowl',275,490,'valve','LOW BOWL · fill / drain'),S('vent',540,390,'vane','HIGH VENT · open / shut'),S('finish',865,490,'low','LOW CONTACT · compare')],stages:3},
26:{id:'high-counterweight',kind:'balance',title:'The high rail needs a light touch',clue:'The high rail supports three units. The lower rail carries five. Move only enough weight to clear the high contact.',target:[3,5],initial:[6,2],stations:[S('left',560,370,'pan','HIGH RAIL · move one unit'),S('right',870,260,'pan','LOWER COUNTERWEIGHT · move one unit')],stages:6},
};

const APPLICATIONS=[
 [28,'divided-beam','One weight cannot hold two doors','The left cradle unloads the top catch. Once the line is hooked, its weight can move to the right cradle. Shut the vent before testing the two-door return.',[['weight',250,500,'weight','LOOSE BALLAST · take'],['left',510,400,'cradle','LEFT CRADLE · place / retrieve'],['catch',790,300,'catch','TOP SAFETY CATCH · hold LINE'],['right',945,475,'cradle','RIGHT CRADLE · place / retrieve'],['vent',310,600,'valve','PRESSURE VENT · shut / open'],['finish',940,600,'bell','RETURN FRAME · test both doors']]],
 [29,'dry-foam-bypass','Raise it wet; leave by the dry route','Foam can raise the stranded catch. Fill the bowl with its drain shut, hook the catch, then empty the bowl. Only the dry lower duct reaches the release.',[['fill',250,500,'valve','FILL PIPE · open / shut'],['drain',790,300,'valve','LOW DRAIN · open / shut'],['catch',510,400,'catch','STRANDED CATCH · hold LINE'],['finish',945,600,'clamp','DRY DUCT RELEASE · crouch and USE']]],
 [30,'wind-return','A panel is also a sail','Turn the high vane down and the low vane away before carrying the panel. Its cradle unloads the line eye. After hooking it, return the high vane to straight.',[['panel',250,500,'weight','LOOSE PANEL · carry'],['upper',790,300,'vane','HIGH VANE · straight / away / down'],['lower',510,400,'vane','LOW VANE · straight / away / down'],['cradle',945,475,'cradle','PANEL CRADLE · place / retrieve'],['catch',300,600,'catch','RETURN EYE · hold LINE'],['finish',940,600,'bell','WIND RETURN · secure']]],
 [31,'below-counterweight','The load opens a route underneath itself','Load the upper cradle. The eye underneath can only be reached by dropping through the open catwalk. Hook it below the load, then return to the far release.',[['weight',250,500,'weight','COUNTERWEIGHT · carry'],['cradle',790,300,'cradle','UPPER CRADLE · place / retrieve'],['catch',510,600,'catch','UNDERSIDE EYE · hold LINE'],['finish',945,475,'clamp','FAR RELEASE · secure']]],
 [32,'loaded-line','A free catch releases a useful weight','Pull the high catch to free its weight. That weight belongs in the low cradle. The low cradle takes the strain from the second eye; the empty high rack cannot.',[['first',510,400,'catch','HIGH CATCH · hold LINE'],['weight',790,300,'weight','RELEASED WEIGHT · carry'],['cradle',250,500,'cradle','LOW CRADLE · place / retrieve'],['second',945,475,'catch','SECOND EYE · hold LINE'],['finish',310,600,'bell','LOADED RETURN · test']]],
 [33,'float-and-freight','Float first; freight afterwards','Seal the drum before its foam crossing. Fill the bowl, place the sealed drum there and hook its floating eye. Once the line holds, move the drum from bowl to dry freight cradle.',[['drum',250,500,'weight','OPEN DRUM · carry'],['cap',790,300,'clamp','DRUM CAP · seal / open'],['fill',310,600,'valve','BOWL SUPPLY · fill / drain'],['bowl',510,400,'cradle','FOAM BOWL · place / retrieve'],['catch',945,475,'catch','FLOATING EYE · hold LINE'],['freight',895,600,'cradle','DRY FREIGHT CRADLE · place / retrieve'],['finish',250,600,'bell','FREIGHT RETURN · check']]],
 [34,'small-heavy-crate','Size is not weight','The long cradle needs five units. The large cream crate carries two; the small amber crate carries four; the slim teal crate carries one. Remove a wrong load before pulling the release.',[['two',250,500,'weight','LARGE CREAM CRATE · 2 units'],['four',790,300,'weight','SMALL AMBER CRATE · 4 units'],['one',510,400,'weight','SLIM TEAL CRATE · 1 unit'],['cradle',945,475,'cradle','FIVE-UNIT CRADLE · place / retrieve'],['catch',310,600,'catch','WEIGHED RELEASE · hold LINE'],['finish',940,600,'bell','FREIGHT FRAME · secure']]],
 [36,'moving-return','Let a moving deck do the carrying','Three small service cradles move at different heights. Ride each once to free its load stop. Their fixed ledges are recovery points; the far release counts all three stops.',[['start',250,500,'crank','SERVICE DRIVE · start / stop'],['finish',945,475,'bell','THREE LOAD STOPS · check']]],
 [37,'pressure-pockets','A sealed pocket keeps its own pressure','Close both outer feeds before opening the centre pocket. A soft float can then cross without catching the draught. Place it in the far bay, close the centre and hook the isolated return.',[['left',250,500,'valve','LEFT OUTER FEED · open / shut'],['middle',790,300,'valve','CENTRE POCKET · open / shut'],['right',510,400,'valve','RIGHT OUTER FEED · open / shut'],['float',310,600,'weight','SOFT FLOAT · carry'],['bay',945,475,'cradle','ISOLATED BAY · place / retrieve'],['catch',895,600,'catch','POCKET RETURN · hold LINE'],['finish',250,600,'bell','POCKET FRAME · check']]],
 [38,'borrowed-light','Put the light down to free your hands','The portable lamp reveals each scanner from its stand. Carry it forward, put it on the next stand, then ground that scanner with LINE. Recover the lamp before moving to the next pocket.',[['lamp',250,500,'weight','PORTABLE LAMP · carry'],['stand-a',510,400,'cradle','FIRST LAMP STAND · place / retrieve'],['eye-a',570,400,'catch','FIRST SCANNER · hold LINE'],['stand-b',790,300,'cradle','SECOND LAMP STAND · place / retrieve'],['eye-b',850,300,'catch','SECOND SCANNER · hold LINE'],['stand-c',945,475,'cradle','THIRD LAMP STAND · place / retrieve'],['eye-c',1000,475,'catch','THIRD SCANNER · hold LINE'],['finish',310,600,'bell','LIT RETURN · check']]],
 [39,'listening-stair','The answer is a path','The low stair carries two short steps. The high stair carries one long step. Traverse low, low, high; then leave the empty middle stair alone and pull the return eye from the far side.',[['low',250,500,'low','LOW STAIR · short step'],['high',790,300,'high','HIGH STAIR · long step'],['quiet',510,400,'quiet','MIDDLE STAIR · leave empty'],['catch',945,475,'catch','FAR RETURN EYE · hold LINE'],['finish',310,600,'bell','LISTENING RETURN · secure']]],
];
for(const [room,id,title,clue,stations] of APPLICATIONS)PUZZLES[room]={id,kind:'application',title,clue,stations:stations.map(a=>S(...a)),stages:stations.length};
PUZZLES[35]={id:'upper-catching-chain',kind:'swing',title:'The upper catching chain',clue:'The return is above the old floor. Catch each upper eye once, release toward the next, and use the small recovery pads. Holding the first eye forever cannot carry you through.',stations:[S('eye-a',330,165,'eye','UPPER EYE ONE'),S('eye-b',585,120,'eye','UPPER EYE TWO'),S('eye-c',835,165,'eye','UPPER EYE THREE')],stages:3};
const CAUSAL_CLUES={
2:'The inlet feeds the duct. The drain empties it. The delivery hatch is too low for a standing courier. A quiet pipe does not push foam into the crawlway.',
5:'The lower brace carries the upper latch’s load. An unloaded latch lifts by hand with USE. The tool rack can leave only after both fittings are free again.',
8:'The floating cage rises with the foam. One pipe feeds the basin; one drains its bottom. The cage’s eye carries no load once it floats.',
9:'The upper arrow points down into the sheltered shaft. The lower arrow points away from the walkway. A ribbon at the mast shows whether both streams still meet.',
10:'A loose ballast and an empty cradle oppose the lift. Its top stop can be unhooked only under a balanced load.',
11:'The freight cradle has sockets for three different fittings. The one-unit fitting secures the base, the two-unit fitting braces it, and the three-unit fitting supports the rail. The dummy is crew equipment, with its own seat.',
14:'Pressure pins a clamp shut. An open sleeve accepts a soft seal. A closed clamp and an inserted seal hold pressure; an empty sleeve does not.',
15:'The wind takes the rail’s load during a gust. A line can hold that load after the wind turns. The release above will not move under strain.',
17:'A moving cradle needs a safety line. Its load plate proves that the low deck can take a returning person. An unproved return latch stays shut.',
18:'An open drum fills and sinks. A sealed drum traps air and floats. The recovery eye loses its load only when the drum is afloat in the foam cradle.',
19:'An open vent loses pressure. A harness pin has two loops to cross. The rescue eye’s test needs a real attached load, rather than an empty line.',
21:'A crossed bridge joins a rail. The first and last pairs should meet; the centre pair are deliberately separated. The machine’s empty gap is part of its construction.',
24:'The high face follows the low face. The unmarked plate belongs to neither voice. A body on that plate interrupts the quiet interval.',
25:'Foam in the low bowl damps the upper rail. The upper vent lets the remaining high tone escape. The comparison face can tell the two voices apart.',
28:'The left cradle unloads the top catch. A hooked line can keep that catch unloaded without its ballast. The right cradle holds the other door. An open vent still leaks pressure.',
29:'A filled bowl lifts the stranded catch; a hooked line keeps it raised after the foam drains. The low release is in the dry crawlway. The drain is open when you arrive.',
30:'A broad panel catches both air streams. The high vane’s downward arrow and the low vane’s outward arrow shelter its cradle. A hooked eye supports the return when the high vane goes straight again.',
31:'A load in the upper cradle opens its underside. An open catwalk can be dropped through with DOWN + JUMP. The eye must be approached from below its own counterweight.',
32:'The high catch holds a loose weight. The low cradle takes the strain from the second eye. The high rack cannot carry its own return load.',
33:'An open drum sinks. A sealed drum floats in a filled bowl. A line hooked to its floating eye can carry the load while the drum becomes ordinary freight again.',
34:'The cradle’s mark is five units. The large cream crate carries two; the small amber crate carries four; the slim teal crate carries one. Weight, rather than size, unloads the release.',
36:'Each moving cradle has its own load stop. A person’s weight frees a stop; standing on a fixed ledge does not. The far gauge has three separate marks.',
37:'Both outer feeds share the centre pocket. With those feeds closed, the centre can hold a quiet crossing. The soft float seats its far bay. The return eye needs that pocket isolated again.',
38:'A scanner’s light socket is beside its lamp stand. A carried lamp fills both hands; the stand frees a hand for the line. Each socket has to see the portable lamp at least once.',
39:'The low stair has two short marks; the high stair has one long mark. The unmarked middle stair must carry no extra note. The far eye holds the route once that phrase is complete.',
};
for(const [id,clue] of Object.entries(CAUSAL_CLUES))PUZZLES[id].clue=clue;

export function configurePuzzleRoom(r){
 const d=PUZZLES[r.id];r.puzzle=d?.id||null;
 if(!d)return r;
 // HUD summaries stay compatible with the map, but USE cannot tick these off.
 r.challenges=d.optional?[]:[{x:d.stations.at(-1).x,y:d.stations.at(-1).y,label:d.title}];
 r.task=d.clue;
 if([7,12,22].includes(r.id)){r.challengeRoom=true;r.hazard=false;r.spark=false;r.machine=null;}
 if(r.id===7){
  r.platforms=[{x:0,y:600,w:245},{x:445,y:495,w:90},{x:690,y:460,w:85},{x:900,y:600,w:200}].map((p,i)=>({...p,id:'spine-'+i,h:24,active:true}));
  r.blocks=[];r.gap=[245,655];r.anchors=d.stations.map(q=>({x:q.x,y:q.y,id:q.id}));r.anchor=r.anchors[0];
 }
 if(r.id===12){
  r.gap=null;r.wind=false;r.blocks=[{x:400,y:535,w:95,h:65},{x:675,y:520,w:95,h:80}];
  r.platforms=[{x:0,y:600,w:1100},{x:370,y:500,w:160},{x:645,y:485,w:160}].map((p,i)=>({...p,id:'run-'+i,h:24,active:true}));
 }
 if(r.id===22){r.dark=true;r.gap=null;r.blocks=[];}
 if(r.id===4){r.anchors=[{x:300,y:220,id:'expert-a'},{x:570,y:140,id:'expert-b'},{x:860,y:70,id:'expert-c'}];r.anchor=r.anchors[0];}
 if(r.id>=28){
  r.hazard=false;r.spark=false;r.machine=null;r.secret=false;r.collectible=false;r.gap=null;r.wind=[30,37].includes(r.id);r.foam=false;r.lift=null;
  r.platforms=[[0,600,1100],[160,500,210],[410,400,220],[680,300,220],[890,475,180]].map(([x,y,w],i)=>({x,y,w,h:22,active:true,id:`bay-${r.id}-${i}`}));
  r.blocks=[{x:475,y:400,w:80,h:200}];r.shape='workshop';r.anchor={x:550,y:170};
  if(r.id===29){r.blocks=[{x:370,y:0,w:260,h:270},{x:875,y:0,w:210,h:535}];r.shape='crawl';}
  if(r.id===30){r.blocks.push({x:620,y:0,w:85,h:185});r.shape='wind';}
  if(r.id===31)r.blocks=[];
  if(r.id===32){r.blocks=[{x:460,y:400,w:105,h:200},{x:735,y:300,w:95,h:300}];r.shape='cargo';}
  if(r.id===33){r.blocks=[{x:460,y:400,w:105,h:200}];r.shape='foam';}
  if(r.id===34)r.shape='press';
  if(r.id===35){r.blocks=[];r.gap=[245,655];r.platforms=[[0,600,245],[445,450,90],[690,410,85],[900,600,200]].map(([x,y,w],i)=>({x,y,w,h:22,active:true,id:`upper-chain-${i}`}));r.anchors=d.stations.map(a=>({x:a.x,y:a.y,id:a.id}));r.anchor=r.anchors[0];r.challengeRoom=true;}
  if(r.id===36){r.blocks=[];r.lifts=[{x:390,y:490,w:105,h:22,id:'moving-a',phase:0},{x:620,y:390,w:105,h:22,id:'moving-b',phase:2},{x:835,y:475,w:105,h:22,id:'moving-c',phase:4}];}
  if(r.id===37){r.blocks=[{x:460,y:400,w:95,h:200},{x:630,y:0,w:95,h:190}];r.shape='airlock';}
  if(r.id===38){r.dark=true;r.shape='dark';}
  if(r.id===39){r.blocks=[];r.platforms=r.platforms.filter(p=>p.y!==400);r.shape='contact';}
 }
 return r;
}
export function puzzleState(s,r=s.room){
 const d=PUZZLES[r];if(!d)return null;s.puzzles||={};
 const q=s.puzzles[r]||=( {complete:Boolean(s.tasks?.[r]),stage:0,values:[...(d.initial||[])],held:null,carry:null,flags:d.kind==='sleeve'?{closed:true}:r===29?{drain:true}:r===37?{left:true,right:true}:r===30?{upper:0,lower:0}:{},visits:[],attempts:0,resets:0,pull:0} );
 if(s.tasks?.[r])q.complete=true;
 return q;
}
export function puzzleHint(s){const d=PUZZLES[s.room],q=d&&puzzleState(s);return d&&!q.complete?d.clue:null;}
export function foamSurface(s,r){
 if(r.id===8){const q=puzzleState(s);return q.values[0]&&!q.values[1]?420:q.values[0]||!q.values[1]?510:570;}
 return 570;
}
const close=(p,a,range=78)=>Math.abs(p.x-a.x)<range&&Math.abs(p.y-a.y)<47;
export function nearbyMechanism(s){
 const d=PUZZLES[s.room];if(!d)return null;const q=puzzleState(s);if(q.complete)return null;
 let a=d.stations.filter(a=>close(s.player,a)).sort((a,b)=>Math.hypot(s.player.x-a.x,s.player.y-a.y)-Math.hypot(s.player.x-b.x,s.player.y-b.y))[0];
 if(!a||['eye','lamp','plate','quiet'].includes(a.kind))return null;
 return {kind:'mechanism',station:a.id,label:a.label,puzzle:d.id};
}
function tell(s,text){s.events.push({type:'hint',text,room:s.room,puzzle:PUZZLES[s.room]?.id});}
function finish(s,q){if(q.complete)return;q.complete=true;q.stage=PUZZLES[s.room].stages;s.tasks[s.room]=1;s.events.push({type:'task',room:s.room,puzzle:PUZZLES[s.room].id,text:'Mechanism secured. The onward route is open.'});}
function equal(a,b){return a.length===b.length&&a.every((n,i)=>n===b[i]);}
function wrong(s,q,text){q.attempts++;tell(s,text);}
function mark(q,id){if(!q.visits.includes(id))q.visits.push(id);}
export function useMechanism(s,id){
 const d=PUZZLES[s.room],q=puzzleState(s),a=d?.stations.find(x=>x.id===id);if(!d||!q||q.complete||!a)return;
 const i=d.stations.indexOf(a);mark(q,id);
 if(d.kind==='application'){useApplication(s,q,a);return;}
 if(d.kind==='balance'){
  if(q.held===null){if(q.values[i]>0){q.values[i]--;q.held=i;tell(s,'One unit secured. Carry it to the other arm.');}}
  else {q.values[i]++;q.held=null;tell(s,`Load: ${q.values[0]} left · ${q.values[1]} right.`);if(equal(q.values,d.target))finish(s,q);}
 }else if(['fluid','wind','bridge','resonance'].includes(d.kind)){
  if(id==='finish'){
   if(!equal(q.values,d.target)){wrong(s,q,d.kind==='wind'?'The ribbon still crosses the walkway. Read both vane arrows.':d.kind==='bridge'?'The middle rail must keep its gap.':'The flow does not match the marked pipe.');return;}
   if(a.kind==='catch'){tell(s,'The catch is unloaded. Hold LINE beside it.');return;}
   if(s.room===2&&!s.player.crouched){tell(s,'The flow is quiet. Crouch at the delivery hatch to finish the duct check.');return;}
   finish(s,q);
  }else{q.values[i]=(q.values[i]+1)%(d.kind==='wind'?3:2);tell(s,`${a.label.split(' · ')[0]}: ${d.kind==='wind'?['straight','away','down'][q.values[i]]:q.values[i]?'open':'shut'}.`);}
 }else if(d.kind==='tension'){
  if(id==='catch'){if(q.flags.brace){q.flags.catch=true;tell(s,'Upper latch lifted by hand. The brace still carries its load.');}else wrong(s,q,'The upper latch is pinned by its load. The lower brace can carry that strain.');}
  if(id==='brace'){q.flags.brace=!q.flags.brace;if(!q.flags.brace&&q.flags.catch)q.flags.released=true;tell(s,q.flags.brace?'Brace secure. The upper catch is unloaded.':'Brace released.');}
  if(id==='finish'){if(q.flags.catch&&q.flags.released)finish(s,q);else wrong(s,q,'The rack still carries tension. Brace, pull the upper catch, then release the brace.');}
 }else if(d.kind==='lift'){
  if(id==='weight'){q.carry=q.carry?null:'ballast';tell(s,q.carry?'Ballast secured. The cradle is beside the lift.':'Ballast set down.');}
  if(id==='cradle'){if(q.carry){q.carry=null;q.flags.loaded=true;tell(s,'Counterweight loaded. The lift can carry you now.');}else wrong(s,q,'The cradle needs the loose ballast.');}
  if(id==='finish')tell(s,'Hold LINE at the unloaded top stop.');
 }else if(d.kind==='cargo'){
  if(id.startsWith('weight')){if(!q.flags[id]&&!q.carry){q.carry=id;tell(s,'Freight secured. The marked freight cradle is on the upper return.');}}
  if(id==='dummy'){q.flags.dummyMoved=!q.flags.dummyMoved;tell(s,'The dummy has its own seat. It does not belong in the freight count.');}
  if(id==='cradle'){if(q.carry){q.flags[q.carry]=true;q.carry=null;q.stage=Object.keys(q.flags).filter(k=>k.startsWith('weight')&&q.flags[k]).length;if(q.stage===3)finish(s,q);else tell(s,`Freight cradle: ${q.stage}/3 weights.`);}else wrong(s,q,'The cradle is empty. Bring a freight weight, one at a time.');}
 }else if(d.kind==='shutter-run'){
  if(id==='crank'){q.flags.running=true;q.flags.remaining=s.settings.assist?9.2:7.8;q.flags.started=(s.roomTime||0);tell(s,'Shutter moving. The far release is beyond the two steps.');}
  if(id==='finish'){if(q.flags.running)finish(s,q);else wrong(s,q,'The crank starts the shutter run.');}
 }else if(d.kind==='seats'){
  if(q.held===null){q.held=q.values[i];q.values[i]=0;}else {const n=q.values[i];q.values[i]=q.held;q.held=n||null;}
  if(q.held===null&&equal(q.values,d.target))finish(s,q);else tell(s,`Places: ${q.values.join(' / ')}. Carrying ${q.held||0}. The single tray belongs in the middle.`);
 }else if(d.kind==='sleeve'){
  if(id==='vent'){q.flags.vent=!q.flags.vent;if(!q.flags.vent&&q.flags.inserted&&q.flags.closed)finish(s,q);else tell(s,q.flags.vent?'Pressure released. The sleeve can open.':'Pressure restored.');}
  if(id==='sleeve'){if(!q.flags.vent){wrong(s,q,'Vent the sleeve before moving its clamp.');return;}if(q.carry==='seal'&&!q.flags.closed){q.carry=null;q.flags.inserted=true;tell(s,'Soft seal inserted. Close the clamp, then restore pressure.');}else{q.flags.closed=!q.flags.closed;q.flags.opened=true;tell(s,q.flags.closed?'Clamp closed. Restore pressure to test.':'Sleeve open. Bring the soft seal.');}}
  if(id==='seal'){if(!q.carry&&!q.flags.inserted){q.carry='seal';tell(s,'Soft seal secured. Return to the open sleeve.');}else if(q.carry)tell(s,'Insert the seal at the open sleeve with USE.');}
 }else if(d.kind==='wind-catch'){
  if(id==='finish'){if(q.flags.loaded)finish(s,q);else wrong(s,q,'The rail is still carrying the load. Brace at the lower catch during a gust.');}
 }else if(d.kind==='return'){
  if(id==='lower'){if(q.flags.hooked){q.flags.lowered=true;tell(s,'Empty cradle lowered. Stand on its load plate.');}else wrong(s,q,'Hook the safety eye before moving the cradle.');}
  if(id==='finish'){if(q.flags.hooked&&q.flags.lowered&&q.flags.plate)finish(s,q);else wrong(s,q,'The return needs a safety line, a lowered cradle and its load plate checked.');}
 }else if(d.kind==='ballast'){
  if(id==='drum'){if(!q.flags.placed){q.carry=q.carry?null:'drum';tell(s,q.carry?'Drum secured. The cap is above.':'Drum set down.');}}
  if(id==='cap'){if(q.carry){q.flags.sealed=!q.flags.sealed;tell(s,q.flags.sealed?'Drum sealed. Trapped air makes it a float.':'Drum open. It will fill and sink.');}else wrong(s,q,'Bring the drum to its cap.');}
  if(id==='cradle'){if(q.carry){q.carry=null;q.flags.placed=true;if(q.flags.sealed)tell(s,'The drum floats. Pull the raised recovery eye.');else {q.flags.placed=false;wrong(s,q,'The open drum sinks. It is back at the rack. Seal it first.');}}else wrong(s,q,'Place the sealed drum in this foam cradle.');}
 }else if(d.kind==='checklist'){
  if(id==='vent'){q.flags.vent=!q.flags.vent;tell(s,q.flags.vent?'Vent shut. The pressure marker holds.':'Vent open. Pressure escapes.');}
  if(id==='pin'){q.flags.pin=((q.flags.pin||0)+1)%3;tell(s,['Pin withdrawn.','Pin through one loop.','Pin through both loops.'][q.flags.pin]);}
  if(id==='load'){q.flags.load=!q.flags.load;tell(s,q.flags.load?'Rescue load attached. Test the eye with LINE.':'Rescue load removed.');}
 }else if(d.kind==='rhythm'){
  if(id==='long'){tell(s,'The long face needs a held USE, after both short faces.');return;}
  if(d.sequence[q.stage]===id){q.stage++;tell(s,q.stage===2?'Two short contacts. Now hold the long face.':'First short contact. Find the other short face.');}
  else {q.stage=0;wrong(s,q,'The phrase starts again: two different short faces, then the long face.');}
 }else if(d.kind==='interval'){
  if(id==='low'){q.stage=1;tell(s,'Low. Now the high face.');}
  else if(id==='high'){if(q.stage===1){q.stage=2;tell(s,'High. Leave both faces and the empty plate alone.');}else wrong(s,q,'The low face answers first.');}
 }
}

function recoverChallenge(s,q,text,x=180,y=600){
 q.resets++;q.flags.running=false;q.flags.remaining=0;q.pull=0;s.recoveries++;s.deathsByRoom||={};s.deathsByRoom[s.room]=(s.deathsByRoom[s.room]||0)+1;
 const p=s.player;Object.assign(p,{x,y,vx:0,vy:0,grounded:true,rope:null,ledge:null,invincible:1.5,action:'land',actionTime:.2});s.energy=5;
 s.events.push({type:'puzzle-reset',room:s.room,puzzle:PUZZLES[s.room].id,text});s.events.push({type:'recover',room:s.room,text});
}
export function puzzleTick(s,input,dt){
 const d=PUZZLES[s.room];if(!d)return;const q=puzzleState(s),p=s.player;if(q.complete)return;
 const a=d.stations.filter(x=>close(p,x,90)).sort((a,b)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y))[0];
 const line=a&&input.line&&s.tether&&['catch','eye'].includes(a.kind);
 let valid=false;
 if(d.kind==='application')valid=applicationLineReady(s,q,a);
 if(d.kind==='tension')valid=a?.id==='catch'&&q.flags.brace;
 if(d.kind==='fluid')valid=a?.id==='finish'&&equal(q.values,d.target);
 if(d.kind==='lift')valid=a?.id==='finish'&&q.flags.loaded;
 if(d.kind==='wind-catch')valid=a?.id==='catch'&&(s.roomTime||0)%9>4&&(s.roomTime||0)%9<8;
 if(d.kind==='return')valid=a?.id==='eye';
 if(d.kind==='ballast')valid=a?.id==='finish'&&q.flags.placed&&q.flags.sealed;
 if(d.kind==='checklist')valid=a?.id==='finish'&&q.flags.vent&&q.flags.pin===2&&q.flags.load;
 if(line&&valid){q.pull+=dt;if(q.pull>.55){q.pull=0;if(d.kind==='application'){q.flags[a.id]=true;q.stage++;tell(s,'Line eye hooked. Its load now has a way back.');}else if(d.kind==='tension'){q.flags.catch=true;tell(s,'Upper latch free. Release the lower brace last.');}else if(d.kind==='wind-catch'){q.flags.loaded=true;tell(s,'Gust stored in the line. The upper rail release is free.');}else if(d.kind==='return'){q.flags.hooked=true;tell(s,'Safety eye secured. Lower the empty cradle.');}else finish(s,q);}}
 else q.pull=Math.max(0,q.pull-dt*2);
 if(d.kind==='return'&&q.flags.lowered&&close(p,d.stations.find(a=>a.id==='plate'),65)){q.flags.plate=true;}
 if(d.kind==='shutter-run'&&q.flags.running){q.flags.remaining-=dt;if(q.flags.remaining<=0)recoverChallenge(s,q,'Schott caught the route. The safety line puts you back at the crank. Try the two steps earlier.',205);}
 if(d.kind==='swing'){
  if(p.rope){const i=d.stations.findIndex(a=>Math.hypot(a.x-p.rope.x,a.y-p.rope.y)<8);if(i===q.stage){q.stage++;q.flags.checkpoint=q.stage===1?{x:485,y:s.room===35?450:495}:q.stage===2?{x:730,y:s.room===35?410:460}:q.flags.checkpoint;s.events.push({type:'anchor-check',room:s.room,index:i});}}
  if(q.stage===3&&p.grounded&&p.x>900)finish(s,q);
  if(p.y>790){const cp=q.flags.checkpoint||{x:180,y:600};recoverChallenge(s,q,'Recovery pad caught you. Release LINE before catching the next eye.',cp.x,cp.y);}
 }
 if(d.kind==='expert'){
  if(p.grounded&&p.y>=590){q.stage=0;q.flags.earned=false;}
  if(p.rope){const i=d.stations.findIndex(a=>Math.abs(a.x-p.rope.x)<8);if(i>=0&&i===q.stage){q.stage++;}}
  if(q.stage===3&&Math.hypot(p.x-860,p.y-65-165)<100){q.complete=true;q.flags.earned=true;s.specialFind='return-knot';if(!s.notes.includes(4))s.notes.push(4);if(!s.secrets.includes(4))s.secrets.push(4);s.events.push({type:'note',room:4,secret:true,special:true,text:'The return knot. A difficult way out, tied before a heroic way in.'});}
 }
 if(d.kind==='dark'){
  q.watchers||=d.stations.map((a,i)=>({x:a.x+70,y:a.y-80,hits:0,stun:0,index:i}));
  for(const watcher of q.watchers){
   watcher.stun=Math.max(0,watcher.stun-dt);if(watcher.hits)continue;
   const distance=Math.hypot(p.x-watcher.x,p.y-65-watcher.y),phase=((s.roomTime||0)+watcher.index*1.7)%5;
   if(input.line&&s.tether&&distance<205){watcher.pull=(watcher.pull||0)+dt;if(watcher.pull>.55){watcher.hits=1;q.stage++;s.events.push({type:'disabled',room:s.room,text:'Scanner grounded. The next light pocket is clear.'});}}else watcher.pull=0;
   if(phase>3.3&&phase<3.6&&distance<150&&p.invincible<=0&&p.grounded){s.energy-=s.settings.assist?0:1;p.vy=-260;p.invincible=1.8;s.events.push({type:'bump',room:s.room,text:'Amber sight line. Jump, or pull the scanner from the light pocket.'});}
  }
  if(q.stage>=3&&p.x>945&&p.y>540)finish(s,q);
  if(p.y>790||s.energy<=0){const cp=d.stations[Math.max(0,q.stage-1)];recoverChallenge(s,q,'The nearest light pocket catches you. The grounded scanners stay grounded.',cp.x,cp.y);}
 }
 if(d.kind==='rhythm'&&a?.id==='long'&&(input.action||input.actionPressed)&&q.stage===2){q.flags.held=(q.flags.held||0)+dt;if(q.flags.held>.65)finish(s,q);}else q.flags.held=0;
 if(d.kind==='interval'&&q.stage===2){const occupied=d.stations.some(a=>close(p,a,55));if(!occupied){q.flags.quiet=(q.flags.quiet||0)+dt;if(q.flags.quiet>1.2)finish(s,q);}else q.flags.quiet=0;}
 if(d.kind==='application'){
  if(s.room===31&&q.flags.cradle&&input.crouch&&input.jumpPressed&&p.grounded&&p.y<500)q.flags.dropped=true;
  if(s.room===36&&q.flags.start){for(const l of puzzlePlatforms(s))if(p.grounded&&Math.abs(p.y-l.y)<12&&p.x>l.x-12&&p.x<l.x+l.w+12)q.flags[l.id]=true;}
 }
}

function useApplication(s,q,a){
 const id=a.id,room=s.room;
 if(a.kind==='weight'){
  if(q.carry){wrong(s,q,'Your hands are full. A cradle can take that load.');return;}
  if(room===32&&!q.flags.first){wrong(s,q,'The high catch is still holding this weight.');return;}
  if(q.flags['taken-'+id]){tell(s,'That fitting is already in a cradle. Retrieve it there.');return;}
  q.carry=id;q.flags['taken-'+id]=true;tell(s,'Load secured. Its outline stays visible at the right cradle.');return;
 }
 if(a.kind==='cradle'){
  if(q.carry){
   if(room===30&&!(q.flags.upper===2&&q.flags.lower===1)){wrong(s,q,'The panel catches the draught. Both arrow streams must clear its cradle.');return;}
   if(room===33&&id==='bowl'&&!(q.flags.cap&&q.flags.fill)){wrong(s,q,'The open or unfilled bowl cannot float this drum.');return;}
   if(room===37&&!(q.flags.left===false&&q.flags.right===false&&q.flags.middle)){wrong(s,q,'The soft float is pulled toward a feed. The centre pocket is not quiet yet.');return;}
   q.loads||={};q.loads[id]||=[];q.loads[id].push(q.carry);q.flags[id]=true;q.carry=null;q.stage++;tell(s,'Cradle loaded. Watch which fitting loses its strain.');
  }else if(q.loads?.[id]?.length){q.carry=q.loads[id].pop();q.flags[id]=q.loads[id].length>0;tell(s,'Load retrieved. The line must hold any remaining strain.');}
  else tell(s,'An empty cradle. The marked loose fitting can be carried here.');
  return;
 }
 if(a.kind==='valve'||a.kind==='vane'||a.kind==='clamp'||a.kind==='crank'){
  if(id==='finish'){if(applicationGoal(s,q)){finish(s,q);}else wrong(s,q,applicationFeedback(s,q));return;}
  if(room===33&&id==='cap'&&q.carry!=='drum'){wrong(s,q,'The cap needs its drum beside it.');return;}
  q.flags[id]=a.kind==='vane'?((q.flags[id]||0)+1)%3:!q.flags[id];
  tell(s,a.kind==='vane'?`Vane: ${['straight','away','down'][q.flags[id]]}.`:`${a.label.split(' · ')[0]}: ${q.flags[id]?'engaged':'released'}.`);return;
 }
 if(room===39&&id==='low'){q.flags.notes=(q.flags.notes||0)+1;if(q.flags.notes>2)q.flags.notes=1;tell(s,`${q.flags.notes} short marks carried by the low stair.`);return;}
 if(room===39&&id==='high'){if(q.flags.notes===2){q.flags.phrase=true;tell(s,'Two short, one long. The empty stair carries no note.');}else{q.flags.notes=0;wrong(s,q,'The high step follows the two short marks.');}return;}
 if(id==='finish'){if(applicationGoal(s,q))finish(s,q);else wrong(s,q,applicationFeedback(s,q));}
}
function applicationLineReady(s,q,a){if(!a||a.kind!=='catch'||q.flags[a.id])return false;const f=q.flags;
 switch(s.room){
  case 28:return f.left||f.catch;
  case 29:return f.fill&&!f.drain;
  case 30:return f.cradle&&f.upper===2&&f.lower===1;
  case 31:return f.cradle&&f.dropped;
  case 32:return a.id==='first'||a.id==='second'&&f.cradle;
  case 33:return f.cap&&f.fill&&f.bowl;
  case 34:return (q.loads?.cradle||[]).reduce((n,k)=>n+({one:1,two:2,four:4}[k]||0),0)===5;
  case 37:return f.bay&&!f.middle;
  case 38:return !q.carry&&f[a.id.replace('eye','stand')];
  case 39:return f.phrase;
 }
 return false;
}
function applicationGoal(s,q){const f=q.flags;switch(s.room){
 case 28:return f.catch&&f.right&&f.vent;
 case 29:return f.catch&&!f.fill&&f.drain&&s.player.crouched;
 case 30:return f.catch&&f.cradle&&f.upper===0;
 case 31:return f.catch;
 case 32:return f.first&&f.second&&f.cradle;
 case 33:return f.catch&&f.freight;
 case 34:return f.catch;
 case 36:return f['moving-a']&&f['moving-b']&&f['moving-c'];
 case 37:return f.catch&&f.bay&&!f.middle;
 case 38:return f['eye-a']&&f['eye-b']&&f['eye-c'];
 case 39:return f.catch;
 }return false;}
function applicationFeedback(s,q){const f=q.flags;switch(s.room){
 case 28:return !f.catch?'The top catch still needs a line.':!f.right?'The right door still needs its ballast.':'The open vent still leaks pressure.';
 case 29:return !f.catch?'The stranded catch needs to float before a line can take it.':f.fill||!f.drain?'Foam still occupies the lower bypass.':'The release is below standing height.';
 case 30:return !f.catch?'The panel cradle must unload the line eye.':'The high vane still diverts the return stream.';
 case 31:return 'The underside eye has not been reached through the open catwalk.';
 case 32:return 'The second eye is still loaded. The released weight belongs in the low cradle.';
 case 33:return 'The floating eye needs a line before the drum can leave the bowl for freight.';
 case 34:return 'The load gauge needs five units. Size does not count.';
 case 36:return 'Three load stops, one on each moving cradle. Fixed ledges do not press them.';
 case 37:return 'The far bay and the isolated centre pocket must support the return together.';
 case 38:return 'A scanner has not seen the lamp from its own stand yet.';
 case 39:return 'The far eye is still loaded. Read the short and long stair marks.';
 }return 'The mechanism still carries a load.';}
export function puzzlePlatforms(s){
 const q=PUZZLES[s.room]&&puzzleState(s);
 if(s.room===36)return [{x:390,y:490,w:105,h:22,id:'moving-a',phase:0},{x:620,y:390,w:105,h:22,id:'moving-b',phase:2},{x:835,y:475,w:105,h:22,id:'moving-c',phase:4}].map(l=>({...l,y:q.flags.start?l.y+Math.sin((s.roomTime||0)*.8+l.phase)*48:l.y,active:true}));
 if(s.room===29&&q.flags.fill&&!q.flags.drain)return [{x:380,y:440,w:300,h:22,id:'foam-float',active:true}];
 if(s.room===33&&q.flags.fill)return [{x:380,y:440,w:300,h:22,id:'foam-bowl-float',active:true}];
 if(s.room===39&&q.flags.notes>0)return [{x:410,y:400,w:220,h:22,id:'listening-step',active:true}];
 return [];
}
export function activeAnchor(s,r){
 const anchors=r.anchors||[r.anchor],p=s.player;
 // Aim toward travel rather than snapping back to the eye just released.
 return [...anchors].sort((a,b)=>{
  const da=Math.hypot(a.x-p.x,a.y-(p.y-70))+(Math.sign(a.x-p.x)!==p.facing?110:0);
  const db=Math.hypot(b.x-p.x,b.y-(p.y-70))+(Math.sign(b.x-p.x)!==p.facing?110:0);return da-db;
 })[0];
}
export function puzzleCollision(s){
 const d=PUZZLES[s.room],q=d&&puzzleState(s);if(!d||q.complete)return [];
 if(d.kind==='shutter-run'&&!q.flags.running)return [{x:850,y:0,w:45,h:600}];
 return [];
}

// Hand-drawn mechanical vocabulary in the same ink/cream/teal materials as the
// authored ship. Gauges communicate state; the fixed HUD carries the prose.
const C={ink:'#081d29',cream:'#e0d9b8',teal:'#3b777b',amber:'#efbd77',light:'#a8ddd0'};
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);c.strokeStyle=C.ink;c.lineWidth=3;c.strokeRect(x,y,w,h);}
function line(c,x,y,a,b,color=C.cream,width=4){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();}
function label(c,text,x,y,color=C.cream){c.font='500 14px Barlow';c.textAlign='center';c.fillStyle=color;const t=c.getTransform(),left=-t.e/t.a+12,right=(c.canvas.width-t.e)/t.a-12,half=c.measureText(text).width/2;x=Math.max(left+half,Math.min(right-half,x));c.fillText(text,x,y);}
function weight(c,x,y,n=1,color=C.cream){rect(c,x-21,y-34,42,32,color);line(c,x-9,y-34,x-9,y-43);line(c,x+9,y-34,x+9,y-43);line(c,x-9,y-43,x+9,y-43);for(let i=0;i<n;i++)rect(c,x-13+i*9,y-25,5,12,C.teal);}
export function drawPuzzle(c,r,s,time){
 const d=PUZZLES[r.id];if(!d)return;const q=puzzleState(s);c.save();
 for(const l of puzzlePlatforms(s)){rect(c,l.x,l.y,l.w,l.h,l.id.startsWith('foam')?'#8ecfc2':C.teal);if(l.id.startsWith('moving')){line(c,l.x+45,220,l.x+45,l.y,C.cream,4);rect(c,l.x+8,l.y+24,l.w-16,16,q.flags[l.id]?C.light:C.amber);}}
 for(const a of d.stations){
  const x=a.x,y=a.y,active=q.complete||q.visits.includes(a.id),color=active?C.light:C.amber;
  if(a.kind==='eye'){line(c,x,y-32,x,y-8,C.cream,6);c.strokeStyle=color;c.lineWidth=5;c.beginPath();c.arc(x,y,13,0,7);c.stroke();continue;}
  if(a.kind==='pan'){const i=d.stations.indexOf(a),n=q.values[i]||0;line(c,x,y-65,x,y-25,C.cream,5);line(c,x-53,y-20,x+53,y-20,C.cream,5);rect(c,x-56,y-18,112,14,C.teal);for(let j=0;j<n;j++)weight(c,x-39+(j%4)*26,y-20-Math.floor(j/4)*32,1,j%2?C.cream:C.amber);label(c,String(n),x,y-96,color);}
  else if(a.kind==='valve'||a.kind==='vane'){rect(c,x-24,y-46,48,46,C.teal);c.save();c.translate(x,y-55);const i=d.stations.indexOf(a);c.rotate((q.values[i]||0)*Math.PI/2+(a.kind==='vane'?0:Math.PI/4));line(c,-26,0,26,0,color,7);line(c,0,-26,0,26,color,7);c.restore();if(a.kind==='vane'){line(c,x-14,y-80,x+22,y-80,color,3);line(c,x+22,y-80,x+12,y-88,color,3);}}
  else if(a.kind==='weight'||a.kind==='dummy'){const gone=q.flags['taken-'+a.id]||q.carry===a.id||q.flags[a.id]||a.id==='drum'&&(q.carry||q.flags.placed)||a.id==='weight'&&(q.carry||q.flags.loaded);if(!gone&&!(r.id===32&&!q.flags.first))weight(c,x,y,a.id==='four'?4:a.id==='two'?2:a.id.endsWith('c')?3:a.id.endsWith('b')?2:1,a.kind==='dummy'?'#e7c547':a.id==='four'?C.amber:a.id==='one'?C.teal:C.cream);}
  else if(a.kind==='lamp'){rect(c,x-28,y-54,56,52,C.teal);c.fillStyle='#e6d59055';c.beginPath();c.arc(x,y-65,86,0,7);c.fill();rect(c,x-14,y-68,28,19,C.amber);}
  else if(a.kind==='tray'){const i=d.stations.indexOf(a),n=q.values[i];rect(c,x-48,y-17,96,15,C.teal);for(let j=0;j<n;j++){c.fillStyle=C.cream;c.beginPath();c.ellipse(x+(j-(n-1)/2)*33,y-25,14,7,0,0,7);c.fill();}}
  else if(a.kind==='rail'){const i=d.stations.indexOf(a);line(c,x-38,y-8,x+38,y-8,C.teal,16);line(c,x-32,y-18,q.values[i]?x+32:x-32,q.values[i]?y-18:y-82,color,7);}
  else if(['short','long','low','high','quiet'].includes(a.kind)){rect(c,x-28,y-54,56,52,a.kind==='quiet'?C.ink:C.teal);const n=a.kind==='long'?3:a.kind==='high'?2:1;for(let j=0;j<n;j++)rect(c,x-17+j*13,y-42,8,a.kind==='long'?29:14,color);}
  else if(a.kind==='cradle'){rect(c,x-45,y-20,90,20,C.teal);line(c,x-42,y-20,x-42,y-61,color,4);line(c,x+42,y-20,x+42,y-61,color,4);for(const [i,load]of(q.loads?.[a.id]||[]).entries())weight(c,x+(i-.5)*35,y-20,load==='four'?4:load==='two'?2:1,load==='four'?C.amber:C.cream);}
  else if(a.kind==='plate'){rect(c,x-42,y-10,84,10,q.flags.plate?C.light:C.amber);}
  else {rect(c,x-23,y-53,46,52,C.teal);line(c,x-14,y-34,x+14,y-34,color,5);if(a.kind==='catch'){c.strokeStyle=color;c.lineWidth=4;c.beginPath();c.arc(x,y-65,12,.2,Math.PI*1.8);c.stroke();}else if(a.kind==='crank'){line(c,x,y-35,x+31,y-66,color,6);rect(c,x+24,y-74,15,18,C.cream);}}
  if(!q.complete){const words=a.id==='finish'?'CHECK':a.kind==='pan'?'LOAD':a.kind==='catch'?'LINE':a.kind==='valve'?'FLOW':a.kind==='vane'?'TURN':a.kind==='weight'?'CARRY':a.kind==='lamp'?'LIGHT':a.kind==='quiet'?'EMPTY':a.kind==='cradle'?'CRADLE':a.kind==='tray'?'PLACES':'';if(words)label(c,words,x,y-103,color);}
 }
 if(q.carry||q.held!==null){const p=s.player;weight(c,p.x+p.facing*28,p.y-40,1,C.amber);}
 if(d.kind==='shutter-run'){
  rect(c,850,q.flags.running?-600:-4,45,604,C.teal);for(let y=20;y<570;y+=45)rect(c,855,(q.flags.running?-600:0)+y,35,12,C.amber);
  if(q.flags.running){rect(c,235,390,650,10,C.ink);c.fillStyle=C.amber;c.fillRect(235,390,650*Math.max(0,q.flags.remaining)/(s.settings.assist?9.2:7.8),10);}
 }
 if(d.kind==='dark')for(const watcher of q.watchers||[]){if(watcher.hits)continue;const phase=((s.roomTime||0)+watcher.index*1.7)%5;rect(c,watcher.x-36,watcher.y-26,72,40,C.teal);rect(c,watcher.x-12,watcher.y-14,24,13,phase>2?C.amber:C.light);if(phase>2&&phase<3.6){c.setLineDash([7,7]);line(c,watcher.x,watcher.y,s.player.x,s.player.y-65,'#efbd7788',2);c.setLineDash([]);}}
 if(q.pull){c.strokeStyle=C.amber;c.lineWidth=4;c.beginPath();c.arc(s.player.x,s.player.y-85,24,-Math.PI/2,-Math.PI/2+q.pull/.55*Math.PI*2);c.stroke();}
 c.restore();
}
export function drawPuzzleForeground(){/* Foreground assets are owned by the renderer. */}
