"use strict";


/* =========================================================
   DART HUB CAMERA

   STABLE CAMERA SCRIPT

   FEATURES
   - Phone camera
   - Supabase camera session
   - PC live calibration
   - PC remote controls
   - Zoom from PC or phone
   - Recalibration from PC
   - Safe board re-arm
   - Automatic detection
   - Multi-frame impact voting
   - Impact marker on PC
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


const CAMERA_PAGE =
    document.body.dataset.cameraPage;


let cameraSession =
    null;


let cameraChannel =
    null;


/* =========================================================
   BOARD
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


const CALIBRATION_ANCHORS = [

    {
        number:
            20,

        index:
            0
    },

    {
        number:
            18,

        index:
            2
    },

    {
        number:
            6,

        index:
            5
    },

    {
        number:
            15,

        index:
            7
    },

    {
        number:
            3,

        index:
            10
    },

    {
        number:
            7,

        index:
            12
    },

    {
        number:
            11,

        index:
            15
    },

    {
        number:
            9,

        index:
            17
    }

];


const RING_COLOURS = {

    outerDouble:
        "#00d9ff",

    innerDouble:
        "#ae78ff",

    outerTreble:
        "#00ff88",

    innerTreble:
        "#ff9d2e",

    bull:
        "#ff3d91"
};


/* =========================================================
   HELPERS
========================================================= */

function clamp(
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


function mean(
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
                value,
            0
        )

        /

        values.length
    );
}


function median(
    values
) {

    if (
        !values.length
    ) {

        return 0;
    }


    const sorted =
        [
            ...values
        ].sort(
            (
                a,
                b
            ) =>
                a -
                b
        );


    const middle =
        Math.floor(
            sorted.length /
            2
        );


    if (
        sorted.length %
        2
    ) {

        return sorted[
            middle
        ];
    }


    return (

        sorted[
            middle -
                1
        ]

        +

        sorted[
            middle
        ]

    ) / 2;
}


function sleep(
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


function roundToStep(
    value,
    step
) {

    if (
        !step
    ) {

        return value;
    }


    return (

        Math.round(
            value /
            step
        )

        *

        step
    );
}


function normaliseAngle(
    angle
) {

    const full =
        Math.PI *
        2;


    angle %=
        full;


    if (
        angle <
        0
    ) {

        angle +=
            full;
    }


    return angle;
}


function signedAngleDifference(
    a,
    b
) {

    let result =
        normaliseAngle(
            a
        )

        -

        normaliseAngle(
            b
        );


    if (
        result >
        Math.PI
    ) {

        result -=
            Math.PI *
            2;
    }


    if (
        result <
        -Math.PI
    ) {

        result +=
            Math.PI *
            2;
    }


    return result;
}


function circularMean(
    values
) {

    let sin =
        0;


    let cos =
        0;


    values.forEach(
        value => {

            sin +=
                Math.sin(
                    value
                );


            cos +=
                Math.cos(
                    value
                );
        }
    );


    return Math.atan2(
        sin,
        cos
    );
}


/* =========================================================
   AUTH
========================================================= */

async function requireCameraLogin() {

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
            "Open normal Dart Hub and sign in first."
        );


        throw new Error(
            "Not signed in."
        );
    }


    return data.session.user;
}


/* =========================================================
   MATRIX
========================================================= */

function solveLinearSystem(
    matrix,
    values
) {

    const n =
        values.length;


    const rows =
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
                    rows[row][column]
                )
                >
                Math.abs(
                    rows[pivot][column]
                )
            ) {

                pivot =
                    row;
            }
        }


        [
            rows[column],
            rows[pivot]
        ] =
        [
            rows[pivot],
            rows[column]
        ];


        const divisor =
            rows[column][column];


        if (
            Math.abs(
                divisor
            )
            <
            1e-10
        ) {

            throw new Error(
                "Unstable calibration."
            );
        }


        for (
            let j =
                column;
            j <= n;
            j++
        ) {

            rows[column][j] /=
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
                rows[row][column];


            for (
                let j =
                    column;
                j <= n;
                j++
            ) {

                rows[row][j] -=

                    factor *
                    rows[column][j];
            }
        }
    }


    return rows.map(
        row =>
            row[n]
    );
}


