"use strict";


/* =========================================================
   DART HUB ADMIN
========================================================= */

let dhAdminIsAdmin =
    false;


let dhAdminSelectedUser =
    null;


let dhAdminSelectedData =
    null;


let dhAdminEditingMatchID =
    null;



/* =========================================================
   HELPERS
========================================================= */

function dhAdminEscape(
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


function dhAdminNumber(
    value
) {

    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )

        ? number

        : 0;
}


function dhAdminValue(
    id
) {

    return document
        .getElementById(
            id
        )
        ?.value;
}



/* =========================================================
   ACCESS
========================================================= */

async function dhAdminCheckAccess() {

    if (
        typeof dartHubSupabase ===
            "undefined"
    ) {

        return;
    }


    const {
        data: sessionData
    } =
        await dartHubSupabase
            .auth
            .getSession();


    const user =
        sessionData
            ?.session
            ?.user;


    if (
        !user
    ) {

        dhAdminIsAdmin =
            false;


        dhAdminUpdateButton();


        return;
    }


    const {
        data,
        error
    } =
        await dartHubSupabase
            .rpc(
                "dh_my_access_status"
            );


    if (
        error
    ) {

        console.error(
            "Admin access check:",
            error
        );


        return;
    }


    dhAdminIsAdmin =
        Boolean(
            data?.is_admin
        );


    dhAdminUpdateButton();


    if (
        data?.banned
    ) {

        await dartHubSupabase
            .auth
            .signOut();


        alert(

            "This Dart Hub account has been suspended."

            +

            (
                data.reason

                    ? "\n\nReason:\n" +
                      data.reason

                    : ""
            )
        );


        location.reload();
    }
}



/* =========================================================
   STYLES
========================================================= */

