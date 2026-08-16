"use strict";


/* =========================================================
   DART HUB CAMERA
   PHONE + PC CALIBRATION + EXPERIMENTAL DETECTION
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const CAMERA_SUPABASE_URL =
    "https://uijksziplmhpqrrhmclj.supabase.co";


const CAMERA_SUPABASE_KEY =
    "sb_publishable_6lVBJIruJUMnJK5CF1HT6A_KvAAvFyn";


const cameraSupabase =
    supabase.createClient(

        CAMERA_SUPABASE_URL,

        CAMERA_SUPABASE_KEY
    );


/* =========================================================
   PAGE
========================================================= */

const CAMERA_PAGE =
    document.body.dataset.cameraPage;


/* =========================================================
   COMMON
========================================================= */

let cameraSession =
    null;


let cameraChannel =
    null;


function cameraSleep(
    milliseconds
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}


function cameraClamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );
}


/* =========================================================
   AUTH CHECK
========================================================= */

async function cameraRequireLogin() {

    const {
        data
    } =
        await cameraSupabase
            .auth
            .getSession();


    if (
        !data.session
    ) {

        alert(

            "You need to be signed into Dart Hub " +

            "on this device first."
        );


        throw new Error(
            "No Dart Hub login session."
        );
    }


    return data.session.user;
}


/* =========================================================
   MATRIX SOLVER
========================================================= */

function solveLinearSystem(
    matrix,
    values
) {

    const n =
        values.length;


    const a =
        matrix.map(
            (
                row,
                index
            ) => [

                ...row,

                values[index]
            ]
        );


    for (
        let column = 0;
        column < n;
        column++
    ) {

        let pivot =
            column;


        for (
            let row =
                column + 1;
            row < n;
            row++
        ) {

            if (
                Math.abs(
                    a[row][column]
                )
                >
                Math.abs(
                    a[pivot][column]
                )
            ) {

                pivot =
                    row;
            }
        }


        [
            a[column],
            a[pivot]
        ] = [

            a[pivot],
            a[column]
        ];


        const divisor =
            a[column][column];


        if (
            Math.abs(
                divisor
            ) <
            0.0000001
        ) {

            throw new Error(
                "Calibration points are invalid."
            );
        }


        for (
            let j =
                column;
            j <= n;
            j++
        ) {

            a[column][j] /=
                divisor;
        }


        for (
            let row = 0;
            row < n;
            row++
        ) {

            if (
                row ===
                column
            ) {

                continue;
            }


            const factor =
                a[row][column];


            for (
                let j =
                    column;
                j <= n;
                j++
            ) {

                a[row][j] -=
                    factor *
                    a[column][j];
            }
        }
    }


    return a.map(
        row =>
            row[n]
    );
}


/* =========================================================
   HOMOGRAPHY
========================================================= */

function computeHomography(
    source,
    destination
) {

    const A =
        [];


    const b =
        [];


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const x =
            source[i].x;


        const y =
            source[i].y;


        const X =
            destination[i].x;


        const Y =
            destination[i].y;


        A.push([

            x,
            y,
            1,
            0,
            0,
            0,
            -X * x,
            -X * y

        ]);


        b.push(
            X
        );


        A.push([

            0,
            0,
            0,
            x,
            y,
            1,
            -Y * x,
            -Y * y

        ]);


        b.push(
            Y
        );
    }


    const h =
        solveLinearSystem(
            A,
            b
        );


    return [

        h[0],
        h[1],
        h[2],

        h[3],
        h[4],
        h[5],

        h[6],
        h[7],
        1

    ];
}


function transformPoint(
    matrix,
    point
) {

    const x =
        point.x;


    const y =
        point.y;


    const denominator =

        matrix[6] * x
        +
        matrix[7] * y
        +
        matrix[8];


    return {

        x:

            (
                matrix[0] * x
                +
                matrix[1] * y
                +
                matrix[2]
            )
            /
            denominator,

        y:

            (
                matrix[3] * x
                +
                matrix[4] * y
                +
                matrix[5]
            )
            /
            denominator
    };
}


/* =========================================================
   SCORE MAP
========================================================= */

const DART_SEGMENTS = [

    20,
    1,
    18,
    4,
    13,
    6,
    10,
    15,
    2,
    17,
    3,
    19,
    7,
    16,
    8,
    11,
    14,
    9,
    12,
    5

];


