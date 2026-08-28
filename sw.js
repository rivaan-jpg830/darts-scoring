"use strict";


/* =========================================================
   DART HUB SERVICE WORKER
========================================================= */

const CACHE_NAME =
    "dart-hub-main-v5";


const APP_FILES = [

    "./",

    "./index.html",

    "./style.css",

    "./script.js",

    "./auth.js",

    "./auth-core.js",

    "./players.js",

    "./features.js",

    "./live.js",

    "./board-practice.js",

    "./practice-safety.js",

    "./stats-extra.js",

    "./scoring-ui.js",

    "./menu.js",

    "./admin.js",

    "./manifest.json",

    "./icon.svg"
];



/* =========================================================
   INSTALL
========================================================= */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(
                    CACHE_NAME
                )

                .then(
                    cache =>
                        cache.addAll(
                            APP_FILES
                        )
                )
        );


        self.skipWaiting();
    }
);



/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()

                .then(
                    cacheNames =>

                        Promise.all(

                            cacheNames.map(
                                cacheName => {

                                    if (

                                        cacheName.startsWith(
                                            "dart-hub-"
                                        )

                                        &&

                                        cacheName !==
                                            CACHE_NAME
                                    ) {

                                        return caches.delete(
                                            cacheName
                                        );
                                    }


                                    return Promise.resolve();
                                }
                            )
                        )
                )

                .then(
                    () =>
                        self.clients.claim()
                )
        );
    }
);



/* =========================================================
   MESSAGE
========================================================= */

self.addEventListener(
    "message",
    event => {

        if (
            event.data?.type ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();
        }
    }
);



/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !==
            "GET"
        ) {

            return;
        }


        const requestURL =
            new URL(
                event.request.url
            );


        /*
           NEVER CACHE SUPABASE.
        */

        if (
            requestURL.hostname.includes(
                "supabase.co"
            )
        ) {

            return;
        }



        /* =================================================
           HTML PAGE
           NETWORK FIRST
        ================================================= */

        if (
            event.request.mode ===
            "navigate"
        ) {

            event.respondWith(

                fetch(
                    event.request
                )

                    .then(
                        response => {

                            const copy =
                                response.clone();


                            caches
                                .open(
                                    CACHE_NAME
                                )

                                .then(
                                    cache => {

                                        cache.put(
                                            "./index.html",
                                            copy
                                        );
                                    }
                                );


                            return response;
                        }
                    )

                    .catch(
                        async () => {

                            return (

                                await caches.match(
                                    "./index.html"
                                )

                                ||

                                await caches.match(
                                    "./"
                                )
                            );
                        }
                    )
            );


            return;
        }



        /* =================================================
           APP FILES
           NETWORK FIRST
        ================================================= */

        event.respondWith(

            fetch(
                event.request
            )

                .then(
                    response => {

                        if (

                            response

                            &&

                            (
                                response.status ===
                                200

                                ||

                                response.type ===
                                "opaque"
                            )
                        ) {

                            const copy =
                                response.clone();


                            caches
                                .open(
                                    CACHE_NAME
                                )

                                .then(
                                    cache => {

                                        cache.put(
                                            event.request,
                                            copy
                                        );
                                    }
                                );
                        }


                        return response;
                    }
                )

                .catch(
                    async () => {

                        const cached =
                            await caches.match(
                                event.request
                            );


                        if (
                            cached
                        ) {

                            return cached;
                        }


                        throw new Error(
                            "Dart Hub resource unavailable offline."
                        );
                    }
                )
        );
    }
);