/* =========================================================
   BASIC DOM
========================================================= */

const modeScreen = document.getElementById("mode-screen");
const nameScreen = document.getElementById("name-screen");
const setupScreen = document.getElementById("setup-screen");
const gameScreen = document.getElementById("game-screen");
const cricketScreen = document.getElementById("cricket-screen");

const modeButtons = document.querySelectorAll(".mode-btn");

const continueToSetupBtn =
    document.getElementById("continue-to-setup");

const p1NameInput =
    document.getElementById("p1-name-input");

const p2NameInput =
    document.getElementById("p2-name-input");

const p1NameDisplay =
    document.getElementById("p1-name");

const p2NameDisplay =
    document.getElementById("p2-name");

const nameScreenTitle =
    document.getElementById("name-screen-title");

const p1Label =
    document.getElementById("p1-label");

const p2Label =
    document.getElementById("p2-label");

const startMatchBtn =
    document.getElementById("start-match");

const startingScoreInput =
    document.getElementById("starting-score");

const legsPerSetInput =
    document.getElementById("legs-per-set");

const setsToWinInput =
    document.getElementById("sets-to-win");

const p1ScoreDisplay =
    document.getElementById("p1-score");

const p2ScoreDisplay =
    document.getElementById("p2-score");

const p1LegsDisplay =
    document.getElementById("p1-legs");

const p2LegsDisplay =
    document.getElementById("p2-legs");

const p1SetsDisplay =
    document.getElementById("p1-sets");

const p2SetsDisplay =
    document.getElementById("p2-sets");

const p1Box =
    document.getElementById("p1-box");

const p2Box =
    document.getElementById("p2-box");

const modeLabel =
    document.getElementById("mode-label");

const legSetStatus =
    document.getElementById("leg-set-status");

const checkoutText =
    document.getElementById("checkout-text");

const dartsStatus =
    document.getElementById("darts-status");

const scoreInput =
    document.getElementById("score-input");

const submitScoreBtn =
    document.getElementById("submit-score");


/* =========================================================
   SCORING METHOD
========================================================= */

const methodButtons =
    document.querySelectorAll(".method-button");

const tapScoringSection =
    document.getElementById("tap-scoring-section");

const manualScoringSection =
    document.getElementById("manual-scoring-section");

const cameraScoringSection =
    document.getElementById("camera-scoring-section");


/* =========================================================
   CRICKET DOM
========================================================= */

const cricketTeamA =
    document.getElementById("cricket-team-a");

const cricketTeamB =
    document.getElementById("cricket-team-b");

const cricketBattingName =
    document.getElementById("cricket-batting-name");

const cricketBowlingName =
    document.getElementById("cricket-bowling-name");

const cricketInningsDisplay =
    document.getElementById("cricket-innings");

const cricketTotalWicketsInput =
    document.getElementById("cricket-total-wickets");

const cricketRunsDisplay =
    document.getElementById("cricket-runs");

const cricketWicketsDisplay =
    document.getElementById("cricket-wickets");

const cricketDangerDisplay =
    document.getElementById("cricket-danger");

const cricketTargetDisplay =
    document.getElementById("cricket-target");

const cricketPhaseDisplay =
    document.getElementById("cricket-phase");

const cricketDartsLeftDisplay =
    document.getElementById("cricket-darts-left");

const cricketStartMatchBtn =
    document.getElementById("cricket-start-match");

const cricketDeclareBtn =
    document.getElementById("cricket-declare");

const cricketMissBoardBtn =
    document.getElementById("cricket-miss-board");

const cricketFallOutBtn =
    document.getElementById("cricket-fall-out");

const cricketBackBtn =
    document.getElementById("cricket-back");


/* =========================================================
   MODE SELECTION
========================================================= */

let selectedMode = "501";


