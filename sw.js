/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-502d094c'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "assets/auth-DfaNlCNk.js",
    "revision": null
  }, {
    "url": "assets/content-DebQ8zGx.js",
    "revision": null
  }, {
    "url": "assets/date-utils-CC6jIWvy.js",
    "revision": null
  }, {
    "url": "assets/index-BToIhzLB.js",
    "revision": null
  }, {
    "url": "assets/index-Cthy4lun.css",
    "revision": null
  }, {
    "url": "assets/react-vendor-BHITmJO2.js",
    "revision": null
  }, {
    "url": "assets/SimpleLoginPage-rBfT_hyG.js",
    "revision": null
  }, {
    "url": "assets/storage-BYZjRI_p.js",
    "revision": null
  }, {
    "url": "assets/ui-utils-D3bzjhVe.js",
    "revision": null
  }, {
    "url": "assets/utils-gVHD05Os.js",
    "revision": null
  }, {
    "url": "assets/WeightPage-B9yFmb2g.js",
    "revision": null
  }, {
    "url": "clear-db.html",
    "revision": "ac7caf979bb0ea0032bc783de250c577"
  }, {
    "url": "icons/logo.png",
    "revision": "fbe4178e76c78039d172858222f94f36"
  }, {
    "url": "icons/logo1024.png",
    "revision": "d59fe433f876ef555301fe7ccd01f9e5"
  }, {
    "url": "icons/logo192.png",
    "revision": "ae88630356e78421c783ec42c4b55ff7"
  }, {
    "url": "icons/logo512.png",
    "revision": "ef5b437e3e431ea99bcd17708bd35ad0"
  }, {
    "url": "icons/perfect_zenkai_favicon.ico",
    "revision": "c68b95d7d16e648c4fd78af28a4b6dc9"
  }, {
    "url": "icons/perfect_zenkai_favicon.svg",
    "revision": "6bdffe247c529d4f7bf45ceba215b99a"
  }, {
    "url": "index.html",
    "revision": "6f50a70f06c656af6a466b9184a9e91f"
  }, {
    "url": "pwa-192x192.png",
    "revision": "7215ee9c7d9dc229d2921a40e899ec5f"
  }, {
    "url": "pwa-512x512.png",
    "revision": "7215ee9c7d9dc229d2921a40e899ec5f"
  }, {
    "url": "pwa-debug.html",
    "revision": "7d53cb2cd38a97d16807ee03e8044985"
  }, {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "sw-debug.html",
    "revision": "d90d6a9fcc16a66a6787dd2778cd7e97"
  }, {
    "url": "icons/logo192.png",
    "revision": "ae88630356e78421c783ec42c4b55ff7"
  }, {
    "url": "icons/logo512.png",
    "revision": "ef5b437e3e431ea99bcd17708bd35ad0"
  }, {
    "url": "icons/perfect_zenkai_favicon.ico",
    "revision": "c68b95d7d16e648c4fd78af28a4b6dc9"
  }, {
    "url": "icons/perfect_zenkai_favicon.svg",
    "revision": "6bdffe247c529d4f7bf45ceba215b99a"
  }, {
    "url": "manifest.webmanifest",
    "revision": "fc342456c2bc550d482c8bc9e0e8c04b"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    })]
  }), 'GET');
  workbox.registerRoute(/\.(?:png|jpg|jpeg|svg|gif|webp)$/, new workbox.CacheFirst({
    "cacheName": "images-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 2592000
    })]
  }), 'GET');
  workbox.registerRoute(/\.(?:js|css)$/, new workbox.StaleWhileRevalidate({
    "cacheName": "static-resources-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 604800
    })]
  }), 'GET');

}));
//# sourceMappingURL=sw.js.map
