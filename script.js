"use strict";


/* =========================================================
   DART HUB - FULL SCRIPT
   VERSION 16
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_MATCH =
    "dart-hub-current-match-v16";

const STORAGE_PROFILES =
    "dart-hub-player-profiles-v16";

const STORAGE_SETTINGS =
    "dart-hub-settings-v16";

const MAX_HISTORY =
    150;


/* =========================================================
   DOM HELPER
========================================================= */

const $ =
    id =>
        document.getElementById(id);


/* =========================================================
   MAIN DOM
========================================================= */

const modeScreen =
    $("mode-screen");

const nameScreen =
    $("name-screen");

const setupScreen =
    $("setup-screen");

const gameScreen =
    $("game-screen");

const cricketScreen =
    $("cricket-screen");


const p1NameInput =
    $("p1-name-input");

const p2NameInput =
    $("p2-name-input");

const p1NameDisplay =
    $("p1-name");

const p2NameDisplay =
    $("p2-name");


const p1ScoreDisplay =
    $("p1-score");

const p2ScoreDisplay =
    $("p2-score");


const p1LegsDisplay =
    $("p1-legs");

const p2LegsDisplay =
    $("p2-legs");


const p1SetsDisplay =
    $("p1-sets");

const p2SetsDisplay =
    $("p2-sets");


const p1Box =
    $("p1-box");

const p2Box =
    $("p2-box");


const nameScreenTitle =
    $("name-screen-title");

const p1Label =
    $("p1-label");

const p2Label =
    $("p2-label");


const startingScoreInput =
    $("starting-score");

const legsPerSetInput =
    $("legs-per-set");

const setsToWinInput =
    $("sets-to-win");


const startP1Btn =
    $("start-p1");

const startP2Btn =
    $("start-p2");

const startRandomBtn =
    $("start-random");

const firstPlayerStatus =
    $("first-player-status");


const modeLabel =
    $("mode-label");

const legSetStatus =
    $("leg-set-status");

const dartsStatus =
    $("darts-status");

const checkoutText =
    $("checkout-text");


const tapScoringSection =
    $("tap-scoring-section");

const visitScoringSection =
    $("visit-scoring-section");

const individualScoringSection =
    $("individual-scoring-section");


const scoreInput =
    $("score-input");

const individualDartType =
    $("individual-dart-type");

const individualDartInput =
    $("individual-dart-input");

const individualDartStatus =
    $("individual-dart-status");


const normalUndoBtn =
    $("undo-normal");

const toggleAnnouncerBtn =
    $("toggle-announcer");

const callerModeBtn =
    $("caller-mode-btn");

const profileBtn =
    $("profile-btn");

const newMatchBtn =
    $("new-match-btn");


const finishedBanner =
    $("match-finished-banner");

const statsP1 =
    $("stats-p1");

const statsP2 =
    $("stats-p2");

const visitHistoryList =
    $("visit-history-list");


/* =========================================================
   CALLER MODE DOM
========================================================= */

const callerScreen =
    $("caller-screen");

const callerDisplayBtn =
    $("caller-display-btn");

const callerScorerBtn =
    $("caller-scorer-btn");

const callerCloseBtn =
    $("caller-close-btn");


const callerP1 =
    $("caller-p1");

const callerP2 =
    $("caller-p2");


const callerP1Name =
    $("caller-p1-name");

const callerP2Name =
    $("caller-p2-name");


const callerP1Score =
    $("caller-p1-score");

const callerP2Score =
    $("caller-p2-score");


const callerP1Sets =
    $("caller-p1-sets");

const callerP2Sets =
    $("caller-p2-sets");


const callerP1Legs =
    $("caller-p1-legs");

const callerP2Legs =
    $("caller-p2-legs");


const callerP1Last =
    $("caller-p1-last");

const callerP2Last =
    $("caller-p2-last");


const callerMatchInfo =
    $("caller-match-info");

const callerTurn =
    $("caller-turn");

const callerRequire =
    $("caller-require");

const callerRoute =
    $("caller-route");

const callerCurrentVisit =
    $("caller-current-visit");


const callerScorerControls =
    $("caller-scorer-controls");

const callerVisitEntry =
    $("caller-visit-entry");

const callerDartEntry =
    $("caller-dart-entry");

const callerVisitInput =
    $("caller-visit-input");

const callerDartType =
    $("caller-dart-type");

const callerDartNumber =
    $("caller-dart-number");


const callerCelebration =
    $("caller-celebration");

const callerCelebrationText =
    $("caller-celebration-text");


/* =========================================================
   STATE
========================================================= */

let selectedMode =
    "501";

let gameMode =
    "legs";

let startingScore =
    501;

let legsPerSet =
    3;

let setsToWin =
    3;

let currentSet =
    1;

let currentLeg =
    1;

let currentPlayer =
    1;

let legStartingPlayer =
    1;

let selectedStartingPlayer =
    "random";

let dartsLeft =
    3;

let currentVisitDarts =
    [];

let currentVisitStartSnapshot =
    null;

let matchFinished =
    false;

let winnerPlayer =
    null;

let announcerEnabled =
    true;

let callerOpen =
    false;

let callerView =
    "display";

let visitCounter =
    1;


/* =========================================================
   HISTORY
========================================================= */

const normalHistory =
    [];

const visitRestoreSnapshots =
    new Map();


/* =========================================================
   PLAYER STATE
========================================================= */

function createStats() {

    return {

        pointsScored:
            0,

        dartsThrown:
            0,

        first9Points:
            0,

        first9Darts:
            0,

        highestVisit:
            0,

        scores100:
            0,

        scores140:
            0,

        scores180:
            0,

        checkoutAttempts:
            0,

        checkouts:
            0,

        bestCheckout:
            0,

        legPoints:
            0,

        legDarts:
            0,

        lastLegAverage:
            0,

        visits:
            []
    };
}


function createPlayer(
    name
) {

    return {

        name,

        score:
            startingScore,

        legs:
            0,

        sets:
            0,

        lastVisit:
            null,

        stats:
            createStats()
    };
}


let players = [

    createPlayer(
        "Player 1"
    ),

    createPlayer(
        "Player 2"
    )

];


/* =========================================================
   HELPERS
========================================================= */

function clone(
    value
) {

    return JSON.parse(
        JSON.stringify(
            value
        )
    );
}


function escapeHTML(
    value
) {

    return String(
        value
    ).replace(

        /[&<>'"]/g,

        c => ({

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

        })[c]
    );
}


/* =========================================================
   MOBILE TABS
========================================================= */

document
    .querySelectorAll(
        ".mobile-game-tab"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document.body.dataset.gameTab =
                        button.dataset.gameTab;


                    document
                        .querySelectorAll(
                            ".mobile-game-tab"
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
                }
            );
        }
    );


/* =========================================================
   GAME MODE
========================================================= */

document
    .querySelectorAll(
        ".mode-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectedMode =
                        button.dataset.mode;


                    modeScreen.classList.add(
                        "hidden"
                    );


                    if (
                        selectedMode ===
                        "cricket"
                    ) {

                        nameScreenTitle.textContent =
                            "Enter Team Names";


                        p1Label.textContent =
                            "Team A:";


                        p2Label.textContent =
                            "Team B:";


                        p1NameInput.placeholder =
                            "Team A";


                        p2NameInput.placeholder =
                            "Team B";


                    } else {

                        nameScreenTitle.textContent =
                            "Enter Player Names";


                        p1Label.textContent =
                            "Player 1:";


                        p2Label.textContent =
                            "Player 2:";


                        p1NameInput.placeholder =
                            "Player 1";


                        p2NameInput.placeholder =
                            "Player 2";
                    }


                    nameScreen.classList.remove(
                        "hidden"
                    );
                }
            );
        }
    );


/* =========================================================
   NAMES
========================================================= */

$("continue-to-setup")
    .addEventListener(
        "click",
        () => {

            const name1 =
                p1NameInput.value.trim() ||
                (
                    selectedMode ===
                    "cricket"
                        ? "Team A"
                        : "Player 1"
                );


            const name2 =
                p2NameInput.value.trim() ||
                (
                    selectedMode ===
                    "cricket"
                        ? "Team B"
                        : "Player 2"
                );


            if (
                selectedMode ===
                "cricket"
            ) {

                setupCricketNames(
                    name1,
                    name2
                );

                return;
            }


            players[0].name =
                name1;


            players[1].name =
                name2;


            updateNameDisplays();

            updateStartingPlayerButtons();


            nameScreen.classList.add(
                "hidden"
            );


            setupScreen.classList.remove(
                "hidden"
            );
        }
    );


function updateNameDisplays() {

    p1NameDisplay.textContent =
        players[0].name;


    p2NameDisplay.textContent =
        players[1].name;
}


/* =========================================================
   FIRST PLAYER
========================================================= */

startP1Btn.onclick =
    () =>
        setStartingPlayer(
            1
        );


startP2Btn.onclick =
    () =>
        setStartingPlayer(
            2
        );


startRandomBtn.onclick =
    () =>
        setStartingPlayer(
            "random"
        );


