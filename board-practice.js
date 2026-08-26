"use strict";


/* =========================================================
   DART HUB
   BOARD TYPE + AVERAGE PRACTICE
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const DH_BOARD_STORAGE =
    "dart-hub-board-type";


let dartHubBoardType =

    localStorage.getItem(
        DH_BOARD_STORAGE
    ) ===
    "indoor"

        ? "indoor"

        : "standard";


let dartHubPendingGame =
    null;



/* =========================================================
   PRACTICE STATE
========================================================= */

let dhPractice = {

    active:
        false,

    points:
        0,

    darts:
        0,

    visits:
        [],

    currentDarts:
        [],

    bestVisit:
        0,

    scores100:
        0,

    scores140:
        0,

    scores180:
        0,

    undo:
        []
};



/* =========================================================
   ESCAPE
========================================================= */

function dhPracticeEscape(
    value
) {

    return String(
        value ??
        ""
    ).replace(

        /[&<>'"]/g,

        character => ({

            "&":
                "&amp;",

            "<":
                "&lt;",

            ">":
                "&gt;",

            "'":
                "&#39;",

            '"':
                "&quot;"

        })[character]
    );
}



/* =========================================================
   STYLES
========================================================= */

function dhPracticeInstallStyles() {

    if (
        document.getElementById(
            "dh-board-practice-style"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "dh-board-practice-style";


    style.textContent = `

        .dh-board-screen,
        .dh-practice-screen {

            position: fixed;

            inset: 0;

            z-index: 18500;

            overflow-y: auto;

            padding: 12px;

            background:
                radial-gradient(
                    circle at top,
                    #172c39,
                    #05090b 52%,
                    #020303
                );

            color: white;
        }


        .dh-board-screen.hidden,
        .dh-practice-screen.hidden {

            display: none !important;
        }


        .dh-board-page,
        .dh-practice-page {

            width:
                min(
                    760px,
                    100%
                );

            margin: auto;

            padding-bottom: 40px;
        }


        .dh-simple-header {

            display: grid;

            grid-template-columns:
                auto
                1fr
                auto;

            align-items: center;

            gap: 10px;

            margin-bottom: 14px;
        }


        .dh-simple-back {

            min-height: 43px;

            padding: 7px 12px;

            border:
                1px solid #344750;

            border-radius: 8px;

            background: #11191e;

            color: white;

            font-weight: 900;

            cursor: pointer;
        }


        .dh-simple-title {

            color: #00aaff;

            font-size: 23px;

            font-weight: 1000;

            text-align: center;
        }


        .dh-simple-spacer {

            width: 65px;
        }


        .dh-board-choice-grid {

            display: grid;

            grid-template-columns:
                repeat(
                    2,
                    1fr
                );

            gap: 10px;

            margin-top: 20px;
        }


        .dh-board-choice {

            min-height: 160px;

            padding: 18px;

            border:
                2px solid #30434c;

            border-radius: 13px;

            background:
                linear-gradient(
                    145deg,
                    #151d21,
                    #090d10
                );

            color: white;

            cursor: pointer;
        }


        .dh-board-choice.selected {

            border-color: #00aaff;

            background:
                linear-gradient(
                    145deg,
                    #102a36,
                    #08161d
                );
        }


        .dh-board-choice-icon {

            display: block;

            font-size: 48px;
        }


        .dh-board-choice-name {

            display: block;

            margin-top: 8px;

            font-size: 20px;

            font-weight: 1000;
        }


        .dh-board-choice-help {

            display: block;

            margin-top: 5px;

            color: #85969e;

            font-size: 11px;
        }


        .dh-practice-topstats {

            display: grid;

            grid-template-columns:
                repeat(
                    4,
                    1fr
                );

            gap: 7px;

            margin-bottom: 9px;
        }


        .dh-practice-stat {

            padding: 10px 6px;

            border:
                1px solid #2e4048;

            border-radius: 9px;

            background: #0c1316;

            text-align: center;
        }


        .dh-practice-stat span {

            display: block;

            color: #80939b;

            font-size: 9px;

            text-transform: uppercase;
        }


        .dh-practice-stat strong {

            display: block;

            margin-top: 3px;

            color: #00aaff;

            font-size: 24px;

            font-weight: 1000;
        }


        .dh-practice-average-card {

            padding: 16px;

            margin-bottom: 9px;

            border:
                2px solid #00aaff;

            border-radius: 11px;

            background: #081820;

            text-align: center;
        }


        .dh-practice-average-label {

            color: #8da2ab;

            font-size: 10px;

            text-transform: uppercase;
        }


        .dh-practice-average {

            color: #00ff9d;

            font-size:
                clamp(
                    55px,
                    11vw,
                    95px
                );

            line-height: 1;

            font-weight: 1000;
        }


        .dh-practice-card {

            margin-top: 8px;

            padding: 11px;

            border:
                1px solid #2e4048;

            border-radius: 10px;

            background: #0c1215;
        }


        .dh-practice-methods {

            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    1fr
                );

            gap: 6px;
        }


        .dh-practice-method {

            min-height: 45px;

            border:
                1px solid #3b4b52;

            border-radius: 7px;

            background: #151b1e;

            color: #a5b0b5;

            font-weight: 800;

            cursor: pointer;
        }


        .dh-practice-method.active {

            border-color: #00aaff;

            background: #075d89;

            color: white;
        }


        .dh-practice-section.hidden {

            display: none !important;
        }


        .dh-practice-row {

            display: grid;

            grid-template-columns:
                1fr
                auto;

            gap: 7px;

            margin-top: 8px;
        }


        .dh-practice-row.three {

            grid-template-columns:
                1fr
                1fr
                auto;
        }


        .dh-practice-input,
        .dh-practice-select {

            min-width: 0;

            min-height: 48px;

            padding: 8px 10px;

            border:
                1px solid #405159;

            border-radius: 8px;

            outline: none;

            background: #030506;

            color: white;

            font-size: 17px;
        }


        .dh-practice-submit {

            min-height: 48px;

            padding: 8px 14px;

            border: none;

            border-radius: 8px;

            background: #087247;

            color: white;

            font-weight: 900;

            cursor: pointer;
        }


        .dh-practice-tap {

            display: grid;

            grid-template-columns:
                repeat(
                    5,
                    1fr
                );

            gap: 5px;

            margin-top: 8px;
        }


        .dh-practice-tap button {

            min-height: 43px;

            border:
                1px solid #3a464c;

            border-radius: 7px;

            background: #171c1f;

            color: white;

            font-weight: 800;

            cursor: pointer;
        }


        .dh-practice-special {

            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    1fr
                );

            gap: 5px;

            margin-top: 5px;
        }


        .dh-practice-special button {

            min-height: 45px;

            border: none;

            border-radius: 7px;

            background: #6841a4;

            color: white;

            font-weight: 900;

            cursor: pointer;
        }


        .dh-current-visit {

            margin-top: 8px;

            padding: 9px;

            border-radius: 8px;

            background: #11191c;

            color: #00ff9d;

            font-weight: 900;

            text-align: center;
        }


        .dh-practice-actions {

            display: grid;

            grid-template-columns:
                repeat(
                    2,
                    1fr
                );

            gap: 7px;

            margin-top: 9px;
        }


        .dh-practice-undo,
        .dh-practice-finish {

            min-height: 48px;

            border: none;

            border-radius: 8px;

            color: white;

            font-weight: 900;

            cursor: pointer;
        }


        .dh-practice-undo {

            background: #6c4a17;
        }


        .dh-practice-finish {

            background: #8a2424;
        }


        .dh-practice-history {

            display: grid;

            gap: 5px;

            margin-top: 7px;
        }


        .dh-practice-visit {

            display: grid;

            grid-template-columns:
                auto
                1fr
                auto;

            gap: 8px;

            padding: 8px;

            border:
                1px solid #28363c;

            border-radius: 7px;

            background: #080c0e;

            text-align: left;
        }


        .dh-practice-visit-number {

            color: #81949c;

            font-size: 11px;
        }


        .dh-practice-visit-darts {

            color: #95a4aa;

            font-size: 11px;
        }


        .dh-practice-visit-score {

            color: #00aaff;

            font-size: 19px;

            font-weight: 1000;
        }


        @media (
            max-width:650px
        ) {

            .dh-board-choice-grid {

                grid-template-columns:
                    1fr;
            }


            .dh-practice-topstats {

                grid-template-columns:
                    repeat(
                        2,
                        1fr
                    );
            }


            .dh-practice-methods {

                grid-template-columns:
                    1fr;
            }


            .dh-practice-row,
            .dh-practice-row.three {

                grid-template-columns:
                    1fr;
            }

        }

    `;


    document.head.appendChild(
        style
    );
}



/* =========================================================
   CREATE BOARD PICKER
========================================================= */

function dhCreateBoardPicker() {

    if (
        document.getElementById(
            "dh-board-screen"
        )
    ) {

        return;
    }


    const screen =
        document.createElement(
            "div"
        );


    screen.id =
        "dh-board-screen";


    screen.className =
        "dh-board-screen hidden";


    screen.innerHTML = `

        <div class="dh-board-page">

            <div class="dh-simple-header">

                <button
                    id="dh-board-back"
                    class="dh-simple-back"
                    type="button"
                >
                    ← Back
                </button>


                <div class="dh-simple-title">
                    Choose Dartboard
                </div>


                <div class="dh-simple-spacer"></div>

            </div>


            <div class="dh-board-choice-grid">


                <button
                    class="dh-board-choice"
                    data-board="standard"
                    type="button"
                >

                    <span class="dh-board-choice-icon">
                        🎯
                    </span>

                    <span class="dh-board-choice-name">
                        Standard
                    </span>

                    <span class="dh-board-choice-help">
                        Standard full-size dartboard.
                    </span>

                </button>


                <button
                    class="dh-board-choice"
                    data-board="indoor"
                    type="button"
                >

                    <span class="dh-board-choice-icon">
                        🏠
                    </span>

                    <span class="dh-board-choice-name">
                        Indoor
                    </span>

                    <span class="dh-board-choice-help">
                        Your indoor / alternative board.
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
            "dh-board-back"
        )
        .onclick =
            () => {

                screen.classList.add(
                    "hidden"
                );


                document
                    .getElementById(
                        "dart-hub-play-screen"
                    )
                    ?.classList
                    .remove(
                        "hidden"
                    );
            };


    screen
        .querySelectorAll(
            "[data-board]"
        )
        .forEach(
            button => {

                button.onclick =
                    async () => {

                        await dartHubSetBoardType(
                            button.dataset.board
                        );


                        screen.classList.add(
                            "hidden"
                        );


                        dhStartPendingGame();
                    };
            }
        );


    dhUpdateBoardButtons();
}



/* =========================================================
   BOARD SELECTION
========================================================= */

function dartHubChooseBoardForGame(
    game
) {

    dartHubPendingGame =
        game;


    document
        .getElementById(
            "dart-hub-play-screen"
        )
        ?.classList
        .add(
            "hidden"
        );


    dhUpdateBoardButtons();


    document
        .getElementById(
            "dh-board-screen"
        )
        ?.classList
        .remove(
            "hidden"
        );
}


async function dartHubSetBoardType(
    board
) {

    dartHubBoardType =

        board ===
        "indoor"

            ? "indoor"

            : "standard";


    localStorage.setItem(

        DH_BOARD_STORAGE,

        dartHubBoardType
    );


    dhUpdateBoardButtons();


    /*
       Store this against the signed-in profile.

       The Supabase trigger can therefore stamp normal
       guest matches even though their old save function
       does not know about board_type.
    */

    try {

        if (
            typeof currentDartHubUser !==
                "undefined" &&
            currentDartHubUser
        ) {

            await dartHubSupabase

                .from(
                    "profiles"
                )

                .update({

                    current_board_type:
                        dartHubBoardType,

                    updated_at:
                        new Date()
                            .toISOString()
                })

                .eq(
                    "id",
                    currentDartHubUser.id
                );
        }


    } catch (
        error
    ) {

        console.warn(
            "Board preference save:",
            error
        );
    }
}


function dhUpdateBoardButtons() {

    document
        .querySelectorAll(
            ".dh-board-choice"
        )
        .forEach(
            button => {

                button.classList.toggle(

                    "selected",

                    button.dataset.board ===
                    dartHubBoardType
                );
            }
        );
}



/* =========================================================
   START PENDING GAME
========================================================= */

function dhStartPendingGame() {

    const game =
        dartHubPendingGame;


    dartHubPendingGame =
        null;


    if (
        game ===
        "practice"
    ) {

        dartHubStartAveragePractice();


        return;
    }


    if (
        typeof dhMenuStartOriginalGame ===
        "function"
    ) {

        dhMenuStartOriginalGame(
            game
        );


        return;
    }


    const selector =

        game ===
        "legs"

            ? '.mode-btn[data-mode="501"]'

            : game ===
              "sets"

                ? '.mode-btn[data-mode="sets"]'

                : '.mode-btn[data-mode="cricket"]';


    document
        .querySelector(
            selector
        )
        ?.click();
}



/* =========================================================
   ADD BOARD TO REGISTERED MATCH DETAILS
========================================================= */

function dhWrapMatchDetails() {

    if (
        typeof v23NormalMatchDetails ===
            "function" &&
        !window.__dhBoardNormalDetails
    ) {

        window.__dhBoardNormalDetails =
            true;


        const original =
            v23NormalMatchDetails;


        v23NormalMatchDetails =
            function () {

                return {

                    ...original(),

                    board_type:
                        dartHubBoardType
                };
            };
    }


    if (
        typeof v23CricketDetails ===
            "function" &&
        !window.__dhBoardCricketDetails
    ) {

        window.__dhBoardCricketDetails =
            true;


        const original =
            v23CricketDetails;


        v23CricketDetails =
            function () {

                return {

                    ...original(),

                    board_type:
                        dartHubBoardType
                };
            };
    }
}



/* =========================================================
   PRACTICE SCREEN
========================================================= */

function dhCreatePracticeScreen() {

    if (
        document.getElementById(
            "dh-practice-screen"
        )
    ) {

        return;
    }


    const screen =
        document.createElement(
            "div"
        );


    screen.id =
        "dh-practice-screen";


    screen.className =
        "dh-practice-screen hidden";


    screen.innerHTML = `

        <div class="dh-practice-page">


            <div class="dh-simple-header">

                <button
                    id="dh-practice-back"
                    class="dh-simple-back"
                    type="button"
                >
                    ← Exit
                </button>


                <div class="dh-simple-title">
                    📈 Average Practice
                </div>


                <div class="dh-simple-spacer"></div>

            </div>



            <div class="dh-practice-average-card">

                <div class="dh-practice-average-label">
                    3-Dart Average
                </div>

                <div
                    id="dh-practice-average"
                    class="dh-practice-average"
                >
                    0.00
                </div>

                <div
                    id="dh-practice-board-label"
                    class="dh-play-subtitle"
                >
                    Standard
                </div>

            </div>



            <div class="dh-practice-topstats">

                <div class="dh-practice-stat">

                    <span>
                        Points
                    </span>

                    <strong id="dh-practice-points">
                        0
                    </strong>

                </div>


                <div class="dh-practice-stat">

                    <span>
                        Darts
                    </span>

                    <strong id="dh-practice-darts">
                        0
                    </strong>

                </div>


                <div class="dh-practice-stat">

                    <span>
                        Visits
                    </span>

                    <strong id="dh-practice-visits">
                        0
                    </strong>

                </div>


                <div class="dh-practice-stat">

                    <span>
                        Best Visit
                    </span>

                    <strong id="dh-practice-best">
                        0
                    </strong>

                </div>

            </div>



            <div class="dh-practice-card">

                <div class="dh-practice-methods">

                    <button
                        class="dh-practice-method active"
                        data-practice-method="tap"
                        type="button"
                    >
                        🎯 Tap Darts
                    </button>


                    <button
                        class="dh-practice-method"
                        data-practice-method="visit"
                        type="button"
                    >
                        🔢 Whole Visit
                    </button>


                    <button
                        class="dh-practice-method"
                        data-practice-method="individual"
                        type="button"
                    >
                        🎯 Individual Dart
                    </button>

                </div>



                <div
                    id="dh-practice-tap-section"
                    class="dh-practice-section"
                >

                    <div
                        id="dh-practice-tap-buttons"
                        class="dh-practice-tap"
                    ></div>


                    <div class="dh-practice-special">

                        <button
                            id="dh-practice-25"
                            type="button"
                        >
                            25
                        </button>

                        <button
                            id="dh-practice-50"
                            type="button"
                        >
                            Bull 50
                        </button>

                        <button
                            id="dh-practice-miss"
                            type="button"
                        >
                            Miss
                        </button>

                    </div>

                </div>



                <div
                    id="dh-practice-visit-section"
                    class="dh-practice-section hidden"
                >

                    <div class="dh-practice-row">

                        <input
                            id="dh-practice-visit-input"
                            class="dh-practice-input"
                            type="number"
                            min="0"
                            max="180"
                            inputmode="numeric"
                            placeholder="0 - 180"
                        >


                        <button
                            id="dh-practice-submit-visit"
                            class="dh-practice-submit"
                            type="button"
                        >
                            Add Visit
                        </button>

                    </div>

                    <div class="dh-play-subtitle">
                        Whole Visit assumes 3 darts.
                    </div>

                </div>



                <div
                    id="dh-practice-individual-section"
                    class="dh-practice-section hidden"
                >

                    <div class="dh-practice-row three">

                        <select
                            id="dh-practice-dart-type"
                            class="dh-practice-select"
                        >

                            <option value="single">
                                Single
                            </option>

                            <option value="double">
                                Double
                            </option>

                            <option value="treble">
                                Treble
                            </option>

                            <option value="outerbull">
                                Outer Bull
                            </option>

                            <option value="bull">
                                Bull
                            </option>

                            <option value="miss">
                                Miss
                            </option>

                        </select>


                        <input
                            id="dh-practice-dart-number"
                            class="dh-practice-input"
                            type="number"
                            min="1"
                            max="20"
                            inputmode="numeric"
                            placeholder="1 - 20"
                        >


                        <button
                            id="dh-practice-submit-dart"
                            class="dh-practice-submit"
                            type="button"
                        >
                            Add Dart
                        </button>

                    </div>

                </div>



                <div
                    id="dh-practice-current"
                    class="dh-current-visit"
                >
                    Current visit: –
                </div>

            </div>



            <div class="dh-practice-topstats">

                <div class="dh-practice-stat">

                    <span>
                        100+
                    </span>

                    <strong id="dh-practice-100">
                        0
                    </strong>

                </div>


                <div class="dh-practice-stat">

                    <span>
                        140+
                    </span>

                    <strong id="dh-practice-140">
                        0
                    </strong>

                </div>


                <div class="dh-practice-stat">

                    <span>
                        180s
                    </span>

                    <strong id="dh-practice-180">
                        0
                    </strong>

                </div>


                <div class="dh-practice-stat">

                    <span>
                        Last Visit
                    </span>

                    <strong id="dh-practice-last">
                        –
                    </strong>

                </div>

            </div>



            <div class="dh-practice-actions">

                <button
                    id="dh-practice-undo"
                    class="dh-practice-undo"
                    type="button"
                >
                    ↶ Undo
                </button>


                <button
                    id="dh-practice-finish"
                    class="dh-practice-finish"
                    type="button"
                >
                    ⏹ Finish Practice
                </button>

            </div>



            <div class="dh-practice-card">

                <strong>
                    Visit History
                </strong>

                <div
                    id="dh-practice-history"
                    class="dh-practice-history"
                ></div>

            </div>

        </div>
    `;


    document.body.appendChild(
        screen
    );


    dhBuildTapButtons();


    screen
        .querySelectorAll(
            "[data-practice-method]"
        )
        .forEach(
            button => {

                button.onclick =
                    () =>
                        dhPracticeChooseMethod(
                            button.dataset
                                .practiceMethod
                        );
            }
        );


    document
        .getElementById(
            "dh-practice-submit-visit"
        )
        .onclick =
            dhPracticeSubmitVisit;


    document
        .getElementById(
            "dh-practice-submit-dart"
        )
        .onclick =
            dhPracticeSubmitIndividual;


    document
        .getElementById(
            "dh-practice-25"
        )
        .onclick =
            () =>
                dhPracticeAddDart(
                    25,
                    "25"
                );


    document
        .getElementById(
            "dh-practice-50"
        )
        .onclick =
            () =>
                dhPracticeAddDart(
                    50,
                    "Bull"
                );


    document
        .getElementById(
            "dh-practice-miss"
        )
        .onclick =
            () =>
                dhPracticeAddDart(
                    0,
                    "Miss"
                );


    document
        .getElementById(
            "dh-practice-undo"
        )
        .onclick =
            dhPracticeUndo;


    document
        .getElementById(
            "dh-practice-finish"
        )
        .onclick =
            dhPracticeFinish;


    document
        .getElementById(
            "dh-practice-back"
        )
        .onclick =
            dhPracticeExit;


    document
        .getElementById(
            "dh-practice-visit-input"
        )
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    dhPracticeSubmitVisit();
                }
            }
        );


    document
        .getElementById(
            "dh-practice-dart-number"
        )
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    dhPracticeSubmitIndividual();
                }
            }
        );


    document
        .getElementById(
            "dh-practice-dart-type"
        )
        .onchange =
            dhPracticeUpdateNumberInput;
}



/* =========================================================
   TAP BUTTONS
========================================================= */

function dhBuildTapButtons() {

    const container =
        document.getElementById(
            "dh-practice-tap-buttons"
        );


    if (
        !container ||
        container.children.length
    ) {

        return;
    }


    for (
        let number = 1;
        number <= 20;
        number++
    ) {

        const single =
            document.createElement(
                "button"
            );


        single.type =
            "button";


        single.textContent =
            number;


        single.onclick =
            () =>
                dhPracticeAddDart(
                    number,
                    String(
                        number
                    )
                );


        container.appendChild(
            single
        );


        const double =
            document.createElement(
                "button"
            );


        double.type =
            "button";


        double.textContent =
            `D${number}`;


        double.onclick =
            () =>
                dhPracticeAddDart(
                    number * 2,
                    `D${number}`
                );


        container.appendChild(
            double
        );


        const treble =
            document.createElement(
                "button"
            );


        treble.type =
            "button";


        treble.textContent =
            `T${number}`;


        treble.onclick =
            () =>
                dhPracticeAddDart(
                    number * 3,
                    `T${number}`
                );


        container.appendChild(
            treble
        );
    }
}



/* =========================================================
   PRACTICE START
========================================================= */

function dartHubStartAveragePractice() {

    dhPractice = {

        active:
            true,

        points:
            0,

        darts:
            0,

        visits:
            [],

        currentDarts:
            [],

        bestVisit:
            0,

        scores100:
            0,

        scores140:
            0,

        scores180:
            0,

        undo:
            []
    };


    document
        .getElementById(
            "dh-practice-screen"
        )
        ?.classList
        .remove(
            "hidden"
        );


    dhPracticeChooseMethod(
        "tap"
    );


    dhPracticeRender();
}



/* =========================================================
   SNAPSHOT / UNDO
========================================================= */

function dhPracticeSnapshot() {

    return JSON.parse(
        JSON.stringify(
            {

                points:
                    dhPractice.points,

                darts:
                    dhPractice.darts,

                visits:
                    dhPractice.visits,

                currentDarts:
                    dhPractice.currentDarts,

                bestVisit:
                    dhPractice.bestVisit,

                scores100:
                    dhPractice.scores100,

                scores140:
                    dhPractice.scores140,

                scores180:
                    dhPractice.scores180
            }
        )
    );
}


function dhPracticePushUndo() {

    dhPractice.undo.push(
        dhPracticeSnapshot()
    );


    if (
        dhPractice.undo.length >
        100
    ) {

        dhPractice.undo.shift();
    }
}


function dhPracticeUndo() {

    const old =
        dhPractice.undo.pop();


    if (
        !old
    ) {

        return;
    }


    Object.assign(
        dhPractice,
        old
    );


    dhPracticeRender();
}



/* =========================================================
   ADD ONE DART
========================================================= */

function dhPracticeAddDart(
    score,
    label
) {

    if (
        !dhPractice.active
    ) {

        return;
    }


    dhPracticePushUndo();


    dhPractice.points +=
        score;


    dhPractice.darts++;


    dhPractice.currentDarts.push({

        score,

        label
    });


    if (
        dhPractice.currentDarts.length >=
        3
    ) {

        dhPracticeCompleteCurrentVisit();
    }


    dhPracticeRender();
}



/* =========================================================
   COMPLETE VISIT
========================================================= */

function dhPracticeCompleteCurrentVisit() {

    if (
        !dhPractice.currentDarts.length
    ) {

        return;
    }


    const score =
        dhPractice.currentDarts
            .reduce(
                (
                    total,
                    dart
                ) =>
                    total +
                    dart.score,
                0
            );


    dhPractice.visits.push({

        score,

        darts:
            dhPractice.currentDarts
                .map(
                    dart =>
                        dart.label
                )
    });


    dhPractice.bestVisit =
        Math.max(
            dhPractice.bestVisit,
            score
        );


    if (
        score ===
        180
    ) {

        dhPractice.scores180++;


    } else if (
        score >=
        140
    ) {

        dhPractice.scores140++;


    } else if (
        score >=
        100
    ) {

        dhPractice.scores100++;
    }


    dhPractice.currentDarts =
        [];
}



/* =========================================================
   WHOLE VISIT
========================================================= */

function dhPracticeSubmitVisit() {

    const input =
        document.getElementById(
            "dh-practice-visit-input"
        );


    const score =
        Number(
            input.value
        );


    if (
        !Number.isInteger(
            score
        ) ||
        score <
            0 ||
        score >
            180
    ) {

        alert(
            "Enter a visit score from 0 to 180."
        );


        return;
    }


    dhPracticePushUndo();


    /*
       Complete any partial individually-entered visit first.
    */

    if (
        dhPractice.currentDarts.length
    ) {

        dhPracticeCompleteCurrentVisit();
    }


    dhPractice.points +=
        score;


    dhPractice.darts +=
        3;


    dhPractice.currentDarts = [

        {
            score,
            label:
                `Visit ${score}`
        }

    ];


    dhPracticeCompleteCurrentVisit();


    input.value =
        "";


    dhPracticeRender();
}



/* =========================================================
   INDIVIDUAL DART
========================================================= */

function dhPracticeSubmitIndividual() {

    const type =
        document
            .getElementById(
                "dh-practice-dart-type"
            )
            .value;


    const input =
        document.getElementById(
            "dh-practice-dart-number"
        );


    if (
        type ===
        "miss"
    ) {

        dhPracticeAddDart(
            0,
            "Miss"
        );


        return;
    }


    if (
        type ===
        "outerbull"
    ) {

        dhPracticeAddDart(
            25,
            "25"
        );


        return;
    }


    if (
        type ===
        "bull"
    ) {

        dhPracticeAddDart(
            50,
            "Bull"
        );


        return;
    }


    const number =
        Number(
            input.value
        );


    if (
        !Number.isInteger(
            number
        ) ||
        number <
            1 ||
        number >
            20
    ) {

        alert(
            "Enter a number from 1 to 20."
        );


        return;
    }


    let multiplier =
        1;


    let prefix =
        "";


    if (
        type ===
        "double"
    ) {

        multiplier =
            2;

        prefix =
            "D";
    }


    if (
        type ===
        "treble"
    ) {

        multiplier =
            3;

        prefix =
            "T";
    }


    dhPracticeAddDart(

        number *
        multiplier,

        `${prefix}${number}`
    );


    input.value =
        "";
}



/* =========================================================
   INDIVIDUAL INPUT STATE
========================================================= */

function dhPracticeUpdateNumberInput() {

    const type =
        document
            .getElementById(
                "dh-practice-dart-type"
            )
            .value;


    const input =
        document.getElementById(
            "dh-practice-dart-number"
        );


    input.disabled =

        [
            "miss",
            "outerbull",
            "bull"
        ].includes(
            type
        );
}



/* =========================================================
   METHOD
========================================================= */

function dhPracticeChooseMethod(
    method
) {

    document
        .querySelectorAll(
            ".dh-practice-method"
        )
        .forEach(
            button => {

                button.classList.toggle(

                    "active",

                    button.dataset
                        .practiceMethod ===
                        method
                );
            }
        );


    document
        .getElementById(
            "dh-practice-tap-section"
        )
        .classList
        .toggle(
            "hidden",
            method !==
            "tap"
        );


    document
        .getElementById(
            "dh-practice-visit-section"
        )
        .classList
        .toggle(
            "hidden",
            method !==
            "visit"
        );


    document
        .getElementById(
            "dh-practice-individual-section"
        )
        .classList
        .toggle(
            "hidden",
            method !==
            "individual"
        );
}



/* =========================================================
   AVERAGE
========================================================= */

function dhPracticeAverage() {

    return dhPractice.darts

        ? (
            dhPractice.points /
            dhPractice.darts *
            3
        )

        : 0;
}



/* =========================================================
   RENDER
========================================================= */

function dhPracticeRender() {

    const average =
        dhPracticeAverage();


    document
        .getElementById(
            "dh-practice-average"
        )
        .textContent =
            average.toFixed(
                2
            );


    document
        .getElementById(
            "dh-practice-points"
        )
        .textContent =
            dhPractice.points;


    document
        .getElementById(
            "dh-practice-darts"
        )
        .textContent =
            dhPractice.darts;


    document
        .getElementById(
            "dh-practice-visits"
        )
        .textContent =
            dhPractice.visits.length;


    document
        .getElementById(
            "dh-practice-best"
        )
        .textContent =
            dhPractice.bestVisit;


    document
        .getElementById(
            "dh-practice-100"
        )
        .textContent =
            dhPractice.scores100;


    document
        .getElementById(
            "dh-practice-140"
        )
        .textContent =
            dhPractice.scores140;


    document
        .getElementById(
            "dh-practice-180"
        )
        .textContent =
            dhPractice.scores180;


    document
        .getElementById(
            "dh-practice-last"
        )
        .textContent =

            dhPractice.visits.length

                ? dhPractice.visits[
                    dhPractice.visits.length -
                    1
                  ].score

                : "–";


    document
        .getElementById(
            "dh-practice-board-label"
        )
        .textContent =

            dartHubBoardType ===
            "indoor"

                ? "🏠 Indoor board"

                : "🎯 Standard board";


    const current =
        dhPractice.currentDarts;


    document
        .getElementById(
            "dh-practice-current"
        )
        .textContent =

            current.length

                ? (
                    "Current visit: " +

                    current
                        .map(
                            dart =>
                                dart.label
                        )
                        .join(
                            " • "
                        )

                    +

                    ` (${current.reduce(
                        (
                            total,
                            dart
                        ) =>
                            total +
                            dart.score,
                        0
                    )})`
                )

                : "Current visit: –";


    const history =
        document.getElementById(
            "dh-practice-history"
        );


    if (
        !dhPractice.visits.length
    ) {

        history.innerHTML = `

            <div class="dh-play-subtitle">
                No completed visits yet.
            </div>
        `;


        return;
    }


    history.innerHTML =
        dhPractice.visits

            .map(
                (
                    visit,
                    index
                ) => `

                    <div class="dh-practice-visit">

                        <div class="dh-practice-visit-number">

                            #${index + 1}

                        </div>


                        <div class="dh-practice-visit-darts">

                            ${dhPracticeEscape(
                                visit.darts.join(
                                    " • "
                                )
                            )}

                        </div>


                        <div class="dh-practice-visit-score">

                            ${visit.score}

                        </div>

                    </div>
                `
            )

            .reverse()

            .join(
                ""
            );
}



/* =========================================================
   FINISH PRACTICE
========================================================= */

async function dhPracticeFinish() {

    if (
        !dhPractice.active
    ) {

        return;
    }


    if (
        !dhPractice.darts
    ) {

        if (
            confirm(
                "No darts have been entered. Exit practice?"
            )
        ) {

            dhPracticeExit();
        }


        return;
    }


    if (
        dhPractice.currentDarts.length
    ) {

        dhPracticePushUndo();

        dhPracticeCompleteCurrentVisit();
    }


    dhPracticeRender();


    if (
        !confirm(
            "Finish this practice session and save the stats?"
        )
    ) {

        return;
    }


    await dhSavePracticeSession();


    dhPractice.active =
        false;


    document
        .getElementById(
            "dh-practice-screen"
        )
        .classList
        .add(
            "hidden"
        );


    if (
        typeof v24GoHome ===
        "function"
    ) {

        v24GoHome();


    } else {

        document
            .getElementById(
                "mode-screen"
            )
            ?.classList
            .remove(
                "hidden"
            );
    }
}



/* =========================================================
   SAVE PRACTICE
========================================================= */

async function dhSavePracticeSession() {

    if (
        typeof currentDartHubUser ===
            "undefined" ||
        !currentDartHubUser
    ) {

        alert(
            "Sign in to save practice statistics."
        );


        return;
    }


    const average =
        dhPracticeAverage();


    const details = {

        game:
            "Average Practice",

        board_type:
            dartHubBoardType,

        points:
            dhPractice.points,

        darts:
            dhPractice.darts,

        visits:
            dhPractice.visits.length,

        average:
            Number(
                average.toFixed(
                    2
                )
            ),

        highest_visit:
            dhPractice.bestVisit,

        scores_100:
            dhPractice.scores100,

        scores_140:
            dhPractice.scores140,

        scores_180:
            dhPractice.scores180
    };


    try {

        const {
            error
        } =
            await dartHubSupabase

                .from(
                    "matches"
                )

                .insert({

                    user_id:
                        currentDartHubUser.id,

                    opponent_name:
                        "Practice",

                    opponent_user_id:
                        null,

                    game_mode:
                        "Average Practice",

                    starting_score:
                        0,

                    result:
                        "PRACTICE",

                    user_average:
                        Number(
                            average.toFixed(
                                2
                            )
                        ),

                    opponent_average:
                        0,

                    user_180s:
                        dhPractice.scores180,

                    opponent_180s:
                        0,

                    checkout_percentage:
                        0,

                    best_checkout:
                        0,

                    board_type:
                        dartHubBoardType,

                    match_details:
                        details
                });


        if (
            error
        ) {

            throw error;
        }


        /*
           Practice contributes to overall SCORING stats,
           but NOT matches / wins / losses.
        */

        if (
            typeof currentCloudProfile !==
                "undefined" &&
            currentCloudProfile
        ) {

            const old =
                currentCloudProfile;


            const {
                data,
                error:
                    profileError
            } =
                await dartHubSupabase

                    .from(
                        "profiles"
                    )

                    .update({

                        points_scored:

                            Number(
                                old.points_scored ||
                                0
                            )

                            +

                            dhPractice.points,


                        darts_thrown:

                            Number(
                                old.darts_thrown ||
                                0
                            )

                            +

                            dhPractice.darts,


                        scores_100_plus:

                            Number(
                                old.scores_100_plus ||
                                0
                            )

                            +

                            dhPractice.scores100,


                        scores_140_plus:

                            Number(
                                old.scores_140_plus ||
                                0
                            )

                            +

                            dhPractice.scores140,


                        scores_180:

                            Number(
                                old.scores_180 ||
                                0
                            )

                            +

                            dhPractice.scores180,


                        best_match_average:

                            Math.max(

                                Number(
                                    old.best_match_average ||
                                    0
                                ),

                                average
                            ),


                        current_board_type:
                            dartHubBoardType,


                        updated_at:
                            new Date()
                                .toISOString()
                    })

                    .eq(
                        "id",
                        currentDartHubUser.id
                    )

                    .select()

                    .single();


            if (
                profileError
            ) {

                throw profileError;
            }


            currentCloudProfile =
                data;
        }


        if (
            typeof v23LoadProfileData ===
            "function"
        ) {

            await v23LoadProfileData();
        }


    } catch (
        error
    ) {

        console.error(
            "Practice save:",
            error
        );


        alert(
            "Practice finished, but Dart Hub could not save the statistics."
        );
    }
}



/* =========================================================
   EXIT WITHOUT SAVE
========================================================= */

function dhPracticeExit() {

    if (
        dhPractice.active &&
        dhPractice.darts
    ) {

        if (
            !confirm(
                "Exit practice without saving this session?"
            )
        ) {

            return;
        }
    }


    dhPractice.active =
        false;


    document
        .getElementById(
            "dh-practice-screen"
        )
        ?.classList
        .add(
            "hidden"
        );


    document
        .getElementById(
            "dart-hub-play-screen"
        )
        ?.classList
        .remove(
            "hidden"
        );
}



/* =========================================================
   INITIALISE
========================================================= */

function dhBoardPracticeInit() {

    dhPracticeInstallStyles();

    dhCreateBoardPicker();

    dhCreatePracticeScreen();

    dhPracticeUpdateNumberInput();


    /*
       features.js installs its wrappers during startup.
       Run this afterwards.
    */

    setTimeout(
        dhWrapMatchDetails,
        800
    );

    setTimeout(
        dhWrapMatchDetails,
        2000
    );
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        dhBoardPracticeInit
    );


} else {

    dhBoardPracticeInit();
}