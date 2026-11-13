const C='japan-2026-v43';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.webmanifest','icon.svg'])));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
const put=(k,r)=>caches.open(C).then(c=>c.put(k,r));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
 const isFont=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
 const isImg=u.hostname==='thumb.wikimedia.org'||u.hostname==='upload.wikimedia.org';
 // Яндекс Диск: список файлов — сначала сеть, без сети — последний сохранённый
 if(u.hostname==='cloud-api.yandex.net'){e.respondWith(fetch(e.request).then(r=>{if(r.ok)put(e.request,r.clone());return r}).catch(()=>caches.match(e.request).then(r=>r||Response.error())));return}
 // превью наших фото: ссылки подписаны и меняются, поэтому храним по пути файла и размеру
 if(u.hostname==='downloader.disk.yandex.ru'&&u.pathname.startsWith('/preview/')){
  const p=u.searchParams,h=p.get('hash')||p.get('filename');
  const k=h?new Request('https://ya-preview.local/'+encodeURIComponent(h)+'/'+(p.get('size')||'')+'/'+(p.get('crop')||'')):e.request;
  e.respondWith(caches.match(k).then(c=>c||fetch(e.request.url,{mode:'cors',credentials:'omit'}).then(r=>{if(r.ok)put(k,r.clone());return r}).catch(()=>fetch(e.request))));return}
 if(isImg){e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(x=>x.put(e.request,cp));return r})));return}
 if(u.origin===location.origin||isFont){e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))))}});
