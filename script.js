"use strict";

/* =========================================================
   DOM
========================================================= */

const modeScreen =
    document.getElementById("mode-screen");

const nameScreen =
    document.getElementById("name-screen");

const setupScreen =
    document.getElementById("setup-screen");

const gameScreen =
    document.getElementById("game-screen");

const cricketScreen =
    document.getElementById("cricket-screen");


const modeButtons =
    document.querySelectorAll(".mode-btn");


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


const methodButtons =
    document.querySelectorAll(".method-button");


const tapScoringSection =
    document.getElementById("tap-scoring-section");

const visitScoringSection =
    document.getElementById("visit-scoring-section");

const individualScoringSection =
    document.getElementById("individual-scoring-section");


const scoreInput =
    document.getElementById("score-input");

const submitScoreBtn =
    document.getElementById("submit-score");


const individualDartInput =
    document.getElementById("individual-dart-input");

const submitIndividualDartBtn =
    document.getElementById("submit-individual-dart");

const individualDartStatus =
    document.getElementById("individual-dart-status");


const normalUndoBtn =
    document.getElementById("undo-normal");


const toggleAnnouncerBtn =
    document.getElementById("toggle-announcer");


const gameBackBtn =
    document.getElementById("game-back");


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

const cricketUndoBtn =
    document.getElementById("undo-cricket");

const cricketBackBtn =
    document.getElementById("cricket-back");


/* =========================================================
   HISTORY
========================================================= */

const normalHistory = [];
const cricketHistory = [];

const MAX_HISTORY = 100;


/* =========================================================
   ANNOUNCER
========================================================= */

let announcerEnabled = true;

let currentVisitScore = 0;


/* =========================================================
   SPEAK
========================================================= */

function speakAnnouncement(
    text,
    special = "normal"
) {

    if (!announcerEnabled) {
        return;
    }

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    /*
       Browser speech volume max is 1.
    */

    utterance.volume = 1;


    if (special === "180") {

        /*
           Make 180 sound more dramatic.
        */

        utterance.rate = 0.95;
        utterance.pitch = 1.28;

    } else if (special === "game") {

        utterance.rate = 0.86;
        utterance.pitch = 1.12;

    } else if (special === "require") {

        utterance.rate = 0.88;
        utterance.pitch = 1.0;

    } else if (special === "bust") {

        utterance.rate = 0.82;
        utterance.pitch = 0.85;

    } else {

        utterance.rate = 0.90;
        utterance.pitch = 1.02;
    }


    /*
       Prefer British English voice.
    */

    const voices =
        window.speechSynthesis
            .getVoices();


    const ukVoice =
        voices.find(
            voice =>
                voice.lang &&
                voice.lang
                    .toLowerCase()
                    .startsWith("en-gb")
        );


    if (ukVoice) {

        utterance.voice =
            ukVoice;
    }


    window.speechSynthesis.speak(
        utterance
    );
}


/* =========================================================
   ANNOUNCER ON/OFF
========================================================= */

toggleAnnouncerBtn.addEventListener(
    "click",
    () => {

        announcerEnabled =
            !announcerEnabled;


        toggleAnnouncerBtn.textContent =
            announcerEnabled
                ? "🔊 Announcer: On"
                : "🔇 Announcer: Off";


        if (
            !announcerEnabled &&
            "speechSynthesis" in window
        ) {

            window.speechSynthesis.cancel();
        }
    }
);


/* =========================================================
   NORMAL VISIT SCORE
========================================================= */

function announceVisitScore(
    score
) {

    if (score === 180) {

        speakAnnouncement(
            "ONE HUNDRED AND EIGHTYYYYYYYY!",
            "180"
        );

        return;
    }


    if (score === 0) {

        speakAnnouncement(
            "NO SCORE!",
            "bust"
        );

        return;
    }


    speakAnnouncement(
        visitScoreToWords(score) + "!"
    );
}


/* =========================================================
   REQUIRE ANNOUNCEMENT
========================================================= */

function announceRequiredScore() {

    if (!announcerEnabled) {
        return;
    }


    const score =
        currentPlayer === 1
            ? p1Score
            : p2Score;


    const playerName =
        currentPlayer === 1
            ? p1NameDisplay.textContent
            : p2NameDisplay.textContent;


    /*
       Only announce "you require"
       when a checkout is actually possible.
    */

    const checkout =
        findBestCheckout(
            score,
            3
        );


    if (!checkout) {

        return;
    }


    const spokenScore =
        numberToBritishWords(
            score
        );


    speakAnnouncement(
        `${playerName}, you require ${spokenScore}`,
        "require"
    );
}


