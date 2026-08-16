"use strict";


/* =========================================================
   DART HUB
   LIVE MATCH / SECOND SCREEN
   VERSION 25
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const V25_LIVE_HOST_KEY =
    "dart-hub-live-host-v25";


/* =========================================================
   STATE
========================================================= */

let v25HostMatch =
    null;


let v25HostLastSignature =
    "";


let v25HostMonitorTimer =
    null;


let v25WatchChannel =
    null;


let v25WatchMatch =
    null;


let v25WatchFallbackTimer =
    null;


/* =========================================================
   ESCAPE
========================================================= */

function v25Escape(
    value
) {

    return String(
        value ??
        ""
    )
        .replace(

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
   VISIBLE?
========================================================= */

function v25Visible(
    element
) {

    return (

        element &&
        !element.classList.contains(
            "hidden"
        )
    );
}


/* =========================================================
   READ TEXT
========================================================= */

function v25Text(
    id
) {

    const element =
        document.getElementById(
            id
        );


    return element
        ? element.textContent.trim()
        : "";
}


/* =========================================================
   CAPTURE NORMAL MATCH STATE
========================================================= */

function v25CaptureDartsState() {

    const gameScreen =
        document.getElementById(
            "game-screen"
        );


    if (
        !v25Visible(
            gameScreen
        )
    ) {

        return null;
    }


    const p1Active =
        document
            .getElementById(
                "p1-box"
            )
            ?.classList
            .contains(
                "active"
            );


    const p2Active =
        document
            .getElementById(
                "p2-box"
            )
            ?.classList
            .contains(
                "active"
            );


    const modeText =
        v25Text(
            "mode-label"
        );


    const mode =

        modeText.includes(
            "Sets"
        )

            ? "Sets + Legs"

            : "Legs";


    return {

        mode,

        type:
            "darts",

        player1: {

            name:
                v25Text(
                    "p1-name"
                ),

            score:
                v25Text(
                    "p1-score"
                ),

            legs:
                v25Text(
                    "p1-legs"
                ),

            sets:
                v25Text(
                    "p1-sets"
                ),

            active:
                Boolean(
                    p1Active
                )
        },


        player2: {

            name:
                v25Text(
                    "p2-name"
                ),

            score:
                v25Text(
                    "p2-score"
                ),

            legs:
                v25Text(
                    "p2-legs"
                ),

            sets:
                v25Text(
                    "p2-sets"
                ),

            active:
                Boolean(
                    p2Active
                )
        },


        matchInfo: {

            mode:
                modeText,

            legSet:
                v25Text(
                    "leg-set-status"
                ),

            darts:
                v25Text(
                    "darts-status"
                )
        },


        checkout:
            v25Text(
                "checkout-text"
            ),


        currentVisit:
            v25Text(
                "caller-current-visit"
            ),


        player1Last:
            v25Text(
                "caller-p1-last"
            ),


        player2Last:
            v25Text(
                "caller-p2-last"
            ),


        finished:
            !document
                .getElementById(
                    "match-finished-banner"
                )
                ?.classList
                .contains(
                    "hidden"
                ),


        finishedText:
            v25Text(
                "match-finished-banner"
            )
    };
}


/* =========================================================
   CAPTURE CRICKET STATE
========================================================= */

function v25CaptureCricketState() {

    const cricketScreen =
        document.getElementById(
            "cricket-screen"
        );


    if (
        !v25Visible(
            cricketScreen
        )
    ) {

        return null;
    }


    return {

        mode:
            "Cricket",

        type:
            "cricket",

        teamA:
            v25Text(
                "cricket-team-a"
            ),

        teamB:
            v25Text(
                "cricket-team-b"
            ),

        batting:
            v25Text(
                "cricket-batting-name"
            ),

        bowling:
            v25Text(
                "cricket-bowling-name"
            ),

        runs:
            v25Text(
                "cricket-runs"
            ),

        wickets:
            v25Text(
                "cricket-wickets"
            ),

        innings:
            v25Text(
                "cricket-innings"
            ),

        totalWickets:
            document
                .getElementById(
                    "cricket-total-wickets"
                )
                ?.value
                ||
                "",

        nextWicket:
            v25Text(
                "cricket-danger"
            ),

        target:
            v25Text(
                "cricket-target"
            ),

        phase:
            v25Text(
                "cricket-phase"
            ),

        dartsLeft:
            v25Text(
                "cricket-darts-left"
            ),

        finished:

            typeof cricketFinished !==
                "undefined"

                ? Boolean(
                    cricketFinished
                )

                : false
    };
}


/* =========================================================
   CAPTURE CURRENT SCORE
========================================================= */

function v25CaptureState() {

    return (

        v25CaptureDartsState()

        ||

        v25CaptureCricketState()
    );
}


/* =========================================================
   INSTALL STYLES
========================================================= */

function v25InstallStyles() {

    if (
        document.getElementById(
            "dart-hub-v25-style"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "dart-hub-v25-style";


    style.textContent = `

        .v25-live-button {

            width: 100%;

            min-height: 48px;

            border: none;

            border-radius: 8px;

            background:
                linear-gradient(
                    135deg,
                    #7439c6,
                    #47217e
                );

            color: white;

            font-weight: 900;

            cursor: pointer;
        }


        .v25-live-button.live {

            background:
                linear-gradient(
                    135deg,
                    #008b57,
                    #005e3a
                );
        }


        .v25-host-card {

            max-width: 700px;

            margin:
                8px auto;

            padding: 10px;

            border:
                1px solid #4d3d66;

            border-radius: 10px;

            background: #15101d;

            text-align: center;
        }


        .v25-host-card.hidden {

            display: none !important;
        }


        .v25-host-code-label {

            color: #9887ac;

            font-size: 10px;

            text-transform: uppercase;

            letter-spacing: 1px;
        }


        .v25-host-code {

            margin-top: 2px;

            color: #c597ff;

            font-size: 30px;

            font-weight: 1000;

            letter-spacing: 5px;
        }


        .v25-host-help {

            margin-top: 4px;

            color: #887b95;

            font-size: 11px;
        }


        .v25-host-stop {

            margin-top: 8px;

            min-height: 38px;

            padding: 6px 13px;

            border: none;

            border-radius: 7px;

            background: #732525;

            color: white;

            font-weight: 800;

            cursor: pointer;
        }


        .v25-live-screen {

            position: fixed;

            inset: 0;

            z-index: 19000;

            overflow-y: auto;

            background:
                radial-gradient(
                    circle at top,
                    #172b39,
                    #05090b 50%,
                    #020303 100%
                );

            color: white;
        }


        .v25-live-screen.hidden {

            display: none !important;
        }


        .v25-live-page {

            width:
                min(
                    1000px,
                    calc(100% - 16px)
                );

            margin: auto;

            padding:
                12px 0 40px;
        }


        .v25-live-header {

            display: grid;

            grid-template-columns:
                auto
                1fr;

            align-items: center;

            gap: 10px;

            margin-bottom: 12px;
        }


        .v25-back {

            min-height: 42px;

            padding: 7px 11px;

            border:
                1px solid #354952;

            border-radius: 8px;

            background: #111a1e;

            color: white;

            font-weight: 800;

            cursor: pointer;
        }


        .v25-title {

            color: #00aaff;

            font-size: 21px;

            font-weight: 1000;

            letter-spacing: 1px;
        }


        .v25-watch-join {

            max-width: 500px;

            margin: 20px auto;

            padding: 17px;

            border:
                1px solid #33444d;

            border-radius: 12px;

            background: #0d1316;
        }


        .v25-watch-join h2 {

            margin-top: 0;

            color: #00aaff;
        }


        .v25-code-row {

            display: grid;

            grid-template-columns:
                1fr auto;

            gap: 7px;
        }


        .v25-code-input {

            min-width: 0;

            min-height: 52px;

            padding: 10px;

            border:
                1px solid #4d5960;

            border-radius: 8px;

            outline: none;

            background: #050708;

            color: white;

            font-size: 22px;

            font-weight: 900;

            text-align: center;

            text-transform: uppercase;

            letter-spacing: 4px;
        }


        .v25-join-button {

            min-height: 52px;

            padding: 8px 16px;

            border: none;

            border-radius: 8px;

            background:
                linear-gradient(
                    135deg,
                    #008bd0,
                    #005d91
                );

            color: white;

            font-weight: 900;

            cursor: pointer;
        }


        .v25-watch-status {

            margin-top: 8px;

            color: #8fa0a8;

            font-size: 12px;
        }


        .v25-scoreboard {

            margin-top: 8px;
        }


        .v25-scoreboard.hidden {

            display: none !important;
        }


        .v25-live-top {

            display: flex;

            justify-content: space-between;

            align-items: center;

            gap: 10px;

            padding: 10px;

            border:
                1px solid #283a43;

            border-radius: 9px;

            background: #090e11;
        }


        .v25-live-mode {

            color: #00aaff;

            font-size: 17px;

            font-weight: 1000;
        }


        .v25-connection {

            color: #67ffb6;

            font-size: 11px;

            font-weight: 800;
        }


        .v25-live-players {

            display: grid;

            grid-template-columns:
                repeat(
                    2,
                    1fr
                );

            gap: 7px;

            margin-top: 7px;
        }


        .v25-live-player {

            padding: 16px;

            border:
                2px solid #29363c;

            border-radius: 11px;

            background:
                linear-gradient(
                    145deg,
                    #13191c,
                    #080b0d
                );

            text-align: center;
        }


        .v25-live-player.active {

            border-color: #00aaff;

            box-shadow:
                0 0 20px
                rgba(
                    0,
                    170,
                    255,
                    .3
                );
        }


        .v25-live-name {

            overflow-wrap: anywhere;

            font-size:
                clamp(
                    21px,
                    4vw,
                    42px
                );

            font-weight: 1000;

            text-transform: uppercase;
        }


        .v25-live-score {

            margin: 5px 0;

            color: #00aaff;

            font-size:
                clamp(
                    70px,
                    15vw,
                    170px
                );

            line-height: 1;

            font-weight: 1000;

            text-shadow:
                0 0 20px
                rgba(
                    0,
                    170,
                    255,
                    .45
                );
        }


        .v25-live-details {

            color: #9cabb1;

            font-size:
                clamp(
                    12px,
                    2vw,
                    20px
                );
        }


        .v25-live-centre {

            margin-top: 7px;

            padding: 15px;

            border:
                1px solid #283a43;

            border-radius: 10px;

            background: #070b0d;

            text-align: center;
        }


        .v25-checkout {

            color: #00ff9d;

            font-size:
                clamp(
                    18px,
                    3vw,
                    34px
                );

            font-weight: 1000;
        }


        .v25-current-visit {

            margin-top: 7px;

            color: #9dacb3;

            font-size: 14px;
        }


        .v25-cricket-main {

            display: grid;

            grid-template-columns:
                repeat(
                    2,
                    1fr
                );

            gap: 8px;

            margin-top: 8px;
        }


        .v25-cricket-stat {

            padding: 14px;

            border:
                1px solid #293a42;

            border-radius: 10px;

            background: #0d1316;

            text-align: center;
        }


        .v25-cricket-stat span {

            display: block;

            color: #82949c;

            font-size: 11px;

            text-transform: uppercase;
        }


        .v25-cricket-stat strong {

            display: block;

            margin-top: 3px;

            color: #00ff94;

            font-size:
                clamp(
                    40px,
                    9vw,
                    95px
                );

            line-height: 1;

            font-weight: 1000;
        }


        .v25-cricket-stat.wickets strong {

            color: #ff6060;
        }


        .v25-cricket-info {

            margin-top: 8px;

            padding: 12px;

            border:
                1px solid #293a42;

            border-radius: 10px;

            background: #090e11;
        }


        .v25-cricket-row {

            display: flex;

            justify-content: space-between;

            gap: 10px;

            padding: 6px 0;

            border-bottom:
                1px solid #202b30;
        }


        .v25-match-ended {

            margin-top: 8px;

            padding: 12px;

            border:
                2px solid #00ff8d;

            border-radius: 9px;

            background: #0b2a1d;

            color: #00ff9d;

            font-size: 20px;

            font-weight: 1000;

            text-align: center;
        }


        @media (
            max-width:650px
        ) {

            .v25-code-row {

                grid-template-columns:
                    1fr;
            }


            .v25-live-players {

                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );
            }


            .v25-live-player {

                padding:
                    10px 4px;
            }


            .v25-live-name {

                font-size: 16px;
            }


            .v25-live-score {

                font-size: 55px;
            }

        }

    `;


    document.head.appendChild(
        style
    );
}


/* =========================================================
   INSTALL HOME BUTTON
========================================================= */

function v25InstallHomeButton() {

    const modeButtons =
        document.querySelector(
            "#mode-screen .mode-buttons"
        );


    if (
        !modeButtons ||
        document.getElementById(
            "v25-watch-home-btn"
        )
    ) {

        return;
    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "v25-watch-home-btn";


    button.className =
        "btn-secondary";


    button.type =
        "button";


    button.innerHTML =
        "👀 Watch Live Match";


    button.onclick =
        v25OpenWatchPage;


    modeButtons.appendChild(
        button
    );
}


/* =========================================================
   INSTALL HOST BUTTONS
========================================================= */

function v25InstallHostButtons() {

    /*
       LEGS / SETS
    */

    const toolbar =
        document.querySelector(
            "#game-screen .enhanced-toolbar"
        );


    if (
        toolbar &&
        !document.getElementById(
            "v25-live-normal-btn"
        )
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "card";


        card.innerHTML = `

            <button
                id="v25-live-normal-btn"
                class="v25-live-button"
                type="button"
            >
                📡 Start Live Score
            </button>

        `;


        toolbar.insertAdjacentElement(
            "afterend",
            card
        );


        document
            .getElementById(
                "v25-live-normal-btn"
            )
            .onclick =
                v25ToggleHost;
    }


    /*
       CRICKET
    */

    const cricketControls =
        document.querySelector(
            "#cricket-screen .cricket-controls"
        );


    if (
        cricketControls &&
        !document.getElementById(
            "v25-live-cricket-btn"
        )
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.id =
            "v25-live-cricket-btn";


        button.className =
            "v25-live-button";


        button.type =
            "button";


        button.innerHTML =
            "📡 Start Live Score";


        button.onclick =
            v25ToggleHost;


        cricketControls.appendChild(
            button
        );
    }


    v25InstallHostBanner();
}


/* =========================================================
   HOST BANNER
========================================================= */

function v25InstallHostBanner() {

    if (
        document.getElementById(
            "v25-host-card"
        )
    ) {

        return;
    }


    const card =
        document.createElement(
            "div"
        );


    card.id =
        "v25-host-card";


    card.className =
        "v25-host-card hidden";


    card.innerHTML = `

        <div class="v25-host-code-label">

            Live Match Code

        </div>


        <div
            id="v25-host-code"
            class="v25-host-code"
        >
            ------
        </div>


        <div class="v25-host-help">

            Open Dart Hub on another device,
            choose Watch Live Match and enter this code.

        </div>


        <button
            id="v25-stop-live-btn"
            class="v25-host-stop"
            type="button"
        >
            Stop Live Score
        </button>

    `;


    document.body.appendChild(
        card
    );


    document
        .getElementById(
            "v25-stop-live-btn"
        )
        .onclick =
            v25StopHosting;
}


/* =========================================================
   UPDATE HOST BUTTONS
========================================================= */

function v25UpdateHostButtons() {

    [

        "v25-live-normal-btn",

        "v25-live-cricket-btn"

    ].forEach(
        id => {

            const button =
                document.getElementById(
                    id
                );


            if (
                !button
            ) {

                return;
            }


            button.classList.toggle(
                "live",
                Boolean(
                    v25HostMatch
                )
            );


            button.innerHTML =

                v25HostMatch

                    ? "📡 Live Score: ON"

                    : "📡 Start Live Score";
        }
    );


    const card =
        document.getElementById(
            "v25-host-card"
        );


    if (
        card
    ) {

        card.classList.toggle(
            "hidden",
            !v25HostMatch
        );
    }


    const code =
        document.getElementById(
            "v25-host-code"
        );


    if (
        code
    ) {

        code.textContent =

            v25HostMatch

                ? v25HostMatch.join_code

                : "------";
    }
}


/* =========================================================
   START / STOP HOSTING
========================================================= */

async function v25ToggleHost() {

    if (
        v25HostMatch
    ) {

        v25StopHosting();


        return;
    }


    await v25StartHosting();
}


async function v25StartHosting() {

    const state =
        v25CaptureState();


    if (
        !state
    ) {

        alert(
            "Start a Legs, Sets + Legs or Cricket match first."
        );


        return;
    }


    try {

        const {
            data,
            error
        } =
            await dartHubSupabase
                .rpc(
                    "create_dart_hub_live_match"
                );


        if (
            error
        ) {

            throw error;
        }


        v25HostMatch = {

            id:
                data.id,

            join_code:
                data.join_code,

            host_name:
                data.host_name
        };


        localStorage.setItem(

            V25_LIVE_HOST_KEY,

            JSON.stringify(
                v25HostMatch
            )
        );


        v25HostLastSignature =
            "";


        v25UpdateHostButtons();


        await v25PushHostState(
            true
        );


        v25StartHostMonitor();


    } catch (
        error
    ) {

        console.error(
            "Start live match:",
            error
        );


        alert(
            "Dart Hub could not start the live score."
        );
    }
}


/* =========================================================
   STOP HOSTING
========================================================= */

async function v25StopHosting() {

    if (
        !v25HostMatch
    ) {

        return;
    }


    const oldMatch =
        v25HostMatch;


    v25HostMatch =
        null;


    localStorage.removeItem(
        V25_LIVE_HOST_KEY
    );


    if (
        v25HostMonitorTimer
    ) {

        clearInterval(
            v25HostMonitorTimer
        );


        v25HostMonitorTimer =
            null;
    }


    v25UpdateHostButtons();


    try {

        await dartHubSupabase

            .from(
                "live_matches"
            )

            .update({

                status:
                    "ended",

                updated_at:
                    new Date()
                        .toISOString()
            })

            .eq(
                "id",
                oldMatch.id
            );


    } catch (
        error
    ) {

        console.warn(
            "Stop live match:",
            error
        );
    }
}


/* =========================================================
   HOST MONITOR
========================================================= */

function v25StartHostMonitor() {

    if (
        v25HostMonitorTimer
    ) {

        clearInterval(
            v25HostMonitorTimer
        );
    }


    v25HostMonitorTimer =
        setInterval(
            () => {

                v25PushHostState();

            },
            250
        );
}


/* =========================================================
   PUSH STATE
========================================================= */

async function v25PushHostState(
    force =
        false
) {

    if (
        !v25HostMatch
    ) {

        return;
    }


    const state =
        v25CaptureState();


    if (
        !state
    ) {

        return;
    }


    const signature =
        JSON.stringify(
            state
        );


    if (
        !force &&
        signature ===
        v25HostLastSignature
    ) {

        return;
    }


    v25HostLastSignature =
        signature;


    try {

        const {
            error
        } =
            await dartHubSupabase

                .from(
                    "live_matches"
                )

                .update({

                    game_mode:
                        state.mode,

                    state,

                    updated_at:
                        new Date()
                            .toISOString()
                })

                .eq(
                    "id",
                    v25HostMatch.id
                );


        if (
            error
        ) {

            throw error;
        }


    } catch (
        error
    ) {

        console.warn(
            "Live score update:",
            error
        );
    }
}


/* =========================================================
   RESTORE HOST SESSION
========================================================= */

async function v25RestoreHostSession() {

    const raw =
        localStorage.getItem(
            V25_LIVE_HOST_KEY
        );


    if (
        !raw
    ) {

        return;
    }


    try {

        const saved =
            JSON.parse(
                raw
            );


        const {
            data,
            error
        } =
            await dartHubSupabase

                .from(
                    "live_matches"
                )

                .select(
                    "id, join_code, host_name, status"
                )

                .eq(
                    "id",
                    saved.id
                )

                .maybeSingle();


        if (
            error ||
            !data ||
            data.status !==
            "live"
        ) {

            localStorage.removeItem(
                V25_LIVE_HOST_KEY
            );


            return;
        }


        v25HostMatch = {

            id:
                data.id,

            join_code:
                data.join_code,

            host_name:
                data.host_name
        };


        v25UpdateHostButtons();


        v25StartHostMonitor();


    } catch (
        error
    ) {

        console.warn(
            "Restore live match:",
            error
        );
    }
}


/* =========================================================
   WATCH PAGE
========================================================= */

function v25InstallWatchPage() {

    if (
        document.getElementById(
            "v25-watch-screen"
        )
    ) {

        return;
    }


    const screen =
        document.createElement(
            "div"
        );


    screen.id =
        "v25-watch-screen";


    screen.className =
        "v25-live-screen hidden";


    screen.innerHTML = `

        <div class="v25-live-page">

            <div class="v25-live-header">

                <button
                    id="v25-watch-back"
                    class="v25-back"
                    type="button"
                >
                    ← Dart Hub
                </button>


                <div class="v25-title">

                    👀 LIVE SCORE

                </div>

            </div>


            <div
                id="v25-watch-join"
                class="v25-watch-join"
            >

                <h2>
                    Watch a Match
                </h2>


                <p>

                    Enter the live match code
                    shown on the scoring device.

                </p>


                <div class="v25-code-row">

                    <input
                        id="v25-watch-code"
                        class="v25-code-input"
                        maxlength="6"
                        autocomplete="off"
                        placeholder="ABC123"
                    >


                    <button
                        id="v25-watch-join-btn"
                        class="v25-join-button"
                        type="button"
                    >
                        Watch
                    </button>

                </div>


                <div
                    id="v25-watch-status"
                    class="v25-watch-status"
                ></div>

            </div>


            <div
                id="v25-scoreboard"
                class="v25-scoreboard hidden"
            ></div>

        </div>
    `;


    document.body.appendChild(
        screen
    );


    document
        .getElementById(
            "v25-watch-back"
        )
        .onclick =
            v25CloseWatchPage;


    document
        .getElementById(
            "v25-watch-join-btn"
        )
        .onclick =
            v25JoinLiveMatch;


    document
        .getElementById(
            "v25-watch-code"
        )
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    v25JoinLiveMatch();
                }
            }
        );
}


/* =========================================================
   OPEN / CLOSE WATCH PAGE
========================================================= */

function v25OpenWatchPage() {

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
            "v25-watch-screen"
        )
        .classList.remove(
            "hidden"
        );
}


function v25CloseWatchPage() {

    v25StopWatching();


    document
        .getElementById(
            "v25-watch-screen"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "mode-screen"
        )
        .classList.remove(
            "hidden"
        );
}


/* =========================================================
   JOIN MATCH
========================================================= */

async function v25JoinLiveMatch() {

    const input =
        document.getElementById(
            "v25-watch-code"
        );


    const status =
        document.getElementById(
            "v25-watch-status"
        );


    const code =
        input.value
            .trim()
            .toUpperCase();


    if (
        code.length !==
        6
    ) {

        status.textContent =
            "Enter the 6-character match code.";


        return;
    }


    status.textContent =
        "Connecting…";


    try {

        const {
            data,
            error
        } =
            await dartHubSupabase
                .rpc(
                    "join_dart_hub_live_match",
                    {

                        p_join_code:
                            code
                    }
                );


        if (
            error
        ) {

            throw error;
        }


        v25WatchMatch = {

            id:
                data.id,

            join_code:
                data.join_code,

            host_name:
                data.host_name
        };


        status.textContent =
            `Connected to ${data.host_name}`;


        document
            .getElementById(
                "v25-watch-join"
            )
            .classList.add(
                "hidden"
            );


        document
            .getElementById(
                "v25-scoreboard"
            )
            .classList.remove(
                "hidden"
            );


        v25RenderWatchState(

            data.state ||
            {},

            data.status
        );


        v25SubscribeToLiveMatch(
            data.id
        );


        v25StartWatchFallback();


    } catch (
        error
    ) {

        console.error(
            "Join live match:",
            error
        );


        status.textContent =
            "Live match not found or no longer active.";
    }
}


/* =========================================================
   REALTIME SUBSCRIPTION
========================================================= */

function v25SubscribeToLiveMatch(
    matchID
) {

    v25StopWatchChannel();


    v25WatchChannel =
        dartHubSupabase

            .channel(
                `dart-hub-live-${matchID}`
            )

            .on(

                "postgres_changes",

                {

                    event:
                        "UPDATE",

                    schema:
                        "public",

                    table:
                        "live_matches",

                    filter:
                        `id=eq.${matchID}`
                },

                payload => {

                    const row =
                        payload.new;


                    v25RenderWatchState(

                        row.state ||
                        {},

                        row.status
                    );
                }
            )

            .subscribe(
                status => {

                    const element =
                        document.getElementById(
                            "v25-watch-status"
                        );


                    if (
                        !element
                    ) {

                        return;
                    }


                    if (
                        status ===
                        "SUBSCRIBED"
                    ) {

                        element.textContent =
                            "Live connection active";
                    }
                }
            );
}


/* =========================================================
   FALLBACK POLLING
========================================================= */

function v25StartWatchFallback() {

    if (
        v25WatchFallbackTimer
    ) {

        clearInterval(
            v25WatchFallbackTimer
        );
    }


    v25WatchFallbackTimer =
        setInterval(
            v25RefreshWatchedMatch,
            5000
        );
}


async function v25RefreshWatchedMatch() {

    if (
        !v25WatchMatch
    ) {

        return;
    }


    try {

        const {
            data
        } =
            await dartHubSupabase

                .from(
                    "live_matches"
                )

                .select(
                    "state, status"
                )

                .eq(
                    "id",
                    v25WatchMatch.id
                )

                .maybeSingle();


        if (
            data
        ) {

            v25RenderWatchState(

                data.state ||
                {},

                data.status
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
   STOP WATCHING
========================================================= */

function v25StopWatchChannel() {

    if (
        v25WatchChannel
    ) {

        dartHubSupabase
            .removeChannel(
                v25WatchChannel
            );


        v25WatchChannel =
            null;
    }
}


function v25StopWatching() {

    v25StopWatchChannel();


    if (
        v25WatchFallbackTimer
    ) {

        clearInterval(
            v25WatchFallbackTimer
        );


        v25WatchFallbackTimer =
            null;
    }


    v25WatchMatch =
        null;


    document
        .getElementById(
            "v25-watch-join"
        )
        ?.classList
        .remove(
            "hidden"
        );


    document
        .getElementById(
            "v25-scoreboard"
        )
        ?.classList
        .add(
            "hidden"
        );
}


/* =========================================================
   RENDER WATCH STATE
========================================================= */

function v25RenderWatchState(
    state,
    status
) {

    const container =
        document.getElementById(
            "v25-scoreboard"
        );


    if (
        !container
    ) {

        return;
    }


    if (
        !state ||
        !state.type
    ) {

        container.innerHTML = `

            <div class="v25-watch-join">

                Waiting for the scorer to start…

            </div>
        `;


        return;
    }


    if (
        state.type ===
        "cricket"
    ) {

        container.innerHTML =
            v25CricketScoreboardHTML(
                state,
                status
            );


        return;
    }


    container.innerHTML =
        v25DartsScoreboardHTML(
            state,
            status
        );
}


/* =========================================================
   DART SCOREBOARD
========================================================= */

function v25DartsScoreboardHTML(
    state,
    status
) {

    return `

        <div class="v25-live-top">

            <div class="v25-live-mode">

                ${v25Escape(
                    state.mode ||
                    "Legs"
                )}

            </div>


            <div class="v25-connection">

                ● LIVE

            </div>

        </div>


        <div class="v25-live-players">


            <div
                class="v25-live-player ${
                    state.player1?.active
                        ? "active"
                        : ""
                }"
            >

                <div class="v25-live-name">

                    ${v25Escape(
                        state.player1?.name ||
                        "Player 1"
                    )}

                </div>


                <div class="v25-live-score">

                    ${v25Escape(
                        state.player1?.score ||
                        "0"
                    )}

                </div>


                <div class="v25-live-details">

                    ${v25Escape(
                        state.player1?.legs ||
                        ""
                    )}

                    <br>

                    ${v25Escape(
                        state.player1?.sets ||
                        ""
                    )}

                </div>


                <div class="v25-current-visit">

                    ${v25Escape(
                        state.player1Last ||
                        ""
                    )}

                </div>

            </div>



            <div
                class="v25-live-player ${
                    state.player2?.active
                        ? "active"
                        : ""
                }"
            >

                <div class="v25-live-name">

                    ${v25Escape(
                        state.player2?.name ||
                        "Player 2"
                    )}

                </div>


                <div class="v25-live-score">

                    ${v25Escape(
                        state.player2?.score ||
                        "0"
                    )}

                </div>


                <div class="v25-live-details">

                    ${v25Escape(
                        state.player2?.legs ||
                        ""
                    )}

                    <br>

                    ${v25Escape(
                        state.player2?.sets ||
                        ""
                    )}

                </div>


                <div class="v25-current-visit">

                    ${v25Escape(
                        state.player2Last ||
                        ""
                    )}

                </div>

            </div>

        </div>


        <div class="v25-live-centre">

            <div>

                ${v25Escape(
                    state.matchInfo?.legSet ||
                    ""
                )}

            </div>


            <div>

                ${v25Escape(
                    state.matchInfo?.darts ||
                    ""
                )}

            </div>


            <div class="v25-checkout">

                ${v25Escape(
                    state.checkout ||
                    ""
                )}

            </div>


            <div class="v25-current-visit">

                ${v25Escape(
                    state.currentVisit ||
                    ""
                )}

            </div>

        </div>


        ${
            state.finished ||
            status ===
            "ended"

                ? `

                    <div class="v25-match-ended">

                        ${
                            v25Escape(
                                state.finishedText ||
                                "MATCH ENDED"
                            )
                        }

                    </div>
                `

                : ""
        }
    `;
}


/* =========================================================
   CRICKET SCOREBOARD
========================================================= */

function v25CricketScoreboardHTML(
    state,
    status
) {

    return `

        <div class="v25-live-top">

            <div class="v25-live-mode">

                🏏 Cricket

            </div>


            <div class="v25-connection">

                ● LIVE

            </div>

        </div>


        <div class="v25-live-centre">

            <div class="v25-live-name">

                ${v25Escape(
                    state.batting ||
                    "Batting"
                )}

                batting

            </div>


            <div class="v25-current-visit">

                Bowling:
                ${v25Escape(
                    state.bowling ||
                    ""
                )}

            </div>

        </div>


        <div class="v25-cricket-main">

            <div class="v25-cricket-stat">

                <span>
                    Runs
                </span>

                <strong>

                    ${v25Escape(
                        state.runs ||
                        "0"
                    )}

                </strong>

            </div>


            <div class="v25-cricket-stat wickets">

                <span>
                    Wickets
                </span>

                <strong>

                    ${v25Escape(
                        state.wickets ||
                        "0"
                    )}

                </strong>

            </div>

        </div>


        <div class="v25-cricket-info">

            <div class="v25-cricket-row">

                <span>
                    Team A
                </span>

                <strong>

                    ${v25Escape(
                        state.teamA ||
                        ""
                    )}

                </strong>

            </div>


            <div class="v25-cricket-row">

                <span>
                    Team B
                </span>

                <strong>

                    ${v25Escape(
                        state.teamB ||
                        ""
                    )}

                </strong>

            </div>


            <div class="v25-cricket-row">

                <span>
                    Innings
                </span>

                <strong>

                    ${v25Escape(
                        state.innings ||
                        ""
                    )}

                </strong>

            </div>


            <div class="v25-cricket-row">

                <span>
                    Wickets in Match
                </span>

                <strong>

                    ${v25Escape(
                        state.totalWickets ||
                        ""
                    )}

                </strong>

            </div>


            <div class="v25-cricket-row">

                <span>
                    Target
                </span>

                <strong>

                    ${v25Escape(
                        state.target ||
                        "–"
                    )}

                </strong>

            </div>


            <div class="v25-cricket-row">

                <span>
                    Next Wicket
                </span>

                <strong>

                    ${v25Escape(
                        state.nextWicket ||
                        ""
                    )}

                </strong>

            </div>


            <div class="v25-cricket-row">

                <span>
                    Phase
                </span>

                <strong>

                    ${v25Escape(
                        state.phase ||
                        ""
                    )}

                </strong>

            </div>


            <div class="v25-cricket-row">

                <span>
                    Darts Left
                </span>

                <strong>

                    ${v25Escape(
                        state.dartsLeft ||
                        ""
                    )}

                </strong>

            </div>

        </div>


        ${
            state.finished ||
            status ===
            "ended"

                ? `

                    <div class="v25-match-ended">

                        CRICKET MATCH ENDED

                    </div>
                `

                : ""
        }
    `;
}


/* =========================================================
   INITIALISE
========================================================= */

async function initialiseDartHubV25() {

    v25InstallStyles();


    v25InstallHomeButton();


    v25InstallHostButtons();


    v25InstallWatchPage();


    setTimeout(
        v25RestoreHostSession,
        1200
    );


    console.log(
        "Dart Hub v25 Live Score ready."
    );
}


initialiseDartHubV25();