function scoreBoardPoint(
    x,
    y,
    calibration
) {

    const radius =
        Math.sqrt(
            x * x +
            y * y
        );


    const outerBull =
        calibration.rings.outerBull;


    const innerBull =
        outerBull *
        0.40;


    if (
        radius <=
        innerBull
    ) {

        return {

            label:
                "Bull",

            score:
                50,

            multiplier:
                2,

            number:
                25
        };
    }


    if (
        radius <=
        outerBull
    ) {

        return {

            label:
                "25",

            score:
                25,

            multiplier:
                1,

            number:
                25
        };
    }


    if (
        radius >
        1
    ) {

        return {

            label:
                "Miss",

            score:
                0,

            multiplier:
                0,

            number:
                0
        };
    }


    let angle =
        Math.atan2(
            x,
            -y
        );


    if (
        angle <
        0
    ) {

        angle +=
            Math.PI *
            2;
    }


    const segmentWidth =
        Math.PI /
        10;


    const index =

        Math.floor(

            (
                angle
                +
                segmentWidth /
                2
            )

            /

            segmentWidth
        )

        %

        20;


    const number =
        DART_SEGMENTS[
            index
        ];


    let multiplier =
        1;


    let prefix =
        "";


    if (
        radius >=
            calibration.rings.doubleInner
    ) {

        multiplier =
            2;


        prefix =
            "D";


    } else if (

        radius >=
            calibration.rings.trebleInner

        &&

        radius <=
            calibration.rings.trebleOuter

    ) {

        multiplier =
            3;


        prefix =
            "T";
    }


    return {

        label:

            prefix +
            number,

        score:

            number *
            multiplier,

        number,

        multiplier
    };
}




/* =========================================================
   PHONE STATE
========================================================= */

let phoneVideo;

let phoneCanvas;

let phoneContext;

let phoneStream =
    null;


let phoneCalibration =
    null;


let phoneDetecting =
    false;


let phoneBaseline =
    null;


let phoneEmptyReference =
    null;


let phoneStableCount =
    0;


let phoneLastDifference =
    0;


let phoneDartsInVisit =
    0;


let phoneDetectionTimer =
    null;


/* =========================================================
   PHONE INITIALISE
========================================================= */

async function initialiseCameraPhone() {

    phoneVideo =
        document.getElementById(
            "camera-video"
        );


    phoneCanvas =
        document.getElementById(
            "camera-canvas"
        );


    phoneContext =
        phoneCanvas.getContext(
            "2d",
            {
                willReadFrequently:
                    true
            }
        );


    document
        .getElementById(
            "start-camera"
        )
        .onclick =
            startPhoneCamera;


    document
        .getElementById(
            "create-session"
        )
        .onclick =
            createPhoneSession;


    document
        .getElementById(
            "send-snapshot"
        )
        .onclick =
            sendCalibrationSnapshot;


    document
        .getElementById(
            "start-detection"
        )
        .onclick =
            startAutomaticDetection;


    document
        .getElementById(
            "reset-baseline"
        )
        .onclick =
            captureEmptyBaseline;


    document
        .getElementById(
            "stop-camera"
        )
        .onclick =
            stopPhoneCamera;


    try {

        await cameraRequireLogin();

    } catch {

        return;
    }
}


/* =========================================================
   START PHONE CAMERA
========================================================= */

async function startPhoneCamera() {

    try {

        phoneStream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {

                        facingMode: {

                            ideal:
                                "environment"
                        },

                        width: {

                            ideal:
                                1920
                        },

                        height: {

                            ideal:
                                1080
                        }
                    },

                    audio:
                        false
                });


        phoneVideo.srcObject =
            phoneStream;


        await new Promise(
            resolve => {

                phoneVideo.onloadedmetadata =
                    resolve;
            }
        );


        document
            .getElementById(
                "create-session"
            )
            .disabled =
                false;


        setPhoneStatus(
            "Camera ready. Keep the phone completely still from now on."
        );


    } catch (
        error
    ) {

        console.error(
            error
        );


        setPhoneStatus(
            "Could not open the rear camera."
        );
    }
}


/* =========================================================
   CREATE SESSION
========================================================= */

async function createPhoneSession() {

    try {

        const {
            data,
            error
        } =
            await cameraSupabase
                .rpc(
                    "create_dart_hub_camera_session"
                );


        if (
            error
        ) {

            throw error;
        }


        cameraSession = {

            id:
                data.id,

            code:
                data.session_code
        };


        document
            .getElementById(
                "session-code"
            )
            .textContent =
                cameraSession.code;


        document
            .getElementById(
                "send-snapshot"
            )
            .disabled =
                false;


        subscribePhoneSession();


        setPhoneStatus(
            "Session ready. Open Camera Calibration on the PC."
        );


    } catch (
        error
    ) {

        console.error(
            error
        );


        setPhoneStatus(
            "Could not create camera session."
        );
    }
}


/* =========================================================
   PHONE SNAPSHOT
========================================================= */

function capturePhoneFrame(
    maxWidth =
        1280
) {

    const videoWidth =
        phoneVideo.videoWidth;


    const videoHeight =
        phoneVideo.videoHeight;


    const scale =

        Math.min(
            1,
            maxWidth /
            videoWidth
        );


    const width =
        Math.round(
            videoWidth *
            scale
        );


    const height =
        Math.round(
            videoHeight *
            scale
        );


    phoneCanvas.width =
        width;


    phoneCanvas.height =
        height;


    phoneContext.drawImage(

        phoneVideo,

        0,
        0,

        width,
        height
    );


    return {

        width,

        height,

        imageData:

            phoneContext.getImageData(
                0,
                0,
                width,
                height
            )
    };
}


