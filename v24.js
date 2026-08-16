"use strict";


/* =========================================================
   DART HUB
   MATCH CONFIRMATION PAGE
   RIVALS PAGE
   101 / 301 / 501 MAIN BREAKDOWN
   VERSION 24
========================================================= */


/* =========================================================
   STATE
========================================================= */

let v24ConfirmationFilter =
    "action";


let v24RivalMode =
    "overall";


let v24RivalMatches =
    [];


let v24SelectedRival =
    null;


/* =========================================================
   ESCAPE HTML
========================================================= */

function v24Escape(
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
   HIDE ALL DART HUB SCREENS
========================================================= */

function v24HideScreens() {

    [

        "mode-screen",

        "name-screen",

        "setup-screen",

        "game-screen",

        "cricket-screen",

        "caller-screen",

        "cloud-profile-screen",

        "v24-confirmations-screen",

        "v24-rivals-screen"

    ].forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (
                element
            ) {

                element.classList.add(
                    "hidden"
                );
            }
        }
    );
}


/* =========================================================
   BACK HOME
========================================================= */

function v24GoHome() {

    v24HideScreens();


    document
        .getElementById(
            "mode-screen"
        )
        .classList.remove(
            "hidden"
        );
}


/* =========================================================
   INSTALL HOME BUTTONS
========================================================= */

function v24InstallHomeButtons() {

    const modeButtons =
        document.querySelector(
            "#mode-screen .mode-buttons"
        );


    if (
        !modeButtons
    ) {

        return;
    }


    /*
       PROFILE already exists from auth-core.
    */


    if (
        !document.getElementById(
            "v24-confirmations-home-btn"
        )
    ) {

        const confirmations =
            document.createElement(
                "button"
            );


        confirmations.id =
            "v24-confirmations-home-btn";


        confirmations.className =
            "btn-secondary";


        confirmations.type =
            "button";


        confirmations.innerHTML = `

            📨 Match Confirmations

            <span
                id="v24-confirmation-badge"
                class="v24-count-badge hidden"
            >
                0
            </span>
        `;


        confirmations.onclick =
            openV24Confirmations;


        modeButtons.appendChild(
            confirmations
        );
    }


    if (
        !document.getElementById(
            "v24-rivals-home-btn"
        )
    ) {

        const rivals =
            document.createElement(
                "button"
            );


        rivals.id =
            "v24-rivals-home-btn";


        rivals.className =
            "btn-secondary";


        rivals.type =
            "button";


        rivals.innerHTML =
            "⚔️ Rivals";


        rivals.onclick =
            openV24Rivals;


        modeButtons.appendChild(
            rivals
        );
    }
}


/* =========================================================
   REMOVE OLD CONFIRMATION CARD FROM HOME
========================================================= */

function v24HideOldConfirmationCard() {

    const oldCard =
        document.getElementById(
            "dh-match-requests-card"
        );


    if (
        oldCard
    ) {

        oldCard.style.display =
            "none";
    }
}


/* =========================================================
   COMMON PAGE STYLES
========================================================= */

