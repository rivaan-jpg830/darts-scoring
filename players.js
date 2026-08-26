"use strict";


/* =========================================================
   DART HUB
   REGISTERED PLAYERS + RESULT CONFIRMATION
   VERSION 22
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const DH_ACCOUNT_SLOT_KEY =
    "dart-hub-account-slot-v22";


const DH_OPPONENT_TYPE_KEY =
    "dart-hub-opponent-type-v22";


const DH_REGISTERED_OPPONENT_KEY =
    "dart-hub-registered-opponent-v22";


const DH_MATCH_UID_KEY =
    "dart-hub-current-match-uid-v22";


/* =========================================================
   STATE
========================================================= */

let dartHubAccountPlayerSlot =

    Number(
        localStorage.getItem(
            DH_ACCOUNT_SLOT_KEY
        )
    ) ===
    2

        ? 2

        : 1;


let dartHubOpponentType =

    localStorage.getItem(
        DH_OPPONENT_TYPE_KEY
    ) ===
    "registered"

        ? "registered"

        : "guest";


let dartHubRegisteredOpponent =
    null;


let dartHubCloudSubmissionRunning =
    false;


let identityPanelV22 =
    null;


let matchRequestsCard =
    null;


/* =========================================================
   LOAD SAVED OPPONENT
========================================================= */

try {

    const saved =
        JSON.parse(

            localStorage.getItem(
                DH_REGISTERED_OPPONENT_KEY
            )
            ||
            "null"
        );


    if (
        saved &&
        saved.user_id
    ) {

        dartHubRegisteredOpponent =
            saved;
    }

} catch (
    error
) {

    dartHubRegisteredOpponent =
        null;
}


/* =========================================================
   HELPERS
========================================================= */

function dhNormalizeName(
    value
) {

    return String(
        value ||
        ""
    )
        .trim()
        .toLowerCase();
}


function dhNormalizeCode(
    value
) {

    return String(
        value ||
        ""
    )
        .trim()
        .toUpperCase()
        .replace(
            /[^A-Z0-9]/g,
            ""
        );
}


