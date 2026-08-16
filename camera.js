"use strict";


/* =========================================================
   DART HUB CAMERA V4
   LIVE PC CALIBRATION + DRAGGABLE RING HANDLES
   + EXPERIMENTAL DART IMPACT DETECTION
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
   DARTBOARD
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


/*
   Eight calibration directions.

   These are known dartboard segment centres
   distributed around the whole board.
*/

const CALIBRATION_ANCHORS = [

    {
        number: 20,
        index: 0
    },

    {
        number: 18,
        index: 2
    },

    {
        number: 6,
        index: 5
    },

    {
        number: 15,
        index: 7
    },

    {
        number: 3,
        index: 10
    },

    {
        number: 7,
        index: 12
    },

    {
        number: 11,
        index: 15
    },

    {
        number: 9,
        index: 17
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

            "Open normal Dart Hub in this browser and sign in first."
        );


        throw new Error(
            "Not signed in."
        );
    }


    return data.session.user;
}


/* =========================================================
   LINEAR ALGEBRA
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
        ] = [

            rows[pivot],
            rows[column]
        ];


        const divisor =
            rows[column][column];


        if (
            Math.abs(
                divisor
            ) <
            1e-10
        ) {

            throw new Error(
                "Calibration geometry is unstable."
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


/* =========================================================
   LEAST-SQUARES HOMOGRAPHY
========================================================= */

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


    /*
       Least squares:

       (Aᵀ A) h = Aᵀ b
    */

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
   SCORE BOARD POSITION
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
                "D" +
                number,

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
                "T" +
                number,

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


let phoneLiveTimer =
    null;


let phoneLiveFeed =
    false;


let phoneCalibration =
    null;


let phoneBaseline =
    null;


let phoneEmptyReference =
    null;


let phoneDetectionTimer =
    null;


let phoneDetecting =
    false;


let phoneStableFrames =
    0;


let phoneLastDifference =
    0;


let phoneDartsInVisit =
    0;


let phoneLastDetectionTime =
    0;


/* =========================================================
   PHONE INITIALISE
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
            captureBoardBaseline;


    document
        .getElementById(
            "stop-camera"
        )
        .onclick =
            stopPhoneCamera;


    await requireCameraLogin();


    setPhoneStatus(
        "Signed in ✓ Start the rear camera."
    );
}


/* =========================================================
   CAMERA
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
            "Camera ready. Put the phone in its final position now."
        );


    } catch (
        error
    ) {

        console.error(
            error
        );


        setPhoneStatus(
            "Camera could not start. Check Chrome camera permission."
        );
    }
}


/* =========================================================
   SESSION
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
                "toggle-live-feed"
            )
            .disabled =
                false;


        subscribePhoneDatabase();


        await openPhoneBroadcastChannel();


        startPhoneLiveFeed();


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
   PHONE BROADCAST
========================================================= */

async function openPhoneBroadcastChannel() {

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

            () => {

                sendLiveCameraFrame();
            }
        );


    await cameraChannel
        .subscribe();
}


/* =========================================================
   LIVE CAMERA FEED
========================================================= */

function togglePhoneLiveFeed() {

    if (
        phoneLiveFeed
    ) {

        stopPhoneLiveFeed();


    } else {

        startPhoneLiveFeed();
    }
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


    button.textContent =
        "📡 Live Calibration Feed ON";


    if (
        phoneLiveTimer
    ) {

        clearInterval(
            phoneLiveTimer
        );
    }


    sendLiveCameraFrame();


    phoneLiveTimer =
        setInterval(
            sendLiveCameraFrame,
            650
        );


    setPhoneStatus(
        "Live calibration feed running. Do not move the phone."
    );
}


function stopPhoneLiveFeed() {

    phoneLiveFeed =
        false;


    if (
        phoneLiveTimer
    ) {

        clearInterval(
            phoneLiveTimer
        );
    }


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
   CAPTURE PHONE IMAGE
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
            0.48
        );


    try {

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


    } catch (
        error
    ) {

        console.warn(
            "Camera frame:",
            error
        );
    }
}


/* =========================================================
   PHONE DATABASE LISTENER
========================================================= */

function subscribePhoneDatabase() {

    const channel =
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
                        calibration.version ===
                            4
                    ) {

                        phoneCalibration =
                            calibration;


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
                            "Calibration received ✓ Ready for scoring."
                        );
                    }
                }
            );


    channel.subscribe();
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


    setPhoneStatus(
        "Board baseline captured. Ready for Dart 1."
    );
}