function v24InstallStyles() {

    if (
        document.getElementById(
            "dart-hub-v24-styles"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "dart-hub-v24-styles";


    style.textContent = `

        .v24-full-screen {

            position: fixed;

            inset: 0;

            z-index: 17500;

            overflow-y: auto;

            background:
                radial-gradient(
                    circle at top,
                    #17303d,
                    #071015 42%,
                    #030303 100%
                );

            color: white;
        }


        .v24-full-screen.hidden {

            display: none !important;
        }


        .v24-page {

            width:
                min(
                    950px,
                    calc(100% - 18px)
                );

            margin: auto;

            padding:
                15px
                0
                45px;
        }


        .v24-page-header {

            display: grid;

            grid-template-columns:
                auto
                1fr;

            align-items: center;

            gap: 12px;

            margin-bottom: 13px;
        }


        .v24-back {

            min-height: 42px;

            padding:
                7px
                12px;

            border:
                1px solid
                #344953;

            border-radius: 8px;

            background: #10181c;

            color: white;

            font-weight: 800;

            cursor: pointer;
        }


        .v24-page-title {

            color: #00aaff;

            font-size: 21px;

            font-weight: 1000;

            letter-spacing: 1px;
        }


        .v24-page-subtitle {

            margin:
                0
                0
                14px;

            color: #82949c;

            font-size: 12px;
        }


        .v24-count-badge {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            min-width: 22px;

            height: 22px;

            margin-left: 5px;

            padding:
                0
                6px;

            border-radius: 999px;

            background: #d72e2e;

            color: white;

            font-size: 11px;

            font-weight: 1000;
        }


        .v24-count-badge.hidden {

            display: none !important;
        }


        .v24-tabs {

            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    1fr
                );

            gap: 6px;

            margin-bottom: 12px;
        }


        .v24-tab {

            min-height: 46px;

            border:
                1px solid
                #33464f;

            border-radius: 8px;

            background: #101619;

            color: #9eabb1;

            font-weight: 900;

            cursor: pointer;
        }


        .v24-tab.active {

            border-color: #00aaff;

            background:
                linear-gradient(
                    135deg,
                    #0086c8,
                    #005989
                );

            color: white;
        }


        .v24-mode-tabs {

            display: grid;

            grid-template-columns:
                repeat(
                    4,
                    1fr
                );

            gap: 6px;

            margin-bottom: 12px;
        }


        .v24-mode-tab {

            min-height: 43px;

            border:
                1px solid
                #34464e;

            border-radius: 8px;

            background: #101619;

            color: #9ba9af;

            font-weight: 800;

            cursor: pointer;
        }


        .v24-mode-tab.active {

            border-color: #00aaff;

            background: #075985;

            color: white;
        }


        .v24-panel {

            padding: 12px;

            border:
                1px solid
                #293941;

            border-radius: 12px;

            background:
                linear-gradient(
                    145deg,
                    #101619,
                    #070a0c
                );
        }


        .v24-empty {

            padding: 25px;

            color: #83949c;

            text-align: center;
        }


        .v24-request {

            margin-bottom: 8px;

            padding: 11px;

            border:
                1px solid
                #293941;

            border-radius: 9px;

            background: #090d0f;
        }


        .v24-request.incoming {

            border-left:
                4px solid
                #a96cff;
        }


        .v24-request.outgoing {

            border-left:
                4px solid
                #00aaff;
        }


        .v24-request.accepted {

            border-left:
                4px solid
                #00c878;
        }


        .v24-request.disputed {

            border-left:
                4px solid
                #e04b4b;
        }


        .v24-request.cancelled {

            border-left:
                4px solid
                #777;
        }


        .v24-request-title {

            color: white;

            font-size: 15px;

            font-weight: 900;
        }


        .v24-request-meta {

            margin-top: 4px;

            color: #809198;

            font-size: 11px;

            line-height: 1.5;
        }


        .v24-request-result {

            margin-top: 8px;

            color: #d5e0e5;

            font-weight: 800;
        }


        .v24-request-actions {

            display: grid;

            grid-template-columns:
                repeat(
                    2,
                    1fr
                );

            gap: 6px;

            margin-top: 9px;
        }


        .v24-accept,
        .v24-dispute,
        .v24-cancel {

            min-height: 43px;

            border: none;

            border-radius: 8px;

            color: white;

            font-weight: 900;

            cursor: pointer;
        }


        .v24-accept {

            background: #087247;
        }


        .v24-dispute,
        .v24-cancel {

            background: #792323;
        }


        .v24-rival-card {

            display: grid;

            grid-template-columns:
                1fr
                auto;

            align-items: center;

            gap: 10px;

            margin-bottom: 8px;

            padding: 12px;

            border:
                1px solid
                #35434a;

            border-radius: 10px;

            background: #0e1417;

            cursor: pointer;
        }


        .v24-rival-name {

            color: white;

            font-size: 16px;

            font-weight: 1000;
        }


        .v24-rival-sub {

            margin-top: 3px;

            color: #819198;

            font-size: 11px;
        }


        .v24-rival-score {

            color: #00aaff;

            font-size: 23px;

            font-weight: 1000;
        }


        .v24-stat-grid {

            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap: 7px;
        }


        .v24-stat {

            padding: 11px;

            border:
                1px solid
                #293941;

            border-radius: 9px;

            background: #101619;

            text-align: center;
        }


        .v24-stat-label {

            color: #819098;

            font-size: 10px;

            text-transform: uppercase;
        }


        .v24-stat-value {

            margin-top: 4px;

            color: #00aaff;

            font-size: 25px;

            font-weight: 1000;
        }


        .v24-section {

            margin-top: 12px;

            padding: 11px;

            border:
                1px solid
                #293941;

            border-radius: 9px;

            background: #0b1013;
        }


        .v24-section h3 {

            margin:
                0
                0
                8px;

            color: #00aaff;
        }


        .v24-row {

            display: flex;

            justify-content: space-between;

            gap: 10px;

            padding:
                7px
                0;

            border-bottom:
                1px solid
                #202b30;
        }


        .v24-analysis {

            margin-top: 12px;

            padding: 12px;

            border-left:
                4px solid
                #00aaff;

            border-radius: 7px;

            background: #0c1c24;

            color: #c4d5dc;

            line-height: 1.5;
        }


        .v24-form {

            font-size: 23px;

            letter-spacing: 4px;
        }


        @media (
            max-width:
            650px
        ) {

            .v24-mode-tabs {

                grid-template-columns:
                    repeat(
                        2,
                        1fr
                    );
            }


            .v24-stat-grid {

                grid-template-columns:
                    repeat(
                        2,
                        1fr
                    );
            }


            .v24-request-actions {

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
   BUILD CONFIRMATIONS PAGE
========================================================= */

function v24InstallConfirmationPage() {

    if (
        document.getElementById(
            "v24-confirmations-screen"
        )
    ) {

        return;
    }


    const screen =
        document.createElement(
            "div"
        );


    screen.id =
        "v24-confirmations-screen";


    screen.className =
        "v24-full-screen hidden";


    screen.innerHTML = `

        <div class="v24-page">

            <div class="v24-page-header">

                <button
                    id="v24-confirmations-back"
                    class="v24-back"
                >
                    ← Dart Hub
                </button>


                <div class="v24-page-title">

                    📨 MATCH CONFIRMATIONS

                </div>

            </div>


            <p class="v24-page-subtitle">

                Review registered Dart Hub match results.

            </p>


            <div class="v24-tabs">

                <button
                    class="v24-tab active"
                    data-v24-confirmation-tab="action"
                >
                    Needs Action
                </button>


                <button
                    class="v24-tab"
                    data-v24-confirmation-tab="sent"
                >
                    Sent
                </button>


                <button
                    class="v24-tab"
                    data-v24-confirmation-tab="completed"
                >
                    Completed
                </button>

            </div>


            <div
                id="v24-confirmation-content"
                class="v24-panel"
            >

                <div class="v24-empty">
                    Loading…
                </div>

            </div>

        </div>
    `;


    document.body.appendChild(
        screen
    );


    document
        .getElementById(
            "v24-confirmations-back"
        )
        .onclick =
            v24GoHome;


    screen
        .querySelectorAll(
            "[data-v24-confirmation-tab]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        v24ConfirmationFilter =
                            button.dataset
                                .v24ConfirmationTab;


                        screen
                            .querySelectorAll(
                                "[data-v24-confirmation-tab]"
                            )
                            .forEach(
                                item => {

                                    item.classList.toggle(

                                        "active",

                                        item ===
                                        button
                                    );
                                }
                            );


                        v24LoadConfirmations();
                    };
            }
        );
}


/* =========================================================
   OPEN CONFIRMATIONS
========================================================= */

async function openV24Confirmations() {

    v24HideScreens();


    document
        .getElementById(
            "v24-confirmations-screen"
        )
        .classList.remove(
            "hidden"
        );


    await v24LoadConfirmations();
}


/* =========================================================
   LOAD CONFIRMATIONS
========================================================= */

async function v24GetConfirmationRows() {

    if (
        !currentDartHubUser
    ) {

        return [];
    }


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
                100
            );


    if (
        error
    ) {

        throw error;
    }


    return data ||
        [];
}


async function v24LoadConfirmations() {

    const container =
        document.getElementById(
            "v24-confirmation-content"
        );


    if (
        !container
    ) {

        return;
    }


    container.innerHTML = `

        <div class="v24-empty">
            Loading…
        </div>
    `;


    try {

        const requests =
            await v24GetConfirmationRows();


        v24UpdateConfirmationBadge(
            requests
        );


        let filtered =
            [];


        if (
            v24ConfirmationFilter ===
            "action"
        ) {

            filtered =
                requests.filter(
                    request =>

                        request.status ===
                        "pending"

                        &&

                        request.opponent_id ===
                        currentDartHubUser.id
                );
        }


        if (
            v24ConfirmationFilter ===
            "sent"
        ) {

            filtered =
                requests.filter(
                    request =>

                        request.status ===
                        "pending"

                        &&

                        request.submitted_by ===
                        currentDartHubUser.id
                );
        }


        if (
            v24ConfirmationFilter ===
            "completed"
        ) {

            filtered =
                requests.filter(
                    request =>
                        request.status !==
                        "pending"
                );
        }


        v24RenderConfirmationRows(
            container,
            filtered
        );


    } catch (
        error
    ) {

        console.error(
            error
        );


        container.innerHTML = `

            <div class="v24-empty">

                Unable to load match confirmations.

            </div>
        `;
    }
}


/* =========================================================
   CONFIRMATION BADGE
========================================================= */

function v24UpdateConfirmationBadge(
    requests
) {

    const badge =
        document.getElementById(
            "v24-confirmation-badge"
        );


    if (
        !badge ||
        !currentDartHubUser
    ) {

        return;
    }


    const count =
        requests.filter(
            request =>

                request.status ===
                "pending"

                &&

                request.opponent_id ===
                currentDartHubUser.id
        ).length;


    badge.textContent =
        String(
            count
        );


    badge.classList.toggle(

        "hidden",

        count ===
        0
    );
}


/* =========================================================
   RENDER CONFIRMATIONS
========================================================= */

function v24RenderConfirmationRows(
    container,
    rows
) {

    if (
        !rows.length
    ) {

        container.innerHTML = `

            <div class="v24-empty">

                ${
                    v24ConfirmationFilter ===
                    "action"

                        ? "Nothing needs your attention."

                        : v24ConfirmationFilter ===
                          "sent"

                            ? "No pending results sent."

                            : "No completed confirmations yet."
                }

            </div>
        `;


        return;
    }


    container.innerHTML =
        rows
            .map(
                v24ConfirmationHTML
            )
            .join(
                ""
            );


    container
        .querySelectorAll(
            "[data-v24-accept]"
        )
        .forEach(
            button => {

                button.onclick =
                    () =>
                        v24RespondConfirmation(

                            Number(
                                button.dataset
                                    .v24Accept
                            ),

                            "accept"
                        );
            }
        );


    container
        .querySelectorAll(
            "[data-v24-dispute]"
        )
        .forEach(
            button => {

                button.onclick =
                    () =>
                        v24RespondConfirmation(

                            Number(
                                button.dataset
                                    .v24Dispute
                            ),

                            "dispute"
                        );
            }
        );


    container
        .querySelectorAll(
            "[data-v24-cancel]"
        )
        .forEach(
            button => {

                button.onclick =
                    () =>
                        v24CancelConfirmation(

                            Number(
                                button.dataset
                                    .v24Cancel
                            )
                        );
            }
        );
}


/* =========================================================
   CONFIRMATION HTML
========================================================= */

function v24ConfirmationHTML(
    request
) {

    const incoming =

        request.opponent_id ===
        currentDartHubUser.id;


    const otherName =

        incoming

            ? request.submitter_name

            : request.opponent_name;


    const mode =

        request.game_mode ===
        "501 / Legs"

            ? "Legs"

            : request.game_mode;


    const details =
        request.match_details ||
        {};


    let summary =
        "";


    if (
        mode ===
        "Cricket"
    ) {

        const wickets =
            details.total_wickets ||
            "?";


        summary =

            `Cricket • ${wickets} wicket` +

            `${
                Number(
                    wickets
                ) ===
                1

                    ? ""

                    : "s"
            }`;


    } else {

        summary =

            `${mode}`

            +

            (
                request.starting_score

                    ? ` • ${request.starting_score}`

                    : ""
            );
    }


    const winner =

        mode ===
        "Cricket"

            ? (
                details.winner_name ||
                "Unknown"
            )

            : (
                request.winner_id ===
                request.submitted_by

                    ? request.submitter_name

                    : request.opponent_name
            );


    let actions =
        "";


    if (
        request.status ===
            "pending" &&
        incoming
    ) {

        actions = `

            <div class="v24-request-actions">

                <button
                    class="v24-accept"
                    data-v24-accept="${request.id}"
                >
                    ✓ Accept Result
                </button>


                <button
                    class="v24-dispute"
                    data-v24-dispute="${request.id}"
                >
                    ✕ Dispute
                </button>

            </div>
        `;
    }


    if (
        request.status ===
            "pending" &&
        !incoming
    ) {

        actions = `

            <div class="v24-request-actions">

                <button
                    class="v24-cancel"
                    data-v24-cancel="${request.id}"
                >
                    Cancel Request
                </button>

            </div>
        `;
    }


    return `

        <div
            class="v24-request ${request.status === "pending"
                ? incoming
                    ? "incoming"
                    : "outgoing"
                : request.status}"
        >

            <div class="v24-request-title">

                ${
                    incoming

                        ? "From "

                        : "To "
                }

                ${v24Escape(
                    otherName
                )}

            </div>


            <div class="v24-request-meta">

                ${v24Escape(
                    summary
                )}

                • ${new Date(
                    request.created_at
                ).toLocaleString()}

            </div>


            <div class="v24-request-result">

                Winner:
                ${v24Escape(
                    winner
                )}

            </div>


            <div class="v24-request-meta">

                Status:
                ${v24Escape(
                    request.status.toUpperCase()
                )}

            </div>


            ${actions}

        </div>
    `;
}


/* =========================================================
   RESPOND TO CONFIRMATION
========================================================= */

async function v24RespondConfirmation(
    requestID,
    decision
) {

    const wording =

        decision ===
        "accept"

            ? "accept"

            : "dispute";


    if (
        !confirm(
            `Are you sure you want to ${wording} this result?`
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
                    "respond_registered_match_v23",
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


        if (
            decision ===
            "accept" &&
        typeof refreshCloudProfile ===
            "function"
        ) {

            await refreshCloudProfile();
        }


        await v24LoadConfirmations();


    } catch (
        error
    ) {

        console.error(
            error
        );


        alert(
            "Dart Hub could not process the result."
        );
    }
}


/* =========================================================
   CANCEL CONFIRMATION
========================================================= */

async function v24CancelConfirmation(
    requestID
) {

    if (
        !confirm(
            "Cancel this pending result?"
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


        await v24LoadConfirmations();


    } catch (
        error
    ) {

        console.error(
            error
        );


        alert(
            "Dart Hub could not cancel the result."
        );
    }
}


/* =========================================================
   BUILD RIVALS PAGE
========================================================= */

function v24InstallRivalsPage() {

    if (
        document.getElementById(
            "v24-rivals-screen"
        )
    ) {

        return;
    }


    const screen =
        document.createElement(
            "div"
        );


    screen.id =
        "v24-rivals-screen";


    screen.className =
        "v24-full-screen hidden";


    screen.innerHTML = `

        <div class="v24-page">

            <div class="v24-page-header">

                <button
                    id="v24-rivals-back"
                    class="v24-back"
                >
                    ← Dart Hub
                </button>


                <div class="v24-page-title">

                    ⚔️ RIVALS

                </div>

            </div>


            <p class="v24-page-subtitle">

                Head-to-head statistics from accepted
                registered-player matches.

            </p>


            <div class="v24-mode-tabs">

                <button
                    class="v24-mode-tab active"
                    data-v24-rival-mode="overall"
                >
                    Overall
                </button>


                <button
                    class="v24-mode-tab"
                    data-v24-rival-mode="legs"
                >
                    Legs
                </button>


                <button
                    class="v24-mode-tab"
                    data-v24-rival-mode="sets"
                >
                    Sets + Legs
                </button>


                <button
                    class="v24-mode-tab"
                    data-v24-rival-mode="cricket"
                >
                    Cricket
                </button>

            </div>


            <div
                id="v24-rivals-content"
                class="v24-panel"
            >

                <div class="v24-empty">
                    Loading rivals…
                </div>

            </div>

        </div>
    `;


    document.body.appendChild(
        screen
    );


    document
        .getElementById(
            "v24-rivals-back"
        )
        .onclick =
            () => {

                if (
                    v24SelectedRival
                ) {

                    v24SelectedRival =
                        null;


                    v24RenderRivals();


                } else {

                    v24GoHome();
                }
            };


    screen
        .querySelectorAll(
            "[data-v24-rival-mode]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        v24RivalMode =
                            button.dataset
                                .v24RivalMode;


                        screen
                            .querySelectorAll(
                                "[data-v24-rival-mode]"
                            )
                            .forEach(
                                item => {

                                    item.classList.toggle(

                                        "active",

                                        item ===
                                        button
                                    );
                                }
                            );


                        v24RenderRivals();
                    };
            }
        );
}


/* =========================================================
   OPEN RIVALS
========================================================= */

async function openV24Rivals() {

    v24HideScreens();


    document
        .getElementById(
            "v24-rivals-screen"
        )
        .classList.remove(
            "hidden"
        );


    v24SelectedRival =
        null;


    await v24LoadRivals();
}


/* =========================================================
   LOAD RIVAL MATCHES
========================================================= */

async function v24LoadRivals() {

    const container =
        document.getElementById(
            "v24-rivals-content"
        );


    container.innerHTML = `

        <div class="v24-empty">
            Loading rivals…
        </div>
    `;


    try {

        const {
            data,
            error
        } =
            await dartHubSupabase

                .from(
                    "matches"
                )

                .select(
                    "*"
                )

                .eq(
                    "user_id",
                    currentDartHubUser.id
                )

                .not(
                    "opponent_user_id",
                    "is",
                    null
                )

                .order(
                    "played_at",
                    {
                        ascending:
                            false
                    }
                )

                .limit(
                    1000
                );


        if (
            error
        ) {

            throw error;
        }


        v24RivalMatches =
            data ||
            [];


        v24RenderRivals();


    } catch (
        error
    ) {

        console.error(
            error
        );


        container.innerHTML = `

            <div class="v24-empty">

                Unable to load rivals.

            </div>
        `;
    }
}


/* =========================================================
   MODE FILTER
========================================================= */

function v24MatchMode(
    match
) {

    const mode =

        match.game_mode ===
        "501 / Legs"

            ? "Legs"

            : match.game_mode;


    if (
        mode ===
        "Legs"
    ) {

        return "legs";
    }


    if (
        mode ===
        "Sets + Legs"
    ) {

        return "sets";
    }


    if (
        mode ===
        "Cricket"
    ) {

        return "cricket";
    }


    return "other";
}


function v24FilterRivalMode(
    matches
) {

    if (
        v24RivalMode ===
        "overall"
    ) {

        return matches;
    }


    return matches.filter(
        match =>
            v24MatchMode(
                match
            ) ===
            v24RivalMode
    );
}


/* =========================================================
   RENDER RIVAL LIST / DETAIL
========================================================= */

function v24RenderRivals() {

    const container =
        document.getElementById(
            "v24-rivals-content"
        );


    if (
        v24SelectedRival
    ) {

        v24RenderRivalDetail(
            container
        );


        return;
    }


    const filtered =
        v24FilterRivalMode(
            v24RivalMatches
        );


    const groups =
        new Map();


    filtered.forEach(
        match => {

            const id =
                match.opponent_user_id;


            if (
                !groups.has(
                    id
                )
            ) {

                groups.set(
                    id,
                    {

                        id,

                        name:
                            match.opponent_name,

                        matches:
                            []
                    }
                );
            }


            groups
                .get(
                    id
                )
                .matches
                .push(
                    match
                );
        }
    );


    const rivals =
        Array.from(
            groups.values()
        )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.matches.length -
                    a.matches.length
            );


    if (
        !rivals.length
    ) {

        container.innerHTML = `

            <div class="v24-empty">

                No registered rivals in this mode yet.

            </div>
        `;


        return;
    }


    container.innerHTML =
        rivals
            .map(
                rival => {

                    const wins =
                        rival.matches.filter(
                            match =>
                                match.result ===
                                "WIN"
                        ).length;


                    const losses =
                        rival.matches.length -
                        wins;


                    return `

                        <div
                            class="v24-rival-card"
                            data-v24-rival-id="${rival.id}"
                        >

                            <div>

                                <div class="v24-rival-name">

                                    ${v24Escape(
                                        rival.name
                                    )}

                                </div>


                                <div class="v24-rival-sub">

                                    ${rival.matches.length}
                                    match${
                                        rival.matches.length ===
                                        1

                                            ? ""

                                            : "es"
                                    }

                                    • Last 5:
                                    ${v24RecentForm(
                                        rival.matches
                                    )}

                                </div>

                            </div>


                            <div class="v24-rival-score">

                                ${wins}
                                -
                                ${losses}

                            </div>

                        </div>
                    `;
                }
            )
            .join(
                ""
            );


    container
        .querySelectorAll(
            "[data-v24-rival-id]"
        )
        .forEach(
            row => {

                row.onclick =
                    () => {

                        const rival =
                            rivals.find(
                                item =>
                                    item.id ===
                                    row.dataset
                                        .v24RivalId
                            );


                        if (
                            rival
                        ) {

                            v24SelectedRival =
                                rival;


                            v24RenderRivals();
                        }
                    };
            }
        );
}


/* =========================================================
   RECENT FORM
========================================================= */

function v24RecentForm(
    matches
) {

    return (

        matches
            .slice(
                0,
                5
            )
            .map(
                match =>

                    match.result ===
                    "WIN"

                        ? "🟢"

                        : "🔴"
            )
            .join(
                ""
            )

        ||

        "–"
    );
}


/* =========================================================
   RIVAL DETAIL
========================================================= */

function v24RenderRivalDetail(
    container
) {

    const allMatches =
        v24RivalMatches.filter(
            match =>
                match.opponent_user_id ===
                v24SelectedRival.id
        );


    const matches =
        v24FilterRivalMode(
            allMatches
        );


    const wins =
        matches.filter(
            match =>
                match.result ===
                "WIN"
        ).length;


    const losses =
        matches.length -
        wins;


    container.innerHTML = `

        <button
            id="v24-all-rivals-btn"
            class="v24-back"
            style="
                width:100%;
                margin-bottom:10px;
            "
        >
            ← All Rivals
        </button>


        <h2>

            ${v24Escape(
                v24SelectedRival.name
            )}

        </h2>


        <div class="v24-stat-grid">

            ${v24Stat(
                "Matches",
                matches.length
            )}

            ${v24Stat(
                "Your Wins",
                wins
            )}

            ${v24Stat(
                "Their Wins",
                losses
            )}

            ${v24Stat(
                "Win %",
                v24Percentage(
                    wins,
                    matches.length
                )
            )}

            ${v24Stat(
                "Current Streak",
                v24Streak(
                    matches
                )
            )}

            ${v24Stat(
                "Last 5",
                v24RecentForm(
                    matches
                )
            )}

        </div>


        ${
            v24RivalMode ===
            "overall"

                ? v24OverallRivalBreakdown(
                    allMatches
                  )

                : v24RivalMode ===
                  "cricket"

                    ? v24CricketRivalBreakdown(
                        matches
                      )

                    : v24DartsRivalBreakdown(
                        matches
                      )
        }
    `;


    document
        .getElementById(
            "v24-all-rivals-btn"
        )
        .onclick =
            () => {

                v24SelectedRival =
                    null;


                v24RenderRivals();
            };
}


/* =========================================================
   STAT CARD
========================================================= */

function v24Stat(
    label,
    value
) {

    return `

        <div class="v24-stat">

            <div class="v24-stat-label">

                ${v24Escape(
                    label
                )}

            </div>


            <div class="v24-stat-value">

                ${v24Escape(
                    value
                )}

            </div>

        </div>
    `;
}


/* =========================================================
   PERCENT
========================================================= */

function v24Percentage(
    numerator,
    denominator
) {

    if (
        !denominator
    ) {

        return "0.0%";
    }


    return (

        (
            numerator /
            denominator *
            100
        )
            .toFixed(
                1
            )

        +

        "%"
    );
}


/* =========================================================
   STREAK
========================================================= */

function v24Streak(
    matches
) {

    if (
        !matches.length
    ) {

        return "–";
    }


    const result =
        matches[0].result;


    let count =
        0;


    for (
        const match
        of matches
    ) {

        if (
            match.result !==
            result
        ) {

            break;
        }


        count++;
    }


    return (

        result ===
        "WIN"

            ? `${count}W`

            : `${count}L`
    );
}


/* =========================================================
   OVERALL RIVAL BREAKDOWN
========================================================= */

function v24OverallRivalBreakdown(
    matches
) {

    const groups = [

        [
            "Legs",
            "legs"
        ],

        [
            "Sets + Legs",
            "sets"
        ],

        [
            "Cricket",
            "cricket"
        ]

    ];


    const rows =
        groups.map(
            (
                [
                    label,
                    mode
                ]
            ) => {

                const subset =
                    matches.filter(
                        match =>
                            v24MatchMode(
                                match
                            ) ===
                            mode
                    );


                const wins =
                    subset.filter(
                        match =>
                            match.result ===
                            "WIN"
                    ).length;


                return {

                    label,

                    total:
                        subset.length,

                    wins,

                    losses:
                        subset.length -
                        wins,

                    margin:

                        wins -
                        (
                            subset.length -
                            wins
                        )
                };
            }
        );


    const played =
        rows.filter(
            row =>
                row.total
        );


    let myBest =
        null;


    let rivalBest =
        null;


    played.forEach(
        row => {

            if (
                row.margin >
                0 &&
                (
                    !myBest ||
                    row.margin >
                    myBest.margin
                )
            ) {

                myBest =
                    row;
            }


            if (
                row.margin <
                0 &&
                (
                    !rivalBest ||
                    row.margin <
                    rivalBest.margin
                )
            ) {

                rivalBest =
                    row;
            }
        }
    );


    let text =
        "";


    if (
        myBest
    ) {

        text +=

            `Your strongest mode is ${myBest.label}, ` +

            `where you lead ${myBest.wins}-${myBest.losses}. `;
    }


    if (
        rivalBest
    ) {

        text +=

            `${v24SelectedRival.name}'s strongest mode is ` +

            `${rivalBest.label}, where they lead ` +

            `${rivalBest.losses}-${rivalBest.wins}.`;
    }


    if (
        !text
    ) {

        text =
            "There is no clear overall advantage yet.";
    }


    return `

        <div class="v24-section">

            <h3>
                Where is the rivalry being won?
            </h3>


            ${
                played
                    .map(
                        row => `

                            <div class="v24-row">

                                <span>
                                    ${row.label}
                                </span>

                                <strong>

                                    ${row.wins}
                                    -
                                    ${row.losses}

                                </strong>

                            </div>
                        `
                    )
                    .join(
                        ""
                    )
            }

        </div>


        <div class="v24-analysis">

            ${v24Escape(
                text
            )}

        </div>
    `;
}


