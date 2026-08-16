"use strict";


/* =========================================================
   DART HUB SERVICE WORKER
========================================================= */

const CACHE_NAME =
    "dart-hub-v15";


const APP_FILES = [

    "./",

    "./index.html",

    "./style.css",

    "./script.js",

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


        /*
           Activate immediately rather
           than waiting for old version.
        */

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
                    names =>

                        Promise.all(

                            names.map(
                                name => {

                                    if (
                                        name !==
                                        CACHE_NAME
                                    ) {

                                        return caches.delete(
                                            name
                                        );
                                    }


                                    return null;
                                }
                            )
                        )
                )
        );


        self.clients.claim();
    }
);


/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
    "fetch",
    event => {

        /*
           Only deal with GET requests.
        */

        if (
            event.request.method !==
            "GET"
        ) {

            return;
        }


        event.respondWith(

            fetch(
                event.request
            )

                .then(
                    response => {

                        /*
                           Save a fresh copy
                           for offline use.
                        */

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


                        return response;
                    }
                )

                .catch(
                    async () => {

                        /*
                           Internet unavailable:
                           use saved copy.
                        */

                        const cached =
                            await caches.match(
                                event.request
                            );


                        if (
                            cached
                        ) {

                            return cached;
                        }


                        /*
                           For page navigation,
                           return main app.
                        */

                        if (
                            event.request.mode ===
                            "navigate"
                        ) {

                            return caches.match(
                                "./index.html"
                            );
                        }


                        throw new Error(
                            "Dart Hub resource unavailable offline."
                        );
                    }
                )
        );
    }
);