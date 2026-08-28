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
   ESCAPE
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



/* =========================================================
   NUMBER
========================================================= */

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



/* =========================================================
   ACCESS CHECK
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
            "Dart Hub access check:",
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

        const reason =
            String(
                data.reason ||
                ""
            );


        await dartHubSupabase
            .auth
            .signOut();


        alert(

            "This Dart Hub account has been suspended."

            +

            (
                reason

                    ? "\n\nReason:\n" +
                      reason

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

            width: 100%;

            min-height: 48px;

            border: 1px solid #b576ff;

            border-radius: 8px;

            background:
                linear-gradient(
                    135deg,
                    #6739a0,
                    #3f2266
                );

            color: white;

            font-weight: 900;

            cursor: pointer;
        }


        #dh-admin-screen {

            position: fixed;

            inset: 0;

            z-index: 26000;

            overflow-y: auto;

            padding: 12px;

            background:
                radial-gradient(
                    circle at top,
                    #291b3a,
                    #07080b 50%,
                    #020203
                );

            color: white;

            text-align: left;
        }


        #dh-admin-screen.hidden {

            display: none !important;
        }


        .dh-admin-page {

            width:
                min(
                    1050px,
                    100%
                );

            margin: auto;

            padding-bottom: 40px;
        }


        .dh-admin-header {

            display: flex;

            align-items: center;

            gap: 12px;

            margin-bottom: 14px;
        }


        .dh-admin-header h1 {

            margin: 0;

            color: #bc85ff;
        }


        .dh-admin-card {

            margin-top: 10px;

            padding: 13px;

            border:
                1px solid #47365e;

            border-radius: 10px;

            background: #101015;
        }


        .dh-admin-search-row {

            display: grid;

            grid-template-columns:
                1fr
                auto;

            gap: 7px;
        }


        .dh-admin-input,
        .dh-admin-select,
        .dh-admin-textarea {

            width: 100%;

            min-width: 0;

            min-height: 45px;

            padding: 8px 10px;

            border:
                1px solid #4a4d57;

            border-radius: 7px;

            outline: none;

            background: #050507;

            color: white;

        }


        .dh-admin-textarea {

            min-height: 100px;

            resize: vertical;

            font-family: monospace;
        }


        .dh-admin-grid {

            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap: 8px;
        }


        .dh-admin-field label {

            display: block;

            margin-bottom: 4px;

            color: #9e95a8;

            font-size: 10px;

            font-weight: 900;

            text-transform: uppercase;
        }


        .dh-admin-result {

            margin-top: 7px;

            padding: 9px;

            border:
                1px solid #34313b;

            border-radius: 8px;

            background: #09090c;

            cursor: pointer;
        }


        .dh-admin-result:hover {

            border-color: #a96cff;
        }


        .dh-admin-result-name {

            color: white;

            font-weight: 900;
        }


        .dh-admin-result-meta {

            margin-top: 2px;

            color: #8d8794;

            font-size: 10px;
        }


        .dh-admin-stat-grid {

            display: grid;

            grid-template-columns:
                repeat(
                    4,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap: 7px;
        }


        .dh-admin-match {

            display: grid;

            grid-template-columns:
                1fr
                auto;

            gap: 8px;

            margin-top: 6px;

            padding: 9px;

            border:
                1px solid #32313a;

            border-radius: 8px;

            background: #09090c;
        }


        .dh-admin-match-actions {

            display: flex;

            gap: 5px;
        }


        .dh-admin-small-button {

            min-height: 36px;

            padding: 5px 9px;

            border: none;

            border-radius: 6px;

            color: white;

            font-weight: 800;

            cursor: pointer;
        }


        .dh-admin-edit {

            background: #176491;
        }


        .dh-admin-delete {

            background: #812929;
        }


        .dh-admin-danger {

            border-color: #782e2e;

            background: #210d0d;
        }


        .dh-admin-success {

            color: #72ffc0;

            font-weight: 800;
        }


        .dh-admin-error {

            color: #ff9494;

            font-weight: 800;
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
        !button
    ) {

        return;
    }


    button.classList.toggle(
        "hidden",
        !dhAdminIsAdmin
    );
}



/* =========================================================
   CREATE SCREEN
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



            <!-- SEARCH -->

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



            <!-- PLAYER -->

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



                <!-- BAN -->

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



                <!-- PROFILE STATS -->

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



                <!-- ADD / EDIT RECORD -->

                <div class="dh-admin-card">

                    <h2 id="dh-admin-record-title">
                        Add Match / Practice Record
                    </h2>


                    <div class="dh-admin-grid">


                        <div class="dh-admin-field">

                            <label>
                                Game Mode
                            </label>

                            <select
                                id="dh-admin-game-mode"
                                class="dh-admin-select"
                            >

                                <option>
                                    Legs
                                </option>

                                <option>
                                    Sets + Legs
                                </option>

                                <option>
                                    Cricket
                                </option>

                                <option>
                                    Average Practice
                                </option>

                            </select>

                        </div>


                        <div class="dh-admin-field">

                            <label>
                                Starting Score
                            </label>

                            <input
                                id="dh-admin-start-score"
                                class="dh-admin-input"
                                type="number"
                                value="501"
                            >

                        </div>


                        <div class="dh-admin-field">

                            <label>
                                Result
                            </label>

                            <select
                                id="dh-admin-result"
                                class="dh-admin-select"
                            >

                                <option value="WIN">
                                    WIN
                                </option>

                                <option value="LOSS">
                                    LOSS
                                </option>

                                <option value="PRACTICE">
                                    PRACTICE
                                </option>

                            </select>

                        </div>


                        <div class="dh-admin-field">

                            <label>
                                Opponent
                            </label>

                            <input
                                id="dh-admin-opponent"
                                class="dh-admin-input"
                                value="Admin Entry"
                            >

                        </div>


                        <div class="dh-admin-field">

                            <label>
                                Average
                            </label>

                            <input
                                id="dh-admin-average"
                                class="dh-admin-input"
                                type="number"
                                step="0.01"
                                value="0"
                            >

                        </div>


                        <div class="dh-admin-field">

                            <label>
                                180s
                            </label>

                            <input
                                id="dh-admin-180s"
                                class="dh-admin-input"
                                type="number"
                                value="0"
                            >

                        </div>


                        <div class="dh-admin-field">

                            <label>
                                Checkout %
                            </label>

                            <input
                                id="dh-admin-checkout"
                                class="dh-admin-input"
                                type="number"
                                step="0.1"
                                value="0"
                            >

                        </div>


                        <div class="dh-admin-field">

                            <label>
                                Best Checkout
                            </label>

                            <input
                                id="dh-admin-best-checkout"
                                class="dh-admin-input"
                                type="number"
                                value="0"
                            >

                        </div>


                        <div class="dh-admin-field">

                            <label>
                                Board
                            </label>

                            <select
                                id="dh-admin-board"
                                class="dh-admin-select"
                            >

                                <option value="standard">
                                    Standard
                                </option>

                                <option value="indoor">
                                    Indoor
                                </option>

                            </select>

                        </div>

                    </div>


                    <div
                        class="dh-admin-field"
                        style="margin-top:8px;"
                    >

                        <label>
                            Extra Stats / Details JSON
                        </label>


                        <textarea
                            id="dh-admin-details"
                            class="dh-admin-textarea"
                        >{}</textarea>

                    </div>


                    <div
                        style="
                            display:grid;
                            grid-template-columns:1fr 1fr;
                            gap:7px;
                            margin-top:8px;
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



                <!-- HISTORY -->

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
                    style="margin-top:10px;"
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
        document
            .getElementById(
                "dh-admin-search"
            )
            .value
            .trim();


    const results =
        document.getElementById(
            "dh-admin-search-results"
        );


    results.innerHTML =
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

        results.innerHTML =
            "No players found.";


        return;
    }


    results.innerHTML =
        data
            .map(
                player => `

                    <div
                        class="dh-admin-result"
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


    if (
        !data?.profile
    ) {

        dhAdminMessage(
            "Player could not be loaded.",
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
            data.profile.display_name ||
            "Player";


    document
        .getElementById(
            "dh-admin-player-meta"
        )
        .textContent =

            `${data.profile.player_code || "No player code"} • ` +

            `${data.email || ""}`;


    document
        .getElementById(
            "dh-admin-ban-reason"
        )
        .value =
            data.ban?.reason ||
            "";


    dhAdminRenderStats(
        data.profile
    );


    dhAdminRenderMatches(
        data.matches ||
        []
    );


    dhAdminClearRecordForm();
}



/* =========================================================
   STATS
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


    const grid =
        document.getElementById(
            "dh-admin-stats-grid"
        );


    grid.innerHTML =
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



/* =========================================================
   SAVE STATS
========================================================= */

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