function setStartingPlayer(
    choice
) {

    selectedStartingPlayer =
        choice;


    [
        startP1Btn,
        startP2Btn,
        startRandomBtn
    ].forEach(
        button => {

            button.classList.remove(
                "active-start"
            );
        }
    );


    if (
        choice ===
        1
    ) {

        startP1Btn.classList.add(
            "active-start"
        );


        firstPlayerStatus.textContent =
            `${players[0].name} will throw first.`;


    } else if (
        choice ===
        2
    ) {

        startP2Btn.classList.add(
            "active-start"
        );


        firstPlayerStatus.textContent =
            `${players[1].name} will throw first.`;


    } else {

        startRandomBtn.classList.add(
            "active-start"
        );


        firstPlayerStatus.textContent =
            "Random / bull-off winner will throw first.";
    }
}


function updateStartingPlayerButtons() {

    startP1Btn.textContent =
        players[0].name;


    startP2Btn.textContent =
        players[1].name;


    setStartingPlayer(
        selectedStartingPlayer
    );
}


/* =========================================================
   START MATCH
========================================================= */

$("start-match")
    .addEventListener(
        "click",
        startMatch
    );


function startMatch() {

    gameMode =
        selectedMode ===
        "sets"
            ? "sets"
            : "legs";


    startingScore =
        Math.max(

            2,

            parseInt(
                startingScoreInput.value
            ) ||
            501
        );


    legsPerSet =
        Math.max(

            1,

            parseInt(
                legsPerSetInput.value
            ) ||
            3
        );


    setsToWin =
        Math.max(

            1,

            parseInt(
                setsToWinInput.value
            ) ||
            3
        );


    const names = [

        players[0].name,

        players[1].name

    ];


    players = [

        createPlayer(
            names[0]
        ),

        createPlayer(
            names[1]
        )

    ];


    players.forEach(
        player => {

            player.score =
                startingScore;
        }
    );


    currentSet =
        1;


    currentLeg =
        1;


    currentPlayer =
        selectedStartingPlayer ===
        "random"

            ? (
                Math.random() <
                0.5
                    ? 1
                    : 2
            )

            : selectedStartingPlayer;


    legStartingPlayer =
        currentPlayer;


    dartsLeft =
        3;


    currentVisitDarts =
        [];


    currentVisitStartSnapshot =
        null;


    matchFinished =
        false;


    winnerPlayer =
        null;


    visitCounter =
        1;


    normalHistory.length =
        0;


    visitRestoreSnapshots.clear();


    finishedBanner.classList.add(
        "hidden"
    );


    setupScreen.classList.add(
        "hidden"
    );


    gameScreen.classList.remove(
        "hidden"
    );


    document.body.dataset.gameTab =
        "score";


    activateMobileTab(
        "score"
    );


    selectScoringMethod(
        "tap"
    );


    updateEverything();

    saveMatch();


    setTimeout(
        announceTurnStatus,
        350
    );
}


/* =========================================================
   MOBILE TAB HELPER
========================================================= */

function activateMobileTab(
    name
) {

    document.body.dataset.gameTab =
        name;


    document
        .querySelectorAll(
            ".mobile-game-tab"
        )
        .forEach(
            button => {

                button.classList.toggle(

                    "active",

                    button.dataset.gameTab ===
                        name
                );
            }
        );
}


/* =========================================================
   SCORING METHOD
========================================================= */

document
    .querySelectorAll(
        ".method-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectScoringMethod(
                        button.dataset.method
                    );
                }
            );
        }
    );


function selectScoringMethod(
    method
) {

    document
        .querySelectorAll(
            ".method-button"
        )
        .forEach(
            button => {

                button.classList.toggle(

                    "active-method",

                    button.dataset.method ===
                        method
                );
            }
        );


    tapScoringSection.classList.add(
        "hidden"
    );


    visitScoringSection.classList.add(
        "hidden"
    );


    individualScoringSection.classList.add(
        "hidden"
    );


    if (
        method ===
        "tap"
    ) {

        tapScoringSection.classList.remove(
            "hidden"
        );
    }


    if (
        method ===
        "visit"
    ) {

        visitScoringSection.classList.remove(
            "hidden"
        );


        setTimeout(
            () =>
                scoreInput.focus(),
            100
        );
    }


    if (
        method ===
        "individual"
    ) {

        individualScoringSection.classList.remove(
            "hidden"
        );


        setTimeout(
            () =>
                individualDartInput.focus(),
            100
        );
    }
}


/* =========================================================
   DART OBJECT
========================================================= */

function makeDart(
    type,
    number
) {

    if (
        type ===
        "miss"
    ) {

        return {

            type,

            score:
                0,

            label:
                "Miss",

            isDouble:
                false
        };
    }


    if (
        type ===
        "outerbull"
    ) {

        return {

            type,

            score:
                25,

            label:
                "25",

            isDouble:
                false
        };
    }


    if (
        type ===
        "bull"
    ) {

        return {

            type,

            score:
                50,

            label:
                "Bull",

            isDouble:
                true
        };
    }


    const multiplier =
        type ===
        "double"

            ? 2

            : type ===
              "treble"

                ? 3

                : 1;


    return {

        type,

        number,

        score:
            number *
            multiplier,

        label:
            (
                type ===
                "double"

                    ? "D"

                    : type ===
                      "treble"

                        ? "T"

                        : ""
            )
            +
            number,

        isDouble:
            type ===
            "double"
    };
}


/* =========================================================
   BUILD TAP BOARD
========================================================= */

function buildTapBoard() {

    const singles =
        $("singles");


    const doubles =
        $("doubles");


    const trebles =
        $("trebles");


    if (
        !singles ||
        singles.children.length >
        0
    ) {

        return;
    }


    for (
        let number = 1;
        number <= 20;
        number++
    ) {

        addDartButton(

            singles,

            String(
                number
            ),

            makeDart(
                "single",
                number
            )
        );


        addDartButton(

            doubles,

            "D" +
            number,

            makeDart(
                "double",
                number
            )
        );


        addDartButton(

            trebles,

            "T" +
            number,

            makeDart(
                "treble",
                number
            )
        );
    }


    if (
        $("tap-outer-bull")
    ) {

        $("tap-outer-bull").onclick =
            () =>
                applyDart(

                    makeDart(
                        "outerbull",
                        25
                    )
                );
    }


    if (
        $("tap-bull")
    ) {

        $("tap-bull").onclick =
            () =>
                applyDart(

                    makeDart(
                        "bull",
                        25
                    )
                );
    }


    if (
        $("tap-miss")
    ) {

        $("tap-miss").onclick =
            () =>
                applyDart(

                    makeDart(
                        "miss",
                        0
                    )
                );
    }
}


function addDartButton(
    container,
    label,
    dart
) {

    const button =
        document.createElement(
            "button"
        );


    button.className =
        "btn-score";


    button.textContent =
        label;


    button.onclick =
        () =>
            applyDart(
                clone(
                    dart
                )
            );


    container.appendChild(
        button
    );
}


buildTapBoard();


/* =========================================================
   VISIT START
========================================================= */

function beginVisit() {

    if (
        currentVisitDarts.length ===
        0
    ) {

        currentVisitStartSnapshot =
            makeSnapshot();
    }
}


function visitTotal() {

    return currentVisitDarts.reduce(

        (
            total,
            dart
        ) =>

            total +
            (
                dart.score ||
                0
            ),

        0
    );
}


/* =========================================================
   APPLY DART
========================================================= */

function applyDart(
    dart
) {

    if (
        matchFinished
    ) {

        return;
    }


    beginVisit();

    pushUndo();


    const player =
        players[
            currentPlayer -
            1
        ];


    const scoreBefore =
        player.score;


    const scoreAfter =
        scoreBefore -
        dart.score;


    currentVisitDarts.push(
        clone(
            dart
        )
    );


    dartsLeft--;


    /*
       Checkout attempt if the dart
       could finish the score.
    */

    if (
        dart.isDouble &&
        dart.score ===
        scoreBefore
    ) {

        player.stats.checkoutAttempts++;
    }


    /*
       BUST CONDITIONS
    */

    if (
        scoreAfter <
            0 ||

        scoreAfter ===
            1 ||

        (
            scoreAfter ===
                0 &&
            !dart.isDouble
        )
    ) {

        announceVisitScore(
            0
        );


        showCallerEvent(
            "NO SCORE",
            1500
        );


        completeVisit(
            0,
            false,
            true
        );


        return;
    }


    player.score =
        scoreAfter;


    /*
       CHECKOUT
    */

    if (
        scoreAfter ===
            0 &&
        dart.isDouble
    ) {

        completeVisit(

            visitTotal(),

            true,

            false
        );


        return;
    }


    /*
       END OF 3 DARTS
    */

    if (
        dartsLeft <=
        0
    ) {

        completeVisit(

            visitTotal(),

            false,

            false
        );


        return;
    }


    updateEverything();

    saveMatch();
}


/* =========================================================
   INDIVIDUAL DART ENTRY
========================================================= */

if (
    $("submit-individual-dart")
) {

    $("submit-individual-dart")
        .onclick =
            submitIndividualDart;
}


if (
    individualDartInput
) {

    individualDartInput
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    submitIndividualDart();
                }
            }
        );
}


if (
    individualDartType
) {

    individualDartType
        .addEventListener(
            "change",
            () => {

                const fixed =
                    [
                        "bull",
                        "outerbull",
                        "miss"
                    ].includes(
                        individualDartType.value
                    );


                individualDartInput.disabled =
                    fixed;


                if (
                    fixed
                ) {

                    individualDartInput.value =
                        "";
                }
            }
        );
}


function submitIndividualDart() {

    const dart =
        dartFromInputs(

            individualDartType,

            individualDartInput
        );


    if (
        !dart
    ) {

        return;
    }


    applyDart(
        dart
    );


    individualDartInput.value =
        "";
}


