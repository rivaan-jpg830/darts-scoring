"use strict";


/* =========================================================
   DART HUB
   SCORING UI + CRICKET COMPACT SCORER

   FEATURES

   - Prominent 0 button for Legs / Sets
   - 0 counts as a real dart
   - 0 button for Average Practice
   - Compact Cricket scoring panel
   - One Cricket number pad
   - Single / Double / Treble selector
   - Bowling always throws first
   - Bowling turn = 3 darts
   - Batting follows bowling
   - Bowling Miss Scoring Zone:
         +1 run to batting team
         bowling dart counts
   - Bowling Dart Falls Out:
         +1 run to batting team
         bowling dart counts
         +1 EXTRA BATTER DART
   - Multiple fall-outs stack
   - Extra batting darts are real scoring darts
   - Existing wicket logic retained
   - Existing innings / target logic retained
   - Existing Cricket cloud saving retained
========================================================= */



/* =========================================================
   STATE
========================================================= */

let dhCricketMultiplier =
    1;


let dhCricketExtraBattingDarts =
    0;


let dhCricketInstalled =
    false;


let dhOriginalCricketDart =
    null;


let dhOriginalCricketReset =
    null;


let dhOriginalSecondInnings =
    null;


let dhOriginalPushCricket =
    null;


let dhOriginalUpdateCricket =
    null;



/* =========================================================
   STYLE
========================================================= */