/* =========================================================
   SEND CALIBRATION IMAGE
========================================================= */

async function sendCalibrationSnapshot() {

    if (
        !cameraSession
    ) {

        return;
    }


    const frame =
        capturePhoneFrame();


    const jpeg =
        phoneCanvas.toDataURL(
            "image/jpeg",
            0.72
        );


    try {

        const {
            error
        } =
            await cameraSupabase

                .from(
                    "camera_sessions"
                )

                .update({

                    snapshot_data:
                        jpeg,

                    snapshot_width:
                        frame.width,

                    snapshot_height:
                        frame.height,

                    status:
                        "calibrating",

                    updated_at:
                        new Date()
                            .toISOString()
                })

                .eq(
                    "id",
                    cameraSession.id
                );


        if (
            error
        ) {

            throw error;
        }


        setPhoneStatus(

            "Picture sent. " +

            "Calibrate the board on the PC."
        );


    } catch (
        error
    ) {

        console.error(
            error
        );


        setPhoneStatus(
            "Could not send calibration picture."
        );
    }
}


/* =========================================================
   PHONE REALTIME
========================================================= */

function subscribePhoneSession() {

    if (
        cameraChannel
    ) {

        cameraSupabase
            .removeChannel(
                cameraChannel
            );
    }


    cameraChannel =
        cameraSupabase

            .channel(
                `camera-phone-${cameraSession.id}`
            )

            .on(

                "postgres_changes",

                {

                    event:
                        "UPDATE",

                    schema:
                        "public",

                    table:
                        "camera_sessions",

                    filter:
                        `id=eq.${cameraSession.id}`
                },

                payload => {

                    const row =
                        payload.new;


                    if (
                        row.calibration &&
                        row.calibration.points
                    ) {

                        phoneCalibration =
                            row.calibration;


                        document
                            .getElementById(
                                "start-detection"
                            )
                            .disabled =
                                false;


                        document
                            .getElementById(
                                "reset-baseline"
                            )
                            .disabled =
                                false;


                        setPhoneStatus(
                            "Calibration received ✓"
                        );
                    }
                }
            )

            .subscribe();
}


/* =========================================================
   EMPTY BOARD BASELINE
========================================================= */

function imageToGrey(
    imageData
) {

    const source =
        imageData.data;


    const grey =
        new Uint8Array(
            imageData.width *
            imageData.height
        );


    for (
        let i = 0,
            j = 0;
        i < source.length;
        i += 4,
            j++
    ) {

        grey[j] =

            (
                source[i] *
                0.299
            )
            +
            (
                source[i + 1] *
                0.587
            )
            +
            (
                source[i + 2] *
                0.114
            );
    }


    return grey;
}


function captureAnalysisGrey() {

    const frame =
        capturePhoneFrame(
            640
        );


    return {

        width:
            frame.width,

        height:
            frame.height,

        grey:
            imageToGrey(
                frame.imageData
            )
    };
}


function captureEmptyBaseline() {

    const frame =
        captureAnalysisGrey();


    phoneBaseline =
        frame;


    phoneEmptyReference =
        {

            width:
                frame.width,

            height:
                frame.height,

            grey:
                new Uint8Array(
                    frame.grey
                )
        };


    phoneDartsInVisit =
        0;


    phoneStableCount =
        0;


    setPhoneStatus(
        "Empty board captured. Ready for darts."
    );
}


/* =========================================================
   START AUTOMATIC DETECTION
========================================================= */

function startAutomaticDetection() {

    if (
        !phoneCalibration
    ) {

        alert(
            "Calibrate the board on the PC first."
        );


        return;
    }


    captureEmptyBaseline();


    phoneDetecting =
        true;


    document
        .getElementById(
            "start-detection"
        )
        .textContent =
            "🎯 Automatic Detection ON";


    if (
        phoneDetectionTimer
    ) {

        clearInterval(
            phoneDetectionTimer
        );
    }


    phoneDetectionTimer =
        setInterval(

            automaticDetectionTick,

            450
        );
}


/* =========================================================
   FRAME DIFFERENCE
========================================================= */

function frameDifference(
    previous,
    current
) {

    if (
        !previous ||
        previous.width !==
            current.width ||
        previous.height !==
            current.height
    ) {

        return null;
    }


    const changed =
        [];


    let totalChanged =
        0;


    const threshold =
        42;


    const stride =
        2;


    for (
        let y = 0;
        y < current.height;
        y += stride
    ) {

        for (
            let x = 0;
            x < current.width;
            x += stride
        ) {

            const index =
                y *
                current.width +
                x;


            const difference =
                Math.abs(

                    current.grey[index]
                    -
                    previous.grey[index]
                );


            if (
                difference >=
                threshold
            ) {

                changed.push({

                    x,
                    y,
                    difference
                });


                totalChanged++;
            }
        }
    }


    return {

        pixels:
            changed,

        count:
            totalChanged
    };
}


