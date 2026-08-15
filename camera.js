(() => {

    "use strict";


    /* =====================================================
       DOM
    ===================================================== */

    const video =
        document.getElementById(
            "camera-video"
        );

    const overlay =
        document.getElementById(
            "camera-overlay"
        );

    const placeholder =
        document.getElementById(
            "camera-placeholder"
        );

    const startCameraBtn =
        document.getElementById(
            "start-camera"
        );

    const stopCameraBtn =
        document.getElementById(
            "stop-camera"
        );

    const cameraStatus =
        document.getElementById(
            "camera-status"
        );

    const startCalibrationBtn =
        document.getElementById(
            "start-calibration"
        );

    const clearCalibrationBtn =
        document.getElementById(
            "clear-calibration"
        );

    const calibrationStatus =
        document.getElementById(
            "calibration-status"
        );

    const captureEmptyBtn =
        document.getElementById(
            "capture-empty-board"
        );

    const referenceStatus =
        document.getElementById(
            "reference-status"
        );

    const detectDartBtn =
        document.getElementById(
            "detect-dart"
        );

    const detectionResult =
        document.getElementById(
            "camera-detection-result"
        );

    const detectedSegmentDisplay =
        document.getElementById(
            "detected-segment"
        );

    const detectedPointsDisplay =
        document.getElementById(
            "detected-points"
        );

    const confirmDetectionBtn =
        document.getElementById(
            "confirm-detection"
        );

    const rejectDetectionBtn =
        document.getElementById(
            "reject-detection"
        );


    const overlayContext =
        overlay.getContext("2d");


    /* =====================================================
       STATE
    ===================================================== */

    let stream = null;

    let calibrationMode = false;

    let calibrationPoints = [];

    let boardGeometry = null;

    let referenceFrame = null;

    let pendingDetection = null;


    /*
    We process a smaller frame than the raw
    camera resolution because it is much faster
    on a phone.

    640 x 480 is plenty for the first prototype.
    */

    const processingCanvas =
        document.createElement(
            "canvas"
        );

    const processingContext =
        processingCanvas.getContext(
            "2d",
            {
                willReadFrequently: true
            }
        );


    const PROCESS_WIDTH = 640;


    /*
    Difference threshold.

    Increasing this makes the detector ignore
    small lighting changes.

    Decreasing it makes it more sensitive.
    */

    const DIFFERENCE_THRESHOLD = 42;


    /* =====================================================
       DARTBOARD NUMBERS
    ===================================================== */

    const dartboardNumbers = [

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


    /* =====================================================
       CAMERA START
    ===================================================== */

    startCameraBtn.addEventListener(
        "click",
        startCamera
    );


    async function startCamera() {

        stopCamera();


        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices
                .getUserMedia
        ) {

            setStatus(
                "Camera unavailable. Open the HTTPS GitHub Pages version.",
                "error"
            );

            return;
        }


        try {

            setStatus(
                "Starting camera..."
            );


            stream =
                await navigator
                    .mediaDevices
                    .getUserMedia({

                        audio: false,

                        video: {

                            facingMode: {
                                ideal:
                                    "environment"
                            },

                            width: {
                                ideal: 1920
                            },

                            height: {
                                ideal: 1080
                            }
                        }
                    });


            video.srcObject =
                stream;


            await video.play();


            video.classList.add(
                "camera-running"
            );


            placeholder.classList.add(
                "hidden"
            );


            startCameraBtn.disabled =
                true;

            stopCameraBtn.disabled =
                false;

            startCalibrationBtn.disabled =
                false;


            resizeOverlay();


            setStatus(
                "Camera running. Keep the phone still.",
                "success"
            );


        } catch (error) {

            console.error(
                error
            );


            let message =
                "Could not start camera.";


            if (
                error.name ===
                "NotAllowedError"
            ) {

                message =
                    "Camera permission was denied.";
            }


            setStatus(
                message,
                "error"
            );
        }
    }


    /* =====================================================
       CAMERA STOP
    ===================================================== */

    stopCameraBtn.addEventListener(
        "click",
        stopCamera
    );


    function stopCamera() {

        if (stream) {

            stream
                .getTracks()
                .forEach(
                    track =>
                        track.stop()
                );

            stream = null;
        }


        video.srcObject =
            null;


        video.classList.remove(
            "camera-running"
        );


        placeholder.classList.remove(
            "hidden"
        );


        startCameraBtn.disabled =
            false;

        stopCameraBtn.disabled =
            true;

        startCalibrationBtn.disabled =
            true;

        captureEmptyBtn.disabled =
            true;

        detectDartBtn.disabled =
            true;


        clearOverlay();


        setStatus(
            "Camera ready"
        );
    }


    /* =====================================================
       EXPOSE STOP FUNCTION
    ===================================================== */

    window.DartsCamera = {

        stop:
            stopCamera
    };


    /* =====================================================
       OVERLAY SIZE
    ===================================================== */

    function resizeOverlay() {

        const rect =
            overlay
                .getBoundingClientRect();


        overlay.width =
            Math.round(
                rect.width *
                window.devicePixelRatio
            );


        overlay.height =
            Math.round(
                rect.height *
                window.devicePixelRatio
            );


        overlayContext.setTransform(
            window.devicePixelRatio,
            0,
            0,
            window.devicePixelRatio,
            0,
            0
        );


        redrawCalibration();
    }


    window.addEventListener(
        "resize",
        resizeOverlay
    );


    /* =====================================================
       START CALIBRATION
    ===================================================== */

    startCalibrationBtn.addEventListener(
        "click",
        () => {

            calibrationMode =
                true;

            calibrationPoints =
                [];

            boardGeometry =
                null;

            referenceFrame =
                null;

            pendingDetection =
                null;


            captureEmptyBtn.disabled =
                true;

            detectDartBtn.disabled =
                true;

            clearCalibrationBtn.disabled =
                false;


            detectionResult.classList.add(
                "hidden"
            );


            clearOverlay();


            calibrationStatus.textContent =
                "Tap point 1: TOP of outer double ring.";

        }
    );


    /* =====================================================
       CLEAR CALIBRATION
    ===================================================== */

    clearCalibrationBtn.addEventListener(
        "click",
        clearCalibration
    );


    function clearCalibration() {

        calibrationMode =
            false;

        calibrationPoints =
            [];

        boardGeometry =
            null;

        referenceFrame =
            null;

        pendingDetection =
            null;


        captureEmptyBtn.disabled =
            true;

        detectDartBtn.disabled =
            true;


        calibrationStatus.textContent =
            "Not calibrated";

        referenceStatus.textContent =
            "No reference captured";


        detectionResult.classList.add(
            "hidden"
        );


        clearOverlay();
    }


    /* =====================================================
       TAP CALIBRATION POINTS
    ===================================================== */

    overlay.addEventListener(
        "pointerdown",
        event => {

            if (
                !calibrationMode
            ) {

                return;
            }


            const rect =
                overlay
                    .getBoundingClientRect();


            const x =
                event.clientX -
                rect.left;

            const y =
                event.clientY -
                rect.top;


            calibrationPoints.push({
                x,
                y
            });


            redrawCalibration();


            const count =
                calibrationPoints.length;


            if (count === 1) {

                calibrationStatus.textContent =
                    "Tap point 2: RIGHT edge of outer double ring.";

            } else if (
                count === 2
            ) {

                calibrationStatus.textContent =
                    "Tap point 3: BOTTOM edge of outer double ring.";

            } else if (
                count === 3
            ) {

                calibrationStatus.textContent =
                    "Tap point 4: LEFT edge of outer double ring.";

            } else if (
                count === 4
            ) {

                finishCalibration();
            }
        }
    );


    /* =====================================================
       CALIBRATION COMPLETE
    ===================================================== */

    function finishCalibration() {

        calibrationMode =
            false;


        const top =
            calibrationPoints[0];

        const right =
            calibrationPoints[1];

        const bottom =
            calibrationPoints[2];

        const left =
            calibrationPoints[3];


        const centerX =
            (
                left.x +
                right.x
            ) / 2;


        const centerY =
            (
                top.y +
                bottom.y
            ) / 2;


        const radiusX =
            Math.abs(
                right.x -
                left.x
            ) / 2;


        const radiusY =
            Math.abs(
                bottom.y -
                top.y
            ) / 2;


        if (
            radiusX < 30 ||
            radiusY < 30
        ) {

            calibrationStatus.textContent =
                "Calibration failed. Points are too close together.";

            return;
        }


        boardGeometry = {

            centerX,
            centerY,
            radiusX,
            radiusY
        };


        calibrationStatus.textContent =
            "✓ Dartboard calibrated";


        captureEmptyBtn.disabled =
            false;


        redrawCalibration();
    }


    /* =====================================================
       DRAW CALIBRATION
    ===================================================== */

    function redrawCalibration() {

        clearOverlay();


        if (
            calibrationPoints.length
        ) {

            calibrationPoints.forEach(
                (
                    point,
                    index
                ) => {

                    drawPoint(
                        point.x,
                        point.y,
                        index + 1
                    );
                }
            );
        }


        if (boardGeometry) {

            overlayContext.save();


            overlayContext.strokeStyle =
                "#00ff88";

            overlayContext.lineWidth =
                2;


            overlayContext.beginPath();


            overlayContext.ellipse(

                boardGeometry.centerX,
                boardGeometry.centerY,

                boardGeometry.radiusX,
                boardGeometry.radiusY,

                0,

                0,

                Math.PI * 2
            );


            overlayContext.stroke();


            overlayContext.restore();
        }
    }


    function drawPoint(
        x,
        y,
        number
    ) {

        overlayContext.save();


        overlayContext.fillStyle =
            "#00aaff";


        overlayContext.beginPath();

        overlayContext.arc(
            x,
            y,
            8,
            0,
            Math.PI * 2
        );

        overlayContext.fill();


        overlayContext.fillStyle =
            "white";

        overlayContext.font =
            "bold 12px Arial";

        overlayContext.textAlign =
            "center";

        overlayContext.textBaseline =
            "middle";


        overlayContext.fillText(
            number,
            x,
            y
        );


        overlayContext.restore();
    }


    function clearOverlay() {

        const rect =
            overlay
                .getBoundingClientRect();


        overlayContext.clearRect(
            0,
            0,
            rect.width,
            rect.height
        );
    }


    /* =====================================================
       CAPTURE EMPTY BOARD
    ===================================================== */

    captureEmptyBtn.addEventListener(
        "click",
        () => {

            if (
                !boardGeometry
            ) {

                return;
            }


            referenceFrame =
                captureFrame();


            if (
                !referenceFrame
            ) {

                referenceStatus.textContent =
                    "Could not capture frame.";

                return;
            }


            referenceStatus.textContent =
                "✓ Empty board captured";


            detectDartBtn.disabled =
                false;


            /*
            Draw calibration again in case
            capture changed nothing visually.
            */

            redrawCalibration();
        }
    );


    /* =====================================================
       CAPTURE CAMERA FRAME
    ===================================================== */

    function captureFrame() {

        if (
            !video.videoWidth ||
            !video.videoHeight
        ) {

            return null;
        }


        const ratio =
            video.videoHeight /
            video.videoWidth;


        processingCanvas.width =
            PROCESS_WIDTH;


        processingCanvas.height =
            Math.round(
                PROCESS_WIDTH *
                ratio
            );


        processingContext.drawImage(

            video,

            0,
            0,

            processingCanvas.width,
            processingCanvas.height
        );


        return processingContext
            .getImageData(

                0,
                0,

                processingCanvas.width,
                processingCanvas.height
            );
    }


    /* =====================================================
       DETECT DART
    ===================================================== */

    detectDartBtn.addEventListener(
        "click",
        () => {

            if (
                !referenceFrame ||
                !boardGeometry
            ) {

                return;
            }


            const currentFrame =
                captureFrame();


            if (!currentFrame)
                return;


            const location =
                detectChangedArea(

                    referenceFrame,
                    currentFrame
                );


            if (!location) {

                setStatus(
                    "No clear dart movement detected. Try again.",
                    "error"
                );

                return;
            }


            const overlayPoint =
                processingToOverlay(
                    location.x,
                    location.y
                );


            const dartScore =
                scoreBoardPosition(

                    overlayPoint.x,
                    overlayPoint.y
                );


            if (!dartScore) {

                setStatus(
                    "Change detected outside the calibrated scoring area.",
                    "error"
                );

                return;
            }


            pendingDetection =
                dartScore;


            detectedSegmentDisplay.textContent =
                dartScore.label;


            detectedPointsDisplay.textContent =
                `${dartScore.points} points`;


            detectionResult.classList.remove(
                "hidden"
            );


            drawDetectionMarker(
                overlayPoint.x,
                overlayPoint.y
            );


            setStatus(
                `Possible hit detected: ${dartScore.label}`,
                "success"
            );
        }
    );


    /* =====================================================
       IMAGE DIFFERENCE
    ===================================================== */

    function detectChangedArea(
        reference,
        current
    ) {

        if (
            reference.width !==
                current.width ||

            reference.height !==
                current.height
        ) {

            return null;
        }


        const width =
            reference.width;

        const height =
            reference.height;


        /*
        Translate our calibrated board
        from visible overlay coordinates
        to processing coordinates.
        */

        const overlayRect =
            overlay
                .getBoundingClientRect();


        const sx =
            width /
            overlayRect.width;


        const sy =
            height /
            overlayRect.height;


        const centerX =
            boardGeometry.centerX *
            sx;


        const centerY =
            boardGeometry.centerY *
            sy;


        const radiusX =
            boardGeometry.radiusX *
            sx;


        const radiusY =
            boardGeometry.radiusY *
            sy;


        let sumX = 0;

        let sumY = 0;

        let totalWeight = 0;

        let changedPixels = 0;


        /*
        Check every second pixel to make it
        quicker on mobile.
        */

        for (
            let y = 0;
            y < height;
            y += 2
        ) {

            for (
                let x = 0;
                x < width;
                x += 2
            ) {

                /*
                Ignore pixels far outside
                dartboard.
                */

                const nx =
                    (
                        x -
                        centerX
                    ) /
                    radiusX;


                const ny =
                    (
                        y -
                        centerY
                    ) /
                    radiusY;


                const normalizedRadius =
                    Math.sqrt(
                        nx * nx +
                        ny * ny
                    );


                if (
                    normalizedRadius >
                    1.10
                ) {

                    continue;
                }


                const index =
                    (
                        y *
                        width +
                        x
                    ) * 4;


                const dr =
                    Math.abs(
                        current.data[index] -
                        reference.data[index]
                    );


                const dg =
                    Math.abs(
                        current.data[index + 1] -
                        reference.data[index + 1]
                    );


                const db =
                    Math.abs(
                        current.data[index + 2] -
                        reference.data[index + 2]
                    );


                const difference =
                    (
                        dr +
                        dg +
                        db
                    ) / 3;


                if (
                    difference >
                    DIFFERENCE_THRESHOLD
                ) {

                    /*
                    Larger image changes get
                    slightly more influence.
                    */

                    const weight =
                        difference;


                    sumX +=
                        x * weight;


                    sumY +=
                        y * weight;


                    totalWeight +=
                        weight;


                    changedPixels++;
                }
            }
        }


        /*
        Too little difference usually means
        lighting noise rather than a dart.
        */

        if (
            changedPixels < 25 ||
            totalWeight === 0
        ) {

            return null;
        }


        return {

            x:
                sumX /
                totalWeight,

            y:
                sumY /
                totalWeight,

            changedPixels
        };
    }


    /* =====================================================
       PROCESSING -> DISPLAY COORDINATES
    ===================================================== */

    function processingToOverlay(
        x,
        y
    ) {

        const rect =
            overlay
                .getBoundingClientRect();


        return {

            x:
                x /
                processingCanvas.width *
                rect.width,

            y:
                y /
                processingCanvas.height *
                rect.height
        };
    }


    /* =====================================================
       MAP POINT TO DARTBOARD SCORE
    ===================================================== */

    function scoreBoardPosition(
        x,
        y
    ) {

        const dx =
            (
                x -
                boardGeometry.centerX
            ) /
            boardGeometry.radiusX;


        const dy =
            (
                y -
                boardGeometry.centerY
            ) /
            boardGeometry.radiusY;


        const radius =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        /*
        Outside double ring.
        */

        if (radius > 1) {

            return {
                label: "MISS",
                points: 0
            };
        }


        /*
        Actual board proportions relative
        to outer double radius.

        Bull radius approx 6.35 / 170

        Outer bull approx 15.9 / 170

        Treble:
        inner 99 / 170
        outer 107 / 170

        Double:
        inner 162 / 170
        outer 170 / 170
        */


        if (
            radius <= 0.0375
        ) {

            return {
                label: "Bull",
                points: 50
            };
        }


        if (
            radius <= 0.094
        ) {

            return {
                label: "Outer Bull",
                points: 25
            };
        }


        /*
        Work out dartboard number.

        atan2 gives:
        zero at right.

        We rotate so zero is at top.
        */

        let angle =
            Math.atan2(
                dx,
                -dy
            );


        if (angle < 0) {

            angle +=
                Math.PI * 2;
        }


        const wedgeSize =
            (
                Math.PI * 2
            ) / 20;


        /*
        Each number occupies 18 degrees.

        Add half a wedge because 20 is
        centred at 12 o'clock.
        */

        const index =
            Math.floor(

                (
                    angle +
                    wedgeSize / 2
                ) /
                wedgeSize

            ) % 20;


        const number =
            dartboardNumbers[index];


        /*
        DOUBLE
        */

        if (
            radius >= 0.953
        ) {

            return {

                label:
                    "D" + number,

                points:
                    number * 2
            };
        }


        /*
        TREBLE
        */

        if (
            radius >= 0.582 &&
            radius <= 0.629
        ) {

            return {

                label:
                    "T" + number,

                points:
                    number * 3
            };
        }


        /*
        SINGLE
        */

        return {

            label:
                "S" + number,

            points:
                number
        };
    }


    /* =====================================================
       DRAW DETECTED POSITION
    ===================================================== */

    function drawDetectionMarker(
        x,
        y
    ) {

        redrawCalibration();


        overlayContext.save();


        overlayContext.strokeStyle =
            "#ffdd00";


        overlayContext.lineWidth =
            3;


        overlayContext.beginPath();

        overlayContext.arc(
            x,
            y,
            12,
            0,
            Math.PI * 2
        );

        overlayContext.stroke();


        overlayContext.beginPath();

        overlayContext.moveTo(
            x - 18,
            y
        );

        overlayContext.lineTo(
            x + 18,
            y
        );

        overlayContext.moveTo(
            x,
            y - 18
        );

        overlayContext.lineTo(
            x,
            y + 18
        );

        overlayContext.stroke();


        overlayContext.restore();
    }


    /* =====================================================
       CONFIRM SCORE
    ===================================================== */

    confirmDetectionBtn.addEventListener(
        "click",
        () => {

            if (
                !pendingDetection
            ) {

                return;
            }


            if (
                typeof
                window
                    .scoreDetectedDart501
                === "function"
            ) {

                window
                    .scoreDetectedDart501(

                        pendingDetection
                            .points
                    );
            }


            /*
            Important:

            We now make the current board
            the new reference image.

            That means Dart 2 is compared
            against the board containing
            Dart 1.

            This is the first step toward
            detecting darts one at a time.
            */

            referenceFrame =
                captureFrame();


            pendingDetection =
                null;


            detectionResult.classList.add(
                "hidden"
            );


            redrawCalibration();


            referenceStatus.textContent =
                "✓ Reference updated after confirmed dart";


            setStatus(
                "Score accepted. Ready for next dart.",
                "success"
            );
        }
    );


    /* =====================================================
       REJECT SCORE
    ===================================================== */

    rejectDetectionBtn.addEventListener(
        "click",
        () => {

            pendingDetection =
                null;


            detectionResult.classList.add(
                "hidden"
            );


            redrawCalibration();


            setStatus(
                "Detection rejected. No score was added."
            );
        }
    );


    /* =====================================================
       STATUS
    ===================================================== */

    function setStatus(
        message,
        type = ""
    ) {

        cameraStatus.textContent =
            message;


        cameraStatus.classList.remove(
            "camera-success",
            "camera-error"
        );


        if (
            type === "success"
        ) {

            cameraStatus.classList.add(
                "camera-success"
            );

        } else if (
            type === "error"
        ) {

            cameraStatus.classList.add(
                "camera-error"
            );
        }
    }


    /* =====================================================
       CLEAN UP
    ===================================================== */

    window.addEventListener(
        "beforeunload",
        stopCamera
    );

})();