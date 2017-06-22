//Tutorial  used fpr this file = https://developers.google.com/web/fundamentals/getting-started/primers/service-workers
const CACHE_NAME = 'jpeer-cache'
let urlsToCache = [
  '/index.html',
  '/favicon.ico',
  '/assets/js/app.js',
  '/assets/js/main.js',
  '/assets/js/template.js',
  '/assets/js/vendor.js',
  '/assets/fonts/fontawesome-webfont.eot',
  '/assets/css/global.css',
  '/assets/img/balloons.svg',
  '/assets/img/ci.png',
  '/assets/img/code.svg',
  '/assets/img/github-logo.png',
  '/assets/img/logo.svg',
  '/assets/img/me_bw.png',
  '/assets/img/og_jpeer.jpg',
  '/assets/img/promo_5.png',
  '/assets/img/responsive-default.png',
  '/assets/img/projects/portalbee.jpg',
  '/assets/img/projects/prazna.jpg',
  '/assets/img/projects/railroad-medium.png',
  '/assets/img/projects/railroad.png',
  '/assets/img/projects/schwarzkoenig-medium.png',
  '/assets/img/projects/schwarzkoenig.png',
  '/assets/img/projects/somnia.jpg',
  '/assets/img/projects/volxpop.jpg',
  '/assets/img/slider/fish.jpg',
  '/assets/img/slider/hoverfly.jpg',
  '/i18n/locale-de-de.json',
  '/i18n/locale-en-us.json',
]

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then( cache => cache.addAll(urlsToCache) )
  )
})


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then( response => {
        // Cache hit - return response
        if (response) {
          return response
        }

        const fetchRequest = event.request.clone()

        return fetch(fetchRequest).then( response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            const responseToCache = response.clone()

            // Cache new requests cumulatively
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache)
              })

            return response
          }
        )
      })
    )
})
