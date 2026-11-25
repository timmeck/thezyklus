// The static programme stays readable without JavaScript. This updates only its next slot.
(() => {
  const legacy={watch:'/zyklus/#watch',play:'/zyklus/#play',world:'/zyklus/#world',people:'/people/'};
  const route=()=>{if(legacy[location.hash.slice(1)])location.replace(legacy[location.hash.slice(1)]);};
  route();addEventListener('hashchange',route);
  function updateProgramme(){
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
    const weekday=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(parts.weekday);
    const now=weekday*1440+Number(parts.hour)*60+Number(parts.minute);
    const slots=[...document.querySelectorAll('[data-day][data-hour]')];
    const next=slots.map(el=>({el,delta:el.dataset.at?(Date.parse(el.dataset.at)-Date.now())/60000:(Number(el.dataset.day)*1440+Number(el.dataset.hour)*60+Number(el.dataset.minute||0)-now+10080)%10080||10080})).filter(x=>x.delta>0&&(!x.el.dataset.from||Date.now()+x.delta*60000>=Date.parse(x.el.dataset.from))).sort((a,b)=>a.delta-b.delta)[0];
    if(!next)return;
    for(const el of slots){const active=el===next.el;el.classList.toggle('is-next',active);el.querySelector('.next-label').textContent=active?'Next broadcast':'';}
    const label=document.getElementById('next-broadcast');
    const nextDate=new Date(Date.now()+next.delta*60000);
    label.textContent=next.el.dataset.title+' · '+new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',weekday:'short',day:'numeric',month:'short'}).format(nextDate)+' · '+next.el.dataset.hour.padStart(2,'0')+':'+(next.el.dataset.minute||'00').padStart(2,'0');
    label.href=next.el.getAttribute('href');
  }
  updateProgramme();setInterval(updateProgramme,60000);
})();
