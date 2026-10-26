const CACHE='timer-entreno-v34';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>fetch(new Request(f,{cache:'reload'})).then(r=>{if(r.ok)return c.put(f,r)})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
/* Con internet siempre trae la versión más nueva; sin internet (o muy lento) usa la copia guardada. */
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    try{
      const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),4000);
      const res=await fetch(r,{cache:'no-cache',signal:ctl.signal});
      clearTimeout(to);
      if(res&&res.ok){c.put(r,res.clone());return res}
      return (await c.match(r,{ignoreSearch:true}))||res;
    }catch(err){
      return (await c.match(r,{ignoreSearch:true}))||(await c.match('index.html'));
    }
  })());
});
