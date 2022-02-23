console.warn("code Ready!! boyz!!")
let appVersion = 'v0.0.1'
let cacheData = 'appV4';
this.addEventListener("install", (event) => {
    console.log("sw install",event)
    event.waitUntil(
        caches.open(cacheData).then((cache)=> {
            cache.addAll([
                '/wordleclone/index.js',
                '/wordleclone/',
                '/wordleclone/style.css',
                '/wordleclone/manifest.json',
                '/wordleclone/mostused.json',
                '/wordleclone/words.json',
                '/wordleclone/sw.js',
                'https://img.icons8.com/material-outlined/24/000000/help.png',
                'https://img.icons8.com/external-kmg-design-basic-outline-kmg-design/32/000000/external-setting-business-management-kmg-design-basic-outline-kmg-design.png',
                'https://img.icons8.com/external-neu-royyan-wijaya/32/000000/external-competition-neu-game-neu-royyan-wijaya.png',
                'https://aravin008.github.io/wordleclone/close_white.svg',
                'https://aravin008.github.io/wordleclone/share_icon.png',
                'https://aravin008.github.io/wordleclone/favicon.png',
                'https://aravin008.github.io/wordleclone/logo_196x196.png',
                'https://img.icons8.com/pastel-glyph/344/download.png',
                'https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@600&display=swap'
            ])
        })
    )
})

this.addEventListener('fetch', (event) => {
    if(!navigator.onLine) {
        console.log("inside offline")
        if(event.request.url == 'https://aravin008.github.io/index.js') {
        // event.waitUntil(
        //     this.registration.showNotification('Hello!',{
        //         body: 'Hello!!! from notification block.'
        //     })
        // )
        console.log('You are offline!')
    }
    event.respondWith(
        caches.match(event.request).then((resp)=> {
            if(resp) {
                return resp;
            }
            const requestUrl = event.request.clone();
            fetch(requestUrl)
        })
    )
}
})


self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
        return Promise.all(
            cacheNames.filter(function(cacheName) {
            // Return true if you want to remove this cache,
            // but remember that caches are shared across
            // the whole origin
            console.log("checking old cache",cacheName)
            return cacheName != cacheData;
            }).map(function(cacheName) {
            return caches.delete(cacheName);
            })
        );
        })
    );
});