function dhScoringInstallStyles() {

    if (
        document.getElementById(
            "dh-scoring-ui-style"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "dh-scoring-ui-style";


    style.textContent = `


        /* ================================================
           NORMAL 0 BUTTON
        ================================================= */

        .dh-zero-score-card {

            margin-bottom: 10px;

            padding: 8px;

            border:
                1px solid #31434b;

            border-radius: 9px;

            background: #0b1114;
        }


        .dh-zero-score-button {

            width: 100%;

            min-height: 55px;

            border:
                2px solid #5d6b72;

            border-radius: 9px;

            background:
                linear-gradient(
                    145deg,
                    #252a2d,
                    #111416
                );

            color: white;

            font-size: 20px;

            font-weight: 1000;

            cursor: pointer;
        }


        .dh-zero-score-button strong {

            color: #00aaff;

            font-size: 27px;
        }


        .dh-zero-score-help {

            display: block;

            margin-top: 3px;

            color: #85969e;

            font-size: 10px;

            font-weight: 500;
        }



        /* ================================================
           HIDE OLD CRICKET BOARDS
        ================================================= */

        #cricket-screen
        .dh-old-cricket-board-hidden {

            display: none !important;
        }



        /* ================================================
           COMPACT CRICKET
        ================================================= */

        #dh-cricket-compact {

            width: 100%;

            max-width: 700px;

            margin:
                8px auto;

            padding: 10px;

            border:
                1px solid #30434c;

            border-radius: 12px;

            background:
                linear-gradient(
                    145deg,
                    #11191d,
                    #070b0d
                );

            text-align: left;
        }


        .dh-cricket-phase-card {

            position: sticky;

            top: 0;

            z-index: 600;

            margin-bottom: 9px;

            padding: 10px;

            border:
                2px solid #00aaff;

            border-radius: 10px;

            background:
                rgba(
                    5,
                    12,
                    16,
                    0.97
                );

            text-align: center;
        }


        .dh-cricket-phase-card.bowling {

            border-color: #ff5555;
        }


        .dh-cricket-phase-card.batting {

            border-color: #00df85;
        }


        .dh-cricket-phase-label {

            font-size: 10px;

            font-weight: 900;

            letter-spacing: 1.4px;

            text-transform: uppercase;
        }


        .dh-cricket-phase-card.bowling
        .dh-cricket-phase-label {

            color: #ff7777;
        }


        .dh-cricket-phase-card.batting
        .dh-cricket-phase-label {

            color: #56ffb5;
        }


        .dh-cricket-team-name {

            margin-top: 2px;

            color: white;

            font-size:
                clamp(
                    20px,
                    5vw,
                    30px
                );

            font-weight: 1000;
        }


        .dh-cricket-turn-info {

            display: flex;

            justify-content: center;

            flex-wrap: wrap;

            gap: 6px;

            margin-top: 7px;
        }


        .dh-cricket-pill {

            padding:
                5px
                8px;

            border:
                1px solid #34464f;

            border-radius: 999px;

            background: #0c1215;

            color: #b4c0c5;

            font-size: 11px;

            font-weight: 800;
        }


        .dh-cricket-pill strong {

            color: #00aaff;
        }


        .dh-cricket-danger-pill {

            border-color: #6f2929;

            background: #291010;

            color: #ff9f9f;
        }


        .dh-cricket-danger-pill strong {

            color: #ff6262;
        }



        /* ================================================
           MULTIPLIER
        ================================================= */

        .dh-cricket-multiplier {

            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    1fr
                );

            gap: 6px;

            margin-bottom: 8px;
        }


        .dh-cricket-multiplier button {

            min-height: 45px;

            border:
                1px solid #394a52;

            border-radius: 8px;

            background: #151c1f;

            color: #a5b2b8;

            font-weight: 900;

            cursor: pointer;
        }


        .dh-cricket-multiplier
        button.active {

            border-color: #00aaff;

            background:
                linear-gradient(
                    135deg,
                    #008bd0,
                    #005b8b
                );

            color: white;
        }



        /* ================================================
           NUMBER GRID
        ================================================= */

        .dh-cricket-number-grid {

            display: grid;

            grid-template-columns:
                repeat(
                    5,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap: 5px;
        }


        .dh-cricket-number {

            position: relative;

            min-width: 0;

            min-height: 48px;

            border:
                1px solid #3b484e;

            border-radius: 7px;

            background:
                linear-gradient(
                    145deg,
                    #242a2d,
                    #131719
                );

            color: white;

            font-size: 16px;

            font-weight: 900;

            cursor: pointer;
        }


        .dh-cricket-number.danger {

            border:
                2px solid #ff4d4d;

            background:
                linear-gradient(
                    145deg,
                    #4b1515,
                    #240909
                );

            color: #ffb0b0;
        }


        .dh-cricket-number.danger::after {

            content: "WICKET";

            position: absolute;

            left: 2px;

            right: 2px;

            bottom: 1px;

            color: #ff7676;

            font-size: 6px;

            letter-spacing: .4px;
        }



        /* ================================================
           BULL
        ================================================= */

        .dh-cricket-bulls {

            display: grid;

            grid-template-columns:
                repeat(
                    2,
                    1fr
                );

            gap: 6px;

            margin-top: 7px;
        }


        .dh-cricket-bulls button {

            min-height: 48px;

            border: none;

            border-radius: 8px;

            background:
                linear-gradient(
                    135deg,
                    #6842a7,
                    #452872
                );

            color: white;

            font-weight: 900;

            cursor: pointer;
        }



        /* ================================================
           BOWLING EVENTS
        ================================================= */

        .dh-cricket-bowling-events {

            display: grid;

            grid-template-columns:
                repeat(
                    2,
                    1fr
                );

            gap: 7px;

            margin-top: 10px;

            padding-top: 9px;

            border-top:
                1px solid #26353c;
        }


        .dh-cricket-bowling-events.hidden {

            display: none !important;
        }


        .dh-cricket-miss-zone,
        .dh-cricket-fall-out {

            min-height: 59px;

            padding: 7px;

            border: none;

            border-radius: 8px;

            color: white;

            font-weight: 900;

            cursor: pointer;
        }


        .dh-cricket-miss-zone {

            background:
                linear-gradient(
                    135deg,
                    #9a5d19,
                    #6a3d0f
                );
        }


        .dh-cricket-fall-out {

            background:
                linear-gradient(
                    135deg,
                    #8a2d55,
                    #5e1b39
                );
        }


        .dh-cricket-event-small {

            display: block;

            margin-top: 2px;

            color:
                rgba(
                    255,
                    255,
                    255,
                    .72
                );

            font-size: 9px;

            font-weight: 600;
        }



        /* ================================================
           EXTRA DART NOTICE
        ================================================= */

        .dh-cricket-extra-notice {

            margin-top: 8px;

            padding: 8px;

            border:
                1px solid #6b4e89;

            border-radius: 7px;

            background: #191022;

            color: #d0b6f1;

            font-size: 11px;

            font-weight: 800;

            text-align: center;
        }


        .dh-cricket-extra-notice.hidden {

            display: none !important;
        }



        /* ================================================
           PHONE
        ================================================= */

        @media (
            max-width:650px
        ) {

            #dh-cricket-compact {

                padding: 7px;

                margin-top: 5px;
            }


            .dh-cricket-phase-card {

                padding: 7px;

                margin-bottom: 6px;
            }


            .dh-cricket-number-grid {

                gap: 4px;
            }


            .dh-cricket-number {

                min-height: 43px;

                font-size: 14px;
            }


            .dh-cricket-bowling-events {

                grid-template-columns:
                    1fr;
            }


            .dh-cricket-miss-zone,
            .dh-cricket-fall-out {

                min-height: 48px;
            }

        }

    `;


    document.head.appendChild(
        style
    );
}



/* =========================================================
   NORMAL DARTS
   PROMINENT 0 BUTTON
========================================================= */

function dhInstallNormalZeroButton() {

    if (
        document.getElementById(
            "dh-zero-score"
        )
    ) {

        return;
    }


    const tap =
        document.getElementById(
            "tap-scoring-section"
        );


    if (
        !tap
    ) {

        return;
    }


    const dartboard =
        tap.querySelector(
            ".dartboard"
        )
        ||
        tap.querySelector(
            ".card"
        )
        ||
        tap;


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "dh-zero-score-card";


    card.innerHTML = `

        <button
            id="dh-zero-score"
            class="dh-zero-score-button"
            type="button"
        >

            <strong>
                0
            </strong>

            / Miss / Dart Falls Out

            <span class="dh-zero-score-help">
                Counts as one dart thrown and scores zero.
            </span>

        </button>
    `;


    dartboard.insertBefore(

        card,

        dartboard.firstChild
    );


    document
        .getElementById(
            "dh-zero-score"
        )
        .onclick =
            () => {

                if (
                    typeof applyDart !==
                        "function" ||
                    typeof makeDart !==
                        "function"
                ) {

                    return;
                }


                applyDart(

                    makeDart(
                        "miss",
                        0
                    )
                );
            };


    /*
       Keep the original Miss button too,
       but make its purpose clearer.
    */

    const oldMiss =
        document.getElementById(
            "tap-miss"
        );


    if (
        oldMiss
    ) {

        oldMiss.innerHTML = `

            0 / Miss

            <span>
                Counts as a dart
            </span>
        `;
    }
}



/* =========================================================
   PRACTICE ZERO
========================================================= */

function dhInstallPracticeZero() {

    const button =
        document.getElementById(
            "dh-practice-miss"
        );


    if (
        !button
    ) {

        return;
    }


    button.innerHTML =
        "0 / Miss";


    button.onclick =
        () => {

            if (
                typeof dhPracticeAddDart ===
                "function"
            ) {

                dhPracticeAddDart(
                    0,
                    "0"
                );
            }
        };
}



/* =========================================================
   CRICKET
   FIND / HIDE OLD BOARDS
========================================================= */

function dhHideOldCricketBoards() {

    const ids = [

        "cricket-bowl-singles",

        "cricket-bat-singles"

    ];


    ids.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            const board =
                element
                    ?.closest(
                        ".dartboard"
                    );


            if (
                board
            ) {

                board.classList.add(
                    "dh-old-cricket-board-hidden"
                );
            }
        }
    );


    /*
       Hide original special Cricket buttons.

       Start / Reset and Declare remain.
    */

    const miss =
        document.getElementById(
            "cricket-miss-board"
        );


    const fall =
        document.getElementById(
            "cricket-fall-out"
        );


    if (
        miss
    ) {

        miss.style.display =
            "none";
    }


    if (
        fall
    ) {

        fall.style.display =
            "none";
    }
}



