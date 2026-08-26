"use strict";


/* =========================================================
   DART HUB
   BOARD FILTER + PRACTICE PROFILE STATS
========================================================= */


let dhStatsBoard =
    "all";


let dhStatsOriginalRender =
    null;



/* =========================================================
   BOARD VALUE
========================================================= */

function dhStatsMatchBoard(
    match
) {

    const value =

        match.board_type

        ||

        match.match_details
            ?.board_type

        ||

        "standard";


    return value ===
        "indoor"

            ? "indoor"

            : "standard";
}



/* =========================================================
   BOARD FILTER
========================================================= */

function dhStatsBoardFilter(
    matches
) {

    if (
        dhStatsBoard ===
        "all"
    ) {

        return matches;
    }


    return matches.filter(
        match =>
            dhStatsMatchBoard(
                match
            ) ===
            dhStatsBoard
    );
}



/* =========================================================
   MODE FILTER
========================================================= */

function dhStatsModeFilter(
    matches,
    mode
) {

    if (
        mode ===
        "overall"
    ) {

        return matches;
    }


    if (
        mode ===
        "practice"
    ) {

        return matches.filter(
            match =>
                String(
                    match.game_mode
                ) ===
                "Average Practice"
        );
    }


    if (
        [
            "101",
            "201",
            "301",
            "501"
        ].includes(
            mode
        )
    ) {

        return matches.filter(
            match => {

                const game =
                    String(
                        match.game_mode ||
                        ""
                    );


                return (

                    (
                        game ===
                            "Legs"

                        ||

                        game ===
                            "501 / Legs"
                    )

                    &&

                    Number(
                        match.starting_score
                    ) ===
                    Number(
                        mode
                    )
                );
            }
        );
    }


    return v23FilterMatches(
        matches,
        mode
    );
}



/* =========================================================
   INSTALL PROFILE FILTERS
========================================================= */