/* =========================================================
   DARTS RIVAL STATS
========================================================= */

function v24DartsRivalBreakdown(
    matches
) {

    if (
        !matches.length
    ) {

        return `

            <div class="v24-empty">
                No matches in this mode.
            </div>
        `;
    }


    const myAverage =
        v24Average(

            matches.map(
                match =>
                    Number(
                        match.user_average ||
                        0
                    )
            )
        );


    const theirAverage =
        v24Average(

            matches.map(
                match =>
                    Number(
                        match.opponent_average ||
                        0
                    )
            )
        );


    const my180 =
        matches.reduce(
            (
                total,
                match
            ) =>
                total +
                Number(
                    match.user_180s ||
                    0
                ),
            0
        );


    const their180 =
        matches.reduce(
            (
                total,
                match
            ) =>
                total +
                Number(
                    match.opponent_180s ||
                    0
                ),
            0
        );


    const myHighestCheckout =
        matches.reduce(
            (
                highest,
                match
            ) =>
                Math.max(

                    highest,

                    Number(
                        match.best_checkout ||
                        0
                    )
                ),
            0
        );


    return `

        <div class="v24-stat-grid">

            ${v24Stat(
                "Your Avg",
                myAverage.toFixed(
                    2
                )
            )}

            ${v24Stat(
                "Rival Avg",
                theirAverage.toFixed(
                    2
                )
            )}

            ${v24Stat(
                "Your 180s",
                my180
            )}

            ${v24Stat(
                "Rival 180s",
                their180
            )}

            ${v24Stat(
                "Your High Checkout",
                myHighestCheckout ||
                "–"
            )}

        </div>


        ${v24MainStartingScores(
            matches
        )}


        <div class="v24-analysis">

            ${v24DartsRivalText(
                myAverage,
                theirAverage,
                my180,
                their180
            )}

        </div>
    `;
}


