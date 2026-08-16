"use strict";


/* =========================================================
   DART HUB CAMERA
   17 POINT CALIBRATION + DART IMPACT DETECTION
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
   BOARD ORDER
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


/* =========================================================
   17 CALIBRATION POINTS
========================================================= */

const CALIBRATION_POINTS = [

    {
        key: "bull",
        label: "Bull centre"
    },


    {
        key: "20_ti",
        label: "20 – treble INNER edge"
    },

    {
        key: "20_to",
        label: "20 – treble OUTER edge"
    },

    {
        key: "20_di",
        label: "20 – double INNER edge"
    },

    {
        key: "20_do",
        label: "20 – double OUTER edge"
    },


    {
        key: "6_ti",
        label: "6 – treble INNER edge"
    },

    {
        key: "6_to",
        label: "6 – treble OUTER edge"
    },

    {
        key: "6_di",
        label: "6 – double INNER edge"
    },

    {
        key: "6_do",
        label: "6 – double OUTER edge"
    },


    {
        key: "3_ti",
        label: "3 – treble INNER edge"
    },

    {
        key: "3_to",
        label: "3 – treble OUTER edge"
    },

    {
        key: "3_di",
        label: "3 – double INNER edge"
    },

    {
        key: "3_do",
        label: "3 – double OUTER edge"
    },


    {
        key: "14_ti",
        label: "14 – treble INNER edge"
    },

    {
        key: "14_to",
        label: "14 – treble OUTER edge"
    },

    {
        key: "14_di",
        label: "14 – double INNER edge"
    },

    {
        key: "14_do",
        label: "14 – double OUTER edge"
    }

];


/* =========================================================
   HELPERS
========================================================= */

function clamp(
    value,
    minimum,
    maximum
) {

    return Math.max(
        minimum,
        Math.min(
            maximum,
            value
        )
    );
}


function average(
    values
) {

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


function pointRadius(
    point
) {

    return Math.hypot(
        point.x,
        point.y
    );
}


/* =========================================================
   LOGIN
========================================================= */

async function requireLogin() {

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
            "Sign in to normal Dart Hub in this browser first, then reopen this camera page."
        );


        throw new Error(
            "No Dart Hub login session."
        );
    }


    return data.session.user;
}


/* =========================================================
   LINEAR SOLVER
========================================================= */

