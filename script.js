"use strict";


/* =========================================================
   DOM
========================================================= */

const modeScreen =
    document.getElementById(
        "mode-screen"
    );


const nameScreen =
    document.getElementById(
        "name-screen"
    );


const setupScreen =
    document.getElementById(
        "setup-screen"
    );


const gameScreen =
    document.getElementById(
        "game-screen"
    );


const cricketScreen =
    document.getElementById(
        "cricket-screen"
    );


const modeButtons =
    document.querySelectorAll(
        ".mode-btn"
    );


const continueToSetupBtn =
    document.getElementById(
        "continue-to-setup"
    );


const p1NameInput =
    document.getElementById(
        "p1-name-input"
    );


const p2NameInput =
    document.getElementById(
        "p2-name-input"
    );


const p1NameDisplay =
    document.getElementById(
        "p1-name"
    );


const p2NameDisplay =
    document.getElementById(
        "p2-name"
    );


const nameScreenTitle =
    document.getElementById(
        "name-screen-title"
    );


const p1Label =
    document.getElementById(
        "p1-label"
    );


const p2Label =
    document.getElementById(
        "p2-label"
    );


const startMatchBtn =
    document.getElementById(
        "start-match"
    );


const startingScoreInput =
    document.getElementById(
        "starting-score"
    );


const legsPerSetInput =
    document.getElementById(
        "legs-per-set"
    );


const setsToWinInput =
    document.getElementById(
        "sets-to-win"
    );


const p1ScoreDisplay =
    document.getElementById(
        "p1-score"
    );


const p2ScoreDisplay =
    document.getElementById(
        "p2-score"
    );


const p1LegsDisplay =
    document.getElementById(
        "p1-legs"
    );


const p2LegsDisplay =
    document.getElementById(
        "p2-legs"
    );


const p1SetsDisplay =
    document.getElementById(
        "p1-sets"
    );


const p2SetsDisplay =
    document.getElementById(
        "p2-sets"
    );


const p1Box =
    document.getElementById(
        "p1-box"
    );


const p2Box =
    document.getElementById(
        "p2-box"
    );


const modeLabel =
    document.getElementById(
        "mode-label"
    );


const legSetStatus =
    document.getElementById(
        "leg-set-status"
    );


const checkoutText =
    document.getElementById(
        "checkout-text"
    );


const dartsStatus =
    document.getElementById(
        "darts-status"
    );


const scoreInput =
    document.getElementById(
        "score-input"
    );


const submitScoreBtn =
    document.getElementById(
        "submit-score"
    );


const gameBackBtn =
    document.getElementById(
        "game-back"
    );



/* =========================================================
   SCORING METHOD
========================================================= */

const methodButtons =
    document.querySelectorAll(
        ".method-button"
    );


const tapScoringSection =
    document.getElementById(
        "tap-scoring-section"
    );


const manualScoringSection =
    document.getElementById(
        "manual-scoring-section"
    );



/* =========================================================
   CRICKET DOM
========================================================= */

const cricketTeamA =
    document.getElementById(
        "cricket-team-a"
    );


const cricketTeamB =
    document.getElementById(
        "cricket-team-b"
    );


const cricketBattingName =
    document.getElementById(
        "cricket-batting-name"
    );


const cricketBowlingName =
    document.getElementById(
        "cricket-bowling-name"
    );


const cricketInningsDisplay =
    document.getElementById(
        "cricket-innings"
    );


const cricketTotalWicketsInput =
    document.getElementById(
        "cricket-total-wickets"
    );


const cricketRunsDisplay =
    document.getElementById(
        "cricket-runs"
    );


const cricketWicketsDisplay =
    document.getElementById(
        "cricket-wickets"
    );


const cricketDangerDisplay =
    document.getElementById(
        "cricket-danger"
    );


const cricketTargetDisplay =
    document.getElementById(
        "cricket-target"
    );


const cricketPhaseDisplay =
    document.getElementById(
        "cricket-phase"
    );


const cricketDartsLeftDisplay =
    document.getElementById(
        "cricket-darts-left"
    );


const cricketStartMatchBtn =
    document.getElementById(
        "cricket-start-match"
    );


