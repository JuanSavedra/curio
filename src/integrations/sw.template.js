// Curiô's service worker: keeps the whole site on the device so it works offline.
// It is a template: the build (src/integrations/offline.ts) fills in the three values below and writes dist/sw.js.
const VERSION = '__VERSION__';
const BASE = '__BASE__';
const PRECACHE = __PRECACHE__;

const CACHE = `curio-${VERSION}`;

// A new version installs in the background and waits: it only takes over on the next visit
// (no skipWaiting), so nobody is interrupted mid-question and old pages never meet new files.
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })))),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((key) => key.startsWith('curio-') && key !== CACHE).map((key) => caches.delete(key)))),
	);
});

// Pages are saved as `/temas/`; the address may come without the final slash or with a query (`/?tema=...`).
function cacheKey(url) {
	const lastSegment = url.pathname.split('/').pop();
	const isPage = !lastSegment.includes('.');
	return url.origin + url.pathname + (isPage && !url.pathname.endsWith('/') ? '/' : '');
}

self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);
	// Only this site's own files; links to other sites (the "learn more" sources) go straight to the network
	if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;

	event.respondWith(
		caches.open(CACHE).then(async (cache) => {
			const saved = await cache.match(cacheKey(url));
			if (saved) return saved;
			try {
				return await fetch(request);
			} catch (error) {
				// Offline at an address that was never saved: show the feed instead of the browser's error page
				if (request.mode === 'navigate') {
					const home = await cache.match(self.location.origin + BASE);
					if (home) return home;
				}
				throw error;
			}
		}),
	);
});