function dartFromInputs(
    typeElement,
    numberElement
) {

    const type =
        typeElement.value;


    if (
        [
            "bull",
            "outerbull",
            "miss"
        ].includes(
            type
        )
    ) {

        return makeDart(
            type,
            0
        );
    }


    const number =
        parseInt(
            numberElement.value
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


        return null;
    }


    return makeDart(
        type,
        number
    );
}


/* =========================================================
   MISSED DOUBLE
========================================================= */

if (
    $("tap-missed-double")
) {

    $("tap-missed-double")
        .onclick =
            missedDouble;
}


if (
    $("missed-double-individual")
) {

    $("missed-double-individual")
        .onclick =
            missedDouble;
}


function missedDouble() {

    if (
        matchFinished
    ) {

        return;
    }


    beginVisit();

    pushUndo();


    players[
        currentPlayer -
        1
    ].stats.checkoutAttempts++;


    currentVisitDarts.push({

        type:
            "misseddouble",

        score:
            0,

        label:
            "Missed Double",

        isDouble:
            false
    });


    dartsLeft--;


    if (
        dartsLeft <=
        0
    ) {

        completeVisit(

            visitTotal(),

            false,

            false
        );


    } else {

        updateEverything();

        saveMatch();
    }
}


/* =========================================================
   END TURN EARLY
========================================================= */

if (
    $("tap-end-turn")
) {

    $("tap-end-turn")
        .onclick =
            () => {

                if (
                    currentVisitDarts.length ===
                    0
                ) {

                    return;
                }


                completeVisit(

                    visitTotal(),

                    false,

                    false
                );
            };
}


/* =========================================================
   WHOLE VISIT
========================================================= */

if (
    $("submit-score")
) {

    $("submit-score")
        .onclick =
            () =>
                submitWholeVisit(
                    scoreInput
                );
}


if (
    scoreInput
) {

    scoreInput
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    submitWholeVisit(
                        scoreInput
                    );
                }
            }
        );
}


function submitWholeVisit(
    input
) {

    if (
        matchFinished
    ) {

        return;
    }


    const score =
        parseInt(
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
            "Enter a score from 0 to 180."
        );


        return;
    }


    beginVisit();

    pushUndo();


    const player =
        players[
            currentPlayer -
            1
        ];


    const scoreBefore =
        player.score;


    const scoreAfter =
        scoreBefore -
        score;


    /*
       BUST
    */

    if (
        scoreAfter <
            0 ||
        scoreAfter ===
            1
    ) {

        announceVisitScore(
            0
        );


        completeVisit(
            0,
            false,
            true,
            3
        );


        input.value =
            "";


        return;
    }


    let checkout =
        false;


    /*
       EXACT ZERO:
       Ask if final dart was double.
    */

    if (
        scoreAfter ===
        0
    ) {

        const validDouble =
            confirm(

                "Did the final dart hit a DOUBLE or BULL?\n\n" +

                "OK = Yes, valid checkout\n" +

                "Cancel = No, bust"
            );


        if (
            !validDouble
        ) {

            announceVisitScore(
                0
            );


            completeVisit(
                0,
                false,
                true,
                3
            );


            input.value =
                "";


            return;
        }


        checkout =
            true;


        player.stats.checkoutAttempts++;
    }


    player.score =
        scoreAfter;


    currentVisitDarts = [

        {

            type:
                "wholevisit",

            score,

            label:
                `Visit ${score}`,

            isDouble:
                checkout
        }

    ];


    completeVisit(

        score,

        checkout,

        false,

        3
    );


    input.value =
        "";
}


/* =========================================================
   COMPLETE VISIT
========================================================= */

function completeVisit(
    score,
    checkout,
    bust,
    dartsUsedOverride = null
) {

    const throwingPlayer =
        currentPlayer;


    const player =
        players[
            throwingPlayer -
            1
        ];


    const dartsUsed =
        dartsUsedOverride ||

        Math.max(
            1,
            currentVisitDarts.length
        );


    updateVisitStats(

        player,

        score,

        dartsUsed
    );


    player.lastVisit =
        bust
            ? "BUST"
            : score;


    const visitID =
        visitCounter++;


    if (
        currentVisitStartSnapshot
    ) {

        visitRestoreSnapshots.set(

            visitID,

            clone(
                currentVisitStartSnapshot
            )
        );
    }


    player.stats.visits.push({

        id:
            visitID,

        player:
            throwingPlayer,

        playerName:
            player.name,

        score,

        dartsUsed,

        checkout,

        bust,

        remaining:
            player.score,

        darts:
            currentVisitDarts.map(
                dart =>
                    dart.label
            )
    });


    if (
        checkout
    ) {

        player.stats.checkouts++;


        player.stats.bestCheckout =
            Math.max(

                player.stats.bestCheckout,

                score
            );


        const result =
            handleLegWin(
                throwingPlayer
            );


        announceGameResult(
            result
        );


        if (
            result ===
            "match"
        ) {

            showCallerEvent(

                `GAME SHOT\nAND THE MATCH\n${player.name}`,

                4000
            );


        } else if (
            result ===
            "set"
        ) {

            showCallerEvent(

                `GAME SHOT\nAND THE SET\n${player.name}`,

                3000
            );


        } else {

            showCallerEvent(

                `GAME SHOT\n${player.name}`,

                2400
            );
        }


    } else {

        if (
            !bust
        ) {

            announceVisitScore(
                score
            );


            if (
                score ===
                180
            ) {

                showCallerEvent(

                    "ONE HUNDRED\nAND EIGHTY!",

                    3000
                );
            }
        }


        currentPlayer =
            currentPlayer ===
            1
                ? 2
                : 1;
    }


    currentVisitDarts =
        [];


    currentVisitStartSnapshot =
        null;


    dartsLeft =
        3;


    updateEverything();

    saveMatch();


    if (
        !matchFinished
    ) {

        setTimeout(
            announceTurnStatus,
            750
        );
    }
}


/* =========================================================
   STATS
========================================================= */

function updateVisitStats(
    player,
    score,
    dartsUsed
) {

    const stats =
        player.stats;


    stats.pointsScored +=
        score;


    stats.dartsThrown +=
        dartsUsed;


    stats.legPoints +=
        score;


    stats.legDarts +=
        dartsUsed;


    stats.highestVisit =
        Math.max(

            stats.highestVisit,

            score
        );


    if (
        score ===
        180
    ) {

        stats.scores180++;
    }


    if (
        score >=
            140 &&
        score <
            180
    ) {

        stats.scores140++;
    }


    if (
        score >=
            100 &&
        score <
            140
    ) {

        stats.scores100++;
    }


    const first9Remaining =
        9 -
        stats.first9Darts;


    if (
        first9Remaining >
        0
    ) {

        const used =
            Math.min(

                first9Remaining,

                dartsUsed
            );


        stats.first9Darts +=
            used;


        stats.first9Points +=

            score *
            (
                used /
                dartsUsed
            );
    }
}


/* =========================================================
   LEG / SET / MATCH
========================================================= */

function handleLegWin(
    playerNumber
) {

    players.forEach(
        player => {

            player.stats.lastLegAverage =

                player.stats.legDarts

                    ? (
                        player.stats.legPoints /
                        player.stats.legDarts
                      ) *
                      3

                    : 0;
        }
    );


    const winner =
        players[
            playerNumber -
            1
        ];


    winner.legs++;


    let wonSet =
        false;


    /*
       SETS MODE
    */

    if (
        gameMode ===
            "sets" &&
        winner.legs >=
            legsPerSet
    ) {

        winner.sets++;


        players[0].legs =
            0;


        players[1].legs =
            0;


        wonSet =
            true;


        if (
            winner.sets >=
            setsToWin
        ) {

            finishMatch(
                playerNumber
            );


            return "match";
        }


        currentSet++;
    }


    /*
       LEGS ONLY MODE
    */

    if (
        gameMode ===
            "legs" &&
        winner.legs >=
            setsToWin
    ) {

        finishMatch(
            playerNumber
        );


        return "match";
    }


    /*
       NEXT LEG
    */

    currentLeg++;


    players.forEach(
        player => {

            player.score =
                startingScore;


            player.stats.legPoints =
                0;


            player.stats.legDarts =
                0;
        }
    );


    /*
       Alternate first throw
    */

    legStartingPlayer =
        legStartingPlayer ===
        1
            ? 2
            : 1;


    currentPlayer =
        legStartingPlayer;


    return (
        wonSet
            ? "set"
            : "leg"
    );
}


function finishMatch(
    playerNumber
) {

    matchFinished =
        true;


    winnerPlayer =
        playerNumber;


    finishedBanner.textContent =
        `${players[playerNumber - 1].name} WINS THE MATCH!`;


    finishedBanner.classList.remove(
        "hidden"
    );


    saveProfiles();


    localStorage.removeItem(
        STORAGE_MATCH
    );
}


/* =========================================================
   ANNOUNCER
========================================================= */

function getVoice() {

    if (
        !(
            "speechSynthesis"
            in window
        )
    ) {

        return null;
    }


    const voices =
        speechSynthesis
            .getVoices();


    return (

        voices.find(
            voice =>
                (
                    voice.lang ||
                    ""
                )
                    .toLowerCase()
                    .startsWith(
                        "en-gb"
                    )
        )

        ||

        voices.find(
            voice =>
                (
                    voice.lang ||
                    ""
                )
                    .toLowerCase()
                    .startsWith(
                        "en"
                    )
        )

        ||

        null
    );
}