function computeLeastSquaresHomography(
    source,
    destination
) {

    const A =
        [];


    const b =
        [];


    for (
        let i = 0;
        i < source.length;
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


    const size =
        8;


    const normal =
        Array.from(
            {
                length:
                    size
            },
            () =>
                Array(
                    size
                ).fill(
                    0
                )
        );


    const rhs =
        Array(
            size
        ).fill(
            0
        );


    for (
        let row = 0;
        row < A.length;
        row++
    ) {

        for (
            let i = 0;
            i < size;
            i++
        ) {

            rhs[i] +=

                A[row][i] *
                b[row];


            for (
                let j = 0;
                j < size;
                j++
            ) {

                normal[i][j] +=

                    A[row][i] *
                    A[row][j];
            }
        }
    }


    const h =
        solveLinearSystem(
            normal,
            rhs
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

    const denominator =

        matrix[6] *
        point.x

        +

        matrix[7] *
        point.y

        +

        matrix[8];


    return {

        x:

            (
                matrix[0] *
                point.x

                +

                matrix[1] *
                point.y

                +

                matrix[2]
            )

            /

            denominator,


        y:

            (
                matrix[3] *
                point.x

                +

                matrix[4] *
                point.y

                +

                matrix[5]
            )

            /

            denominator
    };
}


function invert3x3(
    matrix
) {

    const [
        a, b, c,
        d, e, f,
        g, h, i
    ] =
        matrix;


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
   SCORE
========================================================= */

function scoreBoardPoint(
    x,
    y,
    calibration
) {

    const radius =
        Math.hypot(
            x,
            y
        );


    const rings =
        calibration.rings;


    if (
        radius <=
        rings.innerBull
    ) {

        return {
            label:
                "Bull",
            score:
                50,
            number:
                25,
            multiplier:
                2
        };
    }


    if (
        radius <=
        rings.outerBull
    ) {

        return {
            label:
                "25",
            score:
                25,
            number:
                25,
            multiplier:
                1
        };
    }


    if (
        radius >
        rings.outerDouble
    ) {

        return {
            label:
                "Miss",
            score:
                0,
            number:
                0,
            multiplier:
                0
        };
    }


    let angle =
        Math.atan2(
            x,
            -y
        );


    angle =
        normaliseAngle(

            angle -

            (
                calibration.segmentOffset ||
                0
            )
        );


    const segmentWidth =
        Math.PI /
        10;


    const segmentIndex =

        Math.floor(

            (
                angle +
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
            segmentIndex
        ];


    if (
        radius >=
        rings.innerDouble
    ) {

        return {
            label:
                `D${number}`,
            score:
                number *
                2,
            number,
            multiplier:
                2
        };
    }


    if (
        radius >=
            rings.innerTreble

        &&

        radius <=
            rings.outerTreble
    ) {

        return {
            label:
                `T${number}`,
            score:
                number *
                3,
            number,
            multiplier:
                3
        };
    }


    return {
        label:
            String(
                number
            ),
        score:
            number,
        number,
        multiplier:
            1
    };
}


/* =========================================================
   PHONE
========================================================= */

let phoneVideo;

let phoneCanvas;

let phoneContext;

let phoneStream =
    null;


let phoneVideoTrack =
    null;


let phoneLiveTimer =
    null;


let phoneLiveFeed =
    false;


let phoneCalibration =
    null;


let phoneCalibrationValid =
    false;


let phoneBaseline =
    null;


let phoneEmptyReference =
    null;


let phoneDetectionTimer =
    null;


let phoneDetecting =
    false;


let phoneRearming =
    false;


let phoneAnalysing =
    false;


let phoneStableFrames =
    0;


let phoneLastDifference =
    0;


let phoneDartsInVisit =
    0;


let phoneLastDetectionTime =
    0;


let phoneZoom = {

    supported:
        false,

    min:
        1,

    max:
        1,

    step:
        0.1,

    value:
        1
};


/* =========================================================
   PHONE INIT
========================================================= */

async function initialisePhone() {

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
            "toggle-live-feed"
        )
        .onclick =
            togglePhoneLiveFeed;


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
            rearmFromCurrentBoard;


    document
        .getElementById(
            "stop-detection"
        )
        .onclick =
            stopAutomaticDetection;


    document
        .getElementById(
            "stop-camera"
        )
        .onclick =
            stopPhoneCamera;


    document
        .getElementById(
            "phone-zoom-slider"
        )
        .addEventListener(
            "input",
            event => {

                setPhoneZoom(

                    Number(
                        event.target.value
                    ),

                    true
                );
            }
        );


    document
        .getElementById(
            "phone-zoom-out"
        )
        .onclick =
            () =>
                stepPhoneZoom(
                    -1
                );


    document
        .getElementById(
            "phone-zoom-in"
        )
        .onclick =
            () =>
                stepPhoneZoom(
                    1
                );


    await requireCameraLogin();


    setPhoneState(
        "READY"
    );


    setPhoneStatus(
        "Start the rear camera."
    );
}


/* =========================================================
   PHONE CAMERA
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


        phoneVideoTrack =
            phoneStream
                .getVideoTracks()[0];


        await new Promise(
            resolve => {

                phoneVideo.onloadedmetadata =
                    resolve;
            }
        );


        configurePhoneZoom();


        document
            .getElementById(
                "create-session"
            )
            .disabled =
                false;


        setPhoneState(
            "CAMERA READY"
        );


        setPhoneStatus(
            "Put the phone in its final position."
        );


    } catch (
        error
    ) {

        console.error(
            error
        );


        setPhoneState(
            "CAMERA ERROR"
        );


        setPhoneStatus(
            "Could not start camera."
        );
    }
}


/* =========================================================
   ZOOM
========================================================= */

function configurePhoneZoom() {

    if (
        !phoneVideoTrack
    ) {

        return;
    }


    const capabilities =
        phoneVideoTrack.getCapabilities
            ?
            phoneVideoTrack.getCapabilities()
            :
            {};


    const settings =
        phoneVideoTrack.getSettings
            ?
            phoneVideoTrack.getSettings()
            :
            {};


    if (
        !capabilities.zoom
    ) {

        phoneZoom.supported =
            false;


        setPhoneZoomUI();


        return;
    }


    phoneZoom = {

        supported:
            true,

        min:
            Number(
                capabilities.zoom.min ??
                1
            ),

        max:
            Number(
                capabilities.zoom.max ??
                1
            ),

        step:
            Number(
                capabilities.zoom.step ??
                0.1
            ),

        value:
            Number(
                settings.zoom ??
                capabilities.zoom.min ??
                1
            )
    };


    setPhoneZoomUI();
}


async function setPhoneZoom(
    requested,
    localChange =
        false
) {

    if (
        !phoneZoom.supported ||
        !phoneVideoTrack
    ) {

        return;
    }


    const value =
        clamp(

            roundToStep(
                requested,
                phoneZoom.step
            ),

            phoneZoom.min,

            phoneZoom.max
        );


    try {

        await phoneVideoTrack
            .applyConstraints({

                advanced: [
                    {
                        zoom:
                            value
                    }
                ]
            });


        const settings =
            phoneVideoTrack
                .getSettings();


        phoneZoom.value =
            Number(
                settings.zoom ??
                value
            );


        setPhoneZoomUI();


        if (
            localChange ||
            phoneCalibration
        ) {

            invalidateCalibration();
        }


        broadcastCameraStatus();


    } catch (
        error
    ) {

        console.warn(
            error
        );
    }
}


function stepPhoneZoom(
    direction
) {

    setPhoneZoom(

        phoneZoom.value

        +

        phoneZoom.step *
        direction,

        true
    );
}


function setPhoneZoomUI() {

    const slider =
        document.getElementById(
            "phone-zoom-slider"
        );


    const value =
        document.getElementById(
            "phone-zoom-value"
        );


    const status =
        document.getElementById(
            "phone-zoom-status"
        );


    const out =
        document.getElementById(
            "phone-zoom-out"
        );


    const zoomIn =
        document.getElementById(
            "phone-zoom-in"
        );


    if (
        !phoneZoom.supported
    ) {

        slider.disabled =
            true;

        out.disabled =
            true;

        zoomIn.disabled =
            true;

        value.textContent =
            "N/A";

        status.textContent =
            "Browser zoom not available.";

        return;
    }


    slider.min =
        phoneZoom.min;

    slider.max =
        phoneZoom.max;

    slider.step =
        phoneZoom.step;

    slider.value =
        phoneZoom.value;

    slider.disabled =
        false;

    out.disabled =
        false;

    zoomIn.disabled =
        false;


    value.textContent =
        `${phoneZoom.value.toFixed(1)}×`;


    status.textContent =

        `${phoneZoom.min.toFixed(1)}× – ` +

        `${phoneZoom.max.toFixed(1)}×`;
}


/* =========================================================
   SESSION
========================================================= */

async function createPhoneSession() {

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

        console.error(
            error
        );

        setPhoneStatus(
            "Could not create session."
        );

        return;
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
            "toggle-live-feed"
        )
        .disabled =
            false;


    subscribePhoneDatabase();


    await openPhoneChannel();


    startPhoneLiveFeed();


    broadcastCameraStatus();
}


async function openPhoneChannel() {

    if (
        cameraChannel
    ) {

        await cameraSupabase
            .removeChannel(
                cameraChannel
            );
    }


    cameraChannel =
        cameraSupabase
            .channel(
                `camera-live-${cameraSession.id}`
            );


    cameraChannel
        .on(

            "broadcast",

            {
                event:
                    "request-frame"
            },

            () =>
                sendLiveCameraFrame()
        );


    cameraChannel
        .on(

            "broadcast",

            {
                event:
                    "camera-command"
            },

            message =>
                handlePCCommand(
                    message.payload
                )
        );


    await cameraChannel
        .subscribe();
}


async function handlePCCommand(
    command
) {

    if (
        !command?.action
    ) {

        return;
    }


    switch (
        command.action
    ) {

        case "start-detection":

            startAutomaticDetection();

            break;


        case "reset-baseline":

            await rearmFromCurrentBoard();

            break;


        case "stop-detection":

            stopAutomaticDetection();

            break;


        case "set-zoom":

            await setPhoneZoom(
                Number(
                    command.value
                )
            );

            break;


        case "start-live-feed":

            startPhoneLiveFeed();

            break;


        case "begin-recalibration":

            stopAutomaticDetection();

            phoneCalibrationValid =
                false;

            startPhoneLiveFeed();

            setPhoneState(
                "RECALIBRATING"
            );

            broadcastCameraStatus();

            break;
    }
}


/* =========================================================
   LIVE FEED
========================================================= */

function togglePhoneLiveFeed() {

    phoneLiveFeed
        ?
        stopPhoneLiveFeed()
        :
        startPhoneLiveFeed();
}


function startPhoneLiveFeed() {

    if (
        !cameraSession ||
        !phoneStream
    ) {

        return;
    }


    phoneLiveFeed =
        true;


    const button =
        document.getElementById(
            "toggle-live-feed"
        );


    if (
        button
    ) {

        button.textContent =
            "📡 Live Calibration Feed ON";
    }


    clearInterval(
        phoneLiveTimer
    );


    sendLiveCameraFrame();


    phoneLiveTimer =
        setInterval(
            sendLiveCameraFrame,
            650
        );
}


function stopPhoneLiveFeed() {

    phoneLiveFeed =
        false;


    clearInterval(
        phoneLiveTimer
    );


    phoneLiveTimer =
        null;


    const button =
        document.getElementById(
            "toggle-live-feed"
        );


    if (
        button
    ) {

        button.textContent =
            "📡 Start Live Calibration Feed";
    }
}


/* =========================================================
   FRAME
========================================================= */

function capturePhoneFrame(
    maxWidth =
        640
) {

    const scale =
        Math.min(

            1,

            maxWidth /
            phoneVideo.videoWidth
        );


    const width =
        Math.round(

            phoneVideo.videoWidth *
            scale
        );


    const height =
        Math.round(

            phoneVideo.videoHeight *
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


async function sendLiveCameraFrame() {

    if (
        !phoneLiveFeed ||
        !cameraChannel ||
        !phoneStream
    ) {

        return;
    }


    const frame =
        capturePhoneFrame(
            640
        );


    const image =
        phoneCanvas.toDataURL(
            "image/jpeg",
            0.5
        );


    await cameraChannel.send({

        type:
            "broadcast",

        event:
            "camera-frame",

        payload: {

            image,

            width:
                frame.width,

            height:
                frame.height,

            timestamp:
                Date.now()
        }
    });
}


/* =========================================================
   DATABASE CALIBRATION
========================================================= */

function subscribePhoneDatabase() {

    cameraSupabase
        .channel(
            `camera-db-${cameraSession.id}`
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

                const calibration =
                    payload.new
                        .calibration;


                if (
                    calibration &&
                    calibration.version >=
                        9
                ) {

                    phoneCalibration =
                        calibration;


                    phoneCalibrationValid =
                        true;


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


                    setPhoneState(
                        "CALIBRATED"
                    );


                    setPhoneStatus(
                        "Calibration received."
                    );


                    broadcastCameraStatus();
                }
            }
        )

        .subscribe();
}


/* =========================================================
   GREY FRAMES
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
            Math.round(

                source[i] *
                0.299

                +

                source[i + 1] *
                0.587

                +

                source[i + 2] *
                0.114
            );
    }


    return grey;
}


function captureAnalysisFrame() {

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


function cloneAnalysisFrame(
    frame
) {

    return {

        width:
            frame.width,

        height:
            frame.height,

        grey:
            new Uint8Array(
                frame.grey
            )
    };
}


/* =========================================================
   DIFFERENCE
========================================================= */

function compareFrames(
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


    const pixels =
        [];


    let count =
        0;


    const threshold =
        34;


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
                difference >
                threshold
            ) {

                pixels.push({

                    x,

                    y,

                    difference
                });


                count++;
            }
        }
    }


    return {
        count,
        pixels
    };
}


