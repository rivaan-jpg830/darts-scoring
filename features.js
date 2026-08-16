"use strict";


/* =========================================================
   DART HUB
   MULTI-GAME PROFILES + RIVALS + CRICKET CLOUD
   VERSION 23
========================================================= */


/* =========================================================
   STATE
========================================================= */

let v23ProfileMode =
    "overall";


let v23ProfileView =
    "stats";


let v23ProfileMatches =
    [];


let v23SelectedRivalID =
    null;


let v23SelectedRivalName =
    "";


let v23CricketFirstInnings = {

    captured:
        false,

    team:
        "",

    runs:
        0,

    wickets:
        0,

    declared:
        false
};


let v23CricketResultSaved =
    false;


let v23CricketDeclarationPending =
    false;


/* =========================================================
   HELPERS
========================================================= */

function v23Escape(
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


function v23Percent(
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


function v23Mean(
    values
) {

    const usable =
        values.filter(
            value =>
                Number.isFinite(
                    Number(
                        value
                    )
                )
        );


    if (
        !usable.length
    ) {

        return 0;
    }


    return (

        usable.reduce(
            (
                total,
                value
            ) =>
                total +
                Number(
                    value
                ),
            0
        )

        /

        usable.length
    );
}


function v23GameMode(
    match
) {

    const mode =
        String(
            match.game_mode ||
            ""
        );


    if (
        mode ===
        "501 / Legs"
    ) {

        return "Legs";
    }


    return mode;
}


function v23ModeKey(
    match
) {

    const mode =
        v23GameMode(
            match
        );


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


function v23FilterMatches(
    matches,
    mode
) {

    if (
        mode ===
        "overall"
    ) {

        return matches;
    }


    return matches.filter(
        match =>
            v23ModeKey(
                match
            ) ===
            mode
    );
}


function v23CurrentUserID() {

    return (

        currentDartHubUser

            ? currentDartHubUser.id

            : ""
    );
}


function v23CurrentPlayerName() {

    return (

        currentCloudProfile &&
        currentCloudProfile.display_name

            ? currentCloudProfile.display_name

            : (
                currentUserName
                    ? currentUserName.textContent
                    : "Player"
            )
    );
}


function v23OpponentSlot() {

    return (

        dartHubAccountPlayerSlot ===
        1

            ? 2

            : 1
    );
}


function v23MakeUUID() {

    if (
        window.crypto &&
        typeof window.crypto.randomUUID ===
            "function"
    ) {

        return window.crypto.randomUUID();
    }


    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
        .replace(

            /[xy]/g,

            character => {

                const random =
                    Math.floor(
                        Math.random() *
                        16
                    );


                const value =

                    character ===
                    "x"

                        ? random

                        : (
                            random &
                            0x3
                        )
                        |
                        0x8;


                return value.toString(
                    16
                );
            }
        );
}


function v23MatchUID() {

    if (
        typeof getCurrentMatchUID ===
        "function"
    ) {

        return getCurrentMatchUID();
    }


    return v23MakeUUID();
}


/* =========================================================
   BRANDING
   501 / Legs -> Legs
========================================================= */

function v23RenameLegs() {

    const button =
        document.querySelector(
            '.mode-btn[data-mode="501"]'
        );


    if (
        button
    ) {

        button.innerHTML =
            "🎯 Legs";
    }


    document
        .querySelectorAll(
            ".cloud-match-meta"
        )
        .forEach(
            element => {

                element.innerHTML =
                    element.innerHTML
                        .replaceAll(
                            "501 / Legs",
                            "Legs"
                        );
            }
        );
}


/* =========================================================
   PLAYER SELECTION FOR CRICKET
========================================================= */

function v23EnablePlayersForCricket() {

    if (
        typeof setPlayerPanelGameModeV22 !==
        "function"
    ) {

        return;
    }


    const original =
        setPlayerPanelGameModeV22;


    setPlayerPanelGameModeV22 =
        function (
            mode
        ) {

            if (
                mode !==
                "cricket"
            ) {

                original(
                    mode
                );


                v23RelabelPlayerCards(
                    false
                );


                return;
            }


            /*
               V22 deliberately hid this panel for Cricket.
               V23 makes registered players a Dart Hub feature.
            */

            if (
                identityPanelV22
            ) {

                identityPanelV22.classList.remove(
                    "hidden"
                );
            }


            updatePlayerSelectionV22();


            v23RelabelPlayerCards(
                true
            );
        };
}


function v23RelabelPlayerCards(
    cricket
) {

    const panel =
        document.getElementById(
            "v22-player-panel"
        );


    if (
        !panel
    ) {

        return;
    }


    const titles =
        panel.querySelectorAll(
            ".dh-player-card-title"
        );


    if (
        titles[0]
    ) {

        titles[0].textContent =

            cricket

                ? "Team A"

                : "Player 1";
    }


    if (
        titles[1]
    ) {

        titles[1].textContent =

            cricket

                ? "Team B"

                : "Player 2";
    }


    const heading =
        panel.querySelector(
            ".dh-player-heading"
        );


    if (
        heading
    ) {

        heading.textContent =

            cricket

                ? "Choose Teams"

                : "Choose Players";
    }


    const help =
        panel.querySelector(
            ".dh-player-help"
        );


    if (
        help
    ) {

        help.textContent =

            cricket

                ? "Choose which team is your Dart Hub account. The other team can be a guest or registered Dart Hub player."

                : "One side is your Dart Hub account. The opponent can be a guest or another registered Dart Hub player.";
    }
}


/* =========================================================
   EXTRA CRICKET VALIDATION
========================================================= */

function v23ValidateCricketPlayers(
    event
) {

    if (
        selectedMode !==
        "cricket"
    ) {

        return;
    }


    const myName =
        v23CurrentPlayerName();


    const opponentSlot =
        v23OpponentSlot();


    const myInput =
        getNameInputV22(
            dartHubAccountPlayerSlot
        );


    const opponentInput =
        getNameInputV22(
            opponentSlot
        );


    myInput.value =
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
                "Find the registered Cricket opponent before continuing."
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
            "Enter the guest team name."
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
            "The guest team cannot use the same name as your Dart Hub profile."
        );
    }
}


/* =========================================================
   CRICKET MATCH TRACKING
========================================================= */

function v23ResetCricketTracking() {

    v23CricketFirstInnings = {

        captured:
            false,

        team:
            "",

        runs:
            0,

        wickets:
            0,

        declared:
            false
    };


    v23CricketResultSaved =
        false;


    v23CricketDeclarationPending =
        false;


    if (
        typeof createNewMatchUID ===
        "function"
    ) {

        createNewMatchUID();
    }
}


/* =========================================================
   WRAP CRICKET NAME SETUP
========================================================= */

function v23WrapCricketSetup() {

    if (
        typeof setupCricketNames !==
        "function"
    ) {

        return;
    }


    const original =
        setupCricketNames;


    setupCricketNames =
        function (
            teamA,
            teamB
        ) {

            v23ResetCricketTracking();


            original(
                teamA,
                teamB
            );


            v23RelabelPlayerCards(
                true
            );
        };
}


/* =========================================================
   CAPTURE FIRST INNINGS
========================================================= */

function v23WrapSecondInnings() {

    if (
        typeof startSecondCricketInnings !==
        "function"
    ) {

        return;
    }


    const original =
        startSecondCricketInnings;


    startSecondCricketInnings =
        function () {

            if (
                !v23CricketFirstInnings
                    .captured
            ) {

                v23CricketFirstInnings = {

                    captured:
                        true,

                    team:
                        cricketBattingName
                            .textContent,

                    runs:
                        cricketRuns,

                    wickets:
                        cricketWickets,

                    declared:
                        v23CricketDeclarationPending
                };
            }


            v23CricketDeclarationPending =
                false;


            original();
        };
}


/* =========================================================
   DECLARATION
========================================================= */

function v23FixCricketDeclaration() {

    const button =
        document.getElementById(
            "cricket-declare"
        );


    if (
        !button
    ) {

        return;
    }


    button.onclick =
        () => {

            if (
                cricketFinished
            ) {

                return;
            }


            /*
               Declaration makes sense for the side
               setting a target.

               The chase itself should finish by
               reaching the target or losing wickets.
            */

            if (
                cricketInnings !==
                1
            ) {

                alert(
                    "The chasing team cannot declare."
                );


                return;
            }


            pushCricket();


            v23CricketDeclarationPending =
                true;


            startSecondCricketInnings();


            updateCricket();
        };
}


/* =========================================================
   WRAP CRICKET RESULT
========================================================= */

function v23WrapCricketResult() {

    if (
        typeof checkCricket !==
        "function"
    ) {

        return;
    }


    const original =
        checkCricket;


    checkCricket =
        function () {

            const wasFinished =
                cricketFinished;


            original();


            if (
                !wasFinished &&
                cricketFinished &&
                !v23CricketResultSaved
            ) {

                v23CricketResultSaved =
                    true;


                setTimeout(
                    saveCricketMatchV23,
                    150
                );
            }
        };
}


/* =========================================================
   CRICKET RESULT DETAILS
========================================================= */

function v23CricketDetails() {

    const teamAName =
        cricketTeamA.textContent;


    const teamBName =
        cricketTeamB.textContent;


    /*
       Current Cricket rules:
       Team B bats first.
       Team A chases second.
    */

    const teamBRuns =

        v23CricketFirstInnings
            .captured

            ? v23CricketFirstInnings
                .runs

            : (
                cricketTarget !==
                null

                    ? cricketTarget -
                      1

                    : 0
            );


    const teamBWickets =

        v23CricketFirstInnings
            .captured

            ? v23CricketFirstInnings
                .wickets

            : cricketTotalWickets;


    const teamARuns =
        cricketRuns;


    const teamAWickets =
        cricketWickets;


    const teamAUserID =

        dartHubAccountPlayerSlot ===
        1

            ? v23CurrentUserID()

            : (
                dartHubOpponentType ===
                    "registered" &&
                dartHubRegisteredOpponent

                    ? dartHubRegisteredOpponent
                        .user_id

                    : null
            );


    const teamBUserID =

        dartHubAccountPlayerSlot ===
        2

            ? v23CurrentUserID()

            : (
                dartHubOpponentType ===
                    "registered" &&
                dartHubRegisteredOpponent

                    ? dartHubRegisteredOpponent
                        .user_id

                    : null
            );


    let winnerName =
        "";


    if (
        cricketTarget !==
            null &&
        teamARuns >=
            cricketTarget
    ) {

        winnerName =
            teamAName;


    } else {

        winnerName =
            teamBName;
    }


    const winnerUserID =

        winnerName ===
        teamAName

            ? teamAUserID

            : teamBUserID;


    return {

        game:
            "Cricket",

        total_wickets:
            cricketTotalWickets,

        team_a_name:
            teamAName,

        team_b_name:
            teamBName,

        team_a_user_id:
            teamAUserID,

        team_b_user_id:
            teamBUserID,

        team_a_runs:
            teamARuns,

        team_a_wickets_lost:
            teamAWickets,

        team_b_runs:
            teamBRuns,

        team_b_wickets_lost:
            teamBWickets,

        target:
            cricketTarget,

        first_innings_declared:
            Boolean(
                v23CricketFirstInnings
                    .declared
            ),

        winner_name:
            winnerName,

        winner_user_id:
            winnerUserID,

        winning_margin:

            winnerName ===
            teamAName

                ? {

                    type:
                        "wickets",

                    value:
                        Math.max(

                            0,

                            cricketTotalWickets -
                            teamAWickets
                        )
                }

                : {

                    type:
                        "runs",

                    value:
                        Math.max(

                            0,

                            teamBRuns -
                            teamARuns
                        )
                }
    };
}


/* =========================================================
   SAVE CRICKET
========================================================= */

async function saveCricketMatchV23() {

    if (
        !currentDartHubUser ||
        !currentCloudProfile
    ) {

        return;
    }


    const details =
        v23CricketDetails();


    const myTeamName =

        dartHubAccountPlayerSlot ===
        1

            ? details.team_a_name

            : details.team_b_name;


    const opponentName =

        dartHubAccountPlayerSlot ===
        1

            ? details.team_b_name

            : details.team_a_name;


    const userWon =
        details.winner_name ===
        myTeamName;


    if (
        dartHubOpponentType ===
            "registered" &&
        dartHubRegisteredOpponent
    ) {

        await v23SubmitRegisteredCricket(
            details
        );


        return;
    }


    /*
       Guest Cricket:
       save only to signed-in account.
    */

    try {

        const {
            error:
                matchError
        } =
            await dartHubSupabase

                .from(
                    "matches"
                )

                .insert({

                    user_id:
                        currentDartHubUser.id,

                    opponent_name:
                        opponentName,

                    opponent_user_id:
                        null,

                    match_uid:
                        v23MatchUID(),

                    game_mode:
                        "Cricket",

                    starting_score:
                        0,

                    result:
                        userWon
                            ? "WIN"
                            : "LOSS",

                    user_average:
                        0,

                    opponent_average:
                        0,

                    user_180s:
                        0,

                    opponent_180s:
                        0,

                    checkout_percentage:
                        0,

                    best_checkout:
                        0,

                    match_details:
                        details
                });


        if (
            matchError
        ) {

            throw matchError;
        }


        const profile =
            currentCloudProfile;


        const {
            data,
            error:
                profileError
        } =
            await dartHubSupabase

                .from(
                    "profiles"
                )

                .update({

                    matches_played:
                        Number(
                            profile.matches_played ||
                            0
                        )
                        +
                        1,

                    wins:
                        Number(
                            profile.wins ||
                            0
                        )
                        +
                        (
                            userWon
                                ? 1
                                : 0
                        ),

                    losses:
                        Number(
                            profile.losses ||
                            0
                        )
                        +
                        (
                            userWon
                                ? 0
                                : 1
                        ),

                    updated_at:
                        new Date()
                            .toISOString()
                })

                .eq(
                    "id",
                    currentDartHubUser.id
                )

                .select()

                .single();


        if (
            profileError
        ) {

            throw profileError;
        }


        currentCloudProfile =
            data;


        console.log(
            "Guest Cricket match saved."
        );


    } catch (
        error
    ) {

        console.error(
            "Cricket cloud save:",
            error
        );


        alert(
            "The Cricket match finished but Dart Hub could not save it to your profile."
        );
    }
}


/* =========================================================
   SUBMIT REGISTERED CRICKET
========================================================= */

async function v23SubmitRegisteredCricket(
    details
) {

    const winnerID =
        details.winner_user_id;


    if (
        !winnerID
    ) {

        alert(
            "Dart Hub could not identify the registered Cricket winner."
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
                    "submit_registered_match_v23",
                    {

                        p_match_uid:
                            v23MatchUID(),

                        p_opponent_id:
                            dartHubRegisteredOpponent
                                .user_id,

                        p_game_mode:
                            "Cricket",

                        p_starting_score:
                            0,

                        p_winner_id:
                            winnerID,

                        p_user_average:
                            0,

                        p_opponent_average:
                            0,

                        p_user_points:
                            0,

                        p_opponent_points:
                            0,

                        p_user_darts:
                            0,

                        p_opponent_darts:
                            0,

                        p_user_100s:
                            0,

                        p_opponent_100s:
                            0,

                        p_user_140s:
                            0,

                        p_opponent_140s:
                            0,

                        p_user_180s:
                            0,

                        p_opponent_180s:
                            0,

                        p_user_checkouts:
                            0,

                        p_opponent_checkouts:
                            0,

                        p_user_checkout_attempts:
                            0,

                        p_opponent_checkout_attempts:
                            0,

                        p_user_best_checkout:
                            0,

                        p_opponent_best_checkout:
                            0,

                        p_match_details:
                            details
                    }
                );


        if (
            error
        ) {

            throw error;
        }


        console.log(
            "Cricket confirmation submitted:",
            data
        );


        if (
            typeof loadMatchRequests ===
            "function"
        ) {

            await loadMatchRequests();
        }


        alert(

            `Cricket result sent to ` +

            `${dartHubRegisteredOpponent.display_name} ` +

            `for confirmation.`
        );


    } catch (
        error
    ) {

        console.error(
            error
        );


        alert(
            "Dart Hub could not send the Cricket result for confirmation."
        );
    }
}


/* =========================================================
   NORMAL LEGS / SETS MATCH DETAILS
========================================================= */

function v23NormalMatchDetails() {

    const p1 =
        players[0];


    const p2 =
        players[1];


    function stats(
        player
    ) {

        const attempts =
            Number(
                player.stats.checkoutAttempts ||
                0
            );


        const checkouts =
            Number(
                player.stats.checkouts ||
                0
            );


        return {

            average:

                player.stats.dartsThrown

                    ? (
                        player.stats.pointsScored /
                        player.stats.dartsThrown *
                        3
                    )

                    : 0,

            points:
                player.stats.pointsScored ||
                0,

            darts:
                player.stats.dartsThrown ||
                0,

            scores_100:
                player.stats.scores100 ||
                0,

            scores_140:
                player.stats.scores140 ||
                0,

            scores_180:
                player.stats.scores180 ||
                0,

            checkout_attempts:
                attempts,

            checkouts:
                checkouts,

            checkout_percentage:

                attempts

                    ? (
                        checkouts /
                        attempts *
                        100
                    )

                    : 0,

            best_checkout:
                player.stats.bestCheckout ||
                0,

            highest_visit:
                player.stats.highestVisit ||
                0
        };
    }


    return {

        game:

            gameMode ===
            "sets"

                ? "Sets + Legs"

                : "Legs",

        starting_score:
            startingScore,

        first_to:
            setsToWin,

        legs_per_set:
            legsPerSet,

        account_slot:
            dartHubAccountPlayerSlot,

        player_1_name:
            p1.name,

        player_2_name:
            p2.name,

        player_1:
            stats(
                p1
            ),

        player_2:
            stats(
                p2
            ),

        winner_slot:
            winnerPlayer
    };
}


/* =========================================================
   OVERRIDE REGISTERED LEGS/SETS SAVE
========================================================= */

function v23InstallRegisteredSave() {

    if (
        window.__dartHubV23CloudSave
    ) {

        return;
    }


    if (
        typeof saveCompletedCloudMatch !==
        "function"
    ) {

        return;
    }


    window.__dartHubV23CloudSave =
        true;


    const previousSave =
        saveCompletedCloudMatch;


    saveCompletedCloudMatch =
        async function () {

            /*
               Guest matches continue through the existing
               v19/v22 save path.

               Registered matches use V23 so they include
               game configuration and rival data.
            */

            if (
                dartHubOpponentType !==
                    "registered" ||
                !dartHubRegisteredOpponent
            ) {

                await previousSave();


                return;
            }


            const myIndex =
                dartHubAccountPlayerSlot -
                1;


            const opponentIndex =

                myIndex ===
                0

                    ? 1

                    : 0;


            const me =
                players[
                    myIndex
                ];


            const opponent =
                players[
                    opponentIndex
                ];


            const myAverage =

                me.stats.dartsThrown

                    ? (
                        me.stats.pointsScored /
                        me.stats.dartsThrown *
                        3
                    )

                    : 0;


            const opponentAverage =

                opponent.stats.dartsThrown

                    ? (
                        opponent.stats.pointsScored /
                        opponent.stats.dartsThrown *
                        3
                    )

                    : 0;


            const winnerID =

                winnerPlayer ===
                dartHubAccountPlayerSlot

                    ? currentDartHubUser.id

                    : dartHubRegisteredOpponent
                        .user_id;


            try {

                const {
                    error
                } =
                    await dartHubSupabase
                        .rpc(
                            "submit_registered_match_v23",
                            {

                                p_match_uid:
                                    v23MatchUID(),

                                p_opponent_id:
                                    dartHubRegisteredOpponent
                                        .user_id,

                                p_game_mode:

                                    gameMode ===
                                    "sets"

                                        ? "Sets + Legs"

                                        : "Legs",

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
                                    me.stats.pointsScored ||
                                    0,

                                p_opponent_points:
                                    opponent.stats.pointsScored ||
                                    0,

                                p_user_darts:
                                    me.stats.dartsThrown ||
                                    0,

                                p_opponent_darts:
                                    opponent.stats.dartsThrown ||
                                    0,

                                p_user_100s:
                                    me.stats.scores100 ||
                                    0,

                                p_opponent_100s:
                                    opponent.stats.scores100 ||
                                    0,

                                p_user_140s:
                                    me.stats.scores140 ||
                                    0,

                                p_opponent_140s:
                                    opponent.stats.scores140 ||
                                    0,

                                p_user_180s:
                                    me.stats.scores180 ||
                                    0,

                                p_opponent_180s:
                                    opponent.stats.scores180 ||
                                    0,

                                p_user_checkouts:
                                    me.stats.checkouts ||
                                    0,

                                p_opponent_checkouts:
                                    opponent.stats.checkouts ||
                                    0,

                                p_user_checkout_attempts:
                                    me.stats.checkoutAttempts ||
                                    0,

                                p_opponent_checkout_attempts:
                                    opponent.stats.checkoutAttempts ||
                                    0,

                                p_user_best_checkout:
                                    me.stats.bestCheckout ||
                                    0,

                                p_opponent_best_checkout:
                                    opponent.stats.bestCheckout ||
                                    0,

                                p_match_details:
                                    v23NormalMatchDetails()
                            }
                        );


                if (
                    error
                ) {

                    throw error;
                }


                await loadMatchRequests();


                alert(

                    `Result sent to ` +

                    `${dartHubRegisteredOpponent.display_name} ` +

                    `for confirmation.`
                );


            } catch (
                error
            ) {

                console.error(
                    error
                );


                alert(
                    "Dart Hub could not send the registered result."
                );
            }
        };
}


/* =========================================================
   V23 RESULT CONFIRMATION
========================================================= */

function v23OverrideConfirmationResponse() {

    if (
        typeof respondToMatchRequest !==
        "function"
    ) {

        return;
    }


    respondToMatchRequest =
        async function (
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
                    "Dart Hub could not process the match confirmation."
                );
            }
        };
}