/* =========================================================
   IMAGE DIFFERENCE
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

        phoneCalibration.imageWidth

        /

        width;


    const scaleY =

        phoneCalibration.imageHeight

        /

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
   CHANGED COMPONENTS
========================================================= */

function findComponents(
    pixels
) {

    const cellSize =
        4;


    const cells =
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


            cells.set(
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
        const startingKey
        of cells.keys()
    ) {

        if (
            visited.has(
                startingKey
            )
        ) {

            continue;
        }


        const queue = [
            startingKey
        ];


        const component =
            [];


        visited.add(
            startingKey
        );


        while (
            queue.length
        ) {

            const key =
                queue.pop();


            const pixel =
                cells.get(
                    key
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
                key
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
                        !dx &&
                        !dy
                    ) {

                        continue;
                    }


                    const neighbour =
                        `${x + dx},${y + dy}`;


                    if (
                        cells.has(
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
            component.length >
            6
        ) {

            components.push(
                component
            );
        }
    }


    return components.sort(
        (
            a,
            b
        ) =>
            b.length -
            a.length
    );
}


/* =========================================================
   PRINCIPAL AXIS
========================================================= */

function principalAxis(
    points
) {

    const centreX =
        mean(
            points.map(
                point =>
                    point.x
            )
        );


    const centreY =
        mean(
            points.map(
                point =>
                    point.y
            )
        );


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
                centreX;


            const y =
                point.y -
                centreY;


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

        centreX,

        centreY,

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
   FIND DART TIP
========================================================= */

function findImpactPoint(
    difference,
    width,
    height
) {

    const components =
        findComponents(
            difference.pixels
        );


    for (
        const component
        of components.slice(
            0,
            7
        )
    ) {

        const points =
            [];


        component.forEach(
            pixel => {

                const board =
                    imagePixelToBoard(

                        pixel.x,

                        pixel.y,

                        width,

                        height
                    );


                if (
                    Math.hypot(
                        board.x,
                        board.y
                    )
                    <=
                    1.10
                ) {

                    points.push(
                        board
                    );
                }
            }
        );


        if (
            points.length <
            12
        ) {

            continue;
        }


        const axis =
            principalAxis(
                points
            );


        const ordered =

            points
                .map(
                    point => ({

                        ...point,

                        projection:

                            (
                                point.x -
                                axis.centreX
                            )
                            *
                            axis.x

                            +

                            (
                                point.y -
                                axis.centreY
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
                        a.projection -
                        b.projection
                );


        const end1 =
            ordered[0];


        const end2 =
            ordered[
                ordered.length -
                1
            ];


        /*
           The impact end is normally the end
           closer to the board centre.

           This works well with a camera viewing
           the dart from outside the board.
        */

        const impact =

            Math.hypot(
                end1.x,
                end1.y
            )

            <

            Math.hypot(
                end2.x,
                end2.y
            )

                ? end1

                : end2;


        return impact;
    }


    return null;
}


/* =========================================================
   SCORE CONFIDENCE
========================================================= */

function scoreConfidence(
    x,
    y
) {

    const radius =
        Math.hypot(
            x,
            y
        );


    const rings =
        phoneCalibration.rings;


    const ringBoundaries = [

        rings.innerBull,

        rings.outerBull,

        rings.innerTreble,

        rings.outerTreble,

        rings.innerDouble,

        rings.outerDouble
    ];


    const nearestRing =

        Math.min(

            ...ringBoundaries.map(
                boundary =>
                    Math.abs(
                        radius -
                        boundary
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


    const section =
        Math.PI /
        10;


    const local =

        (
            angle +
            section /
            2
        )

        %

        section;


    const nearestSegment =

        Math.min(

            local,

            section -
            local
        );


    let confidence =
        96;


    if (
        nearestRing <
        0.02
    ) {

        confidence -=
            25;
    }


    if (
        nearestSegment <
        0.035
    ) {

        confidence -=
            25;
    }


    return clamp(
        Math.round(
            confidence
        ),
        40,
        98
    );
}


/* =========================================================
   DETECTION LOOP
========================================================= */

function startAutomaticDetection() {

    if (
        !phoneCalibration
    ) {

        alert(
            "Save calibration on the PC first."
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


    if (
        phoneDetectionTimer
    ) {

        clearInterval(
            phoneDetectionTimer
        );
    }


    phoneDetectionTimer =
        setInterval(
            detectionTick,
            350
        );
}


async function detectionTick() {

    if (
        !phoneDetecting ||
        !phoneBaseline
    ) {

        return;
    }


    const current =
        captureAnalysisFrame();


    /*
       THREE DARTS ON BOARD:
       wait for removal.
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


            setPhoneStatus(
                "Board cleared ✓ Ready for next player."
            );
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
       Person / arm moving in frame.
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
            "Movement detected…"
        );


        return;
    }


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

        setPhoneStatus(
            "Dart detected… waiting for it to settle."
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


    const impact =
        findImpactPoint(

            difference,

            current.width,

            current.height
        );


    if (
        !impact
    ) {

        setPhoneStatus(
            "Change detected but dart tip could not be identified."
        );


        return;
    }


    const result =
        scoreBoardPoint(

            impact.x,

            impact.y,

            phoneCalibration
        );


    const detection = {

        ...result,

        boardX:
            impact.x,

        boardY:
            impact.y,

        confidence:
            scoreConfidence(
                impact.x,
                impact.y
            ),

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


    phoneBaseline =
        cloneAnalysisFrame(
            current
        );


    setPhoneStatus(

        `Dart ${phoneDartsInVisit}: ` +

        `${detection.label} = ` +

        `${detection.score}`
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
   PHONE STOP
========================================================= */

function stopPhoneCamera() {

    phoneDetecting =
        false;


    stopPhoneLiveFeed();


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
   PC INITIALISE
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
            "reset-handles"
        )
        .onclick =
            resetCalibrationHandles;


    document
        .getElementById(
            "save-calibration"
        )
        .onclick =
            savePCCalibration;


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
   CONNECT PC
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


    document
        .getElementById(
            "calibration-tools"
        )
        .style
        .display =
            "block";


    document
        .getElementById(
            "calibration-area"
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


    setCalibrationStatus(
        "Connected ✓ Waiting for live feed…"
    );


    await openPCBroadcastChannel();


    subscribePCDatabase();


    requestFreshFrame();
}


/* =========================================================
   PC BROADCAST
========================================================= */

async function openPCBroadcastChannel() {

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

            message => {

                receiveLiveFrame(
                    message.payload
                );
            }
        );


    await cameraChannel
        .subscribe();
}


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


/* =========================================================
   RECEIVE LIVE FRAME
========================================================= */

function receiveLiveFrame(
    payload
) {

    if (
        !payload ||
        !payload.image
    ) {

        return;
    }


    const image =
        new Image();


    image.onload =
        () => {

            pcImage =
                image;


            const firstImage =
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
                firstImage
            ) {

                seedCalibrationHandles();
            }


            drawPCScene();


            document
                .getElementById(
                    "live-feed-status"
                )
                .textContent =
                    "● LIVE PHONE CAMERA";
        };


    image.src =
        payload.image;
}


/* =========================================================
   INITIAL HANDLE POSITIONS
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


/* =========================================================
   SELECT RING
========================================================= */

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


    const names = {

        outerDouble:
            "Drag each cyan point onto the OUTER edge of the double ring.",

        innerDouble:
            "Drag each purple point onto the INNER edge of the double ring.",

        outerTreble:
            "Drag each green point onto the OUTER edge of the treble ring.",

        innerTreble:
            "Drag each orange point onto the INNER edge of the treble ring.",

        bull:
            "Drag the pink point onto the exact centre of the bull."
    };


    document
        .getElementById(
            "calibration-help"
        )
        .textContent =
            names[ring];


    drawPCScene();
}


/* =========================================================
   POINTER COORDINATE
========================================================= */

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


/* =========================================================
   DRAG HANDLES
========================================================= */

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


    let bestIndex =
        -1;


    let bestDistance =
        Infinity;


    handles.forEach(
        (
            handle,
            index
        ) => {

            const distance =
                Math.hypot(

                    pointer.x -
                    handle.x,

                    pointer.y -
                    handle.y
                );


            if (
                distance <
                bestDistance
            ) {

                bestDistance =
                    distance;


                bestIndex =
                    index;
            }
        }
    );


    if (
        bestDistance >
        30
    ) {

        return;
    }


    pcDragging = {

        ring:
            pcActiveRing,

        index:
            bestIndex
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


    /*
       The whole preview changes immediately.
    */

    rebuildPCCalibration();


    drawPCScene();
}


function endHandleDrag() {

    pcDragging =
        null;
}


/* =========================================================
   RESET HANDLES
========================================================= */

function resetCalibrationHandles() {

    if (
        !pcImageWidth
    ) {

        return;
    }


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

        /*
           OUTER DOUBLE HANDLES DEFINE
           PERSPECTIVE + ROTATION.
        */

        const source =
            pcHandles.outerDouble;


        const destination =

            CALIBRATION_ANCHORS
                .map(
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

                source,

                destination
            );


        const mappedBull =
            transformPoint(

                homography,

                pcHandles.bull[0]
            );


        function mappedRadius(
            handle
        ) {

            const point =
                transformPoint(

                    homography,

                    handle
                );


            return Math.hypot(

                point.x -
                mappedBull.x,

                point.y -
                mappedBull.y
            );
        }


        const outerDoubleRaw =
            pcHandles.outerDouble
                .map(
                    mappedRadius
                );


        const scale =
            mean(
                outerDoubleRaw
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


        pcCalibration = {

            version:
                4,

            homography,

            centre:
                mappedBull,

            scale,

            imageWidth:
                pcImageWidth,

            imageHeight:
                pcImageHeight,

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

                /*
                   Bull can be tuned later.
                */

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

        pcCalibration =
            null;


        console.warn(
            "Calibration:",
            error
        );
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


    const mapped = {

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
    };


    return transformPoint(
        inverse,
        mapped
    );
}


/* =========================================================
   DRAW LIVE IMAGE + GRID
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
}


/* =========================================================
   DRAW SCORING GRID
========================================================= */

function drawScoringGrid() {

    const rings =
        pcCalibration.rings;


    const ringValues = [

        rings.innerBull,

        rings.outerBull,

        rings.innerTreble,

        rings.outerTreble,

        rings.innerDouble,

        rings.outerDouble
    ];


    pcContext.lineWidth =
        2.5;


    pcContext.strokeStyle =
        "#39ff86";


    ringValues.forEach(
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


                if (
                    !point
                ) {

                    continue;
                }


                if (
                    degree ===
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


            pcContext.stroke();
        }
    );


    /*
       20 segment boundaries.
    */

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
            180;


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


/* =========================================================
   DRAW HANDLES
========================================================= */

function drawCalibrationHandles() {

    const rings = [

        "outerDouble",

        "innerDouble",

        "outerTreble",

        "innerTreble",

        "bull"
    ];


    rings.forEach(
        ring => {

            const active =
                ring ===
                pcActiveRing;


            const colour =
                RING_COLOURS[
                    ring
                ];


            pcHandles[
                ring
            ]
                .forEach(
                    (
                        handle,
                        index
                    ) => {

                        pcContext.beginPath();


                        pcContext.arc(

                            handle.x,
                            handle.y,

                            active
                                ? 9
                                : 5,

                            0,

                            Math.PI *
                            2
                        );


                        pcContext.fillStyle =
                            colour;


                        pcContext.fill();


                        pcContext.lineWidth =
                            active
                                ? 3
                                : 1;


                        pcContext.strokeStyle =
                            "#000000";


                        pcContext.stroke();


                        if (
                            active &&
                            ring !==
                            "bull"
                        ) {

                            pcContext.fillStyle =
                                "#ffffff";


                            pcContext.font =
                                "bold 13px Arial";


                            pcContext.fillText(

                                String(
                                    handle.number
                                ),

                                handle.x +
                                    11,

                                handle.y -
                                    8
                            );
                        }
                    }
                );
        }
    );
}


/* =========================================================
   GRID TOGGLE
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

                ? "👁 Hide Grid"

                : "👁 Show Grid";


    drawPCScene();
}


/* =========================================================
   SAVE PC CALIBRATION
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

            "One or more rings are out of order. " +

            "Check the calibration handles."
        );


        return;
    }


    try {

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


        setCalibrationStatus(

            "Calibration saved ✓ " +

            "The phone is ready for dart detection."
        );


    } catch (
        error
    ) {

        console.error(
            error
        );


        alert(
            "Could not save calibration."
        );
    }
}


/* =========================================================
   PC DATABASE DETECTION LISTENER
========================================================= */

function subscribePCDatabase() {

    const channel =
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
                        detection &&
                        detection.timestamp
                    ) {

                        showPCDetection(
                            detection
                        );
                    }
                }
            );


    channel.subscribe();
}


/* =========================================================
   PC DETECTION
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
   START CAMERA SYSTEM
========================================================= */

async function startDartHubCamera() {

    try {

        if (
            CAMERA_PAGE ===
            "phone"
        ) {

            await initialisePhone();
        }


        if (
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