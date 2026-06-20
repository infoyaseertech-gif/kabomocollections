// KABOMO COLLECTIONS — Service Worker
// Version timestamp forces update on every deploy
const VERSION = 'kabomo-' + '20260620';
const CACHE = VERSION;
const FILES = ['/', '/index.html', '/manifest.json', '/kabomo_icon_192.png', '/kabomo_icon_512.png'];

// INSTALL — cache files immediately
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(FILES).catch(function(){}); })
      .then(function(){ return self.skipWaiting(); })
  );
});

// ACTIVATE — delete old caches, take control immediately  
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

// FETCH — network first, cache fallback
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  if(!e.request.url.startsWith('http')) return;

  // Supabase API — always network only
  if(e.request.url.includes('supabase.co')){
    e.respondWith(
      fetch(e.request).catch(function(){
        return new Response(JSON.stringify({error:'offline'}),
          {headers:{'Content-Type':'application/json'}});
      })
    );
    return;
  }

  // App files — network first, cache as backup
  e.respondWith(
    fetch(e.request).then(function(res){
      if(res && res.ok){
        var clone = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
      }
      return res;
    }).catch(function(){
      return caches.match(e.request)
        .then(function(cached){ return cached || caches.match('/index.html'); });
    })
  );
});

// MESSAGE — handle skip waiting from app
self.addEventListener('message', function(e){
  if(e.data && e.data.type === 'SKIP_WAITING'){
    self.skipWaiting();
  }
});
