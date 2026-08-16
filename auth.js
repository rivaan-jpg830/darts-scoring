"use strict";


/* =========================================================
   DART HUB AUTH LOADER
   VERSION 22
========================================================= */


function loadDartHubScript(
    src
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const script =
                document.createElement(
                    "script"
                );


            script.src =
                src;


            script.onload =
                () => {

                    console.log(
                        `Dart Hub loaded: ${src}`
                    );


                    resolve();
                };


            script.onerror =
                () => {

                    reject(
                        new Error(
                            `Could not load ${src}`
                        )
                    );
                };


            document.body.appendChild(
                script
            );
        }
    );
}


/* =========================================================
   START DART HUB V22
========================================================= */

async function startDartHubV22() {

    try {

        await loadDartHubScript(
            "./auth-core.js"
        );


        await loadDartHubScript(
            "./players.js"
        );


        console.log(
            "Dart Hub v22 ready."
        );


    } catch (
        error
    ) {

        console.error(
            "Dart Hub startup error:",
            error
        );


        alert(
            "Dart Hub could not start correctly. Please refresh the page."
        );
    }
}


startDartHubV22();