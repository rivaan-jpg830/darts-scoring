/* ============================================
   DOM ELEMENTS
============================================ */

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


/* ============================================
   501 SCORING METHOD DOM
============================================ */

const methodButtons =
    document.querySelectorAll(".method-button");

const tapScoringSection =
    document.getElementById("tap-scoring-section");

const manualScoringSection =
    document.getElementById("manual-scoring-section");

const cameraScoringSection =
    document.getElementById("camera-scoring-section");


/* ============================================
   501 CAMERA DOM
============================================ */

const cameraVideo =
    document.getElementById("camera-video");

const cameraPlaceholder =
    document.getElementById("camera-placeholder");

const startCameraBtn =
    document.getElementById("start-camera");

const stopCameraBtn =
    document.getElementById("stop-camera");

const cameraStatus =
    document.getElementById("camera-status");


/* ============================================
   CRICKET DOM ELEMENTS
============================================ */

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


/* ============================================
   CRICKET CAMERA DOM
============================================ */

const cricketMethodButtons =
    document.querySelectorAll(
        ".cricket-method-button"
    );

const cricketTapSection =
    document.getElementById(
        "cricket-tap-section"
    );

const cricketCameraSection =
    document.getElementById(
        "cricket-camera-section"
    );

const cricketCameraVideo =
    document.getElementById(
        "cricket-camera-video"
    );

const cricketCameraPlaceholder =
    document.getElementById(
        "cricket-camera-placeholder"
    );

const cricketStartCameraBtn =
    document.getElementById(
        "cricket-start-camera"
    );

const cricketStopCameraBtn =
    document.getElementById(
        "cricket-stop-camera"
    );

const cricketCameraStatus =
    document.getElementById(
        "cricket-camera-status"
    );


/* ============================================
   CAMERA STREAMS
============================================ */

let mainCameraStream = null;
let cricketCameraStream = null;


/* ============================================
   GAME MODE
============================================ */

let selectedMode = "501";


modeButtons.forEach(button => {

    button.addEventListener("click", () => {

        selectedMode = button.dataset.mode;

        stopAllCameras();

        modeScreen.classList.add("hidden");


        if (selectedMode === "cricket") {

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

        nameScreen.classList.remove("hidden");
    });
});


/* ============================================
   NAME SCREEN
============================================ */

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

        cricketTeamA.textContent = name1;
        cricketTeamB.textContent = name2;

        cricketBattingName.textContent =
            name2;

        cricketBowlingName.textContent =
            name1;

        nameScreen.classList.add("hidden");

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

        nameScreen.classList.add("hidden");

        setupScreen.classList.remove(
            "hidden"
        );
    }
});


/* ============================================
   501 / SETS
============================================ */

let gameMode = "legs";
let legsPerSet = 3;
let setsToWin = 3;
let startingScore = 501;

let p1Score = startingScore;
let p2Score = startingScore;

let p1Legs = 0;
let p2Legs = 0;

let p1Sets = 0;
let p2Sets = 0;

let currentSet = 1;
let currentLeg = 1;

let currentPlayer = 1;
let dartsLeft = 3;

let turnStartScoreP1 = startingScore;
let turnStartScoreP2 = startingScore;


/* ============================================
   START MATCH
============================================ */

startMatchBtn.addEventListener("click", () => {

    if (selectedMode === "501") {

        gameMode = "legs";

    } else if (selectedMode === "sets") {

        gameMode = "sets";
    }


    legsPerSet =
        parseInt(legsPerSetInput.value) || 3;

    setsToWin =
        parseInt(setsToWinInput.value) || 3;

    startingScore =
        parseInt(startingScoreInput.value) || 501;


    resetMatch();


    setupScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");


    select501ScoringMethod("tap");

    updateDisplay();
});


/* ============================================
   RESET 501 MATCH
============================================ */

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

            : `Sets + Legs - ${legsPerSet} legs per set - First to ${setsToWin} sets`;
}


/* ============================================
   501 SCORING METHOD
============================================ */

methodButtons.forEach(button => {

    button.addEventListener("click", () => {

        select501ScoringMethod(
            button.dataset.method
        );
    });
});


function select501ScoringMethod(method) {

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

        stopMainCamera();

    } else if (method === "manual") {

        manualScoringSection.classList.remove(
            "hidden"
        );

        stopMainCamera();

    } else if (method === "camera") {

        cameraScoringSection.classList.remove(
            "hidden"
        );
    }
}