const cricketDeclareBtn =
    document.getElementById(
        "cricket-declare"
    );


const cricketMissBoardBtn =
    document.getElementById(
        "cricket-miss-board"
    );


const cricketFallOutBtn =
    document.getElementById(
        "cricket-fall-out"
    );


const cricketBackBtn =
    document.getElementById(
        "cricket-back"
    );



/* =========================================================
   GAME MODE
========================================================= */

let selectedMode =
    "501";


modeButtons.forEach(
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
   PLAYER / TEAM NAMES
========================================================= */

continueToSetupBtn.addEventListener(
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

            cricketTeamA.textContent =
                name1;


            cricketTeamB.textContent =
                name2;


            /*
            Innings 1:
            Team A bowls.
            Team B bats.
            */

            cricketBattingName.textContent =
                name2;


            cricketBowlingName.textContent =
                name1;


            nameScreen.classList.add(
                "hidden"
            );


            cricketScreen.classList.remove(
                "hidden"
            );


            initCricketBoard();


            resetCricketMatch();


        } else {

            p1NameDisplay.textContent =
                name1;


            p2NameDisplay.textContent =
                name2;


            nameScreen.classList.add(
                "hidden"
            );


            setupScreen.classList.remove(
                "hidden"
            );
        }
    }
);



/* =========================================================
   501 / SETS VARIABLES
========================================================= */

let gameMode =
    "legs";


let legsPerSet =
    3;


let setsToWin =
    3;


let startingScore =
    501;


let p1Score =
    501;


let p2Score =
    501;


let p1Legs =
    0;


let p2Legs =
    0;


let p1Sets =
    0;


let p2Sets =
    0;


let currentSet =
    1;


let currentLeg =
    1;


let currentPlayer =
    1;


let dartsLeft =
    3;


let turnStartScoreP1 =
    501;


let turnStartScoreP2 =
    501;



/* =========================================================
   START 501 / SETS MATCH
========================================================= */

startMatchBtn.addEventListener(
    "click",
    () => {

        if (
            selectedMode ===
            "sets"
        ) {

            gameMode =
                "sets";

        } else {

            gameMode =
                "legs";
        }


        legsPerSet =
            parseInt(
                legsPerSetInput.value
            ) || 3;


        setsToWin =
            parseInt(
                setsToWinInput.value
            ) || 3;


        startingScore =
            parseInt(
                startingScoreInput.value
            ) || 501;


        resetMatch();


        setupScreen.classList.add(
            "hidden"
        );


        gameScreen.classList.remove(
            "hidden"
        );


        selectScoringMethod(
            "tap"
        );


        updateDisplay();
    }
);



/* =========================================================
   RESET MATCH
========================================================= */

function resetMatch() {

    p1Score =
        startingScore;


    p2Score =
        startingScore;


    p1Legs =
        0;


    p2Legs =
        0;


    p1Sets =
        0;


    p2Sets =
        0;


    currentSet =
        1;


    currentLeg =
        1;


    currentPlayer =
        1;


    dartsLeft =
        3;


    turnStartScoreP1 =
        startingScore;


    turnStartScoreP2 =
        startingScore;


    if (
        gameMode ===
        "legs"
    ) {

        modeLabel.textContent =
            `Legs Only · First to ${setsToWin} legs`;

    } else {

        modeLabel.textContent =
            `${legsPerSet} legs per set · First to ${setsToWin} sets`;
    }
}



/* =========================================================
   SCORING METHOD
========================================================= */