modeButtons.forEach(button => {

    button.addEventListener("click", () => {

        selectedMode = button.dataset.mode;

        modeScreen.classList.add("hidden");


        if (selectedMode === "cricket") {

            nameScreenTitle.textContent =
                "Enter Team Names";

            p1Label.textContent = "Team A:";
            p2Label.textContent = "Team B:";

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

        nameScreen.classList.remove("hidden");
    });
});


/* =========================================================
   NAME SCREEN
========================================================= */

continueToSetupBtn.addEventListener("click", () => {

    const name1 =
        p1NameInput.value.trim() ||
        (
            selectedMode === "cricket"
                ? "Team A"
                : "Player 1"
        );

    const name2 =
        p2NameInput.value.trim() ||
        (
            selectedMode === "cricket"
                ? "Team B"
                : "Player 2"
        );


    if (selectedMode === "cricket") {

        cricketTeamA.textContent =
            name1;

        cricketTeamB.textContent =
            name2;

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
});


/* =========================================================
   501 / SETS VARIABLES
========================================================= */

let gameMode = "legs";

let legsPerSet = 3;
let setsToWin = 3;

let startingScore = 501;

let p1Score = 501;
let p2Score = 501;

let p1Legs = 0;
let p2Legs = 0;

let p1Sets = 0;
let p2Sets = 0;

let currentSet = 1;
let currentLeg = 1;

let currentPlayer = 1;

let dartsLeft = 3;

let turnStartScoreP1 = 501;
let turnStartScoreP2 = 501;


/* =========================================================
   START MATCH
========================================================= */

startMatchBtn.addEventListener("click", () => {

    gameMode =
        selectedMode === "sets"
            ? "sets"
            : "legs";

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

    selectScoringMethod("tap");

    updateDisplay();
});


/* =========================================================
   RESET MATCH
========================================================= */

function resetMatch() {

    p1Score = startingScore;
    p2Score = startingScore;

    p1Legs = 0;
    p2Legs = 0;

    p1Sets = 0;
    p2Sets = 0;

    currentSet = 1;
    currentLeg = 1;

    currentPlayer = 1;

    dartsLeft = 3;

    turnStartScoreP1 =
        startingScore;

    turnStartScoreP2 =
        startingScore;

    modeLabel.textContent =
        gameMode === "legs"
            ? `Legs Only - First to ${setsToWin}`
            : `${legsPerSet} legs per set - First to ${setsToWin} sets`;
}


/* =========================================================
   SCORING METHOD
========================================================= */

methodButtons.forEach(button => {

    button.addEventListener("click", () => {

        selectScoringMethod(
            button.dataset.method
        );
    });
});


function selectScoringMethod(method) {

    methodButtons.forEach(button => {

        button.classList.toggle(
            "active-method",
            button.dataset.method === method
        );
    });

    tapScoringSection.classList.add(
        "hidden"
    );

    manualScoringSection.classList.add(
        "hidden"
    );

    cameraScoringSection.classList.add(
        "hidden"
    );


    if (method === "tap") {

        tapScoringSection.classList.remove(
            "hidden"
        );

    } else if (method === "manual") {

        manualScoringSection.classList.remove(
            "hidden"
        );

    } else {

        cameraScoringSection.classList.remove(
            "hidden"
        );
    }


    if (
        method !== "camera" &&
        window.DartsCamera
    ) {

        window.DartsCamera.stop();
    }
}


/* =========================================================
   CREATE DART BUTTONS
========================================================= */

function createButtons501() {

    const singles =
        document.getElementById("singles");

    const doubles =
        document.getElementById("doubles");

    const trebles =
        document.getElementById("trebles");


    for (let i = 1; i <= 20; i++) {

        const single =
            document.createElement("button");

        single.className =
            "segment btn-score";

        single.dataset.score = i;

        single.textContent = i;

        singles.appendChild(single);


        const double =
            document.createElement("button");

        double.className =
            "segment btn-score";

        double.dataset.score =
            i * 2;

        double.textContent =
            "D" + i;

        doubles.appendChild(double);


        const treble =
            document.createElement("button");

        treble.className =
            "segment btn-score";

        treble.dataset.score =
            i * 3;

        treble.textContent =
            "T" + i;

        trebles.appendChild(treble);
    }


    document
        .querySelectorAll(
            "#game-screen .segment"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    handleDart501(
                        parseInt(
                            button.dataset.score
                        )
                    );
                }
            );
        });
}


