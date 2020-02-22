/*
 * This serves as the subsystem that manages all game rendering.
 */
import {TextRenderer} from './TextRenderer'
import {WebGLGameSpriteRenderer} from './WebGLGameSpriteRenderer'
import {AnimatedSprite} from '../scene/sprite/AnimatedSprite'
import {WebGLGameTexture } from './WebGLGameTexture';

export class WebGLGameRenderingSystem {
    private renderingCanvas : HTMLCanvasElement;
    private webGL : WebGLRenderingContext;
    private spriteRenderer : WebGLGameSpriteRenderer;
    private textRenderer : TextRenderer;
    private canvasWidth : number;
    private canvasHeight : number;

    public constructor() {}

    public getTextureConstant(id : number) : number {
        // WE ONLY HAVE 4 HERE, WE SHOULD HAVE A BETTER WAY OF DOING THIS
        switch(id) {
            case 0: return this.webGL.TEXTURE0;
            case 1: return this.webGL.TEXTURE1;
            case 2: return this.webGL.TEXTURE3;
            default: return this.webGL.TEXTURE4;
        }
    }

    public getWebGL() : WebGLRenderingContext {
        return this.webGL;
    }

    public getSpriteRenderer() : WebGLGameSpriteRenderer {
        return this.spriteRenderer;
    }

    public getTextRenderer() : TextRenderer {
        return this.textRenderer;
    }

    public init(renderingCanvasId : string, textCanvasId : string) : void {
        // FIRST SETUP webGL
        this.renderingCanvas = <HTMLCanvasElement>document.getElementById(renderingCanvasId);
        this.renderingCanvas.width = window.innerWidth;
        this.renderingCanvas.height = window.innerHeight;
        this.canvasWidth = this.renderingCanvas.width;
        this.canvasHeight = this.renderingCanvas.height;
        this.webGL = this.renderingCanvas.getContext("webgl");

        // IF THE USER'S MACHINE/BROWSER DOESN'T SUPPORT
        // WebGL THEN THERE'S NO POINT OF GOING ON
        if (!this.webGL) {
            // PROVIDE SOME FEEDBACK THAT WebGL WON'T WORK BECAUSE
            // THE USER'S' GRAPHICS CARD IS FOR THE BIRDS
            console.error("WebGL is not supported by this device");

            // AND END INITIALIZATION
            return;
        }

        // WebGL IS SUPPORTED, SO INIT EVERYTHING THAT USES IT

        // MAKE THE CLEAR COLOR BLACK
        this.setClearColor(0.0, 0.0, 0.0, 1.0);

        // ENABLE DEPTH TESTING
        this.webGL.disable(this.webGL.DEPTH_TEST);
        this.webGL.enable(this.webGL.BLEND);
        this.webGL.blendFunc(this.webGL.SRC_ALPHA, this.webGL.ONE_MINUS_SRC_ALPHA);

        // TURN ON BACKFACE CULLING
        this.webGL.enable(this.webGL.CULL_FACE);

        // THIS SPECIFIES THAT WE'RE USING THE ENTIRE CANVAS
        this.webGL.viewport(0, 0, this.canvasWidth, this.canvasHeight);

        // NOW MAKE THE SHADER FOR DRAWING THIS THING
        this.spriteRenderer = new WebGLGameSpriteRenderer();
        this.spriteRenderer.init(this.webGL);
        
        // THIS WILL STORE OUR TEXT
        this.textRenderer = new TextRenderer(textCanvasId, "serif", 18, "#FFFF00");
    }

    public initWebGLTexture(textureToInit : WebGLGameTexture, textureId : number, image : HTMLImageElement, callback : Function) : void {
        textureToInit.width = image.width;
        textureToInit.height = image.height;

        // CREATE A WebGL TEXTURE ON THE GPU
        textureToInit.webGLTexture = this.webGL.createTexture();
        textureToInit.webGLTextureId = textureId;

        // FLIP THE IMAGE'S y-AXIS
        //webGL.pixelStorei(webGL.UNPACK_FLIP_Y_WEBGL, 1);

        // ACTIVATE THE WebGL TEXTURE ON THE GPU
        //let textureNumName : string = "TEXTURE" + textureId;
        let textureNameConstant : number = this.getTextureConstant(textureId);
        this.webGL.activeTexture(textureNameConstant);

        // BIND THE TEXTURE TO A 2D TYPE
        this.webGL.bindTexture(this.webGL.TEXTURE_2D, textureToInit.webGLTexture);

        // SPECIFY RENDERING SETTINGS
        this.webGL.texParameteri(this.webGL.TEXTURE_2D, this.webGL.TEXTURE_MIN_FILTER, this.webGL.LINEAR);

        // SET THE IMAGE FOR THE TEXTURE
        this.webGL.texImage2D(this.webGL.TEXTURE_2D, 0, this.webGL.RGBA, this.webGL.RGBA, this.webGL.UNSIGNED_BYTE, image);

        // KEEP IT FOR WHEN WE RENDER
        callback();
    }

    public setClearColor(r : number, g : number, b : number, a : number) : void {
        this.webGL.clearColor(r, g, b, a);
    }

    public render(visibleSet : Array<AnimatedSprite>) : void {
        // CLEAR THE CANVAS
        this.webGL.clear(this.webGL.COLOR_BUFFER_BIT | this.webGL.DEPTH_BUFFER_BIT);
        
        // RENDER THE SPRITES ON ONE CANVAS
        this.spriteRenderer.renderAnimatedSprites(this.webGL, this.canvasWidth, this.canvasHeight, visibleSet);
        
        // THEN THE TEXT ON ANOTHER OVERLAPPING CANVAS
        this.textRenderer.render();
    }
}