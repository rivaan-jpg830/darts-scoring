"use strict";


/* =========================================================
   DART HUB DART DETECTOR

   Stable filename:
       dart-detector.js

   This detector replaces only findImpactPoint() from
   camera.js.

   Main changes:

   1. Denoise the changed pixels.
   2. Find connected dart-like shapes.
   3. Transform the candidate into calibrated board space.
   4. Fit the dart's long axis.
   5. Ignore the flights / shaft outside the board.
   6. Find the endpoint of the dart that lies INSIDE the
      calibrated playable board.
   7. Never accept an impact point outside the double ring.
========================================================= */


(function () {


    if (
        typeof window.findImpactPoint !==
        "function"
    ) {

        console.error(
            "Dart detector: camera.js must load first."
        );

        return;
    }


    const legacyDetector =
        window.findImpactPoint;


    const CONFIG = {

        cellSize:
            4,

        minimumPixels:
            12,

        minimumCells:
            4,

        minimumBoardPoints:
            7,

        maximumComponents:
            12,

        minimumElongation:
            1.8,

        maximumCandidateRadius:
            1.14,

        /*
           The real scoring surface ends at 1.0.

           Give the tip a tiny tolerance because the
           calibration line itself has thickness.
        */

        maximumImpactRadius:
            1.025,

        endpointFraction:
            0.13,

        insideBonus:
            40

    };


    /* =====================================================
       HELPERS
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
       DENOISE INTO CELLS
    ===================================================== */

    function buildCells(
        pixels
    ) {

        const cells =
            new Map();


        const size =
            CONFIG.cellSize;


        pixels.forEach(
            pixel => {

                const x =
                    Math.floor(
                        pixel.x /
                        size
                    );


                const y =
                    Math.floor(
                        pixel.y /
                        size
                    );


                const key =
                    `${x},${y}`;


                let cell =
                    cells.get(
                        key
                    );


                if (
                    !cell
                ) {

                    cell = {

                        x,

                        y,

                        count:
                            0,

                        weight:
                            0,

                        sumX:
                            0,

                        sumY:
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


                cell.sumX +=
                    pixel.x *
                    weight;


                cell.sumY +=
                    pixel.y *
                    weight;
            }
        );


        /*
           Remove single isolated noise cells.
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


                        if (
                            cells.has(

                                `${cell.x + dx},${cell.y + dy}`
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
       CONNECTED COMPONENTS
    ===================================================== */

    function findComponents(
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

                            `${cell.x + dx},${cell.y + dy}`;


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
                CONFIG.minimumCells
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

    function cellCentre(
        cell
    ) {

        const weight =
            cell.weight ||
            1;


        return {

            x:

                cell.sumX /
                weight,

            y:

                cell.sumY /
                weight,

            weight
        };
    }


    /* =====================================================
       PRINCIPAL AXIS / PCA
    ===================================================== */

    function fitAxis(
        points
    ) {

        if (
            points.length <
            2
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


        const root =
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


        const major =
            Math.max(
                0.000001,
                (
                    trace +
                    root
                ) /
                2
            );


        const minor =
            Math.max(
                0.000001,
                (
                    trace -
                    root
                ) /
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

                major /
                minor
        };
    }


    /* =====================================================
       ANALYSE COMPONENT
    ===================================================== */

    function analyseComponent(
        component,
        width,
        height
    ) {

        const imagePoints =
            component.map(
                cellCentre
            );


        const imageAxis =
            fitAxis(
                imagePoints
            );


        if (
            !imageAxis ||
            imageAxis.elongation <
                CONFIG.minimumElongation
        ) {

            return null;
        }


        const boardPoints =
            [];


        imagePoints.forEach(
            point => {

                let board;


                try {

                    board =
                        window.imagePixelToBoard(

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
                    CONFIG.maximumCandidateRadius
                ) {

                    boardPoints.push({

                        x:
                            board.x,

                        y:
                            board.y,

                        radius,

                        weight:
                            point.weight
                    });
                }
            }
        );


        if (
            boardPoints.length <
            CONFIG.minimumBoardPoints
        ) {

            return null;
        }


        const axis =
            fitAxis(
                boardPoints
            );


        if (
            !axis ||
            axis.elongation <
                CONFIG.minimumElongation
        ) {

            return null;
        }


        /*
           Project points along the fitted dart line.
        */

        let projected =
            boardPoints
                .map(
                    point => {

                        const dx =
                            point.x -
                            axis.centreX;


                        const dy =
                            point.y -
                            axis.centreY;


                        return {

                            ...point,

                            along:

                                dx *
                                axis.axisX

                                +

                                dy *
                                axis.axisY,

                            cross:

                                -dx *
                                axis.axisY

                                +

                                dy *
                                axis.axisX
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
           Remove extreme camera-noise pixels.
        */

        const low =
            percentile(

                projected.map(
                    point =>
                        point.along
                ),

                0.03
            );


        const high =
            percentile(

                projected.map(
                    point =>
                        point.along
                ),

                0.97
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
            CONFIG.minimumBoardPoints
        ) {

            return null;
        }


        /*
           HARD BOARD MASK

           The flights can be outside the board.
           The actual dart entry point cannot.

           This immediately prevents the failure visible
           in the screenshot where Dart Hub selected an
           impact beside the number 12.
        */

        const insideBoard =
            projected.filter(
                point =>

                    point.radius <=
                    CONFIG.maximumImpactRadius
            );


        if (
            insideBoard.length <
            3
        ) {

            return null;
        }


        /*
           For the mounted-phone setup the shaft generally
           travels from outside the board toward the tip.

           Therefore the dart tip is normally the end of the
           fitted dart shape with the SMALLER board radius.
        */

        const endCount =
            Math.max(

                3,

                Math.round(

                    projected.length *
                    CONFIG.endpointFraction
                )
            );


        const startSample =
            projected.slice(
                0,
                endCount
            );


        const endSample =
            projected.slice(
                -endCount
            );


        function sampleCandidate(
            sample
        ) {

            const valid =
                sample.filter(
                    point =>

                        point.radius <=
                        CONFIG.maximumImpactRadius
                );


            if (
                !valid.length
            ) {

                return null;
            }


            return {

                x:
                    median(
                        valid.map(
                            point =>
                                point.x
                        )
                    ),

                y:
                    median(
                        valid.map(
                            point =>
                                point.y
                        )
                    ),

                radius:
                    median(
                        valid.map(
                            point =>
                                point.radius
                        )
                    ),

                count:
                    valid.length
            };
        }


        let start =
            sampleCandidate(
                startSample
            );


        let end =
            sampleCandidate(
                endSample
            );


        let impact =
            null;


        if (
            start &&
            end
        ) {

            /*
               Whichever end is deeper inside the board
               is the better tip candidate.
            */

            impact =

                start.radius <=
                end.radius

                    ?

                    start

                    :

                    end;
        }


        else if (
            start
        ) {

            impact =
                start;
        }


        else if (
            end
        ) {

            impact =
                end;
        }


        /*
           If neither extreme is clearly inside the board,
           find the deepest-in-board changed point.

           This is still dramatically safer than accepting
           an outside-board flight.
        */

        if (
            !impact
        ) {

            const best =
                insideBoard.reduce(
                    (
                        chosen,
                        point
                    ) =>

                        !chosen ||
                        point.radius <
                        chosen.radius

                            ?

                            point

                            :

                            chosen,

                    null
                );


            if (
                best
            ) {

                impact = {

                    x:
                        best.x,

                    y:
                        best.y,

                    radius:
                        best.radius,

                    count:
                        1
                };
            }
        }


        if (
            !impact
        ) {

            return null;
        }


        /*
           Absolute final safety check.
        */

        if (
            Math.hypot(
                impact.x,
                impact.y
            )
            >
            CONFIG.maximumImpactRadius
        ) {

            return null;
        }


        const insideRatio =

            insideBoard.length /
            projected.length;


        const quality =

            Math.min(
                axis.elongation,
                7
            )

            *
            10

            +

            insideRatio *
            CONFIG.insideBonus

            +

            Math.min(
                projected.length,
                50
            )
            *
            0.3;


        return {

            x:
                impact.x,

            y:
                impact.y,

            quality,

            radius:
                impact.radius,

            elongation:
                axis.elongation,

            insideRatio,

            componentSize:
                component.length
        };
    }


    /* =====================================================
       DETECTOR
    ===================================================== */

    function dartHubFindImpactPoint(
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
                CONFIG.minimumPixels
            ) {

                return null;
            }


            const cells =
                buildCells(
                    difference.pixels
                );


            const components =
                findComponents(
                    cells
                );


            const candidates =
                [];


            for (
                const component
                of components.slice(
                    0,
                    CONFIG.maximumComponents
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


            if (
                candidates.length
            ) {

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


                console.log(

                    "🎯 Dart detector",

                    {
                        x:
                            winner.x,

                        y:
                            winner.y,

                        radius:
                            winner.radius,

                        quality:
                            winner.quality,

                        elongation:
                            winner.elongation,

                        insideRatio:
                            winner.insideRatio
                    }
                );


                return {

                    x:
                        winner.x,

                    y:
                        winner.y
                };
            }


            /*
               We can still try the old detector, BUT only
               accept its answer if it lies on the board.

               This is the key difference from before.
            */

            const fallback =
                legacyDetector(

                    difference,
                    width,
                    height
                );


            if (
                fallback
            ) {

                const radius =
                    Math.hypot(

                        fallback.x,
                        fallback.y
                    );


                if (
                    Number.isFinite(
                        radius
                    )

                    &&

                    radius <=
                    CONFIG.maximumImpactRadius
                ) {

                    return fallback;
                }
            }


            return null;


        } catch (
            error
        ) {

            console.warn(
                "Dart detector error:",
                error
            );


            return null;
        }
    }


    /*
       Override only the dart impact detector.
    */

    window.findImpactPoint =
        dartHubFindImpactPoint;


    try {

        findImpactPoint =
            dartHubFindImpactPoint;

    } catch (
        error
    ) {

        console.warn(
            "Detector binding:",
            error
        );
    }


    console.log(
        "✅ Dart Hub board-masked detector loaded."
    );


})();