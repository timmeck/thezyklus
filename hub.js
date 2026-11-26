// The static programme stays readable without JavaScript. This updates only its next slot.
(() => {
  const legacy={watch:'/zyklus/#watch',play:'/zyklus/#play',world:'/zyklus/#world',people:'/people/'};
  const route=()=>{if(legacy[location.hash.slice(1)])location.replace(legacy[location.hash.slice(1)]);};
  route();addEventListener('hashchange',route);
  function updateProgramme(){
    // „Next on air“ comes from the episodes actually scheduled (data-at), never from the weekly grid.
    const up=[...document.querySelectorAll('.upcoming[data-at]')];
    const now=Date.now();
    for(const el of up){if(Date.parse(el.dataset.at)<=now)el.hidden=true;}
    const next=up.find(el=>Date.parse(el.dataset.at)>now);
    const label=document.getElementById('next-broadcast');
    const slots=[...document.querySelectorAll('.programme-slot[data-day][data-hour]')];
    for(const el of slots){el.classList.remove('is-next');const l=el.querySelector('.next-label');if(l)l.textContent='';}
    if(!next||!label)return;
    const at=new Date(next.dataset.at);
    const f=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
    const p=Object.fromEntries(f.formatToParts(at).map(x=>[x.type,x.value]));
    label.textContent=next.dataset.label+' · '+p.weekday+' '+p.day+' '+p.month+' · '+p.hour+':'+p.minute;
    label.href=next.getAttribute('href');
    const wd=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(p.weekday);
    const hit=slots.find(el=>Number(el.dataset.day)===wd&&Number(el.dataset.hour)===Number(p.hour));
    if(hit){hit.classList.add('is-next');const l=hit.querySelector('.next-label');if(l)l.textContent='Next';}
  }
  updateProgramme();setInterval(updateProgramme,60000);
})();