function dhEscapeHTML(
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


function getSignedInPlayerNameV22() {

    if (
        typeof currentCloudProfile !==
            "undefined" &&
        currentCloudProfile &&
        currentCloudProfile.display_name
    ) {

        return currentCloudProfile
            .display_name;
    }


    const element =
        document.getElementById(
            "current-user-name"
        );


    return (

        element &&
        element.textContent.trim()

            ? element.textContent.trim()

            : "Player"
    );
}


function getMyPlayerCodeV22() {

    if (
        typeof currentCloudProfile !==
            "undefined" &&
        currentCloudProfile &&
        currentCloudProfile.player_code
    ) {

        return currentCloudProfile
            .player_code;
    }


    return "";
}


function getOpponentSlotV22() {

    return (

        dartHubAccountPlayerSlot ===
        1

            ? 2

            : 1
    );
}


function getNameInputV22(
    slot
) {

    return document.getElementById(

        slot ===
        1

            ? "p1-name-input"

            : "p2-name-input"
    );
}


function getPlayerBoxV22(
    slot
) {

    return document.getElementById(

        slot ===
        1

            ? "p1-box"

            : "p2-box"
    );
}


/* =========================================================
   MATCH UUID
========================================================= */

function createDartHubUUID() {

    if (
        window.crypto &&
        typeof window.crypto.randomUUID ===
            "function"
    ) {

        return window.crypto.randomUUID();
    }


    return (

        Date.now()
            .toString(
                16
            )

        +

        "-"

        +

        Math.random()
            .toString(
                16
            )
            .slice(
                2
            )

        +

        "-"

        +

        Math.random()
            .toString(
                16
            )
            .slice(
                2
            )
    );
}


function createNewMatchUID() {

    const uid =
        createDartHubUUID();


    localStorage.setItem(

        DH_MATCH_UID_KEY,

        uid
    );


    return uid;
}


function getCurrentMatchUID() {

    let uid =
        localStorage.getItem(
            DH_MATCH_UID_KEY
        );


    if (
        !uid
    ) {

        uid =
            createNewMatchUID();
    }


    return uid;
}


/* =========================================================
   SAVE PLAYER CONFIGURATION
========================================================= */

function savePlayerConfigurationV22() {

    localStorage.setItem(

        DH_ACCOUNT_SLOT_KEY,

        String(
            dartHubAccountPlayerSlot
        )
    );


    localStorage.setItem(

        DH_OPPONENT_TYPE_KEY,

        dartHubOpponentType
    );


    if (
        dartHubRegisteredOpponent
    ) {

        localStorage.setItem(

            DH_REGISTERED_OPPONENT_KEY,

            JSON.stringify(
                dartHubRegisteredOpponent
            )
        );


    } else {

        localStorage.removeItem(
            DH_REGISTERED_OPPONENT_KEY
        );
    }
}


/* =========================================================
   STYLE
========================================================= */

function installV22Styles() {

    if (
        document.getElementById(
            "dart-hub-v22-style"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "dart-hub-v22-style";


    style.textContent = `

        .dh-player-panel {

            margin:
                12px
                0
                16px;

            padding: 14px;

            border:
                1px solid
                #294a59;

            border-radius: 12px;

            background:
                linear-gradient(
                    145deg,
                    #102530,
                    #081116
                );

            text-align: left;
        }


        .dh-player-panel.hidden {

            display: none !important;
        }


        .dh-player-heading {

            margin-bottom: 4px;

            color: #00aaff;

            font-size: 19px;

            font-weight: 900;
        }


        .dh-player-help {

            margin:
                0
                0
                12px;

            color: #8fa1aa;

            font-size: 12px;

            line-height: 1.45;
        }


        .dh-player-grid {

            display: grid;

            grid-template-columns:
                repeat(
                    2,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap: 9px;
        }


        .dh-player-card {

            padding: 11px;

            border:
                1px solid
                #30434c;

            border-radius: 10px;

            background: #080d10;
        }


        .dh-player-card-title {

            margin-bottom: 8px;

            color: white;

            font-size: 13px;

            font-weight: 900;
        }


        .dh-player-options {

            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    1fr
                );

            gap: 5px;
        }


        .dh-choice {

            min-height: 43px;

            padding: 5px;

            border:
                1px solid
                #3b4b52;

            border-radius: 7px;

            background: #161b1e;

            color: #b0bbc0;

            font-size: 11px;

            font-weight: 800;

            cursor: pointer;
        }


        .dh-choice.me-active {

            border-color: #00aaff;

            background:
                linear-gradient(
                    135deg,
                    #008fd6,
                    #00598d
                );

            color: white;
        }


        .dh-choice.guest-active {

            border-color: #138354;

            background:
                linear-gradient(
                    135deg,
                    #087247,
                    #04502f
                );

            color: white;
        }


        .dh-choice.registered-active {

            border-color: #a96cff;

            background:
                linear-gradient(
                    135deg,
                    #7142ad,
                    #47266e
                );

            color: white;
        }


        .dh-player-finder {

            margin-top: 9px;

            padding: 9px;

            border:
                1px solid
                #47375e;

            border-radius: 8px;

            background: #110d17;
        }


        .dh-player-finder.hidden {

            display: none !important;
        }


        .dh-player-finder label {

            display: block;

            margin-bottom: 5px;

            color: #baa8d1;

            font-size: 11px;

            font-weight: 800;
        }


        .dh-find-row {

            display: grid;

            grid-template-columns:
                1fr
                auto;

            gap: 6px;
        }


        .dh-code-input {

            min-width: 0;

            min-height: 43px;

            padding: 8px;

            border:
                1px solid
                #594476;

            border-radius: 7px;

            outline: none;

            background: #050407;

            color: white;

            font-size: 16px;

            font-weight: 800;

            text-transform: uppercase;

            letter-spacing: 1px;
        }


        .dh-find-button {

            min-height: 43px;

            border: none;

            border-radius: 7px;

            padding:
                7px
                12px;

            background:
                linear-gradient(
                    135deg,
                    #8e55d4,
                    #593188
                );

            color: white;

            font-weight: 800;

            cursor: pointer;
        }


        .dh-find-status {

            min-height: 18px;

            margin-top: 6px;

            color: #baa8d1;

            font-size: 11px;
        }


        .dh-find-status.success {

            color: #75ffc1;
        }


        .dh-find-status.error {

            color: #ff9292;
        }


        .dh-me-name {

            border-color:
                #00aaff !important;

            background:
                #081c27 !important;

            color:
                #75d8ff !important;

            font-weight: 900;
        }


        .dh-registered-name {

            border-color:
                #a96cff !important;

            background:
                #180f24 !important;

            color:
                #d2aaff !important;

            font-weight: 900;
        }


        .dh-selection-summary {

            margin-top: 10px;

            padding: 8px;

            border-radius: 7px;

            background: #080d10;

            color: #b9d6e2;

            font-size: 12px;

            font-weight: 700;

            text-align: center;
        }


        .dh-player-code-card {

            max-width: 420px;

            margin:
                10px
                auto;

            padding: 11px;

            border:
                1px solid
                #4e3970;

            border-radius: 10px;

            background:
                linear-gradient(
                    145deg,
                    #191024,
                    #0b0810
                );

            text-align: center;
        }


        .dh-player-code-label {

            color: #9d8cb4;

            font-size: 10px;

            font-weight: 800;

            text-transform: uppercase;

            letter-spacing: 1px;
        }


        .dh-player-code-value {

            margin-top: 3px;

            color: #c495ff;

            font-size: 25px;

            font-weight: 1000;

            letter-spacing: 3px;
        }


        .dh-player-code-help {

            margin-top: 4px;

            color: #786b88;

            font-size: 10px;
        }


        .dh-match-badge {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            margin:
                6px
                3px
                0;

            padding:
                3px
                8px;

            border-radius: 999px;

            font-size: 9px;

            font-weight: 1000;

            letter-spacing: 1px;
        }


        .dh-match-badge.hidden {

            display: none !important;
        }


        .dh-match-badge.you {

            border:
                1px solid
                #00aaff;

            background: #082535;

            color: #70d7ff;
        }


        .dh-match-badge.registered {

            border:
                1px solid
                #a96cff;

            background: #251238;

            color: #d6b2ff;
        }


        /* MATCH REQUESTS */

        .dh-requests-card {

            max-width: 700px;

            margin:
                12px
                auto;

            padding: 12px;

            border:
                1px solid
                #44525a;

            border-radius: 12px;

            background:
                linear-gradient(
                    145deg,
                    #141b1f,
                    #090d0f
                );

            text-align: left;
        }


        .dh-requests-header {

            display: flex;

            justify-content: space-between;

            align-items: center;

            gap: 10px;
        }


        .dh-requests-title {

            color: #00aaff;

            font-size: 16px;

            font-weight: 900;
        }


        .dh-refresh {

            min-height: 34px;

            padding:
                5px
                10px;

            border:
                1px solid
                #384b55;

            border-radius: 7px;

            background: #111a1f;

            color: #c4d0d5;

            font-size: 11px;

            font-weight: 700;

            cursor: pointer;
        }


        .dh-request-list {

            display: flex;

            flex-direction: column;

            gap: 8px;

            margin-top: 10px;
        }


        .dh-request {

            padding: 10px;

            border:
                1px solid
                #29373e;

            border-radius: 9px;

            background: #070a0c;
        }


        .dh-request.incoming {

            border-left:
                4px solid
                #a96cff;
        }


        .dh-request.outgoing {

            border-left:
                4px solid
                #00aaff;
        }


        .dh-request.accepted {

            border-left:
                4px solid
                #00c878;
        }


        .dh-request.disputed {

            border-left:
                4px solid
                #e14444;
        }


        .dh-request-title {

            color: white;

            font-size: 14px;

            font-weight: 900;
        }


        .dh-request-meta {

            margin-top: 4px;

            color: #85969d;

            font-size: 11px;

            line-height: 1.5;
        }


        .dh-request-result {

            margin-top: 7px;

            color: #d3dce0;

            font-size: 12px;

            font-weight: 700;
        }


        .dh-request-stats {

            display: grid;

            grid-template-columns:
                repeat(
                    2,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap: 6px;

            margin-top: 8px;
        }


        .dh-request-stat {

            padding: 6px;

            border-radius: 6px;

            background: #101619;

            color: #92a0a7;

            font-size: 10px;
        }


        .dh-request-stat strong {

            display: block;

            margin-top: 2px;

            color: white;

            font-size: 13px;
        }


        .dh-request-actions {

            display: grid;

            grid-template-columns:
                repeat(
                    2,
                    1fr
                );

            gap: 6px;

            margin-top: 9px;
        }


        .dh-accept {

            min-height: 42px;

            border: none;

            border-radius: 7px;

            background: #087247;

            color: white;

            font-weight: 900;

            cursor: pointer;
        }


        .dh-dispute,
        .dh-cancel {

            min-height: 42px;

            border: none;

            border-radius: 7px;

            background: #792323;

            color: white;

            font-weight: 900;

            cursor: pointer;
        }


        .dh-request-status {

            margin-top: 7px;

            font-size: 11px;

            font-weight: 800;
        }


        .dh-request-status.pending {

            color: #ffd16e;
        }


        .dh-request-status.accepted {

            color: #74ffc1;
        }


        .dh-request-status.disputed {

            color: #ff8d8d;
        }


        .dh-request-empty {

            padding: 12px;

            color: #819097;

            font-size: 12px;

            text-align: center;
        }


        @media (
            max-width:
            650px
        ) {

            .dh-player-grid {

                grid-template-columns:
                    1fr;
            }


            .dh-find-row {

                grid-template-columns:
                    1fr;
            }


            .dh-request-stats {

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
   BUILD PLAYER SELECTION
========================================================= */

function installPlayerSelectionV22() {

    const nameScreenElement =
        document.getElementById(
            "name-screen"
        );


    if (
        !nameScreenElement
    ) {

        return;
    }


    [
        "player-identity-panel",
        "v21-player-panel",
        "v22-player-panel"
    ].forEach(
        id => {

            const old =
                document.getElementById(
                    id
                );


            if (
                old
            ) {

                old.remove();
            }
        }
    );


    const firstRow =
        nameScreenElement
            .querySelector(
                ".setup-row"
            );


    if (
        !firstRow
    ) {

        return;
    }


    identityPanelV22 =
        document.createElement(
            "div"
        );


    identityPanelV22.id =
        "v22-player-panel";


    identityPanelV22.className =
        "dh-player-panel";


    identityPanelV22.innerHTML = `

        <div class="dh-player-heading">

            Choose Players

        </div>


        <p class="dh-player-help">

            One side is your Dart Hub account.
            The opponent can be a guest or another
            registered Dart Hub player.

        </p>


        <div class="dh-player-grid">


            ${playerSelectionCardHTML(1)}


            ${playerSelectionCardHTML(2)}

        </div>


        <div
            id="dh-selection-summary"
            class="dh-selection-summary"
        ></div>

    `;


    nameScreenElement.insertBefore(

        identityPanelV22,

        firstRow
    );


    for (
        const slot
        of [
            1,
            2
        ]
    ) {

        document
            .getElementById(
                `dh-p${slot}-me`
            )
            .onclick =
                () =>
                    chooseMeV22(
                        slot
                    );


        document
            .getElementById(
                `dh-p${slot}-guest`
            )
            .onclick =
                () =>
                    chooseOpponentTypeV22(
                        slot,
                        "guest"
                    );


        document
            .getElementById(
                `dh-p${slot}-registered`
            )
            .onclick =
                () =>
                    chooseOpponentTypeV22(
                        slot,
                        "registered"
                    );


        document
            .getElementById(
                `dh-p${slot}-find`
            )
            .onclick =
                () =>
                    findRegisteredPlayerV22(
                        slot
                    );


        document
            .getElementById(
                `dh-p${slot}-code`
            )
            .addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        findRegisteredPlayerV22(
                            slot
                        );
                    }
                }
            );
    }


    updatePlayerSelectionV22();
}


function playerSelectionCardHTML(
    slot
) {

    return `

        <div class="dh-player-card">

            <div class="dh-player-card-title">

                Player ${slot}

            </div>


            <div class="dh-player-options">

                <button
                    id="dh-p${slot}-me"
                    class="dh-choice"
                    type="button"
                >
                    👤 Me
                </button>


                <button
                    id="dh-p${slot}-guest"
                    class="dh-choice"
                    type="button"
                >
                    Guest
                </button>


                <button
                    id="dh-p${slot}-registered"
                    class="dh-choice"
                    type="button"
                >
                    ☁ Registered
                </button>

            </div>


            <div
                id="dh-p${slot}-finder"
                class="dh-player-finder hidden"
            >

                <label>
                    Dart Hub Player Code
                </label>


                <div class="dh-find-row">

                    <input
                        id="dh-p${slot}-code"
                        class="dh-code-input"
                        type="text"
                        maxlength="8"
                        placeholder="PLAYER CODE"
                        autocomplete="off"
                    >


                    <button
                        id="dh-p${slot}-find"
                        class="dh-find-button"
                        type="button"
                    >
                        Find
                    </button>

                </div>


                <div
                    id="dh-p${slot}-status"
                    class="dh-find-status"
                ></div>

            </div>

        </div>
    `;
}


/* =========================================================
   PLAYER CODE
========================================================= */

function installPlayerCodeCardV22() {

    let card =
        document.getElementById(
            "my-player-code-card"
        );


    if (
        !card
    ) {

        const userBar =
            document.getElementById(
                "dart-hub-user-bar"
            );


        if (
            !userBar
        ) {

            return;
        }


        card =
            document.createElement(
                "div"
            );


        card.id =
            "my-player-code-card";


        card.className =
            "dh-player-code-card";


        userBar.insertAdjacentElement(

            "afterend",

            card
        );
    }


    card.innerHTML = `

        <div class="dh-player-code-label">

            Your Dart Hub Player Code

        </div>


        <div
            id="dh-player-code-value"
            class="dh-player-code-value"
        >
            --------
        </div>


        <div class="dh-player-code-help">

            Give this code to another Dart Hub player.

        </div>
    `;


    refreshPlayerCodeV22();
}


function refreshPlayerCodeV22() {

    const value =
        document.getElementById(
            "dh-player-code-value"
        );


    if (
        value
    ) {

        value.textContent =
            getMyPlayerCodeV22() ||
            "--------";
    }
}


/* =========================================================
   MATCH REQUEST CARD
========================================================= */

function installMatchRequestsCard() {

    if (
        document.getElementById(
            "dh-match-requests-card"
        )
    ) {

        matchRequestsCard =
            document.getElementById(
                "dh-match-requests-card"
            );


        return;
    }


    const codeCard =
        document.getElementById(
            "my-player-code-card"
        );


    const modeScreenElement =
        document.getElementById(
            "mode-screen"
        );


    if (
        !modeScreenElement
    ) {

        return;
    }


    matchRequestsCard =
        document.createElement(
            "div"
        );


    matchRequestsCard.id =
        "dh-match-requests-card";


    matchRequestsCard.className =
        "dh-requests-card";


    matchRequestsCard.innerHTML = `

        <div class="dh-requests-header">

            <div class="dh-requests-title">

                📨 Match Confirmations

            </div>


            <button
                id="dh-refresh-requests"
                class="dh-refresh"
                type="button"
            >
                ↻ Refresh
            </button>

        </div>


        <div
            id="dh-request-list"
            class="dh-request-list"
        >

            <div class="dh-request-empty">

                Checking match requests…

            </div>

        </div>
    `;


    if (
        codeCard
    ) {

        codeCard.insertAdjacentElement(

            "afterend",

            matchRequestsCard
        );


    } else {

        modeScreenElement.appendChild(
            matchRequestsCard
        );
    }


    document
        .getElementById(
            "dh-refresh-requests"
        )
        .onclick =
            loadMatchRequests;
}


/* =========================================================
   CHOOSE ME
========================================================= */

function chooseMeV22(
    slot
) {

    dartHubAccountPlayerSlot =

        slot ===
        2

            ? 2

            : 1;


    const opponentSlot =
        getOpponentSlotV22();


    if (
        dartHubRegisteredOpponent &&
        dartHubRegisteredOpponent.slot !==
            opponentSlot
    ) {

        dartHubRegisteredOpponent =
            null;


        dartHubOpponentType =
            "guest";
    }


    savePlayerConfigurationV22();

    updatePlayerSelectionV22();

    updateMatchBadgesV22();
}


/* =========================================================
   OPPONENT TYPE
========================================================= */

function chooseOpponentTypeV22(
    slot,
    type
) {

    if (
        slot ===
        dartHubAccountPlayerSlot
    ) {

        alert(
            "That side is currently your Dart Hub account. Select Me on the other player first."
        );


        return;
    }


    dartHubOpponentType =

        type ===
        "registered"

            ? "registered"

            : "guest";


    if (
        dartHubOpponentType ===
        "guest"
    ) {

        dartHubRegisteredOpponent =
            null;
    }


    savePlayerConfigurationV22();

    updatePlayerSelectionV22();

    updateMatchBadgesV22();
}


/* =========================================================
   FIND REGISTERED PLAYER
========================================================= */

async function findRegisteredPlayerV22(
    slot
) {

    if (
        slot ===
        dartHubAccountPlayerSlot
    ) {

        return;
    }


    const input =
        document.getElementById(
            `dh-p${slot}-code`
        );


    const status =
        document.getElementById(
            `dh-p${slot}-status`
        );


    const code =
        dhNormalizeCode(
            input.value
        );


    status.className =
        "dh-find-status";


    if (
        code.length !==
        8
    ) {

        status.textContent =
            "Enter the 8-character player code.";


        status.classList.add(
            "error"
        );


        return;
    }


    if (
        code ===
        dhNormalizeCode(
            getMyPlayerCodeV22()
        )
    ) {

        status.textContent =
            "That is your own account.";


        status.classList.add(
            "error"
        );


        return;
    }


    status.textContent =
        "Searching…";


    try {

        const {
            data,
            error
        } =
            await dartHubSupabase

                .from(
                    "player_directory"
                )

                .select(
                    "user_id, display_name, player_code"
                )

                .eq(
                    "player_code",
                    code
                )

                .maybeSingle();


        if (
            error
        ) {

            throw error;
        }


        if (
            !data
        ) {

            dartHubRegisteredOpponent =
                null;


            status.textContent =
                "Player not found.";


            status.classList.add(
                "error"
            );


            savePlayerConfigurationV22();


            return;
        }


        if (
            currentDartHubUser &&
            data.user_id ===
                currentDartHubUser.id
        ) {

            status.textContent =
                "That is your own account.";


            status.classList.add(
                "error"
            );


            return;
        }


        dartHubRegisteredOpponent = {

            slot,

            user_id:
                data.user_id,

            display_name:
                data.display_name,

            player_code:
                data.player_code
        };


        dartHubOpponentType =
            "registered";


        savePlayerConfigurationV22();


        getNameInputV22(
            slot
        ).value =
            data.display_name;


        status.textContent =
            `Found: ${data.display_name} ✓`;


        status.className =
            "dh-find-status success";


        updatePlayerSelectionV22();


    } catch (
        error
    ) {

        console.error(
            error
        );


        status.textContent =
            "Unable to find player.";


        status.classList.add(
            "error"
        );
    }
}


/* =========================================================
   UPDATE PLAYER SCREEN
========================================================= */

function updatePlayerSelectionV22() {

    if (
        !identityPanelV22
    ) {

        return;
    }


    const meSlot =
        dartHubAccountPlayerSlot;


    const opponentSlot =
        getOpponentSlotV22();


    const myName =
        getSignedInPlayerNameV22();


    for (
        const slot
        of [
            1,
            2
        ]
    ) {

        const me =
            document.getElementById(
                `dh-p${slot}-me`
            );


        const guest =
            document.getElementById(
                `dh-p${slot}-guest`
            );


        const registered =
            document.getElementById(
                `dh-p${slot}-registered`
            );


        const finder =
            document.getElementById(
                `dh-p${slot}-finder`
            );


        const nameInput =
            getNameInputV22(
                slot
            );


        me.classList.remove(
            "me-active"
        );


        guest.classList.remove(
            "guest-active"
        );


        registered.classList.remove(
            "registered-active"
        );


        nameInput.classList.remove(
            "dh-me-name"
        );


        nameInput.classList.remove(
            "dh-registered-name"
        );


        if (
            slot ===
            meSlot
        ) {

            me.classList.add(
                "me-active"
            );


            nameInput.value =
                myName;


            nameInput.readOnly =
                true;


            nameInput.classList.add(
                "dh-me-name"
            );


            finder.classList.add(
                "hidden"
            );


            continue;
        }


        if (
            dartHubOpponentType ===
            "registered"
        ) {

            registered.classList.add(
                "registered-active"
            );


            finder.classList.remove(
                "hidden"
            );


            nameInput.readOnly =
                true;


            nameInput.classList.add(
                "dh-registered-name"
            );


            if (
                dartHubRegisteredOpponent &&
                dartHubRegisteredOpponent.slot ===
                    slot
            ) {

                nameInput.value =
                    dartHubRegisteredOpponent
                        .display_name;


                document
                    .getElementById(
                        `dh-p${slot}-code`
                    )
                    .value =
                        dartHubRegisteredOpponent
                            .player_code;


                const status =
                    document.getElementById(
                        `dh-p${slot}-status`
                    );


                status.textContent =
                    `Found: ${dartHubRegisteredOpponent.display_name} ✓`;


                status.className =
                    "dh-find-status success";


            } else {

                nameInput.value =
                    "";


                const status =
                    document.getElementById(
                        `dh-p${slot}-status`
                    );


                status.textContent =
                    "Enter the player's Dart Hub code.";


                status.className =
                    "dh-find-status";
            }


        } else {

            guest.classList.add(
                "guest-active"
            );


            finder.classList.add(
                "hidden"
            );


            nameInput.readOnly =
                false;


            if (
                dhNormalizeName(
                    nameInput.value
                ) ===
                dhNormalizeName(
                    myName
                )
            ) {

                nameInput.value =
                    "";
            }
        }
    }


    const summary =
        document.getElementById(
            "dh-selection-summary"
        );


    if (
        summary
    ) {

        if (
            dartHubOpponentType ===
                "registered" &&
            dartHubRegisteredOpponent
        ) {

            summary.textContent =

                `Player ${meSlot}: ${myName} (YOU) • ` +

                `Player ${opponentSlot}: ` +

                `${dartHubRegisteredOpponent.display_name} (REGISTERED)`;


        } else {

            summary.textContent =

                `Player ${meSlot}: ${myName} (YOU) • ` +

                `Player ${opponentSlot}: Guest`;
        }
    }
}


/* =========================================================
   CRICKET
========================================================= */

function setPlayerPanelGameModeV22(
    mode
) {

    if (
        !identityPanelV22
    ) {

        return;
    }


    if (
        mode ===
        "cricket"
    ) {

        identityPanelV22.classList.add(
            "hidden"
        );


        for (
            const slot
            of [
                1,
                2
            ]
        ) {

            const input =
                getNameInputV22(
                    slot
                );


            input.readOnly =
                false;


            input.classList.remove(
                "dh-me-name"
            );


            input.classList.remove(
                "dh-registered-name"
            );
        }


        return;
    }


    identityPanelV22.classList.remove(
        "hidden"
    );


    updatePlayerSelectionV22();
}


/* =========================================================
   VALIDATION
========================================================= */

function validatePlayersV22(
    event
) {

    if (
        typeof selectedMode !==
            "undefined" &&
        selectedMode ===
            "cricket"
    ) {

        return;
    }


    const myName =
        getSignedInPlayerNameV22();


    const opponentSlot =
        getOpponentSlotV22();


    const opponentInput =
        getNameInputV22(
            opponentSlot
        );


    getNameInputV22(
        dartHubAccountPlayerSlot
    ).value =
        myName;


    if (
        dartHubOpponentType ===
        "registered"
    ) {

        if (
            !dartHubRegisteredOpponent ||
            dartHubRegisteredOpponent.slot !==
                opponentSlot
        ) {

            event.preventDefault();

            event.stopImmediatePropagation();


            alert(
                "Find the registered opponent before continuing."
            );


            return;
        }


        opponentInput.value =
            dartHubRegisteredOpponent
                .display_name;


        return;
    }


    const guestName =
        opponentInput.value.trim();


    if (
        !guestName
    ) {

        event.preventDefault();

        event.stopImmediatePropagation();


        alert(
            `Enter the guest player's name.`
        );


        opponentInput.focus();


        return;
    }


    if (
        dhNormalizeName(
            guestName
        ) ===
        dhNormalizeName(
            myName
        )
    ) {

        event.preventDefault();

        event.stopImmediatePropagation();


        alert(
            "The guest cannot have the same name as your account."
        );


        opponentInput.focus();
    }
}


/* =========================================================
   SCOREBOARD BADGES
========================================================= */

function installMatchBadgesV22() {

    for (
        const slot
        of [
            1,
            2
        ]
    ) {

        const box =
            getPlayerBoxV22(
                slot
            );


        if (
            !box
        ) {

            continue;
        }


        if (
            !box.querySelector(
                `.dh-match-badge.you[data-slot="${slot}"]`
            )
        ) {

            const badge =
                document.createElement(
                    "div"
                );


            badge.className =
                "dh-match-badge you hidden";


            badge.dataset.slot =
                slot;


            badge.textContent =
                "YOU";


            box.appendChild(
                badge
            );
        }


        if (
            !box.querySelector(
                `.dh-match-badge.registered[data-slot="${slot}"]`
            )
        ) {

            const badge =
                document.createElement(
                    "div"
                );


            badge.className =
                "dh-match-badge registered hidden";


            badge.dataset.slot =
                slot;


            badge.textContent =
                "REGISTERED";


            box.appendChild(
                badge
            );
        }
    }


    updateMatchBadgesV22();
}


function updateMatchBadgesV22() {

    document
        .querySelectorAll(
            ".dh-match-badge.you"
        )
        .forEach(
            badge => {

                badge.classList.toggle(

                    "hidden",

                    Number(
                        badge.dataset.slot
                    ) !==
                    dartHubAccountPlayerSlot
                );
            }
        );


    document
        .querySelectorAll(
            ".dh-match-badge.registered"
        )
        .forEach(
            badge => {

                const registeredSlot =

                    dartHubOpponentType ===
                        "registered" &&
                    dartHubRegisteredOpponent

                        ? dartHubRegisteredOpponent
                            .slot

                        : 0;


                badge.classList.toggle(

                    "hidden",

                    Number(
                        badge.dataset.slot
                    ) !==
                    registeredSlot
                );
            }
        );
}


/* =========================================================
   ACCOUNT PLAYER INDEX
========================================================= */

function installAccountIndexOverrideV22() {

    if (
        typeof getAccountPlayerIndex ===
        "function"
    ) {

        getAccountPlayerIndex =
            function () {

                return (

                    dartHubAccountPlayerSlot -
                    1
                );
            };
    }
}


/* =========================================================
   AVERAGE
========================================================= */

function v22MatchAverage(
    player
) {

    if (
        !player ||
        !player.stats ||
        !player.stats.dartsThrown
    ) {

        return 0;
    }


    return (

        player.stats.pointsScored /

        player.stats.dartsThrown *

        3
    );
}


/* =========================================================
   REGISTERED MATCH SUBMISSION
========================================================= */

async function submitRegisteredMatchV22() {

    if (
        dartHubCloudSubmissionRunning
    ) {

        return;
    }


    if (
        !dartHubRegisteredOpponent ||
        dartHubOpponentType !==
            "registered"
    ) {

        return;
    }


    if (
        !currentDartHubUser
    ) {

        return;
    }


    dartHubCloudSubmissionRunning =
        true;


    try {

        const myIndex =
            dartHubAccountPlayerSlot -
            1;


        const opponentIndex =
            myIndex ===
            0

                ? 1

                : 0;


        const myPlayer =
            players[
                myIndex
            ];


        const opponentPlayer =
            players[
                opponentIndex
            ];


        const myAverage =
            v22MatchAverage(
                myPlayer
            );


        const opponentAverage =
            v22MatchAverage(
                opponentPlayer
            );


        const winnerID =

            winnerPlayer ===
            dartHubAccountPlayerSlot

                ? currentDartHubUser.id

                : dartHubRegisteredOpponent
                    .user_id;


        const {
            data,
            error
        } =
            await dartHubSupabase
                .rpc(
                    "submit_registered_match",
                    {

                        p_match_uid:
                            getCurrentMatchUID(),

                        p_opponent_id:
                            dartHubRegisteredOpponent
                                .user_id,

                        p_game_mode:
                            gameMode ===
                            "sets"

                                ? "Sets + Legs"

                                : "501 / Legs",

                        p_starting_score:
                            startingScore,

                        p_winner_id:
                            winnerID,


                        p_user_average:
                            Number(
                                myAverage.toFixed(
                                    2
                                )
                            ),

                        p_opponent_average:
                            Number(
                                opponentAverage.toFixed(
                                    2
                                )
                            ),


                        p_user_points:
                            Number(
                                myPlayer.stats
                                    .pointsScored ||
                                0
                            ),

                        p_opponent_points:
                            Number(
                                opponentPlayer.stats
                                    .pointsScored ||
                                0
                            ),


                        p_user_darts:
                            Number(
                                myPlayer.stats
                                    .dartsThrown ||
                                0
                            ),

                        p_opponent_darts:
                            Number(
                                opponentPlayer.stats
                                    .dartsThrown ||
                                0
                            ),


                        p_user_100s:
                            Number(
                                myPlayer.stats
                                    .scores100 ||
                                0
                            ),

                        p_opponent_100s:
                            Number(
                                opponentPlayer.stats
                                    .scores100 ||
                                0
                            ),


                        p_user_140s:
                            Number(
                                myPlayer.stats
                                    .scores140 ||
                                0
                            ),

                        p_opponent_140s:
                            Number(
                                opponentPlayer.stats
                                    .scores140 ||
                                0
                            ),


                        p_user_180s:
                            Number(
                                myPlayer.stats
                                    .scores180 ||
                                0
                            ),

                        p_opponent_180s:
                            Number(
                                opponentPlayer.stats
                                    .scores180 ||
                                0
                            ),


                        p_user_checkouts:
                            Number(
                                myPlayer.stats
                                    .checkouts ||
                                0
                            ),

                        p_opponent_checkouts:
                            Number(
                                opponentPlayer.stats
                                    .checkouts ||
                                0
                            ),


                        p_user_checkout_attempts:
                            Number(
                                myPlayer.stats
                                    .checkoutAttempts ||
                                0
                            ),

                        p_opponent_checkout_attempts:
                            Number(
                                opponentPlayer.stats
                                    .checkoutAttempts ||
                                0
                            ),


                        p_user_best_checkout:
                            Number(
                                myPlayer.stats
                                    .bestCheckout ||
                                0
                            ),

                        p_opponent_best_checkout:
                            Number(
                                opponentPlayer.stats
                                    .bestCheckout ||
                                0
                            )
                    }
                );


        if (
            error
        ) {

            throw error;
        }


        console.log(
            "Dart Hub result submitted:",
            data
        );


        localStorage.removeItem(
            DH_MATCH_UID_KEY
        );


        await loadMatchRequests();


        alert(

            `Result sent to ${dartHubRegisteredOpponent.display_name} for confirmation.\n\n` +

            `Career statistics will update when they accept the result.`
        );


    } catch (
        error
    ) {

        console.error(
            "Result submission failed:",
            error
        );


        alert(

            "The match finished, but Dart Hub could not send the result for confirmation.\n\n" +

            "Check your internet connection."
        );


    } finally {

        dartHubCloudSubmissionRunning =
            false;
    }
}


/* =========================================================
   OVERRIDE CLOUD SAVE
========================================================= */

function installCloudSaveOverrideV22() {

    if (
        window.__dartHubV22CloudSave
    ) {

        return;
    }


    if (
        typeof saveCompletedCloudMatch !==
        "function"
    ) {

        console.warn(
            "Cloud save function was not found."
        );


        return;
    }


    window.__dartHubV22CloudSave =
        true;


    const originalGuestSave =
        saveCompletedCloudMatch;


    saveCompletedCloudMatch =
        async function () {

            if (
                dartHubOpponentType ===
                    "registered" &&
                dartHubRegisteredOpponent
            ) {

                await submitRegisteredMatchV22();


                return;
            }


            await originalGuestSave();
        };
}


/* =========================================================
   LOAD MATCH REQUESTS
========================================================= */

async function loadMatchRequests() {

    const container =
        document.getElementById(
            "dh-request-list"
        );


    if (
        !container ||
        !currentDartHubUser
    ) {

        return;
    }


    container.innerHTML = `

        <div class="dh-request-empty">

            Loading…

        </div>
    `;


    try {

        const {
            data,
            error
        } =
            await dartHubSupabase

                .from(
                    "match_requests"
                )

                .select(
                    "*"
                )

                .order(
                    "created_at",
                    {
                        ascending:
                            false
                    }
                )

                .limit(
                    20
                );


        if (
            error
        ) {

            throw error;
        }


        renderMatchRequests(
            data ||
            []
        );


    } catch (
        error
    ) {

        console.error(
            "Match request load failed:",
            error
        );


        container.innerHTML = `

            <div class="dh-request-empty">

                Unable to load match confirmations.

            </div>
        `;
    }
}


/* =========================================================
   RENDER REQUESTS
========================================================= */

function renderMatchRequests(
    requests
) {

    const container =
        document.getElementById(
            "dh-request-list"
        );


    if (
        !container
    ) {

        return;
    }


    if (
        !requests.length
    ) {

        container.innerHTML = `

            <div class="dh-request-empty">

                No match confirmations yet.

            </div>
        `;


        return;
    }


    container.innerHTML =
        requests
            .map(
                request =>
                    matchRequestHTML(
                        request
                    )
            )
            .join(
                ""
            );


    container
        .querySelectorAll(
            "[data-accept-request]"
        )
        .forEach(
            button => {

                button.onclick =
                    () =>
                        respondToMatchRequest(

                            Number(
                                button.dataset
                                    .acceptRequest
                            ),

                            "accept"
                        );
            }
        );


    container
        .querySelectorAll(
            "[data-dispute-request]"
        )
        .forEach(
            button => {

                button.onclick =
                    () =>
                        respondToMatchRequest(

                            Number(
                                button.dataset
                                    .disputeRequest
                            ),

                            "dispute"
                        );
            }
        );


    container
        .querySelectorAll(
            "[data-cancel-request]"
        )
        .forEach(
            button => {

                button.onclick =
                    () =>
                        cancelMatchRequest(

                            Number(
                                button.dataset
                                    .cancelRequest
                            )
                        );
            }
        );
}


/* =========================================================
   REQUEST HTML
========================================================= */

function matchRequestHTML(
    request
) {

    const incoming =

        request.opponent_id ===
        currentDartHubUser.id;


    const outgoing =
        !incoming;


    const opponentName =

        incoming

            ? request.submitter_name

            : request.opponent_name;


    const winnerName =

        request.winner_id ===
        request.submitted_by

            ? request.submitter_name

            : request.opponent_name;


    const date =
        new Date(
            request.created_at
        )
            .toLocaleString();


    const typeClass =

        request.status ===
        "accepted"

            ? "accepted"

            : request.status ===
              "disputed"

                ? "disputed"

                : incoming

                    ? "incoming"

                    : "outgoing";


    let actionHTML =
        "";


    if (
        request.status ===
            "pending" &&
        incoming
    ) {

        actionHTML = `

            <div class="dh-request-actions">

                <button
                    class="dh-accept"
                    data-accept-request="${request.id}"
                >
                    ✓ Accept Result
                </button>


                <button
                    class="dh-dispute"
                    data-dispute-request="${request.id}"
                >
                    ✕ Dispute
                </button>

            </div>
        `;
    }


    if (
        request.status ===
            "pending" &&
        outgoing
    ) {

        actionHTML = `

            <div class="dh-request-actions">

                <button
                    class="dh-cancel"
                    data-cancel-request="${request.id}"
                >
                    Cancel Request
                </button>

            </div>
        `;
    }


    const statusText =

        request.status ===
        "pending"

            ? (
                incoming

                    ? "ACTION REQUIRED"

                    : "WAITING FOR OPPONENT"
            )

            : request.status.toUpperCase();


    return `

        <div
            class="dh-request ${typeClass}"
        >

            <div class="dh-request-title">

                ${
                    incoming

                        ? "Result submitted by"

                        : "Result sent to"
                }

                ${dhEscapeHTML(
                    opponentName
                )}

            </div>


            <div class="dh-request-meta">

                ${dhEscapeHTML(
                    request.game_mode
                )}

                • ${date}

                • Starting score:
                ${request.starting_score}

            </div>


            <div class="dh-request-result">

                Winner:
                ${dhEscapeHTML(
                    winnerName
                )}

            </div>


            <div class="dh-request-stats">

                <div class="dh-request-stat">

                    ${dhEscapeHTML(
                        request.submitter_name
                    )}

                    <strong>

                        Avg
                        ${Number(
                            request.submitter_average ||
                            0
                        ).toFixed(2)}

                        • ${request.submitter_180s || 0}
                        × 180

                    </strong>

                </div>


                <div class="dh-request-stat">

                    ${dhEscapeHTML(
                        request.opponent_name
                    )}

                    <strong>

                        Avg
                        ${Number(
                            request.opponent_average ||
                            0
                        ).toFixed(2)}

                        • ${request.opponent_180s || 0}
                        × 180

                    </strong>

                </div>

            </div>


            <div
                class="dh-request-status ${request.status}"
            >

                ${statusText}

            </div>


            ${actionHTML}

        </div>
    `;
}


/* =========================================================
   ACCEPT / DISPUTE
========================================================= */

async function respondToMatchRequest(
    requestID,
    decision
) {

    const verb =

        decision ===
        "accept"

            ? "accept"

            : "dispute";


    if (
        !confirm(
            `Are you sure you want to ${verb} this match result?`
        )
    ) {

        return;
    }


    try {

        const {
            data,
            error
        } =
            await dartHubSupabase
                .rpc(
                    "respond_registered_match",
                    {

                        p_request_id:
                            requestID,

                        p_decision:
                            decision
                    }
                );


        if (
            error
        ) {

            throw error;
        }


        console.log(
            "Match response:",
            data
        );


        await loadMatchRequests();


        if (
            decision ===
            "accept"
        ) {

            if (
                typeof refreshCloudProfile ===
                "function"
            ) {

                await refreshCloudProfile();
            }


            alert(
                "Result accepted. Both Dart Hub profiles have been updated."
            );


        } else {

            alert(
                "Result disputed. No career statistics were changed."
            );
        }


    } catch (
        error
    ) {

        console.error(
            error
        );


        alert(
            "Dart Hub could not process the match response."
        );
    }
}


/* =========================================================
   CANCEL OUTGOING REQUEST
========================================================= */

async function cancelMatchRequest(
    requestID
) {

    if (
        !confirm(
            "Cancel this pending match result?"
        )
    ) {

        return;
    }


    try {

        const {
            error
        } =
            await dartHubSupabase
                .rpc(
                    "cancel_registered_match",
                    {

                        p_request_id:
                            requestID
                    }
                );


        if (
            error
        ) {

            throw error;
        }


        await loadMatchRequests();


    } catch (
        error
    ) {

        console.error(
            error
        );


        alert(
            "Could not cancel the result."
        );
    }
}


/* =========================================================
   MODE BUTTONS
========================================================= */

function connectModeButtonsV22() {

    document
        .querySelectorAll(
            ".mode-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        setTimeout(
                            () => {

                                setPlayerPanelGameModeV22(
                                    button.dataset.mode
                                );

                            },
                            0
                        );
                    }
                );
            }
        );
}


