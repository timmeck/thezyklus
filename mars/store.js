const KEY='mars-cadet-year-v2';
const fresh=()=>({version:2,name:'CADET',portrait:'rook',completed:[],checkpoints:{},fragments:[],assist:false});
let value=fresh(),available=true;
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved?.version===2){
 value.name=typeof saved.name==='string'?saved.name.slice(0,24):'CADET';
 value.completed=[...new Set((Array.isArray(saved.completed)?saved.completed:[]).filter(n=>[1,2,3].includes(n)))];
 value.fragments=[...new Set((Array.isArray(saved.fragments)?saved.fragments:[]).filter(n=>[1,2,3].includes(n)))];
 for(const [n,s] of Object.entries(saved.checkpoints||{}))if([1,2,3].includes(+n)&&Number.isInteger(s)&&s>=0&&s<4)value.checkpoints[n]=s;
 value.assist=saved.assist===true;
 value.portrait=['rook','iona','pip'].includes(saved.portrait)?saved.portrait:'rook';
}}catch{available=false;}
export const store={
 get data(){return structuredClone(value);},get available(){return available;},
 update(fn){fn(value);try{localStorage.setItem(KEY,JSON.stringify(value));available=true;}catch{available=false;}window.dispatchEvent(new CustomEvent('cadet-update',{detail:structuredClone(value)}));},
 reset(){value=fresh();try{localStorage.removeItem(KEY);}catch{}window.dispatchEvent(new CustomEvent('cadet-update',{detail:structuredClone(value)}));}
};