/* =========================================================
   AVERAGE
========================================================= */

function v24Average(
    values
) {

    if (
        !values.length
    ) {

        return 0;
    }


    return (

        values.reduce(
            (
                total,
                value
            ) =>
                total +
                Number(
                    value ||
                    0
                ),
            0
        )

        /

        values.length
    );
}


/* =========================================================
   MAIN STARTING SCORES
   101 / 301 / 501 / OTHER
========================================================= */

function v24MainStartingScores(
    matches
) {

    const groups = {

        101:
            [],

        301:
            [],

        501:
            [],

        other:
            []
    };


    matches.forEach(
        match => {

            const score =
                Number(
                    match.starting_score ||
                    0
                );


            if (
                score ===
                101
            ) {

                groups[101]
                    .push(
                        match
                    );


            } else if (
                score ===
                301
            ) {

                groups[301]
                    .push(
                        match
                    );


            } else if (
                score ===
                501
            ) {

                groups[501]
                    .push(
                        match
                    );


            } else if (
                score
            ) {

                /*
                   Includes 701 and anything else,
                   but 701 is NOT a main headline category.
                */

                groups.other
                    .push(
                        match
                    );
            }
        }
    );


    const rows = [

        [
            "101",
            groups[101]
        ],

        [
            "301",
            groups[301]
        ],

        [
            "501",
            groups[501]
        ],

        [
            "Other",
            groups.other
        ]

    ];


    return `

        <div class="v24-section">

            <h3>
                Starting Score Record
            </h3>


            ${
                rows
                    .map(
                        (
                            [
                                label,
                                subset
                            ]
                        ) => {

                            const wins =
                                subset.filter(
                                    match =>
                                        match.result ===
                                        "WIN"
                                ).length;


                            return `

                                <div class="v24-row">

                                    <span>
                                        ${label}
                                    </span>

                                    <strong>

                                        ${wins}
                                        -
                                        ${
                                            subset.length -
                                            wins
                                        }

                                    </strong>

                                </div>
                            `;
                        }
                    )
                    .join(
                        ""
                    )
            }

        </div>
    `;
}