/* =========================================================
   CREATE COMPACT CRICKET SCORER
========================================================= */

function dhCreateCompactCricket() {

    if (
        document.getElementById(
            "dh-cricket-compact"
        )
    ) {

        return;
    }


    const screen =
        document.getElementById(
            "cricket-screen"
        );


    if (
        !screen
    ) {

        return;
    }


    const back =
        document.getElementById(
            "cricket-back"
        );


    const scorer =
        document.createElement(
            "div"
        );


    scorer.id =
        "dh-cricket-compact";


    scorer.innerHTML = `


        <!-- =============================================
             TURN
        ============================================== -->

        <div
            id="dh-cricket-phase-card"
            class="dh-cricket-phase-card bowling"
        >

            <div
                id="dh-cricket-phase-label"
                class="dh-cricket-phase-label"
            >
                🔴 BOWLING TURN
            </div>


            <div
                id="dh-cricket-team"
                class="dh-cricket-team-name"
            >
                Bowling Team
            </div>


            <div class="dh-cricket-turn-info">

                <div class="dh-cricket-pill">

                    Darts:
                    <strong id="dh-cricket-darts">
                        3
                    </strong>

                </div>


                <div class="dh-cricket-pill dh-cricket-danger-pill">

                    Wicket:
                    <strong id="dh-cricket-danger">
                        1
                    </strong>

                </div>


                <div class="dh-cricket-pill">

                    Runs:
                    <strong id="dh-cricket-runs">
                        0
                    </strong>

                </div>


                <div class="dh-cricket-pill">

                    Wickets:
                    <strong id="dh-cricket-wickets">
                        0
                    </strong>

                </div>

            </div>

        </div>



        <!-- =============================================
             MULTIPLIER
        ============================================== -->

        <div class="dh-cricket-multiplier">

            <button
                type="button"
                data-dh-cricket-mult="1"
                class="active"
            >
                Single
            </button>


            <button
                type="button"
                data-dh-cricket-mult="2"
            >
                Double
            </button>


            <button
                type="button"
                data-dh-cricket-mult="3"
            >
                Treble
            </button>

        </div>



        <!-- =============================================
             NUMBER PAD
        ============================================== -->

        <div
            id="dh-cricket-number-grid"
            class="dh-cricket-number-grid"
        ></div>



        <!-- =============================================
             BULL
        ============================================== -->

        <div class="dh-cricket-bulls">

            <button
                id="dh-cricket-25"
                type="button"
            >
                Outer Bull
                <br>
                25
            </button>


            <button
                id="dh-cricket-50"
                type="button"
            >
                Bull
                <br>
                50
            </button>

        </div>



        <!-- =============================================
             BOWLING EVENTS
        ============================================== -->

        <div
            id="dh-cricket-bowling-events"
            class="dh-cricket-bowling-events"
        >

            <button
                id="dh-cricket-miss-zone"
                class="dh-cricket-miss-zone"
                type="button"
            >

                Miss Scoring Zone
                <span class="dh-cricket-event-small">
                    +1 run • bowling dart counts
                </span>

            </button>


            <button
                id="dh-cricket-fall-out"
                class="dh-cricket-fall-out"
                type="button"
            >

                Dart Falls Out
                <span class="dh-cricket-event-small">
                    +1 run • bowling dart counts
                    • +1 batter dart
                </span>

            </button>

        </div>



        <div
            id="dh-cricket-extra-notice"
            class="dh-cricket-extra-notice hidden"
        ></div>

    `;


    if (
        back
    ) {

        back.insertAdjacentElement(
            "beforebegin",
            scorer
        );


    } else {

        screen.appendChild(
            scorer
        );
    }


    dhBuildCricketNumbers();

    dhBindCricketCompactEvents();
}



