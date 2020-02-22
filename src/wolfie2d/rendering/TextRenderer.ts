/*
 * This class renders text to a canvas, updated each frame.
 */
import {HashTable} from '../data/HashTable'

export class TextToRender {
    public id : string;
    public text : string;
    public x : number;
    public y : number;
    public update : Function;
    public fontFamily : string;
    public fontSize : number;
    public fontColor : string;
    public properties : HashTable<object>;

    public constructor(initId : string, initText : string, initX : number, initY : number, initUpdate : Function) {
        this.id = initId;
        this.text = initText;
        this.x = initX;
        this.y = initY;
        this.update = initUpdate;
        this.fontFamily = "";
        this.fontSize = 0;
        this.fontColor = "";
        this.properties = {};
    }
}

export class TextRenderer {
    private textToRender : Array<TextToRender>;
    private textCanvas : HTMLCanvasElement;
    private textCanvasWidth : number;
    private textCanvasHeight : number;
    private textCtx : CanvasRenderingContext2D;
    private defaultFontFamily : string;
    private defaultFontSize : number;
    private defaultFontColor : string;

    public constructor(textCanvasId : string, initFontFamily : string, initFontSize : number, initFontColor : string) {
        this.textToRender = new Array();
        this.textCanvas = <HTMLCanvasElement>document.getElementById(textCanvasId);
        this.textCanvas.width = window.innerWidth;
        this.textCanvas.height = window.innerHeight;
        this.textCanvasWidth = this.textCanvas.width;
        this.textCanvasHeight = this.textCanvas.height;
        this.textCtx = this.textCanvas.getContext("2d");
        this.defaultFontFamily = initFontFamily;
        this.defaultFontSize = initFontSize;
        this.defaultFontColor = initFontColor;
    }
    
    public addTextToRender(textToAdd : TextToRender) : void {
        textToAdd.fontFamily = this.defaultFontFamily;
        textToAdd.fontSize = this.defaultFontSize;
        textToAdd.fontColor = this.defaultFontColor;
        this.textToRender.push(textToAdd);
    }

    public clear() : void {
        this.textToRender = [];
    }

    public getCanvasWidth() : number {
        return this.textCanvasWidth;
    }

    public getCanvasHeight() : number {
        return this.textCanvasHeight;
    }

    public render() : void {
        this.textCtx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
        for (var i = 0; i < this.textToRender.length; i++) {
            var textToRender = this.textToRender[i];
            textToRender.update();
            this.textCtx.font = "" + textToRender.fontSize + "px " + textToRender.fontFamily;
            this.textCtx.fillStyle = textToRender.fontColor;
            this.textCtx.fillText(textToRender.text, textToRender.x, textToRender.y);
        }
    }
}