/* =========================================================
   DARTS RIVAL ANALYSIS TEXT
========================================================= */

function v24DartsRivalText(
    myAverage,
    theirAverage,
    my180,
    their180
) {

    let text =
        "";


    if (
        myAverage >
        theirAverage
    ) {

        text +=

            `You have the scoring edge, averaging ` +

            `${myAverage.toFixed(2)} compared with ` +

            `${theirAverage.toFixed(2)}. `;


    } else if (
        theirAverage >
        myAverage
    ) {

        text +=

            `${v24SelectedRival.name} has the scoring edge, averaging ` +

            `${theirAverage.toFixed(2)} compared with ` +

            `${myAverage.toFixed(2)}. `;
    }


    if (
        my180 >
        their180
    ) {

        text +=

            `You lead the 180 count ${my180}-${their180}.`;


    } else if (
        their180 >
        my180
    ) {

        text +=

            `${v24SelectedRival.name} leads the 180 count ` +

            `${their180}-${my180}.`;
    }


    return (

        text ||
        "The main scoring statistics are currently level."
    );
}


/* =========================================================
   CRICKET RIVAL STATS
========================================================= */

function v24CricketRivalBreakdown(
    matches
) {

    if (
        !matches.length
    ) {

        return `

            <div class="v24-empty">

                No Cricket matches against this rival.

            </div>
        `;
    }


    let myRuns =
        0;


    let rivalRuns =
        0;


    let myWickets =
        0;


    let rivalWickets =
        0;


    let myHigh =
        0;


    let rivalHigh =
        0;


    const wicketGroups =
        new Map();


    matches.forEach(
        match => {

            const details =
                match.match_details ||
                {};


            const myID =
                currentDartHubUser.id;


            const iAmTeamA =
                details.team_a_user_id ===
                myID;


            const myScore =

                iAmTeamA

                    ? Number(
                        details.team_a_runs ||
                        0
                    )

                    : Number(
                        details.team_b_runs ||
                        0
                    );


            const theirScore =

                iAmTeamA

                    ? Number(
                        details.team_b_runs ||
                        0
                    )

                    : Number(
                        details.team_a_runs ||
                        0
                    );


            const myLost =

                iAmTeamA

                    ? Number(
                        details.team_a_wickets_lost ||
                        0
                    )

                    : Number(
                        details.team_b_wickets_lost ||
                        0
                    );


            const theirLost =

                iAmTeamA

                    ? Number(
                        details.team_b_wickets_lost ||
                        0
                    )

                    : Number(
                        details.team_a_wickets_lost ||
                        0
                    );


            myRuns +=
                myScore;


            rivalRuns +=
                theirScore;


            myWickets +=
                theirLost;


            rivalWickets +=
                myLost;


            myHigh =
                Math.max(
                    myHigh,
                    myScore
                );


            rivalHigh =
                Math.max(
                    rivalHigh,
                    theirScore
                );


            const wicketCount =
                Number(
                    details.total_wickets ||
                    0
                );


            if (
                wicketCount
            ) {

                if (
                    !wicketGroups.has(
                        wicketCount
                    )
                ) {

                    wicketGroups.set(
                        wicketCount,
                        []
                    );
                }


                wicketGroups
                    .get(
                        wicketCount
                    )
                    .push(
                        match
                    );
            }
        }
    );


    return `

        <div class="v24-stat-grid">

            ${v24Stat(
                "Your Runs",
                myRuns
            )}

            ${v24Stat(
                "Rival Runs",
                rivalRuns
            )}

            ${v24Stat(
                "Your Wickets",
                myWickets
            )}

            ${v24Stat(
                "Rival Wickets",
                rivalWickets
            )}

            ${v24Stat(
                "Your High",
                myHigh
            )}

            ${v24Stat(
                "Rival High",
                rivalHigh
            )}

        </div>


        <div class="v24-section">

            <h3>
                By Wicket Format
            </h3>


            ${
                Array
                    .from(
                        wicketGroups.entries()
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            a[0] -
                            b[0]
                    )
                    .map(
                        (
                            [
                                wickets,
                                subset
                            ]
                        ) => {

                            const wins =
                                subset.filter(
                                    match =>
                                        match.result ===
                                        "WIN"
                                ).length;


                            return `

                                <div class="v24-row">

                                    <span>

                                        ${wickets}
                                        wicket${
                                            wickets ===
                                            1
                                                ? ""
                                                : "s"
                                        }

                                    </span>

                                    <strong>

                                        ${wins}
                                        -
                                        ${
                                            subset.length -
                                            wins
                                        }

                                    </strong>

                                </div>
                            `;
                        }
                    )
                    .join(
                        ""
                    )
            }

        </div>


        <div class="v24-analysis">

            ${v24CricketAnalysisText(
                myRuns,
                rivalRuns,
                myWickets,
                rivalWickets
            )}

        </div>
    `;
}