methodButtons.forEach(
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

    methodButtons.forEach(
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


    manualScoringSection.classList.add(
        "hidden"
    );


    if (
        method ===
        "manual"
    ) {

        manualScoringSection.classList.remove(
            "hidden"
        );


        setTimeout(
            () => {

                scoreInput.focus();

            },
            100
        );


    } else {

        tapScoringSection.classList.remove(
            "hidden"
        );
    }
}



/* =========================================================
   CREATE 501 DART BUTTONS
========================================================= */

function createButtons501() {

    const singles =
        document.getElementById(
            "singles"
        );


    const doubles =
        document.getElementById(
            "doubles"
        );


    const trebles =
        document.getElementById(
            "trebles"
        );


    /*
    Prevent accidental duplication
    if script is ever reloaded.
    */

    singles.innerHTML =
        "";


    doubles.innerHTML =
        "";


    trebles.innerHTML =
        "";


    for (
        let i = 1;
        i <= 20;
        i++
    ) {

        /* SINGLE */

        const single =
            document.createElement(
                "button"
            );


        single.className =
            "segment btn-score";


        single.dataset.score =
            i;


        single.textContent =
            i;


        singles.appendChild(
            single
        );


        /* DOUBLE */

        const double =
            document.createElement(
                "button"
            );


        double.className =
            "segment btn-score";


        double.dataset.score =
            i * 2;


        double.textContent =
            "D" + i;


        doubles.appendChild(
            double
        );


        /* TREBLE */

        const treble =
            document.createElement(
                "button"
            );


        treble.className =
            "segment btn-score";


        treble.dataset.score =
            i * 3;


        treble.textContent =
            "T" + i;


        trebles.appendChild(
            treble
        );
    }


    document
        .querySelectorAll(
            "#game-screen .segment"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const value =
                            parseInt(
                                button.dataset.score
                            );


                        handleDart501(
                            value
                        );
                    }
                );
            }
        );
}


createButtons501();



/* =========================================================
   HANDLE INDIVIDUAL 501 DART
========================================================= */

function handleDart501(
    value
) {

    if (
        dartsLeft <=
        0
    ) {

        return;
    }


    if (
        currentPlayer === 1 &&
        dartsLeft === 3
    ) {

        turnStartScoreP1 =
            p1Score;
    }


    if (
        currentPlayer === 2 &&
        dartsLeft === 3
    ) {

        turnStartScoreP2 =
            p2Score;
    }


    if (
        currentPlayer ===
        1
    ) {

        p1Score -=
            value;


        if (
            p1Score < 0 ||
            p1Score === 1
        ) {

            p1Score =
                turnStartScoreP1;


            endTurn501(
                "Bust!"
            );


        } else if (
            p1Score === 0
        ) {

            handleLegWin(
                1
            );


        } else {

            dartsLeft--;


            if (
                dartsLeft ===
                0
            ) {

                endTurn501();
            }
        }


    } else {

        p2Score -=
            value;


        if (
            p2Score < 0 ||
            p2Score === 1
        ) {

            p2Score =
                turnStartScoreP2;


            endTurn501(
                "Bust!"
            );


        } else if (
            p2Score === 0
        ) {

            handleLegWin(
                2
            );


        } else {

            dartsLeft--;


            if (
                dartsLeft ===
                0
            ) {

                endTurn501();
            }
        }
    }


    updateDisplay();
}



/* =========================================================
   MANUAL VISIT SCORE
========================================================= */

submitScoreBtn.addEventListener(
    "click",
    submitManualVisit
);


scoreInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            submitManualVisit();
        }
    }
);


function submitManualVisit() {

    const visitScore =
        parseInt(
            scoreInput.value
        );


    if (
        isNaN(
            visitScore
        ) ||
        visitScore < 0 ||
        visitScore > 180
    ) {

        alert(
            "Enter a valid visit score from 0 to 180."
        );

        return;
    }


    if (
        currentPlayer ===
        1
    ) {

        turnStartScoreP1 =
            p1Score;


        p1Score -=
            visitScore;


        if (
            p1Score < 0 ||
            p1Score === 1
        ) {

            p1Score =
                turnStartScoreP1;


            endTurn501(
                "Bust!"
            );


        } else if (
            p1Score === 0
        ) {

            handleLegWin(
                1
            );


        } else {

            endTurn501();
        }


    } else {

        turnStartScoreP2 =
            p2Score;


        p2Score -=
            visitScore;


        if (
            p2Score < 0 ||
            p2Score === 1
        ) {

            p2Score =
                turnStartScoreP2;


            endTurn501(
                "Bust!"
            );


        } else if (
            p2Score === 0
        ) {

            handleLegWin(
                2
            );


        } else {

            endTurn501();
        }
    }


    scoreInput.value =
        "";


    updateDisplay();
}



/* =========================================================
   END TURN
========================================================= */

