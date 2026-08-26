"use strict";


/* =========================================================
   DART HUB SERVICE WORKER
   CLEAN FILE STRUCTURE
========================================================= */


const CACHE_NAME =
    "dart-hub-main-v3";


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

    "./manifest.json",

    "./board-practice.js",

    "./stats-extra.js",

    "./menu.js",

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
                    cache => {

                        return cache.addAll(
                            APP_FILES
                        );
                    }
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
                    cacheNames => {

                        return Promise.all(

                            cacheNames.map(
                                cacheName => {

                                    /*
                                       Delete all previous
                                       Dart Hub caches.
                                    */

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
                        );
                    }
                )

                .then(
                    () => {

                        return self.clients.claim();
                    }
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
            !event.data
        ) {

            return;
        }


        if (
            event.data.type ===
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

        /*
           Only cache GET requests.
        */

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
           SUPABASE MUST ALWAYS
           USE THE LIVE NETWORK.

           Authentication,
           database,
           match confirmations,
           profiles,
           rivals and realtime
           score updates must never
           be served from our app cache.
        */

        if (
            requestURL.hostname.includes(
                "supabase.co"
            )
        ) {

            return;
        }


        /*
           PAGE NAVIGATION

           Try network first.

           If Dart Hub is offline,
           use the cached main page.
        */

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

                            const cached =
                                await caches.match(
                                    "./index.html"
                                );


                            if (
                                cached
                            ) {

                                return cached;
                            }


                            return caches.match(
                                "./"
                            );
                        }
                    )
            );


            return;
        }


        /*
           DART HUB FILES

           Network first so updates
           appear immediately.

           Cache is used when offline.
        */

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