function speak(
    text,
    mode =
        "normal"
) {

    if (
        !announcerEnabled ||
        !(
            "speechSynthesis"
            in window
        )
    ) {

        return;
    }


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    const voice =
        getVoice();


    if (
        voice
    ) {

        utterance.voice =
            voice;
    }


    /*
       1 is browser maximum.
    */

    utterance.volume =
        1;


    if (
        mode ===
        "180"
    ) {

        utterance.rate =
            0.76;


        utterance.pitch =
            1.4;


    } else if (
        mode ===
        "game"
    ) {

        utterance.rate =
            0.80;


        utterance.pitch =
            1.18;


    } else if (
        mode ===
        "require"
    ) {

        utterance.rate =
            0.88;


        utterance.pitch =
            1.04;


    } else {

        utterance.rate =
            0.9;


        utterance.pitch =
            1.03;
    }


    speechSynthesis.speak(
        utterance
    );
}


function announceVisitScore(
    score
) {

    if (
        score ===
        180
    ) {

        speak(

            "ONE HUNDRED AND EIGHTYYYYYYYY!",

            "180"
        );


        return;
    }


    if (
        score ===
        0
    ) {

        speak(
            "NO SCORE!",
            "game"
        );


        return;
    }


    speak(
        numberWords(
            score
        )
    );
}


function announceTurnStatus() {

    if (
        matchFinished
    ) {

        return;
    }


    const player =
        players[
            currentPlayer -
            1
        ];


    const checkout =
        findBestCheckout(
            player.score,
            3
        );


    if (
        checkout
    ) {

        speak(

            `${player.name}, you require ${numberWords(player.score)}`,

            "require"
        );


    } else {

        speak(

            `${player.name}, to throw`,

            "require"
        );
    }
}


function announceGameResult(
    result
) {

    if (
        result ===
        "match"
    ) {

        speak(

            "GAME SHOT AND THE MATCH!",

            "game"
        );


    } else if (
        result ===
        "set"
    ) {

        speak(

            "GAME SHOT AND THE SET!",

            "game"
        );


    } else {

        speak(

            "GAME SHOT!",

            "game"
        );
    }
}


/* =========================================================
   NUMBER TO WORDS
========================================================= */

function numberWords(
    number
) {

    const small = [

        "zero",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
        "ten",
        "eleven",
        "twelve",
        "thirteen",
        "fourteen",
        "fifteen",
        "sixteen",
        "seventeen",
        "eighteen",
        "nineteen"

    ];


    const tens = [

        "",
        "",
        "twenty",
        "thirty",
        "forty",
        "fifty",
        "sixty",
        "seventy",
        "eighty",
        "ninety"

    ];


    if (
        number <
        20
    ) {

        return small[
            number
        ];
    }


    if (
        number <
        100
    ) {

        const ten =
            Math.floor(
                number /
                10
            );


        const unit =
            number %
            10;


        return (

            tens[ten]

            +

            (
                unit
                    ? " " +
                      small[unit]
                    : ""
            )
        );
    }


    if (
        number <
        1000
    ) {

        const hundreds =
            Math.floor(
                number /
                100
            );


        const remainder =
            number %
            100;


        return (

            small[hundreds]

            +

            " hundred"

            +

            (
                remainder
                    ? " and " +
                      numberWords(
                          remainder
                      )
                    : ""
            )
        );
    }


    return String(
        number
    );
}


/* =========================================================
   ANNOUNCER BUTTON
========================================================= */

if (
    toggleAnnouncerBtn
) {

    toggleAnnouncerBtn.onclick =
        () => {

            announcerEnabled =
                !announcerEnabled;


            toggleAnnouncerBtn.textContent =

                announcerEnabled

                    ? "🔊 Announcer: On"

                    : "🔇 Announcer: Off";


            if (
                !announcerEnabled &&
                "speechSynthesis"
                in window
            ) {

                speechSynthesis.cancel();
            }


            saveSettings();
        };
}


/* =========================================================
   CHECKOUT ENGINE
========================================================= */

const checkoutDarts =
    [];

const finishingDarts =
    [];


for (
    let number = 1;
    number <= 20;
    number++
) {

    checkoutDarts.push(

        {

            score:
                number,

            label:
                String(
                    number
                )
        },


        {

            score:
                number *
                2,

            label:
                "D" +
                number
        },


        {

            score:
                number *
                3,

            label:
                "T" +
                number
        }
    );


    finishingDarts.push(

        {

            score:
                number *
                2,

            label:
                "D" +
                number
        }
    );
}


checkoutDarts.push(

    {

        score:
            25,

        label:
            "25"
    },


    {

        score:
            50,

        label:
            "Bull"
    }

);


finishingDarts.push(

    {

        score:
            50,

        label:
            "Bull"
    }
);


/* =========================================================
   CHECKOUT PREFERENCES
========================================================= */

const preferredDoubles = [

    "D20",
    "D16",
    "D18",
    "D12",
    "D10",
    "D8",
    "D14",
    "D6",
    "D4",
    "D2",
    "D1",
    "Bull"

];


function findBestCheckout(
    score,
    dartsAvailable
) {

    if (
        score <
            2 ||
        score >
            170
    ) {

        return null;
    }


    const routes =
        [];


    /*
       ONE DART
    */

    if (
        dartsAvailable >=
        1
    ) {

        finishingDarts.forEach(
            finish => {

                if (
                    finish.score ===
                    score
                ) {

                    routes.push(
                        [
                            finish.label
                        ]
                    );
                }
            }
        );
    }


    /*
       TWO DARTS
    */

    if (
        dartsAvailable >=
        2
    ) {

        for (
            const first
            of checkoutDarts
        ) {

            const remainder =
                score -
                first.score;


            if (
                remainder <=
                1
            ) {

                continue;
            }


            for (
                const finish
                of finishingDarts
            ) {

                if (
                    first.score +
                    finish.score ===
                    score
                ) {

                    routes.push(
                        [
                            first.label,
                            finish.label
                        ]
                    );
                }
            }
        }
    }


    /*
       THREE DARTS
    */

    if (
        dartsAvailable >=
        3
    ) {

        for (
            const first
            of checkoutDarts
        ) {

            const afterFirst =
                score -
                first.score;


            if (
                afterFirst <=
                1
            ) {

                continue;
            }


            for (
                const second
                of checkoutDarts
            ) {

                const afterSecond =
                    afterFirst -
                    second.score;


                if (
                    afterSecond <=
                    1
                ) {

                    continue;
                }


                for (
                    const finish
                    of finishingDarts
                ) {

                    if (
                        first.score +
                        second.score +
                        finish.score ===
                        score
                    ) {

                        routes.push(
                            [
                                first.label,
                                second.label,
                                finish.label
                            ]
                        );
                    }
                }
            }
        }
    }


    if (
        !routes.length
    ) {

        return null;
    }


    routes.sort(
        compareRoutes
    );


    return routes[0];
}


function compareRoutes(
    a,
    b
) {

    if (
        a.length !==
        b.length
    ) {

        return (
            a.length -
            b.length
        );
    }


    const aFinish =
        a[
            a.length -
            1
        ];


    const bFinish =
        b[
            b.length -
            1
        ];


    const ai =
        preferredDoubles.indexOf(
            aFinish
        );


    const bi =
        preferredDoubles.indexOf(
            bFinish
        );


    const aRank =
        ai ===
        -1
            ? 999
            : ai;


    const bRank =
        bi ===
        -1
            ? 999
            : bi;


    if (
        aRank !==
        bRank
    ) {

        return (
            aRank -
            bRank
        );
    }


    return (
        routePreference(
            b
        ) -
        routePreference(
            a
        )
    );
}


function routePreference(
    route
) {

    return route.reduce(

        (
            total,
            label
        ) => {

            if (
                label.startsWith(
                    "T"
                )
            ) {

                return (
                    total +
                    20
                );
            }


            if (
                label.startsWith(
                    "D"
                )
            ) {

                return (
                    total +
                    8
                );
            }


            if (
                label ===
                "Bull"
            ) {

                return (
                    total +
                    6
                );
            }


            return (
                total +
                5
            );
        },

        0
    );
}


/* =========================================================
   SETUP SUGGESTIONS
========================================================= */