function endTurn501(
    message
) {

    if (
        message
    ) {

        alert(
            message
        );
    }


    currentPlayer =
        currentPlayer === 1
            ? 2
            : 1;


    dartsLeft =
        3;
}



/* =========================================================
   LEG / SET WIN
========================================================= */

function handleLegWin(
    player
) {

    if (
        player ===
        1
    ) {

        p1Legs++;

    } else {

        p2Legs++;
    }


    let matchWon =
        false;


    /*
    SETS MODE
    */

    if (
        gameMode ===
        "sets"
    ) {

        if (
            p1Legs >=
                legsPerSet ||

            p2Legs >=
                legsPerSet
        ) {

            if (
                p1Legs >
                p2Legs
            ) {

                p1Sets++;

            } else {

                p2Sets++;
            }


            p1Legs =
                0;


            p2Legs =
                0;


            currentSet++;
        }


        if (
            p1Sets >=
            setsToWin
        ) {

            alert(
                `${p1NameDisplay.textContent} wins the match!`
            );


            matchWon =
                true;


        } else if (
            p2Sets >=
            setsToWin
        ) {

            alert(
                `${p2NameDisplay.textContent} wins the match!`
            );


            matchWon =
                true;
        }


    /*
    LEGS MODE
    */

    } else {

        if (
            p1Legs >=
            setsToWin
        ) {

            alert(
                `${p1NameDisplay.textContent} wins the match!`
            );


            matchWon =
                true;


        } else if (
            p2Legs >=
            setsToWin
        ) {

            alert(
                `${p2NameDisplay.textContent} wins the match!`
            );


            matchWon =
                true;
        }
    }


    if (
        matchWon
    ) {

        resetMatch();

        updateDisplay();

        return;
    }


    currentLeg++;


    p1Score =
        startingScore;


    p2Score =
        startingScore;


    dartsLeft =
        3;


    /*
    Winner of previous leg
    throws second in next leg.
    */

    currentPlayer =
        player === 1
            ? 2
            : 1;


    turnStartScoreP1 =
        startingScore;


    turnStartScoreP2 =
        startingScore;
}



/* =========================================================
   UPDATE 501 DISPLAY
========================================================= */

function updateDisplay() {

    p1ScoreDisplay.textContent =
        p1Score;


    p2ScoreDisplay.textContent =
        p2Score;


    p1LegsDisplay.textContent =
        `Legs: ${p1Legs}`;


    p2LegsDisplay.textContent =
        `Legs: ${p2Legs}`;


    p1SetsDisplay.textContent =
        `Sets: ${p1Sets}`;


    p2SetsDisplay.textContent =
        `Sets: ${p2Sets}`;


    if (
        gameMode ===
        "sets"
    ) {

        legSetStatus.textContent =
            `Set ${currentSet} · Leg ${currentLeg}`;

    } else {

        legSetStatus.textContent =
            `Leg ${currentLeg}`;
    }


    dartsStatus.textContent =
        `Darts: ${dartsLeft}`;


    updateTurnHighlight();


    updateCheckoutSuggestion();
}



/* =========================================================
   ACTIVE PLAYER
========================================================= */

function updateTurnHighlight() {

    if (
        currentPlayer ===
        1
    ) {

        p1Box.classList.add(
            "active"
        );


        p2Box.classList.remove(
            "active"
        );


    } else {

        p2Box.classList.add(
            "active"
        );


        p1Box.classList.remove(
            "active"
        );
    }
}



/* =========================================================
   CHECKOUT SUGGESTION
========================================================= */

function updateCheckoutSuggestion() {

    const score =
        currentPlayer === 1
            ? p1Score
            : p2Score;


    checkoutText.textContent =
        getCheckoutRoute(
            score
        );
}



