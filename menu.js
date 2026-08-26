"use strict";


/* =========================================================
   DART HUB MENU
========================================================= */

const DH_MENU = {

    playScreen:
        "dart-hub-play-screen",

    playButton:
        "dart-hub-main-play-button",

    oldButtons:
        "dart-hub-original-game-buttons",

    style:
        "dart-hub-menu-style"
};



/* =========================================================
   STYLES
========================================================= */

function dhMenuInstallStyles() {

    if (
        document.getElementById(
            DH_MENU.style
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        DH_MENU.style;


    style.textContent = `

        #dart-hub-main-play-button {

            width: 100%;

            min-height: 70px;

            border: 1px solid #00aaff;

            border-radius: 11px;

            background:
                linear-gradient(
                    135deg,
                    #008ed1,
                    #005e91
                );

            color: white;

            font-size: 23px;

            font-weight: 1000;

            cursor: pointer;
        }


        #dart-hub-play-screen {

            position: fixed;

            inset: 0;

            z-index: 17500;

            overflow-y: auto;

            padding: 12px;

            background:
                radial-gradient(
                    circle at top,
                    #182c38,
                    #060a0d 50%,
                    #020303
                );

            color: white;
        }


        #dart-hub-play-screen.hidden {

            display: none !important;
        }


        .dh-play-page {

            width:
                min(
                    720px,
                    100%
                );

            margin: auto;

            padding-bottom: 40px;
        }


        .dh-play-header {

            display: grid;

            grid-template-columns:
                auto
                1fr
                auto;

            align-items: center;

            gap: 10px;

            margin-bottom: 18px;
        }


        .dh-play-back {

            min-height: 43px;

            padding: 7px 12px;

            border:
                1px solid #354850;

            border-radius: 8px;

            background: #11191d;

            color: white;

            font-weight: 900;

            cursor: pointer;
        }


        .dh-play-heading {

            text-align: center;
        }


        .dh-play-icon {

            font-size: 42px;
        }


        .dh-play-title {

            color: #00aaff;

            font-size: 28px;

            font-weight: 1000;
        }


        .dh-play-subtitle {

            color: #84969e;

            font-size: 11px;
        }


        .dh-play-spacer {

            width: 70px;
        }


        .dh-game-list {

            display: grid;

            gap: 10px;
        }


        .dh-game-card {

            display: grid;

            grid-template-columns:
                55px
                1fr
                auto;

            align-items: center;

            gap: 11px;

            min-height: 90px;

            padding: 13px;

            border:
                1px solid #30434c;

            border-radius: 12px;

            background:
                linear-gradient(
                    145deg,
                    #141c20,
                    #090e11
                );

            color: white;

            text-align: left;

            cursor: pointer;
        }


        .dh-game-card:hover {

            border-color: #00aaff;
        }


        .dh-game-icon {

            display: flex;

            align-items: center;

            justify-content: center;

            width: 52px;

            height: 52px;

            border-radius: 50%;

            background: #07141a;

            font-size: 28px;
        }


        .dh-game-name {

            font-size: 18px;

            font-weight: 1000;
        }


        .dh-game-description {

            margin-top: 3px;

            color: #84959c;

            font-size: 11px;

            line-height: 1.4;
        }


        .dh-game-arrow {

            color: #00aaff;

            font-size: 28px;

            font-weight: 1000;
        }


        .dh-game-card[data-game="legs"] {

            border-left:
                4px solid #00aaff;
        }


        .dh-game-card[data-game="sets"] {

            border-left:
                4px solid #e5ad28;
        }


        .dh-game-card[data-game="cricket"] {

            border-left:
                4px solid #00c979;
        }


        .dh-game-card[data-game="practice"] {

            border-left:
                4px solid #a86cff;
        }


        #dart-hub-original-game-buttons {

            display: none !important;
        }


        @media (
            max-width:600px
        ) {

            .dh-play-header {

                grid-template-columns:
                    auto 1fr;
            }


            .dh-play-spacer {

                display: none;
            }


            .dh-game-card {

                grid-template-columns:
                    47px
                    1fr
                    auto;

                min-height: 82px;

                padding: 10px;
            }


            .dh-game-icon {

                width: 45px;

                height: 45px;

                font-size: 24px;
            }


            .dh-game-name {

                font-size: 16px;
            }

        }

    `;


    document.head.appendChild(
        style
    );
}



/* =========================================================
   ORIGINAL GAME BUTTONS
========================================================= */

function dhMenuOriginalButtons() {

    return {

        legs:
            document.querySelector(
                '.mode-btn[data-mode="501"]'
            ),

        sets:
            document.querySelector(
                '.mode-btn[data-mode="sets"]'
            ),

        cricket:
            document.querySelector(
                '.mode-btn[data-mode="cricket"]'
            )
    };
}



/* =========================================================
   PLAY SCREEN
========================================================= */

function dhMenuCreatePlayScreen() {

    if (
        document.getElementById(
            DH_MENU.playScreen
        )
    ) {

        return;
    }


    const screen =
        document.createElement(
            "div"
        );


    screen.id =
        DH_MENU.playScreen;


    screen.className =
        "hidden";


    screen.innerHTML = `

        <div class="dh-play-page">

            <div class="dh-play-header">

                <button
                    id="dh-play-back"
                    class="dh-play-back"
                    type="button"
                >
                    ← Back
                </button>


                <div class="dh-play-heading">

                    <div class="dh-play-icon">
                        🎮
                    </div>

                    <div class="dh-play-title">
                        PLAY
                    </div>

                    <div class="dh-play-subtitle">
                        Choose a game
                    </div>

                </div>


                <div class="dh-play-spacer"></div>

            </div>


            <div class="dh-game-list">


                <button
                    class="dh-game-card"
                    data-game="legs"
                    type="button"
                >

                    <span class="dh-game-icon">
                        🎯
                    </span>

                    <span>

                        <span class="dh-game-name">
                            Legs
                        </span>

                        <span class="dh-game-description">
                            101, 201, 301, 501 or custom score.
                        </span>

                    </span>

                    <span class="dh-game-arrow">
                        ›
                    </span>

                </button>


                <button
                    class="dh-game-card"
                    data-game="sets"
                    type="button"
                >

                    <span class="dh-game-icon">
                        🏆
                    </span>

                    <span>

                        <span class="dh-game-name">
                            Sets + Legs
                        </span>

                        <span class="dh-game-description">
                            Traditional sets and legs match.
                        </span>

                    </span>

                    <span class="dh-game-arrow">
                        ›
                    </span>

                </button>


                <button
                    class="dh-game-card"
                    data-game="cricket"
                    type="button"
                >

                    <span class="dh-game-icon">
                        🏏
                    </span>

                    <span>

                        <span class="dh-game-name">
                            Cricket
                        </span>

                        <span class="dh-game-description">
                            Dart Hub Cricket with runs,
                            wickets and innings.
                        </span>

                    </span>

                    <span class="dh-game-arrow">
                        ›
                    </span>

                </button>


                <button
                    class="dh-game-card"
                    data-game="practice"
                    type="button"
                >

                    <span class="dh-game-icon">
                        📈
                    </span>

                    <span>

                        <span class="dh-game-name">
                            Average Practice
                        </span>

                        <span class="dh-game-description">
                            Throw as long as you want and
                            improve your 3-dart average.
                        </span>

                    </span>

                    <span class="dh-game-arrow">
                        ›
                    </span>

                </button>

            </div>

        </div>
    `;


    document.body.appendChild(
        screen
    );


    document
        .getElementById(
            "dh-play-back"
        )
        .onclick =
            dhMenuClosePlay;


    screen
        .querySelectorAll(
            "[data-game]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const game =
                            button.dataset.game;


                        if (
                            typeof dartHubChooseBoardForGame ===
                            "function"
                        ) {

                            dartHubChooseBoardForGame(
                                game
                            );


                            return;
                        }


                        dhMenuStartOriginalGame(
                            game
                        );
                    };
            }
        );
}