function getSetupSuggestion(
    score,
    dartsAvailable
) {

    const options = [

        {
            score:
                60,
            label:
                "T20"
        },

        {
            score:
                57,
            label:
                "T19"
        },

        {
            score:
                54,
            label:
                "T18"
        },

        {
            score:
                51,
            label:
                "T17"
        },

        {
            score:
                48,
            label:
                "T16"
        },

        {
            score:
                45,
            label:
                "T15"
        },

        {
            score:
                42,
            label:
                "T14"
        },

        {
            score:
                39,
            label:
                "T13"
        },

        {
            score:
                36,
            label:
                "T12"
        },

        {
            score:
                20,
            label:
                "20"
        },

        {
            score:
                19,
            label:
                "19"
        },

        {
            score:
                18,
            label:
                "18"
        },

        {
            score:
                17,
            label:
                "17"
        },

        {
            score:
                16,
            label:
                "16"
        },

        {
            score:
                15,
            label:
                "15"
        },

        {
            score:
                14,
            label:
                "14"
        },

        {
            score:
                13,
            label:
                "13"
        },

        {
            score:
                12,
            label:
                "12"
        }
    ];


    let best =
        null;


    function consider(
        route,
        total
    ) {

        const leave =
            score -
            total;


        if (
            leave <=
            1
        ) {

            return;
        }


        const nextCheckout =
            leave <=
            170

                ? findBestCheckout(
                    leave,
                    3
                )

                : null;


        let rank =
            leave;


        if (
            nextCheckout
        ) {

            rank -=
                10000;
        }


        /*
           Reward common doubles.
        */

        if (
            [
                40,
                32,
                36,
                24,
                20,
                16
            ].includes(
                leave
            )
        ) {

            rank -=
                500;
        }


        rank -=
            total;


        if (
            !best ||
            rank <
            best.rank
        ) {

            best = {

                route,

                leave,

                rank
            };
        }
    }


    for (
        const a
        of options
    ) {

        consider(
            [
                a.label
            ],
            a.score
        );


        if (
            dartsAvailable >=
            2
        ) {

            for (
                const b
                of options
            ) {

                consider(

                    [
                        a.label,
                        b.label
                    ],

                    a.score +
                    b.score
                );


                if (
                    dartsAvailable >=
                    3
                ) {

                    for (
                        const c
                        of options
                    ) {

                        consider(

                            [
                                a.label,
                                b.label,
                                c.label
                            ],

                            a.score +
                            b.score +
                            c.score
                        );
                    }
                }
            }
        }
    }


    return best;
}


function getSuggestion(
    score,
    dartsAvailable
) {

    const checkout =
        findBestCheckout(

            score,

            dartsAvailable
        );


    if (
        checkout
    ) {

        return {

            type:
                "checkout",

            route:
                checkout,

            text:
                "Checkout: " +
                checkout.join(
                    " → "
                )
        };
    }


    const setup =
        getSetupSuggestion(

            score,

            dartsAvailable
        );


    if (
        setup
    ) {

        return {

            type:
                "setup",

            route:
                setup.route,

            leave:
                setup.leave,

            text:

                "Setup: " +

                setup.route.join(
                    " → "
                )

                +

                " · Leave " +

                setup.leave
        };
    }


    return {

        type:
            "none",

        route:
            [],

        text:
            "Score heavily"
    };
}


/* =========================================================
   MAIN DISPLAY
========================================================= */

function updateEverything() {

    updateNameDisplays();


    p1ScoreDisplay.textContent =
        players[0].score;


    p2ScoreDisplay.textContent =
        players[1].score;


    p1LegsDisplay.textContent =
        `Legs: ${players[0].legs}`;


    p2LegsDisplay.textContent =
        `Legs: ${players[1].legs}`;


    p1SetsDisplay.textContent =
        `Sets: ${players[0].sets}`;


    p2SetsDisplay.textContent =
        `Sets: ${players[1].sets}`;


    if (
        gameMode ===
        "sets"
    ) {

        modeLabel.textContent =
            `${legsPerSet} legs per set · First to ${setsToWin} sets`;


        legSetStatus.textContent =
            `Set ${currentSet} · Leg ${currentLeg}`;


    } else {

        modeLabel.textContent =
            `First to ${setsToWin} legs`;


        legSetStatus.textContent =
            `Leg ${currentLeg}`;
    }


    dartsStatus.textContent =
        matchFinished

            ? "Match Finished"

            : `Darts: ${dartsLeft}`;


    p1Box.classList.toggle(

        "active",

        currentPlayer ===
            1 &&
        !matchFinished
    );


    p2Box.classList.toggle(

        "active",

        currentPlayer ===
            2 &&
        !matchFinished
    );


    if (
        matchFinished
    ) {

        checkoutText.textContent =
            "Match complete";


    } else {

        const suggestion =
            getSuggestion(

                players[
                    currentPlayer -
                    1
                ].score,

                dartsLeft
            );


        checkoutText.textContent =
            suggestion.text;
    }


    updateIndividualStatus();

    updateStats();

    updateHistory();

    updateUndoButtons();

    updateCaller();
}


function updateIndividualStatus() {

    if (
        !individualDartStatus
    ) {

        return;
    }


    if (
        matchFinished
    ) {

        individualDartStatus.textContent =
            "Match finished";


        return;
    }


    individualDartStatus.textContent =

        `${players[currentPlayer - 1].name} · ` +

        `${dartsLeft} dart${dartsLeft === 1 ? "" : "s"} remaining`;
}


/* =========================================================
   CALLER DISPLAY
========================================================= */

function updateCaller() {

    if (
        !callerScreen
    ) {

        return;
    }


    callerP1Name.textContent =
        players[0].name;


    callerP2Name.textContent =
        players[1].name;


    callerP1Score.textContent =
        players[0].score;


    callerP2Score.textContent =
        players[1].score;


    callerP1Sets.textContent =
        `Sets ${players[0].sets}`;


    callerP2Sets.textContent =
        `Sets ${players[1].sets}`;


    callerP1Legs.textContent =
        `Legs ${players[0].legs}`;


    callerP2Legs.textContent =
        `Legs ${players[1].legs}`;


    callerP1Last.textContent =
        `Last: ${players[0].lastVisit ?? "–"}`;


    callerP2Last.textContent =
        `Last: ${players[1].lastVisit ?? "–"}`;


    callerP1.classList.toggle(

        "active",

        currentPlayer ===
            1 &&
        !matchFinished
    );


    callerP2.classList.toggle(

        "active",

        currentPlayer ===
            2 &&
        !matchFinished
    );


    callerMatchInfo.textContent =
        gameMode ===
        "sets"

            ? `Set ${currentSet} • Leg ${currentLeg}`

            : `Leg ${currentLeg}`;


    if (
        matchFinished
    ) {

        const winner =
            players[
                winnerPlayer -
                1
            ];


        callerTurn.textContent =
            "MATCH COMPLETE";


        callerRequire.textContent =
            `${winner.name.toUpperCase()} WINS`;


        callerRoute.textContent =
            "";


    } else {

        const player =
            players[
                currentPlayer -
                1
            ];


        const suggestion =
            getSuggestion(

                player.score,

                dartsLeft
            );


        callerTurn.textContent =
            `${player.name.toUpperCase()} TO THROW`;


        if (
            suggestion.type ===
            "checkout"
        ) {

            callerRequire.textContent =

                `${player.name.toUpperCase()} REQUIRES ${player.score}`;


            callerRoute.textContent =
                suggestion.route.join(
                    " → "
                );


        } else {

            callerRequire.textContent =

                `${player.name.toUpperCase()} — ${player.score}`;


            callerRoute.textContent =
                suggestion.text;
        }
    }


    if (
        currentVisitDarts.length
    ) {

        callerCurrentVisit.textContent =

            "Current visit: " +

            currentVisitDarts

                .map(
                    dart =>
                        dart.label
                )

                .join(
                    " • "
                )

            +

            " = " +

            visitTotal();


    } else {

        callerCurrentVisit.textContent =
            "Current visit: –";
    }
}


/* =========================================================
   CALLER MODE
========================================================= */

if (
    callerModeBtn
) {

    callerModeBtn.onclick =
        openCaller;
}


if (
    callerCloseBtn
) {

    callerCloseBtn.onclick =
        closeCaller;
}


if (
    callerDisplayBtn
) {

    callerDisplayBtn.onclick =
        () =>
            setCallerView(
                "display"
            );
}


if (
    callerScorerBtn
) {

    callerScorerBtn.onclick =
        () =>
            setCallerView(
                "scorer"
            );
}


function openCaller() {

    callerOpen =
        true;


    callerScreen.classList.remove(
        "hidden"
    );


    setCallerView(
        "display"
    );


    updateCaller();


    if (
        document.documentElement
            .requestFullscreen
    ) {

        document.documentElement
            .requestFullscreen()
            .catch(
                () => {}
            );
    }
}


function closeCaller() {

    callerOpen =
        false;


    if (
        callerScreen
    ) {

        callerScreen.classList.add(
            "hidden"
        );
    }


    if (
        document.fullscreenElement &&
        document.exitFullscreen
    ) {

        document
            .exitFullscreen()
            .catch(
                () => {}
            );
    }
}


function setCallerView(
    view
) {

    callerView =
        view;


    callerDisplayBtn.classList.toggle(

        "active",

        view ===
        "display"
    );


    callerScorerBtn.classList.toggle(

        "active",

        view ===
        "scorer"
    );


    callerScorerControls.classList.toggle(

        "hidden",

        view !==
        "scorer"
    );
}


/* =========================================================
   CALLER SCORER METHOD
========================================================= */

document
    .querySelectorAll(
        ".caller-method"
    )
    .forEach(
        button => {

            button.onclick =
                () => {

                    document
                        .querySelectorAll(
                            ".caller-method"
                        )
                        .forEach(
                            other => {

                                other.classList.remove(
                                    "active"
                                );
                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    const method =
                        button.dataset.callerMethod;


                    callerVisitEntry.classList.toggle(

                        "hidden",

                        method !==
                        "visit"
                    );


                    callerDartEntry.classList.toggle(

                        "hidden",

                        method !==
                        "dart"
                    );
                };
        }
    );


if (
    $("caller-submit-visit")
) {

    $("caller-submit-visit")
        .onclick =
            () =>
                submitWholeVisit(
                    callerVisitInput
                );
}


if (
    callerVisitInput
) {

    callerVisitInput
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    submitWholeVisit(
                        callerVisitInput
                    );
                }
            }
        );
}


if (
    $("caller-submit-dart")
) {

    $("caller-submit-dart")
        .onclick =
            submitCallerDart;
}