/* =========================================================
   CRICKET-AWARE CONFIRMATION CARD
========================================================= */

function v23GameAwareConfirmations() {

    if (
        typeof matchRequestHTML !==
        "function"
    ) {

        return;
    }


    const original =
        matchRequestHTML;


    matchRequestHTML =
        function (
            request
        ) {

            if (
                v23GameMode(
                    request
                ) !==
                "Cricket"
            ) {

                return original(
                    request
                )
                    .replaceAll(
                        "501 / Legs",
                        "Legs"
                    );
            }


            const details =
                request.match_details ||
                {};


            const incoming =

                request.opponent_id ===
                currentDartHubUser.id;


            const otherName =

                incoming

                    ? request.submitter_name

                    : request.opponent_name;


            const winner =
                details.winner_name ||
                "Unknown";


            const wickets =
                details.total_wickets ||
                "?";


            const statusText =

                request.status ===
                "pending"

                    ? (
                        incoming

                            ? "ACTION REQUIRED"

                            : "WAITING FOR OPPONENT"
                    )

                    : request.status
                        .toUpperCase();


            let actions =
                "";


            if (
                request.status ===
                    "pending" &&
                incoming
            ) {

                actions = `

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
                !incoming
            ) {

                actions = `

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


            return `

                <div class="dh-request ${
                    incoming
                        ? "incoming"
                        : "outgoing"
                }">

                    <div class="dh-request-title">

                        ${
                            incoming
                                ? "Cricket result submitted by"
                                : "Cricket result sent to"
                        }

                        ${v23Escape(
                            otherName
                        )}

                    </div>


                    <div class="dh-request-meta">

                        Cricket

                        • ${wickets} wickets

                        • ${new Date(
                            request.created_at
                        ).toLocaleString()}

                    </div>


                    <div class="dh-request-result">

                        Winner:
                        ${v23Escape(
                            winner
                        )}

                    </div>


                    <div class="dh-request-stats">

                        <div class="dh-request-stat">

                            ${v23Escape(
                                details.team_b_name ||
                                "Team B"
                            )}

                            <strong>

                                ${
                                    details.team_b_runs ??
                                    0
                                }

                                /

                                ${
                                    details.team_b_wickets_lost ??
                                    0
                                }

                            </strong>

                        </div>


                        <div class="dh-request-stat">

                            ${v23Escape(
                                details.team_a_name ||
                                "Team A"
                            )}

                            <strong>

                                ${
                                    details.team_a_runs ??
                                    0
                                }

                                /

                                ${
                                    details.team_a_wickets_lost ??
                                    0
                                }

                            </strong>

                        </div>

                    </div>


                    <div class="dh-request-status ${request.status}">

                        ${statusText}

                    </div>


                    ${actions}

                </div>
            `;
        };
}


/* =========================================================
   PROFILE UI
========================================================= */

function v23InstallProfileUI() {

    const profile =
        document.getElementById(
            "cloud-profile-screen"
        );


    if (
        !profile ||
        document.getElementById(
            "v23-profile-hub"
        )
    ) {

        return;
    }


    const nameEditor =
        profile.querySelector(
            ".profile-name-editor"
        );


    if (
        !nameEditor
    ) {

        return;
    }


    const section =
        document.createElement(
            "div"
        );


    section.id =
        "v23-profile-hub";


    section.innerHTML = `

        <div class="v23-profile-switch">

            <button
                class="v23-view-button active"
                data-v23-view="stats"
            >
                📊 My Stats
            </button>


            <button
                class="v23-view-button"
                data-v23-view="rivals"
            >
                ⚔️ Rivals
            </button>

        </div>


        <div class="v23-mode-menu">

            <button
                class="v23-mode-button active"
                data-v23-mode="overall"
            >
                Overall
            </button>

            <button
                class="v23-mode-button"
                data-v23-mode="legs"
            >
                Legs
            </button>

            <button
                class="v23-mode-button"
                data-v23-mode="sets"
            >
                Sets + Legs
            </button>

            <button
                class="v23-mode-button"
                data-v23-mode="cricket"
            >
                Cricket
            </button>

        </div>


        <div
            id="v23-profile-content"
            class="v23-profile-content"
        >
            Loading statistics…
        </div>
    `;


    nameEditor.insertAdjacentElement(
        "afterend",
        section
    );


    v23InstallProfileStyles();


    section
        .querySelectorAll(
            "[data-v23-view]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        v23ProfileView =
                            button.dataset
                                .v23View;


                        v23SelectedRivalID =
                            null;


                        section
                            .querySelectorAll(
                                "[data-v23-view]"
                            )
                            .forEach(
                                item =>
                                    item.classList.toggle(

                                        "active",

                                        item ===
                                        button
                                    )
                            );


                        v23RenderProfile();
                    };
            }
        );


    section
        .querySelectorAll(
            "[data-v23-mode]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        v23ProfileMode =
                            button.dataset
                                .v23Mode;


                        section
                            .querySelectorAll(
                                "[data-v23-mode]"
                            )
                            .forEach(
                                item =>
                                    item.classList.toggle(

                                        "active",

                                        item ===
                                        button
                                    )
                            );


                        v23RenderProfile();
                    };
            }
        );
}