/* =========================================================
   GAME CALLS
========================================================= */

function announceGameShot() {

    speakAnnouncement(
        "GAME SHOT!",
        "game"
    );
}


function announceGameShotAndSet() {

    speakAnnouncement(
        "GAME SHOT... AND THE SET!",
        "game"
    );
}


function announceGameShotAndMatch() {

    speakAnnouncement(
        "GAME SHOT... AND THE MATCH!",
        "game"
    );
}


/* =========================================================
   NUMBER WORDS
========================================================= */

function visitScoreToWords(
    score
) {

    if (score === 0) {

        return "No score";
    }


    if (score === 180) {

        return "One hundred and eighty";
    }


    return numberToBritishWords(
        score
    );
}


function numberToBritishWords(
    number
) {

    const smallNumbers = [
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


    const tensWords = [
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


    if (number < 20) {

        return smallNumbers[number];
    }


    if (number < 100) {

        const tens =
            Math.floor(
                number / 10
            );


        const units =
            number % 10;


        return (
            tensWords[tens] +
            (
                units
                    ? " " +
                      smallNumbers[units]
                    : ""
            )
        );
    }


    if (number < 200) {

        const remainder =
            number - 100;


        if (remainder === 0) {

            return "one hundred";
        }


        return (
            "one hundred and " +
            numberToBritishWords(
                remainder
            )
        );
    }


    if (number < 1000) {

        const hundreds =
            Math.floor(
                number / 100
            );


        const remainder =
            number % 100;


        let result =
            smallNumbers[hundreds] +
            " hundred";


        if (remainder > 0) {

            result +=
                " and " +
                numberToBritishWords(
                    remainder
                );
        }


        return result;
    }


    return String(number);
}


/* =========================================================
   MODE
========================================================= */

let selectedMode = "501";


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
                    selectedMode === "cricket"
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

continueToSetupBtn.addEventListener(
    "click",
    () => {

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


        if (
            selectedMode === "cricket"
        ) {

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

            resetCricketMatch(false);

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
   501 VARIABLES
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

startMatchBtn.addEventListener(
    "click",
    () => {

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


        normalHistory.length = 0;


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

    currentVisitScore = 0;

    turnStartScoreP1 =
        startingScore;

    turnStartScoreP2 =
        startingScore;

    updateModeLabel();
}


/* =========================================================
   MODE LABEL
========================================================= */

function updateModeLabel() {

    if (
        gameMode === "legs"
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
                button.dataset.method === method
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
        method === "tap"
    ) {

        tapScoringSection.classList.remove(
            "hidden"
        );

    } else if (
        method === "visit"
    ) {

        visitScoringSection.classList.remove(
            "hidden"
        );

        setTimeout(
            () => scoreInput.focus(),
            100
        );

    } else if (
        method === "individual"
    ) {

        individualScoringSection.classList.remove(
            "hidden"
        );

        updateIndividualDartStatus();

        setTimeout(
            () => individualDartInput.focus(),
            100
        );
    }
}


/* =========================================================
   CREATE 501 BUTTONS
========================================================= */

function createButtons501() {

    const singles =
        document.getElementById("singles");

    const doubles =
        document.getElementById("doubles");

    const trebles =
        document.getElementById("trebles");


    singles.innerHTML = "";
    doubles.innerHTML = "";
    trebles.innerHTML = "";


    for (
        let i = 1;
        i <= 20;
        i++
    ) {

        const single =
            document.createElement(
                "button"
            );

        single.className =
            "segment btn-score";

        single.dataset.score = i;

        single.textContent = i;

        singles.appendChild(
            single
        );


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

                        scoreIndividual501Dart(
                            value
                        );
                    }
                );
            }
        );
}


createButtons501();


/* =========================================================
   NORMAL HISTORY
========================================================= */

function pushNormalHistory() {

    normalHistory.push({

        p1Score,
        p2Score,

        p1Legs,
        p2Legs,

        p1Sets,
        p2Sets,

        currentSet,
        currentLeg,

        currentPlayer,

        dartsLeft,

        currentVisitScore,

        turnStartScoreP1,
        turnStartScoreP2,

        gameMode,

        startingScore,

        legsPerSet,
        setsToWin
    });


    if (
        normalHistory.length >
        MAX_HISTORY
    ) {

        normalHistory.shift();
    }


    updateUndoButtons();
}


/* =========================================================
   NORMAL UNDO
========================================================= */

normalUndoBtn.addEventListener(
    "click",
    () => {

        if (
            normalHistory.length === 0
        ) {

            return;
        }


        const old =
            normalHistory.pop();


        p1Score = old.p1Score;
        p2Score = old.p2Score;

        p1Legs = old.p1Legs;
        p2Legs = old.p2Legs;

        p1Sets = old.p1Sets;
        p2Sets = old.p2Sets;

        currentSet = old.currentSet;
        currentLeg = old.currentLeg;

        currentPlayer =
            old.currentPlayer;

        dartsLeft =
            old.dartsLeft;

        currentVisitScore =
            old.currentVisitScore;

        turnStartScoreP1 =
            old.turnStartScoreP1;

        turnStartScoreP2 =
            old.turnStartScoreP2;

        gameMode =
            old.gameMode;

        startingScore =
            old.startingScore;

        legsPerSet =
            old.legsPerSet;

        setsToWin =
            old.setsToWin;


        if (
            "speechSynthesis" in window
        ) {

            window.speechSynthesis.cancel();
        }


        updateModeLabel();

        updateDisplay();

        updateIndividualDartStatus();

        updateUndoButtons();
    }
);


/* =========================================================
   INDIVIDUAL DART SCORING
========================================================= */

function scoreIndividual501Dart(
    value
) {

    if (
        dartsLeft <= 0
    ) {

        return;
    }


    pushNormalHistory();


    if (
        currentPlayer === 1 &&
        dartsLeft === 3
    ) {

        turnStartScoreP1 =
            p1Score;

        currentVisitScore =
            0;
    }


    if (
        currentPlayer === 2 &&
        dartsLeft === 3
    ) {

        turnStartScoreP2 =
            p2Score;

        currentVisitScore =
            0;
    }


    currentVisitScore +=
        value;


    if (
        currentPlayer === 1
    ) {

        p1Score -= value;


        if (
            p1Score < 0 ||
            p1Score === 1
        ) {

            p1Score =
                turnStartScoreP1;

            currentVisitScore =
                0;

            announceVisitScore(
                0
            );

            endTurn501(
                "Bust!"
            );

        } else if (
            p1Score === 0
        ) {

            announceGameShot(
                currentVisitScore
            );

            handleLegWin(
                1
            );

        } else {

            dartsLeft--;


            if (
                dartsLeft === 0
            ) {

                announceVisitScore(
                    currentVisitScore
                );

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

            currentVisitScore =
                0;

            announceVisitScore(
                0
            );

            endTurn501(
                "Bust!"
            );

        } else if (
            p2Score === 0
        ) {

            announceGameShot(
                currentVisitScore
            );

            handleLegWin(
                2
            );

        } else {

            dartsLeft--;


            if (
                dartsLeft === 0
            ) {

                announceVisitScore(
                    currentVisitScore
                );

                endTurn501();
            }
        }
    }


    updateDisplay();

    updateIndividualDartStatus();
}


/* =========================================================
   GAME SHOT ANNOUNCEMENT
========================================================= */

function announceGameShot(
    visit
) {

    if (
        !announcerEnabled
    ) {

        return;
    }


    speakAnnouncement(
        `Game shot. ${visitScoreToWords(visit)}`
    );
}


/* =========================================================
   WHOLE VISIT
========================================================= */

submitScoreBtn.addEventListener(
    "click",
    submitWholeVisit
);


scoreInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            submitWholeVisit();
        }
    }
);


function submitWholeVisit() {

    const visitScore =
        parseInt(
            scoreInput.value
        );


    if (
        isNaN(visitScore) ||
        visitScore < 0 ||
        visitScore > 180
    ) {

        alert(
            "Enter a visit score from 0 to 180."
        );

        return;
    }


    pushNormalHistory();


    if (
        currentPlayer === 1
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

            announceVisitScore(
                0
            );

            endTurn501(
                "Bust!"
            );

        } else if (
            p1Score === 0
        ) {

            announceGameShot(
                visitScore
            );

            handleLegWin(
                1
            );

        } else {

            announceVisitScore(
                visitScore
            );

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

            announceVisitScore(
                0
            );

            endTurn501(
                "Bust!"
            );

        } else if (
            p2Score === 0
        ) {

            announceGameShot(
                visitScore
            );

            handleLegWin(
                2
            );

        } else {

            announceVisitScore(
                visitScore
            );

            endTurn501();
        }
    }


    currentVisitScore =
        0;


    scoreInput.value =
        "";


    updateDisplay();

    updateIndividualDartStatus();


    setTimeout(
        () => scoreInput.focus(),
        50
    );
}