if (
    callerDartNumber
) {

    callerDartNumber
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    submitCallerDart();
                }
            }
        );
}


function submitCallerDart() {

    const dart =
        dartFromInputs(

            callerDartType,

            callerDartNumber
        );


    if (
        !dart
    ) {

        return;
    }


    applyDart(
        dart
    );


    callerDartNumber.value =
        "";
}


if (
    $("caller-missed-double")
) {

    $("caller-missed-double")
        .onclick =
            missedDouble;
}


if (
    $("caller-undo")
) {

    $("caller-undo")
        .onclick =
            undoNormal;
}


/* =========================================================
   CALLER CELEBRATION
========================================================= */

let callerEventTimer =
    null;


function showCallerEvent(
    text,
    duration =
        2200
) {

    if (
        !callerOpen ||
        !callerCelebration
    ) {

        return;
    }


    clearTimeout(
        callerEventTimer
    );


    callerCelebrationText.textContent =
        text;


    callerCelebration.classList.remove(
        "hidden"
    );


    callerEventTimer =
        setTimeout(
            () => {

                callerCelebration.classList.add(
                    "hidden"
                );

            },
            duration
        );
}


/* =========================================================
   STATS DISPLAY
========================================================= */

function calculateAverage(
    stats
) {

    return stats.dartsThrown

        ? (
            stats.pointsScored /
            stats.dartsThrown *
            3
          ).toFixed(
              2
          )

        : "0.00";
}


function statRow(
    label,
    value
) {

    return `

        <div class="stat-row">

            <span>
                ${label}
            </span>

            <strong>
                ${value}
            </strong>

        </div>
    `;
}


function statsHTML(
    player
) {

    const stats =
        player.stats;


    const legAverage =
        stats.legDarts

            ? (
                stats.legPoints /
                stats.legDarts *
                3
              ).toFixed(
                  2
              )

            : "0.00";


    const first9 =
        stats.first9Darts

            ? (
                stats.first9Points /
                stats.first9Darts *
                3
              ).toFixed(
                  2
              )

            : "0.00";


    const checkoutPercentage =
        stats.checkoutAttempts

            ? (
                stats.checkouts /
                stats.checkoutAttempts *
                100
              ).toFixed(
                  1
              )
              +
              "%"

            : "0.0%";


    return `

        <h3>
            ${escapeHTML(player.name)}
        </h3>

        ${statRow(
            "Match Average",
            calculateAverage(
                stats
            )
        )}

        ${statRow(
            "Current Leg Avg",
            legAverage
        )}

        ${statRow(
            "Last Leg Avg",
            stats.lastLegAverage
                ? stats.lastLegAverage.toFixed(2)
                : "–"
        )}

        ${statRow(
            "First 9 Average",
            first9
        )}

        ${statRow(
            "Highest Visit",
            stats.highestVisit
        )}

        ${statRow(
            "100+",
            stats.scores100
        )}

        ${statRow(
            "140+",
            stats.scores140
        )}

        ${statRow(
            "180s",
            stats.scores180
        )}

        ${statRow(
            "Darts Thrown",
            stats.dartsThrown
        )}

        ${statRow(
            "Checkout %",
            checkoutPercentage
        )}

        ${statRow(
            "Best Checkout",
            stats.bestCheckout ||
            "–"
        )}
    `;
}


function updateStats() {

    if (
        statsP1
    ) {

        statsP1.innerHTML =
            statsHTML(
                players[0]
            );
    }


    if (
        statsP2
    ) {

        statsP2.innerHTML =
            statsHTML(
                players[1]
            );
    }
}


/* =========================================================
   HISTORY
========================================================= */

function getAllVisits() {

    return [

        ...players[0].stats.visits,

        ...players[1].stats.visits

    ].sort(
        (
            a,
            b
        ) =>
            a.id -
            b.id
    );
}


function updateHistory() {

    if (
        !visitHistoryList
    ) {

        return;
    }


    const visits =
        getAllVisits();


    if (
        !visits.length
    ) {

        visitHistoryList.innerHTML =

            '<div class="visit-meta">' +

            'No completed visits yet.' +

            '</div>';


        return;
    }


    visitHistoryList.innerHTML =
        visits

            .slice()

            .reverse()

            .map(
                visit => `

                    <div
                        class="visit-item"
                        data-id="${visit.id}"
                    >

                        <span class="visit-player">
                            ${escapeHTML(visit.playerName)}
                        </span>

                        <span class="visit-meta">

                            ${escapeHTML(
                                visit.darts.join(
                                    " • "
                                )
                            )}

                        </span>

                        <span class="visit-score">

                            ${
                                visit.bust
                                    ? "BUST"
                                    : visit.score
                            }

                        </span>

                    </div>
                `
            )

            .join(
                ""
            );


    visitHistoryList
        .querySelectorAll(
            ".visit-item"
        )
        .forEach(
            item => {

                item.onclick =
                    () =>
                        restoreVisit(

                            parseInt(
                                item.dataset.id
                            )
                        );
            }
        );
}


function restoreVisit(
    id
) {

    const snapshot =
        visitRestoreSnapshots.get(
            id
        );


    if (
        !snapshot
    ) {

        alert(

            "This visit cannot be restored after the page has been refreshed."
        );


        return;
    }


    if (
        !confirm(
            "Restore the match to immediately before this visit?"
        )
    ) {

        return;
    }


    restoreSnapshot(
        clone(
            snapshot
        )
    );
}


/* =========================================================
   UNDO
========================================================= */

function makeSnapshot() {

    return clone({

        selectedMode,

        gameMode,

        startingScore,

        legsPerSet,

        setsToWin,

        currentSet,

        currentLeg,

        currentPlayer,

        legStartingPlayer,

        selectedStartingPlayer,

        dartsLeft,

        currentVisitDarts,

        matchFinished,

        winnerPlayer,

        visitCounter,

        players
    });
}


function pushUndo() {

    normalHistory.push(
        makeSnapshot()
    );


    if (
        normalHistory.length >
        MAX_HISTORY
    ) {

        normalHistory.shift();
    }


    updateUndoButtons();
}


function undoNormal() {

    if (
        normalHistory.length ===
        0
    ) {

        return;
    }


    if (
        "speechSynthesis"
        in window
    ) {

        speechSynthesis.cancel();
    }


    const snapshot =
        normalHistory.pop();


    restoreSnapshot(
        snapshot
    );
}


if (
    normalUndoBtn
) {

    normalUndoBtn.onclick =
        undoNormal;
}


function restoreSnapshot(
    snapshot
) {

    selectedMode =
        snapshot.selectedMode;


    gameMode =
        snapshot.gameMode;


    startingScore =
        snapshot.startingScore;


    legsPerSet =
        snapshot.legsPerSet;


    setsToWin =
        snapshot.setsToWin;


    currentSet =
        snapshot.currentSet;


    currentLeg =
        snapshot.currentLeg;


    currentPlayer =
        snapshot.currentPlayer;


    legStartingPlayer =
        snapshot.legStartingPlayer;


    selectedStartingPlayer =
        snapshot.selectedStartingPlayer;


    dartsLeft =
        snapshot.dartsLeft;


    currentVisitDarts =
        snapshot.currentVisitDarts ||
        [];


    matchFinished =
        snapshot.matchFinished;


    winnerPlayer =
        snapshot.winnerPlayer;


    visitCounter =
        snapshot.visitCounter ||
        1;


    players =
        snapshot.players;


    currentVisitStartSnapshot =
        null;


    updateEverything();

    saveMatch();
}


function updateUndoButtons() {

    if (
        normalUndoBtn
    ) {

        normalUndoBtn.disabled =
            normalHistory.length ===
            0;
    }


    if (
        $("caller-undo")
    ) {

        $("caller-undo").disabled =
            normalHistory.length ===
            0;
    }


    if (
        $("undo-cricket")
    ) {

        $("undo-cricket").disabled =
            cricketHistory.length ===
            0;
    }
}


/* =========================================================
   SAVE MATCH
========================================================= */

function saveMatch() {

    if (
        matchFinished ||
        selectedMode ===
        "cricket"
    ) {

        return;
    }


    try {

        localStorage.setItem(

            STORAGE_MATCH,

            JSON.stringify(
                makeSnapshot()
            )
        );


    } catch (
        error
    ) {

        console.warn(
            "Could not save match:",
            error
        );
    }
}


function checkSavedMatch() {

    const banner =
        $("resume-banner");


    if (
        !banner
    ) {

        return;
    }


    try {

        if (
            localStorage.getItem(
                STORAGE_MATCH
            )
        ) {

            banner.classList.remove(
                "hidden"
            );
        }


    } catch (
        error
    ) {

        console.warn(
            error
        );
    }
}


/* =========================================================
   RESUME MATCH
========================================================= */

if (
    $("resume-match-btn")
) {

    $("resume-match-btn")
        .onclick =
            () => {

                try {

                    const saved =
                        JSON.parse(

                            localStorage.getItem(
                                STORAGE_MATCH
                            )
                        );


                    if (
                        !saved
                    ) {

                        return;
                    }


                    modeScreen.classList.add(
                        "hidden"
                    );


                    nameScreen.classList.add(
                        "hidden"
                    );


                    setupScreen.classList.add(
                        "hidden"
                    );


                    gameScreen.classList.remove(
                        "hidden"
                    );


                    restoreSnapshot(
                        saved
                    );


                    activateMobileTab(
                        "score"
                    );


                } catch (
                    error
                ) {

                    alert(
                        "Could not restore the saved match."
                    );
                }
            };
}


