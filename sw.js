/* Estoque Scanner - service worker (offline) */
const CACHE='estoque-v1';
const ASSETS=[
  './',
  './index.html',
  './manifest.webmanifest',
  './lib/zxing.min.js',
  './lib/xlsx.full.min.js',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon.png'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'){return;}
  const url=new URL(req.url);
  // never cache the Open Food Facts lookup
  if(url.hostname.indexOf('openfoodfacts')>=0){return;}
  // same-origin: cache-first
  if(url.origin===location.origin){
    e.respondWith(
      caches.match(req).then(hit=>hit||fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
        return res;
      }).catch(()=>caches.match('./index.html')))
    );
  }
});