/* =========================================================
   CAMERA PIXEL -> BOARD
========================================================= */

function imagePixelToBoard(
    x,
    y,
    width,
    height
) {

    const scaleX =

        phoneCalibration.imageWidth /
        width;


    const scaleY =

        phoneCalibration.imageHeight /
        height;


    const mapped =
        transformPoint(

            phoneCalibration.homography,

            {

                x:
                    x *
                    scaleX,

                y:
                    y *
                    scaleY
            }
        );


    return {

        x:

            (
                mapped.x -
                phoneCalibration.centre.x
            )

            /

            phoneCalibration.scale,


        y:

            (
                mapped.y -
                phoneCalibration.centre.y
            )

            /

            phoneCalibration.scale
    };
}


/* =========================================================
   FALLBACK DETECTOR

   dart-detector.js overrides this function.
========================================================= */

function findImpactPoint(
    difference,
    width,
    height
) {

    if (
        !difference?.pixels?.length
    ) {

        return null;
    }


    let best =
        null;


    /*
       Very simple safe fallback:
       choose the changed board point deepest inside
       the playable board.
    */

    difference.pixels
        .forEach(
            pixel => {

                const board =
                    imagePixelToBoard(

                        pixel.x,
                        pixel.y,

                        width,
                        height
                    );


                const radius =
                    Math.hypot(
                        board.x,
                        board.y
                    );


                if (
                    radius >
                    1.025
                ) {

                    return;
                }


                if (
                    !best ||
                    radius <
                    best.radius
                ) {

                    best = {

                        x:
                            board.x,

                        y:
                            board.y,

                        radius
                    };
                }
            }
        );


    return best;
}


/* =========================================================
   BASELINE
========================================================= */

function captureBoardBaseline() {

    const frame =
        captureAnalysisFrame();


    phoneBaseline =
        cloneAnalysisFrame(
            frame
        );


    phoneEmptyReference =
        cloneAnalysisFrame(
            frame
        );


    phoneDartsInVisit =
        0;


    phoneStableFrames =
        0;


    phoneLastDifference =
        0;


    setPhoneState(
        "READY — DART 1"
    );


    broadcastCameraStatus();
}


