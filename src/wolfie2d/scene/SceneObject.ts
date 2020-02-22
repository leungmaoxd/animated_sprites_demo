import {Vector3} from '../math/Vector3'

/**
 * SceneObject
 * 
 * A SceneObject is something that can be placed into the scene graph. It has
 * a position, rotation, and scale in the game world. Note that its position
 * is typically its centered location, so if we're talking about a 2d box, 
 * it would be the center of that box.
 */
export abstract class SceneObject {
    private position : Vector3;
    private rotation : Vector3;
    private scale : Vector3;

    public constructor() {
        this.position = new Vector3();
        this.rotation = new Vector3();
        this.scale = new Vector3();

        // CLEAR ALL VALUES
        this.position.set(0.0, 0.0, 0.0, 1.0);
        this.rotation.set(0.0, 0.0, 0.0, 1.0);
        this.scale.set(1.0, 1.0, 1.0, 1.0);
    }

    public getPosition() : Vector3 {
        return this.position;
    }    

    public getRotation() : Vector3 {
        return this.rotation;
    }

    public getScale() : Vector3 {
        return this.scale;
    }

    public abstract contains(testX : number, testY : number) : boolean;
}