/* =========================================================
   VALID SINGLE DART SCORE
========================================================= */

function isValidSingleDartScore(
    value
) {

    if (
        value === 0 ||
        value === 25 ||
        value === 50
    ) {

        return true;
    }


    for (
        let number = 1;
        number <= 20;
        number++
    ) {

        if (
            value === number ||
            value === number * 2 ||
            value === number * 3
        ) {

            return true;
        }
    }


    return false;
}


/* =========================================================
   MANUAL INDIVIDUAL DART
========================================================= */

submitIndividualDartBtn.addEventListener(
    "click",
    submitIndividualDart
);


individualDartInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            submitIndividualDart();
        }
    }
);


function submitIndividualDart() {

    const value =
        parseInt(
            individualDartInput.value
        );


    if (
        isNaN(value)
    ) {

        alert(
            "Enter the score for this dart."
        );

        return;
    }


    if (
        !isValidSingleDartScore(
            value
        )
    ) {

        alert(
            `${value} cannot be scored with one dart.`
        );

        return;
    }


    scoreIndividual501Dart(
        value
    );


    individualDartInput.value =
        "";


    setTimeout(
        () =>
            individualDartInput.focus(),
        50
    );
}


/* =========================================================
   INDIVIDUAL STATUS
========================================================= */