/* =========================================================
   BUILD NUMBER PAD
========================================================= */

function dhBuildCricketNumbers() {

    const grid =
        document.getElementById(
            "dh-cricket-number-grid"
        );


    if (
        !grid ||
        grid.children.length
    ) {

        return;
    }


    for (
        let number = 1;
        number <= 20;
        number++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "dh-cricket-number";


        button.dataset.cricketNumber =
            String(
                number
            );


        button.textContent =
            String(
                number
            );


        button.onclick =
            () => {

                dhCompactCricketDart(
                    number
                );
            };


        grid.appendChild(
            button
        );
    }
}



/* =========================================================
   MULTIPLIER LABEL
========================================================= */

function dhCricketScoreLabel(
    number
) {

    if (
        dhCricketMultiplier ===
        2
    ) {

        return `D${number}`;
    }


    if (
        dhCricketMultiplier ===
        3
    ) {

        return `T${number}`;
    }


    return String(
        number
    );
}



/* =========================================================
   COMPACT CRICKET DART
========================================================= */

function dhCompactCricketDart(
    number
) {

    if (
        typeof cricketDart !==
        "function"
    ) {

        return;
    }


    const role =

        cricketPhase ===
        "bowling"

            ? "bowl"

            : "bat";


    cricketDart(

        role,

        number,

        dhCricketMultiplier,

        number *
        dhCricketMultiplier
    );
}



