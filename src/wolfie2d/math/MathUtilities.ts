/*
 * MathUtilities provides a number of services for rendering using 4x4 matrices, like
 * transformting (i.e. translation, rotation, and scaling) 3d or 2d points from world
 * coordinate systems to screen coordinate systems.
 */
import {Matrix} from './Matrix'
import {Vector3} from './Vector3'

export namespace MathUtilities {
    export function determinant4x4(result : Matrix) : number {
        let det0 = result.get(0, 0) * (
            (result.get(1, 1) * ((result.get(2, 2) * result.get(3, 3)) - (result.get(2, 3) * result.get(3, 2))))
            - (result.get(1, 2) * ((result.get(2, 1) * result.get(3, 3)) - (result.get(2, 3) * result.get(3, 1))))
            + (result.get(1, 3) * ((result.get(2, 1) * result.get(3, 2)) - (result.get(3, 1) * result.get(2, 2)))));
        let det1 = result.get(0, 1) * (
            (result.get(1, 0) * ((result.get(2, 2) * result.get(3, 3)) - (result.get(2, 3) * result.get(3, 2))))
            - (result.get(1, 2) * ((result.get(2, 0) * result.get(3, 3)) - (result.get(3, 0) * result.get(2, 3))))
            + (result.get(1, 3) * ((result.get(2, 0) * result.get(3, 2)) - (result.get(3, 0) * result.get(2, 2)))));
        let det2 = result.get(0, 2) * (
            (result.get(1, 0) * ((result.get(2, 1) * result.get(3, 3)) - (result.get(2, 3) * result.get(3, 1))))
            - (result.get(1, 1) * ((result.get(2, 0) * result.get(3, 3)) - (result.get(2, 3) * result.get(3, 0))))
            + (result.get(1, 3) * ((result.get(2, 0) * result.get(3, 1)) - (result.get(2, 1) * result.get(3, 0)))));
        let det3 = result.get(0, 3) * (
            (result.get(1, 0) * ((result.get(2, 1) * result.get(3, 2)) - (result.get(2, 2) * result.get(3, 1))))
            - (result.get(1, 1) * ((result.get(2, 0) * result.get(3, 2)) - (result.get(2, 2) * result.get(3, 0))))
            + (result.get(1, 2) * ((result.get(2, 0) * result.get(3, 1)) - (result.get(2, 1) * result.get(3, 0)))));
        let det = det0 - det1 + det2 - det3;
        console.log("det = " + det0 + " + " + det1 + " + " + det2 + " + " + det3);
        return det;
    }
    export function identity(result : Matrix) : void {
        if (result.getRows() === result.getColumns()) {
            for (let i = 0; i < result.getRows(); i++) {
                for (let j = 0; j < result.getColumns(); j++) {
                    if (i === j)
                        result.set(1.0, i, j);
                    else
                        result.set(0.0, i, j);
                }
            }
        }
    }
    export function inverse(result : Matrix, mat : Matrix) : void {
        let det = this.determinant(mat);
        let m00 = mat.get(0, 0); let m01 = mat.get(0, 1); let m02 = mat.get(0, 2); let m03 = mat.get(0, 3);
        let m10 = mat.get(1, 0); let m11 = mat.get(1, 1); let m12 = mat.get(1, 2); let m13 = mat.get(1, 3);
        let m20 = mat.get(2, 0); let m21 = mat.get(2, 1); let m22 = mat.get(2, 2); let m23 = mat.get(2, 3);
        let m30 = mat.get(3, 0); let m31 = mat.get(3, 1); let m32 = mat.get(3, 2); let m33 = mat.get(3, 3);
        let temp = new Matrix(4, 4);
        temp.set((m12 * m23 * m31) - (m13 * m22 * m31) + (m13 * m21 * m32) - (m11 * m23 * m32) - (m12 * m21 * m33) + (m11 * m22 * m33), 0, 0);
        temp.set((m03 * m22 * m31) - (m02 * m23 * m31) - (m03 * m21 * m32) + (m01 * m23 * m32) + (m02 * m21 * m33) - (m01 * m22 * m33), 0, 1);
        temp.set((m02 * m13 * m31) - (m03 * m12 * m31) + (m03 * m11 * m32) - (m01 * m13 * m32) - (m02 * m11 * m33) + (m01 * m12 * m33), 0, 2);
        temp.set((m03 * m12 * m21) - (m02 * m13 * m21) - (m03 * m11 * m22) + (m01 * m13 * m22) + (m02 * m11 * m23) - (m01 * m12 * m23), 0, 3);
        temp.set((m13 * m22 * m30) - (m12 * m23 * m30) - (m13 * m20 * m32) + (m10 * m23 * m32) + (m12 * m20 * m33) - (m10 * m22 * m33), 1, 0);
        temp.set((m02 * m23 * m30) - (m03 * m22 * m30) + (m03 * m20 * m32) - (m00 * m23 * m32) - (m02 * m20 * m33) + (m00 * m22 * m33), 1, 1);
        temp.set((m03 * m12 * m30) - (m02 * m13 * m30) - (m03 * m10 * m32) + (m00 * m13 * m32) + (m02 * m10 * m33) - (m00 * m12 * m33), 1, 2);
        temp.set((m02 * m13 * m20) - (m03 * m12 * m20) + (m03 * m10 * m22) - (m00 * m13 * m22) - (m02 * m10 * m23) + (m00 * m12 * m23), 1, 3);
        temp.set((m11 * m23 * m30) - (m13 * m21 * m30) + (m13 * m20 * m31) - (m10 * m23 * m31) - (m11 * m20 * m33) + (m10 * m21 * m33), 2, 0);
        temp.set((m03 * m21 * m30) - (m01 * m23 * m30) - (m03 * m20 * m31) + (m00 * m23 * m31) + (m01 * m20 * m33) - (m00 * m21 * m33), 2, 1);
        temp.set((m01 * m13 * m30) - (m03 * m11 * m30) + (m03 * m10 * m31) - (m00 * m13 * m31) - (m01 * m10 * m33) + (m00 * m11 * m33), 2, 2);
        temp.set((m03 * m11 * m20) - (m01 * m13 * m20) - (m03 * m10 * m21) + (m00 * m13 * m21) + (m01 * m10 * m23) - (m00 * m11 * m23), 2, 3);
        temp.set((m12 * m21 * m30) - (m11 * m22 * m30) - (m12 * m20 * m31) + (m10 * m22 * m31) + (m11 * m20 * m32) - (m10 * m21 * m32), 3, 0);
        temp.set((m01 * m22 * m30) - (m02 * m21 * m30) + (m02 * m20 * m31) - (m00 * m22 * m31) - (m01 * m20 * m32) + (m00 * m21 * m32), 3, 1);
        temp.set((m02 * m11 * m30) - (m01 * m12 * m30) - (m02 * m10 * m31) + (m00 * m12 * m31) + (m01 * m10 * m32) - (m00 * m11 * m32), 3, 2);
        temp.set((m01 * m12 * m20) - (m02 * m11 * m20) + (m02 * m10 * m21) - (m00 * m12 * m21) - (m01 * m10 * m22) + (m00 * m11 * m22), 3, 3);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result.set(temp.get(i, j) / det, i, j);
            }
        }
    }
    export function model(result : Matrix, translation : Vector3, rotation : Vector3, scale : Vector3) : void {
        // TRANSLATION MATRIX	
        let translationMatrix = new Matrix(4, 4);
        this.identity(translationMatrix);
        this.translate(translationMatrix, translation);

        // ROTATION MATRIX
        let rotationMatrix = new Matrix(4, 4);
        this.identity(rotationMatrix);
        this.rotate(rotationMatrix, rotation);

        // SCALING MATRIX
        let scaleMatrix = new Matrix(4, 4);
        this.identity(scaleMatrix);
        this.scale(scaleMatrix, scale);

        // AND NOW MULTIPLY THEM TOGETHER IN THE CORRECT ORDER
        let tempMatrix = new Matrix(4, 4);
        this.multiply(tempMatrix, translationMatrix, rotationMatrix);
        this.multiply(result, tempMatrix, scaleMatrix);
    }

    export function multiply(result : Matrix, mat0 : Matrix, mat1 : Matrix) : void {
        // result MIGHT BE mat0 OR mat1 SO IT'S BEST IF WE
        // CALCULATE TEMP VALUES FIRST BEFORE ASSIGNMENT
        let r00 = (mat0.get(0, 0) * mat1.get(0, 0))
            + (mat0.get(0, 1) * mat1.get(1, 0))
            + (mat0.get(0, 2) * mat1.get(2, 0))
            + (mat0.get(0, 3) * mat1.get(3, 0));
        let r10 = (mat0.get(1, 0) * mat1.get(0, 0))
            + (mat0.get(1, 1) * mat1.get(1, 0))
            + (mat0.get(1, 2) * mat1.get(2, 0))
            + (mat0.get(1, 3) * mat1.get(3, 0));
        let r20 = (mat0.get(2, 0) * mat1.get(0, 0))
            + (mat0.get(2, 1) * mat1.get(1, 0))
            + (mat0.get(2, 2) * mat1.get(2, 0))
            + (mat0.get(2, 3) * mat1.get(3, 0));
        let r30 = (mat0.get(3, 0) * mat1.get(0, 0))
            + (mat0.get(3, 1) * mat1.get(1, 0))
            + (mat0.get(3, 2) * mat1.get(2, 0))
            + (mat0.get(3, 3) * mat1.get(3, 0));
        let r01 = (mat0.get(0, 0) * mat1.get(0, 1))
            + (mat0.get(0, 1) * mat1.get(1, 1))
            + (mat0.get(0, 2) * mat1.get(2, 1))
            + (mat0.get(0, 3) * mat1.get(3, 1));
        let r11 = (mat0.get(1, 0) * mat1.get(0, 1))
            + (mat0.get(1, 1) * mat1.get(1, 1))
            + (mat0.get(1, 2) * mat1.get(2, 1))
            + (mat0.get(1, 3) * mat1.get(3, 1));
        let r21 = (mat0.get(2, 0) * mat1.get(0, 1))
            + (mat0.get(2, 1) * mat1.get(1, 1))
            + (mat0.get(2, 2) * mat1.get(2, 1))
            + (mat0.get(2, 3) * mat1.get(3, 1));
        let r31 = (mat0.get(3, 0) * mat1.get(0, 1))
            + (mat0.get(3, 1) * mat1.get(1, 1))
            + (mat0.get(3, 2) * mat1.get(2, 1))
            + (mat0.get(3, 3) * mat1.get(3, 1));
        let r02 = (mat0.get(0, 0) * mat1.get(0, 2))
            + (mat0.get(0, 1) * mat1.get(1, 2))
            + (mat0.get(0, 2) * mat1.get(2, 2))
            + (mat0.get(0, 3) * mat1.get(3, 2));
        let r12 = (mat0.get(1, 0) * mat1.get(0, 2))
            + (mat0.get(1, 1) * mat1.get(1, 2))
            + (mat0.get(1, 2) * mat1.get(2, 2))
            + (mat0.get(1, 3) * mat1.get(3, 2));
        let r22 = (mat0.get(2, 0) * mat1.get(0, 2))
            + (mat0.get(2, 1) * mat1.get(1, 2))
            + (mat0.get(2, 2) * mat1.get(2, 2))
            + (mat0.get(2, 3) * mat1.get(3, 2));
        let r32 = (mat0.get(3, 0) * mat1.get(0, 2))
            + (mat0.get(3, 1) * mat1.get(1, 2))
            + (mat0.get(3, 2) * mat1.get(2, 2))
            + (mat0.get(3, 3) * mat1.get(3, 2));
        let r03 = (mat0.get(0, 0) * mat1.get(0, 3))
            + (mat0.get(0, 1) * mat1.get(1, 3))
            + (mat0.get(0, 2) * mat1.get(2, 3))
            + (mat0.get(0, 3) * mat1.get(3, 3));
        let r13 = (mat0.get(1, 0) * mat1.get(0, 3))
            + (mat0.get(1, 1) * mat1.get(1, 3))
            + (mat0.get(1, 2) * mat1.get(2, 3))
            + (mat0.get(1, 3) * mat1.get(3, 3));
        let r23 = (mat0.get(2, 0) * mat1.get(0, 3))
            + (mat0.get(2, 1) * mat1.get(1, 3))
            + (mat0.get(2, 2) * mat1.get(2, 3))
            + (mat0.get(2, 3) * mat1.get(3, 3));
        let r33 = (mat0.get(3, 0) * mat1.get(0, 3))
            + (mat0.get(3, 1) * mat1.get(1, 3))
            + (mat0.get(3, 2) * mat1.get(2, 3))
            + (mat0.get(3, 3) * mat1.get(3, 3));

        // NOW PUT ALL THE CALCULATED VALUES IN THE result MATRIX
        result.set(r00, 0, 0);
        result.set(r10, 1, 0);
        result.set(r20, 2, 0);
        result.set(r30, 3, 0);
        result.set(r01, 0, 1);
        result.set(r11, 1, 1);
        result.set(r21, 2, 1);
        result.set(r31, 3, 1);
        result.set(r02, 0, 2);
        result.set(r12, 1, 2);
        result.set(r22, 2, 2);
        result.set(r32, 3, 2);
        result.set(r03, 0, 3);
        result.set(r13, 1, 3);
        result.set(r23, 2, 3);
        result.set(r33, 3, 3);
    }

    export function projection(result : Matrix, nearZ : number, farZ : number, viewportWidth : number, viewportHeight : number, fovY : number) : void {
        let aspectRatio = viewportWidth / viewportHeight;
        let fieldOfViewY = this.math.degreesToRadians(fovY);
        let fieldOfViewX = 2 * Math.atan(Math.tan(fieldOfViewY / 2) * aspectRatio);

        // WE'LL USE THESE AS SHORTHAND FOR LOADING OUR MATRIX
        let n = nearZ;
        let f = farZ;
        let r = Math.tan(fieldOfViewX / 2) * n;
        let t = Math.tan(fieldOfViewY / 2) * n;

        // 0-3
        result.set(n / r, 0, 0);
        result.set(0.0, 0, 1);
        result.set(0.0, 0, 2);
        result.set(0.0, 0, 3);
        // 4-7
        result.set(0.0, 1, 0);
        result.set(n / t, 1, 1);
        result.set(0.0, 1, 2);
        result.set(0.0, 1, 3);
        // 8-11
        result.set(0.0, 2, 0);
        result.set(0.0, 2, 1);
        result.set((-(f + n)) / (f - n), 2, 2);
        result.set((-2 * f * n) / (f - n), 2, 3);
        // 12-15 
        result.set(0.0, 3, 0);
        result.set(0.0, 3, 1);
        result.set(-1.0, 3, 2);
        result.set(0.0, 3, 3);
    }

    export function rotate(result : Matrix, rotationVector : Vector3) : void {
        // START WITH THE X-AXIS ROTATION
        let xRotationMatrix = new Matrix(4, 4);
        this.identity(xRotationMatrix);
        let thetaX = rotationVector.getThetaX();
        xRotationMatrix.set(Math.cos(thetaX), 1, 1);
        xRotationMatrix.set(Math.sin(thetaX), 2, 1);
        xRotationMatrix.set(-1 * Math.sin(thetaX), 1, 2);
        xRotationMatrix.set(Math.cos(thetaX), 2, 2);

        // START WITH THE Y-AXIS ROTATION
        let yRotationMatrix = new Matrix(4, 4);
        this.identity(yRotationMatrix);
        let thetaY = rotationVector.getThetaY();
        yRotationMatrix.set(Math.cos(thetaY), 0, 0);
        yRotationMatrix.set(-1 * Math.sin(thetaY), 2, 0);
        yRotationMatrix.set(Math.sin(thetaY), 0, 2);
        yRotationMatrix.set(Math.cos(thetaY), 2, 2);

        // START WITH THE Z-AXIS ROTATION
        let zRotationMatrix = new Matrix(4, 4);
        this.identity(zRotationMatrix);
        let thetaZ = rotationVector.getThetaZ();
        zRotationMatrix.set(Math.cos(thetaZ), 0, 0);
        zRotationMatrix.set(Math.sin(thetaZ), 1, 0);
        zRotationMatrix.set(-1 * Math.sin(thetaZ), 0, 1);
        zRotationMatrix.set(Math.cos(thetaZ), 1, 1);

        // START WITH THE X-AXIS ROTATION
        let tempMatrix = new Matrix(4, 4);
        this.identity(tempMatrix);
        this.multiply(tempMatrix, xRotationMatrix, yRotationMatrix);
        this.multiply(result, tempMatrix, zRotationMatrix);
    }

    export function scale(result : Matrix, scaleVector : Vector3) : void {
        // START WITH THE IDENTITY MATRIX
        this.identity(result, scaleVector);

        // AND THEN LOAD IN THE TRANSLATION VALUES
        result.set(scaleVector.getX(), 0, 0);
        result.set(scaleVector.getY(), 1, 1);
        result.set(scaleVector.getZ(), 2, 2);
    }

    export function transform(result : Vector3, mat : Matrix, vec : Vector3) : void {
        result.setX((mat.get(0, 0) * vec.getX()) + (mat.get(0, 1) * vec.getY()) + (mat.get(0, 2) * vec.getZ()) + (mat.get(0, 3) * vec.getW()));
        result.setY((mat.get(1, 0) * vec.getX()) + (mat.get(1, 1) * vec.getY()) + (mat.get(1, 2) * vec.getZ()) + (mat.get(1, 3) * vec.getW()));
        result.setZ((mat.get(2, 0) * vec.getX()) + (mat.get(2, 1) * vec.getY()) + (mat.get(2, 2) * vec.getZ()) + (mat.get(2, 3) * vec.getW()));
        result.setW((mat.get(3, 0) * vec.getX()) + (mat.get(3, 1) * vec.getY()) + (mat.get(3, 2) * vec.getZ()) + (mat.get(3, 3) * vec.getW()));
    }

    export function translate(result : Matrix, translationVector : Vector3) : void {
        // START WITH THE IDENTITY MATRIX
        this.identity(result);

        // AND THEN LOAD IN THE TRANSLATION VALUES
        result.set(translationVector.getX(), 0, 3);
        result.set(translationVector.getY(), 1, 3);
        result.set(translationVector.getZ(), 2, 3);
    }

    export function transpose(result : Matrix, mat : Matrix) : void {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let temp = mat.get(i, j);
                result.set(temp, j, i);
            }
        }
    }

    export function view(result : Matrix, cameraPosition : Vector3, cameraOrientation : Vector3) : void {
        let pitch = this.math.degreesToRadians(cameraOrientation.getThetaX());
        let yaw = this.math.degreesToRadians(cameraOrientation.getThetaY());
        let roll = this.math.degreesToRadians(cameraOrientation.getThetaZ());

        // TO TRANSLATE
        let translateVector = this.math.vectorMath.createPositionVector();
        translateVector.set(-cameraPosition.getX(), -cameraPosition.getY(), -cameraPosition.getZ());
        let translateMatrix = new Matrix(4, 4);
        this.identity(translateMatrix);
        this.translate(translateMatrix, translateVector);

        // TO ROTATE
        let rotateVector = this.math.vectorMath.createRotationVector();
        rotateVector.set(-pitch, -yaw, -roll);
        let rotateMatrix = new Matrix(4, 4);
        this.rotate(rotateMatrix, rotateVector);

        // NOW COMBINE THE 2 MATRICES
        this.multiply(result, rotateMatrix, translateMatrix);
    }

    export function addVectors(result : Vector3, vec0 : Vector3, vec1 : Vector3) : void {
        for (let i = 0; i < vec0.getSize(); i++) {
            let total = vec0.getAt(i) + vec1.getAt(i);
            result.setAt(i, total);
        }
    }

    export function crossProduct(result : Vector3, vec0 : Vector3, vec1 : Vector3) : void {
        let result0 = (vec0.getY() * vec1.getZ())
            - (vec1.getY() * vec0.getZ());
        let result1 = (vec0.getZ() * vec1.getX())
            - (vec1.getZ() * vec0.getX());
        let result2 = (vec0.getX() * vec1.getY())
            - (vec1.getX() * vec0.getY());
        result.setX(result0);
        result.setY(result1);
        result.setZ(result2);
    }

    export function dotProduct(vec0 : Vector3, vec1 : Vector3) : number {
        let resultX = vec0.getX() * vec1.getX();
        let resultY = vec0.getY() * vec1.getY();
        let resultZ = vec0.getZ() * vec1.getZ();
        return resultX + resultY + resultZ;
    }

    export function multiplyVectors(result : Vector3, vec : Vector3, scalar : number) : void {
        let vecX = vec.getX() * scalar;
        let vecY = vec.getY() * scalar;
        let vecZ = vec.getZ() * scalar;
        result.setX(vecX);
        result.setY(vecY);
        result.setZ(vecZ);
    }

    export function normalize(result : Vector3, vec : Vector3) : void {
        let xSquared = vec.getX() * vec.getX();
        let ySquared = vec.getY() * vec.getY();
        let zSquared = vec.getZ() * vec.getZ();
        let distance = Math.sqrt(xSquared + ySquared + zSquared);
        result.setX(vec.getX() / distance);
        result.setY(vec.getY() / distance);
        result.setZ(vec.getZ() / distance);
    }

    export function subtractVectors(result : Vector3, vec0 : Vector3, vec1 : Vector3) : void {
        let resultX = vec0.getX() - vec1.getX();
        let resultY = vec0.getY() - vec1.getY();
        let resultZ = vec0.getZ() - vec1.getZ();
        result.setX(resultX);
        result.setY(resultY);
        result.setZ(resultZ);
    }
}