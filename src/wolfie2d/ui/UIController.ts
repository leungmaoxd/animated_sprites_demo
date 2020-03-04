/*
 * This provides responses to UI input.
 */
import {AnimatedSprite} from "../scene/sprite/AnimatedSprite"
import {SceneGraph} from "../scene/SceneGraph"
import { AnimatedSpriteType } from "../scene/sprite/AnimatedSpriteType";
import { Game } from "../Game";
import { TextToRender } from "../rendering/TextRenderer";
const DEMO_SPRITE_STATES = {
    FORWARD_STATE: 'FORWARD',
    REVERSE_STATE: 'REVERSE'
};

export class UIController {
    private spriteToDrag : AnimatedSprite;
    private scene : SceneGraph;
    private dragOffsetX : number;
    private dragOffsetY : number;
    private val : Array<AnimatedSpriteType>;
    private game : Game;
    public constructor(game : Game) {
        this.game = game;
    }

    public init(canvasId : string, initScene : SceneGraph) : void {
        this.val = new Array();
        this.spriteToDrag = null;
        this.scene = initScene;
        this.dragOffsetX = -1;
        this.dragOffsetY = -1;
        let canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(canvasId);
        canvas.addEventListener("mousedown", this.mouseDownHandler);
        canvas.addEventListener("mousemove", this.mouseMoveHandler);
        canvas.addEventListener("mouseup", this.mouseUpHandler);
        canvas.addEventListener("dblclick", this.doubleClickHandler);
        canvas.addEventListener("click", this.singleClickHandler);
        // canvas.addEventListener("mouseover", this.mouseoverHandler);
    }
    
    public mouseoverHandler = (event:MouseEvent):void => {
        let mouseX : number = event.clientX;
        let mouseY : number = event.clientY;
        let sprite : AnimatedSprite = this.scene.getSpriteAt(mouseX, mouseY);
        let textRenderer = this.game.getRenderingSystem().getTextRenderer();
        let list = textRenderer.getTextList();
        for (let text of list){
            if (text.id == "spriteDetails"){
                if(sprite != null){
                    text.text= sprite.toString+"";
                }else{
                    text.text= "";
                }
            }
        }
    }

    public doubleClickHandler = (event:MouseEvent) : void => {
        let mousePressX : number = event.clientX;
        let mousePressY : number = event.clientY;
        this.spriteToDrag = this.scene.getSpriteAt(mousePressX, mousePressY);
        console.log("mousePressX: " + mousePressX);
        console.log("mousePressY: " + mousePressY);
        console.log("sprite: " + this.spriteToDrag);
        if (this.spriteToDrag != null) {
            // remove from view or delete
            this.scene.removeAnimatedSprite(this.spriteToDrag);
        }

        
        let mouseX : number = event.clientX;
        let mouseY : number = event.clientY;
        
        let sprite : AnimatedSprite = this.scene.getSpriteAt(mouseX, mouseY);
        let textRenderer = this.game.getRenderingSystem().getTextRenderer();
        let list = textRenderer.getTextList();
        for (let text of list){
            if (text.id == "spriteDetails"){
                if(sprite != null){
                    text.update = function(){
                        text.text= sprite.toString();
                    }
                }else{
                    text.update = function(){
                        text.text= "";
                    }
                }
            }
        }
    }
    
    private getSpriteTypes() : void{
        let temp : Array<AnimatedSprite> = new Array();
        let list = this.scene.scope();
        while(list.length != 0){
            let item = list.pop() as AnimatedSprite;
            let type : AnimatedSpriteType = item.getSpriteType();
            if(this.val.indexOf(type) <0){
                this.val.push(type);
            }
            temp.push(item);
        }
        while(temp.length != 0){
            list.push(temp.pop());
        }
    }

    public singleClickHandler = (event:MouseEvent) : void => {
        this.getSpriteTypes();
        let mousePressX : number = event.clientX;
        let mousePressY : number = event.clientY;
        if (this.scene.getSpriteAt(mousePressX,mousePressY) == null){
            let type : AnimatedSpriteType;
            if(Math.random() >.5){
                type = this.val[0];
            }else{
                type = this.val[1];
            }
            let sprite : AnimatedSprite = new AnimatedSprite(type, DEMO_SPRITE_STATES.FORWARD_STATE);
            sprite.getPosition().set(mousePressX, mousePressY, 0.0, 1.0);
            this.scene.addAnimatedSprite(sprite);
            let textRenderer = this.game.getRenderingSystem().getTextRenderer();
            let list = textRenderer.getTextList();
            for (let text of list){
                if (text.id == "spriteDetails"){
                    if(sprite != null){
                        text.update = function(){
                            text.text= sprite.toString();
                        }
                    }else{
                        text.update = function(){
                            text.text= "";
                        }
                    }
                }
            }
        }
    }

    public mouseDownHandler = (event : MouseEvent) : void => {
        let mousePressX : number = event.clientX;
        let mousePressY : number = event.clientY;
        let sprite : AnimatedSprite = this.scene.getSpriteAt(mousePressX, mousePressY);
        console.log("mousePressX: " + mousePressX);
        console.log("mousePressY: " + mousePressY);
        console.log("sprite: " + sprite);
        if (sprite != null) {
            // START DRAGGING IT
            this.spriteToDrag = sprite;
            this.dragOffsetX = sprite.getPosition().getX() - mousePressX;
            this.dragOffsetY = sprite.getPosition().getY() - mousePressY;
        }
    }
    
    public mouseMoveHandler = (event : MouseEvent) : void => {
        let mouseX : number = event.clientX;
        let mouseY : number = event.clientY;
        
        let sprite : AnimatedSprite = this.scene.getSpriteAt(mouseX, mouseY);
        let textRenderer = this.game.getRenderingSystem().getTextRenderer();
        let list = textRenderer.getTextList();
        for (let text of list){
            if (text.id == "spriteDetails"){
                if(sprite != null){
                    text.update = function(){
                        text.text= sprite.toString();
                    }
                    console.log(text.text);
                }else{
                    text.update = function(){
                        text.text= "";
                    }
                }
            }
        }
        if (this.spriteToDrag != null) {
            this.spriteToDrag.getPosition().set(mouseX + this.dragOffsetX, 
                                                mouseY + this.dragOffsetY, 
                                                this.spriteToDrag.getPosition().getZ(), 
                                                this.spriteToDrag.getPosition().getW());
        }

    }

    public mouseUpHandler = (event : MouseEvent) : void => {
        this.spriteToDrag = null;
    }
}