/* =========================================================
   SAFE RE-ARM
========================================================= */

async function rearmFromCurrentBoard() {

    if (
        phoneRearming ||
        !phoneStream
    ) {

        return;
    }


    phoneRearming =
        true;


    const wasDetecting =
        phoneDetecting;


    phoneDetecting =
        false;


    clearInterval(
        phoneDetectionTimer
    );


    phoneDetectionTimer =
        null;


    setPhoneState(
        "WAITING FOR CAMERA TO SETTLE…"
    );


    broadcastCameraStatus();


    let previous =
        captureAnalysisFrame();


    let stable =
        0;


    for (
        let attempt = 0;
        attempt < 15;
        attempt++
    ) {

        await sleep(
            250
        );


        const current =
            captureAnalysisFrame();


        const difference =
            compareFrames(

                previous,
                current
            );


        if (
            difference &&
            difference.count <
                250
        ) {

            stable++;


        } else {

            stable =
                0;
        }


        previous =
            current;


        if (
            stable >=
            3
        ) {

            break;
        }
    }


    const baseline =
        captureAnalysisFrame();


    phoneBaseline =
        cloneAnalysisFrame(
            baseline
        );


    phoneEmptyReference =
        cloneAnalysisFrame(
            baseline
        );


    phoneDartsInVisit =
        0;


    phoneStableFrames =
        0;


    phoneLastDifference =
        0;


    phoneLastDetectionTime =
        0;


    if (
        wasDetecting &&
        phoneCalibrationValid
    ) {

        phoneDetecting =
            true;


        phoneDetectionTimer =
            setInterval(
                detectionTick,
                350
            );
    }


    phoneRearming =
        false;


    setPhoneState(
        "READY — DART 1"
    );


    setPhoneStatus(
        "New baseline captured."
    );


    broadcastCameraStatus();
}


/* =========================================================
   MULTI-FRAME IMPACT VOTE
========================================================= */

async function collectImpactVote() {

    const candidates =
        [];


    let finalFrame =
        null;


    /*
       Analyse five settled images.

       One strange frame should no longer decide the score.
    */

    for (
        let sample = 0;
        sample < 5;
        sample++
    ) {

        if (
            sample >
            0
        ) {

            await sleep(
                90
            );
        }


        const current =
            captureAnalysisFrame();


        finalFrame =
            current;


        const difference =
            compareFrames(

                phoneBaseline,
                current
            );


        if (
            !difference ||
            difference.count <
                350
        ) {

            continue;
        }


        const impact =
            findImpactPoint(

                difference,
                current.width,
                current.height
            );


        if (
            !impact
        ) {

            continue;
        }


        const radius =
            Math.hypot(
                impact.x,
                impact.y
            );


        /*
           HARD SAFETY MASK.
        */

        if (
            !Number.isFinite(
                radius
            )

            ||

            radius >
            1.025
        ) {

            continue;
        }


        candidates.push({

            x:
                impact.x,

            y:
                impact.y
        });
    }


    if (
        !candidates.length
    ) {

        return {
            impact:
                null,
            frame:
                finalFrame
        };
    }


    /*
       Median vote.
    */

    let centre = {

        x:
            median(
                candidates.map(
                    candidate =>
                        candidate.x
                )
            ),

        y:
            median(
                candidates.map(
                    candidate =>
                        candidate.y
                )
            )
    };


    /*
       Remove candidates far away from the voted result.
    */

    const filtered =
        candidates.filter(
            candidate =>

                Math.hypot(

                    candidate.x -
                    centre.x,

                    candidate.y -
                    centre.y
                )

                <
                0.10
        );


    if (
        filtered.length >=
        2
    ) {

        centre = {

            x:
                median(
                    filtered.map(
                        candidate =>
                            candidate.x
                    )
                ),

            y:
                median(
                    filtered.map(
                        candidate =>
                            candidate.y
                    )
                )
        };
    }


    return {

        impact:
            centre,

        frame:
            finalFrame,

        votes:
            filtered.length ||
            candidates.length
    };
}


/* =========================================================
   DETECTION
========================================================= */

function startAutomaticDetection() {

    if (
        !phoneCalibration ||
        !phoneCalibrationValid
    ) {

        setPhoneState(
            "CALIBRATION REQUIRED"
        );


        return;
    }


    stopPhoneLiveFeed();


    captureBoardBaseline();


    phoneDetecting =
        true;


    document
        .getElementById(
            "start-detection"
        )
        .textContent =
            "🎯 Automatic Detection ON";


    document
        .getElementById(
            "stop-detection"
        )
        .disabled =
            false;


    clearInterval(
        phoneDetectionTimer
    );


    phoneDetectionTimer =
        setInterval(
            detectionTick,
            350
        );


    broadcastCameraStatus();
}


function stopAutomaticDetection() {

    phoneDetecting =
        false;


    clearInterval(
        phoneDetectionTimer
    );


    phoneDetectionTimer =
        null;


    const button =
        document.getElementById(
            "start-detection"
        );


    if (
        button
    ) {

        button.textContent =
            "🎯 Start Automatic Detection";
    }


    const stop =
        document.getElementById(
            "stop-detection"
        );


    if (
        stop
    ) {

        stop.disabled =
            true;
    }


    if (
        phoneCalibrationValid &&
        !phoneRearming
    ) {

        setPhoneState(
            "DETECTION STOPPED"
        );
    }


    broadcastCameraStatus();
}


/* =========================================================
   DETECTION TICK
========================================================= */