/* =========================================================
   AUTOMATIC DETECTION LOOP
========================================================= */

async function automaticDetectionTick() {

    if (
        !phoneDetecting ||
        !phoneBaseline
    ) {

        return;
    }


    const current =
        captureAnalysisGrey();


    /*
       AFTER 3 DARTS:
       wait until darts are removed.
    */

    if (
        phoneDartsInVisit >=
        3
    ) {

        const clearDiff =
            frameDifference(

                phoneEmptyReference,

                current
            );


        if (
            clearDiff &&
            clearDiff.count <
            350
        ) {

            phoneBaseline =
                current;


            phoneEmptyReference =
                {

                    width:
                        current.width,

                    height:
                        current.height,

                    grey:
                        new Uint8Array(
                            current.grey
                        )
                };


            phoneDartsInVisit =
                0;


            setPhoneStatus(
                "Board cleared. Ready for next visit."
            );
        }


        return;
    }


    const diff =
        frameDifference(

            phoneBaseline,

            current
        );


    if (
        !diff
    ) {

        return;
    }


    /*
       Too little change = no new dart.
    */

    if (
        diff.count <
        550
    ) {

        phoneStableCount =
            0;


        phoneLastDifference =
            diff.count;


        return;
    }


    /*
       Large movement:
       probably hand / player moving.
    */

    if (
        diff.count >
        18000
    ) {

        phoneStableCount =
            0;


        phoneLastDifference =
            diff.count;


        return;
    }


    /*
       Wait until changed area stabilises.
    */

    const changeDelta =
        Math.abs(

            diff.count -
            phoneLastDifference
        );


    if (
        changeDelta <
        450
    ) {

        phoneStableCount++;


    } else {

        phoneStableCount =
            0;
    }


    phoneLastDifference =
        diff.count;


    if (
        phoneStableCount <
        2
    ) {

        return;
    }


    phoneStableCount =
        0;


    const detection =
        estimateDartImpact(

            diff.pixels,

            current.width,

            current.height
        );


    if (
        !detection
    ) {

        return;
    }


    await publishDetection(
        detection
    );


    phoneBaseline =
        current;


    phoneDartsInVisit++;
}


/* =========================================================
   ESTIMATE IMPACT
========================================================= */

function estimateDartImpact(
    pixels,
    analysisWidth,
    analysisHeight
) {

    if (
        !phoneCalibration ||
        pixels.length <
        100
    ) {

        return null;
    }


    const calibrationWidth =
        phoneCalibration.imageWidth;


    const calibrationHeight =
        phoneCalibration.imageHeight;


    const scaleX =
        calibrationWidth /
        analysisWidth;


    const scaleY =
        calibrationHeight /
        analysisHeight;


    const homography =
        phoneCalibration.homography;


    const usable =
        [];


    for (
        const pixel
        of pixels
    ) {

        const sourcePoint = {

            x:
                pixel.x *
                scaleX,

            y:
                pixel.y *
                scaleY
        };


        const mapped =
            transformPoint(

                homography,

                sourcePoint
            );


        const radius =
            Math.sqrt(

                mapped.x *
                mapped.x

                +

                mapped.y *
                mapped.y
            );


        if (
            radius <=
            1.08
        ) {

            usable.push({

                source:
                    sourcePoint,

                board:
                    mapped,

                weight:
                    pixel.difference
            });
        }
    }


    if (
        usable.length <
        80
    ) {

        return null;
    }


    /*
       Weighted centre of the new object.

       This is deliberately simple for the
       first experimental version.

       Later we will replace this with dart-line
       and tip detection once calibration is proven.
    */

    let sumX =
        0;


    let sumY =
        0;


    let sumWeight =
        0;


    for (
        const point
        of usable
    ) {

        const weight =
            point.weight *
            point.weight;


        sumX +=
            point.board.x *
            weight;


        sumY +=
            point.board.y *
            weight;


        sumWeight +=
            weight;
    }


    if (
        !sumWeight
    ) {

        return null;
    }


    const boardX =
        sumX /
        sumWeight;


    const boardY =
        sumY /
        sumWeight;


    const result =
        scoreBoardPoint(

            boardX,

            boardY,

            phoneCalibration
        );


    /*
       Confidence:
       lower when close to scoring boundaries.
    */

    const confidence =
        estimateScoreConfidence(

            boardX,

            boardY,

            phoneCalibration
        );


    return {

        ...result,

        boardX,

        boardY,

        confidence,

        timestamp:
            Date.now(),

        dartNumber:
            phoneDartsInVisit +
            1
    };
}