/* ============================================
   CREATE 501 DART BUTTONS
============================================ */

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

        double.dataset.score = i * 2;

        double.textContent = "D" + i;

        doubles.appendChild(double);


        const treble =
            document.createElement("button");

        treble.className =
            "segment btn-score";

        treble.dataset.score = i * 3;

        treble.textContent = "T" + i;

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

                    const score =
                        parseInt(
                            button.dataset.score
                        );

                    handleDart501(score);
                }
            );
        });
}


createButtons501();


/* ============================================
   HANDLE 501 DART
============================================ */

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

        } else if (p1Score === 0) {

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

        } else if (p2Score === 0) {

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


/* ============================================
   MANUAL VISIT
============================================ */

submitScoreBtn.addEventListener(
    "click",
    () => {

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
    }
);


scoreInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            submitScoreBtn.click();
        }
    }
);


/* ============================================
   END TURN
============================================ */

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


/* ============================================
   LEG / SET WIN
============================================ */

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


    p1Score = startingScore;
    p2Score = startingScore;

    dartsLeft = 3;


    currentPlayer =
        player === 1
            ? 2
            : 1;
}


/* ============================================
   UPDATE 501 DISPLAY
============================================ */

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


    updateTurnHighlight();

    updateCheckoutSuggestion();
}


/* ============================================
   ACTIVE PLAYER
============================================ */

function updateTurnHighlight() {

    if (currentPlayer === 1) {

        p1Box.classList.add("active");

        p2Box.classList.remove("active");

    } else {

        p2Box.classList.add("active");

        p1Box.classList.remove("active");
    }
}


/* ============================================
   CHECKOUT
============================================ */

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


    switch (score) {

        case 170:
            return "T20, T20, Bull";

        case 167:
            return "T20, T19, Bull";

        case 164:
            return "T20, T18, Bull";

        case 161:
            return "T20, T17, Bull";

        case 160:
            return "T20, T20, D20";

        case 158:
            return "T20, T20, D19";

        case 157:
            return "T20, T19, D20";

        case 156:
            return "T20, T20, D18";

        case 155:
            return "T20, T19, D19";

        case 154:
            return "T20, T18, D20";

        case 153:
            return "T20, T19, D18";

        case 152:
            return "T20, T20, D16";

        case 151:
            return "T20, T17, D20";

        case 150:
            return "T20, T18, D18";

        case 149:
            return "T20, T19, D16";

        case 148:
            return "T20, T16, D20";

        case 147:
            return "T20, T17, D18";

        case 146:
            return "T20, T18, D16";

        case 145:
            return "T20, T15, D20";

        case 144:
            return "T20, T20, D12";

        case 141:
            return "T20, T19, D12";

        case 140:
            return "T20, T20, D10";

        case 121:
            return "T20, T11, D14";

        case 120:
            return "T20, 20, D20";

        case 100:
            return "T20, D20";

        case 80:
            return "T20, D10";

        case 40:
            return "D20";

        case 32:
            return "D16";

        case 24:
            return "D12";

        case 16:
            return "D8";

        default:
            return "Standard route";
    }
}


updateDisplay();


/* ============================================
   CAMERA SUPPORT
============================================ */

function cameraSupported() {

    return !!(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
    );
}


/* ============================================
   START MAIN CAMERA
============================================ */

startCameraBtn.addEventListener(
    "click",
    async () => {

        stopMainCamera();


        if (!cameraSupported()) {

            setCameraStatus(
                cameraStatus,
                "Camera access is not supported in this browser or the page is not using a secure connection.",
                "error"
            );

            return;
        }


        try {

            setCameraStatus(
                cameraStatus,
                "Starting camera...",
                ""
            );


            mainCameraStream =
                await navigator.mediaDevices
                    .getUserMedia({

                        audio: false,

                        video: {
                            facingMode: {
                                ideal: "environment"
                            },

                            width: {
                                ideal: 1920
                            },

                            height: {
                                ideal: 1080
                            }
                        }
                    });


            cameraVideo.srcObject =
                mainCameraStream;


            cameraVideo.classList.add(
                "camera-running"
            );


            cameraPlaceholder.classList.add(
                "hidden"
            );


            startCameraBtn.disabled =
                true;


            stopCameraBtn.disabled =
                false;


            setCameraStatus(
                cameraStatus,
                "Camera running",
                "success"
            );

        } catch (error) {

            console.error(
                "Camera error:",
                error
            );


            let message =
                "Could not start the camera.";


            if (
                error.name ===
                "NotAllowedError"
            ) {

                message =
                    "Camera permission was denied.";

            } else if (
                error.name ===
                "NotFoundError"
            ) {

                message =
                    "No camera was found.";

            } else if (
                error.name ===
                "NotReadableError"
            ) {

                message =
                    "The camera is already being used by another app.";

            } else if (
                error.name ===
                "SecurityError"
            ) {

                message =
                    "The browser blocked camera access.";
            }


            setCameraStatus(
                cameraStatus,
                message,
                "error"
            );
        }
    }
);