async function detectionTick() {

    if (
        !phoneDetecting ||
        !phoneBaseline ||
        phoneRearming ||
        phoneAnalysing
    ) {

        return;
    }


    const current =
        captureAnalysisFrame();


    /*
       Three darts already scored.
       Wait for board to return to empty reference.
    */

    if (
        phoneDartsInVisit >=
        3
    ) {

        const clear =
            compareFrames(

                phoneEmptyReference,
                current
            );


        if (
            clear &&
            clear.count <
                300
        ) {

            phoneBaseline =
                cloneAnalysisFrame(
                    current
                );


            phoneEmptyReference =
                cloneAnalysisFrame(
                    current
                );


            phoneDartsInVisit =
                0;


            setPhoneState(
                "READY — DART 1"
            );


            broadcastCameraStatus();
        }


        return;
    }


    const difference =
        compareFrames(

            phoneBaseline,
            current
        );


    if (
        !difference
    ) {

        return;
    }


    /*
       Hand / body movement.
    */

    if (
        difference.count >
        18000
    ) {

        phoneStableFrames =
            0;


        phoneLastDifference =
            difference.count;


        setPhoneState(
            "MOVEMENT DETECTED"
        );


        return;
    }


    /*
       Nothing substantial.
    */

    if (
        difference.count <
        450
    ) {

        phoneStableFrames =
            0;


        phoneLastDifference =
            difference.count;


        return;
    }


    const delta =
        Math.abs(

            difference.count -
            phoneLastDifference
        );


    phoneLastDifference =
        difference.count;


    if (
        delta <
        250
    ) {

        phoneStableFrames++;


    } else {

        phoneStableFrames =
            0;
    }


    if (
        phoneStableFrames <
        3
    ) {

        setPhoneState(
            "WAITING FOR DART TO SETTLE…"
        );


        return;
    }


    if (
        Date.now() -
        phoneLastDetectionTime
        <
        1200
    ) {

        return;
    }


    phoneAnalysing =
        true;


    setPhoneState(
        "ANALYSING DART…"
    );


    const vote =
        await collectImpactVote();


    phoneAnalysing =
        false;


    if (
        !vote.impact
    ) {

        phoneStableFrames =
            0;


        setPhoneState(
            "DART UNCLEAR — WAITING…"
        );


        return;
    }


    const result =
        scoreBoardPoint(

            vote.impact.x,
            vote.impact.y,

            phoneCalibration
        );


    const confidence =

        vote.votes >=
        4

            ?
            96

            :

        vote.votes >=
        3

            ?
            90

            :
            78;


    const detection = {

        ...result,

        boardX:
            vote.impact.x,

        boardY:
            vote.impact.y,

        confidence,

        votes:
            vote.votes,

        dartNumber:
            phoneDartsInVisit +
            1,

        timestamp:
            Date.now()
    };


    await publishDetection(
        detection
    );


    phoneDartsInVisit++;


    phoneLastDetectionTime =
        Date.now();


    phoneStableFrames =
        0;


    if (
        vote.frame
    ) {

        phoneBaseline =
            cloneAnalysisFrame(
                vote.frame
            );


    } else {

        phoneBaseline =
            cloneAnalysisFrame(
                current
            );
    }


    setPhoneState(

        `DART ${phoneDartsInVisit}: ` +

        `${detection.label} = ` +

        `${detection.score}`
    );


    setPhoneStatus(

        `${detection.confidence}% confidence` +

        ` • ${detection.votes} detector votes`
    );


    broadcastCameraStatus();
}


/* =========================================================
   PUBLISH
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


    await cameraSupabase

        .from(
            "camera_sessions"
        )

        .update({

            last_detection:
                detection,

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
}


/* =========================================================
   CALIBRATION INVALIDATION
========================================================= */

function invalidateCalibration() {

    phoneCalibrationValid =
        false;


    stopAutomaticDetection();


    setPhoneState(
        "RECALIBRATION REQUIRED"
    );


    setPhoneStatus(
        "Camera view changed."
    );


    broadcastCameraStatus();
}


/* =========================================================
   PHONE STATUS
========================================================= */

function setPhoneState(
    text
) {

    const element =
        document.getElementById(
            "phone-state"
        );


    if (
        element
    ) {

        element.textContent =
            text;
    }
}


function setPhoneStatus(
    text
) {

    const element =
        document.getElementById(
            "phone-status"
        );


    if (
        element
    ) {

        element.textContent =
            text;
    }
}


async function broadcastCameraStatus() {

    if (
        !cameraChannel
    ) {

        return;
    }


    await cameraChannel.send({

        type:
            "broadcast",

        event:
            "camera-status",

        payload: {

            detecting:
                phoneDetecting,

            calibrationValid:
                phoneCalibrationValid,

            dartsInVisit:
                phoneDartsInVisit,

            zoom:
                phoneZoom,

            state:

                document
                    .getElementById(
                        "phone-state"
                    )
                    ?.textContent

                ||

                ""
        }
    });
}


/* =========================================================
   STOP PHONE
========================================================= */

function stopPhoneCamera() {

    stopAutomaticDetection();


    stopPhoneLiveFeed();


    phoneStream
        ?.getTracks()
        .forEach(
            track =>
                track.stop()
        );


    phoneStream =
        null;


    phoneVideoTrack =
        null;


    setPhoneState(
        "CAMERA STOPPED"
    );
}


/* =========================================================
   PC CALIBRATION STATE
========================================================= */

let pcCanvas;

let pcContext;

let pcSession =
    null;


let pcImage =
    null;


let pcImageWidth =
    0;


let pcImageHeight =
    0;


let pcActiveRing =
    "outerDouble";


let pcShowGrid =
    true;


let pcDragging =
    null;


let pcCalibration =
    null;


let pcLastDetection =
    null;


let pcPhoneZoom = {

    supported:
        false,

    min:
        1,

    max:
        1,

    step:
        0.1,

    value:
        1
};


let pcHandles = {

    outerDouble:
        [],

    innerDouble:
        [],

    outerTreble:
        [],

    innerTreble:
        [],

    bull:
        []
};


/* =========================================================
   PC INIT
========================================================= */

async function initialisePC() {

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
            connectToPhone;


    document
        .getElementById(
            "save-calibration"
        )
        .onclick =
            savePCCalibration;


    document
        .getElementById(
            "pc-recalibrate"
        )
        .onclick =
            beginPCRecalibration;


    document
        .getElementById(
            "pc-start-detection"
        )
        .onclick =
            () =>
                sendPhoneCommand(
                    "start-detection"
                );


    document
        .getElementById(
            "pc-reset-baseline"
        )
        .onclick =
            () =>
                sendPhoneCommand(
                    "reset-baseline"
                );


    document
        .getElementById(
            "pc-stop-detection"
        )
        .onclick =
            () =>
                sendPhoneCommand(
                    "stop-detection"
                );


    document
        .getElementById(
            "reset-handles"
        )
        .onclick =
            resetCalibrationHandles;


    document
        .getElementById(
            "toggle-grid"
        )
        .onclick =
            toggleGrid;


    document
        .getElementById(
            "request-frame"
        )
        .onclick =
            requestFreshFrame;


    document
        .getElementById(
            "pc-zoom-slider"
        )
        .addEventListener(
            "input",
            event => {

                requestPCZoom(
                    Number(
                        event.target.value
                    )
                );
            }
        );


    document
        .getElementById(
            "pc-zoom-out"
        )
        .onclick =
            () =>
                requestPCZoom(

                    pcPhoneZoom.value -
                    pcPhoneZoom.step
                );


    document
        .getElementById(
            "pc-zoom-in"
        )
        .onclick =
            () =>
                requestPCZoom(

                    pcPhoneZoom.value +
                    pcPhoneZoom.step
                );


    document
        .querySelectorAll(
            ".ring-tool"
        )
        .forEach(
            button => {

                button.onclick =
                    () =>
                        selectCalibrationRing(
                            button.dataset.ring
                        );
            }
        );


    pcCanvas.addEventListener(
        "pointerdown",
        beginHandleDrag
    );


    pcCanvas.addEventListener(
        "pointermove",
        moveHandle
    );


    pcCanvas.addEventListener(
        "pointerup",
        endHandleDrag
    );


    pcCanvas.addEventListener(
        "pointercancel",
        endHandleDrag
    );


    await requireCameraLogin();
}


