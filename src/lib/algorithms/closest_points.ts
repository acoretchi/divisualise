import { RecursiveCall, DivideCase, BaseCase, RecursiveCase } from "$lib/core/recursive_call"
import type { CallDetails, RecursiveCalls } from "$lib/core/recursive_call"
import { Points, Point, Line } from "$lib/core/values"


export interface ClosestPointsInput {
    points: Points
}


export class ClosestPointsCall extends RecursiveCall<ClosestPointsInput, Points> {
    
    case(root: ClosestPointsCall): RecursiveCase<ClosestPointsInput, Points> {
        const points = this.input().points.copy().points.sort((a, b) => a.x - b.x)
        if (points.length <= 3) {
            return new ClosestPointsBaseCase({ points: new Points(points) })
        } else {
            return new ClosestPointsDivideCase(this.input(), root)
        }
    }

    undividedDetails(): CallDetails {
        return [{
            text: "We want to find the closest pair of points in the set.",
            valueKeyframes: [{
                "Points": this.input().points.copy()
            }]
        }]
    }

}

export class ClosestPointsDivideCase extends DivideCase<ClosestPointsInput, Points> {

    divide(input: ClosestPointsInput, root: ClosestPointsCall): RecursiveCalls<ClosestPointsInput, Points> {
        const points = input.points.copy().points.sort((a, b) => a.x - b.x)
        const midX = points[Math.floor(points.length / 2)].x
        return {
            "Left": new ClosestPointsCall({
                points: new Points(points.slice().filter(p => p.x <= midX))
            }, root),
            "Right": new ClosestPointsCall({
                points: new Points(points.slice().filter(p => p.x > midX))
            }, root)
        }
    }

    combine(): Points {
        const points = this.input().points.copy().points
        const midIndex = Math.floor(points.length / 2)
        const midX = points[midIndex].x
        const leftResult = this.calls()["Left"].result().copy()
        const rightResult = this.calls()["Right"].result().copy()

        let minDist = Infinity
        let closestPair: [Point, Point] = [points[0], points[1]]

        if (leftResult.points.length > 1) {
            minDist = distance(leftResult.points[0], leftResult.points[1])
            closestPair = [leftResult.points[0], leftResult.points[1]]
        }

        if (rightResult.points.length > 1) {
            const rightDist = distance(rightResult.points[0], rightResult.points[1])
            if (rightDist < minDist) {
                minDist = rightDist
                closestPair = [rightResult.points[0], rightResult.points[1]]
            }
        }

        if (leftResult.points.length === 1 && rightResult.points.length === 1) {
            minDist = distance(leftResult.points[0], rightResult.points[0])
            closestPair = [leftResult.points[0], rightResult.points[0]]
        }

        const strip: Point[] = []
        for (const point of points) {
            if (Math.abs(point.x - midX) < minDist) {
                strip.push(point)
            }
        }
        strip.sort((a, b) => a.y - b.y)

        for (let i = 0; i < strip.length; i++) {
            for (let j = i + 1; j < strip.length && strip[j].y - strip[i].y < minDist; j++) {
                const stripDist = distance(strip[i], strip[j])
                if (stripDist < minDist) {
                    minDist = stripDist
                    closestPair = [strip[i], strip[j]]
                }
            }
        }

        return new Points(closestPair)
    }

    dividedDetails(input: ClosestPointsInput): CallDetails {
        const points = input.points.copy().points.sort((a, b) => a.x - b.x)
        const midX = points[Math.floor(points.length / 2)].x
        return [{
            text: `We divide the points into two halves based on the median x-coordinate.`,
            valueKeyframes: [{
                "Points": new Points(points.map(p => p.coloured(p.x <= midX ? "blue" : "red")))
                    .addLine(new Line(new Point(midX, 0), new Point(midX, 1))),
            }],
            highlightedCalls: ["Left", "Right"]
        }]
    }

