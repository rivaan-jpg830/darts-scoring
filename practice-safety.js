"use strict";


/* =========================================================
   DART HUB
   PRACTICE SAFETY

   - Local backup
   - Crash / refresh recovery
   - Atomic Supabase save
   - Retry failed saves
   - Duplicate protection
   - Session only disappears after confirmed cloud save
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const DH_PRACTICE_ACTIVE_KEY =
    "dart-hub-practice-active-v2";


const DH_PRACTICE_PENDING_KEY =
    "dart-hub-practice-pending-v2";



/* =========================================================
   STATE
========================================================= */

let dhPracticeSaveRunning =
    false;



/* =========================================================
   UUID
========================================================= */

function dhPracticeMakeUUID() {

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



/* =========================================================
   SAFE JSON
========================================================= */

function dhPracticeSafeJSON(
    key
) {

    try {

        return JSON.parse(

            localStorage.getItem(
                key
            )
            ||
            "null"
        );


    } catch (
        error
    ) {

        console.warn(
            "Practice backup could not be read:",
            error
        );


        return null;
    }
}



/* =========================================================
   BUILD SNAPSHOT
========================================================= */

function dhPracticeBuildSnapshot(
    completed = false
) {

    if (
        typeof dhPractice ===
            "undefined"
    ) {

        return null;
    }


    let sessionUID =
        dhPractice.sessionUID;


    if (
        !sessionUID
    ) {

        sessionUID =
            dhPracticeMakeUUID();


        dhPractice.sessionUID =
            sessionUID;
    }


    return {

        version:
            2,

        sessionUID,

        completed:
            Boolean(
                completed
            ),

        saved:
            false,

        boardType:

            typeof dartHubBoardType !==
                "undefined"

                ? dartHubBoardType

                : "standard",

        updatedAt:
            new Date()
                .toISOString(),

        state: {

            active:
                Boolean(
                    dhPractice.active
                ),

            points:
                Number(
                    dhPractice.points ||
                    0
                ),

            darts:
                Number(
                    dhPractice.darts ||
                    0
                ),

            visits:
                JSON.parse(
                    JSON.stringify(
                        dhPractice.visits ||
                        []
                    )
                ),

            currentDarts:
                JSON.parse(
                    JSON.stringify(
                        dhPractice.currentDarts ||
                        []
                    )
                ),

            bestVisit:
                Number(
                    dhPractice.bestVisit ||
                    0
                ),

            scores100:
                Number(
                    dhPractice.scores100 ||
                    0
                ),

            scores140:
                Number(
                    dhPractice.scores140 ||
                    0
                ),

            scores180:
                Number(
                    dhPractice.scores180 ||
                    0
                ),

            undo:
                JSON.parse(
                    JSON.stringify(
                        dhPractice.undo ||
                        []
                    )
                )
        }
    };
}



/* =========================================================
   LOCAL BACKUP
========================================================= */

function dhPracticeBackup() {

    try {

        if (
            typeof dhPractice ===
                "undefined" ||
            !dhPractice.active
        ) {

            return;
        }


        const snapshot =
            dhPracticeBuildSnapshot(
                false
            );


        localStorage.setItem(

            DH_PRACTICE_ACTIVE_KEY,

            JSON.stringify(
                snapshot
            )
        );


        dhPracticeUpdateSafetyStatus(
            "safe",
            "💾 Session protected on this device"
        );


    } catch (
        error
    ) {

        console.error(
            "Practice local backup:",
            error
        );


        dhPracticeUpdateSafetyStatus(
            "error",
            "⚠️ Local backup failed"
        );
    }
}



/* =========================================================
   CLEAR LOCAL COPIES
========================================================= */

function dhPracticeClearBackups() {

    localStorage.removeItem(
        DH_PRACTICE_ACTIVE_KEY
    );


    localStorage.removeItem(
        DH_PRACTICE_PENDING_KEY
    );


    dhPracticeUpdateRecoveryBanner();
}



/* =========================================================
   RESTORE
========================================================= */

function dhPracticeRestoreSnapshot(
    snapshot
) {

    if (
        !snapshot ||
        !snapshot.state
    ) {

        return false;
    }


    if (
        typeof dhPractice ===
            "undefined"
    ) {

        return false;
    }


    const state =
        snapshot.state;


    dhPractice.active =
        true;


    dhPractice.points =
        Number(
            state.points ||
            0
        );


    dhPractice.darts =
        Number(
            state.darts ||
            0
        );


    dhPractice.visits =
        Array.isArray(
            state.visits
        )

            ? state.visits

            : [];


    dhPractice.currentDarts =
        Array.isArray(
            state.currentDarts
        )

            ? state.currentDarts

            : [];


    dhPractice.bestVisit =
        Number(
            state.bestVisit ||
            0
        );


    dhPractice.scores100 =
        Number(
            state.scores100 ||
            0
        );


    dhPractice.scores140 =
        Number(
            state.scores140 ||
            0
        );


    dhPractice.scores180 =
        Number(
            state.scores180 ||
            0
        );


    dhPractice.undo =
        Array.isArray(
            state.undo
        )

            ? state.undo

            : [];


    dhPractice.sessionUID =
        snapshot.sessionUID ||
        dhPracticeMakeUUID();


    if (
        typeof dartHubBoardType !==
            "undefined"
    ) {

        dartHubBoardType =

            snapshot.boardType ===
            "indoor"

                ? "indoor"

                : "standard";


        localStorage.setItem(

            "dart-hub-board-type",

            dartHubBoardType
        );
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
            "dart-hub-play-screen"
        )
        ?.classList
        .add(
            "hidden"
        );


    document
        .getElementById(
            "dh-board-screen"
        )
        ?.classList
        .add(
            "hidden"
        );


    document
        .getElementById(
            "dh-practice-screen"
        )
        ?.classList
        .remove(
            "hidden"
        );


    if (
        typeof dhPracticeRender ===
            "function"
    ) {

        dhPracticeRender();
    }


    dhPracticeUpdateSafetyStatus(

        "safe",

        `💾 Restored ${dhPractice.visits.length} visit` +

        (
            dhPractice.visits.length ===
            1

                ? ""

                : "s"
        )
    );


    dhPracticeBackup();


    return true;
}



/* =========================================================
   SAFETY STATUS
========================================================= */

function dhPracticeInstallSafetyStatus() {

    const page =
        document.querySelector(
            ".dh-practice-page"
        );


    if (
        !page ||
        document.getElementById(
            "dh-practice-safety-status"
        )
    ) {

        return;
    }


    const status =
        document.createElement(
            "div"
        );


    status.id =
        "dh-practice-safety-status";


    status.style.cssText = `

        margin: 7px 0 9px;

        padding: 8px 10px;

        border: 1px solid #315166;

        border-radius: 8px;

        background: #0a1820;

        color: #86d9ff;

        font-size: 11px;

        font-weight: 800;

        text-align: center;
    `;


    status.textContent =
        "💾 Practice protection ready";


    const average =
        page.querySelector(
            ".dh-practice-average-card"
        );


    if (
        average
    ) {

        average.insertAdjacentElement(
            "afterend",
            status
        );


    } else {

        page.prepend(
            status
        );
    }
}


function dhPracticeUpdateSafetyStatus(
    type,
    message
) {

    const status =
        document.getElementById(
            "dh-practice-safety-status"
        );


    if (
        !status
    ) {

        return;
    }


    status.textContent =
        message;


    if (
        type ===
        "error"
    ) {

        status.style.borderColor =
            "#8a3434";

        status.style.background =
            "#2b1010";

        status.style.color =
            "#ffadad";


    } else if (
        type ===
        "cloud"
    ) {

        status.style.borderColor =
            "#17865b";

        status.style.background =
            "#09291d";

        status.style.color =
            "#7affbd";


    } else {

        status.style.borderColor =
            "#315166";

        status.style.background =
            "#0a1820";

        status.style.color =
            "#86d9ff";
    }
}



/* =========================================================
   CLOUD SAVE
========================================================= */

async function dhPracticeSafeCloudSave(
    snapshot
) {

    if (
        dhPracticeSaveRunning
    ) {

        return {
            success:
                false,

            message:
                "A save is already running."
        };
    }


    if (
        typeof currentDartHubUser ===
            "undefined" ||
        !currentDartHubUser
    ) {

        return {
            success:
                false,

            message:
                "You are not signed in."
        };
    }


    dhPracticeSaveRunning =
        true;


    try {

        const state =
            snapshot.state;


        const average =

            state.darts

                ? (
                    state.points /
                    state.darts *
                    3
                )

                : 0;


        const {
            data,
            error
        } =
            await dartHubSupabase
                .rpc(
                    "save_practice_session_v2",
                    {

                        p_session_uid:
                            snapshot.sessionUID,

                        p_board_type:
                            snapshot.boardType,

                        p_points:
                            Number(
                                state.points ||
                                0
                            ),

                        p_darts:
                            Number(
                                state.darts ||
                                0
                            ),

                        p_visits:
                            Array.isArray(
                                state.visits
                            )

                                ? state.visits.length

                                : 0,

                        p_average:
                            Number(
                                average.toFixed(
                                    2
                                )
                            ),

                        p_highest_visit:
                            Number(
                                state.bestVisit ||
                                0
                            ),

                        p_scores_100:
                            Number(
                                state.scores100 ||
                                0
                            ),

                        p_scores_140:
                            Number(
                                state.scores140 ||
                                0
                            ),

                        p_scores_180:
                            Number(
                                state.scores180 ||
                                0
                            )
                    }
                );


        if (
            error
        ) {

            throw error;
        }


        if (
            !data ||
            data.success !==
                true
        ) {

            throw new Error(
                "Supabase did not confirm the Practice save."
            );
        }


        /*
           Refresh profile information after the
           database transaction succeeds.
        */

        if (
            typeof loadCloudProfile ===
                "function"
        ) {

            try {

                await loadCloudProfile();

            } catch (
                error
            ) {

                console.warn(
                    "Profile refresh after Practice:",
                    error
                );
            }
        }


        if (
            typeof v23LoadProfileData ===
                "function"
        ) {

            try {

                await v23LoadProfileData();

            } catch (
                error
            ) {

                console.warn(
                    "Stats refresh after Practice:",
                    error
                );
            }
        }


        return {

            success:
                true,

            data
        };


    } catch (
        error
    ) {

        console.error(
            "Practice cloud save:",
            error
        );


        return {

            success:
                false,

            message:

                error?.message

                ||

                error?.details

                ||

                "Unknown Supabase error.",

            error
        };


    } finally {

        dhPracticeSaveRunning =
            false;
    }
}



/* =========================================================
   REPLACE OLD PRACTICE CLOUD SAVE
========================================================= */

async function dhSavePracticeSession() {

    const snapshot =
        dhPracticeBuildSnapshot(
            true
        );


    if (
        !snapshot
    ) {

        return false;
    }


    localStorage.setItem(

        DH_PRACTICE_PENDING_KEY,

        JSON.stringify(
            snapshot
        )
    );


    dhPracticeUpdateRecoveryBanner();


    dhPracticeUpdateSafetyStatus(
        "safe",
        "☁️ Saving Practice session…"
    );


    const result =
        await dhPracticeSafeCloudSave(
            snapshot
        );


    if (
        result.success
    ) {

        dhPracticeClearBackups();


        dhPracticeUpdateSafetyStatus(
            "cloud",
            "✅ Practice session saved to Dart Hub"
        );


        return true;
    }


    /*
       IMPORTANT:
       Do not delete the local session.
    */

    localStorage.setItem(

        DH_PRACTICE_PENDING_KEY,

        JSON.stringify(
            snapshot
        )
    );


    localStorage.setItem(

        DH_PRACTICE_ACTIVE_KEY,

        JSON.stringify(
            snapshot
        )
    );


    dhPracticeUpdateRecoveryBanner();


    dhPracticeUpdateSafetyStatus(
        "error",
        "⚠️ Cloud save failed — session is SAFE locally"
    );


    alert(

        "Dart Hub could not save this Practice session to the cloud.\n\n" +

        "YOUR SESSION HAS NOT BEEN LOST.\n\n" +

        "It is safely stored on this device and can be retried.\n\n" +

        "Supabase error:\n" +

        result.message
    );


    return false;
}



/* =========================================================
   REPLACE FINISH
========================================================= */

async function dhPracticeFinish() {

    if (
        !dhPractice.active
    ) {

        return;
    }


    if (
        !dhPractice.darts
    ) {

        if (
            confirm(
                "No darts have been entered. Exit Practice?"
            )
        ) {

            dhPracticeExit();
        }


        return;
    }


    if (
        dhPractice.currentDarts.length
    ) {

        if (
            typeof dhPracticePushUndo ===
                "function"
        ) {

            dhPracticePushUndo();
        }


        if (
            typeof dhPracticeCompleteCurrentVisit ===
                "function"
        ) {

            dhPracticeCompleteCurrentVisit();
        }
    }


    if (
        typeof dhPracticeRender ===
            "function"
    ) {

        dhPracticeRender();
    }


    dhPracticeBackup();


    if (
        !confirm(
            "Finish this Practice session and save the stats?"
        )
    ) {

        return;
    }


    const saved =
        await dhSavePracticeSession();


    /*
       THIS IS THE CRITICAL FIX.

       Do not destroy / close the session unless
       Supabase has confirmed the cloud save.
    */

    if (
        !saved
    ) {

        return;
    }


    dhPractice.active =
        false;


    document
        .getElementById(
            "dh-practice-screen"
        )
        ?.classList
        .add(
            "hidden"
        );


    if (
        typeof v24GoHome ===
            "function"
    ) {

        v24GoHome();


    } else {

        document
            .getElementById(
                "mode-screen"
            )
            ?.classList
            .remove(
                "hidden"
            );
    }
}



/* =========================================================
   RETRY COMPLETED SAVE
========================================================= */

async function dhPracticeRetryPending() {

    const snapshot =
        dhPracticeSafeJSON(
            DH_PRACTICE_PENDING_KEY
        );


    if (
        !snapshot
    ) {

        alert(
            "There is no Practice session waiting to be saved."
        );


        dhPracticeUpdateRecoveryBanner();


        return;
    }


    const button =
        document.getElementById(
            "dh-practice-retry-btn"
        );


    if (
        button
    ) {

        button.disabled =
            true;


        button.textContent =
            "☁️ Saving…";
    }


    const result =
        await dhPracticeSafeCloudSave(
            snapshot
        );


    if (
        result.success
    ) {

        dhPracticeClearBackups();


        alert(
            "✅ Your Practice session has now been saved to Dart Hub."
        );


    } else {

        alert(

            "The session is still safe on this device, but Dart Hub could not save it yet.\n\n" +

            (
                result.message ||
                "Unknown error."
            )
        );
    }


    if (
        button
    ) {

        button.disabled =
            false;


        button.textContent =
            "☁️ Retry Cloud Save";
    }


    dhPracticeUpdateRecoveryBanner();
}



/* =========================================================
   HOME RECOVERY BANNER
========================================================= */

function dhPracticeInstallRecoveryBanner() {

    if (
        document.getElementById(
            "dh-practice-recovery"
        )
    ) {

        return;
    }


    const mode =
        document.getElementById(
            "mode-screen"
        );


    if (
        !mode
    ) {

        return;
    }


    const banner =
        document.createElement(
            "div"
        );


    banner.id =
        "dh-practice-recovery";


    banner.className =
        "hidden";


    banner.style.cssText = `

        margin: 12px auto;

        padding: 12px;

        max-width: 700px;

        border: 2px solid #b5792c;

        border-radius: 10px;

        background: #291c0c;

        color: white;
    `;


    banner.innerHTML = `

        <div
            style="
                color:#ffc46d;
                font-size:16px;
                font-weight:900;
            "
        >
            💾 Protected Practice Session
        </div>


        <div
            id="dh-practice-recovery-text"
            style="
                margin-top:5px;
                color:#d4c4aa;
                font-size:11px;
            "
        ></div>


        <div
            style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:7px;
                margin-top:9px;
            "
        >

            <button
                id="dh-practice-resume-btn"
                class="btn-secondary"
                type="button"
            >
                ▶ Resume Session
            </button>


            <button
                id="dh-practice-retry-btn"
                class="btn-primary"
                type="button"
            >
                ☁️ Retry Cloud Save
            </button>

        </div>


        <button
            id="dh-practice-discard-safe-btn"
            class="btn-warning"
            type="button"
            style="
                width:100%;
                margin-top:7px;
            "
        >
            Delete Protected Session
        </button>
    `;


    mode.appendChild(
        banner
    );


    document
        .getElementById(
            "dh-practice-resume-btn"
        )
        .onclick =
            () => {

                const snapshot =

                    dhPracticeSafeJSON(
                        DH_PRACTICE_PENDING_KEY
                    )

                    ||

                    dhPracticeSafeJSON(
                        DH_PRACTICE_ACTIVE_KEY
                    );


                if (
                    !snapshot
                ) {

                    return;
                }


                dhPracticeRestoreSnapshot(
                    snapshot
                );
            };


    document
        .getElementById(
            "dh-practice-retry-btn"
        )
        .onclick =
            dhPracticeRetryPending;


    document
        .getElementById(
            "dh-practice-discard-safe-btn"
        )
        .onclick =
            () => {

                if (
                    !confirm(
                        "Permanently delete this protected Practice session?"
                    )
                ) {

                    return;
                }


                dhPracticeClearBackups();
            };


    dhPracticeUpdateRecoveryBanner();
}



function dhPracticeUpdateRecoveryBanner() {

    const banner =
        document.getElementById(
            "dh-practice-recovery"
        );


    if (
        !banner
    ) {

        return;
    }


    const pending =
        dhPracticeSafeJSON(
            DH_PRACTICE_PENDING_KEY
        );


    const active =
        dhPracticeSafeJSON(
            DH_PRACTICE_ACTIVE_KEY
        );


    const snapshot =
        pending ||
        active;


    if (
        !snapshot ||
        !snapshot.state ||
        !snapshot.state.darts
    ) {

        banner.classList.add(
            "hidden"
        );


        return;
    }


    banner.classList.remove(
        "hidden"
    );


    const state =
        snapshot.state;


    const average =

        state.darts

            ? (
                state.points /
                state.darts *
                3
            ).toFixed(
                2
            )

            : "0.00";


    document
        .getElementById(
            "dh-practice-recovery-text"
        )
        .textContent =

            `${state.visits.length} visits • ` +

            `${state.darts} darts • ` +

            `${state.points} points • ` +

            `${average} average`;


    document
        .getElementById(
            "dh-practice-retry-btn"
        )
        ?.classList
        .toggle(
            "hidden",
            !pending
        );
}



/* =========================================================
   WRAP PRACTICE ACTIONS
========================================================= */

function dhPracticeInstallWrappers() {

    /*
       START PRACTICE
    */

    if (
        typeof dartHubStartAveragePractice ===
            "function" &&
        !window.__dhSafePracticeStart
    ) {

        window.__dhSafePracticeStart =
            true;


        const originalStart =
            dartHubStartAveragePractice;


        dartHubStartAveragePractice =
            function () {

                originalStart();


                dhPractice.sessionUID =
                    dhPracticeMakeUUID();


                dhPracticeInstallSafetyStatus();


                dhPracticeBackup();
            };
    }


    /*
       ADD DART
    */

    if (
        typeof dhPracticeAddDart ===
            "function" &&
        !window.__dhSafePracticeAddDart
    ) {

        window.__dhSafePracticeAddDart =
            true;


        const originalAddDart =
            dhPracticeAddDart;


        dhPracticeAddDart =
            function (
                ...args
            ) {

                const result =
                    originalAddDart(
                        ...args
                    );


                dhPracticeBackup();


                return result;
            };
    }


    /*
       COMPLETE VISIT
    */

    if (
        typeof dhPracticeCompleteCurrentVisit ===
            "function" &&
        !window.__dhSafePracticeComplete
    ) {

        window.__dhSafePracticeComplete =
            true;


        const originalComplete =
            dhPracticeCompleteCurrentVisit;


        dhPracticeCompleteCurrentVisit =
            function (
                ...args
            ) {

                const result =
                    originalComplete(
                        ...args
                    );


                dhPracticeBackup();


                return result;
            };
    }


    /*
       UNDO
    */

    if (
        typeof dhPracticeUndo ===
            "function" &&
        !window.__dhSafePracticeUndo
    ) {

        window.__dhSafePracticeUndo =
            true;


        const originalUndo =
            dhPracticeUndo;


        dhPracticeUndo =
            function (
                ...args
            ) {

                const result =
                    originalUndo(
                        ...args
                    );


                dhPracticeBackup();


                return result;
            };
    }
}



/* =========================================================
   PROTECT PAGE CLOSE / REFRESH
========================================================= */

window.addEventListener(
    "beforeunload",
    event => {

        if (
            typeof dhPractice !==
                "undefined" &&
            dhPractice.active &&
            Number(
                dhPractice.darts ||
                0
            ) >
                0
        ) {

            dhPracticeBackup();


            event.preventDefault();


            event.returnValue =
                "";
        }
    }
);



/* =========================================================
   INITIALISE
========================================================= */

function dhPracticeSafetyInit() {

    dhPracticeInstallWrappers();

    dhPracticeInstallSafetyStatus();

    dhPracticeInstallRecoveryBanner();

    dhPracticeUpdateRecoveryBanner();


    console.log(
        "💾 Dart Hub Practice safety ready."
    );
}


setTimeout(
    dhPracticeSafetyInit,
    300
);