async function dhAdminSaveStats() {

    if (
        !dhAdminSelectedUser
    ) {

        return;
    }


    if (
        !confirm(
            "Save these statistics for this player?"
        )
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
        document
            .getElementById(
                "dh-admin-ban-reason"
            )
            .value
            .trim();


    if (
        banned &&
        !reason
    ) {

        alert(
            "Please enter a reason for the ban."
        );


        return;
    }


    if (
        !confirm(

            banned

                ? "Ban this player from Dart Hub?"

                : "Restore this player's access?"
        )
    ) {

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
   MATCH LIST
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

        list.innerHTML =
            "No records.";


        return;
    }


    list.innerHTML =
        matches
            .map(
                match => `

                    <div
                        class="dh-admin-match"
                        data-match-id="${match.id}"
                    >

                        <div>

                            <strong>
                                ${dhAdminEscape(
                                    match.game_mode
                                )}
                            </strong>

                            •
                            
                            ${dhAdminEscape(
                                match.result
                            )}

                            <div
                                style="
                                    color:#8e8994;
                                    font-size:10px;
                                    margin-top:3px;
                                "
                            >

                                ${
                                    match.starting_score ||
                                    0
                                }
                                start

                                •

                                Avg
                                ${
                                    Number(
                                        match.user_average ||
                                        0
                                    )
                                    .toFixed(
                                        2
                                    )
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
                                    item.id ===
                                    button.dataset
                                        .editMatch
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
                            button.dataset
                                .deleteMatch
                        );
            }
        );
}



/* =========================================================
   EDIT RECORD
========================================================= */

function dhAdminEditRecord(
    match
) {

    dhAdminEditingMatchID =
        match.id;


    document
        .getElementById(
            "dh-admin-record-title"
        )
        .textContent =
            "Edit Match / Practice Record";


    document
        .getElementById(
            "dh-admin-game-mode"
        )
        .value =
            match.game_mode ||
            "Legs";


    document
        .getElementById(
            "dh-admin-start-score"
        )
        .value =
            match.starting_score ||
            0;


    document
        .getElementById(
            "dh-admin-result"
        )
        .value =
            match.result ||
            "LOSS";


    document
        .getElementById(
            "dh-admin-opponent"
        )
        .value =
            match.opponent_name ||
            "";


    document
        .getElementById(
            "dh-admin-average"
        )
        .value =
            match.user_average ||
            0;


    document
        .getElementById(
            "dh-admin-180s"
        )
        .value =
            match.user_180s ||
            0;


    document
        .getElementById(
            "dh-admin-checkout"
        )
        .value =
            match.checkout_percentage ||
            0;


    document
        .getElementById(
            "dh-admin-best-checkout"
        )
        .value =
            match.best_checkout ||
            0;


    document
        .getElementById(
            "dh-admin-board"
        )
        .value =

            match.board_type ===
            "indoor"

                ? "indoor"

                : "standard";


    document
        .getElementById(
            "dh-admin-details"
        )
        .value =
            JSON.stringify(

                match.match_details ||
                {},

                null,

                2
            );


    document
        .getElementById(
            "dh-admin-save-record"
        )
        .textContent =
            "💾 Save Changes";
}



/* =========================================================
   CLEAR FORM
========================================================= */

function dhAdminClearRecordForm() {

    dhAdminEditingMatchID =
        null;


    document
        .getElementById(
            "dh-admin-record-title"
        )
        .textContent =
            "Add Match / Practice Record";


    document
        .getElementById(
            "dh-admin-game-mode"
        )
        .value =
            "Legs";


    document
        .getElementById(
            "dh-admin-start-score"
        )
        .value =
            501;


    document
        .getElementById(
            "dh-admin-result"
        )
        .value =
            "WIN";


    document
        .getElementById(
            "dh-admin-opponent"
        )
        .value =
            "Admin Entry";


    document
        .getElementById(
            "dh-admin-average"
        )
        .value =
            0;


    document
        .getElementById(
            "dh-admin-180s"
        )
        .value =
            0;


    document
        .getElementById(
            "dh-admin-checkout"
        )
        .value =
            0;


    document
        .getElementById(
            "dh-admin-best-checkout"
        )
        .value =
            0;


    document
        .getElementById(
            "dh-admin-board"
        )
        .value =
            "standard";


    document
        .getElementById(
            "dh-admin-details"
        )
        .value =
            "{}";


    document
        .getElementById(
            "dh-admin-save-record"
        )
        .textContent =
            "Save Record";
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


    let details;


    try {

        details =
            JSON.parse(

                document
                    .getElementById(
                        "dh-admin-details"
                    )
                    .value
                    .trim()

                ||

                "{}"
            );


    } catch (
        error
    ) {

        alert(
            "The Extra Stats / Details JSON is not valid JSON."
        );


        return;
    }


    const {
        error
    } =
        await dartHubSupabase
            .rpc(
                "dh_admin_save_record",
                {

                    p_match_id:
                        dhAdminEditingMatchID,

                    p_user_id:
                        dhAdminSelectedUser,

                    p_game_mode:
                        document
                            .getElementById(
                                "dh-admin-game-mode"
                            )
                            .value,

                    p_starting_score:
                        dhAdminNumber(
                            document
                                .getElementById(
                                    "dh-admin-start-score"
                                )
                                .value
                        ),

                    p_result:
                        document
                            .getElementById(
                                "dh-admin-result"
                            )
                            .value,

                    p_opponent_name:
                        document
                            .getElementById(
                                "dh-admin-opponent"
                            )
                            .value,

                    p_user_average:
                        dhAdminNumber(
                            document
                                .getElementById(
                                    "dh-admin-average"
                                )
                                .value
                        ),

                    p_user_180s:
                        dhAdminNumber(
                            document
                                .getElementById(
                                    "dh-admin-180s"
                                )
                                .value
                        ),

                    p_checkout_percentage:
                        dhAdminNumber(
                            document
                                .getElementById(
                                    "dh-admin-checkout"
                                )
                                .value
                        ),

                    p_best_checkout:
                        dhAdminNumber(
                            document
                                .getElementById(
                                    "dh-admin-best-checkout"
                                )
                                .value
                        ),

                    p_board_type:
                        document
                            .getElementById(
                                "dh-admin-board"
                            )
                            .value,

                    p_match_details:
                        details
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
        "✅ Record saved.",
        false
    );


    dhAdminClearRecordForm();


    await dhAdminLoadPlayer(
        dhAdminSelectedUser
    );
}



/* =========================================================
   DELETE
========================================================= */

async function dhAdminDeleteRecord(
    matchID
) {

    if (
        !confirm(
            "Permanently delete this Dart Hub record?"
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
                        matchID
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
        "Record deleted.",
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
   AUTH EVENTS
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