/* =========================================================
   CONFIDENCE
========================================================= */

function estimateScoreConfidence(
    x,
    y,
    calibration
) {

    const radius =
        Math.sqrt(
            x * x +
            y * y
        );


    const ringBoundaries = [

        calibration.rings.outerBull,

        calibration.rings.trebleInner,

        calibration.rings.trebleOuter,

        calibration.rings.doubleInner,

        1
    ];


    let ringDistance =
        1;


    for (
        const boundary
        of ringBoundaries
    ) {

        ringDistance =
            Math.min(

                ringDistance,

                Math.abs(
                    radius -
                    boundary
                )
            );
    }


    let angle =
        Math.atan2(
            x,
            -y
        );


    if (
        angle <
        0
    ) {

        angle +=
            Math.PI *
            2;
    }


    const segment =
        Math.PI /
        10;


    const anglePosition =
        (
            angle +
            segment /
            2
        )
        %
        segment;


    const angleDistance =
        Math.min(

            anglePosition,

            segment -
            anglePosition
        );


    let confidence =
        95;


    if (
        ringDistance <
        0.018
    ) {

        confidence -=
            25;
    }


    if (
        angleDistance <
        0.035
    ) {

        confidence -=
            25;
    }


    return cameraClamp(
        confidence,
        35,
        98
    );
}


/* =========================================================
   PUBLISH DETECTION
========================================================= */

async function publishDetection(
    detection
) {

    document
        .getElementById(
            "detected-dart"
        )
        .textContent =
            detection.label;


    document
        .getElementById(
            "detected-score"
        )
        .textContent =
            detection.score;


    document
        .getElementById(
            "detected-confidence"
        )
        .textContent =

            `Dart ${detection.dartNumber}` +

            ` • ${detection.confidence}% confidence`;


    if (
        !cameraSession
    ) {

        return;
    }


    try {

        await cameraSupabase

            .from(
                "camera_sessions"
            )

            .update({

                last_detection:
                    detection,

                camera_state: {

                    detecting:
                        true,

                    dartsInVisit:
                        phoneDartsInVisit +
                        1
                },

                status:
                    "detecting",

                updated_at:
                    new Date()
                        .toISOString()
            })

            .eq(
                "id",
                cameraSession.id
            );


    } catch (
        error
    ) {

        console.warn(
            error
        );
    }
}


/* =========================================================
   PHONE STATUS
========================================================= */

function setPhoneStatus(
    message
) {

    document
        .getElementById(
            "phone-status"
        )
        .textContent =
            message;
}


/* =========================================================
   STOP PHONE
========================================================= */

function stopPhoneCamera() {

    phoneDetecting =
        false;


    if (
        phoneDetectionTimer
    ) {

        clearInterval(
            phoneDetectionTimer
        );


        phoneDetectionTimer =
            null;
    }


    if (
        phoneStream
    ) {

        phoneStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );


        phoneStream =
            null;
    }


    setPhoneStatus(
        "Camera stopped."
    );
}


/* =========================================================
   PC CALIBRATION
========================================================= */




/* =========================================================
   PC STATE
========================================================= */

let pcSession =
    null;


let pcCanvas;

let pcContext;

let pcImage =
    null;


let pcPoints =
    [];


let pcShowGrid =
    false;


let pcCalibration =
    null;


const POINT_INSTRUCTIONS = [

    "Click TOP of outer double ring",

    "Click RIGHT of outer double ring",

    "Click BOTTOM of outer double ring",

    "Click LEFT of outer double ring",

    "Click centre of BULL",

    "Click centre of the 20 segment near the double ring"

];


/* =========================================================
   INITIALISE PC
========================================================= */

async function initialiseCalibrationPC() {

    pcCanvas =
        document.getElementById(
            "calibration-canvas"
        );


    pcContext =
        pcCanvas.getContext(
            "2d"
        );


    document
        .getElementById(
            "connect-camera"
        )
        .onclick =
            connectCalibrationSession;


    document
        .getElementById(
            "undo-point"
        )
        .onclick =
            undoCalibrationPoint;


    document
        .getElementById(
            "reset-points"
        )
        .onclick =
            resetCalibrationPoints;


    document
        .getElementById(
            "preview-grid"
        )
        .onclick =
            previewCalibration;


    document
        .getElementById(
            "save-calibration"
        )
        .onclick =
            saveCalibration;


    pcCanvas.addEventListener(

        "click",

        addCalibrationPoint
    );


    installSliderHandlers();


    try {

        await cameraRequireLogin();

    } catch {

        return;
    }
}


/* =========================================================
   CONNECT PC
========================================================= */

