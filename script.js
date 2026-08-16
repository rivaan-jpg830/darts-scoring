"use strict";


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_MATCH =
    "darts-current-match-v14";

const STORAGE_PROFILES =
    "darts-player-profiles-v14";

const STORAGE_SETTINGS =
    "darts-settings-v14";

const MAX_HISTORY =
    150;


/* =========================================================
   DOM
========================================================= */

const $ =
    id =>
        document.getElementById(id);


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
   CALLER DOM
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
   MODE
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


                    } else {

                        nameScreenTitle.textContent =
                            "Enter Player Names";

                        p1Label.textContent =
                            "Player 1:";

                        p2Label.textContent =
                            "Player 2:";
                    }


                    nameScreen.classList.remove(
                        "hidden"
                    );
                }
            );
        }
    );


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
   START PLAYER
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
        button =>

            button.classList.remove(
                "active-start"
            )
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
        () => {

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
                p =>
                    p.score =
                        startingScore
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
                        .5
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


            matchFinished =
                false;


            winnerPlayer =
                null;


            visitCounter =
                1;


            normalHistory.length =
                0;


            visitRestoreSnapshots.clear();


            setupScreen.classList.add(
                "hidden"
            );


            gameScreen.classList.remove(
                "hidden"
            );


            document.body.dataset.gameTab =
                "score";


            selectScoringMethod(
                "tap"
            );


            updateEverything();

            saveMatch();


            setTimeout(
                announceTurnStatus,
                300
            );
        }
    );


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
                () =>
                    selectScoringMethod(
                        button.dataset.method
                    )
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
    }


    if (
        method ===
        "individual"
    ) {

        individualScoringSection.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   DARTS
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
            ) +
            number,

        isDouble:
            type ===
            "double"
    };
}


/* =========================================================
   TAP BUTTONS
========================================================= */