/* =========================================================
   BULL
========================================================= */

function dhCompactCricketBull(
    score
) {

    if (
        typeof cricketDart !==
        "function"
    ) {

        return;
    }


    const role =

        cricketPhase ===
        "bowling"

            ? "bowl"

            : "bat";


    /*
       Wicket numbers only run 1–20,
       so base 25 will never be a wicket.

       Bowling:
       consumes a bowling dart, no runs.

       Batting:
       scores 25 or 50 runs.
    */

    cricketDart(

        role,

        25,

        1,

        score
    );
}



/* =========================================================
   BIND COMPACT EVENTS
========================================================= */

function dhBindCricketCompactEvents() {

    document
        .querySelectorAll(
            "[data-dh-cricket-mult]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        dhCricketMultiplier =
                            Number(
                                button.dataset
                                    .dhCricketMult
                            );


                        document
                            .querySelectorAll(
                                "[data-dh-cricket-mult]"
                            )
                            .forEach(
                                other => {

                                    other.classList.toggle(

                                        "active",

                                        other ===
                                        button
                                    );
                                }
                            );


                        dhRenderCompactCricket();
                    };
            }
        );


    document
        .getElementById(
            "dh-cricket-25"
        )
        .onclick =
            () =>
                dhCompactCricketBull(
                    25
                );


    document
        .getElementById(
            "dh-cricket-50"
        )
        .onclick =
            () =>
                dhCompactCricketBull(
                    50
                );


    document
        .getElementById(
            "dh-cricket-miss-zone"
        )
        .onclick =
            dhCricketBowlingMiss;


    document
        .getElementById(
            "dh-cricket-fall-out"
        )
        .onclick =
            dhCricketBowlingFallOut;
}



/* =========================================================
   SWITCH BOWLING -> BATTING

   Applies pending extra batter darts.
========================================================= */

function dhApplyExtraBattingDarts() {

    if (
        cricketPhase !==
        "batting"
    ) {

        return;
    }


    if (
        dhCricketExtraBattingDarts <=
        0
    ) {

        return;
    }


    cricketDarts +=
        dhCricketExtraBattingDarts;


    dhCricketExtraBattingDarts =
        0;
}



/* =========================================================
   CONSUME A BOWLING SPECIAL DART
========================================================= */

function dhConsumeBowlingSpecialDart() {

    cricketDarts--;


    if (
        cricketDarts <=
        0
    ) {

        cricketPhase =
            "batting";


        cricketDarts =
            3 +
            dhCricketExtraBattingDarts;


        dhCricketExtraBattingDarts =
            0;
    }
}