function dhStatsInstallProfileControls() {

    const hub =
        document.getElementById(
            "v23-profile-hub"
        );


    if (
        !hub
    ) {

        return false;
    }


    const modeMenu =
        hub.querySelector(
            ".v23-mode-menu"
        );


    const content =
        document.getElementById(
            "v23-profile-content"
        );


    if (
        !modeMenu ||
        !content
    ) {

        return false;
    }


    /*
       Add score-specific modes.
    */

    const extraModes = [

        [
            "101",
            "101"
        ],

        [
            "201",
            "201"
        ],

        [
            "301",
            "301"
        ],

        [
            "501",
            "501"
        ],

        [
            "practice",
            "Practice"
        ]
    ];


    extraModes.forEach(
        (
            [
                mode,
                label
            ]
        ) => {

            if (
                modeMenu.querySelector(
                    `[data-v23-mode="${mode}"]`
                )
            ) {

                return;
            }


            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "v23-mode-button";


            button.dataset.v23Mode =
                mode;


            button.textContent =
                label;


            button.onclick =
                () => {

                    v23ProfileMode =
                        mode;


                    modeMenu
                        .querySelectorAll(
                            "[data-v23-mode]"
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


                    v23RenderProfile();
                };


            modeMenu.appendChild(
                button
            );
        }
    );


    modeMenu.style.gridTemplateColumns =
        "repeat(3, 1fr)";


    /*
       Board selector.
    */

    if (
        !document.getElementById(
            "dh-stats-board-filter"
        )
    ) {

        const board =
            document.createElement(
                "div"
            );


        board.id =
            "dh-stats-board-filter";


        board.innerHTML = `

            <div
                style="
                    color:#82949c;
                    font-size:10px;
                    font-weight:900;
                    text-transform:uppercase;
                    margin-bottom:5px;
                    text-align:left;
                "
            >
                Dartboard
            </div>


            <div
                style="
                    display:grid;
                    grid-template-columns:repeat(3,1fr);
                    gap:6px;
                    margin-bottom:9px;
                "
            >

                <button
                    class="v23-mode-button active"
                    data-stats-board="all"
                    type="button"
                >
                    All Boards
                </button>


                <button
                    class="v23-mode-button"
                    data-stats-board="standard"
                    type="button"
                >
                    🎯 Standard
                </button>


                <button
                    class="v23-mode-button"
                    data-stats-board="indoor"
                    type="button"
                >
                    🏠 Indoor
                </button>

            </div>
        `;


        content.insertAdjacentElement(
            "beforebegin",
            board
        );


        board
            .querySelectorAll(
                "[data-stats-board]"
            )
            .forEach(
                button => {

                    button.onclick =
                        () => {

                            dhStatsBoard =
                                button.dataset
                                    .statsBoard;


                            board
                                .querySelectorAll(
                                    "[data-stats-board]"
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


                            v23RenderProfile();
                        };
                }
            );
    }


    return true;
}



/* =========================================================
   FIX STARTING SCORE BREAKDOWN
========================================================= */

function dhStatsFixStartingScores() {

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

                201:
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
                        [
                            101,
                            201,
                            301,
                            501
                        ].includes(
                            score
                        )
                    ) {

                        groups[
                            score
                        ].push(
                            match
                        );


                    } else if (
                        score
                    ) {

                        groups.other.push(
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
                    "201",
                    groups[201]
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
                        rows.map(
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
                        ).join(
                            ""
                        )
                    }

                </div>
            `;
        };
}



/* =========================================================
   PRACTICE STATS
========================================================= */

function dhStatsRenderPractice(
    container,
    rows
) {

    const sessions =
        rows.length;


    const points =
        rows.reduce(
            (
                total,
                match
            ) =>

                total +

                Number(
                    match.match_details
                        ?.points ||
                    0
                ),
            0
        );


    const darts =
        rows.reduce(
            (
                total,
                match
            ) =>

                total +

                Number(
                    match.match_details
                        ?.darts ||
                    0
                ),
            0
        );


    const visits =
        rows.reduce(
            (
                total,
                match
            ) =>

                total +

                Number(
                    match.match_details
                        ?.visits ||
                    0
                ),
            0
        );


    const scores100 =
        rows.reduce(
            (
                total,
                match
            ) =>

                total +

                Number(
                    match.match_details
                        ?.scores_100 ||
                    0
                ),
            0
        );


    const scores140 =
        rows.reduce(
            (
                total,
                match
            ) =>

                total +

                Number(
                    match.match_details
                        ?.scores_140 ||
                    0
                ),
            0
        );


    const scores180 =
        rows.reduce(
            (
                total,
                match
            ) =>

                total +

                Number(
                    match.match_details
                        ?.scores_180 ||
                    match.user_180s ||
                    0
                ),
            0
        );


    const bestVisit =
        rows.reduce(
            (
                best,
                match
            ) =>

                Math.max(

                    best,

                    Number(
                        match.match_details
                            ?.highest_visit ||
                        0
                    )
                ),
            0
        );


    const averages =
        rows

            .map(
                match =>
                    Number(
                        match.user_average ||
                        0
                    )
            )

            .filter(
                value =>
                    value >
                    0
            );


    const overallAverage =

        darts

            ? (
                points /
                darts *
                3
            )

            : 0;


    const bestAverage =

        averages.length

            ? Math.max(
                ...averages
            )

            : 0;


    const longestSession =
        rows.reduce(
            (
                highest,
                match
            ) =>

                Math.max(

                    highest,

                    Number(
                        match.match_details
                            ?.darts ||
                        0
                    )
                ),
            0
        );


    container.innerHTML = `

        <div class="v23-stat-grid">

            ${v23Stat(
                "Sessions",
                sessions
            )}

            ${v23Stat(
                "3-Dart Avg",
                overallAverage.toFixed(
                    2
                )
            )}

            ${v23Stat(
                "Best Session Avg",
                bestAverage.toFixed(
                    2
                )
            )}

            ${v23Stat(
                "Total Darts",
                darts
            )}

            ${v23Stat(
                "Total Points",
                points
            )}

            ${v23Stat(
                "Visits",
                visits
            )}

            ${v23Stat(
                "Best Visit",
                bestVisit
            )}

            ${v23Stat(
                "Longest Session",
                `${longestSession} darts`
            )}

            ${v23Stat(
                "100+",
                scores100
            )}

            ${v23Stat(
                "140+",
                scores140
            )}

            ${v23Stat(
                "180s",
                scores180
            )}

        </div>
    `;
}



/* =========================================================
   OVERALL STATS
========================================================= */

function dhStatsRenderOverall(
    container,
    rows
) {

    /*
       Practice counts toward scoring statistics,
       but not W/L record.
    */

    const matchRows =
        rows.filter(
            match =>
                String(
                    match.game_mode
                ) !==
                "Average Practice"
        );


    const scoringRows =
        rows.filter(
            match => {

                const mode =
                    String(
                        match.game_mode
                    );


                return (

                    mode !==
                        "Cricket"

                    &&

                    Number(
                        match.user_average ||
                        0
                    ) >
                        0
                );
            }
        );


    const wins =
        matchRows.filter(
            match =>
                match.result ===
                "WIN"
        ).length;


    const losses =
        matchRows.filter(
            match =>
                match.result ===
                "LOSS"
        ).length;


    const practices =
        rows.filter(
            match =>
                match.game_mode ===
                "Average Practice"
        );


    const averages =
        scoringRows.map(
            match =>
                Number(
                    match.user_average
                )
        );


    const average =

        averages.length

            ? (
                averages.reduce(
                    (
                        total,
                        value
                    ) =>
                        total +
                        value,
                    0
                )

                /

                averages.length
            )

            : 0;


    const total180 =
        scoringRows.reduce(
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


    const bestAverage =

        averages.length

            ? Math.max(
                ...averages
            )

            : 0;


    container.innerHTML = `

        <div class="v23-stat-grid">

            ${v23Stat(
                "Matches",
                matchRows.length
            )}

            ${v23Stat(
                "Wins",
                wins
            )}

            ${v23Stat(
                "Losses",
                losses
            )}

            ${v23Stat(
                "Win %",
                v23Percent(
                    wins,
                    matchRows.length
                )
            )}

            ${v23Stat(
                "Practice Sessions",
                practices.length
            )}

            ${v23Stat(
                "Overall Scoring Avg",
                average.toFixed(
                    2
                )
            )}

            ${v23Stat(
                "180s",
                total180
            )}

            ${v23Stat(
                "Best Session Avg",
                bestAverage.toFixed(
                    2
                )
            )}

        </div>


        <div class="v23-breakdown">

            <h3>
                By Game Mode
            </h3>

            ${dhStatsOverallRow(
                "Legs",
                matchRows.filter(
                    match =>
                        v23ModeKey(
                            match
                        ) ===
                        "legs"
                )
            )}

            ${dhStatsOverallRow(
                "Sets + Legs",
                matchRows.filter(
                    match =>
                        v23ModeKey(
                            match
                        ) ===
                        "sets"
                )
            )}

            ${dhStatsOverallRow(
                "Cricket",
                matchRows.filter(
                    match =>
                        v23ModeKey(
                            match
                        ) ===
                        "cricket"
                )
            )}

            <div class="v23-breakdown-row">

                <span>
                    Average Practice
                </span>

                <strong>
                    ${practices.length}
                    session${
                        practices.length ===
                        1
                            ? ""
                            : "s"
                    }
                </strong>

            </div>

        </div>
    `;
}


function dhStatsOverallRow(
    label,
    rows
) {

    const wins =
        rows.filter(
            row =>
                row.result ===
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
                    rows.length -
                    wins
                }

            </strong>

        </div>
    `;
}



/* =========================================================
   OVERRIDE PROFILE RENDER
========================================================= */

function dhStatsInstallRenderer() {

    if (
        typeof v23RenderProfile !==
            "function"
    ) {

        return false;
    }


    if (
        window.__dhStatsRenderer
    ) {

        return true;
    }


    window.__dhStatsRenderer =
        true;


    dhStatsOriginalRender =
        v23RenderProfile;


    v23RenderProfile =
        function () {

            const container =
                document.getElementById(
                    "v23-profile-content"
                );


            if (
                !container
            ) {

                return;
            }


            if (
                v23ProfileView ===
                "rivals"
            ) {

                dhStatsOriginalRender();


                return;
            }


            let rows =
                dhStatsBoardFilter(
                    v23ProfileMatches
                );


            rows =
                dhStatsModeFilter(
                    rows,
                    v23ProfileMode
                );


            if (
                v23ProfileMode ===
                "overall"
            ) {

                dhStatsRenderOverall(
                    container,
                    rows
                );


                return;
            }


            if (
                v23ProfileMode ===
                "practice"
            ) {

                dhStatsRenderPractice(
                    container,
                    rows
                );


                return;
            }


            if (
                v23ProfileMode ===
                "cricket"
            ) {

                v23RenderCricketStats(
                    container,
                    rows
                );


                return;
            }


            v23RenderDartsStats(
                container,
                rows
            );
        };


    return true;
}



/* =========================================================
   INITIALISE
========================================================= */

function dhStatsInit() {

    dhStatsFixStartingScores();


    const installed =
        dhStatsInstallRenderer();


    const controls =
        dhStatsInstallProfileControls();


    if (
        installed &&
        controls
    ) {

        v23RenderProfile();


        return;
    }


    setTimeout(
        dhStatsInit,
        700
    );
}


setTimeout(
    dhStatsInit,
    1800
);