if (
    $("discard-match-btn")
) {

    $("discard-match-btn")
        .onclick =
            () => {

                localStorage.removeItem(
                    STORAGE_MATCH
                );


                $("resume-banner")
                    .classList.add(
                        "hidden"
                    );
            };
}


/* =========================================================
   PLAYER PROFILES
========================================================= */

function getProfiles() {

    try {

        return JSON.parse(

            localStorage.getItem(
                STORAGE_PROFILES
            )
            ||
            "{}"
        );


    } catch (
        error
    ) {

        return {};
    }
}


function saveProfiles() {

    const profiles =
        getProfiles();


    players.forEach(
        (
            player,
            index
        ) => {

            const key =
                player.name

                    .trim()

                    .toLowerCase();


            const profile =
                profiles[
                    key
                ]
                ||
                {

                    name:
                        player.name,

                    matches:
                        0,

                    wins:
                        0,

                    points:
                        0,

                    darts:
                        0,

                    scores180:
                        0,

                    bestCheckout:
                        0,

                    checkouts:
                        0,

                    checkoutAttempts:
                        0
                };


            profile.name =
                player.name;


            profile.matches++;


            if (
                winnerPlayer ===
                index +
                1
            ) {

                profile.wins++;
            }


            profile.points +=
                player.stats.pointsScored;


            profile.darts +=
                player.stats.dartsThrown;


            profile.scores180 +=
                player.stats.scores180;


            profile.checkouts +=
                player.stats.checkouts;


            profile.checkoutAttempts +=
                player.stats.checkoutAttempts;


            profile.bestCheckout =
                Math.max(

                    profile.bestCheckout,

                    player.stats.bestCheckout
                );


            profiles[
                key
            ] =
                profile;
        }
    );


    localStorage.setItem(

        STORAGE_PROFILES,

        JSON.stringify(
            profiles
        )
    );
}


if (
    profileBtn
) {

    profileBtn.onclick =
        showProfiles;
}


function showProfiles() {

    const profiles =
        Object.values(
            getProfiles()
        );


    if (
        profiles.length ===
        0
    ) {

        alert(
            "No saved player profiles yet. Complete a match first."
        );


        return;
    }


    const text =
        profiles.map(
            profile => {

                const average =
                    profile.darts

                        ? (
                            profile.points /
                            profile.darts *
                            3
                          ).toFixed(
                              2
                          )

                        : "0.00";


                const checkoutPercentage =
                    profile.checkoutAttempts

                        ? (
                            profile.checkouts /
                            profile.checkoutAttempts *
                            100
                          ).toFixed(
                              1
                          )

                        : "0.0";


                return (

                    `${profile.name}\n` +

                    `Matches: ${profile.matches}\n` +

                    `Wins: ${profile.wins}\n` +

                    `Average: ${average}\n` +

                    `180s: ${profile.scores180}\n` +

                    `Checkout: ${checkoutPercentage}%\n` +

                    `Best Checkout: ${profile.bestCheckout || "-"}`
                );
            }
        )
        .join(
            "\n\n"
        );


    alert(
        text
    );
}


/* =========================================================
   SETTINGS
========================================================= */

function saveSettings() {

    try {

        localStorage.setItem(

            STORAGE_SETTINGS,

            JSON.stringify({

                announcerEnabled

            })
        );


    } catch (
        error
    ) {

        console.warn(
            error
        );
    }
}


function loadSettings() {

    try {

        const saved =
            JSON.parse(

                localStorage.getItem(
                    STORAGE_SETTINGS
                )
                ||
                "{}"
            );


        announcerEnabled =
            saved.announcerEnabled !==
            false;


    } catch (
        error
    ) {

        announcerEnabled =
            true;
    }


    if (
        toggleAnnouncerBtn
    ) {

        toggleAnnouncerBtn.textContent =

            announcerEnabled

                ? "🔊 Announcer: On"

                : "🔇 Announcer: Off";
    }
}


/* =========================================================
   NEW MATCH
========================================================= */

if (
    newMatchBtn
) {

    newMatchBtn.onclick =
        () => {

            if (
                !confirm(
                    "Start a new match?"
                )
            ) {

                return;
            }


            localStorage.removeItem(
                STORAGE_MATCH
            );


            closeCaller();


            gameScreen.classList.add(
                "hidden"
            );


            modeScreen.classList.remove(
                "hidden"
            );


            finishedBanner.classList.add(
                "hidden"
            );
        };
}


/* =========================================================
   GAME BACK
========================================================= */

if (
    $("game-back")
) {

    $("game-back").onclick =
        () => {

            closeCaller();


            gameScreen.classList.add(
                "hidden"
            );


            modeScreen.classList.remove(
                "hidden"
            );
        };
}


/* =========================================================
   CRICKET DOM
========================================================= */

const cricketTeamA =
    $("cricket-team-a");

const cricketTeamB =
    $("cricket-team-b");

const cricketBattingName =
    $("cricket-batting-name");

const cricketBowlingName =
    $("cricket-bowling-name");


/* =========================================================
   CRICKET STATE
========================================================= */

let cricketInnings =
    1;

let cricketRuns =
    0;

let cricketWickets =
    0;

let cricketNextWicket =
    1;

let cricketTarget =
    null;

let cricketDarts =
    3;

let cricketPhase =
    "bowling";

let cricketTotalWickets =
    11;

let cricketFinished =
    false;


const cricketHistory =
    [];


/* =========================================================
   CRICKET NAMES
========================================================= */

function setupCricketNames(
    teamA,
    teamB
) {

    cricketTeamA.textContent =
        teamA;


    cricketTeamB.textContent =
        teamB;


    cricketBowlingName.textContent =
        teamA;


    cricketBattingName.textContent =
        teamB;


    nameScreen.classList.add(
        "hidden"
    );


    cricketScreen.classList.remove(
        "hidden"
    );


    buildCricketBoard();

    resetCricket(
        false
    );
}


/* =========================================================
   CRICKET BOARD
========================================================= */

function buildCricketBoard() {

    const singles =
        $("cricket-bowl-singles");


    if (
        !singles ||
        singles.children.length >
        0
    ) {

        return;
    }


    const groups = [

        [
            "cricket-bowl-singles",
            1,
            "bowl"
        ],

        [
            "cricket-bowl-doubles",
            2,
            "bowl"
        ],

        [
            "cricket-bowl-trebles",
            3,
            "bowl"
        ],

        [
            "cricket-bat-singles",
            1,
            "bat"
        ],

        [
            "cricket-bat-doubles",
            2,
            "bat"
        ],

        [
            "cricket-bat-trebles",
            3,
            "bat"
        ]
    ];


    groups.forEach(
        (
            [
                id,
                multiplier,
                role
            ]
        ) => {

            const container =
                $(
                    id
                );


            for (
                let number = 1;
                number <= 20;
                number++
            ) {

                const button =
                    document.createElement(
                        "button"
                    );


                button.className =
                    "btn-score";


                button.textContent =

                    (
                        multiplier ===
                        1

                            ? ""

                            : multiplier ===
                              2

                                ? "D"

                                : "T"
                    )
                    +
                    number;


                button.onclick =
                    () =>
                        cricketDart(

                            role,

                            number,

                            multiplier,

                            number *
                            multiplier
                        );


                container.appendChild(
                    button
                );
            }
        }
    );
}


/* =========================================================
   CRICKET RESET
========================================================= */

function resetCricket(
    saveUndo =
        true
) {

    if (
        saveUndo
    ) {

        pushCricket();
    }


    cricketTotalWickets =
        Math.min(

            20,

            Math.max(

                1,

                parseInt(
                    $("cricket-total-wickets")
                        .value
                )
                ||
                11
            )
        );


    cricketInnings =
        1;


    cricketRuns =
        0;


    cricketWickets =
        0;


    cricketNextWicket =
        1;


    cricketTarget =
        null;


    cricketDarts =
        3;


    cricketPhase =
        "bowling";


    cricketFinished =
        false;


    cricketBowlingName.textContent =
        cricketTeamA.textContent;


    cricketBattingName.textContent =
        cricketTeamB.textContent;


    updateCricket();
}


/* =========================================================
   CRICKET UNDO SNAPSHOT
========================================================= */

function pushCricket() {

    cricketHistory.push({

        cricketInnings,

        cricketRuns,

        cricketWickets,

        cricketNextWicket,

        cricketTarget,

        cricketDarts,

        cricketPhase,

        cricketTotalWickets,

        cricketFinished,

        batting:
            cricketBattingName.textContent,

        bowling:
            cricketBowlingName.textContent
    });


    if (
        cricketHistory.length >
        MAX_HISTORY
    ) {

        cricketHistory.shift();
    }


    updateUndoButtons();
}


/* =========================================================
   CRICKET DART
========================================================= */

function cricketDart(
    role,
    base,
    multiplier,
    score
) {

    if (
        cricketFinished
    ) {

        return;
    }


    if (
        cricketPhase ===
            "bowling" &&
        role !==
            "bowl"
    ) {

        return;
    }


    if (
        cricketPhase ===
            "batting" &&
        role !==
            "bat"
    ) {

        return;
    }


    pushCricket();


    if (
        role ===
        "bowl"
    ) {

        if (
            base ===
            cricketNextWicket
        ) {

            takeCricketWickets(
                multiplier
            );
        }


    } else {

        if (
            base ===
            cricketNextWicket
        ) {

            takeCricketWickets(
                multiplier
            );


        } else {

            cricketRuns +=
                score;
        }
    }


    cricketDarts--;


    if (
        cricketDarts <=
        0
    ) {

        cricketDarts =
            3;


        cricketPhase =
            cricketPhase ===
            "bowling"

                ? "batting"

                : "bowling";
    }


    checkCricket();

    updateCricket();
}


