/*
 * Game is the focal point of the application, it has 4 subsystems,
 * the resource manager, the scene graph, the rendering system, and
 * the UI controller. In addition it serves as the game loop, providing
 * both an update and draw function that is called on a schedule.
 */
import {GameLoopTemplate} from './loop/GameLoopTemplate'
import {WebGLGameRenderingSystem} from './rendering/WebGLGameRenderingSystem'
import {SceneGraph} from './scene/SceneGraph'
import {AnimatedSprite} from './scene/sprite/AnimatedSprite'
import {ResourceManager} from './files/ResourceManager'
import {UIController} from './ui/UIController'

export class Game extends GameLoopTemplate {
    private resourceManager : ResourceManager = new ResourceManager();
    private sceneGraph : SceneGraph = new SceneGraph();
    private renderingSystem : WebGLGameRenderingSystem = new WebGLGameRenderingSystem();
    private uiController : UIController = new UIController();

    public constructor() {
        super();
    }

    public getRenderingSystem() : WebGLGameRenderingSystem {
        return this.renderingSystem;
    }

    public getResourceManager() : ResourceManager {
        return this.resourceManager;
    }

    public getSceneGraph() : SceneGraph {
        return this.sceneGraph;
    }

    public init(gameCanvasId : string, textCanvasId : string) : void {
        this.renderingSystem.init(gameCanvasId, textCanvasId);
        this.uiController.init(gameCanvasId, this.sceneGraph);
    }

    public begin() : void {
    }

    /*
     * This draws the game. Note that we are not currently using the 
     * interpolation value, but could once physics is involved.
     */
    public draw(interpolationPercentage : number) : void {
        // GET THE VISIBLE SET FROM THE SCENE GRAPH
        let visibleSprites : Array<AnimatedSprite>;
        visibleSprites = <Array<AnimatedSprite>>this.sceneGraph.scope();

        // RENDER THE VISIBLE SET, WHICH SHOULD ALL BE RENDERABLE
        this.renderingSystem.render(visibleSprites);
    }

    /**
     * Updates the scene.
     */
    public update(delta : number) : void {
        this.sceneGraph.update(delta);
    }
    
    /**
     * Updates the FPS counter.
     */
    public end(fps : number, panic : boolean) : void {
        if (panic) {
            var discardedTime = Math.round(this.resetFrameDelta());
            console.warn('Main loop panicked, probably because the browser tab was put in the background. Discarding ' + discardedTime + 'ms');
        }
    }
}