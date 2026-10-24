// Menyimpan "bingkai" aplikasi supaya tetap bisa dibuka (dan menampilkan pesan) saat internet putus.
// Isi Monitor Kelas sendiri selalu diambil langsung dari Google, tidak disimpan di sini.
const CACHE = 'ec-app-v2';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'ikon-192.png', 'ikon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // utamakan versi terbaru dari internet, pakai simpanan bila sedang offline
  e.respondWith(fetch(req).then(res => {
    const salin = res.clone();
    caches.open(CACHE).then(c => c.put(req, salin));
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});