/* =========================================================
   CRICKET ANALYSIS TEXT
========================================================= */

function v24CricketAnalysisText(
    myRuns,
    rivalRuns,
    myWickets,
    rivalWickets
) {

    let text =
        "";


    if (
        myRuns >
        rivalRuns
    ) {

        text +=

            `You lead total runs ${myRuns}-${rivalRuns}. `;


    } else if (
        rivalRuns >
        myRuns
    ) {

        text +=

            `${v24SelectedRival.name} leads total runs ` +

            `${rivalRuns}-${myRuns}. `;
    }


    if (
        myWickets >
        rivalWickets
    ) {

        text +=

            `You have also taken more wickets, ` +

            `${myWickets}-${rivalWickets}.`;


    } else if (
        rivalWickets >
        myWickets
    ) {

        text +=

            `${v24SelectedRival.name} has taken more wickets, ` +

            `${rivalWickets}-${myWickets}.`;
    }


    return (

        text ||
        "The Cricket statistics are currently very evenly matched."
    );
}


/* =========================================================
   PROFILE - REMOVE RIVALS TAB
========================================================= */

function v24CleanPlayerProfile() {

    const profileHub =
        document.getElementById(
            "v23-profile-hub"
        );


    if (
        !profileHub
    ) {

        return;
    }


    /*
       Rivals is now its own page.
    */

    const rivalsButton =
        profileHub.querySelector(
            '[data-v23-view="rivals"]'
        );


    if (
        rivalsButton
    ) {

        rivalsButton.remove();
    }


    const switchBar =
        profileHub.querySelector(
            ".v23-profile-switch"
        );


    if (
        switchBar
    ) {

        switchBar.style.display =
            "none";
    }
}