/* ============================================
   STOP MAIN CAMERA
============================================ */

stopCameraBtn.addEventListener(
    "click",
    () => {

        stopMainCamera();
    }
);


function stopMainCamera() {

    if (mainCameraStream) {

        mainCameraStream
            .getTracks()
            .forEach(track => {

                track.stop();
            });


        mainCameraStream = null;
    }


    cameraVideo.srcObject = null;


    cameraVideo.classList.remove(
        "camera-running"
    );


    cameraPlaceholder.classList.remove(
        "hidden"
    );


    startCameraBtn.disabled = false;

    stopCameraBtn.disabled = true;


    setCameraStatus(
        cameraStatus,
        "Camera ready to start",
        ""
    );
}


/* ============================================
   CAMERA STATUS
============================================ */

function setCameraStatus(
    element,
    message,
    type
) {

    element.textContent = message;


    element.classList.remove(
        "camera-success",
        "camera-error"
    );


    if (type === "success") {

        element.classList.add(
            "camera-success"
        );

    } else if (type === "error") {

        element.classList.add(
            "camera-error"
        );
    }
}


/* ============================================
   CRICKET MODE
============================================ */

let cricketInnings = 1;

let cricketTotalWickets = 11;

let cricketRuns = 0;

let cricketWicketsLost = 0;

let cricketNextWicket = 1;

let cricketTarget = null;

let cricketDartsLeft = 3;

let cricketPhase = "bowling";


/* ============================================
   CRICKET SCORING METHOD
============================================ */

cricketMethodButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            selectCricketScoringMethod(
                button.dataset.method
            );
        }
    );
});


function selectCricketScoringMethod(method) {

    cricketMethodButtons.forEach(
        button => {

            button.classList.toggle(
                "active-method",
                button.dataset.method === method
            );
        }
    );


    cricketTapSection.classList.add(
        "hidden"
    );

    cricketCameraSection.classList.add(
        "hidden"
    );


    if (method === "tap") {

        cricketTapSection.classList.remove(
            "hidden"
        );

        stopCricketCamera();

    } else if (
        method === "camera"
    ) {

        cricketCameraSection.classList.remove(
            "hidden"
        );
    }
}


/* ============================================
   CREATE CRICKET BUTTONS
============================================ */

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
        bowlSingles.children.length === 0
    ) {

        for (let i = 1; i <= 20; i++) {

            const bowlSingle =
                document.createElement("button");

            bowlSingle.className =
                "segment btn-score";

            bowlSingle.dataset.base = i;

            bowlSingle.dataset.mult = 1;

            bowlSingle.dataset.role =
                "bowl";

            bowlSingle.textContent = i;

            bowlSingles.appendChild(
                bowlSingle
            );


            const bowlDouble =
                document.createElement("button");

            bowlDouble.className =
                "segment btn-score";

            bowlDouble.dataset.base = i;

            bowlDouble.dataset.mult = 2;

            bowlDouble.dataset.role =
                "bowl";

            bowlDouble.textContent =
                "D" + i;

            bowlDoubles.appendChild(
                bowlDouble
            );


            const bowlTreble =
                document.createElement("button");

            bowlTreble.className =
                "segment btn-score";

            bowlTreble.dataset.base = i;

            bowlTreble.dataset.mult = 3;

            bowlTreble.dataset.role =
                "bowl";

            bowlTreble.textContent =
                "T" + i;

            bowlTrebles.appendChild(
                bowlTreble
            );


            const batSingle =
                document.createElement("button");

            batSingle.className =
                "segment btn-score";

            batSingle.dataset.base = i;

            batSingle.dataset.mult = 1;

            batSingle.dataset.role =
                "bat";

            batSingle.dataset.score =
                i;

            batSingle.textContent = i;

            batSingles.appendChild(
                batSingle
            );


            const batDouble =
                document.createElement("button");

            batDouble.className =
                "segment btn-score";

            batDouble.dataset.base = i;

            batDouble.dataset.mult = 2;

            batDouble.dataset.role =
                "bat";

            batDouble.dataset.score =
                i * 2;

            batDouble.textContent =
                "D" + i;

            batDoubles.appendChild(
                batDouble
            );


            const batTreble =
                document.createElement("button");

            batTreble.className =
                "segment btn-score";

            batTreble.dataset.base = i;

            batTreble.dataset.mult = 3;

            batTreble.dataset.role =
                "bat";

            batTreble.dataset.score =
                i * 3;

            batTreble.textContent =
                "T" + i;

            batTrebles.appendChild(
                batTreble
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

                        const base =
                            parseInt(
                                button.dataset.base
                            );

                        const mult =
                            parseInt(
                                button.dataset.mult
                            );

                        const score =
                            button.dataset.score

                                ? parseInt(
                                    button.dataset.score
                                )

                                : null;


                        handleCricketDart(
                            role,
                            base,
                            mult,
                            score
                        );
                    }
                );
            });
    }
}