/* =========================================================
   PC CONNECT
========================================================= */

async function connectToPhone() {

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
            "Enter the six-character camera code."
        );


        return;
    }


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
        error ||
        !data
    ) {

        setCalibrationStatus(
            "Session not found."
        );


        return;
    }


    pcSession =
        data;


    /*
       Restore existing handles if available.
    */

    if (
        data.calibration
        ?.controlPoints
    ) {

        pcHandles =
            JSON.parse(

                JSON.stringify(
                    data.calibration
                        .controlPoints
                )
            );


        pcCalibration =
            data.calibration;
    }


    document
        .getElementById(
            "calibration-workspace"
        )
        .classList.remove(
            "hidden"
        );


    await openPCChannel();


    subscribePCDatabase();


    await sendPhoneCommand(
        "start-live-feed"
    );


    await requestFreshFrame();


    setCalibrationStatus(
        "Connected ✓"
    );
}


async function openPCChannel() {

    if (
        cameraChannel
    ) {

        await cameraSupabase
            .removeChannel(
                cameraChannel
            );
    }


    cameraChannel =
        cameraSupabase
            .channel(
                `camera-live-${pcSession.id}`
            );


    cameraChannel
        .on(

            "broadcast",

            {
                event:
                    "camera-frame"
            },

            message =>
                receiveLiveFrame(
                    message.payload
                )
        );


    cameraChannel
        .on(

            "broadcast",

            {
                event:
                    "camera-status"
            },

            message =>
                receiveCameraStatus(
                    message.payload
                )
        );


    await cameraChannel
        .subscribe();
}


async function sendPhoneCommand(
    action,
    extra =
        {}
) {

    if (
        !cameraChannel
    ) {

        return;
    }


    await cameraChannel.send({

        type:
            "broadcast",

        event:
            "camera-command",

        payload: {

            action,

            ...extra,

            timestamp:
                Date.now()
        }
    });
}


/* =========================================================
   PC FRAME
========================================================= */

async function requestFreshFrame() {

    if (
        !cameraChannel
    ) {

        return;
    }


    await cameraChannel.send({

        type:
            "broadcast",

        event:
            "request-frame",

        payload: {

            timestamp:
                Date.now()
        }
    });
}


function receiveLiveFrame(
    payload
) {

    if (
        !payload?.image
    ) {

        return;
    }


    const image =
        new Image();


    image.onload =
        () => {

            pcImage =
                image;


            const firstFrame =
                !pcImageWidth;


            pcImageWidth =
                image.naturalWidth;


            pcImageHeight =
                image.naturalHeight;


            pcCanvas.width =
                pcImageWidth;


            pcCanvas.height =
                pcImageHeight;


            if (
                firstFrame &&
                !pcHandles.outerDouble.length
            ) {

                seedCalibrationHandles();
            }


            drawPCScene();
        };


    image.src =
        payload.image;
}


/* =========================================================
   PC STATUS
========================================================= */

function receiveCameraStatus(
    status
) {

    if (
        !status
    ) {

        return;
    }


    const state =
        document.getElementById(
            "pc-camera-state"
        );


    if (
        state &&
        status.state
    ) {

        state.textContent =
            status.state;
    }


    if (
        status.zoom
    ) {

        pcPhoneZoom =
            status.zoom;


        updatePCZoomUI();
    }
}


/* =========================================================
   PC ZOOM
========================================================= */

function requestPCZoom(
    requested
) {

    if (
        !pcPhoneZoom.supported
    ) {

        return;
    }


    const value =
        clamp(

            roundToStep(
                requested,
                pcPhoneZoom.step
            ),

            pcPhoneZoom.min,

            pcPhoneZoom.max
        );


    pcPhoneZoom.value =
        value;


    updatePCZoomUI();


    showRecalibrationWarning(
        true
    );


    sendPhoneCommand(
        "set-zoom",
        {
            value
        }
    );
}


function updatePCZoomUI() {

    const slider =
        document.getElementById(
            "pc-zoom-slider"
        );


    const value =
        document.getElementById(
            "pc-zoom-value"
        );


    const status =
        document.getElementById(
            "pc-zoom-status"
        );


    const minus =
        document.getElementById(
            "pc-zoom-out"
        );


    const plus =
        document.getElementById(
            "pc-zoom-in"
        );


    if (
        !pcPhoneZoom.supported
    ) {

        slider.disabled =
            true;

        minus.disabled =
            true;

        plus.disabled =
            true;

        value.textContent =
            "N/A";

        return;
    }


    slider.min =
        pcPhoneZoom.min;

    slider.max =
        pcPhoneZoom.max;

    slider.step =
        pcPhoneZoom.step;

    slider.value =
        pcPhoneZoom.value;

    slider.disabled =
        false;

    minus.disabled =
        false;

    plus.disabled =
        false;


    value.textContent =
        `${Number(
            pcPhoneZoom.value
        ).toFixed(1)}×`;


    status.textContent =

        `${pcPhoneZoom.min.toFixed(1)}× – ` +

        `${pcPhoneZoom.max.toFixed(1)}×`;
}


/* =========================================================
   CALIBRATION HANDLES
========================================================= */

function seedCalibrationHandles() {

    const centre = {

        x:
            pcImageWidth /
            2,

        y:
            pcImageHeight /
            2
    };


    const radius =

        Math.min(
            pcImageWidth,
            pcImageHeight
        )

        *
        0.39;


    pcHandles.bull = [
        {
            x:
                centre.x,

            y:
                centre.y
        }
    ];


    pcHandles.outerDouble =
        makeRingHandles(
            centre,
            radius
        );


    pcHandles.innerDouble =
        makeRingHandles(
            centre,
            radius *
            0.93
        );


    pcHandles.outerTreble =
        makeRingHandles(
            centre,
            radius *
            0.63
        );


    pcHandles.innerTreble =
        makeRingHandles(
            centre,
            radius *
            0.57
        );


    rebuildPCCalibration();


    showRecalibrationWarning(
        true
    );
}


function makeRingHandles(
    centre,
    radius
) {

    return CALIBRATION_ANCHORS
        .map(
            anchor => {

                const angle =

                    anchor.index *
                    18 *
                    Math.PI /
                    180;


                return {

                    x:

                        centre.x +
                        Math.sin(
                            angle
                        )
                        *
                        radius,


                    y:

                        centre.y -
                        Math.cos(
                            angle
                        )
                        *
                        radius,


                    number:
                        anchor.number,

                    index:
                        anchor.index
                };
            }
        );
}