function buildTapBoard() {

    const singles =
        $("singles");

    const doubles =
        $("doubles");

    const trebles =
        $("trebles");


    for (
        let n = 1;
        n <= 20;
        n++
    ) {

        addDartButton(

            singles,

            String(n),

            makeDart(
                "single",
                n
            )
        );


        addDartButton(

            doubles,

            "D" + n,

            makeDart(
                "double",
                n
            )
        );


        addDartButton(

            trebles,

            "T" + n,

            makeDart(
                "treble",
                n
            )
        );
    }


    $("tap-outer-bull").onclick =
        () =>
            applyDart(
                makeDart(
                    "outerbull",
                    25
                )
            );


    $("tap-bull").onclick =
        () =>
            applyDart(
                makeDart(
                    "bull",
                    25
                )
            );


    $("tap-miss").onclick =
        () =>
            applyDart(
                makeDart(
                    "miss",
                    0
                )
            );
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
                dart
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
            currentPlayer - 1
        ];


    const before =
        player.score;


    const after =
        before -
        dart.score;


    currentVisitDarts.push(
        clone(
            dart
        )
    );


    dartsLeft--;


    if (
        dart.isDouble &&
        dart.score ===
        before
    ) {

        player.stats.checkoutAttempts++;
    }


    if (
        after <
            0 ||
        after ===
            1 ||
        (
            after ===
                0 &&
            !dart.isDouble
        )
    ) {

        showCallerEvent(
            "NO SCORE",
            1200
        );


        announceVisitScore(
            0
        );


        completeVisit(
            0,
            false,
            true
        );


        return;
    }


    player.score =
        after;


    if (
        after ===
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
   INDIVIDUAL ENTRY
========================================================= */

$("submit-individual-dart")
    .onclick =
        submitIndividualDart;


individualDartInput
    .addEventListener(
        "keydown",
        e => {

            if (
                e.key ===
                "Enter"
            ) {

                submitIndividualDart();
            }
        }
    );


function submitIndividualDart() {

    const dart =
        dartFromInputs(

            individualDartType,

            individualDartInput
        );


    if (
        dart
    ) {

        applyDart(
            dart
        );


        individualDartInput.value =
            "";
    }
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

$("tap-missed-double")
    .onclick =
        missedDouble;


$("missed-double-individual")
    .onclick =
        missedDouble;


$("tap-end-turn")
    .onclick =
        () => {

            if (
                currentVisitDarts.length
            ) {

                completeVisit(
                    visitTotal(),
                    false,
                    false
                );
            }
        };


function missedDouble() {

    if (
        matchFinished
    ) {

        return;
    }


    beginVisit();

    pushUndo();


    players[
        currentPlayer - 1
    ].stats.checkoutAttempts++;


    currentVisitDarts.push({

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
   WHOLE VISIT
========================================================= */

$("submit-score")
    .onclick =
        () =>
            submitWholeVisit(
                scoreInput
            );


scoreInput
    .addEventListener(
        "keydown",
        e => {

            if (
                e.key ===
                "Enter"
            ) {

                submitWholeVisit(
                    scoreInput
                );
            }
        }
    );


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
            currentPlayer - 1
        ];


    const before =
        player.score;


    const after =
        before -
        score;


    if (
        after <
            0 ||
        after ===
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


    if (
        after ===
        0
    ) {

        const valid =
            confirm(
                "Did the final dart hit a DOUBLE or BULL?\n\nOK = Yes\nCancel = No"
            );


        if (
            !valid
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
        after;


    currentVisitDarts = [

        {

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
            throwingPlayer - 1
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

        playerName:
            player.name,

        score,

        checkout,

        bust,

        remaining:
            player.score,

        darts:
            currentVisitDarts.map(
                d =>
                    d.label
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

                    2800
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
            700
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
        p => {

            p.stats.lastLegAverage =
                p.stats.legDarts
                    ? (
                        p.stats.legPoints /
                        p.stats.legDarts
                      ) *
                      3
                    : 0;
        }
    );


    const winner =
        players[
            playerNumber - 1
        ];


    winner.legs++;


    let wonSet =
        false;


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


    currentLeg++;


    players.forEach(
        p => {

            p.score =
                startingScore;


            p.stats.legPoints =
                0;


            p.stats.legDarts =
                0;
        }
    );


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
    mode = "normal"
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


    const u =
        new SpeechSynthesisUtterance(
            text
        );


    const voice =
        getVoice();


    if (
        voice
    ) {

        u.voice =
            voice;
    }


    u.volume =
        1;


    if (
        mode ===
        "180"
    ) {

        u.rate =
            .76;

        u.pitch =
            1.38;


    } else if (
        mode ===
        "game"
    ) {

        u.rate =
            .8;

        u.pitch =
            1.18;


    } else {

        u.rate =
            .9;

        u.pitch =
            1.03;
    }


    speechSynthesis.speak(
        u
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


    } else if (
        score ===
        0
    ) {

        speak(
            "NO SCORE!",
            "game"
        );


    } else {

        speak(
            numberWords(
                score
            )
        );
    }
}


function announceTurnStatus() {

    if (
        matchFinished
    ) {

        return;
    }


    const player =
        players[
            currentPlayer - 1
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

            `${player.name}, you require ${numberWords(player.score)}`

        );


    } else {

        speak(
            `${player.name}, to throw`
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


function numberWords(
    n
) {

    const small = [

        "zero","one","two","three","four",
        "five","six","seven","eight","nine",
        "ten","eleven","twelve","thirteen",
        "fourteen","fifteen","sixteen",
        "seventeen","eighteen","nineteen"

    ];


    const tens = [

        "","","twenty","thirty","forty",
        "fifty","sixty","seventy",
        "eighty","ninety"

    ];


    if (
        n <
        20
    ) {

        return small[n];
    }


    if (
        n <
        100
    ) {

        return (

            tens[
                Math.floor(
                    n /
                    10
                )
            ]

            +

            (
                n %
                10
                    ? " " +
                      small[
                        n %
                        10
                      ]
                    : ""
            )
        );
    }


    if (
        n <
        1000
    ) {

        const hundreds =
            Math.floor(
                n /
                100
            );


        const remainder =
            n %
            100;


        return (

            small[hundreds] +

            " hundred" +

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


    return String(n);
}


toggleAnnouncerBtn.onclick =
    () => {

        announcerEnabled =
            !announcerEnabled;


        toggleAnnouncerBtn.textContent =
            announcerEnabled

                ? "🔊 Announcer: On"

                : "🔇 Announcer: Off";


        saveSettings();
    };


/* =========================================================
   CHECKOUT ENGINE
========================================================= */

const checkoutDarts =
    [];

const finishingDarts =
    [];


for (
    let n = 1;
    n <= 20;
    n++
) {

    checkoutDarts.push(
        {
            score:n,
            label:String(n)
        },
        {
            score:n * 2,
            label:"D" + n
        },
        {
            score:n * 3,
            label:"T" + n
        }
    );


    finishingDarts.push(
        {
            score:n * 2,
            label:"D" + n
        }
    );
}


checkoutDarts.push(
    {
        score:25,
        label:"25"
    },
    {
        score:50,
        label:"Bull"
    }
);


finishingDarts.push(
    {
        score:50,
        label:"Bull"
    }
);


function findBestCheckout(
    score,
    dartsAvailable
) {

    const routes =
        [];


    for (
        const finish
        of finishingDarts
    ) {

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


    if (
        dartsAvailable >=
        2
    ) {

        for (
            const a
            of checkoutDarts
        ) {

            for (
                const finish
                of finishingDarts
            ) {

                if (
                    a.score +
                    finish.score ===
                    score
                ) {

                    routes.push(
                        [
                            a.label,
                            finish.label
                        ]
                    );
                }
            }
        }
    }


    if (
        dartsAvailable >=
        3
    ) {

        for (
            const a
            of checkoutDarts
        ) {

            for (
                const b
                of checkoutDarts
            ) {

                for (
                    const finish
                    of finishingDarts
                ) {

                    if (
                        a.score +
                        b.score +
                        finish.score ===
                        score
                    ) {

                        routes.push(
                            [
                                a.label,
                                b.label,
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
        (
            a,
            b
        ) => {

            if (
                a.length !==
                b.length
            ) {

                return (
                    a.length -
                    b.length
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
    );


    return routes[0];
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

                return total +
                    15;
            }


            if (
                label.startsWith(
                    "D"
                )
            ) {

                return total +
                    7;
            }


            return total +
                4;
        },
        0
    );
}


function getSetupSuggestion(
    score,
    dartsAvailable
) {

    const options = [

        {score:60,label:"T20"},
        {score:57,label:"T19"},
        {score:54,label:"T18"},
        {score:51,label:"T17"},
        {score:48,label:"T16"},
        {score:45,label:"T15"},
        {score:20,label:"20"},
        {score:19,label:"19"},
        {score:18,label:"18"},
        {score:17,label:"17"},
        {score:16,label:"16"}

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


        const checkout =
            leave <=
            170

                ? findBestCheckout(
                    leave,
                    3
                )

                : null;


        const rank =

            (
                checkout
                    ? 0
                    : 5000
            )

            +

            leave

            -

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
        score <=
        170

            ? findBestCheckout(
                score,
                dartsAvailable
            )

            : null;


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
                ) +

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
   DISPLAY
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


    modeLabel.textContent =
        gameMode ===
        "sets"

            ? `${legsPerSet} legs per set · First to ${setsToWin} sets`

            : `First to ${setsToWin} legs`;


    legSetStatus.textContent =
        gameMode ===
        "sets"

            ? `Set ${currentSet} · Leg ${currentLeg}`

            : `Leg ${currentLeg}`;


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


    const suggestion =
        getSuggestion(

            players[
                currentPlayer - 1
            ].score,

            dartsLeft
        );


    checkoutText.textContent =
        matchFinished

            ? "Match complete"

            : suggestion.text;


    updateIndividualStatus();

    updateStats();

    updateHistory();

    updateUndoButtons();

    updateCaller();
}


function updateIndividualStatus() {

    individualDartStatus.textContent =
        matchFinished

            ? "Match finished"

            : `${players[currentPlayer - 1].name} · ${dartsLeft} darts remaining`;
}


/* =========================================================
   CALLER DISPLAY
========================================================= */

function updateCaller() {

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
        `Last: ${
            players[0].lastVisit ??
            "–"
        }`;


    callerP2Last.textContent =
        `Last: ${
            players[1].lastVisit ??
            "–"
        }`;


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
                winnerPlayer - 1
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
                currentPlayer - 1
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
                    d =>
                        d.label
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
   CALLER MODE CONTROLS
========================================================= */

callerModeBtn.onclick =
    openCaller;


callerCloseBtn.onclick =
    closeCaller;


callerDisplayBtn.onclick =
    () =>
        setCallerView(
            "display"
        );


callerScorerBtn.onclick =
    () =>
        setCallerView(
            "scorer"
        );


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


    callerScreen.classList.add(
        "hidden"
    );


    if (
        document.fullscreenElement
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
   CALLER SCORER
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
                            other =>
                                other.classList.remove(
                                    "active"
                                )
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


$("caller-submit-visit")
    .onclick =
        () =>
            submitWholeVisit(
                callerVisitInput
            );


callerVisitInput
    .addEventListener(
        "keydown",
        e => {

            if (
                e.key ===
                "Enter"
            ) {

                submitWholeVisit(
                    callerVisitInput
                );
            }
        }
    );


$("caller-submit-dart")
    .onclick =
        submitCallerDart;


callerDartNumber
    .addEventListener(
        "keydown",
        e => {

            if (
                e.key ===
                "Enter"
            ) {

                submitCallerDart();
            }
        }
    );


function submitCallerDart() {

    const dart =
        dartFromInputs(

            callerDartType,

            callerDartNumber
        );


    if (
        dart
    ) {

        applyDart(
            dart
        );


        callerDartNumber.value =
            "";
    }
}


$("caller-missed-double")
    .onclick =
        missedDouble;


$("caller-undo")
    .onclick =
        undoNormal;


/* =========================================================
   CALLER EVENT
========================================================= */

let callerEventTimer =
    null;


function showCallerEvent(
    text,
    duration = 2200
) {

    if (
        !callerOpen
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

function average(
    stats
) {

    return stats.dartsThrown

        ? (
            stats.pointsScored /
            stats.dartsThrown *
            3
          ).toFixed(2)

        : "0.00";
}


function statRow(
    label,
    value
) {

    return `

        <div class="stat-row">

            <span>${label}</span>

            <strong>${value}</strong>

        </div>
    `;
}


function statsHTML(
    player
) {

    const s =
        player.stats;


    const legAvg =
        s.legDarts

            ? (
                s.legPoints /
                s.legDarts *
                3
              ).toFixed(2)

            : "0.00";


    const first9 =
        s.first9Darts

            ? (
                s.first9Points /
                s.first9Darts *
                3
              ).toFixed(2)

            : "0.00";


    const checkout =
        s.checkoutAttempts

            ? (
                s.checkouts /
                s.checkoutAttempts *
                100
              ).toFixed(1) +
              "%"

            : "0.0%";


    return `

        <h3>
            ${escapeHTML(player.name)}
        </h3>

        ${statRow(
            "Match Average",
            average(s)
        )}

        ${statRow(
            "Current Leg Avg",
            legAvg
        )}

        ${statRow(
            "First 9",
            first9
        )}

        ${statRow(
            "Highest Visit",
            s.highestVisit
        )}

        ${statRow(
            "100+",
            s.scores100
        )}

        ${statRow(
            "140+",
            s.scores140
        )}

        ${statRow(
            "180s",
            s.scores180
        )}

        ${statRow(
            "Darts",
            s.dartsThrown
        )}

        ${statRow(
            "Checkout %",
            checkout
        )}

        ${statRow(
            "Best Checkout",
            s.bestCheckout ||
            "–"
        )}
    `;
}


function updateStats() {

    statsP1.innerHTML =
        statsHTML(
            players[0]
        );


    statsP2.innerHTML =
        statsHTML(
            players[1]
        );
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

    const visits =
        getAllVisits();


    if (
        !visits.length
    ) {

        visitHistoryList.innerHTML =
            '<div class="visit-meta">No completed visits yet.</div>';


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
                                visit.darts.join(" • ")
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

    const snap =
        visitRestoreSnapshots.get(
            id
        );


    if (
        !snap
    ) {

        alert(
            "This visit cannot be restored after a page refresh."
        );


        return;
    }


    if (
        confirm(
            "Restore to immediately before this visit?"
        )
    ) {

        restoreSnapshot(
            snap
        );
    }
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
        !normalHistory.length
    ) {

        return;
    }


    restoreSnapshot(
        normalHistory.pop()
    );
}


normalUndoBtn.onclick =
    undoNormal;


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
        snapshot.visitCounter;

    players =
        snapshot.players;


    currentVisitStartSnapshot =
        null;


    updateEverything();

    saveMatch();
}


function updateUndoButtons() {

    normalUndoBtn.disabled =
        normalHistory.length ===
        0;


    $("caller-undo").disabled =
        normalHistory.length ===
        0;
}


/* =========================================================
   SAVE / RESUME
========================================================= */

function saveMatch() {

    if (
        matchFinished
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

    } catch (_) {}
}


function checkSavedMatch() {

    if (
        localStorage.getItem(
            STORAGE_MATCH
        )
    ) {

        $("resume-banner")
            .classList.remove(
                "hidden"
            );
    }
}


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


                modeScreen.classList.add(
                    "hidden"
                );


                gameScreen.classList.remove(
                    "hidden"
                );


                restoreSnapshot(
                    saved
                );


            } catch (_) {

                alert(
                    "Could not restore saved match."
                );
            }
        };


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


/* =========================================================
   PROFILES
========================================================= */

function getProfiles() {

    try {

        return JSON.parse(

            localStorage.getItem(
                STORAGE_PROFILES
            ) ||
            "{}"
        );

    } catch (_) {

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
                    .toLowerCase()
                    .trim();


            const profile =
                profiles[key] ||
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
                        0
                };


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


            profile.bestCheckout =
                Math.max(
                    profile.bestCheckout,
                    player.stats.bestCheckout
                );


            profiles[key] =
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


profileBtn.onclick =
    () => {

        const profiles =
            Object.values(
                getProfiles()
            );


        if (
            !profiles.length
        ) {

            alert(
                "No saved profiles yet."
            );


            return;
        }


        alert(

            profiles.map(
                p => {

                    const avg =
                        p.darts

                            ? (
                                p.points /
                                p.darts *
                                3
                              ).toFixed(2)

                            : "0.00";


                    return (

                        `${p.name}\n` +

                        `Matches: ${p.matches}\n` +

                        `Wins: ${p.wins}\n` +

                        `Average: ${avg}\n` +

                        `180s: ${p.scores180}\n` +

                        `Best Checkout: ${p.bestCheckout || "-"}`
                    );
                }
            ).join(
                "\n\n"
            )
        );
    };


/* =========================================================
   SETTINGS
========================================================= */

function saveSettings() {

    localStorage.setItem(

        STORAGE_SETTINGS,

        JSON.stringify({

            announcerEnabled

        })
    );
}


function loadSettings() {

    try {

        const saved =
            JSON.parse(

                localStorage.getItem(
                    STORAGE_SETTINGS
                ) ||
                "{}"
            );


        announcerEnabled =
            saved.announcerEnabled !==
            false;


    } catch (_) {}


    toggleAnnouncerBtn.textContent =
        announcerEnabled

            ? "🔊 Announcer: On"

            : "🔇 Announcer: Off";
}


/* =========================================================
   NEW MATCH / BACK
========================================================= */

newMatchBtn.onclick =
    () => {

        if (
            confirm(
                "Start a new match?"
            )
        ) {

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
        }
    };


$("game-back")
    .onclick =
        () => {

            closeCaller();


            gameScreen.classList.add(
                "hidden"
            );


            modeScreen.classList.remove(
                "hidden"
            );
        };


/* =========================================================
   CRICKET
========================================================= */

const cricketTeamA =
    $("cricket-team-a");

const cricketTeamB =
    $("cricket-team-b");

const cricketBattingName =
    $("cricket-batting-name");

const cricketBowlingName =
    $("cricket-bowling-name");


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


function setupCricketNames(
    a,
    b
) {

    cricketTeamA.textContent =
        a;

    cricketTeamB.textContent =
        b;


    cricketBowlingName.textContent =
        a;

    cricketBattingName.textContent =
        b;


    nameScreen.classList.add(
        "hidden"
    );


    cricketScreen.classList.remove(
        "hidden"
    );


    buildCricketBoard();

    resetCricket();
}


function buildCricketBoard() {

    if (
        $("cricket-bowl-singles")
            .children.length
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
                mult,
                role
            ]
        ) => {

            const container =
                $(id);


            for (
                let n = 1;
                n <= 20;
                n++
            ) {

                const button =
                    document.createElement(
                        "button"
                    );


                button.className =
                    "btn-score";


                button.textContent =
                    (
                        mult ===
                        1
                            ? ""
                            : mult ===
                              2
                                ? "D"
                                : "T"
                    ) +
                    n;


                button.onclick =
                    () =>
                        cricketDart(

                            role,

                            n,

                            mult,

                            n *
                            mult
                        );


                container.appendChild(
                    button
                );
            }
        }
    );
}


function resetCricket() {

    cricketTotalWickets =
        Math.min(
            20,
            Math.max(
                1,
                parseInt(
                    $("cricket-total-wickets")
                        .value
                ) ||
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
}


function cricketDart(
    role,
    base,
    mult,
    score
) {

    if (
        cricketFinished
    ) {

        return;
    }


    if (
        role !==
        cricketPhase
            .replace(
                "ting",
                ""
            )
    ) {

        if (
            !(
                cricketPhase ===
                    "batting" &&
                role ===
                    "bat"
            ) &&
            !(
                cricketPhase ===
                    "bowling" &&
                role ===
                    "bowl"
            )
        ) {

            return;
        }
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

            cricketWickets +=
                Math.min(
                    mult,
                    cricketTotalWickets -
                    cricketWickets
                );


            cricketNextWicket +=
                mult;
        }


    } else {

        if (
            base ===
            cricketNextWicket
        ) {

            cricketWickets +=
                Math.min(
                    mult,
                    cricketTotalWickets -
                    cricketWickets
                );


            cricketNextWicket +=
                mult;


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


function updateCricket() {

    $("cricket-runs").textContent =
        cricketRuns;


    $("cricket-wickets").textContent =
        cricketWickets;


    $("cricket-innings").textContent =
        cricketInnings;


    $("cricket-danger").textContent =
        cricketWickets >=
        cricketTotalWickets

            ? "–"

            : cricketNextWicket;


    $("cricket-target").textContent =
        cricketTarget ??
        "–";


    $("cricket-phase").textContent =
        cricketFinished

            ? "Match Finished"

            : cricketPhase ===
              "bowling"

                ? "Bowling Turn"

                : "Batting Turn";


    $("cricket-darts-left").textContent =
        cricketFinished

            ? "–"

            : cricketDarts;


    $("undo-cricket").disabled =
        !cricketHistory.length;
}


$("cricket-start-match")
    .onclick =
        resetCricket;


$("cricket-declare")
    .onclick =
        () => {

            if (
                cricketInnings ===
                1
            ) {

                pushCricket();

                startSecondCricketInnings();

                updateCricket();
            }
        };


$("cricket-miss-board")
    .onclick =
        () => {

            if (
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


            updateCricket();
        };


$("cricket-fall-out")
    .onclick =
        () => {

            if (
                cricketPhase !==
                "batting"
            ) {

                return;
            }


            pushCricket();


            cricketRuns++;


            updateCricket();
        };


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


/* =========================================================
   INITIALISE
========================================================= */

loadSettings();

checkSavedMatch();

updateNameDisplays();

updateStartingPlayerButtons();

updateEverything();

updateCricket();

/* =========================================================
   DART HUB PWA - V15
========================================================= */


/* =========================================================
   SERVICE WORKER
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
                    "Service worker registration failed:",
                    error
                );
            }
        }
    );
}


/* =========================================================
   INSTALL APP
========================================================= */

let deferredInstallPrompt =
    null;


const installAppBtn =
    document.getElementById(
        "install-app-btn"
    );


const installStatus =
    document.getElementById(
        "install-status"
    );


/* =========================================================
   DETECT INSTALLED APP
========================================================= */

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


/* =========================================================
   UPDATE INSTALL DISPLAY
========================================================= */

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


        installStatus.textContent =
            "You are currently using the installed Dart Hub app.";


        return;
    }


    const userAgent =
        navigator.userAgent
            .toLowerCase();


    const isiPhone =
        /iphone|ipad|ipod/
            .test(
                userAgent
            );


    if (
        isiPhone
    ) {

        installAppBtn.textContent =
            "📱 Add Dart Hub to Home Screen";


        installStatus.textContent =
            "On iPhone/iPad: tap this button for installation instructions.";


        return;
    }


    if (
        deferredInstallPrompt
    ) {

        installAppBtn.textContent =
            "📱 Install Dart Hub";


        installStatus.textContent =
            "Install Dart Hub so it opens like a normal app.";


        return;
    }


    installAppBtn.textContent =
        "📱 Install Dart Hub";


    installStatus.textContent =
        "If the install option is not available yet, refresh the page once after the new files are uploaded.";
}


/* =========================================================
   BROWSER INSTALL PROMPT
========================================================= */

window.addEventListener(
    "beforeinstallprompt",
    event => {

        /*
           Stop Chrome immediately showing its own prompt.
           We'll use our Dart Hub button instead.
        */

        event.preventDefault();


        deferredInstallPrompt =
            event;


        updateInstallDisplay();
    }
);


/* =========================================================
   INSTALL BUTTON
========================================================= */

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


            const userAgent =
                navigator.userAgent
                    .toLowerCase();


            const isiPhone =
                /iphone|ipad|ipod/
                    .test(
                        userAgent
                    );


            /*
               iPHONE / iPAD
            */

            if (
                isiPhone
            ) {

                alert(

                    "Install Dart Hub on iPhone / iPad:\n\n" +

                    "1. Open Dart Hub in Safari.\n\n" +

                    "2. Tap the Share button at the bottom of Safari.\n\n" +

                    "3. Scroll down and choose 'Add to Home Screen'.\n\n" +

                    "4. Make sure the name says Dart Hub.\n\n" +

                    "5. Tap Add.\n\n" +

                    "Dart Hub will then appear on your Home Screen like an app."
                );


                return;
            }


            /*
               CHROME / EDGE / ANDROID
            */

            if (
                deferredInstallPrompt
            ) {

                deferredInstallPrompt
                    .prompt();


                const choice =
                    await deferredInstallPrompt
                        .userChoice;


                if (
                    choice.outcome ===
                    "accepted"
                ) {

                    installStatus.textContent =
                        "Installing Dart Hub…";


                } else {

                    installStatus.textContent =
                        "Installation cancelled.";
                }


                deferredInstallPrompt =
                    null;


                return;
            }


            /*
               FALLBACK
            */

            alert(

                "Dart Hub installation is not available from this browser yet.\n\n" +

                "ANDROID / COMPUTER:\n" +

                "Open Dart Hub in Chrome or Edge, open the browser menu, then choose 'Install app' or 'Add to Home screen'.\n\n" +

                "IPHONE:\n" +

                "Open the website in Safari → Share → Add to Home Screen."
            );
        }
    );
}


/* =========================================================
   INSTALLED EVENT
========================================================= */

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
                "Dart Hub has been installed successfully.";
        }
    }
);


/* =========================================================
   STARTUP
========================================================= */

updateInstallDisplay();