function solveLinearSystem(
    matrix,
    values
) {

    const n =
        values.length;


    const data =
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
                    data[row][column]
                )
                >
                Math.abs(
                    data[pivot][column]
                )
            ) {

                pivot =
                    row;
            }
        }


        [
            data[column],
            data[pivot]
        ] = [

            data[pivot],
            data[column]
        ];


        const divisor =
            data[column][column];


        if (
            Math.abs(
                divisor
            ) <
            0.000000001
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

            data[column][j] /=
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
                data[row][column];


            for (
                let j =
                    column;
                j <= n;
                j++
            ) {

                data[row][j] -=
                    factor *
                    data[column][j];
            }
        }
    }


    return data.map(
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


    const B =
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


        B.push(
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


        B.push(
            Y
        );
    }


    const h =
        solveLinearSystem(
            A,
            B
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


/* =========================================================
   MATRIX INVERSE
========================================================= */

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
   SCORE A BOARD POSITION
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
        rings.doubleOuter
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
            index
        ];


    let multiplier =
        1;


    let prefix =
        "";


    if (
        radius >=
            rings.doubleInner

        &&

        radius <=
            rings.doubleOuter
    ) {

        multiplier =
            2;


        prefix =
            "D";
    }


    else if (
        radius >=
            rings.trebleInner

        &&

        radius <=
            rings.trebleOuter
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


let phoneBaseline =
    null;


let phoneEmptyReference =
    null;


let phoneDetecting =
    false;


let phoneDetectionTimer =
    null;


let phoneDartsInVisit =
    0;


let phoneStableFrames =
    0;


let phoneLastDifference =
    0;


let phoneLastPublishedAt =
    0;


/* =========================================================
   PHONE STARTUP
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


    await requireLogin();


    setPhoneStatus(
        "Ready. Tap Start Camera."
    );
}


/* =========================================================
   OPEN CAMERA
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
            "Camera ready. Position the phone and do not move it."
        );


    } catch (
        error
    ) {

        console.error(
            error
        );


        setPhoneStatus(
            "Could not open camera. Check camera permission in Chrome."
        );
    }
}


/* =========================================================
   CREATE CAMERA SESSION
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
   CAPTURE FRAME
========================================================= */

function capturePhoneFrame(
    maxWidth =
        1280
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


/* =========================================================
   SEND FROZEN CALIBRATION IMAGE
========================================================= */

async function sendCalibrationSnapshot() {

    if (
        !cameraSession
    ) {

        return;
    }


    const frame =
        capturePhoneFrame(
            1280
        );


    const jpeg =
        phoneCanvas.toDataURL(
            "image/jpeg",
            0.78
        );


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

        console.error(
            error
        );


        setPhoneStatus(
            "Could not send calibration picture."
        );


        return;
    }


    setPhoneStatus(
        "Picture sent. Calibrate all 17 points on the PC."
    );
}


/* =========================================================
   RECEIVE CALIBRATION
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
                        row.calibration.version ===
                            2
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
                            "17-point calibration received ✓ Ready to detect darts."
                        );
                    }
                }
            )

            .subscribe();
}


/* =========================================================
   GREYSCALE
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

        i <
        source.length;

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


function cloneFrame(
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
   EMPTY BOARD / CURRENT BOARD
========================================================= */

function captureEmptyBaseline() {

    const frame =
        captureAnalysisGrey();


    phoneBaseline =
        cloneFrame(
            frame
        );


    phoneEmptyReference =
        cloneFrame(
            frame
        );


    phoneDartsInVisit =
        0;


    phoneStableFrames =
        0;


    phoneLastDifference =
        0;


    setPhoneStatus(
        "Baseline captured. Board is armed."
    );
}


/* =========================================================
   START DETECTION
========================================================= */

function startAutomaticDetection() {

    if (
        !phoneCalibration
    ) {

        alert(
            "Save the 17-point calibration on the PC first."
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
            350
        );
}


/* =========================================================
   FRAME DIFFERENCE
========================================================= */

function frameDifference(
    previous,
    current,
    threshold =
        34,
    stride =
        2
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

        pixels,

        count
    };
}


/* =========================================================
   IMAGE -> BOARD COORDINATE
========================================================= */

function transformedPixel(
    pixel,
    analysisWidth,
    analysisHeight
) {

    const scaleX =

        phoneCalibration.imageWidth

        /

        analysisWidth;


    const scaleY =

        phoneCalibration.imageHeight

        /

        analysisHeight;


    const transformed =
        transformPoint(

            phoneCalibration.homography,

            {

                x:
                    pixel.x *
                    scaleX,

                y:
                    pixel.y *
                    scaleY
            }
        );


    return {

        x:

            (
                transformed.x -
                phoneCalibration.bullOffset.x
            )

            /

            phoneCalibration.scale,


        y:

            (
                transformed.y -
                phoneCalibration.bullOffset.y
            )

            /

            phoneCalibration.scale
    };
}


/* =========================================================
   CONNECTED CHANGED AREAS
========================================================= */

function findConnectedComponents(
    pixels,
    cellSize =
        4
) {

    const map =
        new Map();


    pixels.forEach(
        pixel => {

            const x =
                Math.floor(
                    pixel.x /
                    cellSize
                );


            const y =
                Math.floor(
                    pixel.y /
                    cellSize
                );


            map.set(
                `${x},${y}`,
                pixel
            );
        }
    );


    const visited =
        new Set();


    const components =
        [];


    for (
        const key
        of map.keys()
    ) {

        if (
            visited.has(
                key
            )
        ) {

            continue;
        }


        const queue = [
            key
        ];


        const component =
            [];


        visited.add(
            key
        );


        while (
            queue.length
        ) {

            const currentKey =
                queue.pop();


            const pixel =
                map.get(
                    currentKey
                );


            if (
                pixel
            ) {

                component.push(
                    pixel
                );
            }


            const [
                x,
                y
            ] =
                currentKey
                    .split(
                        ","
                    )
                    .map(
                        Number
                    );


            for (
                let dx = -1;
                dx <= 1;
                dx++
            ) {

                for (
                    let dy = -1;
                    dy <= 1;
                    dy++
                ) {

                    if (
                        dx === 0 &&
                        dy === 0
                    ) {

                        continue;
                    }


                    const neighbour =
                        `${x + dx},${y + dy}`;


                    if (
                        map.has(
                            neighbour
                        ) &&
                        !visited.has(
                            neighbour
                        )
                    ) {

                        visited.add(
                            neighbour
                        );


                        queue.push(
                            neighbour
                        );
                    }
                }
            }
        }


        if (
            component.length >=
            6
        ) {

            components.push(
                component
            );
        }
    }


    components.sort(
        (
            a,
            b
        ) =>
            b.length -
            a.length
    );


    return components;
}


/* =========================================================
   PRINCIPAL DART AXIS
========================================================= */

function principalAxis(
    points
) {

    let meanX =
        0;


    let meanY =
        0;


    points.forEach(
        point => {

            meanX +=
                point.x;


            meanY +=
                point.y;
        }
    );


    meanX /=
        points.length;


    meanY /=
        points.length;


    let xx =
        0;


    let yy =
        0;


    let xy =
        0;


    points.forEach(
        point => {

            const x =
                point.x -
                meanX;


            const y =
                point.y -
                meanY;


            xx +=
                x * x;


            yy +=
                y * y;


            xy +=
                x * y;
        }
    );


    const angle =

        0.5 *

        Math.atan2(
            2 * xy,
            xx - yy
        );


    return {

        meanX,

        meanY,

        x:
            Math.cos(
                angle
            ),

        y:
            Math.sin(
                angle
            )
    };
}


/* =========================================================
   FIND DART IMPACT END
========================================================= */

function estimateImpactFromComponent(
    component,
    analysisWidth,
    analysisHeight
) {

    const boardPixels =
        [];


    component.forEach(
        pixel => {

            const boardPoint =
                transformedPixel(

                    pixel,

                    analysisWidth,

                    analysisHeight
                );


            const radius =
                Math.hypot(

                    boardPoint.x,

                    boardPoint.y
                );


            if (
                radius <=
                1.10
            ) {

                boardPixels.push({

                    ...boardPoint,

                    source:
                        pixel
                });
            }
        }
    );


    if (
        boardPixels.length <
        12
    ) {

        return null;
    }


    const axis =
        principalAxis(
            boardPixels
        );


    const projected =

        boardPixels
            .map(
                point => ({

                    ...point,

                    position:

                        (
                            point.x -
                            axis.meanX
                        )
                        *
                        axis.x

                        +

                        (
                            point.y -
                            axis.meanY
                        )
                        *
                        axis.y
                })
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    a.position -
                    b.position
            );


    const endA =
        projected[0];


    const endB =
        projected[
            projected.length -
            1
        ];


    function density(
        candidate
    ) {

        let count =
            0;


        boardPixels.forEach(
            point => {

                if (
                    Math.hypot(

                        point.x -
                        candidate.x,

                        point.y -
                        candidate.y

                    ) <
                    0.075
                ) {

                    count++;
                }
            }
        );


        return count;
    }


    const densityA =
        density(
            endA
        );


    const densityB =
        density(
            endB
        );


    let impact;


    if (
        Math.abs(
            densityA -
            densityB
        ) >=
        4
    ) {

        impact =

            densityA >
            densityB

                ? endA

                : endB;
    }


    else {

        impact =

            Math.hypot(
                endA.x,
                endA.y
            )
            <
            Math.hypot(
                endB.x,
                endB.y
            )

                ? endA

                : endB;
    }


    return {

        x:
            impact.x,

        y:
            impact.y,

        componentSize:
            component.length,

        boardPixels:
            boardPixels.length
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
        Math.hypot(
            x,
            y
        );


    const rings =
        calibration.rings;


    const boundaries = [

        rings.innerBull,

        rings.outerBull,

        rings.trebleInner,

        rings.trebleOuter,

        rings.doubleInner,

        rings.doubleOuter

    ];


    const ringDistance =

        Math.min(

            ...boundaries.map(
                value =>
                    Math.abs(
                        radius -
                        value
                    )
            )
        );


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


    const position =

        (
            angle +
            segmentWidth /
            2
        )

        %

        segmentWidth;


    const segmentDistance =

        Math.min(

            position,

            segmentWidth -
            position
        );


    let confidence =
        96;


    if (
        ringDistance <
        0.012
    ) {

        confidence -=
            35;
    }


    else if (
        ringDistance <
        0.025
    ) {

        confidence -=
            18;
    }


    if (
        segmentDistance <
        0.025
    ) {

        confidence -=
            35;
    }


    else if (
        segmentDistance <
        0.05
    ) {

        confidence -=
            15;
    }


    return clamp(
        Math.round(
            confidence
        ),
        35,
        98
    );
}


/* =========================================================
   ESTIMATE DART
========================================================= */

function estimateDartImpact(
    difference,
    width,
    height
) {

    const components =
        findConnectedComponents(
            difference.pixels
        );


    for (
        const component
        of components.slice(
            0,
            8
        )
    ) {

        const impact =
            estimateImpactFromComponent(

                component,

                width,

                height
            );


        if (
            !impact
        ) {

            continue;
        }


        const result =
            scoreBoardPoint(

                impact.x,

                impact.y,

                phoneCalibration
            );


        if (
            result.label ===
                "Miss"

            &&

            Math.hypot(
                impact.x,
                impact.y
            ) >
            1.04
        ) {

            continue;
        }


        return {

            ...result,

            boardX:
                impact.x,

            boardY:
                impact.y,

            confidence:
                estimateScoreConfidence(

                    impact.x,

                    impact.y,

                    phoneCalibration
                ),

            timestamp:
                Date.now(),

            dartNumber:
                phoneDartsInVisit +
                1,

            componentSize:
                impact.componentSize
        };
    }


    return null;
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
       AFTER THREE DARTS
       WAIT FOR BOARD TO CLEAR
    */

    if (
        phoneDartsInVisit >=
        3
    ) {

        const clearDifference =
            frameDifference(

                phoneEmptyReference,

                current,

                30,

                2
            );


        if (
            clearDifference &&
            clearDifference.count <
            300
        ) {

            phoneBaseline =
                cloneFrame(
                    current
                );


            phoneEmptyReference =
                cloneFrame(
                    current
                );


            phoneDartsInVisit =
                0;


            setPhoneStatus(
                "Darts removed. Ready for next visit."
            );
        }


        return;
    }


    const difference =
        frameDifference(

            phoneBaseline,

            current,

            34,

            2
        );


    if (
        !difference
    ) {

        return;
    }


    /*
       BIG MOVEMENT =
       HAND / THROW / PLAYER
    */

    if (
        difference.count >
        18000
    ) {

        phoneStableFrames =
            0;


        phoneLastDifference =
            difference.count;


        setPhoneStatus(
            "Movement detected… waiting for dart to settle."
        );


        return;
    }


    /*
       VERY LITTLE CHANGE =
       NOTHING NEW
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


    /*
       WAIT UNTIL DART STOPS MOVING
    */

    const delta =
        Math.abs(

            difference.count -
            phoneLastDifference
        );


    phoneLastDifference =
        difference.count;


    if (
        delta <
        260
    ) {

        phoneStableFrames++;
    }


    else {

        phoneStableFrames =
            0;
    }


    if (
        phoneStableFrames <
        3
    ) {

        setPhoneStatus(
            "Waiting for dart to settle…"
        );


        return;
    }


    /*
       PREVENT DOUBLE-DETECTION
    */

    if (
        Date.now() -
        phoneLastPublishedAt <
        1200
    ) {

        return;
    }


    const detection =
        estimateDartImpact(

            difference,

            current.width,

            current.height
        );


    if (
        !detection
    ) {

        setPhoneStatus(
            "Dart-like change seen, but impact point is unclear."
        );


        return;
    }


    await publishDetection(
        detection
    );


    phoneLastPublishedAt =
        Date.now();


    phoneBaseline =
        cloneFrame(
            current
        );


    phoneDartsInVisit++;


    phoneStableFrames =
        0;


    setPhoneStatus(

        `Dart ${phoneDartsInVisit} detected: ` +

        `${detection.label} (${detection.score})`
    );
}


/* =========================================================
   SEND DETECTION TO PC
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
}


/* =========================================================
   PHONE STATUS
========================================================= */

function setPhoneStatus(
    message
) {

    const element =
        document.getElementById(
            "phone-status"
        );


    if (
        element
    ) {

        element.textContent =
            message;
    }
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
    }


    phoneDetectionTimer =
        null;


    if (
        phoneStream
    ) {

        phoneStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );
    }


    phoneStream =
        null;


    setPhoneStatus(
        "Camera stopped."
    );
}


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


let pcCalibration =
    null;


let pcShowGrid =
    false;


/* =========================================================
   PC STARTUP
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


    await requireLogin();
}


/* =========================================================
   CONNECT TO PHONE
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

        console.error(
            error
        );


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
            "calibration-summary"
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
    }


    else {

        setCurrentInstruction(
            "Press Send Calibration Picture on the phone."
        );
    }


    subscribePCSession();
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


                        pcPoints =
                            [];


                        pcCalibration =
                            null;


                        pcShowGrid =
                            false;


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
   LOAD FROZEN IMAGE
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


            updateInstruction();


            updatePointList();
        };


    pcImage.src =
        source;
}


/* =========================================================
   CLICK CALIBRATION POINT
========================================================= */

function addCalibrationPoint(
    event
) {

    if (
        !pcImage ||
        pcPoints.length >=
        CALIBRATION_POINTS.length
    ) {

        return;
    }


    const rect =
        pcCanvas.getBoundingClientRect();


    const definition =
        CALIBRATION_POINTS[
            pcPoints.length
        ];


    pcPoints.push({

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
            rect.height,


        key:
            definition.key,

        label:
            definition.label
    });


    pcCalibration =
        null;


    pcShowGrid =
        false;


    drawCalibration();


    updateInstruction();


    updatePointList();
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


    pcCalibration =
        null;


    pcShowGrid =
        false;


    drawCalibration();


    updateInstruction();


    updatePointList();
}


function resetCalibrationPoints() {

    pcPoints =
        [];


    pcCalibration =
        null;


    pcShowGrid =
        false;


    drawCalibration();


    updateInstruction();


    updatePointList();
}


/* =========================================================
   INSTRUCTION
========================================================= */

function updateInstruction() {

    if (
        pcPoints.length <
        CALIBRATION_POINTS.length
    ) {

        setCurrentInstruction(

            `${pcPoints.length + 1}/17: Click ` +

            CALIBRATION_POINTS[
                pcPoints.length
            ].label
        );
    }


    else {

        setCurrentInstruction(
            "17/17 complete. Click Preview Grid."
        );
    }
}


/* =========================================================
   POINT LIST
========================================================= */

function updatePointList() {

    const element =
        document.getElementById(
            "point-list"
        );


    if (
        !element
    ) {

        return;
    }


    element.innerHTML =

        CALIBRATION_POINTS
            .map(
                (
                    definition,
                    index
                ) => `

                    <div
                        class="point-row ${
                            pcPoints[index]
                                ? "done"
                                : ""
                        }"
                    >

                        <span>
                            ${index + 1}
                        </span>


                        <strong>

                            ${definition.label}

                        </strong>


                        <em>

                            ${
                                pcPoints[index]
                                    ? "✓"
                                    : ""
                            }

                        </em>

                    </div>
                `
            )
            .join(
                ""
            );
}


/* =========================================================
   BUILD 17 POINT CALIBRATION
========================================================= */

function buildPCCalibration() {

    if (
        pcPoints.length !==
        17
    ) {

        throw new Error(
            "Set all 17 calibration points first."
        );
    }


    const byKey =
        Object.fromEntries(

            pcPoints.map(
                point => [

                    point.key,
                    point
                ]
            )
        );


    /*
       OUTER DOUBLE CENTRES:

       20 = TOP
       6  = RIGHT
       3  = BOTTOM
       14 = LEFT
    */

    const source = [

        byKey["20_do"],

        byKey["6_do"],

        byKey["3_do"],

        byKey["14_do"]

    ];


    const destination = [

        {
            x: 0,
            y: -1
        },

        {
            x: 1,
            y: 0
        },

        {
            x: 0,
            y: 1
        },

        {
            x: -1,
            y: 0
        }

    ];


    const homography =
        computeHomography(

            source,

            destination
        );


    const bullRaw =
        transformPoint(

            homography,

            byKey.bull
        );


    function normalisedPoint(
        point
    ) {

        const transformed =
            transformPoint(

                homography,

                point
            );


        return {

            x:

                transformed.x -
                bullRaw.x,

            y:

                transformed.y -
                bullRaw.y
        };
    }


    const outerDoubleRadii =

        [
            "20_do",
            "6_do",
            "3_do",
            "14_do"
        ]

            .map(
                key =>
                    pointRadius(

                        normalisedPoint(
                            byKey[key]
                        )
                    )
            );


    const scale =
        average(
            outerDoubleRadii
        );


    function ringRadius(
        key
    ) {

        return (

            pointRadius(

                normalisedPoint(
                    byKey[key]
                )
            )

            /

            scale
        );
    }


    const rings = {

        trebleInner:

            average(

                [
                    "20_ti",
                    "6_ti",
                    "3_ti",
                    "14_ti"
                ]

                    .map(
                        ringRadius
                    )
            ),


        trebleOuter:

            average(

                [
                    "20_to",
                    "6_to",
                    "3_to",
                    "14_to"
                ]

                    .map(
                        ringRadius
                    )
            ),


        doubleInner:

            average(

                [
                    "20_di",
                    "6_di",
                    "3_di",
                    "14_di"
                ]

                    .map(
                        ringRadius
                    )
            ),


        doubleOuter:

            average(

                [
                    "20_do",
                    "6_do",
                    "3_do",
                    "14_do"
                ]

                    .map(
                        ringRadius
                    )
            ),


        /*
           Bull currently inferred relative to board.
           We can add bull-edge calibration later.
        */

        outerBull:
            0.09,

        innerBull:
            0.045
    };


    return {

        version:
            2,

        points:
            pcPoints,

        homography,

        bullOffset:
            bullRaw,

        scale,

        imageWidth:
            pcCanvas.width,

        imageHeight:
            pcCanvas.height,

        rings,

        createdAt:
            new Date()
                .toISOString()
    };
}


/* =========================================================
   PREVIEW GRID
========================================================= */

function previewCalibration() {

    try {

        pcCalibration =
            buildPCCalibration();


        pcShowGrid =
            true;


        drawCalibration();


        renderCalibrationSummary();


        setCurrentInstruction(
            "Check every green ring and blue segment line carefully. Undo and re-click any inaccurate point."
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
   BOARD -> CAMERA
========================================================= */

function boardToCameraPoint(
    x,
    y
) {

    const inverse =
        invert3x3(
            pcCalibration.homography
        );


    const raw = {

        x:

            x *
            pcCalibration.scale

            +

            pcCalibration.bullOffset.x,


        y:

            y *
            pcCalibration.scale

            +

            pcCalibration.bullOffset.y
    };


    return transformPoint(
        inverse,
        raw
    );
}


/* =========================================================
   DRAW CALIBRATION
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


    pcPoints.forEach(
        (
            point,
            index
        ) => {

            pcContext.beginPath();


            pcContext.arc(

                point.x,
                point.y,

                8,

                0,
                Math.PI * 2
            );


            pcContext.fillStyle =

                index ===
                0

                    ? "#ff00ff"

                    : "#00ffff";


            pcContext.fill();


            pcContext.strokeStyle =
                "#000";


            pcContext.lineWidth =
                2;


            pcContext.stroke();


            pcContext.fillStyle =
                "#ffffff";


            pcContext.font =
                "bold 15px Arial";


            pcContext.fillText(

                `${index + 1} ${point.key.toUpperCase()}`,

                point.x +
                    10,

                point.y -
                    9
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
   DRAW SCORING GRID
========================================================= */

function drawVirtualBoardGrid() {

    const rings =
        pcCalibration.rings;


    pcContext.strokeStyle =
        "#00ff77";


    pcContext.lineWidth =
        3;


    const radii = [

        rings.innerBull,

        rings.outerBull,

        rings.trebleInner,

        rings.trebleOuter,

        rings.doubleInner,

        rings.doubleOuter

    ];


    radii.forEach(
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
                    boardToCameraPoint(

                        Math.sin(
                            angle
                        ) *
                        radius,

                        -Math.cos(
                            angle
                        ) *
                        radius
                    );


                if (
                    degree ===
                    0
                ) {

                    pcContext.moveTo(

                        point.x,
                        point.y
                    );
                }


                else {

                    pcContext.lineTo(

                        point.x,
                        point.y
                    );
                }
            }


            pcContext.stroke();
        }
    );


    pcContext.strokeStyle =
        "#00aaff";


    pcContext.lineWidth =
        2;


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
            180;


        const inside =
            boardToCameraPoint(

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
            boardToCameraPoint(

                Math.sin(
                    angle
                )
                *
                rings.doubleOuter,

                -Math.cos(
                    angle
                )
                *
                rings.doubleOuter
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
   CALIBRATION SUMMARY
========================================================= */

function renderCalibrationSummary() {

    const element =
        document.getElementById(
            "ring-values"
        );


    if (
        !element ||
        !pcCalibration
    ) {

        return;
    }


    const rings =
        pcCalibration.rings;


    element.innerHTML = `

        <div>

            Treble inner

            <strong>
                ${rings.trebleInner.toFixed(4)}
            </strong>

        </div>


        <div>

            Treble outer

            <strong>
                ${rings.trebleOuter.toFixed(4)}
            </strong>

        </div>


        <div>

            Double inner

            <strong>
                ${rings.doubleInner.toFixed(4)}
            </strong>

        </div>


        <div>

            Double outer

            <strong>
                ${rings.doubleOuter.toFixed(4)}
            </strong>

        </div>
    `;
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


        pcShowGrid =
            true;


        drawCalibration();


        renderCalibrationSummary();


        setCurrentInstruction(
            "Calibration saved ✓ The phone can now start automatic dart detection."
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
   PC LIVE DETECTION
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

            `${detection.confidence}% confidence` +

            ` • impact (` +

            `${Number(detection.boardX).toFixed(3)}, ` +

            `${Number(detection.boardY).toFixed(3)})`;
}


/* =========================================================
   STATUS
========================================================= */

function setCalibrationStatus(
    message
) {

    const element =
        document.getElementById(
            "calibration-status"
        );


    if (
        element
    ) {

        element.textContent =
            message;
    }
}


function setCurrentInstruction(
    message
) {

    const element =
        document.getElementById(
            "current-point"
        );


    if (
        element
    ) {

        element.textContent =
            message;
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

            await initialiseCameraPhone();
        }


        else if (
            CAMERA_PAGE ===
            "calibrate"
        ) {

            await initialiseCalibrationPC();
        }


    } catch (
        error
    ) {

        console.error(
            "Dart Hub camera startup error:",
            error
        );
    }
}


startDartHubCamera();