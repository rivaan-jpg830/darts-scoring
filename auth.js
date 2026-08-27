"use strict";


/* =========================================================
   DART HUB SCRIPT LOADER
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
   START DART HUB
========================================================= */

async function startDartHub() {

    try {


        /* =================================================
           LOGIN / ACCOUNT
        ================================================= */

        await loadDartHubScript(
            "./auth-core.js"
        );



        /* =================================================
           REGISTERED PLAYERS
        ================================================= */

        await loadDartHubScript(
            "./players.js"
        );



        /* =================================================
           PROFILES
           STATS
           RIVALS
           CONFIRMATIONS
           COMMUNITY
        ================================================= */

        await loadDartHubScript(
            "./features.js"
        );



        /* =================================================
           LIVE SCORE
        ================================================= */

        await loadDartHubScript(
            "./live.js"
        );



        /* =================================================
           BOARD TYPES
           AVERAGE PRACTICE
        ================================================= */

        await loadDartHubScript(
            "./board-practice.js"
        );



        /* =================================================
           EXTRA / BOARD STATS
        ================================================= */

        await loadDartHubScript(
            "./stats-extra.js"
        );



        /* =================================================
           IMPROVED SCORING UI

           Must load AFTER core Cricket/features.
        ================================================= */

        await loadDartHubScript(
            "./scoring-ui.js"
        );



        /* =================================================
           PLAY MENU

           Load last so every game exists first.
        ================================================= */

        await loadDartHubScript(
            "./menu.js"
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