"use strict";


/* =========================================================
   DART HUB SCRIPT LOADER
========================================================= */


function loadDartHubScript(src) {

    return new Promise(
        (resolve, reject) => {

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
   START DART HUB
========================================================= */


async function startDartHub() {

    try {

        /*
           LOGIN
           SUPABASE
           CLOUD PROFILE
        */

        await loadDartHubScript(
            "./auth-core.js"
        );


        /*
           REGISTERED PLAYERS
           PLAYER CODES
           MATCH IDENTITY
           RESULT CONFIRMATIONS FOUNDATION
        */

        await loadDartHubScript(
            "./players.js"
        );


        /*
           MULTI-GAME PROFILE STATS
           CRICKET CLOUD SUPPORT
           CONFIRMATION PAGE
           RIVALS
           101 / 301 / 501 STATS
        */

        await loadDartHubScript(
            "./features.js"
        );


        /*
           LIVE SCORE
           SECOND SCREEN
        */

        await loadDartHubScript(
            "./live.js"
        );


        console.log(
            "🎯 Dart Hub ready."
        );


    } catch (
        error
    ) {

        console.error(
            "Dart Hub startup error:",
            error
        );


        alert(

            "Dart Hub could not start correctly.\n\n" +

            "Please refresh the page."
        );
    }
}


startDartHub();