/* =========================================================
   MATCH BUTTONS
========================================================= */

function connectMatchButtonsV22() {

    const continueButton =
        document.getElementById(
            "continue-to-setup"
        );


    if (
        continueButton
    ) {

        continueButton.addEventListener(

            "click",

            validatePlayersV22,

            true
        );
    }


    const startButton =
        document.getElementById(
            "start-match"
        );


    if (
        startButton
    ) {

        startButton.addEventListener(
            "click",
            () => {

                createNewMatchUID();


                savePlayerConfigurationV22();


                setTimeout(
                    () => {

                        installMatchBadgesV22();

                        updateMatchBadgesV22();

                    },
                    0
                );
            }
        );
    }


    const resumeButton =
        document.getElementById(
            "resume-match-btn"
        );


    if (
        resumeButton
    ) {

        resumeButton.addEventListener(
            "click",
            () => {

                getCurrentMatchUID();


                setTimeout(
                    () => {

                        installMatchBadgesV22();

                        updateMatchBadgesV22();

                    },
                    0
                );
            }
        );
    }
}


/* =========================================================
   WATCH ACCOUNT
========================================================= */

function watchAccountV22() {

    const element =
        document.getElementById(
            "current-user-name"
        );


    if (
        element
    ) {

        const observer =
            new MutationObserver(
                () => {

                    refreshPlayerCodeV22();

                    updatePlayerSelectionV22();


                    setTimeout(
                        loadMatchRequests,
                        50
                    );
                }
            );


        observer.observe(

            element,

            {

                childList:
                    true,

                subtree:
                    true,

                characterData:
                    true
            }
        );
    }


    setTimeout(
        () => {

            refreshPlayerCodeV22();

            loadMatchRequests();

        },
        800
    );


    setTimeout(
        () => {

            refreshPlayerCodeV22();

            loadMatchRequests();

        },
        2500
    );
}


/* =========================================================
   INITIALISE
========================================================= */

function initialiseDartHubV22() {

    installV22Styles();


    installPlayerSelectionV22();


    installPlayerCodeCardV22();


    installMatchRequestsCard();


    installMatchBadgesV22();


    installAccountIndexOverrideV22();


    installCloudSaveOverrideV22();


    connectModeButtonsV22();


    connectMatchButtonsV22();


    watchAccountV22();


    setPlayerPanelGameModeV22(

        typeof selectedMode !==
        "undefined"

            ? selectedMode

            : "501"
    );


    updatePlayerSelectionV22();


    updateMatchBadgesV22();


    console.log(
        "Dart Hub v22 confirmation system ready."
    );
}


initialiseDartHubV22();