// Authored silhouettes. Solid mass, tunnels and machinery belong to collision,
// rather than being another picture behind the same three floating bars.
export const SHAPES = [
 {kind:'hall',title:'Gravity training',tiers:[[240,500,200],[520,400,180],[800,500,160]],blocks:[[390,600,130,240]],machine:'scrubber'},
 {kind:'stairs',title:'The rising gallery',tiers:[[180,500,170],[380,400,170],[580,300,180],[790,410,180]],blocks:[[380,400,170,420],[580,300,180,520]],machine:'drone'},
 {kind:'crawl',title:'Biscuit service duct',tiers:[[190,490,150],[840,490,140]],blocks:[[380,0,420,536]],machine:'scrubber'},
 {kind:'press',title:'Counterweight press',tiers:[[180,485,180],[430,375,200],[760,485,200]],blocks:[[465,0,130,230]],machine:'shutter'},
 {kind:'shaft',title:'Observation shaft',tiers:[[170,500,180],[390,390,180],[620,280,190],[810,170,170]],blocks:[[0,0,95,460],[1005,0,95,460]],machine:'drone'},
 {kind:'workshop',title:'Tool towers',tiers:[[230,490,260],[560,380,230],[840,490,160]],blocks:[[590,380,130,440]],machine:'scrubber'},
 {kind:'vault',title:'Recovery line vault',tiers:[[160,490,190],[470,380,180],[770,490,180]],blocks:[[430,0,240,170]]},
 {kind:'chasm',title:'The departure spine',tiers:[[160,490,170],[790,490,210]],blocks:[[0,0,180,220],[920,0,180,220]],machine:'drone'},
 {kind:'foam',title:'Pressure garden',tiers:[[190,480,180],[430,370,190],[710,470,200]],blocks:[[0,0,1100,180]],machine:'scrubber'},
 {kind:'wind',title:'Radiator colonnade',tiers:[[170,490,200],[430,385,190],[710,280,200]],blocks:[[450,0,100,205]],machine:'drone'},
 {kind:'lift',title:'Dock inspection lift',tiers:[[160,490,180],[430,375,210],[770,475,180]],blocks:[[0,0,130,380],[970,0,130,380]],machine:'shutter'},
 {kind:'cargo',title:'Cargo canyon',tiers:[[180,490,180],[430,380,190],[740,270,220]],blocks:[[430,380,190,440],[740,270,130,550]],machine:'scrubber'},
 {kind:'airlock',title:'Needlewake airlock',tiers:[[180,480,190],[450,370,200],[780,480,180]],blocks:[[360,0,90,250],[710,0,90,250]],machine:'shutter'},
 {kind:'mess',title:'Everybody gets a seat',tiers:[[180,490,200],[470,390,250],[810,490,170]],blocks:[[460,390,160,430]],machine:'scrubber'},
 {kind:'cradle',title:'Tools on high',tiers:[[160,490,190],[400,380,230],[760,490,190]],blocks:[[420,0,170,190]],machine:'drone'},
 {kind:'balcony',title:'Salvage balcony',tiers:[[180,480,190],[450,370,220],[780,480,190]],blocks:[[0,0,180,300]],machine:'drone'},
 {kind:'boss',title:'The reluctant caretaker',tiers:[[170,490,190],[400,380,190],[670,270,240]],blocks:[[980,0,120,390]]},
 {kind:'lift',title:'Return gantry lift',tiers:[[170,490,190],[440,380,220],[770,490,190]],blocks:[[485,0,90,200]],machine:'shutter'},
 {kind:'stores',title:'Flight stores maze',tiers:[[170,485,190],[430,375,220],[770,485,180]],blocks:[[430,375,100,445],[650,0,100,210]],machine:'scrubber'},
 {kind:'hangar',title:'Moth cradle',tiers:[[180,490,210],[460,380,230],[790,490,180]],blocks:[[0,0,150,270]],machine:'drone'},
 {kind:'launch',title:'The boarding bridge',tiers:[[180,490,200],[450,380,210],[760,490,200]],blocks:[[500,0,300,170]]},
 {kind:'threshold',title:'The square threshold',tiers:[[180,490,200],[440,380,220],[770,490,190]],blocks:[[370,0,80,235],[720,0,80,235]]},
 {kind:'dark',title:'The sleeping rails',tiers:[[170,490,190],[410,380,220],[730,270,230]],blocks:[[410,380,110,440]],machine:'drone'},
 {kind:'contact',title:'Two short, one long',tiers:[[180,480,190],[450,370,210],[780,480,190]],blocks:[[420,0,250,170]],machine:'shutter'},
 {kind:'interval',title:'The held interval',tiers:[[180,490,210],[450,380,220],[780,270,200]],blocks:[[450,380,110,440]]},
 {kind:'low',title:'The low chamber',tiers:[[180,490,190],[430,390,220],[770,490,200]],blocks:[[350,0,450,230]],machine:'scrubber'},
 {kind:'high',title:'The high chamber',tiers:[[180,480,190],[450,370,220],[770,260,200]],blocks:[[450,370,110,450]],machine:'drone'},
 {kind:'cathedral',title:'The listening chamber',tiers:[[160,490,190],[430,380,220],[770,490,190]],blocks:[[0,0,100,400],[1000,0,100,400]]},
];