/* =========================================================
   BOWLING MISS SCORING ZONE

   +1 run to batter
   Bowling dart counts
========================================================= */

function dhCricketBowlingMiss() {

    if (
        cricketFinished ||
        cricketPhase !==
        "bowling"
    ) {

        return;
    }


    if (
        typeof pushCricket ===
        "function"
    ) {

        pushCricket();
    }


    cricketRuns++;


    dhConsumeBowlingSpecialDart();


    if (
        typeof checkCricket ===
        "function"
    ) {

        checkCricket();
    }


    if (
        typeof updateCricket ===
        "function"
    ) {

        updateCricket();
    }
}



/* =========================================================
   BOWLING DART FALLS OUT

   +1 run to batter
   Bowling dart counts
   Batter receives one extra dart
========================================================= */

function dhCricketBowlingFallOut() {

    if (
        cricketFinished ||
        cricketPhase !==
        "bowling"
    ) {

        return;
    }


    if (
        typeof pushCricket ===
        "function"
    ) {

        pushCricket();
    }


    cricketRuns++;


    dhCricketExtraBattingDarts++;


    dhConsumeBowlingSpecialDart();


    if (
        typeof checkCricket ===
        "function"
    ) {

        checkCricket();
    }


    if (
        typeof updateCricket ===
        "function"
    ) {

        updateCricket();
    }
}



/* =========================================================
   WRAP CRICKET HISTORY

   Adds extra batter darts to Undo history.
========================================================= */

function dhWrapPushCricket() {

    if (
        typeof pushCricket !==
        "function" ||
        window.__dhPushCricketWrapped
    ) {

        return;
    }


    window.__dhPushCricketWrapped =
        true;


    dhOriginalPushCricket =
        pushCricket;


    pushCricket =
        function () {

            dhOriginalPushCricket();


            const latest =

                typeof cricketHistory !==
                    "undefined"

                    ?

                    cricketHistory[
                        cricketHistory.length -
                        1
                    ]

                    :

                    null;


            if (
                latest
            ) {

                latest
                    .dhExtraBattingDarts =
                        dhCricketExtraBattingDarts;
            }
        };
}



/* =========================================================
   WRAP NORMAL CRICKET DART

   Existing engine already:
   - handles wicket logic
   - scores batting runs
   - consumes darts
   - alternates turns

   We only intercept bowling -> batting to add
   the pending extra batter darts.
========================================================= */

function dhWrapCricketDart() {

    if (
        typeof cricketDart !==
        "function" ||
        window.__dhCricketDartWrapped
    ) {

        return;
    }


    window.__dhCricketDartWrapped =
        true;


    dhOriginalCricketDart =
        cricketDart;


    cricketDart =
        function (
            role,
            base,
            multiplier,
            score
        ) {

            const beforePhase =
                cricketPhase;


            dhOriginalCricketDart(

                role,

                base,

                multiplier,

                score
            );


            /*
               Normal bowling dart completed
               the bowling turn.
            */

            if (
                beforePhase ===
                    "bowling"

                &&

                cricketPhase ===
                    "batting"

                &&

                !cricketFinished

                &&

                dhCricketExtraBattingDarts >
                    0
            ) {

                cricketDarts +=
                    dhCricketExtraBattingDarts;


                dhCricketExtraBattingDarts =
                    0;


                /*
                   Original cricketDart already called
                   updateCricket before returning,
                   so refresh once more.
                */

                if (
                    typeof updateCricket ===
                    "function"
                ) {

                    updateCricket();
                }
            }
        };
}



/* =========================================================
   RESET
========================================================= */

function dhWrapCricketReset() {

    if (
        typeof resetCricket !==
        "function" ||
        window.__dhCricketResetWrapped
    ) {

        return;
    }


    window.__dhCricketResetWrapped =
        true;


    dhOriginalCricketReset =
        resetCricket;


    resetCricket =
        function (
            ...args
        ) {

            dhCricketExtraBattingDarts =
                0;


            dhCricketMultiplier =
                1;


            dhOriginalCricketReset(
                ...args
            );


            dhRenderCompactCricket();
        };


    const button =
        document.getElementById(
            "cricket-start-match"
        );


    if (
        button
    ) {

        button.onclick =
            () =>
                resetCricket(
                    true
                );
    }
}



