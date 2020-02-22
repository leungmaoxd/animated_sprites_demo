/*
 * A Matrix is used for transforming points from local
 * coordinates to world coordinates.
 */
export class Matrix {
    private mat : Float32Array;
    private rows : number;
    private columns : number;

    public constructor(rows : number, columns : number) {
        this.rows = rows;
        this.columns = columns;
        this.mat = new Float32Array(rows * columns);
        for (let i = 0; i < (rows * columns); i++)
            this.mat[i] = 0.0;
    }

    public getData() : Float32Array {
        return this.mat;
    }

    public getRows() : number {
        return this.rows;
    }

    public getColumns() : number {
        return this.columns;
    }

    public getIndex (rows : number, columns : number) : number {
        return (this.rows * columns) + rows;
    }
    
    public get (row : number, column : number) : number {
        let index = this.getIndex(row, column);
        let valueToReturn = this.mat[index];
        return valueToReturn;
    }

    public set (value : number, row : number, column : number) {
        let index = this.getIndex(row, column);
        this.mat[index] = value;
    }
    
    public print () : void {
        let maxWidth = 0;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let testNum = this.get(j, i) + "";
                if (testNum.length > maxWidth) {
                    maxWidth = testNum.length;
                }
            }
        }
        let text = "[ ";
        for (let i = 0; i < this.rows; i++) {
            if (i > 0)
                text += "  ";
            for (var j = 0; j < this.columns; j++) {
                var numText = this.get(i, j) + "";
                while (numText.length < maxWidth) {
                    numText = " " + numText;
                }
                text += numText;
                if (j < (this.columns - 1)) {
                    text += ",";
                }
                text += " ";
            }
            if (i < (this.rows - 1)) {
                text += "\n";
            }
            text += "]";
            console.log(text);
        }
    }
}