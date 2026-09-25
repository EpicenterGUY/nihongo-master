// 日本語 MASTER service worker v10.8.0
const CACHE="nihongo-master-v10.8.0";
const SHELL=[
 "./",
 "./index.html",
 "./manifest.webmanifest",
 "./icon.svg",
 "./icon-maskable.svg",
 "./v10-vocab-data.js",
 "./v10-grammar-data.js",
 "./v104-extra-data.js",
 "./v105-extra-data.js",
 "./v105-extra-data.js",
 "./v10-core.js",
 "./pwa.js",
 "./v108-ui.js",
 "./version.json"
];

self.addEventListener("install",event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await Promise.allSettled(SHELL.map(async url=>{
   try{const r=await fetch(url,{cache:"reload"});if(r.ok)await cache.put(url,r.clone())}catch(e){}
  }));
  await self.skipWaiting();
 })());
});

self.addEventListener("activate",event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith("nihongo-master-")&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});

async function networkFirst(request){
 const cache=await caches.open(CACHE);
 try{
  const response=await fetch(request);
  if(response&&response.ok)cache.put(request,response.clone());
  return response;
 }catch(e){
  const hit=await cache.match(request,{ignoreSearch:true});
  if(hit)return hit;
  if(request.mode==="navigate"){
   const index=await cache.match("./index.html");
   if(index)return index;
  }
  throw e;
 }
}
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET")return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 event.respondWith(networkFirst(req));
});