createButtons501();


/* =========================================================
   HANDLE ONE DART
========================================================= */

function handleDart501(value) {

    if (dartsLeft <= 0)
        return;


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


    if (currentPlayer === 1) {

        p1Score -= value;


        if (
            p1Score < 0 ||
            p1Score === 1
        ) {

            p1Score =
                turnStartScoreP1;

            endTurn501("Bust!");

        } else if (
            p1Score === 0
        ) {

            handleLegWin(1);

        } else {

            dartsLeft--;

            if (dartsLeft === 0) {

                endTurn501();
            }
        }

    } else {

        p2Score -= value;


        if (
            p2Score < 0 ||
            p2Score === 1
        ) {

            p2Score =
                turnStartScoreP2;

            endTurn501("Bust!");

        } else if (
            p2Score === 0
        ) {

            handleLegWin(2);

        } else {

            dartsLeft--;

            if (dartsLeft === 0) {

                endTurn501();
            }
        }
    }


    updateDisplay();
}


/*
Expose the dart-scoring function to camera.js.
camera.js does not need to know anything about the rest
of the 501 game.
*/

window.scoreDetectedDart501 =
    function(points) {

        handleDart501(points);
    };


/* =========================================================
   MANUAL SCORE
========================================================= */

submitScoreBtn.addEventListener("click", () => {

    const visitScore =
        parseInt(scoreInput.value);


    if (
        isNaN(visitScore) ||
        visitScore < 0 ||
        visitScore > 180
    ) {

        alert(
            "Enter a valid visit score (0–180)"
        );

        return;
    }


    if (currentPlayer === 1) {

        turnStartScoreP1 =
            p1Score;

        p1Score -= visitScore;


        if (
            p1Score < 0 ||
            p1Score === 1
        ) {

            p1Score =
                turnStartScoreP1;

            endTurn501("Bust!");

        } else if (
            p1Score === 0
        ) {

            handleLegWin(1);

        } else {

            endTurn501();
        }

    } else {

        turnStartScoreP2 =
            p2Score;

        p2Score -= visitScore;


        if (
            p2Score < 0 ||
            p2Score === 1
        ) {

            p2Score =
                turnStartScoreP2;

            endTurn501("Bust!");

        } else if (
            p2Score === 0
        ) {

            handleLegWin(2);

        } else {

            endTurn501();
        }
    }


    scoreInput.value = "";

    updateDisplay();
});


scoreInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            submitScoreBtn.click();
        }
    }
);


/* =========================================================
   END TURN
========================================================= */

function endTurn501(message) {

    if (message) {

        alert(message);
    }


    currentPlayer =
        currentPlayer === 1
            ? 2
            : 1;

    dartsLeft = 3;
}


/* =========================================================
   LEG WIN
========================================================= */

function handleLegWin(player) {

    if (player === 1) {

        p1Legs++;

    } else {

        p2Legs++;
    }


    if (gameMode === "sets") {

        if (
            p1Legs >= legsPerSet ||
            p2Legs >= legsPerSet
        ) {

            if (p1Legs > p2Legs) {

                p1Sets++;

            } else {

                p2Sets++;
            }

            p1Legs = 0;
            p2Legs = 0;

            currentSet++;
        }
    }


    currentLeg++;


    if (gameMode === "legs") {

        if (p1Legs >= setsToWin) {

            alert(
                `${p1NameDisplay.textContent} wins the match!`
            );

            resetMatch();

        } else if (
            p2Legs >= setsToWin
        ) {

            alert(
                `${p2NameDisplay.textContent} wins the match!`
            );

            resetMatch();
        }

    } else {

        if (p1Sets >= setsToWin) {

            alert(
                `${p1NameDisplay.textContent} wins the match!`
            );

            resetMatch();

        } else if (
            p2Sets >= setsToWin
        ) {

            alert(
                `${p2NameDisplay.textContent} wins the match!`
            );

            resetMatch();
        }
    }


    p1Score =
        startingScore;

    p2Score =
        startingScore;

    dartsLeft = 3;


    currentPlayer =
        player === 1
            ? 2
            : 1;
}


