"use strict";


/* =========================================================
   DART HUB
   AUTHENTICATION + CLOUD PLAYER PROFILES
   VERSION 19
========================================================= */


/* =========================================================
   SUPABASE PROJECT
========================================================= */

const DART_HUB_SUPABASE_URL =
    "https://uijksziplmhpqrrhmclj.supabase.co";


const DART_HUB_SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_6lVBJIruJUMnJK5CF1HT6A_KvAAvFyn";


/* =========================================================
   CREATE SUPABASE CLIENT
========================================================= */

const dartHubSupabase =
    window.supabase.createClient(

        DART_HUB_SUPABASE_URL,

        DART_HUB_SUPABASE_PUBLISHABLE_KEY,

        {

            auth: {

                persistSession:
                    true,

                autoRefreshToken:
                    true,

                detectSessionInUrl:
                    true
            }
        }
    );


/* =========================================================
   AUTH DOM
========================================================= */

const authScreen =
    document.getElementById(
        "auth-screen"
    );


const passwordResetScreen =
    document.getElementById(
        "password-reset-screen"
    );


const authFormTitle =
    document.getElementById(
        "auth-form-title"
    );


const authFormSubtitle =
    document.getElementById(
        "auth-form-subtitle"
    );


const authNameRow =
    document.getElementById(
        "auth-name-row"
    );


const authDisplayName =
    document.getElementById(
        "auth-display-name"
    );


const authEmail =
    document.getElementById(
        "auth-email"
    );


const authPassword =
    document.getElementById(
        "auth-password"
    );


const authConfirmPasswordRow =
    document.getElementById(
        "auth-confirm-password-row"
    );


const authConfirmPassword =
    document.getElementById(
        "auth-confirm-password"
    );


const authMessage =
    document.getElementById(
        "auth-message"
    );


const authPrimaryBtn =
    document.getElementById(
        "auth-primary-btn"
    );


const authForgotBtn =
    document.getElementById(
        "auth-forgot-btn"
    );


const authSwitchText =
    document.getElementById(
        "auth-switch-text"
    );


const authSwitchBtn =
    document.getElementById(
        "auth-switch-btn"
    );


const resetNewPassword =
    document.getElementById(
        "reset-new-password"
    );


const resetConfirmPassword =
    document.getElementById(
        "reset-confirm-password"
    );


const resetPasswordBtn =
    document.getElementById(
        "reset-password-btn"
    );


const resetMessage =
    document.getElementById(
        "reset-message"
    );


const userBar =
    document.getElementById(
        "dart-hub-user-bar"
    );


const currentUserName =
    document.getElementById(
        "current-user-name"
    );


const currentUserEmail =
    document.getElementById(
        "current-user-email"
    );


const signOutBtn =
    document.getElementById(
        "sign-out-btn"
    );


/* =========================================================
   STATE
========================================================= */

let authMode =
    "signin";


let currentDartHubUser =
    null;


let currentCloudProfile =
    null;


let profileScreen =
    null;


let profileSaveInProgress =
    false;


/* =========================================================
   APP URL
========================================================= */

function getDartHubURL() {

    return (

        window.location.origin +

        window.location.pathname
    );
}


/* =========================================================
   ADD PROFILE UI
========================================================= */

function installProfileUI() {

    if (
        document.getElementById(
            "cloud-profile-screen"
        )
    ) {

        profileScreen =
            document.getElementById(
                "cloud-profile-screen"
            );


        return;
    }


    /* =====================================================
       PROFILE BUTTON ON HOME SCREEN
    ===================================================== */

    const modeButtons =
        document.querySelector(
            "#mode-screen .mode-buttons"
        );


    if (
        modeButtons &&
        !document.getElementById(
            "my-profile-home-btn"
        )
    ) {

        const profileButton =
            document.createElement(
                "button"
            );


        profileButton.id =
            "my-profile-home-btn";


        profileButton.type =
            "button";


        profileButton.className =
            "btn-secondary";


        profileButton.innerHTML =
            "👤 My Player Profile";


        profileButton.addEventListener(
            "click",
            openCloudProfile
        );


        modeButtons.appendChild(
            profileButton
        );
    }


    /* =====================================================
       PROFILE SCREEN
    ===================================================== */

    profileScreen =
        document.createElement(
            "div"
        );


    profileScreen.id =
        "cloud-profile-screen";


    profileScreen.className =
        "hidden";


    profileScreen.innerHTML = `

        <div class="cloud-profile-page">

            <div class="profile-header">

                <button
                    id="profile-back-btn"
                    class="profile-back-btn"
                    type="button"
                >
                    ← Dart Hub
                </button>

                <div class="profile-header-title">
                    🎯 PLAYER PROFILE
                </div>

            </div>


            <div class="profile-hero">

                <div class="profile-avatar-large">
                    👤
                </div>

                <div class="profile-name-area">

                    <h1 id="cloud-profile-name">
                        Player
                    </h1>

                    <div id="cloud-profile-email">
                    </div>

                </div>

            </div>


            <div class="profile-name-editor">

                <label for="profile-display-name-input">
                    Player Name
                </label>

                <div class="profile-name-edit-row">

                    <input
                        id="profile-display-name-input"
                        type="text"
                        maxlength="40"
                        placeholder="Player name"
                    >

                    <button
                        id="profile-save-name-btn"
                        class="btn-primary"
                        type="button"
                    >
                        Save Name
                    </button>

                </div>

                <div
                    id="profile-save-message"
                    class="profile-save-message"
                >
                </div>

            </div>


            <h2 class="profile-section-title">
                Career
            </h2>


            <div class="career-grid">

                <div class="career-stat featured">

                    <span class="career-stat-label">
                        Career Average
                    </span>

                    <strong id="profile-career-average">
                        0.00
                    </strong>

                </div>


                <div class="career-stat">

                    <span class="career-stat-label">
                        Matches
                    </span>

                    <strong id="profile-matches">
                        0
                    </strong>

                </div>


                <div class="career-stat">

                    <span class="career-stat-label">
                        Wins
                    </span>

                    <strong id="profile-wins">
                        0
                    </strong>

                </div>


                <div class="career-stat">

                    <span class="career-stat-label">
                        Losses
                    </span>

                    <strong id="profile-losses">
                        0
                    </strong>

                </div>


                <div class="career-stat">

                    <span class="career-stat-label">
                        Win %
                    </span>

                    <strong id="profile-win-percentage">
                        0.0%
                    </strong>

                </div>


                <div class="career-stat">

                    <span class="career-stat-label">
                        Best Match Avg
                    </span>

                    <strong id="profile-best-average">
                        0.00
                    </strong>

                </div>

            </div>


            <h2 class="profile-section-title">
                Scoring
            </h2>


            <div class="career-grid">

                <div class="career-stat featured">

                    <span class="career-stat-label">
                        180s
                    </span>

                    <strong id="profile-180s">
                        0
                    </strong>

                </div>


                <div class="career-stat">

                    <span class="career-stat-label">
                        140+
                    </span>

                    <strong id="profile-140s">
                        0
                    </strong>

                </div>


                <div class="career-stat">

                    <span class="career-stat-label">
                        100+
                    </span>

                    <strong id="profile-100s">
                        0
                    </strong>

                </div>


                <div class="career-stat">

                    <span class="career-stat-label">
                        Best Checkout
                    </span>

                    <strong id="profile-best-checkout">
                        –
                    </strong>

                </div>


                <div class="career-stat">

                    <span class="career-stat-label">
                        Checkout %
                    </span>

                    <strong id="profile-checkout-percentage">
                        0.0%
                    </strong>

                </div>


                <div class="career-stat">

                    <span class="career-stat-label">
                        Darts Thrown
                    </span>

                    <strong id="profile-darts-thrown">
                        0
                    </strong>

                </div>

            </div>


            <h2 class="profile-section-title">
                Recent Matches
            </h2>


            <div
                id="profile-match-history"
                class="profile-match-history"
            >

                <div class="profile-loading">
                    Loading matches…
                </div>

            </div>


            <button
                id="profile-bottom-back-btn"
                class="btn-primary profile-bottom-back"
                type="button"
            >
                ← Back to Dart Hub
            </button>

        </div>
    `;


    document.body.appendChild(
        profileScreen
    );


    installProfileStyles();


    document
        .getElementById(
            "profile-back-btn"
        )
        .addEventListener(
            "click",
            closeCloudProfile
        );


    document
        .getElementById(
            "profile-bottom-back-btn"
        )
        .addEventListener(
            "click",
            closeCloudProfile
        );


    document
        .getElementById(
            "profile-save-name-btn"
        )
        .addEventListener(
            "click",
            saveCloudProfileName
        );
}