/* =========================================================
   SECOND INNINGS

   Keep features.js wrapper intact,
   then clear any unused bonus darts.
========================================================= */

function dhWrapSecondInnings() {

    if (
        typeof startSecondCricketInnings !==
        "function" ||
        window.__dhSecondInningsWrapped
    ) {

        return;
    }


    window.__dhSecondInningsWrapped =
        true;


    dhOriginalSecondInnings =
        startSecondCricketInnings;


    startSecondCricketInnings =
        function (
            ...args
        ) {

            dhCricketExtraBattingDarts =
                0;


            dhOriginalSecondInnings(
                ...args
            );


            dhRenderCompactCricket();
        };
}



/* =========================================================
   UPDATE CRICKET UI
========================================================= */

function dhWrapUpdateCricket() {

    if (
        typeof updateCricket !==
        "function" ||
        window.__dhUpdateCricketWrapped
    ) {

        return;
    }


    window.__dhUpdateCricketWrapped =
        true;


    dhOriginalUpdateCricket =
        updateCricket;


    updateCricket =
        function (
            ...args
        ) {

            dhOriginalUpdateCricket(
                ...args
            );


            dhRenderCompactCricket();
        };
}



/* =========================================================
   UNDO

   Restore normal Cricket state plus
   pending extra batter darts.
========================================================= */

function dhInstallCricketUndo() {

    const button =
        document.getElementById(
            "undo-cricket"
        );


    if (
        !button
    ) {

        return;
    }


    button.onclick =
        () => {

            const old =
                cricketHistory.pop();


            if (
                !old
            ) {

                return;
            }


            cricketInnings =
                old.cricketInnings;


            cricketRuns =
                old.cricketRuns;


            cricketWickets =
                old.cricketWickets;


            cricketNextWicket =
                old.cricketNextWicket;


            cricketTarget =
                old.cricketTarget;


            cricketDarts =
                old.cricketDarts;


            cricketPhase =
                old.cricketPhase;


            cricketTotalWickets =
                old.cricketTotalWickets;


            cricketFinished =
                old.cricketFinished;


            cricketBattingName
                .textContent =
                    old.batting;


            cricketBowlingName
                .textContent =
                    old.bowling;


            dhCricketExtraBattingDarts =

                Number(
                    old.dhExtraBattingDarts ||
                    0
                );


            updateCricket();
        };
}



/* =========================================================
   RENDER COMPACT CRICKET
========================================================= */