/* =========================================================
   CRICKET WICKETS
========================================================= */

function takeCricketWickets(
    amount
) {

    const remaining =
        cricketTotalWickets -
        cricketWickets;


    const actual =
        Math.min(

            amount,

            remaining
        );


    cricketWickets +=
        actual;


    cricketNextWicket +=
        actual;


    if (
        cricketNextWicket >
        cricketTotalWickets
    ) {

        cricketNextWicket =
            cricketTotalWickets;
    }
}


/* =========================================================
   SECOND CRICKET INNINGS
========================================================= */

function startSecondCricketInnings() {

    cricketTarget =
        cricketRuns +
        1;


    cricketInnings =
        2;


    cricketRuns =
        0;


    cricketWickets =
        0;


    cricketNextWicket =
        1;


    cricketDarts =
        3;


    cricketPhase =
        "bowling";


    cricketBattingName.textContent =
        cricketTeamA.textContent;


    cricketBowlingName.textContent =
        cricketTeamB.textContent;
}


/* =========================================================
   CRICKET RESULT
========================================================= */

function checkCricket() {

    if (
        cricketWickets >=
        cricketTotalWickets
    ) {

        if (
            cricketInnings ===
            1
        ) {

            startSecondCricketInnings();


        } else {

            cricketFinished =
                true;


            alert(
                `${cricketBowlingName.textContent} wins!`
            );
        }
    }


    if (
        cricketInnings ===
            2 &&
        cricketTarget !==
            null &&
        cricketRuns >=
            cricketTarget
    ) {

        cricketFinished =
            true;


        alert(
            `${cricketBattingName.textContent} wins!`
        );
    }
}


/* =========================================================
   CRICKET DISPLAY
========================================================= */

function updateCricket() {

    if (
        !$(
            "cricket-runs"
        )
    ) {

        return;
    }


    $("cricket-runs")
        .textContent =
            cricketRuns;


    $("cricket-wickets")
        .textContent =
            cricketWickets;


    $("cricket-innings")
        .textContent =
            cricketInnings;


    $("cricket-danger")
        .textContent =

            cricketWickets >=
            cricketTotalWickets

                ? "–"

                : cricketNextWicket;


    $("cricket-target")
        .textContent =

            cricketTarget ??
            "–";


    $("cricket-phase")
        .textContent =

            cricketFinished

                ? "Match Finished"

                : cricketPhase ===
                  "bowling"

                    ? "Bowling Turn"

                    : "Batting Turn";


    $("cricket-darts-left")
        .textContent =

            cricketFinished

                ? "–"

                : cricketDarts;


    $("cricket-total-wickets")
        .value =
            cricketTotalWickets;


    updateUndoButtons();
}


/* =========================================================
   CRICKET BUTTON EVENTS
========================================================= */

if (
    $("cricket-start-match")
) {

    $("cricket-start-match")
        .onclick =
            () =>
                resetCricket(
                    true
                );
}


if (
    $("cricket-declare")
) {

    $("cricket-declare")
        .onclick =
            () => {

                if (
                    cricketFinished
                ) {

                    return;
                }


                pushCricket();


                if (
                    cricketInnings ===
                    1
                ) {

                    startSecondCricketInnings();


                } else {

                    cricketFinished =
                        true;
                }


                updateCricket();
            };
}


/* =========================================================
   CRICKET MISS SCORING ZONE
========================================================= */

if (
    $("cricket-miss-board")
) {

    $("cricket-miss-board")
        .onclick =
            () => {

                if (
                    cricketFinished ||
                    cricketPhase !==
                    "batting"
                ) {

                    return;
                }


                pushCricket();


                cricketRuns++;


                cricketDarts--;


                if (
                    cricketDarts <=
                    0
                ) {

                    cricketDarts =
                        3;


                    cricketPhase =
                        "bowling";
                }


                checkCricket();

                updateCricket();
            };
}


/* =========================================================
   CRICKET FALL OUT
   +1 RUN + EXTRA DART
========================================================= */

if (
    $("cricket-fall-out")
) {

    $("cricket-fall-out")
        .onclick =
            () => {

                if (
                    cricketFinished ||
                    cricketPhase !==
                    "batting"
                ) {

                    return;
                }


                pushCricket();


                cricketRuns++;


                /*
                   No dart removed:
                   therefore extra dart.
                */


                checkCricket();

                updateCricket();
            };
}


/* =========================================================
   CRICKET UNDO
========================================================= */

if (
    $("undo-cricket")
) {

    $("undo-cricket")
        .onclick =
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


                cricketBattingName.textContent =
                    old.batting;


                cricketBowlingName.textContent =
                    old.bowling;


                updateCricket();
            };
}


/* =========================================================
   CRICKET BACK
========================================================= */

if (
    $("cricket-back")
) {

    $("cricket-back")
        .onclick =
            () => {

                cricketScreen.classList.add(
                    "hidden"
                );


                modeScreen.classList.remove(
                    "hidden"
                );
            };
}


/* =========================================================
   PWA SERVICE WORKER
========================================================= */

if (
    "serviceWorker"
    in navigator
) {

    window.addEventListener(
        "load",
        async () => {

            try {

                const registration =
                    await navigator
                        .serviceWorker
                        .register(
                            "./sw.js"
                        );


                console.log(
                    "Dart Hub service worker registered:",
                    registration.scope
                );


            } catch (
                error
            ) {

                console.error(
                    "Dart Hub service worker failed:",
                    error
                );
            }
        }
    );
}


/* =========================================================
   PWA INSTALL
========================================================= */

let deferredInstallPrompt =
    null;


const installAppBtn =
    $("install-app-btn");

const installStatus =
    $("install-status");


function isRunningAsApp() {

    return (

        window.matchMedia(
            "(display-mode: standalone)"
        ).matches

        ||

        window.navigator.standalone ===
        true
    );
}


function isIOS() {

    return /iphone|ipad|ipod/i
        .test(
            navigator.userAgent
        );
}


function updateInstallDisplay() {

    if (
        !installAppBtn
    ) {

        return;
    }


    if (
        isRunningAsApp()
    ) {

        installAppBtn.textContent =
            "✅ Dart Hub Installed";


        installAppBtn.disabled =
            true;


        if (
            installStatus
        ) {

            installStatus.textContent =
                "You are using the installed Dart Hub app.";
        }


        return;
    }


    installAppBtn.disabled =
        false;


    if (
        isIOS()
    ) {

        installAppBtn.textContent =
            "📱 Add Dart Hub to Home Screen";


        if (
            installStatus
        ) {

            installStatus.textContent =
                "On iPhone/iPad, install from Safari.";
        }


        return;
    }


    installAppBtn.textContent =
        "📱 Install Dart Hub";


    if (
        installStatus
    ) {

        installStatus.textContent =
            deferredInstallPrompt

                ? "Dart Hub is ready to install."

                : "Install Dart Hub on your phone or computer.";
    }
}


window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();


        deferredInstallPrompt =
            event;


        updateInstallDisplay();
    }
);


if (
    installAppBtn
) {

    installAppBtn.addEventListener(
        "click",
        async () => {

            if (
                isRunningAsApp()
            ) {

                return;
            }


            /*
               IPHONE / IPAD
            */

            if (
                isIOS()
            ) {

                alert(

                    "Install Dart Hub on iPhone / iPad:\n\n" +

                    "1. Open Dart Hub in Safari.\n\n" +

                    "2. Tap the Share button.\n\n" +

                    "3. Tap Add to Home Screen.\n\n" +

                    "4. Make sure the name is Dart Hub.\n\n" +

                    "5. Tap Add."
                );


                return;
            }


            /*
               CHROME / EDGE / ANDROID
            */

            if (
                deferredInstallPrompt
            ) {

                deferredInstallPrompt.prompt();


                const choice =
                    await deferredInstallPrompt
                        .userChoice;


                if (
                    installStatus
                ) {

                    installStatus.textContent =

                        choice.outcome ===
                        "accepted"

                            ? "Installing Dart Hub…"

                            : "Installation cancelled.";
                }


                deferredInstallPrompt =
                    null;


                return;
            }


            /*
               FALLBACK
            */

            alert(

                "If the install button is not available yet:\n\n" +

                "ANDROID / COMPUTER:\n" +

                "Open Dart Hub in Chrome or Edge, open the browser menu and choose Install app or Add to Home screen.\n\n" +

                "IPHONE:\n" +

                "Open Dart Hub in Safari → Share → Add to Home Screen."
            );
        }
    );
}


window.addEventListener(
    "appinstalled",
    () => {

        deferredInstallPrompt =
            null;


        if (
            installAppBtn
        ) {

            installAppBtn.textContent =
                "✅ Dart Hub Installed";


            installAppBtn.disabled =
                true;
        }


        if (
            installStatus
        ) {

            installStatus.textContent =
                "Dart Hub installed successfully.";
        }
    }
);


/* =========================================================
   INITIALISE
========================================================= */

loadSettings();

checkSavedMatch();

updateNameDisplays();

updateStartingPlayerButtons();

updateEverything();

updateCricket();

updateInstallDisplay();