// We define wrappers for our input and output types to augment them with
// styling information for display in the visualisation.

export class NumberValue {
	value: number;
	colour: string = 'black';
	struck: boolean = false;

	constructor(value: number) {
		this.value = value;
	}

	copy(): NumberValue {
		return new NumberValue(this.value).coloured(this.colour).struckThrough(this.struck);
	}

	copyDefault(): NumberValue {
		return new NumberValue(this.value);
	}

	coloured(colour: string): NumberValue {
		this.colour = colour;
		return this;
	}

	struckThrough(struck: boolean): NumberValue {
		this.struck = struck;
		return this;
	}
}

export class NumberList {
	values: NumberValue[];

	constructor(values: NumberValue[]) {
		this.values = values;
	}

	copy(): NumberList {
		return new NumberList(this.values.map((v) => v.copy()));
	}

	copyDefault(): NumberList {
		return new NumberList(this.values.map((v) => v.copyDefault()));
	}

	coloured(colour: string): NumberList {
		this.values.forEach((v) => v.coloured(colour));
		return this;
	}
}

export class Matrix {
	matrix: NumberValue[][];

	constructor(matrix: NumberValue[][]) {
		this.matrix = matrix;
	}

	static zeroes(rows: number, cols: number): Matrix {
		return new Matrix(
			new Array(rows).fill(null).map(() => new Array(cols).fill(null).map(() => new NumberValue(0)))
		);
	}

	copy(): Matrix {
		return new Matrix(this.matrix.map((row) => row.map((v) => v.copy())));
	}

	copyDefault(): Matrix {
		return new Matrix(this.matrix.map((row) => row.map((v) => v.copyDefault())));
	}

	addEmptyRow(cols: number): void {
		const newRow = new Array(cols).fill(null).map(() => new NumberValue(0));
		this.matrix.push(newRow);
	}

	removeLastRow(): void {
		this.matrix.pop();
	}

	addEmptyColumn(): void {
		this.matrix.forEach((row) => row.push(new NumberValue(0)));
	}

	removeLastColumn(): void {
		this.matrix.forEach((row) => row.pop());
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Geometric
////////////////////////////////////////////////////////////////////////////////////////////////////

export class Point {
	x: number;
	y: number;
	colour: string = 'black';

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	copy(): Point {
		return new Point(this.x, this.y).coloured(this.colour);
	}

	copyDefault(): Point {
		return new Point(this.x, this.y);
	}

	equals(other: Point): boolean {
		return this.x === other.x && this.y === other.y;
	}

	coloured(colour: string): Point {
		this.colour = colour;
		return this;
	}
}

export class Line {
	start: Point;
	end: Point;
	colour: string = 'black';

	constructor(start: Point, end: Point) {
		this.start = start;
		this.end = end;
	}

	copy(): Line {
		return new Line(this.start.copy(), this.end.copy()).coloured(this.colour);
	}

	copyDefault(): Line {
		return new Line(this.start.copyDefault(), this.end.copyDefault());
	}

	coloured(colour: string): Line {
		this.colour = colour;
		return this;
	}
}

export class Points {
	points: Point[];
	lines: Line[] = [];

	constructor(points: Point[]) {
		this.points = points;
	}

	copy(): Points {
		return new Points(this.points.map((p) => p.copy())).withLines(this.lines.map((l) => l.copy()));
	}

	copyDefault(): Points {
		return new Points(this.points.map((p) => p.copyDefault())).withLines(
			this.lines.map((l) => l.copyDefault())
		);
	}

	withLines(lines: Line[]): Points {
		this.lines = lines;
		return this;
	}

	addLine(line: Line): Points {
		this.lines.push(line);
		return this;
	}

	addLines(lines: Line[]): Points {
		this.lines = this.lines.concat(lines);
		return this;
	}

	addPoint(point: Point): void {
		this.points.push(point);
	}

	removePoint(index: number): void {
		this.points.splice(index, 1);
	}
}