/* =========================================================
   HOME PLAY BUTTON
========================================================= */

function dhMenuCreateMainButton() {

    if (
        document.getElementById(
            DH_MENU.playButton
        )
    ) {

        return;
    }


    const modeButtons =
        document.querySelector(
            "#mode-screen .mode-buttons"
        );


    if (
        !modeButtons
    ) {

        return;
    }


    const old =
        dhMenuOriginalButtons();


    const play =
        document.createElement(
            "button"
        );


    play.id =
        DH_MENU.playButton;


    play.type =
        "button";


    play.textContent =
        "🎮 PLAY";


    play.onclick =
        dhMenuOpenPlay;


    modeButtons.insertBefore(
        play,
        modeButtons.firstChild
    );


    let holder =
        document.getElementById(
            DH_MENU.oldButtons
        );


    if (
        !holder
    ) {

        holder =
            document.createElement(
                "div"
            );


        holder.id =
            DH_MENU.oldButtons;


        modeButtons.appendChild(
            holder
        );
    }


    [
        old.legs,
        old.sets,
        old.cricket

    ]
        .filter(
            Boolean
        )
        .forEach(
            button =>
                holder.appendChild(
                    button
                )
        );
}



/* =========================================================
   OPEN / CLOSE
========================================================= */

function dhMenuOpenPlay() {

    if (
        typeof v24HideScreens ===
        "function"
    ) {

        v24HideScreens();


    } else {

        document
            .getElementById(
                "mode-screen"
            )
            ?.classList
            .add(
                "hidden"
            );
    }


    document
        .getElementById(
            DH_MENU.playScreen
        )
        ?.classList
        .remove(
            "hidden"
        );
}


function dhMenuClosePlay() {

    document
        .getElementById(
            DH_MENU.playScreen
        )
        ?.classList
        .add(
            "hidden"
        );


    if (
        typeof v24GoHome ===
        "function"
    ) {

        v24GoHome();


        return;
    }


    document
        .getElementById(
            "mode-screen"
        )
        ?.classList
        .remove(
            "hidden"
        );
}



/* =========================================================
   START ORIGINAL GAME
========================================================= */

function dhMenuStartOriginalGame(
    game
) {

    const old =
        dhMenuOriginalButtons();


    if (
        game ===
        "practice"
    ) {

        if (
            typeof dartHubStartAveragePractice ===
            "function"
        ) {

            dartHubStartAveragePractice();
        }


        return;
    }


    const button =
        old[
            game
        ];


    if (
        !button
    ) {

        alert(
            "Dart Hub could not open this game."
        );


        return;
    }


    document
        .getElementById(
            DH_MENU.playScreen
        )
        ?.classList
        .add(
            "hidden"
        );


    button.click();
}



/* =========================================================
   INITIALISE
========================================================= */

function dhMenuInit() {

    dhMenuInstallStyles();

    dhMenuCreatePlayScreen();

    dhMenuCreateMainButton();
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () =>
            setTimeout(
                dhMenuInit,
                1500
            )
    );


} else {

    setTimeout(
        dhMenuInit,
        1500
    );
}