/* =========================================================
   DISPLAY
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


    legSetStatus.textContent =
        gameMode === "sets"
            ? `Set ${currentSet} · Leg ${currentLeg}`
            : `Leg ${currentLeg}`;


    dartsStatus.textContent =
        `Darts: ${dartsLeft}`;


    if (currentPlayer === 1) {

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


    updateCheckoutSuggestion();
}


/* =========================================================
   CHECKOUT
========================================================= */

function updateCheckoutSuggestion() {

    const score =
        currentPlayer === 1
            ? p1Score
            : p2Score;

    checkoutText.textContent =
        getCheckoutRoute(score);
}


function getCheckoutRoute(score) {

    if (
        score > 170 ||
        score < 2
    ) {

        return "No checkout available";
    }


    const routes = {

        170: "T20, T20, Bull",
        167: "T20, T19, Bull",
        164: "T20, T18, Bull",
        161: "T20, T17, Bull",

        160: "T20, T20, D20",
        158: "T20, T20, D19",
        157: "T20, T19, D20",
        156: "T20, T20, D18",

        155: "T20, T19, D19",
        154: "T20, T18, D20",
        153: "T20, T19, D18",
        152: "T20, T20, D16",

        151: "T20, T17, D20",
        150: "T20, T18, D18",

        149: "T20, T19, D16",
        148: "T20, T16, D20",

        147: "T20, T17, D18",
        146: "T20, T18, D16",
        145: "T20, T15, D20",
        144: "T20, T20, D12",

        141: "T20, T19, D12",
        140: "T20, T20, D10",

        121: "T20, T11, D14",
        120: "T20, 20, D20",

        100: "T20, D20",

        80: "T20, D10",

        40: "D20",
        32: "D16",
        24: "D12",
        16: "D8"
    };


    return routes[score] ||
        "Standard route";
}


/* =========================================================
   CRICKET
========================================================= */

let cricketInnings = 1;

let cricketTotalWickets = 11;

let cricketRuns = 0;

let cricketWicketsLost = 0;

let cricketNextWicket = 1;

let cricketTarget = null;

let cricketDartsLeft = 3;

let cricketPhase =
    "bowling";


/* =========================================================
   CREATE CRICKET BUTTONS
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


    if (
        bowlSingles.children.length > 0
    ) {

        return;
    }


    for (let i = 1; i <= 20; i++) {

        createCricketButton(
            bowlSingles,
            i,
            1,
            "bowl",
            String(i)
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
            String(i)
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
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const role =
                        button.dataset.role;

                    if (!role)
                        return;


                    handleCricketDart(

                        role,

                        parseInt(
                            button.dataset.base
                        ),

                        parseInt(
                            button.dataset.mult
                        ),

                        parseInt(
                            button.dataset.score
                        )
                    );
                }
            );
        });
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

    cricketInnings = 1;

    cricketTotalWickets =
        parseInt(
            cricketTotalWicketsInput.value
        ) || 11;

    cricketRuns = 0;

    cricketWicketsLost = 0;

    cricketNextWicket = 1;

    cricketTarget = null;

    cricketDartsLeft = 3;

    cricketPhase =
        "bowling";

    updateCricketDisplay();
}


cricketStartMatchBtn.addEventListener(
    "click",
    resetCricketMatch
);


/* =========================================================
   CRICKET DECLARE
========================================================= */