function getCheckoutRoute(
    score
) {

    if (
        score > 170 ||
        score < 2
    ) {

        return (
            "No checkout available"
        );
    }


    const routes = {

        170:
            "T20, T20, Bull",

        167:
            "T20, T19, Bull",

        164:
            "T20, T18, Bull",

        161:
            "T20, T17, Bull",

        160:
            "T20, T20, D20",

        158:
            "T20, T20, D19",

        157:
            "T20, T19, D20",

        156:
            "T20, T20, D18",

        155:
            "T20, T19, D19",

        154:
            "T20, T18, D20",

        153:
            "T20, T19, D18",

        152:
            "T20, T20, D16",

        151:
            "T20, T17, D20",

        150:
            "T20, T18, D18",

        149:
            "T20, T19, D16",

        148:
            "T20, T16, D20",

        147:
            "T20, T17, D18",

        146:
            "T20, T18, D16",

        145:
            "T20, T15, D20",

        144:
            "T20, T20, D12",

        141:
            "T20, T19, D12",

        140:
            "T20, T20, D10",

        121:
            "T20, T11, D14",

        120:
            "T20, 20, D20",

        100:
            "T20, D20",

        80:
            "T20, D10",

        40:
            "D20",

        32:
            "D16",

        24:
            "D12",

        16:
            "D8"
    };


    if (
        routes[
            score
        ]
    ) {

        return routes[
            score
        ];
    }


    return (
        "Standard route"
    );
}



/* =========================================================
   BACK TO MENU - 501
========================================================= */

gameBackBtn.addEventListener(
    "click",
    () => {

        gameScreen.classList.add(
            "hidden"
        );


        modeScreen.classList.remove(
            "hidden"
        );
    }
);



/* =========================================================
   CRICKET VARIABLES
========================================================= */

let cricketInnings =
    1;


let cricketTotalWickets =
    11;


let cricketRuns =
    0;


let cricketWicketsLost =
    0;


let cricketNextWicket =
    1;


let cricketTarget =
    null;


let cricketDartsLeft =
    3;


let cricketPhase =
    "bowling";


let cricketMatchFinished =
    false;



/* =========================================================
   CREATE CRICKET BOARD
========================================================= */

function initCricketBoard() {

    const bowlSingles =
        document.getElementById(
            "cricket-bowl-singles"
        );


    const bowlDoubles =
        document.getElementById(
            "cricket-bowl-doubles"
        );


    const bowlTrebles =
        document.getElementById(
            "cricket-bowl-trebles"
        );


    const batSingles =
        document.getElementById(
            "cricket-bat-singles"
        );


    const batDoubles =
        document.getElementById(
            "cricket-bat-doubles"
        );


    const batTrebles =
        document.getElementById(
            "cricket-bat-trebles"
        );


    /*
    Already generated.
    */

    if (
        bowlSingles.children.length >
        0
    ) {

        return;
    }


    for (
        let i = 1;
        i <= 20;
        i++
    ) {

        createCricketButton(

            bowlSingles,

            i,

            1,

            "bowl",

            String(
                i
            )
        );


        createCricketButton(

            bowlDoubles,

            i,

            2,

            "bowl",

            "D" + i
        );


        createCricketButton(

            bowlTrebles,

            i,

            3,

            "bowl",

            "T" + i
        );


        createCricketButton(

            batSingles,

            i,

            1,

            "bat",

            String(
                i
            )
        );


        createCricketButton(

            batDoubles,

            i,

            2,

            "bat",

            "D" + i
        );


        createCricketButton(

            batTrebles,

            i,

            3,

            "bat",

            "T" + i
        );
    }


    document
        .querySelectorAll(
            "#cricket-screen .segment"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const role =
                            button.dataset.role;


                        /*
                        Bull buttons only
                        apply to batting.
                        */

                        if (
                            !role
                        ) {

                            return;
                        }


                        const base =
                            parseInt(
                                button.dataset.base
                            );


                        const mult =
                            parseInt(
                                button.dataset.mult
                            );


                        const score =
                            parseInt(
                                button.dataset.score
                            );


                        handleCricketDart(

                            role,

                            base,

                            mult,

                            score
                        );
                    }
                );
            }
        );
}



function createCricketButton(

    container,
    base,
    mult,
    role,
    label

) {

    const button =
        document.createElement(
            "button"
        );


    button.className =
        "segment btn-score";


    button.dataset.base =
        base;


    button.dataset.mult =
        mult;


    button.dataset.role =
        role;


    button.dataset.score =
        base * mult;


    button.textContent =
        label;


    container.appendChild(
        button
    );
}



/* =========================================================
   RESET CRICKET
========================================================= */