    solvedDetails(input: ClosestPointsInput): CallDetails {
        const points = input.points.copy().points.sort((a, b) => a.x - b.x)
        const midX = points[Math.floor(points.length / 2)].x
        const leftPair = this.calls()["Left"].result().copy().points
        const rightPair = this.calls()["Right"].result().copy().points
        const closestPair = this.result().copy().points
        const minDist = distance(closestPair[0], closestPair[1])

        // Examine the strip
        const stripPoints = points.filter(p => Math.abs(p.x - midX) < minDist)
        const leftStripPoints = stripPoints.filter(p => p.x <= midX)
        const rightStripPoints = stripPoints.filter(p => p.x > midX)
        const stripPairs = []
        let closestStripPair: [Point, Point] | null = null
        let stripMinDist = Infinity
        for (let i = 0; i < leftStripPoints.length; i++) {
            for (let j = 0; j < rightStripPoints.length; j++) {
                const stripDist = distance(leftStripPoints[i], rightStripPoints[j])
                stripPairs.push([leftStripPoints[i].copy(), rightStripPoints[j].copy()])
                if (stripDist < stripMinDist) {
                    stripMinDist = stripDist
                    closestStripPair = [leftStripPoints[i].copy(), rightStripPoints[j].copy()]
                }
            }
        }

        return [

            leftPair.length > 1 ? {
                text: "We examine the closest pair in the left half.",
                valueKeyframes: [{
                    "Points": new Points(points
                        .map(p => p.copy().coloured(leftPair.some(lp => lp.equals(p)) ? "red" : "gray"))
                    ).addLine(new Line(new Point(midX, 0), new Point(midX, 1)).coloured("black"))
                }],
                highlightedCalls: ["Left"]
            } : {
                text: "The left half contains only one point, so there is no closest pair.",
                valueKeyframes: [{
                    "Points": new Points(points.map(p => p.coloured("gray")))
                        .addLine(new Line(new Point(midX, 0), new Point(midX, 1)).coloured("black"))
                }],
                highlightedCalls: ["Left"]
            },

            rightPair.length > 1 ? {
                text: "We examine the closest pair in the right half.",
                valueKeyframes: [{
                    "Points": new Points(
                        points.map(p => p.copy().coloured(rightPair.some(rp => rp.equals(p)) ? "blue" : "gray"))
                    ).addLine(new Line(new Point(midX, 0), new Point(midX, 1)).coloured("black"))
                }],
                highlightedCalls: ["Right"]
            } : {
                text: "The right half contains only one point, so there is no closest pair.",
                valueKeyframes: [{
                    "Points": new Points(points.map(p => p.coloured("gray")))
                        .addLine(new Line(new Point(midX, 0), new Point(midX, 1)).coloured("black"))
                }],
                highlightedCalls: ["Right"]
            },

            ...(stripPairs.length > 0 ? [
                {
                    text: "We examine pairs of points that fit two criteria. First, the points must be within the previously identified minimum distance of the median x-coordinate. Second, the points must come from different halves of the set.",
                    valueKeyframes: stripPairs.map(pair => ({
                        "Points": new Points(
                            points
                                .map(p => p.copy().coloured(Math.abs(p.x - midX) < minDist ? "black" : "gray"))
                                .map(p => p.copy().coloured(pair.some(cp => cp.equals(p)) ? "purple" : p.colour))
                        ).addLine(new Line(new Point(midX, 0), new Point(midX, 1)).coloured("black"))
                            .addLine(new Line(new Point(midX - minDist, 0), new Point(midX - minDist, 1)).coloured("black"))
                            .addLine(new Line(new Point(midX + minDist, 0), new Point(midX + minDist, 1)).coloured("black"))
                    }))
                },
                closestStripPair !== null ? {
                    text: "And find the closest points that satisfy both criteria.",
                    valueKeyframes: [{
                        "Points": new Points(
                            points
                                .map(p => p.copy().coloured(Math.abs(p.x - midX) < minDist ? "black" : "gray"))
                                .map(p => p.copy().coloured(closestStripPair.some(cp => cp.equals(p)) ? "purple" : p.colour))
                        ).addLine(new Line(new Point(midX, 0), new Point(midX, 1)).coloured("black"))
                            .addLine(new Line(new Point(midX - minDist, 0), new Point(midX - minDist, 1)).coloured("black"))
                            .addLine(new Line(new Point(midX + minDist, 0), new Point(midX + minDist, 1)).coloured("black"))
                    }]
                } : {
                    text: "There are no pairs of points that satisfy both criteria.",
                    valueKeyframes: [{
                        "Points": new Points(
                            points
                                .map(p => p.copy().coloured(Math.abs(p.x - midX) < minDist ? "black" : "gray"))
                        ).addLine(new Line(new Point(midX, 0), new Point(midX, 1)).coloured("black"))
                            .addLine(new Line(new Point(midX - minDist, 0), new Point(midX - minDist, 1)).coloured("black"))
                            .addLine(new Line(new Point(midX + minDist, 0), new Point(midX + minDist, 1)).coloured("black"))
                    }]
                }
            ] : [{
                text: "There are no further pairs to consider.",
                valueKeyframes: [{
                    "Points": new Points(points.map(p => p.coloured("gray")))
                }]
            }]),

            {
                text: "The closest pair is either the closest pair from the left half, the closest pair from the right half, or the closest pair in the strip which straddles the median.",
                valueKeyframes: [{
                    "Closest Pair": new Points(
                        points
                            .map(p => p.copy().coloured(leftPair.some(cp => cp.equals(p)) ? "red" : "gray"))                                .map(p => p.copy().coloured(rightPair.some(cp => cp.equals(p)) ? "blue" : p.colour))
                            .map(p => p.copy().coloured(closestPair.some(cp => cp.equals(p)) ? "green" : p.colour))
                    )
                }],
                highlightedCalls: ["Left", "Right"]
            }
        ]
    }

}

