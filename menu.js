"use strict";


/* =========================================================
   DART HUB MENU
   Main navigation + Play screen

   Permanent file:
   menu.js

   This file does NOT contain game logic.
   It reorganises the existing Dart Hub homepage
   and moves the existing game-mode buttons into
   a dedicated Play screen.
========================================================= */


/* =========================================================
   SETTINGS
========================================================= */

const DART_HUB_MENU = {

    playScreenId:
        "dart-hub-play-screen",

    playButtonId:
        "dart-hub-main-play-button",

    styleId:
        "dart-hub-menu-styles",

    originalModeScreenId:
        "mode-screen"
};



/* =========================================================
   CREATE STYLES
========================================================= */

function installDartHubMenuStyles() {

    if (
        document.getElementById(
            DART_HUB_MENU.styleId
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        DART_HUB_MENU.styleId;


    style.textContent = `

        /* ================================================
           MAIN PLAY BUTTON
        ================================================= */

        #dart-hub-main-play-button {

            width: 100%;

            min-height: 72px;

            margin-bottom: 4px;

            border: 1px solid #00aaff;

            border-radius: 12px;

            background:
                linear-gradient(
                    135deg,
                    #007fc1,
                    #005886
                );

            color: white;

            font-size: 23px;

            font-weight: 1000;

            letter-spacing: 1px;

            cursor: pointer;

            box-shadow:
                0 0 18px
                rgba(
                    0,
                    170,
                    255,
                    0.18
                );
        }


        #dart-hub-main-play-button:hover {

            background:
                linear-gradient(
                    135deg,
                    #009ce8,
                    #006ba3
                );

            box-shadow:
                0 0 22px
                rgba(
                    0,
                    170,
                    255,
                    0.35
                );
        }


        #dart-hub-main-play-button:active {

            transform:
                scale(
                    0.985
                );
        }



        /* ================================================
           PLAY SCREEN
        ================================================= */

        #dart-hub-play-screen {

            position: fixed;

            inset: 0;

            z-index: 17500;

            overflow-y: auto;

            padding:
                14px;

            background:
                radial-gradient(
                    circle at top,
                    #172c39 0%,
                    #080d10 48%,
                    #020303 100%
                );

            color: white;
        }


        #dart-hub-play-screen.hidden {

            display:
                none !important;
        }


        .dart-hub-play-container {

            width:
                min(
                    720px,
                    100%
                );

            margin:
                0 auto;

            padding-bottom:
                40px;
        }



        /* ================================================
           PLAY HEADER
        ================================================= */

        .dart-hub-play-header {

            display: grid;

            grid-template-columns:
                auto
                1fr
                auto;

            align-items: center;

            gap: 10px;

            margin-bottom:
                22px;
        }


        .dart-hub-play-back {

            min-height: 43px;

            padding:
                7px
                12px;

            border:
                1px solid
                #344852;

            border-radius:
                8px;

            background:
                #111a1f;

            color:
                white;

            font-weight:
                900;

            cursor:
                pointer;
        }


        .dart-hub-play-header-centre {

            text-align:
                center;
        }


        .dart-hub-play-icon {

            font-size:
                42px;

            line-height:
                1;
        }


        .dart-hub-play-title {

            margin-top:
                4px;

            color:
                #00aaff;

            font-size:
                28px;

            font-weight:
                1000;

            letter-spacing:
                1px;
        }


        .dart-hub-play-subtitle {

            margin-top:
                3px;

            color:
                #82949d;

            font-size:
                12px;
        }


        .dart-hub-play-header-space {

            width:
                75px;
        }



        /* ================================================
           GAME MODE AREA
        ================================================= */

        .dart-hub-game-list {

            display:
                flex;

            flex-direction:
                column;

            gap:
                12px;
        }


        .dart-hub-game-card {

            position:
                relative;

            display:
                grid;

            grid-template-columns:
                55px
                1fr
                auto;

            align-items:
                center;

            gap:
                12px;

            min-height:
                92px;

            padding:
                14px;

            border:
                1px solid
                #2b414b;

            border-radius:
                13px;

            background:
                linear-gradient(
                    145deg,
                    #131d22,
                    #0b1013
                );

            text-align:
                left;

            cursor:
                pointer;

            transition:
                transform
                0.12s ease,
                border-color
                0.12s ease,
                box-shadow
                0.12s ease;
        }


        .dart-hub-game-card:hover {

            border-color:
                #00aaff;

            box-shadow:
                0 0 18px
                rgba(
                    0,
                    170,
                    255,
                    0.18
                );

            transform:
                translateY(
                    -1px
                );
        }


        .dart-hub-game-card:active {

            transform:
                scale(
                    0.99
                );
        }


        .dart-hub-game-icon {

            display:
                flex;

            align-items:
                center;

            justify-content:
                center;

            width:
                55px;

            height:
                55px;

            border-radius:
                50%;

            background:
                #07141b;

            font-size:
                30px;
        }


        .dart-hub-game-name {

            color:
                white;

            font-size:
                19px;

            font-weight:
                1000;
        }


        .dart-hub-game-description {

            margin-top:
                4px;

            color:
                #8799a1;

            font-size:
                11px;

            line-height:
                1.4;
        }


        .dart-hub-game-arrow {

            color:
                #00aaff;

            font-size:
                30px;

            font-weight:
                1000;
        }



        /* ================================================
           SPECIAL CARD ACCENTS
        ================================================= */

        .dart-hub-game-card[data-game="legs"] {

            border-left:
                4px solid
                #00aaff;
        }


        .dart-hub-game-card[data-game="sets"] {

            border-left:
                4px solid
                #f0b429;
        }


        .dart-hub-game-card[data-game="cricket"] {

            border-left:
                4px solid
                #00d47e;
        }



        /* ================================================
           FUTURE GAMES
        ================================================= */

        .dart-hub-future-games {

            margin-top:
                20px;

            padding:
                12px;

            border:
                1px dashed
                #31434b;

            border-radius:
                11px;

            background:
                rgba(
                    10,
                    17,
                    20,
                    0.65
                );

            text-align:
                center;
        }


        .dart-hub-future-title {

            color:
                #70838c;

            font-size:
                10px;

            font-weight:
                900;

            text-transform:
                uppercase;

            letter-spacing:
                1px;
        }


        .dart-hub-future-text {

            margin-top:
                5px;

            color:
                #53656d;

            font-size:
                11px;
        }



        /* ================================================
           EXISTING BUTTONS WHEN MOVED TO PLAY SCREEN

           We hide their original appearance because
           the game cards above trigger them instead.
        ================================================= */

        #dart-hub-original-game-buttons {

            display:
                none !important;
        }



        /* ================================================
           MOBILE
        ================================================= */

        @media (
            max-width:
            600px
        ) {

            #dart-hub-play-screen {

                padding:
                    8px;
            }


            .dart-hub-play-header {

                grid-template-columns:
                    auto
                    1fr;

                margin-bottom:
                    14px;
            }


            .dart-hub-play-header-space {

                display:
                    none;
            }


            .dart-hub-play-back {

                padding:
                    6px
                    9px;

                font-size:
                    12px;
            }


            .dart-hub-play-icon {

                font-size:
                    34px;
            }


            .dart-hub-play-title {

                font-size:
                    22px;
            }


            .dart-hub-game-card {

                grid-template-columns:
                    48px
                    1fr
                    auto;

                min-height:
                    83px;

                padding:
                    11px;

                gap:
                    9px;
            }


            .dart-hub-game-icon {

                width:
                    46px;

                height:
                    46px;

                font-size:
                    25px;
            }


            .dart-hub-game-name {

                font-size:
                    17px;
            }


            .dart-hub-game-description {

                font-size:
                    10px;
            }


            #dart-hub-main-play-button {

                min-height:
                    64px;

                font-size:
                    21px;
            }
        }

    `;


    document.head.appendChild(
        style
    );
}



/* =========================================================
   FIND EXISTING GAME BUTTONS

   We use text rather than assuming IDs because this keeps
   menu.js compatible with the existing Dart Hub structure.
========================================================= */

function findDartHubGameButtons() {

    const modeScreen =
        document.getElementById(
            DART_HUB_MENU.originalModeScreenId
        );


    if (
        !modeScreen
    ) {

        return {
            legs: null,
            sets: null,
            cricket: null
        };
    }


    const buttons =
        Array.from(
            modeScreen.querySelectorAll(
                "button"
            )
        );


    let legs =
        null;


    let sets =
        null;


    let cricket =
        null;


    buttons.forEach(
        button => {

            const text =
                String(
                    button.textContent ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            /*
               SETS MUST BE CHECKED BEFORE LEGS,
               because "Sets + Legs" also contains
               the word "legs".
            */

            if (
                !sets

                &&

                text.includes(
                    "sets"
                )

                &&

                text.includes(
                    "legs"
                )
            ) {

                sets =
                    button;


                return;
            }


            if (
                !cricket

                &&

                text.includes(
                    "cricket"
                )
            ) {

                cricket =
                    button;


                return;
            }


            if (
                !legs

                &&

                text.includes(
                    "legs"
                )

                &&

                !text.includes(
                    "sets"
                )
            ) {

                legs =
                    button;
            }
        }
    );


    return {
        legs,
        sets,
        cricket
    };
}



/* =========================================================
   HIDE OTHER DART HUB OVERLAY SCREENS
========================================================= */

function hideDartHubMenuScreens() {

    document
        .getElementById(
            DART_HUB_MENU.playScreenId
        )
        ?.classList
        .add(
            "hidden"
        );
}



/* =========================================================
   GO HOME
========================================================= */

function dartHubMenuGoHome() {

    hideDartHubMenuScreens();


    /*
       If features.js provides the standard home
       function, use it.
    */

    if (
        typeof v24GoHome ===
        "function"
    ) {

        v24GoHome();


        return;
    }


    /*
       Otherwise show the normal mode/home screen.
    */

    document
        .querySelectorAll(
            ".screen"
        )
        .forEach(
            screen => {

                screen.classList.add(
                    "hidden"
                );
            }
        );


    document
        .getElementById(
            DART_HUB_MENU.originalModeScreenId
        )
        ?.classList
        .remove(
            "hidden"
        );
}



/* =========================================================
   OPEN PLAY SCREEN
========================================================= */

function openDartHubPlayMenu() {

    /*
       Hide any feature overlays if that function exists.
    */

    if (
        typeof hideDartHubCommunityScreens ===
        "function"
    ) {

        hideDartHubCommunityScreens();
    }


    /*
       Hide normal Dart Hub screens.
    */

    if (
        typeof v24HideScreens ===
        "function"
    ) {

        v24HideScreens();
    }


    document
        .getElementById(
            DART_HUB_MENU.originalModeScreenId
        )
        ?.classList
        .add(
            "hidden"
        );


    const playScreen =
        document.getElementById(
            DART_HUB_MENU.playScreenId
        );


    if (
        playScreen
    ) {

        playScreen
            .classList
            .remove(
                "hidden"
            );
    }
}



/* =========================================================
   START EXISTING GAME MODE

   IMPORTANT:
   We don't recreate the old game logic.

   We simply click the ORIGINAL game button,
   meaning script.js continues doing exactly what
   it already did before menu.js existed.
========================================================= */

function startExistingDartHubGame(
    game
) {

    const gameButtons =
        findDartHubGameButtons();


    const button =
        gameButtons[
            game
        ];


    if (
        !button
    ) {

        alert(
            "Dart Hub could not find that game mode."
        );


        console.error(
            "Missing Dart Hub game button:",
            game
        );


        return;
    }


    /*
       Close the Play screen first.
    */

    hideDartHubMenuScreens();


    /*
       The original button may live inside the
       hidden home screen, but programmatic click()
       still fires its existing event listener.
    */

    button.click();
}



/* =========================================================
   CREATE PLAY SCREEN
========================================================= */

function createDartHubPlayScreen() {

    if (
        document.getElementById(
            DART_HUB_MENU.playScreenId
        )
    ) {

        return;
    }


    const screen =
        document.createElement(
            "div"
        );


    screen.id =
        DART_HUB_MENU.playScreenId;


    screen.className =
        "hidden";


    screen.innerHTML = `

        <div class="dart-hub-play-container">

            <div class="dart-hub-play-header">

                <button
                    id="dart-hub-play-back"
                    class="dart-hub-play-back"
                    type="button"
                >
                    ← Back
                </button>


                <div class="dart-hub-play-header-centre">

                    <div class="dart-hub-play-icon">
                        🎮
                    </div>


                    <div class="dart-hub-play-title">
                        PLAY
                    </div>


                    <div class="dart-hub-play-subtitle">
                        Choose your game mode
                    </div>

                </div>


                <div class="dart-hub-play-header-space"></div>

            </div>



            <div class="dart-hub-game-list">


                <!-- =====================================
                     LEGS
                ====================================== -->

                <div
                    id="dart-hub-play-legs"
                    class="dart-hub-game-card"
                    data-game="legs"
                    role="button"
                    tabindex="0"
                >

                    <div class="dart-hub-game-icon">
                        🎯
                    </div>


                    <div>

                        <div class="dart-hub-game-name">
                            Legs
                        </div>


                        <div class="dart-hub-game-description">
                            Play 101, 201, 301, 501 or a custom
                            starting score.
                        </div>

                    </div>


                    <div class="dart-hub-game-arrow">
                        ›
                    </div>

                </div>



                <!-- =====================================
                     SETS + LEGS
                ====================================== -->

                <div
                    id="dart-hub-play-sets"
                    class="dart-hub-game-card"
                    data-game="sets"
                    role="button"
                    tabindex="0"
                >

                    <div class="dart-hub-game-icon">
                        🏆
                    </div>


                    <div>

                        <div class="dart-hub-game-name">
                            Sets + Legs
                        </div>


                        <div class="dart-hub-game-description">
                            Traditional darts match using sets
                            and legs.
                        </div>

                    </div>


                    <div class="dart-hub-game-arrow">
                        ›
                    </div>

                </div>



                <!-- =====================================
                     CRICKET
                ====================================== -->

                <div
                    id="dart-hub-play-cricket"
                    class="dart-hub-game-card"
                    data-game="cricket"
                    role="button"
                    tabindex="0"
                >

                    <div class="dart-hub-game-icon">
                        🏏
                    </div>


                    <div>

                        <div class="dart-hub-game-name">
                            Cricket
                        </div>


                        <div class="dart-hub-game-description">
                            Play Dart Hub Cricket with batting,
                            bowling, wickets and innings.
                        </div>

                    </div>


                    <div class="dart-hub-game-arrow">
                        ›
                    </div>

                </div>

            </div>



            <div class="dart-hub-future-games">

                <div class="dart-hub-future-title">
                    More games coming
                </div>


                <div class="dart-hub-future-text">
                    New game modes can be added here without
                    making the Dart Hub homepage crowded.
                </div>

            </div>

        </div>
    `;


    document.body.appendChild(
        screen
    );



    /* =====================================================
       BACK
    ====================================================== */

    document
        .getElementById(
            "dart-hub-play-back"
        )
        .addEventListener(
            "click",
            dartHubMenuGoHome
        );



    /* =====================================================
       LEGS
    ====================================================== */

    document
        .getElementById(
            "dart-hub-play-legs"
        )
        .addEventListener(
            "click",
            () => {

                startExistingDartHubGame(
                    "legs"
                );
            }
        );



    /* =====================================================
       SETS
    ====================================================== */

    document
        .getElementById(
            "dart-hub-play-sets"
        )
        .addEventListener(
            "click",
            () => {

                startExistingDartHubGame(
                    "sets"
                );
            }
        );



    /* =====================================================
       CRICKET
    ====================================================== */

    document
        .getElementById(
            "dart-hub-play-cricket"
        )
        .addEventListener(
            "click",
            () => {

                startExistingDartHubGame(
                    "cricket"
                );
            }
        );



    /* =====================================================
       KEYBOARD ACCESS
    ====================================================== */

    screen
        .querySelectorAll(
            ".dart-hub-game-card"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "keydown",
                    event => {

                        if (
                            event.key ===
                            "Enter"

                            ||

                            event.key ===
                            " "
                        ) {

                            event.preventDefault();


                            card.click();
                        }
                    }
                );
            }
        );
}



/* =========================================================
   CREATE MAIN PLAY BUTTON
========================================================= */

function createDartHubMainPlayButton() {

    if (
        document.getElementById(
            DART_HUB_MENU.playButtonId
        )
    ) {

        return;
    }


    const modeScreen =
        document.getElementById(
            DART_HUB_MENU.originalModeScreenId
        );


    if (
        !modeScreen
    ) {

        console.warn(
            "Dart Hub menu: mode-screen not found."
        );


        return;
    }


    const modeButtons =
        modeScreen.querySelector(
            ".mode-buttons"
        );


    if (
        !modeButtons
    ) {

        console.warn(
            "Dart Hub menu: .mode-buttons not found."
        );


        return;
    }


    const existingGames =
        findDartHubGameButtons();


    /*
       We need at least one game button before
       reorganising the homepage.
    */

    if (
        !existingGames.legs

        &&

        !existingGames.sets

        &&

        !existingGames.cricket
    ) {

        console.warn(
            "Dart Hub menu: no existing game buttons found."
        );


        return;
    }



    /* =====================================================
       CREATE PLAY BUTTON
    ====================================================== */

    const playButton =
        document.createElement(
            "button"
        );


    playButton.id =
        DART_HUB_MENU.playButtonId;


    playButton.type =
        "button";


    playButton.innerHTML =
        "🎮 PLAY";


    playButton.addEventListener(
        "click",
        openDartHubPlayMenu
    );



    /* =====================================================
       INSERT PLAY AT TOP
    ====================================================== */

    modeButtons.insertBefore(
        playButton,
        modeButtons.firstChild
    );



    /* =====================================================
       HIDE ORIGINAL GAME BUTTONS

       We don't delete them because their existing
       click handlers contain the real game logic.

       Instead, put them in a hidden holder.
    ====================================================== */

    const holder =
        document.createElement(
            "div"
        );


    holder.id =
        "dart-hub-original-game-buttons";


    modeButtons.appendChild(
        holder
    );


    [

        existingGames.legs,

        existingGames.sets,

        existingGames.cricket

    ]
        .filter(
            Boolean
        )
        .forEach(
            button => {

                holder.appendChild(
                    button
                );
            }
        );
}



/* =========================================================
   KEEP PLAY SCREEN CLOSED WHEN OTHER FEATURES OPEN

   Some of your existing feature functions are global.
   We wrap the important ones so the Play overlay cannot
   remain sitting over Profile/Rivals/etc.
========================================================= */

function protectDartHubMenuNavigation() {

    const functionsToWrap = [

        "v24OpenProfile",

        "v24OpenStats",

        "v24OpenRivals",

        "v24OpenConfirmations",

        "openDartHubPlayerSearch",

        "openDartHubLeaderboards",

        "openWatchLive"

    ];


    functionsToWrap.forEach(
        functionName => {

            const original =
                window[
                    functionName
                ];


            if (
                typeof original !==
                "function"
            ) {

                return;
            }


            if (
                original
                    .__dartHubMenuWrapped
            ) {

                return;
            }


            const wrapped =
                function (
                    ...args
                ) {

                    hideDartHubMenuScreens();


                    return original.apply(
                        this,
                        args
                    );
                };


            wrapped
                .__dartHubMenuWrapped =
                    true;


            window[
                functionName
            ] =
                wrapped;
        }
    );
}



/* =========================================================
   INITIALISE
========================================================= */

function initialiseDartHubMenu() {

    installDartHubMenuStyles();


    createDartHubPlayScreen();


    createDartHubMainPlayButton();


    protectDartHubMenuNavigation();


    console.log(
        "Dart Hub menu ready."
    );
}



/* =========================================================
   START

   features.js adds some homepage buttons after load,
   so we wait briefly before reorganising the menu.
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setTimeout(
                initialiseDartHubMenu,
                1400
            );
        }
    );


} else {

    setTimeout(
        initialiseDartHubMenu,
        1400
    );
}