cricketDeclareBtn.addEventListener(
    "click",
    () => {

        if (
            cricketInnings === 1
        ) {

            cricketTarget =
                cricketRuns + 1;

            cricketInnings = 2;


            cricketBattingName.textContent =
                cricketTeamA.textContent;

            cricketBowlingName.textContent =
                cricketTeamB.textContent;


            cricketRuns = 0;

            cricketWicketsLost = 0;

            cricketNextWicket = 1;

            cricketDartsLeft = 3;

            cricketPhase =
                "bowling";


            alert(
                `Innings declared.\nTarget: ${cricketTarget}`
            );

        } else {

            alert(
                `Second innings declared at ${cricketRuns}.`
            );
        }


        updateCricketDisplay();
    }
);


/* =========================================================
   CRICKET SPECIAL BUTTONS
========================================================= */

cricketMissBoardBtn.addEventListener(
    "click",
    () => {

        if (
            cricketPhase !==
            "batting"
        ) {

            return;
        }


        cricketRuns++;

        cricketDartsLeft--;


        if (
            cricketDartsLeft <= 0
        ) {

            cricketPhase =
                "bowling";

            cricketDartsLeft = 3;
        }


        checkCricketResult();

        updateCricketDisplay();
    }
);


cricketFallOutBtn.addEventListener(
    "click",
    () => {

        if (
            cricketPhase !==
            "batting"
        ) {

            return;
        }


        cricketRuns++;


        /*
        Extra dart:
        darts-left is NOT reduced.
        */

        checkCricketResult();

        updateCricketDisplay();
    }
);


/* =========================================================
   CRICKET DART
========================================================= */

function handleCricketDart(
    role,
    base,
    mult,
    score
) {

    if (
        cricketDartsLeft <= 0
    ) {

        return;
    }


    if (role === "bowl") {

        if (
            base ===
            cricketNextWicket
        ) {

            takeCricketWickets(
                mult
            );
        }


        cricketDartsLeft--;


        if (
            cricketDartsLeft <= 0
        ) {

            cricketPhase =
                "batting";

            cricketDartsLeft = 3;
        }

    } else {

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


        if (
            cricketDartsLeft <= 0
        ) {

            cricketPhase =
                "bowling";

            cricketDartsLeft = 3;
        }
    }


    checkCricketResult();

    updateCricketDisplay();
}


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
}


/* =========================================================
   CRICKET RESULT
========================================================= */

function checkCricketResult() {

    if (
        cricketWicketsLost >=
        cricketTotalWickets
    ) {

        if (
            cricketInnings === 1
        ) {

            cricketTarget =
                cricketRuns + 1;

            cricketInnings = 2;


            cricketBattingName.textContent =
                cricketTeamA.textContent;

            cricketBowlingName.textContent =
                cricketTeamB.textContent;


            cricketRuns = 0;

            cricketWicketsLost = 0;

            cricketNextWicket = 1;

            cricketDartsLeft = 3;

            cricketPhase =
                "bowling";


            alert(
                `All out.\nTarget: ${cricketTarget}`
            );

        } else {

            if (
                cricketRuns >=
                cricketTarget
            ) {

                alert(
                    `${cricketBattingName.textContent} wins!`
                );

            } else {

                alert(
                    `${cricketBowlingName.textContent} wins!`
                );
            }
        }
    }


    if (
        cricketInnings === 2 &&
        cricketTarget !== null &&
        cricketRuns >=
        cricketTarget
    ) {

        alert(
            `${cricketBattingName.textContent} wins!`
        );
    }
}


/* =========================================================
   CRICKET DISPLAY
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

    cricketDangerDisplay.textContent =
        cricketNextWicket <=
        cricketTotalWickets
            ? cricketNextWicket
            : "–";

    cricketTargetDisplay.textContent =
        cricketTarget === null
            ? "–"
            : cricketTarget;

    cricketPhaseDisplay.textContent =
        cricketPhase === "bowling"
            ? "Bowling Turn"
            : "Batting Turn";

    cricketDartsLeftDisplay.textContent =
        cricketDartsLeft;
}


/* =========================================================
   BACK
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


updateDisplay();