/* =========================================================
   PROFILE 101 / 301 / 501 / OTHER BREAKDOWN
========================================================= */

function v24InstallProfileStartingScoreBreakdown() {

    if (
        typeof v23StartingScoreBreakdown !==
        "function"
    ) {

        return;
    }


    v23StartingScoreBreakdown =
        function (
            matches
        ) {

            const groups = {

                101:
                    [],

                301:
                    [],

                501:
                    [],

                other:
                    []
            };


            matches.forEach(
                match => {

                    const score =
                        Number(
                            match.starting_score ||
                            0
                        );


                    if (
                        score ===
                        101
                    ) {

                        groups[101]
                            .push(
                                match
                            );


                    } else if (
                        score ===
                        301
                    ) {

                        groups[301]
                            .push(
                                match
                            );


                    } else if (
                        score ===
                        501
                    ) {

                        groups[501]
                            .push(
                                match
                            );


                    } else if (
                        score
                    ) {

                        groups.other
                            .push(
                                match
                            );
                    }
                }
            );


            const rows = [

                [
                    "101",
                    groups[101]
                ],

                [
                    "301",
                    groups[301]
                ],

                [
                    "501",
                    groups[501]
                ],

                [
                    "Other",
                    groups.other
                ]

            ];


            return `

                <div class="v23-breakdown">

                    <h3>
                        Starting Score
                    </h3>


                    ${
                        rows
                            .map(
                                (
                                    [
                                        label,
                                        subset
                                    ]
                                ) => {

                                    const wins =
                                        subset.filter(
                                            match =>
                                                match.result ===
                                                "WIN"
                                        ).length;


                                    return `

                                        <div class="v23-breakdown-row">

                                            <span>
                                                ${label}
                                            </span>

                                            <strong>

                                                ${wins}
                                                -
                                                ${
                                                    subset.length -
                                                    wins
                                                }

                                            </strong>

                                        </div>
                                    `;
                                }
                            )
                            .join(
                                ""
                            )
                    }

                </div>
            `;
        };
}