/* =========================================================
   PROFILE STYLING
========================================================= */

function installProfileStyles() {

    if (
        document.getElementById(
            "dart-hub-profile-styles"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "dart-hub-profile-styles";


    style.textContent = `

        #cloud-profile-screen {

            position: fixed;

            inset: 0;

            z-index: 18000;

            overflow-y: auto;

            background:
                radial-gradient(
                    circle at top,
                    #16313f,
                    #071015 42%,
                    #030303 100%
                );

            color: white;

            text-align: left;
        }


        #cloud-profile-screen.hidden {

            display: none !important;
        }


        .cloud-profile-page {

            width: min(
                920px,
                calc(100% - 20px)
            );

            margin: auto;

            padding:
                18px
                0
                45px;
        }


        .profile-header {

            display: grid;

            grid-template-columns:
                auto
                1fr;

            align-items: center;

            gap: 12px;

            margin-bottom: 18px;
        }


        .profile-back-btn {

            min-height: 42px;

            padding:
                8px
                12px;

            border:
                1px solid
                #35505d;

            border-radius: 8px;

            background: #101a1f;

            color: white;

            font-weight: 700;

            cursor: pointer;
        }


        .profile-header-title {

            color: #00aaff;

            font-size: 18px;

            font-weight: 900;

            letter-spacing: 1.5px;
        }


        .profile-hero {

            display: flex;

            align-items: center;

            gap: 18px;

            padding: 22px;

            border:
                1px solid
                #294755;

            border-radius: 15px;

            background:
                linear-gradient(
                    145deg,
                    #142a35,
                    #0b1115
                );

            box-shadow:
                0 8px 30px
                rgba(
                    0,
                    0,
                    0,
                    0.4
                );
        }


        .profile-avatar-large {

            display: flex;

            align-items: center;

            justify-content: center;

            flex-shrink: 0;

            width: 88px;

            height: 88px;

            border:
                2px solid
                #00aaff;

            border-radius: 50%;

            background: #091a22;

            font-size: 44px;

            box-shadow:
                0 0 24px
                rgba(
                    0,
                    170,
                    255,
                    0.25
                );
        }


        .profile-name-area {

            min-width: 0;
        }


        #cloud-profile-name {

            margin: 0;

            overflow-wrap: anywhere;

            color: white;

            font-size:
                clamp(
                    28px,
                    5vw,
                    48px
                );
        }


        #cloud-profile-email {

            margin-top: 4px;

            overflow-wrap: anywhere;

            color: #8da0a9;

            font-size: 13px;
        }


        .profile-name-editor {

            margin-top: 12px;

            padding: 14px;

            border:
                1px solid
                #26383f;

            border-radius: 11px;

            background: #0b1114;
        }


        .profile-name-editor label {

            display: block;

            margin-bottom: 6px;

            color: #9babb2;

            font-size: 12px;

            font-weight: 700;
        }


        .profile-name-edit-row {

            display: grid;

            grid-template-columns:
                1fr
                auto;

            gap: 7px;
        }


        .profile-name-edit-row input {

            min-width: 0;

            min-height: 48px;

            padding: 10px;

            border:
                1px solid
                #40505a;

            border-radius: 8px;

            outline: none;

            background: #050708;

            color: white;

            font-size: 16px;
        }


        .profile-name-edit-row input:focus {

            border-color: #00aaff;
        }


        .profile-save-message {

            min-height: 18px;

            margin-top: 6px;

            color: #00ff9d;

            font-size: 11px;
        }


        .profile-section-title {

            margin:
                25px
                0
                10px;

            color: #00aaff;

            font-size: 21px;
        }


        .career-grid {

            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap: 9px;
        }


        .career-stat {

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            min-height: 112px;

            padding: 12px;

            border:
                1px solid
                #27353b;

            border-radius: 11px;

            background:
                linear-gradient(
                    145deg,
                    #12181b,
                    #080a0b
                );

            text-align: center;
        }


        .career-stat.featured {

            border-color: #006fa6;

            background:
                radial-gradient(
                    circle,
                    #123447,
                    #080a0b
                );
        }


        .career-stat-label {

            margin-bottom: 5px;

            color: #89989f;

            font-size: 11px;

            text-transform: uppercase;

            letter-spacing: 0.7px;
        }


        .career-stat strong {

            color: white;

            font-size:
                clamp(
                    24px,
                    4vw,
                    38px
                );

            font-weight: 900;
        }


        .career-stat.featured strong {

            color: #00aaff;
        }


        .profile-match-history {

            display: flex;

            flex-direction: column;

            gap: 7px;
        }


        .cloud-match-row {

            display: grid;

            grid-template-columns:
                auto
                1fr
                auto;

            align-items: center;

            gap: 12px;

            padding:
                12px
                13px;

            border:
                1px solid
                #27353b;

            border-radius: 10px;

            background: #090d0f;
        }


        .cloud-match-result {

            display: flex;

            align-items: center;

            justify-content: center;

            width: 42px;

            height: 42px;

            border-radius: 50%;

            font-weight: 900;
        }


        .cloud-match-result.win {

            background: #0b3e29;

            color: #78ffc1;

            border:
                1px solid
                #168353;
        }


        .cloud-match-result.loss {

            background: #421515;

            color: #ff9d9d;

            border:
                1px solid
                #8b3030;
        }


        .cloud-match-main {

            min-width: 0;
        }


        .cloud-match-opponent {

            overflow-wrap: anywhere;

            color: white;

            font-weight: 800;
        }


        .cloud-match-meta {

            margin-top: 3px;

            color: #75868e;

            font-size: 11px;
        }


        .cloud-match-average {

            color: #00aaff;

            font-size: 19px;

            font-weight: 900;

            text-align: right;
        }


        .cloud-match-average span {

            display: block;

            color: #6f8087;

            font-size: 9px;

            font-weight: 500;

            text-transform: uppercase;
        }


        .profile-loading,
        .profile-no-matches {

            padding: 18px;

            border:
                1px dashed
                #34434a;

            border-radius: 9px;

            color: #83949b;

            text-align: center;
        }


        .profile-bottom-back {

            display: block;

            width: min(
                100%,
                400px
            );

            margin:
                28px
                auto
                0;
        }


        @media (
            max-width:
            650px
        ) {

            .cloud-profile-page {

                width:
                    calc(
                        100% - 12px
                    );

                padding-top: 8px;
            }


            .profile-header {

                margin-bottom: 8px;
            }


            .profile-header-title {

                font-size: 14px;
            }


            .profile-hero {

                padding: 15px;

                gap: 12px;
            }


            .profile-avatar-large {

                width: 64px;

                height: 64px;

                font-size: 32px;
            }


            #cloud-profile-name {

                font-size: 27px;
            }


            .career-grid {

                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );

                gap: 6px;
            }


            .career-stat {

                min-height: 92px;

                padding: 8px;
            }


            .career-stat strong {

                font-size: 27px;
            }


            .profile-name-edit-row {

                grid-template-columns:
                    1fr;
            }


            .cloud-match-row {

                grid-template-columns:
                    auto
                    1fr;

                gap: 9px;
            }


            .cloud-match-average {

                grid-column:
                    2;

                text-align: left;
            }

        }
    `;


    document.head.appendChild(
        style
    );
}


/* =========================================================
   HIDE GAME SCREENS
========================================================= */

function hideDartHubScreens() {

    const screenIDs = [

        "mode-screen",

        "name-screen",

        "setup-screen",

        "game-screen",

        "cricket-screen",

        "caller-screen",

        "cloud-profile-screen"

    ];


    screenIDs.forEach(
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
   SHOW AUTH SCREEN
========================================================= */

function showAuthScreen() {

    hideDartHubScreens();


    if (
        passwordResetScreen
    ) {

        passwordResetScreen.classList.add(
            "hidden"
        );
    }


    authScreen.classList.remove(
        "hidden"
    );


    if (
        userBar
    ) {

        userBar.classList.add(
            "hidden"
        );
    }


    setTimeout(
        () => {

            authEmail.focus();

        },
        100
    );
}


/* =========================================================
   SHOW DART HUB
========================================================= */

async function showDartHub(
    user
) {

    currentDartHubUser =
        user;


    authScreen.classList.add(
        "hidden"
    );


    passwordResetScreen.classList.add(
        "hidden"
    );


    installProfileUI();


    await ensureCloudProfile(
        user
    );


    const nameScreen =
        document.getElementById(
            "name-screen"
        );


    const setupScreen =
        document.getElementById(
            "setup-screen"
        );


    const gameScreen =
        document.getElementById(
            "game-screen"
        );


    const cricketScreen =
        document.getElementById(
            "cricket-screen"
        );


    const anotherScreenOpen =

        (
            nameScreen &&
            !nameScreen.classList.contains(
                "hidden"
            )
        )

        ||

        (
            setupScreen &&
            !setupScreen.classList.contains(
                "hidden"
            )
        )

        ||

        (
            gameScreen &&
            !gameScreen.classList.contains(
                "hidden"
            )
        )

        ||

        (
            cricketScreen &&
            !cricketScreen.classList.contains(
                "hidden"
            )
        );


    if (
        !anotherScreenOpen
    ) {

        document
            .getElementById(
                "mode-screen"
            )
            .classList.remove(
                "hidden"
            );
    }


    updateSignedInUser(
        user
    );
}


/* =========================================================
   PLAYER NAME
========================================================= */

function getPlayerName(
    user
) {

    if (
        currentCloudProfile &&
        currentCloudProfile.display_name
    ) {

        return currentCloudProfile.display_name;
    }


    if (
        !user
    ) {

        return "Player";
    }


    const metadataName =

        user.user_metadata &&
        (
            user.user_metadata.display_name ||
            user.user_metadata.player_name ||
            user.user_metadata.name
        );


    if (
        metadataName
    ) {

        return metadataName;
    }


    if (
        user.email
    ) {

        return user.email
            .split(
                "@"
            )[0];
    }


    return "Player";
}


/* =========================================================
   CREATE / LOAD PROFILE
========================================================= */

async function ensureCloudProfile(
    user
) {

    if (
        !user
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
                    "profiles"
                )

                .select(
                    "*"
                )

                .eq(
                    "id",
                    user.id
                )

                .maybeSingle();


        if (
            error
        ) {

            throw error;
        }


        if (
            data
        ) {

            currentCloudProfile =
                data;


            return;
        }


        const displayName =

            (
                user.user_metadata &&
                user.user_metadata.display_name
            )

            ||

            (
                user.email
                    ? user.email.split("@")[0]
                    : "Player"
            );


        const {
            data:
                newProfile,

            error:
                insertError

        } =
            await dartHubSupabase

                .from(
                    "profiles"
                )

                .insert({

                    id:
                        user.id,

                    display_name:
                        displayName
                })

                .select()

                .single();


        if (
            insertError
        ) {

            throw insertError;
        }


        currentCloudProfile =
            newProfile;


    } catch (
        error
    ) {

        console.error(
            "Dart Hub profile setup:",
            error
        );
    }
}


/* =========================================================
   UPDATE USER BAR
========================================================= */

function updateSignedInUser(
    user
) {

    if (
        !user
    ) {

        return;
    }


    const playerName =
        getPlayerName(
            user
        );


    currentUserName.textContent =
        playerName;


    currentUserEmail.textContent =
        user.email ||
        "";


    userBar.classList.remove(
        "hidden"
    );


    const p1Input =
        document.getElementById(
            "p1-name-input"
        );


    if (
        p1Input &&
        !p1Input.value.trim()
    ) {

        p1Input.value =
            playerName;
    }
}


/* =========================================================
   OPEN PROFILE
========================================================= */

async function openCloudProfile() {

    if (
        !currentDartHubUser
    ) {

        return;
    }


    hideDartHubScreens();


    profileScreen.classList.remove(
        "hidden"
    );


    await refreshCloudProfile();
}


/* =========================================================
   CLOSE PROFILE
========================================================= */

function closeCloudProfile() {

    profileScreen.classList.add(
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
   REFRESH PROFILE
========================================================= */

async function refreshCloudProfile() {

    if (
        !currentDartHubUser
    ) {

        return;
    }


    try {

        const {
            data:
                profile,

            error:
                profileError

        } =
            await dartHubSupabase

                .from(
                    "profiles"
                )

                .select(
                    "*"
                )

                .eq(
                    "id",
                    currentDartHubUser.id
                )

                .single();


        if (
            profileError
        ) {

            throw profileError;
        }


        currentCloudProfile =
            profile;


        renderCloudProfile(
            profile
        );


        await loadCloudMatchHistory();


        updateSignedInUser(
            currentDartHubUser
        );


    } catch (
        error
    ) {

        console.error(
            "Dart Hub profile load:",
            error
        );


        document
            .getElementById(
                "profile-match-history"
            )
            .innerHTML = `

                <div class="profile-no-matches">

                    Unable to load your profile.

                </div>
            `;
    }
}


/* =========================================================
   RENDER PROFILE
========================================================= */

function renderCloudProfile(
    profile
) {

    const matches =
        Number(
            profile.matches_played ||
            0
        );


    const wins =
        Number(
            profile.wins ||
            0
        );


    const losses =
        Number(
            profile.losses ||
            0
        );


    const dartsThrown =
        Number(
            profile.darts_thrown ||
            0
        );


    const pointsScored =
        Number(
            profile.points_scored ||
            0
        );


    const careerAverage =
        dartsThrown

            ? (
                pointsScored /
                dartsThrown *
                3
              ).toFixed(
                  2
              )

            : "0.00";


    const winPercentage =
        matches

            ? (
                wins /
                matches *
                100
              ).toFixed(
                  1
              )
              +
              "%"

            : "0.0%";


    const checkoutAttempts =
        Number(
            profile.checkout_attempts ||
            0
        );


    const checkouts =
        Number(
            profile.checkouts ||
            0
        );


    const checkoutPercentage =
        checkoutAttempts

            ? (
                checkouts /
                checkoutAttempts *
                100
              ).toFixed(
                  1
              )
              +
              "%"

            : "0.0%";


    document
        .getElementById(
            "cloud-profile-name"
        )
        .textContent =
            profile.display_name;


    document
        .getElementById(
            "cloud-profile-email"
        )
        .textContent =
            currentDartHubUser.email ||
            "";


    document
        .getElementById(
            "profile-display-name-input"
        )
        .value =
            profile.display_name;


    document
        .getElementById(
            "profile-career-average"
        )
        .textContent =
            careerAverage;


    document
        .getElementById(
            "profile-matches"
        )
        .textContent =
            matches;


    document
        .getElementById(
            "profile-wins"
        )
        .textContent =
            wins;


    document
        .getElementById(
            "profile-losses"
        )
        .textContent =
            losses;


    document
        .getElementById(
            "profile-win-percentage"
        )
        .textContent =
            winPercentage;


    document
        .getElementById(
            "profile-best-average"
        )
        .textContent =
            Number(
                profile.best_match_average ||
                0
            ).toFixed(
                2
            );


    document
        .getElementById(
            "profile-180s"
        )
        .textContent =
            profile.scores_180 ||
            0;


    document
        .getElementById(
            "profile-140s"
        )
        .textContent =
            profile.scores_140_plus ||
            0;


    document
        .getElementById(
            "profile-100s"
        )
        .textContent =
            profile.scores_100_plus ||
            0;


    document
        .getElementById(
            "profile-best-checkout"
        )
        .textContent =

            profile.best_checkout

                ? profile.best_checkout

                : "–";


    document
        .getElementById(
            "profile-checkout-percentage"
        )
        .textContent =
            checkoutPercentage;


    document
        .getElementById(
            "profile-darts-thrown"
        )
        .textContent =
            dartsThrown.toLocaleString();
}


/* =========================================================
   SAVE PROFILE NAME
========================================================= */

async function saveCloudProfileName() {

    if (
        profileSaveInProgress ||
        !currentDartHubUser
    ) {

        return;
    }


    const input =
        document.getElementById(
            "profile-display-name-input"
        );


    const message =
        document.getElementById(
            "profile-save-message"
        );


    const saveButton =
        document.getElementById(
            "profile-save-name-btn"
        );


    const newName =
        input.value.trim();


    if (
        newName.length <
        2
    ) {

        message.textContent =
            "Enter at least 2 characters.";


        return;
    }


    profileSaveInProgress =
        true;


    saveButton.disabled =
        true;


    saveButton.textContent =
        "Saving…";


    message.textContent =
        "";


    try {

        const {
            data,
            error
        } =
            await dartHubSupabase

                .from(
                    "profiles"
                )

                .update({

                    display_name:
                        newName,

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
            error
        ) {

            throw error;
        }


        const {
            error:
                userError
        } =
            await dartHubSupabase
                .auth
                .updateUser({

                    data: {

                        display_name:
                            newName
                    }
                });


        if (
            userError
        ) {

            console.warn(
                userError
            );
        }


        currentCloudProfile =
            data;


        message.textContent =
            "Player name updated ✓";


        renderCloudProfile(
            data
        );


        updateSignedInUser(
            currentDartHubUser
        );


        const p1Input =
            document.getElementById(
                "p1-name-input"
            );


        if (
            p1Input
        ) {

            p1Input.value =
                newName;
        }


    } catch (
        error
    ) {

        console.error(
            error
        );


        message.textContent =
            "Could not save the player name.";


    } finally {

        profileSaveInProgress =
            false;


        saveButton.disabled =
            false;


        saveButton.textContent =
            "Save Name";
    }
}


/* =========================================================
   LOAD MATCH HISTORY
========================================================= */

async function loadCloudMatchHistory() {

    const container =
        document.getElementById(
            "profile-match-history"
        );


    container.innerHTML = `

        <div class="profile-loading">
            Loading matches…
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

                .order(
                    "played_at",
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


        if (
            !data ||
            data.length ===
            0
        ) {

            container.innerHTML = `

                <div class="profile-no-matches">

                    No completed matches yet.

                    <br><br>

                    Finish a 501 or Sets match and
                    it will appear here.

                </div>
            `;


            return;
        }


        container.innerHTML =
            data
                .map(
                    match => {

                        const playedDate =
                            new Date(
                                match.played_at
                            );


                        const dateText =
                            playedDate
                                .toLocaleDateString();


                        const resultClass =
                            match.result ===
                            "WIN"

                                ? "win"

                                : "loss";


                        return `

                            <div class="cloud-match-row">

                                <div
                                    class="cloud-match-result ${resultClass}"
                                >
                                    ${
                                        match.result ===
                                        "WIN"
                                            ? "W"
                                            : "L"
                                    }
                                </div>


                                <div class="cloud-match-main">

                                    <div class="cloud-match-opponent">

                                        vs
                                        ${escapeProfileHTML(
                                            match.opponent_name
                                        )}

                                    </div>


                                    <div class="cloud-match-meta">

                                        ${escapeProfileHTML(
                                            match.game_mode
                                        )}

                                        • ${dateText}

                                        • ${match.user_180s || 0} × 180

                                        ${
                                            match.best_checkout

                                                ? ` • HC ${match.best_checkout}`

                                                : ""
                                        }

                                    </div>

                                </div>


                                <div class="cloud-match-average">

                                    ${Number(
                                        match.user_average ||
                                        0
                                    ).toFixed(2)}

                                    <span>
                                        AVG
                                    </span>

                                </div>

                            </div>
                        `;
                    }
                )

                .join(
                    ""
                );


    } catch (
        error
    ) {

        console.error(
            "Dart Hub match history:",
            error
        );


        container.innerHTML = `

            <div class="profile-no-matches">

                Unable to load match history.

            </div>
        `;
    }
}


/* =========================================================
   ESCAPE PROFILE HTML
========================================================= */

function escapeProfileHTML(
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
   DETERMINE WHICH PLAYER IS THE ACCOUNT OWNER
========================================================= */

function getAccountPlayerIndex() {

    if (
        !currentCloudProfile ||
        typeof players ===
        "undefined"
    ) {

        return 0;
    }


    const accountName =
        String(
            currentCloudProfile.display_name
        )
            .trim()
            .toLowerCase();


    const player1Name =
        String(
            players[0].name
        )
            .trim()
            .toLowerCase();


    const player2Name =
        String(
            players[1].name
        )
            .trim()
            .toLowerCase();


    if (
        player2Name ===
        accountName &&
        player1Name !==
        accountName
    ) {

        return 1;
    }


    return 0;
}


/* =========================================================
   GAME AVERAGE
========================================================= */

function cloudMatchAverage(
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
   SAVE COMPLETED MATCH TO SUPABASE
========================================================= */

async function saveCompletedCloudMatch() {

    if (
        !currentDartHubUser ||
        !currentCloudProfile ||
        typeof players ===
        "undefined"
    ) {

        return;
    }


    try {

        const userIndex =
            getAccountPlayerIndex();


        const opponentIndex =
            userIndex ===
            0
                ? 1
                : 0;


        const userPlayer =
            players[
                userIndex
            ];


        const opponent =
            players[
                opponentIndex
            ];


        const userAverage =
            cloudMatchAverage(
                userPlayer
            );


        const opponentAverage =
            cloudMatchAverage(
                opponent
            );


        const userWon =
            winnerPlayer ===
            userIndex +
            1;


        const checkoutAttempts =
            Number(
                userPlayer.stats.checkoutAttempts ||
                0
            );


        const checkouts =
            Number(
                userPlayer.stats.checkouts ||
                0
            );


        const checkoutPercentage =
            checkoutAttempts

                ? (
                    checkouts /
                    checkoutAttempts *
                    100
                  )

                : 0;


        /* =================================================
           SAVE MATCH
        ================================================= */

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
                        opponent.name,

                    game_mode:
                        gameMode ===
                        "sets"

                            ? "Sets + Legs"

                            : "501 / Legs",

                    starting_score:
                        startingScore,

                    result:
                        userWon
                            ? "WIN"
                            : "LOSS",

                    user_average:
                        Number(
                            userAverage.toFixed(
                                2
                            )
                        ),

                    opponent_average:
                        Number(
                            opponentAverage.toFixed(
                                2
                            )
                        ),

                    user_180s:
                        userPlayer.stats.scores180 ||
                        0,

                    opponent_180s:
                        opponent.stats.scores180 ||
                        0,

                    checkout_percentage:
                        Number(
                            checkoutPercentage.toFixed(
                                2
                            )
                        ),

                    best_checkout:
                        userPlayer.stats.bestCheckout ||
                        0
                });


        if (
            matchError
        ) {

            throw matchError;
        }


        /* =================================================
           UPDATE CAREER PROFILE
        ================================================= */

        const oldProfile =
            currentCloudProfile;


        const newMatches =
            Number(
                oldProfile.matches_played ||
                0
            )
            +
            1;


        const newWins =
            Number(
                oldProfile.wins ||
                0
            )
            +
            (
                userWon
                    ? 1
                    : 0
            );


        const newLosses =
            Number(
                oldProfile.losses ||
                0
            )
            +
            (
                userWon
                    ? 0
                    : 1
            );


        const newPoints =
            Number(
                oldProfile.points_scored ||
                0
            )
            +
            Number(
                userPlayer.stats.pointsScored ||
                0
            );


        const newDarts =
            Number(
                oldProfile.darts_thrown ||
                0
            )
            +
            Number(
                userPlayer.stats.dartsThrown ||
                0
            );


        const new100s =
            Number(
                oldProfile.scores_100_plus ||
                0
            )
            +
            Number(
                userPlayer.stats.scores100 ||
                0
            );


        const new140s =
            Number(
                oldProfile.scores_140_plus ||
                0
            )
            +
            Number(
                userPlayer.stats.scores140 ||
                0
            );


        const new180s =
            Number(
                oldProfile.scores_180 ||
                0
            )
            +
            Number(
                userPlayer.stats.scores180 ||
                0
            );


        const newCheckouts =
            Number(
                oldProfile.checkouts ||
                0
            )
            +
            checkouts;


        const newAttempts =
            Number(
                oldProfile.checkout_attempts ||
                0
            )
            +
            checkoutAttempts;


        const newBestCheckout =
            Math.max(

                Number(
                    oldProfile.best_checkout ||
                    0
                ),

                Number(
                    userPlayer.stats.bestCheckout ||
                    0
                )
            );


        const newBestAverage =
            Math.max(

                Number(
                    oldProfile.best_match_average ||
                    0
                ),

                userAverage
            );


        const {
            data:
                updatedProfile,

            error:
                profileError

        } =
            await dartHubSupabase

                .from(
                    "profiles"
                )

                .update({

                    matches_played:
                        newMatches,

                    wins:
                        newWins,

                    losses:
                        newLosses,

                    points_scored:
                        newPoints,

                    darts_thrown:
                        newDarts,

                    scores_100_plus:
                        new100s,

                    scores_140_plus:
                        new140s,

                    scores_180:
                        new180s,

                    checkouts:
                        newCheckouts,

                    checkout_attempts:
                        newAttempts,

                    best_checkout:
                        newBestCheckout,

                    best_match_average:
                        Number(
                            newBestAverage.toFixed(
                                2
                            )
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
            updatedProfile;


        console.log(
            "Dart Hub match saved to cloud."
        );


    } catch (
        error
    ) {

        console.error(
            "Dart Hub cloud match save:",
            error
        );
    }
}


/* =========================================================
   CONNECT CLOUD SAVE TO EXISTING MATCH ENGINE
========================================================= */

function connectCloudMatchSaving() {

    if (
        typeof finishMatch !==
        "function"
    ) {

        console.warn(
            "Dart Hub finishMatch was not found."
        );


        return;
    }


    if (
        window.__dartHubCloudFinishInstalled
    ) {

        return;
    }


    window.__dartHubCloudFinishInstalled =
        true;


    const originalFinishMatch =
        finishMatch;


    finishMatch =
        function (
            playerNumber
        ) {

            originalFinishMatch(
                playerNumber
            );


            setTimeout(
                () => {

                    saveCompletedCloudMatch();

                },
                300
            );
        };
}


/* =========================================================
   AUTH MESSAGES
========================================================= */

function showAuthMessage(
    message,
    type =
        "info"
) {

    authMessage.textContent =
        message;


    authMessage.className =
        "auth-message " +
        type;


    authMessage.classList.remove(
        "hidden"
    );
}


function clearAuthMessage() {

    authMessage.textContent =
        "";


    authMessage.className =
        "auth-message hidden";
}


/* =========================================================
   RESET MESSAGE
========================================================= */

function showResetMessage(
    message,
    type =
        "info"
) {

    resetMessage.textContent =
        message;


    resetMessage.className =
        "auth-message " +
        type;


    resetMessage.classList.remove(
        "hidden"
    );
}


function clearResetMessage() {

    resetMessage.textContent =
        "";


    resetMessage.className =
        "auth-message hidden";
}


/* =========================================================
   AUTH MODE
========================================================= */

function setAuthMode(
    mode
) {

    authMode =
        mode;


    clearAuthMessage();


    authPassword.value =
        "";


    authConfirmPassword.value =
        "";


    if (
        mode ===
        "signup"
    ) {

        authFormTitle.textContent =
            "Create Account";


        authFormSubtitle.textContent =
            "Create your Dart Hub player account.";


        authNameRow.classList.remove(
            "hidden"
        );


        authConfirmPasswordRow.classList.remove(
            "hidden"
        );


        authPrimaryBtn.textContent =
            "Create Account";


        authForgotBtn.classList.add(
            "hidden"
        );


        authSwitchText.textContent =
            "Already have an account?";


        authSwitchBtn.textContent =
            "Sign In";


        authPassword.autocomplete =
            "new-password";


    } else {

        authFormTitle.textContent =
            "Sign In";


        authFormSubtitle.textContent =
            "Sign in to your Dart Hub account.";


        authNameRow.classList.add(
            "hidden"
        );


        authConfirmPasswordRow.classList.add(
            "hidden"
        );


        authPrimaryBtn.textContent =
            "Sign In";


        authForgotBtn.classList.remove(
            "hidden"
        );


        authSwitchText.textContent =
            "Don't have an account?";


        authSwitchBtn.textContent =
            "Create Account";


        authPassword.autocomplete =
            "current-password";
    }
}


/* =========================================================
   EMAIL VALIDATION
========================================================= */

function validEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            email
        );
}


/* =========================================================
   SIGN IN
========================================================= */

async function signIn() {

    clearAuthMessage();


    const email =
        authEmail.value
            .trim();


    const password =
        authPassword.value;


    if (
        !validEmail(
            email
        )
    ) {

        showAuthMessage(
            "Enter a valid email address.",
            "error"
        );


        return;
    }


    if (
        !password
    ) {

        showAuthMessage(
            "Enter your password.",
            "error"
        );


        return;
    }


    setAuthLoading(
        true
    );


    try {

        const {
            data,
            error
        } =
            await dartHubSupabase
                .auth
                .signInWithPassword({

                    email,

                    password
                });


        if (
            error
        ) {

            throw error;
        }


        if (
            data &&
            data.user
        ) {

            await showDartHub(
                data.user
            );
        }


    } catch (
        error
    ) {

        console.error(
            "Dart Hub sign in:",
            error
        );


        showAuthMessage(
            friendlyAuthError(
                error
            ),
            "error"
        );


    } finally {

        setAuthLoading(
            false
        );
    }
}


/* =========================================================
   CREATE ACCOUNT
========================================================= */

async function createAccount() {

    clearAuthMessage();


    const playerName =
        authDisplayName.value
            .trim();


    const email =
        authEmail.value
            .trim();


    const password =
        authPassword.value;


    const confirmPassword =
        authConfirmPassword.value;


    if (
        playerName.length <
        2
    ) {

        showAuthMessage(
            "Enter your player name.",
            "error"
        );


        return;
    }


    if (
        !validEmail(
            email
        )
    ) {

        showAuthMessage(
            "Enter a valid email address.",
            "error"
        );


        return;
    }


    if (
        password.length <
        6
    ) {

        showAuthMessage(
            "Your password must be at least 6 characters.",
            "error"
        );


        return;
    }


    if (
        password !==
        confirmPassword
    ) {

        showAuthMessage(
            "The passwords do not match.",
            "error"
        );


        return;
    }


    setAuthLoading(
        true
    );


    try {

        const {
            data,
            error
        } =
            await dartHubSupabase
                .auth
                .signUp({

                    email,

                    password,

                    options: {

                        emailRedirectTo:
                            getDartHubURL(),

                        data: {

                            display_name:
                                playerName
                        }
                    }
                });


        if (
            error
        ) {

            throw error;
        }


        if (
            data &&
            data.session
        ) {

            await showDartHub(
                data.user
            );


            return;
        }


        showAuthMessage(

            "Account created! Check your email and tap the confirmation link. Then return to Dart Hub and sign in.",

            "success"
        );


        authPassword.value =
            "";


        authConfirmPassword.value =
            "";


    } catch (
        error
    ) {

        console.error(
            "Dart Hub account creation:",
            error
        );


        showAuthMessage(
            friendlyAuthError(
                error
            ),
            "error"
        );


    } finally {

        setAuthLoading(
            false
        );
    }
}


/* =========================================================
   PRIMARY AUTH BUTTON
========================================================= */

authPrimaryBtn.addEventListener(
    "click",
    () => {

        if (
            authMode ===
            "signup"
        ) {

            createAccount();


        } else {

            signIn();
        }
    }
);


/* =========================================================
   ENTER KEY
========================================================= */

[
    authDisplayName,
    authEmail,
    authPassword,
    authConfirmPassword
]
    .forEach(
        input => {

            if (
                !input
            ) {

                return;
            }


            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        authPrimaryBtn.click();
                    }
                }
            );
        }
    );


/* =========================================================
   SWITCH SIGN IN / CREATE ACCOUNT
========================================================= */

authSwitchBtn.addEventListener(
    "click",
    () => {

        setAuthMode(

            authMode ===
            "signin"

                ? "signup"

                : "signin"
        );
    }
);


/* =========================================================
   FORGOT PASSWORD
========================================================= */

authForgotBtn.addEventListener(
    "click",
    async () => {

        clearAuthMessage();


        const email =
            authEmail.value
                .trim();


        if (
            !validEmail(
                email
            )
        ) {

            showAuthMessage(

                "Enter your email address above first, then press Forgot Password.",

                "info"
            );


            authEmail.focus();


            return;
        }


        authForgotBtn.disabled =
            true;


        authForgotBtn.textContent =
            "Sending…";


        try {

            const {
                error
            } =
                await dartHubSupabase
                    .auth
                    .resetPasswordForEmail(

                        email,

                        {

                            redirectTo:
                                getDartHubURL()
                        }
                    );


            if (
                error
            ) {

                throw error;
            }


            showAuthMessage(

                "Password reset email sent. Check your inbox and open the Dart Hub reset link.",

                "success"
            );


        } catch (
            error
        ) {

            showAuthMessage(
                friendlyAuthError(
                    error
                ),
                "error"
            );


        } finally {

            authForgotBtn.disabled =
                false;


            authForgotBtn.textContent =
                "Forgot Password?";
        }
    }
);


/* =========================================================
   PASSWORD RECOVERY SCREEN
========================================================= */

function showPasswordRecovery() {

    authScreen.classList.add(
        "hidden"
    );


    hideDartHubScreens();


    passwordResetScreen.classList.remove(
        "hidden"
    );


    clearResetMessage();


    resetNewPassword.value =
        "";


    resetConfirmPassword.value =
        "";
}


/* =========================================================
   SAVE NEW PASSWORD
========================================================= */

resetPasswordBtn.addEventListener(
    "click",
    async () => {

        clearResetMessage();


        const password =
            resetNewPassword.value;


        const confirmPassword =
            resetConfirmPassword.value;


        if (
            password.length <
            6
        ) {

            showResetMessage(

                "Your password must be at least 6 characters.",

                "error"
            );


            return;
        }


        if (
            password !==
            confirmPassword
        ) {

            showResetMessage(
                "The passwords do not match.",
                "error"
            );


            return;
        }


        resetPasswordBtn.disabled =
            true;


        resetPasswordBtn.textContent =
            "Saving…";


        try {

            const {
                data,
                error
            } =
                await dartHubSupabase
                    .auth
                    .updateUser({

                        password
                    });


            if (
                error
            ) {

                throw error;
            }


            showResetMessage(

                "Password changed successfully. Opening Dart Hub…",

                "success"
            );


            setTimeout(
                async () => {

                    if (
                        data &&
                        data.user
                    ) {

                        await showDartHub(
                            data.user
                        );


                    } else {

                        setAuthMode(
                            "signin"
                        );


                        showAuthScreen();
                    }

                },
                1000
            );


        } catch (
            error
        ) {

            showResetMessage(
                friendlyAuthError(
                    error
                ),
                "error"
            );


        } finally {

            resetPasswordBtn.disabled =
                false;


            resetPasswordBtn.textContent =
                "Save New Password";
        }
    }
);


/* =========================================================
   SIGN OUT
========================================================= */

signOutBtn.addEventListener(
    "click",
    async () => {

        signOutBtn.disabled =
            true;


        signOutBtn.textContent =
            "Signing Out…";


        try {

            const {
                error
            } =
                await dartHubSupabase
                    .auth
                    .signOut();


            if (
                error
            ) {

                throw error;
            }


            currentDartHubUser =
                null;


            currentCloudProfile =
                null;


            setAuthMode(
                "signin"
            );


            authPassword.value =
                "";


            showAuthScreen();


        } catch (
            error
        ) {

            alert(
                friendlyAuthError(
                    error
                )
            );


        } finally {

            signOutBtn.disabled =
                false;


            signOutBtn.textContent =
                "Sign Out";
        }
    }
);


/* =========================================================
   AUTH LOADING STATE
========================================================= */

function setAuthLoading(
    loading
) {

    authPrimaryBtn.disabled =
        loading;


    authSwitchBtn.disabled =
        loading;


    authForgotBtn.disabled =
        loading;


    authPrimaryBtn.textContent =

        loading

            ? (
                authMode ===
                "signup"

                    ? "Creating Account…"

                    : "Signing In…"
            )

            : (
                authMode ===
                "signup"

                    ? "Create Account"

                    : "Sign In"
            );
}


/* =========================================================
   FRIENDLY AUTH ERRORS
========================================================= */

function friendlyAuthError(
    error
) {

    const message =
        String(

            error &&
            error.message

                ? error.message

                : error
        );


    const lower =
        message.toLowerCase();


    if (
        lower.includes(
            "invalid login credentials"
        )
    ) {

        return "Email or password is incorrect.";
    }


    if (
        lower.includes(
            "email not confirmed"
        )
    ) {

        return "Please confirm your email address before signing in.";
    }


    if (
        lower.includes(
            "user already registered"
        )
    ) {

        return "An account already exists with that email address.";
    }


    if (
        lower.includes(
            "rate limit"
        )
    ) {

        return "Too many attempts. Wait a little while and try again.";
    }


    if (
        lower.includes(
            "failed to fetch"
        ) ||
        lower.includes(
            "network"
        )
    ) {

        return "Dart Hub could not connect to the account server. Check your internet connection.";
    }


    return message;
}


/* =========================================================
   AUTH EVENTS
========================================================= */

dartHubSupabase
    .auth
    .onAuthStateChange(
        (
            event,
            session
        ) => {

            if (
                event ===
                "PASSWORD_RECOVERY"
            ) {

                showPasswordRecovery();


                return;
            }


            if (
                event ===
                "SIGNED_OUT"
            ) {

                currentDartHubUser =
                    null;


                currentCloudProfile =
                    null;


                setAuthMode(
                    "signin"
                );


                showAuthScreen();


                return;
            }


            if (
                session &&
                session.user
            ) {

                /*
                   Avoid blocking Supabase's
                   auth callback with database
                   requests.
                */

                setTimeout(
                    () => {

                        showDartHub(
                            session.user
                        );

                    },
                    0
                );
            }
        }
    );


/* =========================================================
   INITIAL SESSION
========================================================= */

async function initialiseDartHubAuth() {

    installProfileUI();


    connectCloudMatchSaving();


    setAuthMode(
        "signin"
    );


    hideDartHubScreens();


    authScreen.classList.remove(
        "hidden"
    );


    try {

        const {
            data,
            error
        } =
            await dartHubSupabase
                .auth
                .getSession();


        if (
            error
        ) {

            throw error;
        }


        if (
            data &&
            data.session &&
            data.session.user
        ) {

            await showDartHub(
                data.session.user
            );


        } else {

            showAuthScreen();
        }


    } catch (
        error
    ) {

        console.error(
            "Dart Hub auth startup:",
            error
        );


        showAuthMessage(

            "Unable to check your Dart Hub account. Check your internet connection.",

            "error"
        );
    }
}


/* =========================================================
   START DART HUB AUTH
========================================================= */

initialiseDartHubAuth();