function resetCricketMatch() {

    cricketInnings =
        1;


    cricketTotalWickets =
        parseInt(
            cricketTotalWicketsInput.value
        ) || 11;


    if (
        cricketTotalWickets <
        1
    ) {

        cricketTotalWickets =
            1;
    }


    if (
        cricketTotalWickets >
        20
    ) {

        cricketTotalWickets =
            20;
    }


    cricketRuns =
        0;


    cricketWicketsLost =
        0;


    cricketNextWicket =
        1;


    cricketTarget =
        null;


    cricketDartsLeft =
        3;


    cricketPhase =
        "bowling";


    cricketMatchFinished =
        false;


    /*
    Innings 1:
    Team B bats.
    Team A bowls.
    */

    cricketBattingName.textContent =
        cricketTeamB.textContent;


    cricketBowlingName.textContent =
        cricketTeamA.textContent;


    updateCricketDisplay();
}



cricketStartMatchBtn.addEventListener(
    "click",
    resetCricketMatch
);



/* =========================================================
   DECLARE
========================================================= */

cricketDeclareBtn.addEventListener(
    "click",
    () => {

        if (
            cricketMatchFinished
        ) {

            return;
        }


        if (
            cricketInnings ===
            1
        ) {

            startSecondInnings(
                "declared"
            );


        } else {

            cricketMatchFinished =
                true;


            alert(
                `${cricketBattingName.textContent} declared on ${cricketRuns}.`
            );
        }


        updateCricketDisplay();
    }
);



/* =========================================================
   MISS SCORING ZONE
========================================================= */

cricketMissBoardBtn.addEventListener(
    "click",
    () => {

        if (
            cricketMatchFinished ||
            cricketPhase !==
            "batting"
        ) {

            return;
        }


        /*
        Miss scoring zone but
        dart remains in board:
        one run.
        */

        cricketRuns +=
            1;


        cricketDartsLeft--;


        if (
            cricketDartsLeft <=
            0
        ) {

            cricketPhase =
                "bowling";


            cricketDartsLeft =
                3;
        }


        checkCricketResult();


        updateCricketDisplay();
    }
);



/* =========================================================
   DART FALLS OUT
========================================================= */

cricketFallOutBtn.addEventListener(
    "click",
    () => {

        if (
            cricketMatchFinished ||
            cricketPhase !==
            "batting"
        ) {

            return;
        }


        /*
        Dart falls out:
        +1 run
        AND extra dart.

        Therefore darts-left does
        not decrease.
        */

        cricketRuns +=
            1;


        checkCricketResult();


        updateCricketDisplay();
    }
);



/* =========================================================
   HANDLE CRICKET DART
========================================================= */

function handleCricketDart(

    role,
    base,
    mult,
    score

) {

    if (
        cricketMatchFinished ||
        cricketDartsLeft <=
        0
    ) {

        return;
    }


    /*
    Ignore bowling buttons when
    it is batting phase.
    */

    if (
        cricketPhase ===
            "batting" &&
        role !==
            "bat"
    ) {

        return;
    }


    /*
    Ignore batting buttons when
    it is bowling phase.
    */

    if (
        cricketPhase ===
            "bowling" &&
        role !==
            "bowl"
    ) {

        return;
    }


    /* =====================================================
       BOWLING
    ===================================================== */

    if (
        role ===
        "bowl"
    ) {

        if (
            base ===
            cricketNextWicket
        ) {

            takeCricketWickets(
                mult
            );
        }


        cricketDartsLeft--;


        /*
        After bowling turn:
        batting turn immediately.
        */

        if (
            cricketDartsLeft <=
            0
        ) {

            cricketPhase =
                "batting";


            cricketDartsLeft =
                3;
        }


    /* =====================================================
       BATTING
    ===================================================== */

    } else {

        /*
        If batter hits the current
        wicket number, wickets are
        lost rather than runs.
        */

        if (
            base ===
            cricketNextWicket
        ) {

            takeCricketWickets(
                mult
            );


        } else {

            cricketRuns +=
                score;
        }


        cricketDartsLeft--;


        /*
        After batting:
        back to bowling.
        */

        if (
            cricketDartsLeft <=
            0
        ) {

            cricketPhase =
                "bowling";


            cricketDartsLeft =
                3;
        }
    }


    checkCricketResult();


    updateCricketDisplay();
}



