"use strict";


/* =========================================================
   DART HUB DETECTOR V8

   Enhanced single-camera dart impact detector.

   Inspired by the general computer-vision approach used by
   the MIT-licensed automatic-darts project:

   https://github.com/Zoofly85/automatic-darts-

   This is a browser/JavaScript implementation designed
   specifically for Dart Hub's single-phone camera system.

   It does NOT replace camera.js.

   It loads AFTER camera.js and replaces only the
   findImpactPoint() detector.
========================================================= */


(function () {


    /* =====================================================
       CHECK EXISTING CAMERA SYSTEM
    ===================================================== */

    if (
        typeof findImpactPoint !==
        "function"
    ) {

        console.error(
            "Dart Hub V8: camera.js must load before dart-detector-v8.js"
        );


        return;
    }


    if (
        typeof imagePixelToBoard !==
        "function"
    ) {

        console.error(
            "Dart Hub V8: calibration mapping is unavailable."
        );


        return;
    }


    /*
       Keep V7 detector available as a fallback.
    */

    const legacyFindImpactPoint =
        findImpactPoint;



    /* =====================================================
       SETTINGS

       These can be tuned later without changing
       camera.js.
    ===================================================== */

    const V8_CONFIG = {

        cellSize:
            4,

        minimumChangedPixels:
            12,

        minimumComponentCells:
            5,

        minimumBoardPoints:
            8,

        minimumElongation:
            2.0,

        strongElongation:
            3.0,

        tipWidthRatio:
            0.78,

        tipDensityRatio:
            0.80,

        endpointSampleFraction:
            0.16,

        endpointDensityRadius:
            0.055,

        maximumBoardRadius:
            1.12,

        maximumComponents:
            10

    };



    /* =====================================================
       BASIC STATISTICS
    ===================================================== */

    function average(
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



    function percentile(
        values,
        fraction
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


        const index =
            Math.max(

                0,

                Math.min(

                    sorted.length -
                    1,

                    Math.round(

                        (
                            sorted.length -
                            1
                        )

                        *

                        fraction
                    )
                )
            );


        return sorted[
            index
        ];
    }



    /* =====================================================
       BUILD DENOISED CHANGE MAP

       camera.js gives us changed pixels.

       Instead of treating every changed pixel separately,
       group them into small cells.

       This removes a lot of camera noise and behaves
       similarly to morphological opening/closing used
       in traditional OpenCV dart detectors.
    ===================================================== */

    function buildCells(
        pixels
    ) {

        const size =
            V8_CONFIG.cellSize;


        const cells =
            new Map();


        pixels.forEach(
            pixel => {

                const cellX =
                    Math.floor(
                        pixel.x /
                        size
                    );


                const cellY =
                    Math.floor(
                        pixel.y /
                        size
                    );


                const key =
                    `${cellX},${cellY}`;


                let cell =
                    cells.get(
                        key
                    );


                if (
                    !cell
                ) {

                    cell = {

                        cellX,

                        cellY,

                        count:
                            0,

                        weight:
                            0,

                        weightedX:
                            0,

                        weightedY:
                            0
                    };


                    cells.set(
                        key,
                        cell
                    );
                }


                const weight =
                    Math.max(

                        1,

                        Number(
                            pixel.difference
                        )

                        ||

                        1
                    );


                cell.count++;


                cell.weight +=
                    weight;


                cell.weightedX +=

                    pixel.x *
                    weight;


                cell.weightedY +=

                    pixel.y *
                    weight;
            }
        );



        /*
           Remove isolated noise cells.
        */

        const cleaned =
            new Map();


        cells.forEach(
            (
                cell,
                key
            ) => {

                let neighbours =
                    0;


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


                        const neighbourKey =

                            `${cell.cellX + dx},${cell.cellY + dy}`;


                        if (
                            cells.has(
                                neighbourKey
                            )
                        ) {

                            neighbours++;
                        }
                    }
                }


                if (
                    neighbours >=
                        1

                    ||

                    cell.count >=
                        2
                ) {

                    cleaned.set(
                        key,
                        cell
                    );
                }
            }
        );


        return cleaned;
    }



    /* =====================================================
       FIND CONNECTED CHANGE REGIONS
    ===================================================== */

    function findCellComponents(
        cells
    ) {

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


                const cell =
                    cells.get(
                        key
                    );


                if (
                    !cell
                ) {

                    continue;
                }


                component.push(
                    cell
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

                            `${cell.cellX + dx},${cell.cellY + dy}`;


                        if (

                            cells.has(
                                neighbour
                            )

                            &&

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
                V8_CONFIG.minimumComponentCells
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



    /* =====================================================
       CELL CENTRE
    ===================================================== */

    function cellPoint(
        cell
    ) {

        const weight =
            cell.weight ||
            1;


        return {

            x:

                cell.weightedX /
                weight,


            y:

                cell.weightedY /
                weight,


            weight
        };
    }



    /* =====================================================
       FIT MAIN DART AXIS

       Weighted PCA finds the longest direction of
       the detected shape.

       A dart should look elongated rather than like
       a circular patch of noise.
    ===================================================== */

    function fitPrincipalAxis(
        points
    ) {

        if (
            !points.length
        ) {

            return null;
        }


        let totalWeight =
            0;


        let centreX =
            0;


        let centreY =
            0;


        points.forEach(
            point => {

                const weight =
                    point.weight ||
                    1;


                totalWeight +=
                    weight;


                centreX +=

                    point.x *
                    weight;


                centreY +=

                    point.y *
                    weight;
            }
        );


        if (
            !totalWeight
        ) {

            return null;
        }


        centreX /=
            totalWeight;


        centreY /=
            totalWeight;


        let xx =
            0;


        let yy =
            0;


        let xy =
            0;


        points.forEach(
            point => {

                const weight =
                    point.weight ||
                    1;


                const dx =
                    point.x -
                    centreX;


                const dy =
                    point.y -
                    centreY;


                xx +=

                    weight *
                    dx *
                    dx;


                yy +=

                    weight *
                    dy *
                    dy;


                xy +=

                    weight *
                    dx *
                    dy;
            }
        );


        const trace =
            xx +
            yy;


        const discriminant =
            Math.sqrt(

                Math.max(

                    0,

                    Math.pow(
                        xx -
                        yy,
                        2
                    )

                    +

                    4 *
                    xy *
                    xy
                )
            );


        const majorVariance =
            Math.max(

                0.000001,

                (
                    trace +
                    discriminant
                )

                /

                2
            );


        const minorVariance =
            Math.max(

                0.000001,

                (
                    trace -
                    discriminant
                )

                /

                2
            );


        const angle =

            0.5 *

            Math.atan2(
                2 *
                xy,

                xx -
                yy
            );


        return {

            centreX,

            centreY,

            axisX:
                Math.cos(
                    angle
                ),

            axisY:
                Math.sin(
                    angle
                ),

            elongation:

                majorVariance /
                minorVariance
        };
    }



    /* =====================================================
       ANALYSE ONE END OF THE DART
    ===================================================== */

    function analyseEndpoint(
        projected,
        takeStart
    ) {

        if (
            projected.length <
            8
        ) {

            return null;
        }


        const sampleCount =
            Math.max(

                4,

                Math.round(

                    projected.length *

                    V8_CONFIG
                        .endpointSampleFraction
                )
            );


        const sample =

            takeStart

                ?

                projected.slice(
                    0,
                    sampleCount
                )

                :

                projected.slice(
                    -sampleCount
                );


        const boardX =
            median(

                sample.map(
                    point =>
                        point.boardX
                )
            );


        const boardY =
            median(

                sample.map(
                    point =>
                        point.boardY
                )
            );


        const perpendicularCentre =
            median(

                sample.map(
                    point =>
                        point.cross
                )
            );


        const spread =
            Math.sqrt(

                average(

                    sample.map(
                        point =>

                            Math.pow(

                                point.cross -
                                perpendicularCentre,

                                2
                            )
                    )
                )
            );


        let density =
            0;


        projected.forEach(
            point => {

                if (
                    Math.hypot(

                        point.boardX -
                        boardX,

                        point.boardY -
                        boardY

                    )

                    <=

                    V8_CONFIG
                        .endpointDensityRadius
                ) {

                    density++;
                }
            }
        );


        return {

            x:
                boardX,

            y:
                boardY,

            spread,

            density,

            radius:

                Math.hypot(
                    boardX,
                    boardY
                )
        };
    }



    /* =====================================================
       ANALYSE POSSIBLE DART COMPONENT
    ===================================================== */

    function analyseComponent(
        component,
        width,
        height
    ) {

        const imagePoints =
            component.map(
                cellPoint
            );


        const imageAxis =
            fitPrincipalAxis(
                imagePoints
            );


        if (
            !imageAxis
        ) {

            return null;
        }


        /*
           Reject blobs that do not look enough like
           an elongated dart.
        */

        if (
            imageAxis.elongation <
            V8_CONFIG.minimumElongation
        ) {

            return null;
        }


        /*
           Transform camera pixels into calibrated
           dartboard coordinates.
        */

        const boardPoints =
            [];


        imagePoints.forEach(
            point => {

                let board;


                try {

                    board =
                        imagePixelToBoard(

                            point.x,
                            point.y,

                            width,
                            height
                        );

                } catch (
                    error
                ) {

                    return;
                }


                const radius =
                    Math.hypot(

                        board.x,
                        board.y
                    );


                if (

                    Number.isFinite(
                        radius
                    )

                    &&

                    radius <=
                    V8_CONFIG.maximumBoardRadius
                ) {

                    boardPoints.push({

                        x:
                            board.x,

                        y:
                            board.y,

                        weight:
                            point.weight
                    });
                }
            }
        );


        if (
            boardPoints.length <
            V8_CONFIG.minimumBoardPoints
        ) {

            return null;
        }


        const boardAxis =
            fitPrincipalAxis(
                boardPoints
            );


        if (
            !boardAxis
        ) {

            return null;
        }


        if (
            boardAxis.elongation <
            V8_CONFIG.minimumElongation
        ) {

            return null;
        }



        /*
           Project every board point onto the dart's
           fitted centre line.
        */

        let projected =
            boardPoints
                .map(
                    point => {

                        const dx =

                            point.x -
                            boardAxis.centreX;


                        const dy =

                            point.y -
                            boardAxis.centreY;


                        return {

                            boardX:
                                point.x,

                            boardY:
                                point.y,

                            along:

                                dx *
                                boardAxis.axisX

                                +

                                dy *
                                boardAxis.axisY,

                            cross:

                                -dx *
                                boardAxis.axisY

                                +

                                dy *
                                boardAxis.axisX
                        };
                    }
                )

                .sort(
                    (
                        a,
                        b
                    ) =>
                        a.along -
                        b.along
                );


        /*
           Remove extreme outliers.

           A handful of isolated changed cells can otherwise
           cause the detected dart to appear much longer than
           it really is.
        */

        const low =
            percentile(

                projected.map(
                    point =>
                        point.along
                ),

                0.04
            );


        const high =
            percentile(

                projected.map(
                    point =>
                        point.along
                ),

                0.96
            );


        projected =
            projected.filter(
                point =>

                    point.along >=
                    low

                    &&

                    point.along <=
                    high
            );


        if (
            projected.length <
            V8_CONFIG.minimumBoardPoints
        ) {

            return null;
        }


        const start =
            analyseEndpoint(
                projected,
                true
            );


        const end =
            analyseEndpoint(
                projected,
                false
            );


        if (
            !start ||
            !end
        ) {

            return null;
        }



        /* =================================================
           CHOOSE DART TIP

           A steel-tip dart's point should normally create a
           thinner endpoint than its shaft / flight end.

           So:

           1. Compare endpoint width.
           2. Compare local density.
           3. Only then use board-centre distance as a
              tie-breaker.
        ================================================= */

        let impact;


        let tipReason;


        if (

            start.spread <

            end.spread *
            V8_CONFIG.tipWidthRatio
        ) {

            impact =
                start;


            tipReason =
                "narrow-start";
        }


        else if (

            end.spread <

            start.spread *
            V8_CONFIG.tipWidthRatio
        ) {

            impact =
                end;


            tipReason =
                "narrow-end";
        }


        else if (

            start.density <

            end.density *
            V8_CONFIG.tipDensityRatio
        ) {

            impact =
                start;


            tipReason =
                "sparse-start";
        }


        else if (

            end.density <

            start.density *
            V8_CONFIG.tipDensityRatio
        ) {

            impact =
                end;


            tipReason =
                "sparse-end";
        }


        else {

            impact =

                start.radius <=
                end.radius

                    ?

                    start

                    :

                    end;


            tipReason =
                "centre-tiebreak";
        }



        const smallerSpread =
            Math.max(

                0.0001,

                Math.min(
                    start.spread,
                    end.spread
                )
            );


        const widthRatio =

            Math.max(
                start.spread,
                end.spread
            )

            /

            smallerSpread;



        /*
           Score how dart-like this component looks.
        */

        const quality =

            Math.min(
                6,
                boardAxis.elongation
            )

            *
            10

            +

            Math.min(
                4,
                widthRatio
            )

            *
            8

            +

            Math.min(
                50,
                projected.length
            )

            *
            0.4;



        return {

            x:
                impact.x,

            y:
                impact.y,

            quality,

            tipReason,

            elongation:
                boardAxis.elongation,

            widthRatio,

            componentCells:
                component.length,

            detector:
                "Dart Hub V8"
        };
    }



    /* =====================================================
       V8 FIND IMPACT POINT
    ===================================================== */

    function findImpactPointV8(
        difference,
        width,
        height
    ) {

        try {


            if (

                !difference

                ||

                !Array.isArray(
                    difference.pixels
                )

                ||

                difference.pixels.length <
                V8_CONFIG.minimumChangedPixels
            ) {

                return legacyFindImpactPoint(

                    difference,
                    width,
                    height
                );
            }



            const cells =
                buildCells(
                    difference.pixels
                );


            const components =
                findCellComponents(
                    cells
                );


            const candidates =
                [];


            for (
                const component
                of components.slice(
                    0,
                    V8_CONFIG.maximumComponents
                )
            ) {

                const candidate =
                    analyseComponent(

                        component,
                        width,
                        height
                    );


                if (
                    candidate
                ) {

                    candidates.push(
                        candidate
                    );
                }
            }



            /*
               If V8 isn't confident that it found something
               dart-like, keep V7 as a safety fallback.
            */

            if (
                !candidates.length
            ) {

                return legacyFindImpactPoint(

                    difference,
                    width,
                    height
                );
            }



            candidates.sort(
                (
                    a,
                    b
                ) =>
                    b.quality -
                    a.quality
            );


            const winner =
                candidates[0];



            /*
               Reject very weak shapes and let the old
               detector have another go.
            */

            if (

                winner.elongation <
                V8_CONFIG.minimumElongation

                ||

                !Number.isFinite(
                    winner.x
                )

                ||

                !Number.isFinite(
                    winner.y
                )
            ) {

                return legacyFindImpactPoint(

                    difference,
                    width,
                    height
                );
            }



            console.log(

                "🎯 Dart Hub V8 impact",

                {
                    x:
                        winner.x,

                    y:
                        winner.y,

                    quality:
                        winner.quality,

                    elongation:
                        winner.elongation,

                    widthRatio:
                        winner.widthRatio,

                    reason:
                        winner.tipReason
                }
            );


            return {

                x:
                    winner.x,

                y:
                    winner.y
            };


        } catch (
            error
        ) {

            console.warn(

                "Dart Hub V8 detector failed. Using V7 fallback.",

                error
            );


            return legacyFindImpactPoint(

                difference,
                width,
                height
            );
        }
    }



    /* =====================================================
       OVERRIDE V7 DETECTOR
    ===================================================== */

    window.findImpactPoint =
        findImpactPointV8;


    /*
       In normal classic-script loading, camera.js creates
       findImpactPoint as a global function binding.

       Reassignment makes sure detectionTick sees V8 too.
    */

    try {

        findImpactPoint =
            findImpactPointV8;

    } catch (
        error
    ) {

        console.warn(
            "Could not reassign detector binding:",
            error
        );
    }


    console.log(
        "✅ Dart Hub V8 enhanced dart detector loaded."
    );


})();