function dhAdminInstallStyles() {

    if (
        document.getElementById(
            "dh-admin-style"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "dh-admin-style";


    style.textContent = `

        #dh-admin-home-button {

            width:100%;
            min-height:48px;

            border:1px solid #b576ff;
            border-radius:8px;

            background:
                linear-gradient(
                    135deg,
                    #6739a0,
                    #3f2266
                );

            color:white;

            font-weight:900;

            cursor:pointer;
        }


        #dh-admin-screen {

            position:fixed;

            inset:0;

            z-index:26000;

            overflow-y:auto;

            padding:12px;

            background:
                radial-gradient(
                    circle at top,
                    #291b3a,
                    #07080b 50%,
                    #020203
                );

            color:white;

            text-align:left;
        }


        #dh-admin-screen.hidden {

            display:none !important;
        }


        .dh-admin-page {

            width:min(
                1050px,
                100%
            );

            margin:auto;

            padding-bottom:40px;
        }


        .dh-admin-header {

            display:flex;

            align-items:center;

            gap:12px;

            margin-bottom:14px;
        }


        .dh-admin-header h1 {

            margin:0;

            color:#bc85ff;
        }


        .dh-admin-card {

            margin-top:10px;

            padding:13px;

            border:1px solid #47365e;

            border-radius:10px;

            background:#101015;
        }


        .dh-admin-card h2 {

            margin-top:4px;
        }


        .dh-admin-search-row {

            display:grid;

            grid-template-columns:
                1fr auto;

            gap:7px;
        }


        .dh-admin-input,
        .dh-admin-select {

            width:100%;

            min-width:0;

            min-height:45px;

            padding:8px 10px;

            border:1px solid #4a4d57;

            border-radius:7px;

            outline:none;

            background:#050507;

            color:white;
        }


        .dh-admin-grid {

            display:grid;

            grid-template-columns:
                repeat(
                    3,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap:8px;
        }


        .dh-admin-field label {

            display:block;

            margin-bottom:4px;

            color:#9e95a8;

            font-size:10px;

            font-weight:900;

            text-transform:uppercase;
        }


        .dh-admin-mode-note {

            margin:
                8px 0;

            padding:8px;

            border-radius:7px;

            background:#18151e;

            color:#a99db5;

            font-size:11px;
        }


        .dh-admin-result-item {

            margin-top:7px;

            padding:9px;

            border:1px solid #34313b;

            border-radius:8px;

            background:#09090c;

            cursor:pointer;
        }


        .dh-admin-result-item:hover {

            border-color:#a96cff;
        }


        .dh-admin-result-name {

            font-weight:900;
        }


        .dh-admin-result-meta {

            margin-top:3px;

            color:#8d8794;

            font-size:10px;
        }


        .dh-admin-stat-grid {

            display:grid;

            grid-template-columns:
                repeat(
                    4,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap:7px;
        }


        .dh-admin-match {

            display:grid;

            grid-template-columns:
                1fr auto;

            gap:8px;

            margin-top:6px;

            padding:9px;

            border:1px solid #32313a;

            border-radius:8px;

            background:#09090c;
        }


        .dh-admin-match-actions {

            display:flex;

            gap:5px;
        }


        .dh-admin-small-button {

            min-height:36px;

            padding:5px 9px;

            border:none;

            border-radius:6px;

            color:white;

            font-weight:800;

            cursor:pointer;
        }


        .dh-admin-edit {

            background:#176491;
        }


        .dh-admin-delete {

            background:#812929;
        }


        .dh-admin-danger {

            border-color:#782e2e;

            background:#210d0d;
        }


        .dh-admin-success {

            color:#72ffc0;

            font-weight:800;
        }


        .dh-admin-error {

            color:#ff9494;

            font-weight:800;
        }


        .dh-admin-practice-box {

            border-color:#694b8e;

            background:
                linear-gradient(
                    145deg,
                    #191121,
                    #0c0a10
                );
        }


        .dh-admin-cricket-box {

            border-color:#1b7952;

            background:
                linear-gradient(
                    145deg,
                    #0d2119,
                    #080e0b
                );
        }


        @media (
            max-width:700px
        ) {

            .dh-admin-grid,
            .dh-admin-stat-grid {

                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );
            }


            .dh-admin-search-row {

                grid-template-columns:
                    1fr;
            }


            .dh-admin-match {

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
   HOME BUTTON
========================================================= */

function dhAdminInstallHomeButton() {

    const container =
        document.querySelector(
            "#mode-screen .mode-buttons"
        );


    if (
        !container ||
        document.getElementById(
            "dh-admin-home-button"
        )
    ) {

        return;
    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "dh-admin-home-button";


    button.type =
        "button";


    button.textContent =
        "🛡️ ADMIN";


    button.onclick =
        dhAdminOpen;


    container.appendChild(
        button
    );


    dhAdminUpdateButton();
}


function dhAdminUpdateButton() {

    const button =
        document.getElementById(
            "dh-admin-home-button"
        );


    if (
        button
    ) {

        button.classList.toggle(
            "hidden",
            !dhAdminIsAdmin
        );
    }
}



/* =========================================================
   SCREEN
========================================================= */

function dhAdminCreateScreen() {

    if (
        document.getElementById(
            "dh-admin-screen"
        )
    ) {

        return;
    }


    const screen =
        document.createElement(
            "div"
        );


    screen.id =
        "dh-admin-screen";


    screen.className =
        "hidden";


    screen.innerHTML = `

        <div class="dh-admin-page">


            <div class="dh-admin-header">

                <button
                    id="dh-admin-back"
                    class="btn-secondary"
                    type="button"
                >
                    ← Dart Hub
                </button>


                <h1>
                    🛡️ Dart Hub Admin
                </h1>

            </div>



            <div class="dh-admin-card">

                <h2>
                    Find Player
                </h2>


                <div class="dh-admin-search-row">

                    <input
                        id="dh-admin-search"
                        class="dh-admin-input"
                        type="search"
                        placeholder="Name, player code or email"
                    >


                    <button
                        id="dh-admin-search-button"
                        class="btn-primary"
                        type="button"
                    >
                        Search
                    </button>

                </div>


                <div
                    id="dh-admin-search-results"
                ></div>

            </div>



            <div
                id="dh-admin-player-area"
                class="hidden"
            >


                <div class="dh-admin-card">

                    <h2 id="dh-admin-player-name">
                        Player
                    </h2>


                    <div
                        id="dh-admin-player-meta"
                        style="
                            color:#9a94a0;
                            font-size:11px;
                        "
                    ></div>

                </div>



                <div class="dh-admin-card dh-admin-danger">

                    <h2>
                        Player Access
                    </h2>


                    <input
                        id="dh-admin-ban-reason"
                        class="dh-admin-input"
                        placeholder="Ban / suspension reason"
                    >


                    <div
                        style="
                            display:grid;
                            grid-template-columns:1fr 1fr;
                            gap:7px;
                            margin-top:7px;
                        "
                    >

                        <button
                            id="dh-admin-ban-button"
                            class="btn-warning"
                            type="button"
                        >
                            🚫 Ban Player
                        </button>


                        <button
                            id="dh-admin-unban-button"
                            class="btn-secondary"
                            type="button"
                        >
                            ✅ Unban Player
                        </button>

                    </div>

                </div>



                <div class="dh-admin-card">

                    <h2>
                        Player Statistics
                    </h2>


                    <div
                        id="dh-admin-stats-grid"
                        class="dh-admin-stat-grid"
                    ></div>


                    <button
                        id="dh-admin-save-stats"
                        class="btn-primary"
                        type="button"
                        style="
                            width:100%;
                            margin-top:9px;
                        "
                    >
                        💾 Save Player Statistics
                    </button>

                </div>



                <div
                    id="dh-admin-record-card"
                    class="dh-admin-card"
                >

                    <h2 id="dh-admin-record-title">
                        Add Match / Practice Record
                    </h2>


                    <div class="dh-admin-field">

                        <label>
                            Type
                        </label>


                        <select
                            id="dh-admin-game-mode"
                            class="dh-admin-select"
                        >

                            <option value="Legs">
                                🎯 Legs
                            </option>

                            <option value="Sets + Legs">
                                🏆 Sets + Legs
                            </option>

                            <option value="Cricket">
                                🏏 Cricket
                            </option>

                            <option value="Average Practice">
                                📈 Average Practice
                            </option>

                        </select>

                    </div>


                    <div
                        id="dh-admin-dynamic-fields"
                        style="margin-top:10px;"
                    ></div>


                    <div
                        style="
                            display:grid;
                            grid-template-columns:1fr 1fr;
                            gap:7px;
                            margin-top:10px;
                        "
                    >

                        <button
                            id="dh-admin-save-record"
                            class="btn-primary"
                            type="button"
                        >
                            Save Record
                        </button>


                        <button
                            id="dh-admin-cancel-edit"
                            class="btn-secondary"
                            type="button"
                        >
                            Clear Form
                        </button>

                    </div>

                </div>



                <div class="dh-admin-card">

                    <h2>
                        Player Records
                    </h2>


                    <div
                        id="dh-admin-match-list"
                    ></div>

                </div>


                <div
                    id="dh-admin-message"
                    style="
                        margin-top:10px;
                    "
                ></div>

            </div>

        </div>
    `;


    document.body.appendChild(
        screen
    );


    document
        .getElementById(
            "dh-admin-back"
        )
        .onclick =
            dhAdminClose;


    document
        .getElementById(
            "dh-admin-search-button"
        )
        .onclick =
            dhAdminSearch;


    document
        .getElementById(
            "dh-admin-search"
        )
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    dhAdminSearch();
                }
            }
        );


    document
        .getElementById(
            "dh-admin-game-mode"
        )
        .onchange =
            () =>
                dhAdminRenderRecordFields();


    document
        .getElementById(
            "dh-admin-ban-button"
        )
        .onclick =
            () =>
                dhAdminSetBan(
                    true
                );


    document
        .getElementById(
            "dh-admin-unban-button"
        )
        .onclick =
            () =>
                dhAdminSetBan(
                    false
                );


    document
        .getElementById(
            "dh-admin-save-stats"
        )
        .onclick =
            dhAdminSaveStats;


    document
        .getElementById(
            "dh-admin-save-record"
        )
        .onclick =
            dhAdminSaveRecord;


    document
        .getElementById(
            "dh-admin-cancel-edit"
        )
        .onclick =
            dhAdminClearRecordForm;


    dhAdminRenderRecordFields();
}



/* =========================================================
   DYNAMIC RECORD FORM
========================================================= */

function dhAdminField(
    id,
    label,
    value = 0,
    type = "number",
    step = "1"
) {

    return `

        <div class="dh-admin-field">

            <label for="${id}">
                ${label}
            </label>


            <input
                id="${id}"
                class="dh-admin-input"
                type="${type}"
                step="${step}"
                value="${dhAdminEscape(
                    value
                )}"
            >

        </div>
    `;
}


function dhAdminBoardField(
    value = "standard"
) {

    return `

        <div class="dh-admin-field">

            <label>
                Board
            </label>


            <select
                id="dh-admin-board"
                class="dh-admin-select"
            >

                <option
                    value="standard"
                    ${
                        value ===
                        "standard"

                            ? "selected"

                            : ""
                    }
                >
                    🎯 Standard
                </option>


                <option
                    value="indoor"
                    ${
                        value ===
                        "indoor"

                            ? "selected"

                            : ""
                    }
                >
                    🏠 Indoor
                </option>

            </select>

        </div>
    `;
}


function dhAdminResultField(
    value = "WIN"
) {

    return `

        <div class="dh-admin-field">

            <label>
                Result
            </label>


            <select
                id="dh-admin-result"
                class="dh-admin-select"
            >

                <option
                    value="WIN"
                    ${
                        value ===
                        "WIN"

                            ? "selected"

                            : ""
                    }
                >
                    WIN
                </option>


                <option
                    value="LOSS"
                    ${
                        value ===
                        "LOSS"

                            ? "selected"

                            : ""
                    }
                >
                    LOSS
                </option>

            </select>

        </div>
    `;
}



function dhAdminRenderRecordFields(
    data = {}
) {

    const mode =
        document
            .getElementById(
                "dh-admin-game-mode"
            )
            ?.value
            ||
            "Legs";


    const box =
        document.getElementById(
            "dh-admin-dynamic-fields"
        );


    const card =
        document.getElementById(
            "dh-admin-record-card"
        );


    if (
        !box
    ) {

        return;
    }


    card.classList.remove(
        "dh-admin-practice-box",
        "dh-admin-cricket-box"
    );



    /* =====================================================
       PRACTICE
    ===================================================== */

    if (
        mode ===
        "Average Practice"
    ) {

        card.classList.add(
            "dh-admin-practice-box"
        );


        box.innerHTML = `

            <div class="dh-admin-mode-note">

                📈 Practice does not affect Matches,
                Wins or Losses.

            </div>


            <div class="dh-admin-grid">

                ${dhAdminBoardField(
                    data.board_type ||
                    "standard"
                )}


                ${dhAdminField(
                    "dh-admin-practice-points",
                    "Points Scored",
                    data.points ||
                    0
                )}


                ${dhAdminField(
                    "dh-admin-practice-darts",
                    "Darts Thrown",
                    data.darts ||
                    0
                )}


                ${dhAdminField(
                    "dh-admin-practice-visits",
                    "Visits",
                    data.visits ||
                    0
                )}


                ${dhAdminField(
                    "dh-admin-average",
                    "3-Dart Average",
                    data.average ||
                    0,
                    "number",
                    "0.01"
                )}


                ${dhAdminField(
                    "dh-admin-practice-best",
                    "Best Visit",
                    data.highest_visit ||
                    0
                )}


                ${dhAdminField(
                    "dh-admin-practice-100",
                    "100+",
                    data.scores_100 ||
                    0
                )}


                ${dhAdminField(
                    "dh-admin-practice-140",
                    "140+",
                    data.scores_140 ||
                    0
                )}


                ${dhAdminField(
                    "dh-admin-180s",
                    "180s",
                    data.scores_180 ||
                    0
                )}

            </div>
        `;


        return;
    }



    /* =====================================================
       CRICKET
    ===================================================== */

    if (
        mode ===
        "Cricket"
    ) {

        card.classList.add(
            "dh-admin-cricket-box"
        );


        box.innerHTML = `

            <div class="dh-admin-mode-note">

                🏏 Cricket uses runs and wickets,
                not a darts average or checkout percentage.

            </div>


            <div class="dh-admin-grid">

                ${dhAdminResultField(
                    data.result ||
                    "WIN"
                )}


                ${dhAdminBoardField(
                    data.board_type ||
                    "standard"
                )}


                ${dhAdminField(
                    "dh-admin-opponent",
                    "Opponent / Team",
                    data.opponent_name ||
                    "Admin Entry",
                    "text"
                )}


                ${dhAdminField(
                    "dh-admin-cricket-runs",
                    "Runs Scored",
                    data.runs ||
                    0
                )}


                ${dhAdminField(
                    "dh-admin-cricket-wickets-lost",
                    "Wickets Lost",
                    data.wickets_lost ||
                    0
                )}


                ${dhAdminField(
                    "dh-admin-cricket-opponent-runs",
                    "Opponent Runs",
                    data.opponent_runs ||
                    0
                )}


                ${dhAdminField(
                    "dh-admin-cricket-opponent-wickets",
                    "Opponent Wickets Lost",
                    data.opponent_wickets_lost ||
                    0
                )}


                ${dhAdminField(
                    "dh-admin-cricket-total-wickets",
                    "Total Wickets",
                    data.total_wickets ||
                    11
                )}

            </div>
        `;


        return;
    }



    /* =====================================================
       LEGS / SETS
    ===================================================== */

    box.innerHTML = `

        <div class="dh-admin-mode-note">

            🎯 Enter the saved match statistics
            for this player's side of the match.

        </div>


        <div class="dh-admin-grid">

            ${dhAdminField(
                "dh-admin-start-score",
                "Starting Score",
                data.starting_score ||
                501
            )}


            ${dhAdminResultField(
                data.result ||
                "WIN"
            )}


            ${dhAdminField(
                "dh-admin-opponent",
                "Opponent",
                data.opponent_name ||
                "Admin Entry",
                "text"
            )}


            ${dhAdminField(
                "dh-admin-average",
                "Average",
                data.average ||
                0,
                "number",
                "0.01"
            )}


            ${dhAdminField(
                "dh-admin-180s",
                "180s",
                data.scores_180 ||
                0
            )}


            ${dhAdminField(
                "dh-admin-checkout",
                "Checkout %",
                data.checkout_percentage ||
                0,
                "number",
                "0.1"
            )}


            ${dhAdminField(
                "dh-admin-best-checkout",
                "Best Checkout",
                data.best_checkout ||
                0
            )}


            ${dhAdminBoardField(
                data.board_type ||
                "standard"
            )}

        </div>
    `;
}



/* =========================================================
   OPEN / CLOSE
========================================================= */

function dhAdminOpen() {

    if (
        !dhAdminIsAdmin
    ) {

        alert(
            "Admin access required."
        );


        return;
    }


    document
        .getElementById(
            "mode-screen"
        )
        ?.classList
        .add(
            "hidden"
        );


    document
        .getElementById(
            "dh-admin-screen"
        )
        ?.classList
        .remove(
            "hidden"
        );
}


function dhAdminClose() {

    document
        .getElementById(
            "dh-admin-screen"
        )
        ?.classList
        .add(
            "hidden"
        );


    document
        .getElementById(
            "mode-screen"
        )
        ?.classList
        .remove(
            "hidden"
        );
}



/* =========================================================
   SEARCH
========================================================= */

async function dhAdminSearch() {

    const query =
        dhAdminValue(
            "dh-admin-search"
        )
        .trim();


    const results =
        document.getElementById(
            "dh-admin-search-results"
        );


    results.textContent =
        "Searching…";


    const {
        data,
        error
    } =
        await dartHubSupabase
            .rpc(
                "dh_admin_search_players",
                {

                    p_search:
                        query
                }
            );


    if (
        error
    ) {

        results.innerHTML = `

            <div class="dh-admin-error">
                ${dhAdminEscape(
                    error.message
                )}
            </div>
        `;


        return;
    }


    if (
        !data?.length
    ) {

        results.textContent =
            "No players found.";


        return;
    }


    results.innerHTML =
        data
            .map(
                player => `

                    <div
                        class="dh-admin-result-item"
                        data-admin-user="${player.user_id}"
                    >

                        <div class="dh-admin-result-name">

                            ${dhAdminEscape(
                                player.display_name ||
                                "Player"
                            )}

                            ${
                                player.banned

                                    ? " 🚫"

                                    : ""
                            }

                        </div>


                        <div class="dh-admin-result-meta">

                            ${
                                dhAdminEscape(
                                    player.player_code ||
                                    "No code"
                                )
                            }

                            •

                            ${
                                dhAdminEscape(
                                    player.email ||
                                    ""
                                )
                            }

                        </div>

                    </div>
                `
            )
            .join(
                ""
            );


    results
        .querySelectorAll(
            "[data-admin-user]"
        )
        .forEach(
            row => {

                row.onclick =
                    () =>
                        dhAdminLoadPlayer(
                            row.dataset
                                .adminUser
                        );
            }
        );
}



/* =========================================================
   LOAD PLAYER
========================================================= */

async function dhAdminLoadPlayer(
    userID
) {

    const {
        data,
        error
    } =
        await dartHubSupabase
            .rpc(
                "dh_admin_get_player",
                {

                    p_user_id:
                        userID
                }
            );


    if (
        error
    ) {

        dhAdminMessage(
            error.message,
            true
        );


        return;
    }


    dhAdminSelectedUser =
        userID;


    dhAdminSelectedData =
        data;


    document
        .getElementById(
            "dh-admin-player-area"
        )
        .classList
        .remove(
            "hidden"
        );


    document
        .getElementById(
            "dh-admin-player-name"
        )
        .textContent =
            data.profile
                ?.display_name
            ||
            "Player";


    document
        .getElementById(
            "dh-admin-player-meta"
        )
        .textContent =

            `${data.profile?.player_code || "No player code"} • ` +

            `${data.email || ""}`;


    document
        .getElementById(
            "dh-admin-ban-reason"
        )
        .value =
            data.ban?.reason ||
            "";


    dhAdminRenderStats(
        data.profile ||
        {}
    );


    dhAdminRenderMatches(
        data.matches ||
        []
    );


    dhAdminClearRecordForm();
}



/* =========================================================
   PROFILE STATS
========================================================= */

function dhAdminRenderStats(
    profile
) {

    const fields = [

        [
            "Matches",
            "matches_played"
        ],

        [
            "Wins",
            "wins"
        ],

        [
            "Losses",
            "losses"
        ],

        [
            "Points",
            "points_scored"
        ],

        [
            "Darts",
            "darts_thrown"
        ],

        [
            "100+",
            "scores_100_plus"
        ],

        [
            "140+",
            "scores_140_plus"
        ],

        [
            "180s",
            "scores_180"
        ],

        [
            "Checkouts",
            "checkouts"
        ],

        [
            "Checkout Attempts",
            "checkout_attempts"
        ],

        [
            "Best Checkout",
            "best_checkout"
        ],

        [
            "Best Average",
            "best_match_average"
        ]
    ];


    document
        .getElementById(
            "dh-admin-stats-grid"
        )
        .innerHTML =

            fields
                .map(
                    (
                        [
                            label,
                            field
                        ]
                    ) => `

                        <div class="dh-admin-field">

                            <label>
                                ${label}
                            </label>


                            <input
                                class="dh-admin-input"
                                data-admin-stat="${field}"
                                type="number"
                                step="${
                                    field ===
                                    "best_match_average"

                                        ? "0.01"

                                        : "1"
                                }"
                                value="${
                                    dhAdminEscape(
                                        profile[field] ??
                                        0
                                    )
                                }"
                            >

                        </div>
                    `
                )
                .join(
                    ""
                );
}


function dhAdminStat(
    name
) {

    return dhAdminNumber(

        document
            .querySelector(
                `[data-admin-stat="${name}"]`
            )
            ?.value
    );
}



/* =========================================================
   SAVE PROFILE STATS
========================================================= */

async function dhAdminSaveStats() {

    if (
        !dhAdminSelectedUser
    ) {

        return;
    }


    const {
        error
    } =
        await dartHubSupabase
            .rpc(
                "dh_admin_update_profile_stats",
                {

                    p_user_id:
                        dhAdminSelectedUser,

                    p_matches:
                        dhAdminStat(
                            "matches_played"
                        ),

                    p_wins:
                        dhAdminStat(
                            "wins"
                        ),

                    p_losses:
                        dhAdminStat(
                            "losses"
                        ),

                    p_points:
                        dhAdminStat(
                            "points_scored"
                        ),

                    p_darts:
                        dhAdminStat(
                            "darts_thrown"
                        ),

                    p_scores_100:
                        dhAdminStat(
                            "scores_100_plus"
                        ),

                    p_scores_140:
                        dhAdminStat(
                            "scores_140_plus"
                        ),

                    p_scores_180:
                        dhAdminStat(
                            "scores_180"
                        ),

                    p_checkouts:
                        dhAdminStat(
                            "checkouts"
                        ),

                    p_checkout_attempts:
                        dhAdminStat(
                            "checkout_attempts"
                        ),

                    p_best_checkout:
                        dhAdminStat(
                            "best_checkout"
                        ),

                    p_best_average:
                        dhAdminStat(
                            "best_match_average"
                        )
                }
            );


    if (
        error
    ) {

        dhAdminMessage(
            error.message,
            true
        );


        return;
    }


    dhAdminMessage(
        "✅ Player statistics saved.",
        false
    );


    await dhAdminLoadPlayer(
        dhAdminSelectedUser
    );
}



/* =========================================================
   BAN
========================================================= */

async function dhAdminSetBan(
    banned
) {

    if (
        !dhAdminSelectedUser
    ) {

        return;
    }


    const reason =
        dhAdminValue(
            "dh-admin-ban-reason"
        )
        .trim();


    if (
        banned &&
        !reason
    ) {

        alert(
            "Enter a reason for the ban."
        );


        return;
    }


    const {
        error
    } =
        await dartHubSupabase
            .rpc(
                "dh_admin_set_ban",
                {

                    p_user_id:
                        dhAdminSelectedUser,

                    p_banned:
                        banned,

                    p_reason:
                        reason
                }
            );


    if (
        error
    ) {

        dhAdminMessage(
            error.message,
            true
        );


        return;
    }


    dhAdminMessage(

        banned

            ? "🚫 Player banned."

            : "✅ Player unbanned.",

        false
    );


    await dhAdminLoadPlayer(
        dhAdminSelectedUser
    );
}



/* =========================================================
   SAVE RECORD
========================================================= */

async function dhAdminSaveRecord() {

    if (
        !dhAdminSelectedUser
    ) {

        return;
    }


    const mode =
        dhAdminValue(
            "dh-admin-game-mode"
        );


    let startingScore =
        0;


    let result =
        "WIN";


    let opponent =
        "Admin Entry";


    let average =
        0;


    let scores180 =
        0;


    let checkoutPercentage =
        0;


    let bestCheckout =
        0;


    let boardType =
        dhAdminValue(
            "dh-admin-board"
        )
        ||
        "standard";


    let details = {

        board_type:
            boardType
    };



    /* =====================================================
       PRACTICE
    ===================================================== */

    if (
        mode ===
        "Average Practice"
    ) {

        const points =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-practice-points"
                )
            );


        const darts =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-practice-darts"
                )
            );


        const visits =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-practice-visits"
                )
            );


        average =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-average"
                )
            );


        const bestVisit =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-practice-best"
                )
            );


        const scores100 =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-practice-100"
                )
            );


        const scores140 =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-practice-140"
                )
            );


        scores180 =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-180s"
                )
            );


        /*
           If points + darts exist, calculate
           the average automatically.

           This prevents mismatched Practice stats.
        */

        if (
            darts >
            0
        ) {

            average =
                Number(
                    (
                        points /
                        darts *
                        3
                    )
                    .toFixed(
                        2
                    )
                );
        }


        startingScore =
            0;


        result =
            "PRACTICE";


        opponent =
            "Practice";


        details = {

            game:
                "Average Practice",

            board_type:
                boardType,

            points,

            darts,

            visits,

            average,

            highest_visit:
                bestVisit,

            scores_100:
                scores100,

            scores_140:
                scores140,

            scores_180:
                scores180,

            admin_entry:
                true
        };
    }



    /* =====================================================
       CRICKET
    ===================================================== */

    else if (
        mode ===
        "Cricket"
    ) {

        result =
            dhAdminValue(
                "dh-admin-result"
            );


        opponent =
            dhAdminValue(
                "dh-admin-opponent"
            )
            ||
            "Admin Entry";


        const runs =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-cricket-runs"
                )
            );


        const wicketsLost =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-cricket-wickets-lost"
                )
            );


        const opponentRuns =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-cricket-opponent-runs"
                )
            );


        const opponentWickets =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-cricket-opponent-wickets"
                )
            );


        const totalWickets =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-cricket-total-wickets"
                )
            );


        details = {

            game:
                "Cricket",

            board_type:
                boardType,

            total_wickets:
                totalWickets,

            user_runs:
                runs,

            user_wickets_lost:
                wicketsLost,

            opponent_runs:
                opponentRuns,

            opponent_wickets_lost:
                opponentWickets,

            admin_entry:
                true
        };
    }



    /* =====================================================
       LEGS / SETS
    ===================================================== */

    else {

        startingScore =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-start-score"
                )
            );


        result =
            dhAdminValue(
                "dh-admin-result"
            );


        opponent =
            dhAdminValue(
                "dh-admin-opponent"
            )
            ||
            "Admin Entry";


        average =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-average"
                )
            );


        scores180 =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-180s"
                )
            );


        checkoutPercentage =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-checkout"
                )
            );


        bestCheckout =
            dhAdminNumber(
                dhAdminValue(
                    "dh-admin-best-checkout"
                )
            );


        details = {

            game:
                mode,

            board_type:
                boardType,

            starting_score:
                startingScore,

            admin_entry:
                true
        };
    }



    /* =====================================================
       SAVE
    ===================================================== */

    const {
        data,
        error
    } =
        await dartHubSupabase
            .rpc(
                "dh_admin_save_record",
                {

                    p_match_id:

                        dhAdminEditingMatchID ===
                        null

                            ? null

                            : Number(
                                dhAdminEditingMatchID
                            ),

                    p_user_id:
                        dhAdminSelectedUser,

                    p_game_mode:
                        mode,

                    p_starting_score:
                        startingScore,

                    p_result:
                        result,

                    p_opponent_name:
                        opponent,

                    p_user_average:
                        average,

                    p_user_180s:
                        scores180,

                    p_checkout_percentage:
                        checkoutPercentage,

                    p_best_checkout:
                        bestCheckout,

                    p_board_type:
                        boardType,

                    p_match_details:
                        details
                }
            );


    if (
        error
    ) {

        console.error(
            "Admin record save:",
            error
        );


        dhAdminMessage(
            error.message,
            true
        );


        return;
    }


    console.log(
        "Admin record saved:",
        data
    );


    dhAdminMessage(
        "✅ Record saved.",
        false
    );


    dhAdminClearRecordForm();


    await dhAdminLoadPlayer(
        dhAdminSelectedUser
    );
}



/* =========================================================
   RECORD LIST
========================================================= */

function dhAdminRenderMatches(
    matches
) {

    const list =
        document.getElementById(
            "dh-admin-match-list"
        );


    if (
        !matches.length
    ) {

        list.textContent =
            "No records.";


        return;
    }


    list.innerHTML =
        matches
            .map(
                match => `

                    <div class="dh-admin-match">

                        <div>

                            <strong>

                                ${dhAdminEscape(
                                    match.game_mode
                                )}

                                •

                                ${dhAdminEscape(
                                    match.result
                                )}

                            </strong>


                            <div
                                style="
                                    color:#8e8994;
                                    font-size:10px;
                                    margin-top:3px;
                                "
                            >

                                ${
                                    match.game_mode ===
                                    "Average Practice"

                                        ? `${
                                            match.match_details
                                                ?.darts ||
                                            0
                                        } darts • Avg ${
                                            Number(
                                                match.user_average ||
                                                0
                                            ).toFixed(
                                                2
                                            )
                                        }`

                                        : match.game_mode ===
                                          "Cricket"

                                            ? `${
                                                match.match_details
                                                    ?.user_runs ||
                                                0
                                            } runs`

                                            : `${
                                                match.starting_score ||
                                                0
                                            } start • Avg ${
                                                Number(
                                                    match.user_average ||
                                                    0
                                                ).toFixed(
                                                    2
                                                )
                                            }`
                                }

                                •

                                ${
                                    dhAdminEscape(
                                        match.board_type ||
                                        match.match_details
                                            ?.board_type ||
                                        "standard"
                                    )
                                }

                            </div>

                        </div>


                        <div class="dh-admin-match-actions">

                            <button
                                class="dh-admin-small-button dh-admin-edit"
                                data-edit-match="${match.id}"
                                type="button"
                            >
                                Edit
                            </button>


                            <button
                                class="dh-admin-small-button dh-admin-delete"
                                data-delete-match="${match.id}"
                                type="button"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                `
            )
            .join(
                ""
            );


    list
        .querySelectorAll(
            "[data-edit-match]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const match =
                            matches.find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        button.dataset
                                            .editMatch
                                    )
                            );


                        if (
                            match
                        ) {

                            dhAdminEditRecord(
                                match
                            );
                        }
                    };
            }
        );


    list
        .querySelectorAll(
            "[data-delete-match]"
        )
        .forEach(
            button => {

                button.onclick =
                    () =>
                        dhAdminDeleteRecord(
                            Number(
                                button.dataset
                                    .deleteMatch
                            )
                        );
            }
        );
}



/* =========================================================
   EDIT
========================================================= */

function dhAdminEditRecord(
    match
) {

    dhAdminEditingMatchID =
        Number(
            match.id
        );


    document
        .getElementById(
            "dh-admin-record-title"
        )
        .textContent =
            "Edit Record";


    const mode =
        match.game_mode ||
        "Legs";


    document
        .getElementById(
            "dh-admin-game-mode"
        )
        .value =
            mode;


    const details =
        match.match_details ||
        {};


    if (
        mode ===
        "Average Practice"
    ) {

        dhAdminRenderRecordFields({

            board_type:
                match.board_type ||
                details.board_type,

            points:
                details.points,

            darts:
                details.darts,

            visits:
                details.visits,

            average:
                match.user_average,

            highest_visit:
                details.highest_visit,

            scores_100:
                details.scores_100,

            scores_140:
                details.scores_140,

            scores_180:
                details.scores_180 ||
                match.user_180s
        });


    } else if (
        mode ===
        "Cricket"
    ) {

        dhAdminRenderRecordFields({

            board_type:
                match.board_type ||
                details.board_type,

            result:
                match.result,

            opponent_name:
                match.opponent_name,

            runs:
                details.user_runs,

            wickets_lost:
                details.user_wickets_lost,

            opponent_runs:
                details.opponent_runs,

            opponent_wickets_lost:
                details.opponent_wickets_lost,

            total_wickets:
                details.total_wickets
        });


    } else {

        dhAdminRenderRecordFields({

            starting_score:
                match.starting_score,

            result:
                match.result,

            opponent_name:
                match.opponent_name,

            average:
                match.user_average,

            scores_180:
                match.user_180s,

            checkout_percentage:
                match.checkout_percentage,

            best_checkout:
                match.best_checkout,

            board_type:
                match.board_type ||
                details.board_type
        });
    }


    document
        .getElementById(
            "dh-admin-record-card"
        )
        ?.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"
        });
}



/* =========================================================
   CLEAR
========================================================= */

function dhAdminClearRecordForm() {

    dhAdminEditingMatchID =
        null;


    const title =
        document.getElementById(
            "dh-admin-record-title"
        );


    if (
        title
    ) {

        title.textContent =
            "Add Match / Practice Record";
    }


    const mode =
        document.getElementById(
            "dh-admin-game-mode"
        );


    if (
        mode
    ) {

        mode.value =
            "Legs";
    }


    dhAdminRenderRecordFields();
}



/* =========================================================
   DELETE
========================================================= */

async function dhAdminDeleteRecord(
    matchID
) {

    if (
        !confirm(
            "Permanently delete this record?"
        )
    ) {

        return;
    }


    const {
        error
    } =
        await dartHubSupabase
            .rpc(
                "dh_admin_delete_record",
                {

                    p_match_id:
                        Number(
                            matchID
                        )
                }
            );


    if (
        error
    ) {

        dhAdminMessage(
            error.message,
            true
        );


        return;
    }


    dhAdminMessage(
        "✅ Record deleted.",
        false
    );


    await dhAdminLoadPlayer(
        dhAdminSelectedUser
    );
}



/* =========================================================
   MESSAGE
========================================================= */

function dhAdminMessage(
    message,
    error = false
) {

    const element =
        document.getElementById(
            "dh-admin-message"
        );


    if (
        !element
    ) {

        return;
    }


    element.className =

        error

            ? "dh-admin-error"

            : "dh-admin-success";


    element.textContent =
        message;
}



/* =========================================================
   AUTH WATCH
========================================================= */

function dhAdminInstallAuthWatch() {

    if (
        typeof dartHubSupabase ===
            "undefined" ||
        window.__dhAdminAuthWatch
    ) {

        return;
    }


    window.__dhAdminAuthWatch =
        true;


    dartHubSupabase
        .auth
        .onAuthStateChange(
            () => {

                setTimeout(
                    dhAdminCheckAccess,
                    250
                );
            }
        );
}



/* =========================================================
   INITIALISE
========================================================= */

async function dhAdminInit() {

    dhAdminInstallStyles();

    dhAdminCreateScreen();

    dhAdminInstallHomeButton();

    dhAdminInstallAuthWatch();

    await dhAdminCheckAccess();


    console.log(
        "🛡️ Dart Hub admin ready."
    );
}


setTimeout(
    dhAdminInit,
    400
);