function updateIndividualDartStatus() {

    const player =
        currentPlayer === 1
            ? p1NameDisplay.textContent
            : p2NameDisplay.textContent;


    const dartNumber =
        4 - dartsLeft;


    individualDartStatus.textContent =
        `${player} · Dart ${dartNumber} of 3 · ${dartsLeft} dart${dartsLeft === 1 ? "" : "s"} remaining`;
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


    currentVisitScore =
        0;
}


/* =========================================================
   LEG / SET WIN
========================================================= */

function handleLegWin(
    player
) {

    if (
        player === 1
    ) {

        p1Legs++;

    } else {

        p2Legs++;
    }


    let matchWon =
        false;


    if (
        gameMode === "sets"
    ) {

        if (
            p1Legs >= legsPerSet ||
            p2Legs >= legsPerSet
        ) {

            if (
                p1Legs > p2Legs
            ) {

                p1Sets++;

            } else {

                p2Sets++;
            }


            p1Legs = 0;
            p2Legs = 0;

            currentSet++;
        }


        if (
            p1Sets >= setsToWin
        ) {

            speakAnnouncement(
                `${p1NameDisplay.textContent} wins the match`
            );

            alert(
                `${p1NameDisplay.textContent} wins the match!`
            );

            matchWon = true;

        } else if (
            p2Sets >= setsToWin
        ) {

            speakAnnouncement(
                `${p2NameDisplay.textContent} wins the match`
            );

            alert(
                `${p2NameDisplay.textContent} wins the match!`
            );

            matchWon = true;
        }

    } else {

        if (
            p1Legs >= setsToWin
        ) {

            speakAnnouncement(
                `${p1NameDisplay.textContent} wins the match`
            );

            alert(
                `${p1NameDisplay.textContent} wins the match!`
            );

            matchWon = true;

        } else if (
            p2Legs >= setsToWin
        ) {

            speakAnnouncement(
                `${p2NameDisplay.textContent} wins the match`
            );

            alert(
                `${p2NameDisplay.textContent} wins the match!`
            );

            matchWon = true;
        }
    }


    if (
        matchWon
    ) {

        resetMatch();

        return;
    }


    currentLeg++;


    p1Score =
        startingScore;

    p2Score =
        startingScore;


    dartsLeft =
        3;


    currentVisitScore =
        0;


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


    if (
        gameMode === "sets"
    ) {

        legSetStatus.textContent =
            `Set ${currentSet} · Leg ${currentLeg}`;

    } else {

        legSetStatus.textContent =
            `Leg ${currentLeg}`;
    }


    dartsStatus.textContent =
        `Darts: ${dartsLeft}`;


    if (
        currentPlayer === 1
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


    updateCheckoutSuggestion();

    updateUndoButtons();
}


/* =========================================================
   CHECKOUT ENGINE
========================================================= */

const ALL_DARTS = [];
const FINISH_DARTS = [];


for (
    let n = 1;
    n <= 20;
    n++
) {

    ALL_DARTS.push({
        score: n,
        label: String(n),
        type: "single"
    });
}


for (
    let n = 1;
    n <= 20;
    n++
) {

    const dart = {
        score: n * 2,
        label: "D" + n,
        type: "double"
    };

    ALL_DARTS.push(
        dart
    );

    FINISH_DARTS.push(
        dart
    );
}


for (
    let n = 1;
    n <= 20;
    n++
) {

    ALL_DARTS.push({
        score: n * 3,
        label: "T" + n,
        type: "treble"
    });
}


ALL_DARTS.push({
    score: 25,
    label: "25",
    type: "single"
});


const bullDart = {
    score: 50,
    label: "Bull",
    type: "double"
};


ALL_DARTS.push(
    bullDart
);

FINISH_DARTS.push(
    bullDart
);


const BOGEY_NUMBERS =
    new Set([
        169,
        168,
        166,
        165,
        163,
        162,
        159
    ]);


const GOOD_LEAVE_PRIORITY = [

    40,
    32,
    36,
    24,
    20,
    16,

    48,
    52,
    56,
    60,
    64,

    68,
    72,
    76,
    80,

    81,
    82,
    83,
    84,

    86,
    88,

    90,
    92,
    94,
    96,

    100,
    101,
    104,
    107,
    110,

    116,
    120,
    121,

    124,
    126,
    128,

    130,
    132,

    136,
    140,

    144,
    148,

    150,
    152,
    156,

    160,
    164,
    167,
    170
];


function updateCheckoutSuggestion() {

    const score =
        currentPlayer === 1
            ? p1Score
            : p2Score;


    checkoutText.textContent =
        getCheckoutSuggestion(
            score,
            dartsLeft
        );
}


function getCheckoutSuggestion(
    score,
    dartsAvailable
) {

    if (
        score <= 0
    ) {

        return "Finished";
    }


    if (
        score === 1
    ) {

        return "No legal finish from 1";
    }


    const maxDarts =
        Math.max(
            1,
            Math.min(
                3,
                dartsAvailable
            )
        );


    const checkout =
        findBestCheckout(
            score,
            maxDarts
        );


    if (
        checkout
    ) {

        return (
            "Checkout: " +
            checkout.join(" → ")
        );
    }


    const setup =
        findBestSetup(
            score,
            maxDarts
        );


    if (
        setup
    ) {

        return (
            "Setup: " +
            setup.route.join(" → ") +
            " · Leave " +
            setup.leave
        );
    }


    return (
        "Score heavily and avoid leaving 1"
    );
}


function findBestCheckout(
    target,
    maxDarts
) {

    const candidates = [];


    if (
        maxDarts >= 1
    ) {

        for (
            const finish
            of FINISH_DARTS
        ) {

            if (
                finish.score ===
                target
            ) {

                candidates.push({
                    route: [
                        finish.label
                    ],
                    finish:
                        finish.score
                });
            }
        }
    }


    if (
        maxDarts >= 2
    ) {

        for (
            const first
            of ALL_DARTS
        ) {

            for (
                const finish
                of FINISH_DARTS
            ) {

                if (
                    first.score +
                    finish.score ===
                    target
                ) {

                    candidates.push({
                        route: [
                            first.label,
                            finish.label
                        ],
                        finish:
                            finish.score
                    });
                }
            }
        }
    }


    if (
        maxDarts >= 3
    ) {

        for (
            const first
            of ALL_DARTS
        ) {

            for (
                const second
                of ALL_DARTS
            ) {

                for (
                    const finish
                    of FINISH_DARTS
                ) {

                    if (
                        first.score +
                        second.score +
                        finish.score ===
                        target
                    ) {

                        candidates.push({
                            route: [
                                first.label,
                                second.label,
                                finish.label
                            ],
                            finish:
                                finish.score
                        });
                    }
                }
            }
        }
    }


    if (
        candidates.length ===
        0
    ) {

        return null;
    }


    candidates.sort(
        compareCheckoutCandidates
    );


    return candidates[0].route;
}


function compareCheckoutCandidates(
    a,
    b
) {

    if (
        a.route.length !==
        b.route.length
    ) {

        return (
            a.route.length -
            b.route.length
        );
    }


    const aDouble =
        doublePreference(
            a.finish
        );

    const bDouble =
        doublePreference(
            b.finish
        );


    if (
        aDouble !==
        bDouble
    ) {

        return (
            aDouble -
            bDouble
        );
    }


    return (
        routePreferenceScore(
            b.route
        ) -
        routePreferenceScore(
            a.route
        )
    );
}


function doublePreference(
    score
) {

    const order = [

        40,
        32,
        36,
        24,
        20,
        16,
        28,
        12,
        8,
        4,
        2,
        50

    ];


    const index =
        order.indexOf(
            score
        );


    return (
        index === -1
            ? 999
            : index
    );
}


function routePreferenceScore(
    route
) {

    let total =
        0;


    route.forEach(
        label => {

            if (
                label.startsWith("T")
            ) {

                total +=
                    15;

            } else if (
                label.startsWith("D")
            ) {

                total +=
                    4;

            } else if (
                label === "Bull"
            ) {

                total +=
                    5;

            } else {

                total +=
                    8;
            }
        }
    );


    return total;
}


function findBestSetup(
    score,
    maxDarts
) {

    let best =
        null;


    const setupDarts = [

        { score: 60, label: "T20" },
        { score: 57, label: "T19" },
        { score: 54, label: "T18" },
        { score: 51, label: "T17" },
        { score: 48, label: "T16" },
        { score: 45, label: "T15" },

        { score: 42, label: "T14" },
        { score: 39, label: "T13" },
        { score: 36, label: "T12" },

        { score: 25, label: "25" },

        { score: 20, label: "20" },
        { score: 19, label: "19" },
        { score: 18, label: "18" },
        { score: 17, label: "17" },
        { score: 16, label: "16" },
        { score: 15, label: "15" },
        { score: 14, label: "14" },
        { score: 13, label: "13" },
        { score: 12, label: "12" },
        { score: 11, label: "11" },
        { score: 10, label: "10" },

        { score: 50, label: "Bull" },

        { score: 40, label: "D20" },
        { score: 38, label: "D19" },
        { score: 36, label: "D18" },
        { score: 34, label: "D17" },
        { score: 32, label: "D16" }
    ];


    if (
        maxDarts >= 1
    ) {

        for (
            const a
            of setupDarts
        ) {

            evaluateSetup(
                [a],
                score,
                candidate => {

                    if (
                        !best ||
                        candidate.rank <
                        best.rank
                    ) {

                        best =
                            candidate;
                    }
                }
            );
        }
    }


    if (
        maxDarts >= 2
    ) {

        for (
            const a
            of setupDarts
        ) {

            for (
                const b
                of setupDarts
            ) {

                evaluateSetup(
                    [a, b],
                    score,
                    candidate => {

                        if (
                            !best ||
                            candidate.rank <
                            best.rank
                        ) {

                            best =
                                candidate;
                        }
                    }
                );
            }
        }
    }


    if (
        maxDarts >= 3
    ) {

        for (
            const a
            of setupDarts
        ) {

            for (
                const b
                of setupDarts
            ) {

                for (
                    const c
                    of setupDarts
                ) {

                    evaluateSetup(
                        [a, b, c],
                        score,
                        candidate => {

                            if (
                                !best ||
                                candidate.rank <
                                best.rank
                            ) {

                                best =
                                    candidate;
                            }
                        }
                    );
                }
            }
        }
    }


    return best;
}


function evaluateSetup(
    darts,
    score,
    callback
) {

    const scored =
        darts.reduce(
            (
                total,
                dart
            ) =>
                total +
                dart.score,
            0
        );


    const leave =
        score -
        scored;


    if (
        leave <= 1
    ) {

        return;
    }


    const bogeyPenalty =
        BOGEY_NUMBERS.has(
            leave
        )
            ? 100000
            : 0;


    let checkoutPenalty =
        5000;


    if (
        leave <= 170
    ) {

        const nextCheckout =
            findBestCheckout(
                leave,
                3
            );


        if (
            nextCheckout
        ) {

            checkoutPenalty =
                nextCheckout.length *
                100;
        }
    }


    let leaveRank =
        GOOD_LEAVE_PRIORITY.indexOf(
            leave
        );


    if (
        leaveRank === -1
    ) {

        leaveRank =
            500 +
            leave;
    }


    const scoringReward =
        scored;


    const dartPenalty =
        darts.length *
        5;


    const rank =

        bogeyPenalty +

        checkoutPenalty +

        leaveRank *
        10 +

        dartPenalty -

        scoringReward;


    callback({

        route:
            darts.map(
                dart =>
                    dart.label
            ),

        leave,

        rank
    });
}


/* =========================================================
   BACK
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
   CRICKET
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


function pushCricketHistory() {

    cricketHistory.push({

        cricketInnings,
        cricketTotalWickets,
        cricketRuns,
        cricketWicketsLost,
        cricketNextWicket,
        cricketTarget,
        cricketDartsLeft,
        cricketPhase,
        cricketMatchFinished,

        battingName:
            cricketBattingName.textContent,

        bowlingName:
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


cricketUndoBtn.addEventListener(
    "click",
    () => {

        if (
            cricketHistory.length === 0
        ) {

            return;
        }


        const old =
            cricketHistory.pop();


        cricketInnings =
            old.cricketInnings;

        cricketTotalWickets =
            old.cricketTotalWickets;

        cricketRuns =
            old.cricketRuns;

        cricketWicketsLost =
            old.cricketWicketsLost;

        cricketNextWicket =
            old.cricketNextWicket;

        cricketTarget =
            old.cricketTarget;

        cricketDartsLeft =
            old.cricketDartsLeft;

        cricketPhase =
            old.cricketPhase;

        cricketMatchFinished =
            old.cricketMatchFinished;


        cricketBattingName.textContent =
            old.battingName;

        cricketBowlingName.textContent =
            old.bowlingName;


        updateCricketDisplay();

        updateUndoButtons();
    }
);


function updateUndoButtons() {

    normalUndoBtn.disabled =
        normalHistory.length === 0;

    cricketUndoBtn.disabled =
        cricketHistory.length === 0;
}


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
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const role =
                            button.dataset.role;


                        if (
                            !role
                        ) {

                            return;
                        }


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


function resetCricketMatch(
    saveHistory = true
) {

    if (
        saveHistory
    ) {

        pushCricketHistory();
    }


    cricketInnings =
        1;


    cricketTotalWickets =
        parseInt(
            cricketTotalWicketsInput.value
        ) || 11;


    cricketTotalWickets =
        Math.min(
            20,
            Math.max(
                1,
                cricketTotalWickets
            )
        );


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


    cricketBattingName.textContent =
        cricketTeamB.textContent;

    cricketBowlingName.textContent =
        cricketTeamA.textContent;


    updateCricketDisplay();
}


cricketStartMatchBtn.addEventListener(
    "click",
    () => {

        resetCricketMatch(
            true
        );
    }
);


cricketDeclareBtn.addEventListener(
    "click",
    () => {

        if (
            cricketMatchFinished
        ) {

            return;
        }


        pushCricketHistory();


        if (
            cricketInnings === 1
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


        pushCricketHistory();


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


        pushCricketHistory();


        cricketRuns +=
            1;


        checkCricketResult();

        updateCricketDisplay();
    }
);


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


    if (
        cricketPhase ===
            "batting" &&
        role !==
            "bat"
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


    pushCricketHistory();


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


        if (
            cricketDartsLeft <=
            0
        ) {

            cricketPhase =
                "batting";

            cricketDartsLeft =
                3;
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


function checkCricketResult() {

    if (
        cricketMatchFinished
    ) {

        return;
    }


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


    if (
        cricketInnings === 2 &&
        cricketTarget !== null &&
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
        cricketWicketsLost >=
        cricketTotalWickets

            ? "–"

            : cricketNextWicket;


    cricketTargetDisplay.textContent =
        cricketTarget === null
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


    updateUndoButtons();
}


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

updateIndividualDartStatus();

updateUndoButtons();