async function connectCalibrationSession() {

    const code =
        document
            .getElementById(
                "calibration-code"
            )
            .value
            .trim()
            .toUpperCase();


    if (
        code.length !==
        6
    ) {

        setCalibrationStatus(
            "Enter the six-character phone code."
        );


        return;
    }


    try {

        const {
            data,
            error
        } =
            await cameraSupabase

                .from(
                    "camera_sessions"
                )

                .select(
                    "*"
                )

                .eq(
                    "session_code",
                    code
                )

                .neq(
                    "status",
                    "ended"
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

            setCalibrationStatus(
                "Camera session not found."
            );


            return;
        }


        pcSession =
            data;


        setCalibrationStatus(
            "Connected to phone ✓"
        );


        document
            .getElementById(
                "calibration-area"
            )
            .style
            .display =
                "block";


        document
            .getElementById(
                "ring-settings"
            )
            .style
            .display =
                "block";


        document
            .getElementById(
                "live-detection"
            )
            .style
            .display =
                "block";


        if (
            data.snapshot_data
        ) {

            loadCalibrationImage(
                data.snapshot_data
            );


        } else {

            setCurrentInstruction(
                "Press Send Calibration Picture on the phone."
            );
        }


        subscribePCSession();


    } catch (
        error
    ) {

        console.error(
            error
        );


        setCalibrationStatus(
            "Could not connect to phone."
        );
    }
}


/* =========================================================
   PC REALTIME
========================================================= */

function subscribePCSession() {

    if (
        cameraChannel
    ) {

        cameraSupabase
            .removeChannel(
                cameraChannel
            );
    }


    cameraChannel =
        cameraSupabase

            .channel(
                `camera-pc-${pcSession.id}`
            )

            .on(

                "postgres_changes",

                {

                    event:
                        "UPDATE",

                    schema:
                        "public",

                    table:
                        "camera_sessions",

                    filter:
                        `id=eq.${pcSession.id}`
                },

                payload => {

                    const row =
                        payload.new;


                    if (
                        row.snapshot_data &&
                        row.snapshot_data !==
                            pcSession.snapshot_data
                    ) {

                        pcSession.snapshot_data =
                            row.snapshot_data;


                        pcSession.snapshot_width =
                            row.snapshot_width;


                        pcSession.snapshot_height =
                            row.snapshot_height;


                        pcPoints =
                            [];


                        loadCalibrationImage(
                            row.snapshot_data
                        );
                    }


                    if (
                        row.last_detection &&
                        row.last_detection.timestamp
                    ) {

                        showPCDetection(
                            row.last_detection
                        );
                    }
                }
            )

            .subscribe();
}


/* =========================================================
   LOAD IMAGE
========================================================= */

function loadCalibrationImage(
    source
) {

    pcImage =
        new Image();


    pcImage.onload =
        () => {

            pcCanvas.width =
                pcImage.naturalWidth;


            pcCanvas.height =
                pcImage.naturalHeight;


            drawCalibration();


            setCurrentInstruction(
                POINT_INSTRUCTIONS[
                    pcPoints.length
                ]
            );
        };


    pcImage.src =
        source;
}


/* =========================================================
   ADD POINT
========================================================= */

function addCalibrationPoint(
    event
) {

    if (
        !pcImage ||
        pcPoints.length >=
        POINT_INSTRUCTIONS.length
    ) {

        return;
    }


    const rect =
        pcCanvas.getBoundingClientRect();


    const scaleX =
        pcCanvas.width /
        rect.width;


    const scaleY =
        pcCanvas.height /
        rect.height;


    pcPoints.push({

        x:
            (
                event.clientX -
                rect.left
            )
            *
            scaleX,

        y:
            (
                event.clientY -
                rect.top
            )
            *
            scaleY
    });


    drawCalibration();


    if (
        pcPoints.length <
        POINT_INSTRUCTIONS.length
    ) {

        setCurrentInstruction(
            POINT_INSTRUCTIONS[
                pcPoints.length
            ]
        );


    } else {

        setCurrentInstruction(
            "All points set. Click Preview Grid."
        );
    }
}


/* =========================================================
   UNDO / RESET
========================================================= */

function undoCalibrationPoint() {

    if (
        !pcPoints.length
    ) {

        return;
    }


    pcPoints.pop();


    pcShowGrid =
        false;


    drawCalibration();


    setCurrentInstruction(
        POINT_INSTRUCTIONS[
            pcPoints.length
        ]
    );
}


function resetCalibrationPoints() {

    pcPoints =
        [];


    pcShowGrid =
        false;


    pcCalibration =
        null;


    drawCalibration();


    setCurrentInstruction(
        POINT_INSTRUCTIONS[0]
    );
}


/* =========================================================
   CREATE CALIBRATION
========================================================= */