/* =========================================================
   PROFILE STYLES
========================================================= */

function v23InstallProfileStyles() {

    if (
        document.getElementById(
            "v23-profile-style"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "v23-profile-style";


    style.textContent = `

        #v23-profile-hub {

            margin-top: 18px;
        }


        .v23-profile-switch,
        .v23-mode-menu {

            display: grid;

            gap: 6px;

            margin-bottom: 8px;
        }


        .v23-profile-switch {

            grid-template-columns:
                repeat(2,1fr);
        }


        .v23-mode-menu {

            grid-template-columns:
                repeat(4,1fr);
        }


        .v23-view-button,
        .v23-mode-button {

            min-height: 43px;

            border:
                1px solid #34454e;

            border-radius: 8px;

            background: #101619;

            color: #9baab1;

            font-weight: 800;

            cursor: pointer;
        }


        .v23-view-button.active,
        .v23-mode-button.active {

            border-color: #00aaff;

            background: #075985;

            color: white;
        }


        .v23-profile-content {

            padding: 12px;

            border:
                1px solid #27373f;

            border-radius: 11px;

            background: #080d10;
        }


        .v23-stat-grid {

            display: grid;

            grid-template-columns:
                repeat(3,minmax(0,1fr));

            gap: 7px;
        }


        .v23-stat {

            padding: 10px;

            border:
                1px solid #293a42;

            border-radius: 9px;

            background: #101619;

            text-align: center;
        }


        .v23-stat span {

            display: block;

            color: #87979f;

            font-size: 10px;

            text-transform: uppercase;
        }


        .v23-stat strong {

            display: block;

            margin-top: 4px;

            color: #00aaff;

            font-size: 24px;
        }


        .v23-breakdown {

            margin-top: 12px;

            padding: 10px;

            border:
                1px solid #293a42;

            border-radius: 9px;

            background: #0c1215;
        }


        .v23-breakdown h3 {

            margin:
                0 0 8px;

            color: #00aaff;
        }


        .v23-breakdown-row {

            display: flex;

            justify-content: space-between;

            gap: 10px;

            padding:
                6px 0;

            border-bottom:
                1px solid #202a2f;
        }


        .v23-rival {

            display: grid;

            grid-template-columns:
                1fr auto;

            align-items: center;

            gap: 10px;

            margin-bottom: 7px;

            padding: 11px;

            border:
                1px solid #35414a;

            border-radius: 9px;

            background: #101619;

            cursor: pointer;
        }


        .v23-rival-name {

            color: white;

            font-weight: 900;
        }


        .v23-rival-meta {

            margin-top: 3px;

            color: #819098;

            font-size: 11px;
        }


        .v23-rival-record {

            color: #00aaff;

            font-size: 20px;

            font-weight: 900;
        }


        .v23-rival-back {

            width: 100%;

            margin-bottom: 9px;

            min-height: 42px;

            border: none;

            border-radius: 8px;

            background: #242f35;

            color: white;

            font-weight: 800;

            cursor: pointer;
        }


        .v23-analysis {

            margin-top: 10px;

            padding: 10px;

            border-left:
                4px solid #00aaff;

            border-radius: 7px;

            background: #0c1b23;

            color: #c5d6de;

            line-height: 1.5;
        }


        .v23-form {

            font-size: 22px;

            letter-spacing: 4px;
        }


        @media (
            max-width:650px
        ) {

            .v23-mode-menu {

                grid-template-columns:
                    repeat(2,1fr);
            }


            .v23-stat-grid {

                grid-template-columns:
                    repeat(2,1fr);
            }

        }
    `;


    document.head.appendChild(
        style
    );
}


/* =========================================================
   LOAD PROFILE MATCH DATA
========================================================= */

async function v23LoadProfileData() {

    if (
        !currentDartHubUser
    ) {

        return;
    }


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

                .order(
                    "played_at",
                    {
                        ascending:
                            false
                    }
                )

                .limit(
                    500
                );


        if (
            error
        ) {

            throw error;
        }


        v23ProfileMatches =
            data ||
            [];


        v23RenderProfile();


    } catch (
        error
    ) {

        console.error(
            "V23 profile stats:",
            error
        );
    }
}


/* =========================================================
   PROFILE STATS
========================================================= */

function v23RenderProfile() {

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

        v23RenderRivals(
            container
        );


        return;
    }


    const matches =
        v23FilterMatches(

            v23ProfileMatches,

            v23ProfileMode
        );


    if (
        v23ProfileMode ===
        "cricket"
    ) {

        v23RenderCricketStats(

            container,

            matches
        );


        return;
    }


    v23RenderDartsStats(

        container,

        matches
    );
}