/* =========================================================
   TAKE WICKETS
========================================================= */

function takeCricketWickets(
    amount
) {

    const remaining =
        cricketTotalWickets -
        cricketWicketsLost;


    const actual =
        Math.min(
            amount,
            remaining
        );


    cricketWicketsLost +=
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
   START SECOND INNINGS
========================================================= */

function startSecondInnings(
    reason
) {

    const firstInningsRuns =
        cricketRuns;


    cricketTarget =
        firstInningsRuns +
        1;


    cricketInnings =
        2;


    /*
    Swap:
    Team A now bats.
    Team B bowls.
    */

    cricketBattingName.textContent =
        cricketTeamA.textContent;


    cricketBowlingName.textContent =
        cricketTeamB.textContent;


    cricketRuns =
        0;


    cricketWicketsLost =
        0;


    cricketNextWicket =
        1;


    cricketDartsLeft =
        3;


    cricketPhase =
        "bowling";


    if (
        reason ===
        "declared"
    ) {

        alert(
            `Innings declared at ${firstInningsRuns} runs.\nTarget: ${cricketTarget}`
        );


    } else {

        alert(
            `All wickets down.\nFirst innings: ${firstInningsRuns} runs.\nTarget: ${cricketTarget}`
        );
    }
}



/* =========================================================
   CRICKET RESULT
========================================================= */

function checkCricketResult() {

    if (
        cricketMatchFinished
    ) {

        return;
    }


    /*
    All wickets lost.
    */

    if (
        cricketWicketsLost >=
        cricketTotalWickets
    ) {

        if (
            cricketInnings ===
            1
        ) {

            startSecondInnings(
                "allout"
            );


            return;
        }


        /*
        Second innings all out.
        */

        cricketMatchFinished =
            true;


        if (
            cricketRuns >=
            cricketTarget
        ) {

            alert(
                `${cricketBattingName.textContent} wins!`
            );


        } else {

            alert(
                `${cricketBowlingName.textContent} wins!\n${cricketBattingName.textContent} all out for ${cricketRuns}.\nTarget was ${cricketTarget}.`
            );
        }


        return;
    }


    /*
    Target reached.
    */

    if (
        cricketInnings ===
            2 &&
        cricketTarget !==
            null &&
        cricketRuns >=
            cricketTarget
    ) {

        cricketMatchFinished =
            true;


        alert(
            `${cricketBattingName.textContent} wins!\nTarget ${cricketTarget} reached.`
        );
    }
}



/* =========================================================
   UPDATE CRICKET DISPLAY
========================================================= */

function updateCricketDisplay() {

    cricketInningsDisplay.textContent =
        cricketInnings;


    cricketTotalWicketsInput.value =
        cricketTotalWickets;


    cricketRunsDisplay.textContent =
        cricketRuns;


    cricketWicketsDisplay.textContent =
        cricketWicketsLost;


    if (
        cricketWicketsLost >=
        cricketTotalWickets
    ) {

        cricketDangerDisplay.textContent =
            "–";

    } else {

        cricketDangerDisplay.textContent =
            cricketNextWicket;
    }


    cricketTargetDisplay.textContent =
        cricketTarget ===
        null
            ? "–"
            : cricketTarget;


    if (
        cricketMatchFinished
    ) {

        cricketPhaseDisplay.textContent =
            "Match Finished";


        cricketDartsLeftDisplay.textContent =
            "–";


    } else {

        cricketPhaseDisplay.textContent =
            cricketPhase ===
            "bowling"
                ? "Bowling Turn"
                : "Batting Turn";


        cricketDartsLeftDisplay.textContent =
            cricketDartsLeft;
    }
}



/* =========================================================
   CRICKET BACK
========================================================= */

cricketBackBtn.addEventListener(
    "click",
    () => {

        cricketScreen.classList.add(
            "hidden"
        );


        modeScreen.classList.remove(
            "hidden"
        );
    }
);



/* =========================================================
   INITIAL DISPLAY
========================================================= */

updateDisplay();