function selectCalibrationRing(
    ring
) {

    pcActiveRing =
        ring;


    document
        .querySelectorAll(
            ".ring-tool"
        )
        .forEach(
            button => {

                button.classList.toggle(

                    "active",

                    button.dataset.ring ===
                    ring
                );
            }
        );


    drawPCScene();
}


function canvasPointer(
    event
) {

    const rect =
        pcCanvas.getBoundingClientRect();


    return {

        x:

            (
                event.clientX -
                rect.left
            )

            *
            pcCanvas.width /
            rect.width,


        y:

            (
                event.clientY -
                rect.top
            )

            *
            pcCanvas.height /
            rect.height
    };
}


function beginHandleDrag(
    event
) {

    const pointer =
        canvasPointer(
            event
        );


    const handles =
        pcHandles[
            pcActiveRing
        ];


    let best =
        -1;


    let distance =
        Infinity;


    handles.forEach(
        (
            handle,
            index
        ) => {

            const current =
                Math.hypot(

                    pointer.x -
                    handle.x,

                    pointer.y -
                    handle.y
                );


            if (
                current <
                distance
            ) {

                distance =
                    current;

                best =
                    index;
            }
        }
    );


    if (
        distance >
        30
    ) {

        return;
    }


    pcDragging = {

        ring:
            pcActiveRing,

        index:
            best
    };


    pcCanvas.setPointerCapture(
        event.pointerId
    );
}


function moveHandle(
    event
) {

    if (
        !pcDragging
    ) {

        return;
    }


    const pointer =
        canvasPointer(
            event
        );


    const handle =

        pcHandles[
            pcDragging.ring
        ][
            pcDragging.index
        ];


    handle.x =
        pointer.x;


    handle.y =
        pointer.y;


    rebuildPCCalibration();


    showRecalibrationWarning(
        true
    );


    drawPCScene();
}


function endHandleDrag() {

    pcDragging =
        null;
}


function resetCalibrationHandles() {

    pcHandles = {

        outerDouble:
            [],

        innerDouble:
            [],

        outerTreble:
            [],

        innerTreble:
            [],

        bull:
            []
    };


    seedCalibrationHandles();


    drawPCScene();
}


/* =========================================================
   BUILD CALIBRATION
========================================================= */

function rebuildPCCalibration() {

    if (
        !pcHandles.outerDouble.length
    ) {

        return;
    }


    try {

        const destination =

            CALIBRATION_ANCHORS.map(
                anchor => {

                    const angle =

                        anchor.index *
                        18 *
                        Math.PI /
                        180;


                    return {

                        x:
                            Math.sin(
                                angle
                            ),

                        y:
                            -Math.cos(
                                angle
                            )
                    };
                }
            );


        const homography =
            computeLeastSquaresHomography(

                pcHandles.outerDouble,

                destination
            );


        const mappedBull =
            transformPoint(

                homography,

                pcHandles.bull[0]
            );


        function mappedPoint(
            handle
        ) {

            const transformed =
                transformPoint(

                    homography,
                    handle
                );


            return {

                x:

                    transformed.x -
                    mappedBull.x,

                y:

                    transformed.y -
                    mappedBull.y
            };
        }


        function mappedRadius(
            handle
        ) {

            const point =
                mappedPoint(
                    handle
                );


            return Math.hypot(
                point.x,
                point.y
            );
        }


        const scale =
            mean(

                pcHandles.outerDouble
                    .map(
                        mappedRadius
                    )
            );


        function ringRadius(
            ring
        ) {

            return (

                mean(

                    pcHandles[ring]
                        .map(
                            mappedRadius
                        )
                )

                /

                scale
            );
        }


        const rotationErrors =
            [];


        pcHandles.outerDouble
            .forEach(
                (
                    handle,
                    index
                ) => {

                    const point =
                        mappedPoint(
                            handle
                        );


                    const actual =
                        normaliseAngle(

                            Math.atan2(
                                point.x,
                                -point.y
                            )
                        );


                    const expected =

                        CALIBRATION_ANCHORS[
                            index
                        ].index

                        *

                        18

                        *

                        Math.PI /
                        180;


                    rotationErrors.push(

                        signedAngleDifference(
                            actual,
                            expected
                        )
                    );
                }
            );


        pcCalibration = {

            version:
                9,

            homography,

            centre:
                mappedBull,

            scale,

            imageWidth:
                pcImageWidth,

            imageHeight:
                pcImageHeight,

            zoom:
                Number(
                    pcPhoneZoom.value ||
                    1
                ),

            segmentOffset:
                circularMean(
                    rotationErrors
                ),

            rings: {

                outerDouble:
                    1,

                innerDouble:
                    ringRadius(
                        "innerDouble"
                    ),

                outerTreble:
                    ringRadius(
                        "outerTreble"
                    ),

                innerTreble:
                    ringRadius(
                        "innerTreble"
                    ),

                outerBull:
                    0.095,

                innerBull:
                    0.047
            },

            controlPoints:

                JSON.parse(
                    JSON.stringify(
                        pcHandles
                    )
                )
        };


    } catch (
        error
    ) {

        console.warn(
            error
        );


        pcCalibration =
            null;
    }
}


/* =========================================================
   BOARD -> IMAGE
========================================================= */

function boardToImage(
    x,
    y
) {

    if (
        !pcCalibration
    ) {

        return null;
    }


    const inverse =
        invert3x3(
            pcCalibration.homography
        );


    return transformPoint(

        inverse,

        {

            x:

                x *
                pcCalibration.scale

                +

                pcCalibration.centre.x,


            y:

                y *
                pcCalibration.scale

                +

                pcCalibration.centre.y
        }
    );
}


/* =========================================================
   DRAW
========================================================= */

function drawPCScene() {

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
        0,

        pcCanvas.width,
        pcCanvas.height
    );


    if (
        pcShowGrid &&
        pcCalibration
    ) {

        drawScoringGrid();
    }


    drawCalibrationHandles();


    drawLastImpactMarker();
}


