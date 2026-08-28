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

            /*
               Protection against accidental double loading.
            */

            const existing =
                Array.from(
                    document.scripts
                )
                .find(
                    script =>
                        script.src &&
                        script.src.endsWith(
                            src.replace(
                                "./",
                                "/"
                            )
                        )
                );


            if (
                existing &&
                existing.dataset.dartHubLoaded ===
                    "true"
            ) {

                resolve();

                return;
            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                src;


            script.dataset.dartHubLoaded =
                "true";


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
           PRACTICE BACKUP / SAFE CLOUD SAVE
        ================================================= */

        await loadDartHubScript(
            "./practice-safety.js"
        );



        /* =================================================
           EXTRA / BOARD STATS
        ================================================= */

        await loadDartHubScript(
            "./stats-extra.js"
        );



        /* =================================================
           SCORING UI
        ================================================= */

        await loadDartHubScript(
            "./scoring-ui.js"
        );



        /* =================================================
           PLAY MENU
        ================================================= */

        await loadDartHubScript(
            "./menu.js"
        );



        /* =================================================
           ADMIN

           Loads last because it uses:
           - authentication
           - profile screens
           - main menu
        ================================================= */

        await loadDartHubScript(
            "./admin.js"
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

            (
                error?.message ||
                "Please refresh the page."
            )
        );
    }
}


startDartHub();