/* =========================================================
   DARTS / OVERALL STATS
========================================================= */

function v23RenderDartsStats(
    container,
    matches
) {

    const wins =
        matches.filter(
            match =>
                match.result ===
                "WIN"
        ).length;


    const losses =
        matches.length -
        wins;


    if (
        v23ProfileMode ===
        "overall"
    ) {

        const rivals =
            new Set(

                matches
                    .filter(
                        match =>
                            match.opponent_user_id
                    )
                    .map(
                        match =>
                            match.opponent_user_id
                    )
            );


        container.innerHTML = `

            <div class="v23-stat-grid">

                ${v23Stat(
                    "Matches",
                    matches.length
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
                        matches.length
                    )
                )}

                ${v23Stat(
                    "Registered Rivals",
                    rivals.size
                )}

                ${v23Stat(
                    "Current Streak",
                    v23CurrentStreak(
                        matches
                    )
                )}

            </div>


            ${v23OverallBreakdown(
                matches
            )}
        `;


        return;
    }


    const averages =
        matches.map(
            match =>
                Number(
                    match.user_average ||
                    0
                )
        );


    const total180 =
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


    const checkoutValues =
        matches.map(
            match =>
                Number(
                    match.checkout_percentage ||
                    0
                )
        );


    const highestCheckout =
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


    container.innerHTML = `

        <div class="v23-stat-grid">

            ${v23Stat(
                "Matches",
                matches.length
            )}

            ${v23Stat(
                "Wins",
                wins
            )}

            ${v23Stat(
                "Win %",
                v23Percent(
                    wins,
                    matches.length
                )
            )}

            ${v23Stat(
                "Average",
                v23Mean(
                    averages
                ).toFixed(
                    2
                )
            )}

            ${v23Stat(
                "180s",
                total180
            )}

            ${v23Stat(
                "Highest Checkout",
                highestCheckout ||
                "–"
            )}

            ${v23Stat(
                "Checkout %",
                v23Mean(
                    checkoutValues
                ).toFixed(
                    1
                )
                +
                "%"
            )}

            ${v23Stat(
                "Best Match Avg",
                matches.length

                    ? Math.max(
                        ...averages
                      ).toFixed(
                          2
                      )

                    : "0.00"
            )}

        </div>


        ${v23StartingScoreBreakdown(
            matches
        )}
    `;
}