function buildPCCalibration() {

    if (
        pcPoints.length <
        6
    ) {

        throw new Error(
            "Set all six calibration points first."
        );
    }


    const source = [

        pcPoints[0],
        pcPoints[1],
        pcPoints[2],
        pcPoints[3]

    ];


    const destination = [

        {
            x:
                0,

            y:
                -1
        },

        {
            x:
                1,

            y:
                0
        },

        {
            x:
                0,

            y:
                1
        },

        {
            x:
                -1,

            y:
                0
        }

    ];


    const homography =
        computeHomography(

            source,

            destination
        );


    const mappedBull =
        transformPoint(

            homography,

            pcPoints[4]
        );


    /*
       Shift mapped coordinates so
       clicked bull is exactly 0,0.
    */

    homography[2] -=
        mappedBull.x;


    homography[5] -=
        mappedBull.y;


    return {

        points:
            pcPoints,

        homography,

        imageWidth:
            pcCanvas.width,

        imageHeight:
            pcCanvas.height,

        direction20:
            pcPoints[5],

        rings: {

            outerBull:
                Number(
                    document
                        .getElementById(
                            "outer-bull-ratio"
                        )
                        .value
                ),

            trebleInner:
                Number(
                    document
                        .getElementById(
                            "treble-inner-ratio"
                        )
                        .value
                ),

            trebleOuter:
                Number(
                    document
                        .getElementById(
                            "treble-outer-ratio"
                        )
                        .value
                ),

            doubleInner:
                Number(
                    document
                        .getElementById(
                            "double-inner-ratio"
                        )
                        .value
                )
        }
    };
}


/* =========================================================
   PREVIEW
========================================================= */

function previewCalibration() {

    try {

        pcCalibration =
            buildPCCalibration();


        pcShowGrid =
            true;


        drawCalibration();


        setCurrentInstruction(
            "Check the overlay carefully. Adjust points or ring sliders if needed."
        );


    } catch (
        error
    ) {

        alert(
            error.message
        );
    }
}


/* =========================================================
   DRAW
========================================================= */

function drawCalibration() {

    if (
        !pcImage
    ) {

        return;
    }


    pcContext.clearRect(

        0,
        0,
        pcCanvas.width,
        pcCanvas.height
    );


    pcContext.drawImage(

        pcImage,

        0,
        0
    );


    const colours = [

        "#00ffff",

        "#00ffff",

        "#00ffff",

        "#00ffff",

        "#ff00ff",

        "#ffff00"

    ];


    pcPoints.forEach(
        (
            point,
            index
        ) => {

            pcContext.beginPath();


            pcContext.arc(

                point.x,
                point.y,

                10,
                0,
                Math.PI *
                2
            );


            pcContext.fillStyle =
                colours[index];


            pcContext.fill();


            pcContext.lineWidth =
                3;


            pcContext.strokeStyle =
                "#000";


            pcContext.stroke();


            pcContext.fillStyle =
                "white";


            pcContext.font =
                "bold 20px Arial";


            pcContext.fillText(

                String(
                    index +
                    1
                ),

                point.x +
                    13,

                point.y -
                    13
            );
        }
    );


    if (
        pcShowGrid &&
        pcCalibration
    ) {

        drawVirtualBoardGrid();
    }
}


/* =========================================================
   INVERSE APPROXIMATION
========================================================= */

function boardToCameraPoint(
    boardX,
    boardY
) {

    /*
       For drawing only.

       Search nearby source coordinates for
       the board coordinate.

       This avoids needing a separate
       matrix inverse implementation in
       the first prototype.
    */

    const H =
        pcCalibration.homography;


    const inverse =
        invert3x3(
            H
        );


    return transformPoint(

        inverse,

        {
            x:
                boardX,

            y:
                boardY
        }
    );
}


function invert3x3(
    m
) {

    const a =
        m[0];

    const b =
        m[1];

    const c =
        m[2];

    const d =
        m[3];

    const e =
        m[4];

    const f =
        m[5];

    const g =
        m[6];

    const h =
        m[7];

    const i =
        m[8];


    const A =
        e * i -
        f * h;


    const B =
        -(
            d * i -
            f * g
        );


    const C =
        d * h -
        e * g;


    const D =
        -(
            b * i -
            c * h
        );


    const E =
        a * i -
        c * g;


    const F =
        -(
            a * h -
            b * g
        );


    const G =
        b * f -
        c * e;


    const H =
        -(
            a * f -
            c * d
        );


    const I =
        a * e -
        b * d;


    const determinant =

        a * A +
        b * B +
        c * C;


    return [

        A / determinant,
        D / determinant,
        G / determinant,

        B / determinant,
        E / determinant,
        H / determinant,

        C / determinant,
        F / determinant,
        I / determinant

    ];
}


/* =========================================================
   DRAW VIRTUAL GRID
========================================================= */