export function enrichRoom(room){
 const s=SHAPES[room.id]||SHAPES[room.id%7];room.shape=s.kind;room.subtitle=s.title;room.blocks=(s.blocks||[]).map(([x,y,w,h])=>({x,y,w,h}));
 room.platforms=room.platforms.filter(p=>p.y===600);
 for(const [x,y,w] of s.tiers)room.platforms.push({id:`${room.id}-tier-${x}`,x,y,w,h:24,active:true});
 // Walkable architecture: low decks have real underpasses; the central high
 // dock rises from a solid machinery plinth. The player chooses over or under.
 if(room.id!==7){
  for(const [x,y,w] of s.tiers.filter(t=>t[1]>=470)){
   room.blocks.push({x,y:y+12,w,h:22});
  }
  const t=s.tiers[1];
  if(![2,6,16].includes(room.id)&&t[1]<470&&!room.blocks.some(b=>b.y===t[1]))room.blocks.push({x:t[0]+Math.round(t[2]*.28),y:t[1],w:Math.round(t[2]*.44),h:600-t[1]});
 }
 if(s.tiers.at(-1)[1]<400){room.platforms.push({id:`${room.id}-return-low`,x:945,y:490,w:100,h:24,active:true},{id:`${room.id}-return-high`,x:910,y:380,w:100,h:24,active:true});}
 // Align existing story interactions to actual new authored footholds.
 room.challenges.forEach((c,i)=>{if(room.id!==3){const t=s.tiers[Math.min(i+1,s.tiers.length-1)];c.x=t[0]+t[2]/2;c.y=t[1]}});
 if(room.challenges.length===3)room.challenges.forEach((c,i)=>{const t=s.tiers[i];c.x=t[0]+t[2]/2;c.y=t[1]});
 if(room.seal){const t=s.tiers[1];room.sealX=t[0]+t[2]/2;room.sealY=t[1]}
 room.machine=s.machine||null;room.spark=[9,18,23,26].includes(room.id);
 room.foam=s.kind==='foam'||s.kind==='low';room.wind=['wind','airlock','balcony'].includes(s.kind);room.dark=s.kind==='dark';
 room.lift=s.kind==='lift'?{x:650,y:560,w:110,h:24,id:`lift-${room.id}`,active:true}:null;
 if(room.secret){room.collectibleX=room.id===4?870:room.id===11?840:room.id===16?805:840;room.collectibleY=room.id===4?115:room.id===11?215:room.id===16?215:215;room.secretLatch={x:550,y:380};}
 else if(room.collectible){const t=s.tiers[1];room.collectibleX=t[0]+t[2]/2;room.collectibleY=t[1]-45;}
 if(room.id===16){room.challenges=[];room.task='Caretaker: jump the brush, hold LINE at the amber eye, pull three catches.';room.midboss=true;}
 room.contactX=room.id===26?850:550;room.contactY=room.id===26?260:room.id===25?570:600;
 if(room.id===23){room.contactX=555;room.contactY=370;}
 if(room.id===25)room.contactX=700;
 room.npcX=s.tiers[0][0]+s.tiers[0][2]/2;room.npcY=s.tiers[0][1];
 room.anchor={x:room.id===7?560:550,y:room.id===7?220:170};
 if(room.id===2)room.anchor={x:260,y:250};
 return room;
}