/* ============================================
   RESET CRICKET
============================================ */

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

    cricketPhase = "bowling";


    selectCricketScoringMethod(
        "tap"
    );


    updateCricketDisplay();
}


cricketStartMatchBtn.addEventListener(
    "click",
    () => {

        resetCricketMatch();
    }
);


/* ============================================
   DECLARE
============================================ */

cricketDeclareBtn.addEventListener(
    "click",
    () => {

        if (cricketInnings === 1) {

            cricketTarget =
                cricketRuns + 1;


            cricketInnings = 2;


            const teamAName =
                cricketTeamA.textContent;

            const teamBName =
                cricketTeamB.textContent;


            cricketBattingName.textContent =
                teamAName;

            cricketBowlingName.textContent =
                teamBName;


            cricketRuns = 0;

            cricketWicketsLost = 0;

            cricketNextWicket = 1;

            cricketDartsLeft = 3;

            cricketPhase = "bowling";


            alert(
                `Innings declared at ${cricketTarget - 1} runs.\n\nTarget: ${cricketTarget}`
            );

        } else {

            alert(
                `Second innings declared at ${cricketRuns} runs.`
            );
        }


        updateCricketDisplay();
    }
);


/* ============================================
   MISS SCORING ZONE
============================================ */

cricketMissBoardBtn.addEventListener(
    "click",
    () => {

        if (
            cricketPhase !==
            "batting"
        ) {

            return;
        }


        cricketRuns += 1;

        cricketDartsLeft--;


        if (
            cricketDartsLeft <= 0
        ) {

            cricketPhase =
                "bowling";

            cricketDartsLeft = 3;
        }


        checkCricketWinOrEnd();

        updateCricketDisplay();
    }
);


/* ============================================
   FALL OUT
============================================ */

cricketFallOutBtn.addEventListener(
    "click",
    () => {

        if (
            cricketPhase !==
            "batting"
        ) {

            return;
        }


        cricketRuns += 1;


        /*
        Extra dart means the dart is replayed,
        so darts left does NOT reduce.
        */


        updateCricketDisplay();
    }
);


/* ============================================
   BACK TO MENU
============================================ */

cricketBackBtn.addEventListener(
    "click",
    () => {

        stopCricketCamera();


        cricketScreen.classList.add(
            "hidden"
        );


        modeScreen.classList.remove(
            "hidden"
        );
    }
);


