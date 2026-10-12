(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FightAssets=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function create(load){
  const cache=new Map();
  function get(path){if(!cache.has(path)){const request=Promise.resolve().then(()=>load(path)).catch(error=>{cache.delete(path);throw error});cache.set(path,request)}return cache.get(path)}
  return {get,group:paths=>Promise.all(paths.map(get))};
 }
 function loadImage(path,make=()=>new Image(),schedule=setTimeout,cancel=clearTimeout){
  return new Promise((resolve,reject)=>{
   const img=make();let done=false;
   const finish=error=>{if(done)return;done=true;cancel(timer);img.onload=img.onerror=null;if(error){img.src='';reject(error)}else resolve(img)};
   const timer=schedule(()=>finish(new Error('Artwork request timed out')),20000);
   img.onload=()=>finish();img.onerror=()=>finish(new Error('Artwork request failed'));img.src=path;
  });
 }
 return {create,loadImage};
});