function v23Stat(
    label,
    value
) {

    return `

        <div class="v23-stat">

            <span>
                ${v23Escape(
                    label
                )}
            </span>

            <strong>
                ${v23Escape(
                    value
                )}
            </strong>

        </div>
    `;
}


/* =========================================================
   OVERALL MODE BREAKDOWN
========================================================= */

function v23OverallBreakdown(
    matches
) {

    const groups = [

        [
            "Legs",
            matches.filter(
                match =>
                    v23ModeKey(
                        match
                    ) ===
                    "legs"
            )
        ],

        [
            "Sets + Legs",
            matches.filter(
                match =>
                    v23ModeKey(
                        match
                    ) ===
                    "sets"
            )
        ],

        [
            "Cricket",
            matches.filter(
                match =>
                    v23ModeKey(
                        match
                    ) ===
                    "cricket"
            )
        ]
    ];


    return `

        <div class="v23-breakdown">

            <h3>
                By Game Mode
            </h3>

            ${
                groups
                    .map(
                        (
                            [
                                label,
                                rows
                            ]
                        ) => {

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
                                        ${rows.length - wins}

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
   STARTING SCORE BREAKDOWN
========================================================= */

function v23StartingScoreBreakdown(
    matches
) {

    const map =
        new Map();


    matches.forEach(
        match => {

            const score =
                Number(
                    match.starting_score ||
                    0
                );


            if (
                !score
            ) {

                return;
            }


            if (
                !map.has(
                    score
                )
            ) {

                map.set(
                    score,
                    []
                );
            }


            map
                .get(
                    score
                )
                .push(
                    match
                );
        }
    );


    if (
        !map.size
    ) {

        return "";
    }


    return `

        <div class="v23-breakdown">

            <h3>
                Starting Score
            </h3>

            ${
                Array
                    .from(
                        map.entries()
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
                                score,
                                rows
                            ]
                        ) => {

                            const wins =
                                rows.filter(
                                    row =>
                                        row.result ===
                                        "WIN"
                                ).length;


                            return `

                                <div class="v23-breakdown-row">

                                    <span>
                                        ${score}
                                    </span>

                                    <strong>

                                        ${wins}
                                        -
                                        ${rows.length - wins}

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
   CRICKET PERSPECTIVE
========================================================= */

function v23CricketPerspective(
    match
) {

    const details =
        match.match_details ||
        {};


    const userID =
        v23CurrentUserID();


    const isTeamA =

        details.team_a_user_id ===
        userID

        ||

        (
            !details.team_a_user_id &&
            details.team_a_name ===
            v23CurrentPlayerName()
        );


    const myRuns =

        isTeamA

            ? Number(
                details.team_a_runs ||
                0
            )

            : Number(
                details.team_b_runs ||
                0
            );


    const myWicketsLost =

        isTeamA

            ? Number(
                details.team_a_wickets_lost ||
                0
            )

            : Number(
                details.team_b_wickets_lost ||
                0
            );


    const opponentRuns =

        isTeamA

            ? Number(
                details.team_b_runs ||
                0
            )

            : Number(
                details.team_a_runs ||
                0
            );


    const opponentWicketsLost =

        isTeamA

            ? Number(
                details.team_b_wickets_lost ||
                0
            )

            : Number(
                details.team_a_wickets_lost ||
                0
            );


    return {

        totalWickets:
            Number(
                details.total_wickets ||
                0
            ),

        myRuns,

        myWicketsLost,

        opponentRuns,

        opponentWicketsLost,

        wicketsTaken:
            opponentWicketsLost,

        chased:
            isTeamA,

        successfulChase:

            isTeamA &&
            match.result ===
            "WIN",

        declared:

            Boolean(
                details.first_innings_declared
            ),

        winnerName:
            details.winner_name ||
            ""
    };
}


/* =========================================================
   CRICKET PROFILE
========================================================= */

function v23RenderCricketStats(
    container,
    matches
) {

    const perspectives =
        matches.map(
            v23CricketPerspective
        );


    const wins =
        matches.filter(
            match =>
                match.result ===
                "WIN"
        ).length;


    const totalRuns =
        perspectives.reduce(
            (
                total,
                row
            ) =>
                total +
                row.myRuns,
            0
        );


    const wicketsTaken =
        perspectives.reduce(
            (
                total,
                row
            ) =>
                total +
                row.wicketsTaken,
            0
        );


    const highestRuns =

        perspectives.length

            ? Math.max(
                ...perspectives.map(
                    row =>
                        row.myRuns
                )
              )

            : 0;


    const successfulChases =
        perspectives.filter(
            row =>
                row.successfulChase
        ).length;


    container.innerHTML = `

        <div class="v23-stat-grid">

            ${v23Stat(
                "Matches",
                matches.length
            )}

            ${v23Stat(
                "Wins",
                wins
            )}

            ${v23Stat(
                "Losses",
                matches.length -
                wins
            )}

            ${v23Stat(
                "Win %",
                v23Percent(
                    wins,
                    matches.length
                )
            )}

            ${v23Stat(
                "Runs",
                totalRuns
            )}

            ${v23Stat(
                "Avg Runs",
                matches.length

                    ? (
                        totalRuns /
                        matches.length
                      ).toFixed(
                          1
                      )

                    : "0.0"
            )}

            ${v23Stat(
                "Highest Innings",
                highestRuns
            )}

            ${v23Stat(
                "Wickets Taken",
                wicketsTaken
            )}

            ${v23Stat(
                "Successful Chases",
                successfulChases
            )}

        </div>


        ${v23CricketWicketBreakdown(
            matches
        )}
    `;
}


/* =========================================================
   ACTUAL WICKET-COUNT BREAKDOWN
========================================================= */

function v23CricketWicketBreakdown(
    matches
) {

    const groups =
        new Map();


    matches.forEach(
        match => {

            const perspective =
                v23CricketPerspective(
                    match
                );


            const wickets =
                perspective.totalWickets;


            if (
                !wickets
            ) {

                return;
            }


            if (
                !groups.has(
                    wickets
                )
            ) {

                groups.set(
                    wickets,
                    []
                );
            }


            groups
                .get(
                    wickets
                )
                .push(
                    match
                );
        }
    );


    if (
        !groups.size
    ) {

        return "";
    }


    return `

        <div class="v23-breakdown">

            <h3>
                Wicket Formats
            </h3>

            ${
                Array
                    .from(
                        groups.entries()
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
                                wicketCount,
                                rows
                            ]
                        ) => {

                            const wins =
                                rows.filter(
                                    row =>
                                        row.result ===
                                        "WIN"
                                ).length;


                            return `

                                <div class="v23-breakdown-row">

                                    <span>

                                        ${wicketCount}
                                        wicket${
                                            wicketCount ===
                                            1
                                                ? ""
                                                : "s"
                                        }

                                    </span>

                                    <strong>

                                        ${wins}
                                        -
                                        ${rows.length - wins}

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
   RIVALS
========================================================= */

function v23RenderRivals(
    container
) {

    if (
        v23SelectedRivalID
    ) {

        v23RenderRivalDetail(
            container
        );


        return;
    }


    const registered =
        v23FilterMatches(

            v23ProfileMatches.filter(
                match =>
                    match.opponent_user_id
            ),

            v23ProfileMode
        );


    const groups =
        new Map();


    registered.forEach(
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

            <div class="profile-no-matches">

                No registered rival matches
                in this game mode yet.

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
                            class="v23-rival"
                            data-rival-id="${rival.id}"
                            data-rival-name="${v23Escape(
                                rival.name
                            )}"
                        >

                            <div>

                                <div class="v23-rival-name">

                                    ${v23Escape(
                                        rival.name
                                    )}

                                </div>

                                <div class="v23-rival-meta">

                                    ${rival.matches.length}
                                    accepted match${
                                        rival.matches.length ===
                                        1
                                            ? ""
                                            : "es"
                                    }

                                </div>

                            </div>


                            <div class="v23-rival-record">

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
            "[data-rival-id]"
        )
        .forEach(
            row => {

                row.onclick =
                    () => {

                        v23SelectedRivalID =
                            row.dataset
                                .rivalId;


                        v23SelectedRivalName =
                            row.dataset
                                .rivalName;


                        v23RenderProfile();
                    };
            }
        );
}


/* =========================================================
   RIVAL DETAIL
========================================================= */

function v23RenderRivalDetail(
    container
) {

    const all =
        v23ProfileMatches

            .filter(
                match =>
                    match.opponent_user_id ===
                    v23SelectedRivalID
            );


    const matches =
        v23FilterMatches(

            all,

            v23ProfileMode
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


    const form =
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
            );


    container.innerHTML = `

        <button
            id="v23-rival-back"
            class="v23-rival-back"
        >
            ← All Rivals
        </button>


        <h2>

            ⚔️
            ${v23Escape(
                v23SelectedRivalName
            )}

        </h2>


        <div class="v23-stat-grid">

            ${v23Stat(
                "Matches",
                matches.length
            )}

            ${v23Stat(
                "Your Wins",
                wins
            )}

            ${v23Stat(
                "Their Wins",
                losses
            )}

            ${v23Stat(
                "Your Win %",
                v23Percent(
                    wins,
                    matches.length
                )
            )}

            ${v23Stat(
                "Current Streak",
                v23CurrentStreak(
                    matches
                )
            )}

        </div>


        <div class="v23-breakdown">

            <h3>
                Last 5 Meetings
            </h3>

            <div class="v23-form">

                ${form || "–"}

            </div>

        </div>


        ${
            v23ProfileMode ===
            "overall"

                ? v23RivalOverallAnalysis(
                    all
                  )

                : v23ProfileMode ===
                  "cricket"

                    ? v23RivalCricketAnalysis(
                        matches
                      )

                    : v23RivalDartsAnalysis(
                        matches
                      )
        }
    `;


    document
        .getElementById(
            "v23-rival-back"
        )
        .onclick =
            () => {

                v23SelectedRivalID =
                    null;


                v23RenderProfile();
            };
}


/* =========================================================
   WHERE THE RIVALRY IS BEING WON - OVERALL
========================================================= */

function v23RivalOverallAnalysis(
    matches
) {

    const modes = [

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
        modes.map(
            (
                [
                    label,
                    key
                ]
            ) => {

                const subset =
                    matches.filter(
                        match =>
                            v23ModeKey(
                                match
                            ) ===
                            key
                    );


                const wins =
                    subset.filter(
                        match =>
                            match.result ===
                            "WIN"
                    ).length;


                return {

                    label,

                    matches:
                        subset.length,

                    wins,

                    losses:
                        subset.length -
                        wins,

                    difference:

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
                row.matches
        );


    let yourEdge =
        null;


    let rivalEdge =
        null;


    played.forEach(
        row => {

            if (
                row.difference >
                0 &&
                (
                    !yourEdge ||
                    row.difference >
                    yourEdge.difference
                )
            ) {

                yourEdge =
                    row;
            }


            if (
                row.difference <
                0 &&
                (
                    !rivalEdge ||
                    row.difference <
                    rivalEdge.difference
                )
            ) {

                rivalEdge =
                    row;
            }
        }
    );


    let analysis =
        "";


    if (
        yourEdge
    ) {

        analysis +=

            `Your biggest edge is ${yourEdge.label}, ` +

            `where you lead ${yourEdge.wins}-${yourEdge.losses}. `;
    }


    if (
        rivalEdge
    ) {

        analysis +=

            `${v23SelectedRivalName}'s biggest edge is ` +

            `${rivalEdge.label}, where they lead ` +

            `${rivalEdge.losses}-${rivalEdge.wins}.`;
    }


    if (
        !analysis
    ) {

        analysis =
            "The rivalry is currently very evenly balanced across the game modes played.";
    }


    return `

        <div class="v23-breakdown">

            <h3>
                Where is the rivalry being won?
            </h3>

            ${
                played
                    .map(
                        row => `

                            <div class="v23-breakdown-row">

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


        <div class="v23-analysis">

            ${v23Escape(
                analysis
            )}

        </div>
    `;
}


/* =========================================================
   RIVAL LEGS / SETS ANALYSIS
========================================================= */

function v23RivalDartsAnalysis(
    matches
) {

    if (
        !matches.length
    ) {

        return "";
    }


    const myAverage =
        v23Mean(

            matches.map(
                match =>
                    Number(
                        match.user_average ||
                        0
                    )
            )
        );


    const theirAverage =
        v23Mean(

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


    let analysis =
        "";


    if (
        myAverage >
        theirAverage
    ) {

        analysis +=

            `You hold the scoring edge: ` +

            `${myAverage.toFixed(2)} vs ` +

            `${theirAverage.toFixed(2)} average. `;


    } else if (
        theirAverage >
        myAverage
    ) {

        analysis +=

            `${v23SelectedRivalName} holds the scoring edge: ` +

            `${theirAverage.toFixed(2)} vs ` +

            `${myAverage.toFixed(2)} average. `;
    }


    if (
        my180 >
        their180
    ) {

        analysis +=
            `You lead the 180 count ${my180}-${their180}.`;


    } else if (
        their180 >
        my180
    ) {

        analysis +=

            `${v23SelectedRivalName} leads the 180 count ` +

            `${their180}-${my180}.`;
    }


    return `

        <div class="v23-stat-grid">

            ${v23Stat(
                "Your Avg",
                myAverage.toFixed(
                    2
                )
            )}

            ${v23Stat(
                "Rival Avg",
                theirAverage.toFixed(
                    2
                )
            )}

            ${v23Stat(
                "Your 180s",
                my180
            )}

            ${v23Stat(
                "Rival 180s",
                their180
            )}

        </div>


        ${v23StartingScoreBreakdown(
            matches
        )}


        <div class="v23-analysis">

            ${
                v23Escape(
                    analysis ||
                    "The scoring numbers are currently level."
                )
            }

        </div>
    `;
}


/* =========================================================
   RIVAL CRICKET ANALYSIS
========================================================= */

function v23RivalCricketAnalysis(
    matches
) {

    const rows =
        matches.map(
            v23CricketPerspective
        );


    const myRuns =
        rows.reduce(
            (
                total,
                row
            ) =>
                total +
                row.myRuns,
            0
        );


    const theirRuns =
        rows.reduce(
            (
                total,
                row
            ) =>
                total +
                row.opponentRuns,
            0
        );


    const myWickets =
        rows.reduce(
            (
                total,
                row
            ) =>
                total +
                row.wicketsTaken,
            0
        );


    const theirWickets =
        rows.reduce(
            (
                total,
                row
            ) =>
                total +
                row.myWicketsLost,
            0
        );


    const myHighest =

        rows.length

            ? Math.max(
                ...rows.map(
                    row =>
                        row.myRuns
                )
              )

            : 0;


    const theirHighest =

        rows.length

            ? Math.max(
                ...rows.map(
                    row =>
                        row.opponentRuns
                )
              )

            : 0;


    let analysis =
        "";


    if (
        myRuns >
        theirRuns
    ) {

        analysis +=
            `You have scored more runs overall: ${myRuns}-${theirRuns}. `;


    } else if (
        theirRuns >
        myRuns
    ) {

        analysis +=

            `${v23SelectedRivalName} has scored more runs overall: ` +

            `${theirRuns}-${myRuns}. `;
    }


    if (
        myWickets >
        theirWickets
    ) {

        analysis +=
            `You also lead wickets taken ${myWickets}-${theirWickets}.`;


    } else if (
        theirWickets >
        myWickets
    ) {

        analysis +=

            `${v23SelectedRivalName} leads wickets taken ` +

            `${theirWickets}-${myWickets}.`;
    }


    return `

        <div class="v23-stat-grid">

            ${v23Stat(
                "Your Runs",
                myRuns
            )}

            ${v23Stat(
                "Rival Runs",
                theirRuns
            )}

            ${v23Stat(
                "Your Wickets",
                myWickets
            )}

            ${v23Stat(
                "Rival Wickets",
                theirWickets
            )}

            ${v23Stat(
                "Your High",
                myHighest
            )}

            ${v23Stat(
                "Rival High",
                theirHighest
            )}

        </div>


        ${v23CricketWicketBreakdown(
            matches
        )}


        <div class="v23-analysis">

            ${
                v23Escape(
                    analysis ||
                    "The Cricket rivalry is currently very even."
                )
            }

        </div>
    `;
}


/* =========================================================
   STREAK
========================================================= */

function v23CurrentStreak(
    matches
) {

    if (
        !matches.length
    ) {

        return "–";
    }


    const firstResult =
        matches[0].result;


    let count =
        0;


    for (
        const match
        of matches
    ) {

        if (
            match.result !==
            firstResult
        ) {

            break;
        }


        count++;
    }


    return (

        firstResult ===
        "WIN"

            ? `${count}W`

            : `${count}L`
    );
}


/* =========================================================
   WRAP PROFILE REFRESH
========================================================= */

function v23WrapProfileRefresh() {

    if (
        typeof refreshCloudProfile !==
        "function" ||
        window.__v23ProfileRefresh
    ) {

        return;
    }


    window.__v23ProfileRefresh =
        true;


    const original =
        refreshCloudProfile;


    refreshCloudProfile =
        async function () {

            await original();


            v23InstallProfileUI();


            await v23LoadProfileData();


            v23RenameLegs();
        };
}


/* =========================================================
   MODE LISTENERS
========================================================= */

function v23ModeListeners() {

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

                                if (
                                    button.dataset.mode ===
                                    "cricket"
                                ) {

                                    v23RelabelPlayerCards(
                                        true
                                    );


                                } else {

                                    v23RelabelPlayerCards(
                                        false
                                    );
                                }

                            },
                            20
                        );
                    }
                );
            }
        );
}


/* =========================================================
   CRICKET BUTTON EVENTS
========================================================= */

function v23CricketEvents() {

    const start =
        document.getElementById(
            "cricket-start-match"
        );


    if (
        start
    ) {

        start.addEventListener(
            "click",
            () => {

                setTimeout(
                    v23ResetCricketTracking,
                    0
                );
            }
        );
    }


    const continueButton =
        document.getElementById(
            "continue-to-setup"
        );


    if (
        continueButton
    ) {

        continueButton.addEventListener(

            "click",

            v23ValidateCricketPlayers,

            true
        );
    }
}


/* =========================================================
   CLEAN OLD WORDING
========================================================= */

function v23CleanProfileText() {

    const oldLabel =
        Array.from(
            document.querySelectorAll(
                ".career-stat-label"
            )
        )
            .find(
                element =>
                    element.textContent
                        .trim() ===
                    "Career Average"
            );


    if (
        oldLabel
    ) {

        oldLabel.textContent =
            "Darts Average";
    }
}


/* =========================================================
   INITIALISE
========================================================= */

function initialiseDartHubV23() {

    v23RenameLegs();


    v23EnablePlayersForCricket();


    v23WrapCricketSetup();


    v23WrapSecondInnings();


    v23FixCricketDeclaration();


    v23WrapCricketResult();


    v23InstallRegisteredSave();


    v23OverrideConfirmationResponse();


    v23GameAwareConfirmations();


    v23WrapProfileRefresh();


    v23ModeListeners();


    v23CricketEvents();


    setTimeout(
        () => {

            v23InstallProfileUI();

            v23CleanProfileText();

            v23RenameLegs();

            v23LoadProfileData();

        },
        700
    );


    console.log(
        "Dart Hub v23 multi-game stats ready."
    );
}


initialiseDartHubV23();

/* =========================================================
   DART HUB
   MATCH CONFIRMATION PAGE
   RIVALS PAGE
   101 / 301 / 501 MAIN BREAKDOWN
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

        "v24-rivals-screen",

        "v25-watch-screen"

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


    const modeScreen =
        document.getElementById(
            "mode-screen"
        );


    if (
        modeScreen
    ) {

        modeScreen.classList.remove(
            "hidden"
        );
    }
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
            "Match confirmations:",
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
            class="v24-request ${
                request.status ===
                "pending"

                    ? incoming
                        ? "incoming"
                        : "outgoing"

                    : request.status
            }"
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
            "Confirmation response:",
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
            "Cancel result:",
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


    if (
        !container ||
        !currentDartHubUser
    ) {

        return;
    }


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
            "Rivals:",
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
        !container
    ) {

        return;
    }


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


    let successfulChases =
        0;


    let rivalSuccessfulChases =
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


            if (
                iAmTeamA &&
                match.result ===
                "WIN"
            ) {

                successfulChases++;
            }


            if (
                !iAmTeamA &&
                match.result ===
                "LOSS"
            ) {

                rivalSuccessfulChases++;
            }


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

            ${v24Stat(
                "Your Chases",
                successfulChases
            )}

            ${v24Stat(
                "Rival Chases",
                rivalSuccessfulChases
            )}

        </div>


        <div class="v24-section">

            <h3>
                By Wicket Format
            </h3>


            ${
                wicketGroups.size

                    ? Array
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

                    : `

                        <div class="v24-row">

                            <span>
                                No wicket-format data yet
                            </span>

                            <strong>
                                –
                            </strong>

                        </div>
                    `
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
   PLAYER PROFILE
   RIVALS NOW HAS ITS OWN PAGE
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
   PROFILE 101 / 301 / 501 / OTHER
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
   WRAP PROFILE OPEN
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

    if (
        !currentDartHubUser
    ) {

        return;
    }


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
        "Dart Hub features ready."
    );
}


initialiseDartHubV24();