function dhRenderCompactCricket() {

    const card =
        document.getElementById(
            "dh-cricket-phase-card"
        );


    if (
        !card ||
        typeof cricketPhase ===
        "undefined"
    ) {

        return;
    }


    const bowling =
        cricketPhase ===
        "bowling";


    card.classList.toggle(
        "bowling",
        bowling
    );


    card.classList.toggle(
        "batting",
        !bowling
    );


    const phase =
        document.getElementById(
            "dh-cricket-phase-label"
        );


    if (
        cricketFinished
    ) {

        phase.textContent =
            "🏁 MATCH FINISHED";


    } else {

        phase.textContent =

            bowling

                ? "🔴 BOWLING TURN"

                : "🟢 BATTING TURN";
    }


    const team =
        document.getElementById(
            "dh-cricket-team"
        );


    team.textContent =

        cricketFinished

            ? "Match Complete"

            : bowling

                ? cricketBowlingName
                    .textContent

                : cricketBattingName
                    .textContent;


    document
        .getElementById(
            "dh-cricket-darts"
        )
        .textContent =

            cricketFinished

                ? "–"

                : cricketDarts;


    document
        .getElementById(
            "dh-cricket-runs"
        )
        .textContent =
            cricketRuns;


    document
        .getElementById(
            "dh-cricket-wickets"
        )
        .textContent =

            `${cricketWickets}/${cricketTotalWickets}`;


    document
        .getElementById(
            "dh-cricket-danger"
        )
        .textContent =

            cricketWickets >=
            cricketTotalWickets

                ? "–"

                : cricketNextWicket;



    /* =============================================
       BOWLING EVENT BUTTONS
    ============================================== */

    document
        .getElementById(
            "dh-cricket-bowling-events"
        )
        .classList
        .toggle(
            "hidden",
            !bowling ||
            cricketFinished
        );



    /* =============================================
       EXTRA DART MESSAGE
    ============================================== */

    const notice =
        document.getElementById(
            "dh-cricket-extra-notice"
        );


    if (
        bowling &&
        dhCricketExtraBattingDarts >
            0
    ) {

        notice.classList.remove(
            "hidden"
        );


        notice.textContent =

            `🏏 Batter has ` +

            `${dhCricketExtraBattingDarts} ` +

            `extra dart${
                dhCricketExtraBattingDarts ===
                1

                    ? ""

                    : "s"
            } waiting for the batting turn.`;


    } else if (
        !bowling &&
        cricketDarts >
        3
    ) {

        notice.classList.remove(
            "hidden"
        );


        notice.textContent =

            `🏏 Batting turn includes extra dart${
                cricketDarts - 3 === 1
                    ? ""
                    : "s"
            }. ` +

            `${cricketDarts} darts remaining.`;


    } else {

        notice.classList.add(
            "hidden"
        );


        notice.textContent =
            "";
    }



    /* =============================================
       NUMBER BUTTONS
    ============================================== */

    document
        .querySelectorAll(
            "[data-cricket-number]"
        )
        .forEach(
            button => {

                const number =
                    Number(
                        button.dataset
                            .cricketNumber
                    );


                button.classList.toggle(

                    "danger",

                    !cricketFinished &&
                    number ===
                    cricketNextWicket
                );


                button.textContent =
                    dhCricketScoreLabel(
                        number
                    );
            }
        );
}



/* =========================================================
   CRICKET INSTALL
========================================================= */

function dhInstallCricketUI() {

    if (
        dhCricketInstalled
    ) {

        return;
    }


    if (
        typeof cricketDart !==
            "function" ||
        typeof updateCricket !==
            "function"
    ) {

        return;
    }


    dhCricketInstalled =
        true;


    dhHideOldCricketBoards();

    dhCreateCompactCricket();


    /*
       Order is important.

       features.js has already installed its
       Cricket cloud wrappers before this script loads.
    */

    dhWrapPushCricket();

    dhWrapCricketDart();

    dhWrapCricketReset();

    dhWrapSecondInnings();

    dhWrapUpdateCricket();

    dhInstallCricketUndo();


    /*
       Replace old special button behaviour too,
       even though those buttons are hidden.
    */

    const oldMiss =
        document.getElementById(
            "cricket-miss-board"
        );


    if (
        oldMiss
    ) {

        oldMiss.onclick =
            dhCricketBowlingMiss;
    }


    const oldFall =
        document.getElementById(
            "cricket-fall-out"
        );


    if (
        oldFall
    ) {

        oldFall.onclick =
            dhCricketBowlingFallOut;
    }


    dhRenderCompactCricket();


    console.log(
        "🏏 Dart Hub compact Cricket scorer ready."
    );
}



/* =========================================================
   INITIALISE
========================================================= */

function dhScoringInit() {

    dhScoringInstallStyles();


    dhInstallNormalZeroButton();


    dhInstallPracticeZero();


    dhInstallCricketUI();
}



/*
   board-practice.js and features.js are loaded
   before this file through auth.js, but allow a
   couple of retries just in case the browser is slow.
*/

dhScoringInit();


setTimeout(
    dhScoringInit,
    500
);


setTimeout(
    dhScoringInit,
    1500
);