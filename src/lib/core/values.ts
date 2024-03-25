////////////////////////////////////////////////////////////////////////////////////////////////////
// We define wrappers for our input and output types to augment them with
// styling information for display in the visualisation.
////////////////////////////////////////////////////////////////////////////////////////////////////

export abstract class Value {
    abstract copy(): ThisType<this>;
    abstract copyDefault(): ThisType<this>;
    abstract equals(other: ThisType<this>): boolean;
}


////////////////////////////////////////////////////////////////////////////////////////////////////
// Concrete
////////////////////////////////////////////////////////////////////////////////////////////////////

export class NumberValue extends Value {
    value: number;
    colour: string = "black";
    struck: boolean = false;

    constructor(value: number) {
        super();
        this.value = value;
    }

    copy(): NumberValue {
        const copy = new NumberValue(this.value)
        copy.colour = this.colour;
        copy.struck = this.struck;
        return copy;
    }

    copyDefault(): NumberValue {
        return new NumberValue(this.value);
    }

    equals(other: NumberValue): boolean {
        return this.value === other.value;
    }

    coloured(colour: string): NumberValue {
        const copy = this.copy();
        copy.colour = colour;
        return copy;
    }

    struckThrough(struck: boolean): NumberValue {
        const copy = this.copy();
        copy.struck = struck;
        return copy;
    }
}


export class NumberList extends Value {
    values: NumberValue[];

    constructor(values: NumberValue[]) {
        super();
        this.values = values;
    }

    static fromArray(values: number[]): NumberList {
        return new NumberList(values.map(v => new NumberValue(v)));
    }

    copy(): NumberList {
        return new NumberList(this.values.map(v => v.copy()));
    }

    copyDefault(): NumberList {
        return new NumberList(this.values.map(v => v.copyDefault()));
    }

    equals(other: NumberList): boolean {
        if (this.values.length !== other.values.length) {
            return false;
        }
        return this.values.every((v, i) => v.equals(other.values[i]));
    }

    coloured(colour: string): NumberList {
        return new NumberList(this.values.map(v => v.coloured(colour)));
    }

}


export class Matrix extends Value {
    matrix: NumberValue[][];

    constructor(matrix: NumberValue[][]) {
        super();
        this.matrix = matrix;
    }

    static fromArray(values: number[][]): Matrix {
        return new Matrix(values.map(row => row.map(v => new NumberValue(v))))
    }

    static zeroes(rows: number, cols: number): Matrix {
        return new Matrix(
            new Array(rows)
                .fill(null)
                .map(() => new Array(cols).fill(null).map(() => new NumberValue(0)))
        );
    }

    copy(): Matrix {
        return new Matrix(this.matrix.map(row => row.map(v => v.copy())));
    }

    copyDefault(): Matrix {
        return new Matrix(this.matrix.map(row => row.map(v => v.copyDefault())));
    }

    equals(other: Matrix): boolean {
        if (this.matrix.length !== other.matrix.length) {
            return false;
        }
        return this.matrix.every((row, i) => {
            if (row.length !== other.matrix[i].length) {
                return false;
            }
            return row.every((v, j) => v.equals(other.matrix[i][j]));
        });
    }

    addEmptyRow(cols: number): void {
        const newRow = new Array(cols).fill(null).map(() => new NumberValue(0));
        this.matrix.push(newRow);
    }

    removeLastRow(): void {
        this.matrix.pop();
    }

    addEmptyColumn(): void {
        this.matrix.forEach(row => row.push(new NumberValue(0)));
    }

    removeLastColumn(): void {
        this.matrix.forEach(row => row.pop());
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Geometric
////////////////////////////////////////////////////////////////////////////////////////////////////

export class Point extends Value {
    x: number;
    y: number;
    colour: string = "black";

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }

    copy(): Point {
        const copy = new Point(this.x, this.y);
        copy.colour = this.colour;
        return copy;
    }

    copyDefault(): Point {
        return new Point(this.x, this.y);
    }

    equals(other: Point): boolean {
        return this.x === other.x && this.y === other.y;
    }

    coloured(colour: string): Point {
        const copy = this.copy();
        copy.colour = colour;
        return copy;
    }
}


export class Line extends Value {
    start: Point;
    end: Point;
    colour: string = "black";

    constructor(start: Point, end: Point) {
        super();
        this.start = start;
        this.end = end;
    }

    copy(): Line {
        const copy = new Line(this.start.copy(), this.end.copy());
        copy.colour = this.colour;
        return copy;
    }

    copyDefault(): Line {
        return new Line(this.start.copyDefault(), this.end.copyDefault());
    }

    equals(other: Line): boolean {
        return this.start.equals(other.start) && this.end.equals(other.end);
    }

    coloured(colour: string): Line {
        const copy = this.copy();
        copy.colour = colour;
        return copy;
    }
}


export class Points extends Value {
    points: Point[];
    lines: Line[] = []

    constructor(points: Point[]) {
        super();
        this.points = points;
    }

    copy(): Points {
        const copy = new Points(this.points.map(p => p.copy()))
        copy.lines = this.lines.map(l => l.copy())
        return copy;
    }

    copyDefault(): Points {
        return new Points(this.points.map(p => p.copyDefault()))
            .withLines(this.lines.map(l => l.copyDefault()));
    }

    equals(other: Points): boolean {
        // Equality is order-dependent
        if (this.points.length !== other.points.length) {
            return false;
        }
        return this.points.every((p, i) => p.equals(other.points[i]));
    }

    withLines(lines: Line[]): Points {
        const copy = this.copy();
        copy.lines = lines;
        return copy;
    }

    addLine(line: Line): Points {
        const copy = this.copy();
        copy.lines.push(line);
        return copy;
    }

    addLines(lines: Line[]): Points {
        const copy = this.copy();
        copy.lines.push(...lines);
        return copy;
    }

    addPoint(point: Point): void {
        this.points.push(point);
    }

    removePoint(index: number): void {
        this.points.splice(index, 1);
    }
}