/* =========================================================
   PROFILE OPEN WRAPPER
========================================================= */

function v24WrapProfileOpen() {

    if (
        typeof openCloudProfile !==
        "function" ||
        window.__v24ProfileOpen
    ) {

        return;
    }


    window.__v24ProfileOpen =
        true;


    const original =
        openCloudProfile;


    openCloudProfile =
        async function () {

            await original();


            setTimeout(
                () => {

                    v24CleanPlayerProfile();

                },
                50
            );
        };
}


/* =========================================================
   PERIODIC CONFIRMATION BADGE
========================================================= */

async function v24RefreshBadge() {

    try {

        const rows =
            await v24GetConfirmationRows();


        v24UpdateConfirmationBadge(
            rows
        );


    } catch (
        error
    ) {

        console.warn(
            "Confirmation badge:",
            error
        );
    }
}


/* =========================================================
   INITIALISE
========================================================= */

function initialiseDartHubV24() {

    v24InstallStyles();


    v24InstallHomeButtons();


    v24HideOldConfirmationCard();


    v24InstallConfirmationPage();


    v24InstallRivalsPage();


    v24InstallProfileStartingScoreBreakdown();


    v24WrapProfileOpen();


    v24CleanPlayerProfile();


    setTimeout(
        v24RefreshBadge,
        1000
    );


    setInterval(
        v24RefreshBadge,
        60000
    );


    console.log(
        "Dart Hub v24 pages ready."
    );
}


initialiseDartHubV24();