/* ============================================
   HANDLE CRICKET DART
============================================ */

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


    /* BOWLING */

    if (role === "bowl") {

        if (
            base === cricketNextWicket
        ) {

            let wicketsTaken =
                mult;


            let remainingWickets =
                cricketTotalWickets -
                cricketWicketsLost;


            if (
                wicketsTaken >
                remainingWickets
            ) {

                wicketsTaken =
                    remainingWickets;
            }


            cricketWicketsLost +=
                wicketsTaken;


            cricketNextWicket +=
                wicketsTaken;


            if (
                cricketNextWicket >
                cricketTotalWickets
            ) {

                cricketNextWicket =
                    cricketTotalWickets;
            }
        }


        cricketDartsLeft--;


        if (
            cricketDartsLeft <= 0
        ) {

            cricketPhase =
                "batting";

            cricketDartsLeft = 3;
        }


    /* BATTING */

    } else if (
        role === "bat"
    ) {

        if (
            base === cricketNextWicket
        ) {

            let wicketsTaken =
                mult;


            let remainingWickets =
                cricketTotalWickets -
                cricketWicketsLost;


            if (
                wicketsTaken >
                remainingWickets
            ) {

                wicketsTaken =
                    remainingWickets;
            }


            cricketWicketsLost +=
                wicketsTaken;


            cricketNextWicket +=
                wicketsTaken;


            if (
                cricketNextWicket >
                cricketTotalWickets
            ) {

                cricketNextWicket =
                    cricketTotalWickets;
            }

        } else {

            cricketRuns +=
                score || 0;
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


    checkCricketWinOrEnd();

    updateCricketDisplay();
}


/* ============================================
   CHECK CRICKET RESULT
============================================ */

function checkCricketWinOrEnd() {

    if (
        cricketWicketsLost >=
        cricketTotalWickets
    ) {

        if (cricketInnings === 1) {

            cricketTarget =
                cricketRuns + 1;


            cricketInnings = 2;


            const teamAName =
                cricketTeamA.textContent;

            const teamBName =
                cricketTeamB.textContent;


            cricketBattingName.textContent =
                teamAName;

            cricketBowlingName.textContent =
                teamBName;


            cricketRuns = 0;

            cricketWicketsLost = 0;

            cricketNextWicket = 1;

            cricketDartsLeft = 3;

            cricketPhase =
                "bowling";


            alert(
                `All wickets down.\n\nFirst innings: ${cricketTarget - 1}\nTarget: ${cricketTarget}`
            );

        } else {

            if (
                cricketTarget === null
            ) {

                alert(
                    `Second innings all out at ${cricketRuns}.`
                );

            } else if (
                cricketRuns >=
                cricketTarget
            ) {

                alert(
                    `${cricketBattingName.textContent} wins with ${cricketRuns} runs!`
                );

            } else {

                alert(
                    `${cricketBowlingName.textContent} wins!\n\n${cricketBattingName.textContent} all out for ${cricketRuns}.\nTarget was ${cricketTarget}.`
                );
            }
        }
    }


    if (
        cricketInnings === 2 &&
        cricketTarget !== null &&
        cricketRuns >= cricketTarget
    ) {

        alert(
            `${cricketBattingName.textContent} wins!\n\nTarget ${cricketTarget} reached.`
        );
    }
}


/* ============================================
   UPDATE CRICKET DISPLAY
============================================ */

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


/* ============================================
   CRICKET CAMERA
============================================ */

cricketStartCameraBtn.addEventListener(
    "click",
    async () => {

        stopCricketCamera();


        if (!cameraSupported()) {

            setCameraStatus(
                cricketCameraStatus,
                "Camera access is not supported in this browser or the page is not using a secure connection.",
                "error"
            );

            return;
        }


        try {

            setCameraStatus(
                cricketCameraStatus,
                "Starting camera...",
                ""
            );


            cricketCameraStream =
                await navigator.mediaDevices
                    .getUserMedia({

                        audio: false,

                        video: {

                            facingMode: {
                                ideal: "environment"
                            },

                            width: {
                                ideal: 1920
                            },

                            height: {
                                ideal: 1080
                            }
                        }
                    });


            cricketCameraVideo.srcObject =
                cricketCameraStream;


            cricketCameraVideo.classList.add(
                "camera-running"
            );


            cricketCameraPlaceholder.classList.add(
                "hidden"
            );


            cricketStartCameraBtn.disabled =
                true;


            cricketStopCameraBtn.disabled =
                false;


            setCameraStatus(
                cricketCameraStatus,
                "Camera running",
                "success"
            );

        } catch (error) {

            console.error(
                "Cricket camera error:",
                error
            );


            let message =
                "Could not start the camera.";


            if (
                error.name ===
                "NotAllowedError"
            ) {

                message =
                    "Camera permission was denied.";

            } else if (
                error.name ===
                "NotFoundError"
            ) {

                message =
                    "No camera was found.";

            } else if (
                error.name ===
                "NotReadableError"
            ) {

                message =
                    "The camera is already being used by another app.";

            } else if (
                error.name ===
                "SecurityError"
            ) {

                message =
                    "The browser blocked camera access.";
            }


            setCameraStatus(
                cricketCameraStatus,
                message,
                "error"
            );
        }
    }
);


cricketStopCameraBtn.addEventListener(
    "click",
    () => {

        stopCricketCamera();
    }
);


function stopCricketCamera() {

    if (cricketCameraStream) {

        cricketCameraStream
            .getTracks()
            .forEach(track => {

                track.stop();
            });


        cricketCameraStream = null;
    }


    cricketCameraVideo.srcObject =
        null;


    cricketCameraVideo.classList.remove(
        "camera-running"
    );


    cricketCameraPlaceholder.classList.remove(
        "hidden"
    );


    cricketStartCameraBtn.disabled =
        false;


    cricketStopCameraBtn.disabled =
        true;


    setCameraStatus(
        cricketCameraStatus,
        "Camera ready to start",
        ""
    );
}


/* ============================================
   STOP ALL CAMERAS
============================================ */

function stopAllCameras() {

    stopMainCamera();

    stopCricketCamera();
}


/* ============================================
   STOP CAMERA WHEN PAGE CLOSES
============================================ */

window.addEventListener(
    "beforeunload",
    () => {

        stopAllCameras();
    }
);