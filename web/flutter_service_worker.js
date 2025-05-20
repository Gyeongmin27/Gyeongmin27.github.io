'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter_bootstrap.js": "be10b2f8d22bf2908d4dbb3ce17f63ec",
"version.json": "b4e37baa6fbf4ee62d3a3b58ea97bd01",
"index.html": "7d68a97e358e1e2d81dece0f42be2508",
"/": "7d68a97e358e1e2d81dece0f42be2508",
"main.dart.js": "9ad6fd0d60f791de331df81d5f6bd6c4",
"flutter.js": "2a09505589bbbd07ac54b434883c2f03",
"favicon.png": "9f726797dcf1c9de468637bf59511d2b",
"icons/Icon-192.png": "04783a2a496f8d59b2cec8b61b2d8776",
"icons/Icon-maskable-192.png": "fccaee979ba206b99e6711e71759726a",
"icons/Icon-maskable-512.png": "2c00c710bf28883988384c952a8048fc",
"icons/Icon-512.png": "04783a2a496f8d59b2cec8b61b2d8776",
"manifest.json": "004e0fe31cfc897342ada2b17a5ad0eb",
"assets/AssetManifest.json": "7c7968c561be49e170c1f3463a32adc1",
"assets/NOTICES": "e34645e2bbd1a2bd0e2cfa345b7812c9",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/AssetManifest.bin.json": "7cb6969ac9415b0fd74ef28ec7c21fe5",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/AssetManifest.bin": "f32c32db72481dd8f112f4d90fa1be31",
"assets/fonts/MaterialIcons-Regular.otf": "c0ad29d56cfe3890223c02da3c6e0448",
"assets/assets/images/background/initial.png": "77fa31f3f7acc16e698d5cb6a84d8211",
"assets/assets/images/background/initial1.png": "99b9a3f1ba2a7b39d9faa467375bc991",
"assets/assets/images/button/4.png": "27ea3c59a1de58da7c64b4ce334db719",
"assets/assets/images/button/5.png": "ef92102bbcd8a4c4ab7eb60f4cf56196",
"assets/assets/images/button/6.png": "dbc301ae59c4509d847d76c141ca1ce1",
"assets/assets/images/button/2.png": "531b0d000fb95d30024f411399e4d7eb",
"assets/assets/images/button/3.png": "ae286ad3918a027f8e8d5e9912d07c10",
"assets/assets/images/button/1.png": "2b6a4da315fe933cef57e83575768cf3",
"assets/assets/images/logo/festival.png": "262963498ef4226fb4c91334545d3b82",
"assets/assets/images/logo/council.png": "18d58eef225cd6f0e50eeea51772d9c1",
"canvaskit/skwasm.js": "37fdb662bbaa915adeee8461576d69d7",
"canvaskit/skwasm_heavy.js": "f5c1413d222bc68856296fc97ac9fec0",
"canvaskit/skwasm.js.symbols": "125aee9d114fd9e5112c014f692c68ad",
"canvaskit/canvaskit.js.symbols": "2936d7d2db15db6f28983ad9ba5b5c25",
"canvaskit/skwasm_heavy.js.symbols": "4b7b0014e2354d4b63a0c258bc383e64",
"canvaskit/skwasm.wasm": "79cb11e9e271db0763efddfc4873fde9",
"canvaskit/chromium/canvaskit.js.symbols": "cd15dcee5c7cf52cfe1c94a3a6951936",
"canvaskit/chromium/canvaskit.js": "5e27aae346eee469027c80af0751d53d",
"canvaskit/chromium/canvaskit.wasm": "8d64b675b8312cc87fbd783584cca179",
"canvaskit/canvaskit.js": "140ccb7d34d0a55065fbd422b843add6",
"canvaskit/canvaskit.wasm": "aee0bb89f8db7cb2a12bdcbaf143b7c8",
"canvaskit/skwasm_heavy.wasm": "f70ace4b1b7391b2f4d004773d6917c6",
"canvaskit/skwasm.worker.js": "89990e8c92bcb123999aa81f7e203b1c"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
