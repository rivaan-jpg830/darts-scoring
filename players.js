"use strict";


/* =========================================================
   DART HUB
   PLAYER IDENTITY + REGISTERED PLAYERS
   VERSION 21
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const DART_HUB_ACCOUNT_SLOT_KEY =
    "dart-hub-account-player-slot-v21";


const DART_HUB_OPPONENT_TYPE_KEY =
    "dart-hub-opponent-type-v21";


const DART_HUB_REGISTERED_PLAYER_KEY =
    "dart-hub-registered-player-v21";


/* =========================================================
   STATE
========================================================= */

let dartHubAccountPlayerSlot =

    Number(
        localStorage.getItem(
            DART_HUB_ACCOUNT_SLOT_KEY
        )
    ) ===
    2

        ? 2

        : 1;


let dartHubOpponentType =

    localStorage.getItem(
        DART_HUB_OPPONENT_TYPE_KEY
    ) ===
    "registered"

        ? "registered"

        : "guest";


let dartHubRegisteredOpponent =
    null;


let registeredCloudSaveRunning =
    false;


let identityPanel =
    null;


/* =========================================================
   LOAD SAVED REGISTERED PLAYER
========================================================= */

try {

    const savedRegisteredPlayer =
        JSON.parse(

            localStorage.getItem(
                DART_HUB_REGISTERED_PLAYER_KEY
            )
            ||
            "null"
        );


    if (
        savedRegisteredPlayer &&
        savedRegisteredPlayer.user_id
    ) {

        dartHubRegisteredOpponent =
            savedRegisteredPlayer;
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

function normaliseDartHubName(
    value
) {

    return String(
        value ||
        ""
    )
        .trim()
        .toLowerCase();
}


function normalisePlayerCode(
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


function getSignedInDartHubName() {

    if (
        typeof currentCloudProfile !==
            "undefined" &&
        currentCloudProfile &&
        currentCloudProfile.display_name
    ) {

        return currentCloudProfile.display_name;
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


function getMyPlayerCode() {

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


function getOpponentSlot() {

    return (

        dartHubAccountPlayerSlot ===
        1

            ? 2

            : 1
    );
}


function getNameInput(
    slot
) {

    return document.getElementById(

        slot ===
        1

            ? "p1-name-input"

            : "p2-name-input"
    );
}


function getPlayerBoxV21(
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
   SAVE IDENTITY SETTINGS
========================================================= */

function saveIdentityState() {

    localStorage.setItem(

        DART_HUB_ACCOUNT_SLOT_KEY,

        String(
            dartHubAccountPlayerSlot
        )
    );


    localStorage.setItem(

        DART_HUB_OPPONENT_TYPE_KEY,

        dartHubOpponentType
    );


    if (
        dartHubRegisteredOpponent
    ) {

        localStorage.setItem(

            DART_HUB_REGISTERED_PLAYER_KEY,

            JSON.stringify(
                dartHubRegisteredOpponent
            )
        );


    } else {

        localStorage.removeItem(
            DART_HUB_REGISTERED_PLAYER_KEY
        );
    }
}


/* =========================================================
   STYLES
========================================================= */

function installRegisteredPlayerStyles() {

    if (
        document.getElementById(
            "dart-hub-v21-player-styles"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "dart-hub-v21-player-styles";


    style.textContent = `

        .v21-player-panel {

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


        .v21-player-panel.hidden {

            display: none !important;
        }


        .v21-player-heading {

            margin-bottom: 4px;

            color: #00aaff;

            font-size: 19px;

            font-weight: 900;
        }


        .v21-player-help {

            margin:
                0
                0
                12px;

            color: #8fa1aa;

            font-size: 12px;

            line-height: 1.45;
        }


        .v21-player-grid {

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


        .v21-player-card {

            padding: 11px;

            border:
                1px solid
                #30434c;

            border-radius: 10px;

            background: #080d10;
        }


        .v21-player-card-title {

            margin-bottom: 8px;

            color: #eaf0f3;

            font-size: 13px;

            font-weight: 900;
        }


        .v21-player-options {

            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap: 5px;
        }


        .v21-player-choice {

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


        .v21-player-choice.me-active {

            border-color: #00aaff;

            background:
                linear-gradient(
                    135deg,
                    #008fd6,
                    #00598d
                );

            color: white;
        }


        .v21-player-choice.guest-active {

            border-color: #138354;

            background:
                linear-gradient(
                    135deg,
                    #087247,
                    #04502f
                );

            color: white;
        }


        .v21-player-choice.registered-active {

            border-color: #a96cff;

            background:
                linear-gradient(
                    135deg,
                    #7142ad,
                    #47266e
                );

            color: white;
        }


        .registered-player-finder {

            margin-top: 9px;

            padding: 9px;

            border:
                1px solid
                #47375e;

            border-radius: 8px;

            background: #110d17;
        }


        .registered-player-finder.hidden {

            display: none !important;
        }


        .registered-player-finder label {

            display: block;

            margin-bottom: 5px;

            color: #baa8d1;

            font-size: 11px;

            font-weight: 800;
        }


        .registered-player-find-row {

            display: grid;

            grid-template-columns:
                1fr
                auto;

            gap: 6px;
        }


        .registered-player-code-input {

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


        .registered-player-code-input:focus {

            border-color: #a96cff;
        }


        .registered-find-btn {

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


        .registered-find-status {

            min-height: 18px;

            margin-top: 6px;

            color: #baa8d1;

            font-size: 11px;
        }


        .registered-find-status.success {

            color: #75ffc1;
        }


        .registered-find-status.error {

            color: #ff9292;
        }


        .me-name-field {

            border-color:
                #00aaff !important;

            background:
                #081c27 !important;

            color:
                #75d8ff !important;

            font-weight: 900;
        }


        .registered-name-field {

            border-color:
                #a96cff !important;

            background:
                #180f24 !important;

            color:
                #d2aaff !important;

            font-weight: 900;
        }


        .v21-selection-summary {

            margin-top: 10px;

            padding: 8px;

            border-radius: 7px;

            background: #080d10;

            color: #b9d6e2;

            font-size: 12px;

            font-weight: 700;

            text-align: center;
        }


        .my-player-code-card {

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


        .my-player-code-label {

            color: #9d8cb4;

            font-size: 10px;

            font-weight: 800;

            text-transform: uppercase;

            letter-spacing: 1px;
        }


        .my-player-code-value {

            margin-top: 3px;

            color: #c495ff;

            font-size: 25px;

            font-weight: 1000;

            letter-spacing: 3px;
        }


        .my-player-code-help {

            margin-top: 4px;

            color: #786b88;

            font-size: 10px;
        }


        .match-player-badge {

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


        .match-player-badge.hidden {

            display: none !important;
        }


        .match-player-badge.you {

            border:
                1px solid
                #00aaff;

            background: #082535;

            color: #70d7ff;
        }


        .match-player-badge.registered {

            border:
                1px solid
                #a96cff;

            background: #251238;

            color: #d6b2ff;
        }


        @media (
            max-width:
            650px
        ) {

            .v21-player-grid {

                grid-template-columns:
                    1fr;
            }


            .v21-player-options {

                grid-template-columns:
                    repeat(
                        3,
                        1fr
                    );
            }


            .registered-player-find-row {

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
   BUILD PLAYER UI
========================================================= */

function installPlayerIdentityV21() {

    const nameScreenElement =
        document.getElementById(
            "name-screen"
        );


    if (
        !nameScreenElement
    ) {

        return;
    }


    const oldPanel =
        document.getElementById(
            "player-identity-panel"
        );


    if (
        oldPanel
    ) {

        oldPanel.remove();
    }


    if (
        document.getElementById(
            "v21-player-panel"
        )
    ) {

        identityPanel =
            document.getElementById(
                "v21-player-panel"
            );


        return;
    }


    const firstSetupRow =
        nameScreenElement
            .querySelector(
                ".setup-row"
            );


    if (
        !firstSetupRow
    ) {

        return;
    }


    identityPanel =
        document.createElement(
            "div"
        );


    identityPanel.id =
        "v21-player-panel";


    identityPanel.className =
        "v21-player-panel";


    identityPanel.innerHTML = `

        <div class="v21-player-heading">

            Choose Players

        </div>


        <p class="v21-player-help">

            One side must be your signed-in Dart Hub
            account. The opponent can be a guest or
            another registered Dart Hub player.

        </p>


        <div class="v21-player-grid">


            <div
                id="v21-player-card-1"
                class="v21-player-card"
            >

                <div class="v21-player-card-title">

                    Player 1

                </div>


                <div class="v21-player-options">

                    <button
                        id="v21-p1-me"
                        class="v21-player-choice"
                        type="button"
                    >
                        👤 Me
                    </button>

                    <button
                        id="v21-p1-guest"
                        class="v21-player-choice"
                        type="button"
                    >
                        Guest
                    </button>

                    <button
                        id="v21-p1-registered"
                        class="v21-player-choice"
                        type="button"
                    >
                        ☁ Registered
                    </button>

                </div>


                <div
                    id="v21-p1-finder"
                    class="registered-player-finder hidden"
                >

                    <label>
                        Dart Hub Player Code
                    </label>


                    <div class="registered-player-find-row">

                        <input
                            id="v21-p1-code"
                            class="registered-player-code-input"
                            type="text"
                            maxlength="8"
                            placeholder="PLAYER CODE"
                            autocomplete="off"
                        >

                        <button
                            id="v21-p1-find"
                            class="registered-find-btn"
                            type="button"
                        >
                            Find
                        </button>

                    </div>


                    <div
                        id="v21-p1-status"
                        class="registered-find-status"
                    ></div>

                </div>

            </div>



            <div
                id="v21-player-card-2"
                class="v21-player-card"
            >

                <div class="v21-player-card-title">

                    Player 2

                </div>


                <div class="v21-player-options">

                    <button
                        id="v21-p2-me"
                        class="v21-player-choice"
                        type="button"
                    >
                        👤 Me
                    </button>

                    <button
                        id="v21-p2-guest"
                        class="v21-player-choice"
                        type="button"
                    >
                        Guest
                    </button>

                    <button
                        id="v21-p2-registered"
                        class="v21-player-choice"
                        type="button"
                    >
                        ☁ Registered
                    </button>

                </div>


                <div
                    id="v21-p2-finder"
                    class="registered-player-finder hidden"
                >

                    <label>
                        Dart Hub Player Code
                    </label>


                    <div class="registered-player-find-row">

                        <input
                            id="v21-p2-code"
                            class="registered-player-code-input"
                            type="text"
                            maxlength="8"
                            placeholder="PLAYER CODE"
                            autocomplete="off"
                        >

                        <button
                            id="v21-p2-find"
                            class="registered-find-btn"
                            type="button"
                        >
                            Find
                        </button>

                    </div>


                    <div
                        id="v21-p2-status"
                        class="registered-find-status"
                    ></div>

                </div>

            </div>

        </div>


        <div
            id="v21-selection-summary"
            class="v21-selection-summary"
        ></div>
    `;


    nameScreenElement.insertBefore(

        identityPanel,

        firstSetupRow
    );


    document
        .getElementById(
            "v21-p1-me"
        )
        .onclick =
            () =>
                chooseMeSlot(
                    1
                );


    document
        .getElementById(
            "v21-p2-me"
        )
        .onclick =
            () =>
                chooseMeSlot(
                    2
                );


    document
        .getElementById(
            "v21-p1-guest"
        )
        .onclick =
            () =>
                chooseOpponentType(
                    1,
                    "guest"
                );


    document
        .getElementById(
            "v21-p2-guest"
        )
        .onclick =
            () =>
                chooseOpponentType(
                    2,
                    "guest"
                );


    document
        .getElementById(
            "v21-p1-registered"
        )
        .onclick =
            () =>
                chooseOpponentType(
                    1,
                    "registered"
                );


    document
        .getElementById(
            "v21-p2-registered"
        )
        .onclick =
            () =>
                chooseOpponentType(
                    2,
                    "registered"
                );


    document
        .getElementById(
            "v21-p1-find"
        )
        .onclick =
            () =>
                findRegisteredPlayer(
                    1
                );


    document
        .getElementById(
            "v21-p2-find"
        )
        .onclick =
            () =>
                findRegisteredPlayer(
                    2
                );


    document
        .getElementById(
            "v21-p1-code"
        )
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    findRegisteredPlayer(
                        1
                    );
                }
            }
        );


    document
        .getElementById(
            "v21-p2-code"
        )
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    findRegisteredPlayer(
                        2
                    );
                }
            }
        );


    updateIdentityUIV21();
}


/* =========================================================
   MY PLAYER CODE CARD
========================================================= */

function installMyPlayerCodeCard() {

    if (
        document.getElementById(
            "my-player-code-card"
        )
    ) {

        refreshMyPlayerCodeCard();


        return;
    }


    const userBarElement =
        document.getElementById(
            "dart-hub-user-bar"
        );


    if (
        !userBarElement
    ) {

        return;
    }


    const card =
        document.createElement(
            "div"
        );


    card.id =
        "my-player-code-card";


    card.className =
        "my-player-code-card";


    card.innerHTML = `

        <div class="my-player-code-label">

            Your Dart Hub Player Code

        </div>


        <div
            id="my-player-code-value"
            class="my-player-code-value"
        >
            --------
        </div>


        <div class="my-player-code-help">

            Give this code to another Dart Hub player
            so they can select your registered profile.

        </div>
    `;


    userBarElement.insertAdjacentElement(

        "afterend",

        card
    );


    refreshMyPlayerCodeCard();
}


function refreshMyPlayerCodeCard() {

    const valueElement =
        document.getElementById(
            "my-player-code-value"
        );


    if (
        !valueElement
    ) {

        return;
    }


    const code =
        getMyPlayerCode();


    valueElement.textContent =
        code ||
        "--------";
}


/* =========================================================
   CHOOSE ME
========================================================= */

function chooseMeSlot(
    slot
) {

    dartHubAccountPlayerSlot =

        slot ===
        2

            ? 2

            : 1;


    const opponentSlot =
        getOpponentSlot();


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


    saveIdentityState();

    updateIdentityUIV21();

    updateMatchPlayerBadges();
}


/* =========================================================
   CHOOSE GUEST OR REGISTERED
========================================================= */

function chooseOpponentType(
    slot,
    type
) {

    if (
        slot ===
        dartHubAccountPlayerSlot
    ) {

        alert(
            "That player is currently your signed-in Dart Hub account. Select Me on the other side first."
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


    saveIdentityState();

    updateIdentityUIV21();

    updateMatchPlayerBadges();
}


/* =========================================================
   FIND REGISTERED PLAYER
========================================================= */

async function findRegisteredPlayer(
    slot
) {

    if (
        slot ===
        dartHubAccountPlayerSlot
    ) {

        return;
    }


    const codeInput =
        document.getElementById(
            `v21-p${slot}-code`
        );


    const status =
        document.getElementById(
            `v21-p${slot}-status`
        );


    const code =
        normalisePlayerCode(
            codeInput.value
        );


    status.className =
        "registered-find-status";


    if (
        code.length !==
        8
    ) {

        status.textContent =
            "Enter the 8-character Dart Hub player code.";


        status.classList.add(
            "error"
        );


        return;
    }


    if (
        code ===
        normalisePlayerCode(
            getMyPlayerCode()
        )
    ) {

        status.textContent =
            "That is your own Dart Hub account.";


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


            saveIdentityState();


            status.textContent =
                "No Dart Hub player found with that code.";


            status.classList.add(
                "error"
            );


            return;
        }


        if (
            typeof currentDartHubUser !==
                "undefined" &&
            currentDartHubUser &&
            data.user_id ===
                currentDartHubUser.id
        ) {

            status.textContent =
                "That is your own Dart Hub account.";


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


        saveIdentityState();


        const nameInput =
            getNameInput(
                slot
            );


        nameInput.value =
            data.display_name;


        status.textContent =
            `Found: ${data.display_name} ✓`;


        status.classList.add(
            "success"
        );


        updateIdentityUIV21();


    } catch (
        error
    ) {

        console.error(
            "Dart Hub registered player lookup:",
            error
        );


        status.textContent =
            "Could not search for the player. Check your connection.";


        status.classList.add(
            "error"
        );
    }
}


/* =========================================================
   UPDATE NAME SCREEN
========================================================= */

function updateIdentityUIV21() {

    if (
        !identityPanel
    ) {

        return;
    }


    const meSlot =
        dartHubAccountPlayerSlot;


    const opponentSlot =
        getOpponentSlot();


    const accountName =
        getSignedInDartHubName();


    for (
        const slot
        of [
            1,
            2
        ]
    ) {

        const meButton =
            document.getElementById(
                `v21-p${slot}-me`
            );


        const guestButton =
            document.getElementById(
                `v21-p${slot}-guest`
            );


        const registeredButton =
            document.getElementById(
                `v21-p${slot}-registered`
            );


        const finder =
            document.getElementById(
                `v21-p${slot}-finder`
            );


        const input =
            getNameInput(
                slot
            );


        meButton.classList.remove(
            "me-active"
        );


        guestButton.classList.remove(
            "guest-active"
        );


        registeredButton.classList.remove(
            "registered-active"
        );


        input.classList.remove(
            "me-name-field"
        );


        input.classList.remove(
            "registered-name-field"
        );


        if (
            slot ===
            meSlot
        ) {

            meButton.classList.add(
                "me-active"
            );


            input.value =
                accountName;


            input.readOnly =
                true;


            input.classList.add(
                "me-name-field"
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

            registeredButton.classList.add(
                "registered-active"
            );


            finder.classList.remove(
                "hidden"
            );


            input.readOnly =
                true;


            input.classList.add(
                "registered-name-field"
            );


            if (
                dartHubRegisteredOpponent &&
                dartHubRegisteredOpponent.slot ===
                    slot
            ) {

                input.value =
                    dartHubRegisteredOpponent
                        .display_name;


                document
                    .getElementById(
                        `v21-p${slot}-code`
                    )
                    .value =
                        dartHubRegisteredOpponent
                            .player_code;


                const status =
                    document.getElementById(
                        `v21-p${slot}-status`
                    );


                status.textContent =
                    `Found: ${dartHubRegisteredOpponent.display_name} ✓`;


                status.className =
                    "registered-find-status success";


            } else {

                input.value =
                    "";


                const status =
                    document.getElementById(
                        `v21-p${slot}-status`
                    );


                status.textContent =
                    "Enter the player's Dart Hub code.";
            }


        } else {

            guestButton.classList.add(
                "guest-active"
            );


            finder.classList.add(
                "hidden"
            );


            input.readOnly =
                false;


            if (
                normaliseDartHubName(
                    input.value
                ) ===
                normaliseDartHubName(
                    accountName
                )
            ) {

                input.value =
                    "";
            }
        }
    }


    const summary =
        document.getElementById(
            "v21-selection-summary"
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

                `Player ${meSlot}: ${accountName} (YOU) • ` +

                `Player ${opponentSlot}: ` +

                `${dartHubRegisteredOpponent.display_name} (REGISTERED)`;


        } else {

            summary.textContent =

                `Player ${meSlot}: ${accountName} (YOU) • ` +

                `Player ${opponentSlot}: Guest`;
        }
    }
}


/* =========================================================
   CRICKET
========================================================= */

function updateIdentityForGameMode(
    mode
) {

    if (
        !identityPanel
    ) {

        return;
    }


    if (
        mode ===
        "cricket"
    ) {

        identityPanel.classList.add(
            "hidden"
        );


        const p1 =
            getNameInput(
                1
            );


        const p2 =
            getNameInput(
                2
            );


        p1.readOnly =
            false;


        p2.readOnly =
            false;


        p1.classList.remove(
            "me-name-field"
        );


        p1.classList.remove(
            "registered-name-field"
        );


        p2.classList.remove(
            "me-name-field"
        );


        p2.classList.remove(
            "registered-name-field"
        );


        return;
    }


    identityPanel.classList.remove(
        "hidden"
    );


    updateIdentityUIV21();
}


/* =========================================================
   VALIDATE BEFORE MATCH SETUP
========================================================= */

function validatePlayersBeforeContinue(
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


    const opponentSlot =
        getOpponentSlot();


    const opponentInput =
        getNameInput(
            opponentSlot
        );


    const accountName =
        getSignedInDartHubName();


    getNameInput(
        dartHubAccountPlayerSlot
    ).value =
        accountName;


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
                "Find and select the registered Dart Hub opponent before continuing."
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
            `Enter the guest name for Player ${opponentSlot}.`
        );


        opponentInput.focus();


        return;
    }


    if (
        normaliseDartHubName(
            guestName
        ) ===
        normaliseDartHubName(
            accountName
        )
    ) {

        event.preventDefault();

        event.stopImmediatePropagation();


        alert(
            "The guest player cannot have the same name as your Dart Hub profile."
        );


        opponentInput.focus();
    }
}


/* =========================================================
   SCOREBOARD BADGES
========================================================= */

function installMatchPlayerBadges() {

    for (
        const slot
        of [
            1,
            2
        ]
    ) {

        const box =
            getPlayerBoxV21(
                slot
            );


        if (
            !box
        ) {

            continue;
        }


        if (
            !box.querySelector(
                `.match-player-badge.you[data-slot="${slot}"]`
            )
        ) {

            const badge =
                document.createElement(
                    "div"
                );


            badge.className =
                "match-player-badge you hidden";


            badge.dataset.slot =
                String(
                    slot
                );


            badge.textContent =
                "YOU";


            box.appendChild(
                badge
            );
        }


        if (
            !box.querySelector(
                `.match-player-badge.registered[data-slot="${slot}"]`
            )
        ) {

            const badge =
                document.createElement(
                    "div"
                );


            badge.className =
                "match-player-badge registered hidden";


            badge.dataset.slot =
                String(
                    slot
                );


            badge.textContent =
                "REGISTERED";


            box.appendChild(
                badge
            );
        }
    }


    updateMatchPlayerBadges();
}


function updateMatchPlayerBadges() {

    document
        .querySelectorAll(
            ".match-player-badge.you"
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
            ".match-player-badge.registered"
        )
        .forEach(
            badge => {

                const slot =
                    Number(
                        badge.dataset.slot
                    );


                const registeredSlot =

                    dartHubOpponentType ===
                        "registered" &&
                    dartHubRegisteredOpponent

                        ? dartHubRegisteredOpponent
                            .slot

                        : 0;


                badge.classList.toggle(

                    "hidden",

                    slot !==
                    registeredSlot
                );
            }
        );
}


/* =========================================================
   OVERRIDE ACCOUNT PLAYER INDEX
========================================================= */

function installAccountPlayerIndexOverride() {

    if (
        typeof getAccountPlayerIndex !==
        "function"
    ) {

        return;
    }


    getAccountPlayerIndex =
        function () {

            return (

                dartHubAccountPlayerSlot -
                1
            );
        };
}


/* =========================================================
   MATCH AVERAGE
========================================================= */

function registeredMatchAverage(
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
   UUID
========================================================= */

function makeDartHubMatchUID() {

    if (
        crypto &&
        typeof crypto.randomUUID ===
            "function"
    ) {

        return crypto.randomUUID();
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


/* =========================================================
   SAVE REGISTERED MATCH
========================================================= */

async function saveRegisteredCloudMatch() {

    if (
        registeredCloudSaveRunning
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
        typeof currentDartHubUser ===
            "undefined" ||
        !currentDartHubUser
    ) {

        return;
    }


    registeredCloudSaveRunning =
        true;


    try {

        const userIndex =
            dartHubAccountPlayerSlot -
            1;


        const opponentIndex =
            userIndex ===
            0

                ? 1

                : 0;


        const userPlayer =
            players[
                userIndex
            ];


        const opponentPlayer =
            players[
                opponentIndex
            ];


        const userAverage =
            registeredMatchAverage(
                userPlayer
            );


        const opponentAverage =
            registeredMatchAverage(
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
                    "record_registered_match",
                    {

                        p_match_uid:
                            makeDartHubMatchUID(),

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
                                userAverage.toFixed(
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
                                userPlayer.stats
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
                                userPlayer.stats
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
                                userPlayer.stats
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
                                userPlayer.stats
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
                                userPlayer.stats
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
                                userPlayer.stats
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
                                userPlayer.stats
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
                                userPlayer.stats
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
            "Registered Dart Hub match saved:",
            data
        );


        if (
            typeof refreshCloudProfile ===
            "function"
        ) {

            await refreshCloudProfile();
        }


    } catch (
        error
    ) {

        console.error(
            "Dart Hub registered match save failed:",
            error
        );


        alert(
            "The match finished, but Dart Hub could not update both registered profiles. Check your internet connection."
        );


    } finally {

        registeredCloudSaveRunning =
            false;
    }
}


/* =========================================================
   OVERRIDE CLOUD MATCH SAVE
========================================================= */

function installRegisteredMatchSaveOverride() {

    if (
        window.__dartHubV21CloudSaveOverride
    ) {

        return;
    }


    if (
        typeof saveCompletedCloudMatch !==
        "function"
    ) {

        console.warn(
            "Dart Hub cloud save function was not found."
        );


        return;
    }


    window.__dartHubV21CloudSaveOverride =
        true;


    const originalGuestCloudSave =
        saveCompletedCloudMatch;


    saveCompletedCloudMatch =
        async function () {

            if (
                dartHubOpponentType ===
                    "registered" &&
                dartHubRegisteredOpponent
            ) {

                await saveRegisteredCloudMatch();


                return;
            }


            await originalGuestCloudSave();
        };
}


/* =========================================================
   WATCH PROFILE NAME / CODE
========================================================= */

function watchCurrentProfile() {

    const nameElement =
        document.getElementById(
            "current-user-name"
        );


    if (
        nameElement
    ) {

        const observer =
            new MutationObserver(
                () => {

                    updateIdentityUIV21();

                    refreshMyPlayerCodeCard();
                }
            );


        observer.observe(

            nameElement,

            {

                childList:
                    true,

                characterData:
                    true,

                subtree:
                    true
            }
        );
    }


    setTimeout(
        refreshMyPlayerCodeCard,
        500
    );


    setTimeout(
        refreshMyPlayerCodeCard,
        1500
    );


    setTimeout(
        refreshMyPlayerCodeCard,
        3000
    );
}


/* =========================================================
   MODE BUTTONS
========================================================= */

function connectModeButtonsV21() {

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

                                updateIdentityForGameMode(
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

function connectMatchButtonsV21() {

    const continueButton =
        document.getElementById(
            "continue-to-setup"
        );


    if (
        continueButton
    ) {

        continueButton.addEventListener(

            "click",

            validatePlayersBeforeContinue,

            true
        );
    }


    const startMatchButton =
        document.getElementById(
            "start-match"
        );


    if (
        startMatchButton
    ) {

        startMatchButton.addEventListener(
            "click",
            () => {

                saveIdentityState();


                setTimeout(
                    () => {

                        installMatchPlayerBadges();

                        updateMatchPlayerBadges();

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

                setTimeout(
                    () => {

                        installMatchPlayerBadges();

                        updateMatchPlayerBadges();

                    },
                    0
                );
            }
        );
    }
}


/* =========================================================
   INITIALISE
========================================================= */

function initialiseDartHubPlayersV21() {

    installRegisteredPlayerStyles();

    installPlayerIdentityV21();

    installMyPlayerCodeCard();

    installMatchPlayerBadges();

    installAccountPlayerIndexOverride();

    installRegisteredMatchSaveOverride();

    watchCurrentProfile();

    connectModeButtonsV21();

    connectMatchButtonsV21();


    updateIdentityForGameMode(

        typeof selectedMode !==
        "undefined"

            ? selectedMode

            : "501"
    );


    updateIdentityUIV21();

    updateMatchPlayerBadges();


    console.log(
        "Dart Hub registered-player system v21 ready."
    );
}


initialiseDartHubPlayersV21();