export class ClosestPointsBaseCase extends BaseCase<ClosestPointsInput, Points> {

    solve(): Points {
        const points = this.input().points.copy().points
        if (points.length === 1) {
            return new Points([points[0]])
        } else if (points.length === 2) {
            return new Points([points[0], points[1]])
        } else {
            const dists = [
                distance(points[0], points[1]),
                distance(points[0], points[2]),
                distance(points[1], points[2])
            ]
            const minDist = Math.min(...dists)
            if (minDist === dists[0]) {
                return new Points([points[0], points[1]])
            } else if (minDist === dists[1]) {
                return new Points([points[0], points[2]])
            } else {
                return new Points([points[1], points[2]])
            }
        }
    }


    dividedDetails(input: ClosestPointsInput): CallDetails {
        return [{
            text: `The set contains ${input.points.points.length} points, which is one of our base cases.`,
            valueKeyframes: [{
                "Points": new Points(input.points.copy().points.map(p => p.coloured("gray")))
            }]
        }]
    }

    solvedDetails(input: ClosestPointsInput): CallDetails {
        const points = input.points.copy().points
        if (points.length === 1) {
            return [{
                text: "The set contains only one point, so there is no closest pair.",
                valueKeyframes: [{
                    "Closest Pair": new Points(points.map(p => p.coloured("gray")))
                }]
            }]
        } else if (points.length === 2) { 
            return [{
                text: "The closest pair is nothing but the two points themselves.",
                valueKeyframes: [{
                    "Closest Pair": new Points(points.map(p => p.coloured("green")))
                }]
            }]
        } else {
            const closestPair = this.solve().copy().points
            return [{
                text: "We directly compute and return the closest pair of points in the set.",
                valueKeyframes: [{
                    "Closest Pair": new Points(points.map(p => p.copy().coloured(p.equals(closestPair[0]) || p.equals(closestPair[1]) ? "green" : "gray")))
                }]
            }]
        }
    }

}


function distance(p1: Point, p2: Point): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}
