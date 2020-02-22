/**
 * Vector3
 * 
 * The Vector3 class can be used for any 2d or 3d point, vector, 
 * or rotation (i.e. angles of orientation).
 */
export class Vector3 {
    private vec : Float32Array;
    private size : number;

    public constructor() {
        this.vec = new Float32Array(4);
        for (let i = 0; i < 4; i++)
            this.vec[i] = 0.0;
        this.size = 4;
    }

    public getSize() : number {
        return this.size;
    }

    public getAt(index : number) : number {
        return this.vec[index];
    }

    public getX() : number {
        return this.vec[0];
    }

    public getY() : number {
        return this.vec[1];
    }

    public getZ() : number {
        return this.vec[2];
    }

    public getW() : number {
        return this.vec[3];
    }

    public getThetaX() : number {
        return this.vec[0];
    }

    public getThetaY() : number {
        return this.vec[1];
    }

    public getThetaZ() : number {
        return this.vec[2];
    }

    public set(init0 : number, init1 : number, init2 : number, init3 : number) : void {
        this.vec[0] = init0;
        this.vec[1] = init1;
        this.vec[2] = init2;
        this.vec[3] = init3;
    }

    public setAt(index : number, value : number) : void {
        this.vec[index] = value;
    }

    public setX(initX : number) : void {
        this.vec[0] = initX;
    }

    public setY(initY : number) : void {
        this.vec[1] = initY;
    }

    public setZ(initZ : number) : void {
        this.vec[2] = initZ;
    }

    public setW(initW : number) : void {
        this.vec[3] = initW;
    }

    public setThetaX(initThetaX : number) : void {
        this.setX(initThetaX);
    }

    public setThetaY(initThetaY : number) : void {
        this.setY(initThetaY);
    }

    public setThetaZ(initThetaZ : number) : void {
        this.setZ(initThetaZ);
    }

    public print() : void {
        let text = "[";
        for (let i = 0; i < this.size; i++) {
            text += this.vec[i];
            if (i < (this.size - 1)) {
                text += ", ";
            }
        }
        text += "]";
        console.log(text);
    }
}