function drawScoringGrid() {

    const rings =
        pcCalibration.rings;


    pcContext.strokeStyle =
        "#39ff86";


    pcContext.lineWidth =
        2.5;


    [

        rings.innerBull,
        rings.outerBull,
        rings.innerTreble,
        rings.outerTreble,
        rings.innerDouble,
        rings.outerDouble

    ].forEach(
        radius => {

            pcContext.beginPath();


            for (
                let degree = 0;
                degree <= 360;
                degree += 2
            ) {

                const angle =

                    degree *
                    Math.PI /
                    180;


                const point =
                    boardToImage(

                        Math.sin(
                            angle
                        )
                        *
                        radius,

                        -Math.cos(
                            angle
                        )
                        *
                        radius
                    );


                degree ===
                0

                    ?

                    pcContext.moveTo(
                        point.x,
                        point.y
                    )

                    :

                    pcContext.lineTo(
                        point.x,
                        point.y
                    );
            }


            pcContext.stroke();
        }
    );


    pcContext.strokeStyle =
        "#00aaff";


    pcContext.lineWidth =
        1.8;


    for (
        let index = 0;
        index < 20;
        index++
    ) {

        const angle =

            (
                index *
                18

                -

                9
            )

            *
            Math.PI /
            180

            +

            (
                pcCalibration.segmentOffset ||
                0
            );


        const inside =
            boardToImage(

                Math.sin(
                    angle
                )
                *
                rings.outerBull,

                -Math.cos(
                    angle
                )
                *
                rings.outerBull
            );


        const outside =
            boardToImage(

                Math.sin(
                    angle
                ),

                -Math.cos(
                    angle
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


function drawCalibrationHandles() {

    [
        "outerDouble",
        "innerDouble",
        "outerTreble",
        "innerTreble",
        "bull"
    ]
        .forEach(
            ring => {

                const active =
                    ring ===
                    pcActiveRing;


                pcHandles[
                    ring
                ]
                    .forEach(
                        handle => {

                            pcContext.beginPath();


                            pcContext.arc(

                                handle.x,
                                handle.y,

                                active
                                    ?
                                    9
                                    :
                                    5,

                                0,

                                Math.PI *
                                2
                            );


                            pcContext.fillStyle =
                                RING_COLOURS[
                                    ring
                                ];


                            pcContext.fill();


                            pcContext.strokeStyle =
                                "#000";


                            pcContext.lineWidth =
                                active
                                    ?
                                    3
                                    :
                                    1;


                            pcContext.stroke();


                            if (
                                active &&
                                ring !==
                                    "bull"
                            ) {

                                pcContext.fillStyle =
                                    "#fff";


                                pcContext.font =
                                    "bold 12px Arial";


                                pcContext.fillText(

                                    String(
                                        handle.number
                                    ),

                                    handle.x +
                                        10,

                                    handle.y -
                                        7
                                );
                            }
                        }
                    );
            }
        );
}


/* =========================================================
   IMPACT MARKER
========================================================= */

function drawLastImpactMarker() {

    if (
        !pcLastDetection ||
        !pcCalibration
    ) {

        return;
    }


    const point =
        boardToImage(

            Number(
                pcLastDetection.boardX
            ),

            Number(
                pcLastDetection.boardY
            )
        );


    if (
        !point
    ) {

        return;
    }


    pcContext.beginPath();


    pcContext.arc(

        point.x,
        point.y,

        18,

        0,

        Math.PI *
        2
    );


    pcContext.strokeStyle =
        "#ffff00";


    pcContext.lineWidth =
        5;


    pcContext.stroke();


    pcContext.beginPath();


    pcContext.arc(

        point.x,
        point.y,

        7,

        0,

        Math.PI *
        2
    );


    pcContext.fillStyle =
        "#ff2020";


    pcContext.fill();


    pcContext.strokeStyle =
        "#ffff00";


    pcContext.lineWidth =
        3;


    pcContext.beginPath();


    pcContext.moveTo(
        point.x -
            28,
        point.y
    );


    pcContext.lineTo(
        point.x +
            28,
        point.y
    );


    pcContext.moveTo(
        point.x,
        point.y -
            28
    );


    pcContext.lineTo(
        point.x,
        point.y +
            28
    );


    pcContext.stroke();


    const label =
        `${pcLastDetection.label} — ${pcLastDetection.score}`;


    pcContext.font =
        "bold 18px Arial";


    const width =
        pcContext.measureText(
            label
        ).width;


    pcContext.fillStyle =
        "rgba(0,0,0,0.85)";


    pcContext.fillRect(

        point.x +
            18,

        point.y -
            58,

        width +
            14,

        29
    );


    pcContext.fillStyle =
        "#ffff00";


    pcContext.fillText(

        label,

        point.x +
            25,

        point.y -
            36
    );
}


/* =========================================================
   CALIBRATION CONTROLS
========================================================= */

function toggleGrid() {

    pcShowGrid =
        !pcShowGrid;


    document
        .getElementById(
            "toggle-grid"
        )
        .textContent =

            pcShowGrid
                ?
                "👁 Hide Grid"
                :
                "👁 Show Grid";


    drawPCScene();
}


async function beginPCRecalibration() {

    await sendPhoneCommand(
        "begin-recalibration"
    );


    showRecalibrationWarning(
        true
    );


    pcShowGrid =
        true;


    await requestFreshFrame();


    setCalibrationStatus(
        "Recalibration mode ✓ Adjust points and save."
    );
}


function showRecalibrationWarning(
    visible
) {

    document
        .getElementById(
            "recalibration-warning"
        )
        .classList.toggle(
            "hidden",
            !visible
        );
}


/* =========================================================
   SAVE CALIBRATION
========================================================= */

async function savePCCalibration() {

    rebuildPCCalibration();


    if (
        !pcCalibration
    ) {

        alert(
            "Calibration is not ready."
        );


        return;
    }


    const rings =
        pcCalibration.rings;


    if (
        !(
            rings.innerTreble <
            rings.outerTreble

            &&

            rings.outerTreble <
            rings.innerDouble

            &&

            rings.innerDouble <
            rings.outerDouble
        )
    ) {

        alert(
            "Check the multiplier ring calibration."
        );


        return;
    }


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

        console.error(
            error
        );


        alert(
            "Could not save calibration."
        );


        return;
    }


    showRecalibrationWarning(
        false
    );


    setCalibrationStatus(
        "Calibration saved ✓"
    );
}


/* =========================================================
   PC DETECTIONS
========================================================= */

function subscribePCDatabase() {

    cameraSupabase

        .channel(
            `camera-results-${pcSession.id}`
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

                const detection =
                    payload.new
                        .last_detection;


                if (
                    detection?.timestamp
                ) {

                    showPCDetection(
                        detection
                    );
                }
            }
        )

        .subscribe();
}


function showPCDetection(
    detection
) {

    pcLastDetection =
        detection;


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

            `${detection.confidence}% confidence`

            +

            (
                detection.votes
                    ?
                    ` • ${detection.votes} votes`
                    :
                    ""
            );


    drawPCScene();
}


/* =========================================================
   PC STATUS
========================================================= */

function setCalibrationStatus(
    text
) {

    const element =
        document.getElementById(
            "calibration-status"
        );


    if (
        element
    ) {

        element.textContent =
            text;
    }
}


/* =========================================================
   START
========================================================= */

async function startDartHubCamera() {

    try {

        if (
            CAMERA_PAGE ===
            "phone"
        ) {

            await initialisePhone();
        }


        else if (
            CAMERA_PAGE ===
            "calibrate"
        ) {

            await initialisePC();
        }


    } catch (
        error
    ) {

        console.error(
            "Dart Hub camera:",
            error
        );
    }
}


startDartHubCamera();