function drawVirtualBoardGrid() {

    const rings = [

        pcCalibration.rings.outerBull,

        pcCalibration.rings.trebleInner,

        pcCalibration.rings.trebleOuter,

        pcCalibration.rings.doubleInner,

        1

    ];


    pcContext.strokeStyle =
        "#00ff77";


    pcContext.lineWidth =
        3;


    for (
        const radius
        of rings
    ) {

        const points =
            [];


        for (
            let degree = 0;
            degree <= 360;
            degree += 3
        ) {

            const radians =
                degree *
                Math.PI /
                180;


            points.push(

                boardToCameraPoint(

                    Math.sin(
                        radians
                    )
                    *
                    radius,

                    -Math.cos(
                        radians
                    )
                    *
                    radius
                )
            );
        }


        pcContext.beginPath();


        points.forEach(
            (
                point,
                index
            ) => {

                if (
                    index ===
                    0
                ) {

                    pcContext.moveTo(
                        point.x,
                        point.y
                    );


                } else {

                    pcContext.lineTo(
                        point.x,
                        point.y
                    );
                }
            }
        );


        pcContext.stroke();
    }


    /*
       20 wedge boundaries
    */

    pcContext.strokeStyle =
        "#00aaff";


    for (
        let index = 0;
        index < 20;
        index++
    ) {

        const angle =

            (
                index *
                18
            )
            -
            9;


        const radians =
            angle *
            Math.PI /
            180;


        const inside =
            boardToCameraPoint(

                Math.sin(
                    radians
                )
                *
                pcCalibration.rings.outerBull,

                -Math.cos(
                    radians
                )
                *
                pcCalibration.rings.outerBull
            );


        const outside =
            boardToCameraPoint(

                Math.sin(
                    radians
                ),

                -Math.cos(
                    radians
                )
            );


        pcContext.beginPath();


        pcContext.moveTo(
            inside.x,
            inside.y
        );


        pcContext.lineTo(
            outside.x,
            outside.y
        );


        pcContext.stroke();
    }
}


/* =========================================================
   RING SLIDERS
========================================================= */

function installSliderHandlers() {

    const ids = [

        "outer-bull-ratio",

        "treble-inner-ratio",

        "treble-outer-ratio",

        "double-inner-ratio"

    ];


    ids.forEach(
        id => {

            const slider =
                document.getElementById(
                    id
                );


            const output =
                document.getElementById(

                    id.replace(
                        "-ratio",
                        "-value"
                    )
                );


            slider.oninput =
                () => {

                    output.textContent =
                        slider.value;


                    if (
                        pcPoints.length >=
                        6
                    ) {

                        try {

                            pcCalibration =
                                buildPCCalibration();


                            pcShowGrid =
                                true;


                            drawCalibration();

                        } catch {

                            // nothing
                        }
                    }
                };
        }
    );
}


/* =========================================================
   SAVE CALIBRATION
========================================================= */

async function saveCalibration() {

    if (
        !pcSession
    ) {

        return;
    }


    try {

        pcCalibration =
            buildPCCalibration();


        const {
            error
        } =
            await cameraSupabase

                .from(
                    "camera_sessions"
                )

                .update({

                    calibration:
                        pcCalibration,

                    status:
                        "calibrated",

                    updated_at:
                        new Date()
                            .toISOString()
                })

                .eq(
                    "id",
                    pcSession.id
                );


        if (
            error
        ) {

            throw error;
        }


        setCurrentInstruction(
            "Calibration saved ✓ The phone can now start detecting darts."
        );


    } catch (
        error
    ) {

        console.error(
            error
        );


        alert(
            error.message ||
            "Could not save calibration."
        );
    }
}


/* =========================================================
   PC DETECTION DISPLAY
========================================================= */

function showPCDetection(
    detection
) {

    document
        .getElementById(
            "pc-detected-dart"
        )
        .textContent =

            `Dart ${detection.dartNumber}: ` +

            `${detection.label} — ` +

            `${detection.score}`;


    document
        .getElementById(
            "pc-detected-confidence"
        )
        .textContent =

            `${detection.confidence}% confidence`;
}


/* =========================================================
   PC STATUS
========================================================= */

function setCalibrationStatus(
    message
) {

    document
        .getElementById(
            "calibration-status"
        )
        .textContent =
            message;
}


function setCurrentInstruction(
    message
) {

    document
        .getElementById(
            "current-point"
        )
        .textContent =
            message;
}

/* =========================================================
   START CAMERA APP
   MUST BE LAST IN THIS FILE
========================================================= */

async function startDartHubCamera() {

    try {

        if (
            CAMERA_PAGE ===
            "phone"
        ) {

            await initialiseCameraPhone();

            console.log(
                "Dart Hub phone camera ready."
            );

            return;
        }


        if (
            CAMERA_PAGE ===
            "calibrate"
        ) {

            await initialiseCalibrationPC();

            console.log(
                "Dart Hub PC calibration ready."
            );

            return;
        }


        console.warn(
            "Unknown Dart Hub camera page."
        );


    } catch (
        error
    ) {

        console.error(
            "Dart Hub camera startup error:",
            error
        );


        alert(
            "The Dart Hub camera could not start. Check the browser console for details."
        );
    }
}


startDartHubCamera();