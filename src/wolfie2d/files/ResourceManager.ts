/*
 * ResourceManager.js
 *
 * This class is responsible for managing all shared resources. This means things
 * that may be needed by multiple game objects. In this application this means
 * textures for the purpose of GPU rendering and animated sprite types.
 */
import {SpriteTypeData, AnimationStateData, AnimationFrameData} from './SpriteTypeData'
import {HashTable} from '../data/HashTable'
import {WebGLGameRenderingSystem} from '../rendering/WebGLGameRenderingSystem'
import {WebGLGameTexture} from '../rendering/WebGLGameTexture'
import {AnimatedSpriteType} from '../scene/sprite/AnimatedSpriteType'

export class ResourceManager {
    // GAME TEXTURES 
    private gameTextures : Array<WebGLGameTexture> = new Array();
    private gameTextureIds : HashTable<number> = {};
    private numTexturesToLoad : number;
    private numTexturesLoaded : number;

    // ANIMATED SPRITE TYPES
    private gameSpriteTypes : Array<AnimatedSpriteType> = new Array();
    private gameSpriteTypeIds : HashTable<number> = {};
    private numSpriteTypesToLoad : number;
    private numSpriteTypesLoaded : number;

    public constructor() {}

    // ACCESSOR METHODS

    public getAnimatedSpriteTypeByIndex(typeIndex : number) : AnimatedSpriteType {
        return this.gameSpriteTypes[typeIndex];
    }

    public getAnimatedSpriteTypeById(typeId : string) : AnimatedSpriteType {
        let typeIndex : number = this.gameSpriteTypeIds[typeId];
        return this.getAnimatedSpriteTypeByIndex(typeIndex);
    }
    
    // ADDS A NEW SPRITE TYPE 
    public addAnimatedSpriteType(typeId : number, spriteType : AnimatedSpriteType) : void {
        this.gameSpriteTypes[typeId] = spriteType;
    }

    /*
     * Loads all the textures listed in the texturePaths argument and once
     * that is done it calls the callback function.
     */
    public loadTextures(    texturePaths : Array<string>, 
                            renderingSystem : WebGLGameRenderingSystem, 
                            callback : Function) : void {
        // THEN LOAD THE TEXTURES WE'LL BE USING
        this.numTexturesToLoad = texturePaths.length;
        this.numTexturesLoaded = 0;
        let thisResourceManager = this;
        let startNumTextures = this.gameTextures.length;
        for (let i : number = 0; i < this.numTexturesToLoad; i++) {
            let textureToLoad : WebGLGameTexture = new WebGLGameTexture();
            let textureId = startNumTextures + i;
            thisResourceManager.gameTextures[textureId] = textureToLoad;
            thisResourceManager.gameTextureIds[texturePaths[i]] = textureId;
            thisResourceManager.loadImage(texturePaths[i], textureId, function(id : number, image : HTMLImageElement) {
                renderingSystem.initWebGLTexture(textureToLoad, id, image, function() {
                    thisResourceManager.completeLoadingTexture(callback);
                });
            });
        }
    }

    /*
     * Loads all the sprite types listed in the spriteTypePaths argument and once
     * that is done it calls the callback function.
     */
    public loadSpriteTypes(spriteTypePaths : Array<string>, 
                    callback : Function) : void {
        // THEN LOAD THE TEXTURES WE'LL BE USING
        this.numSpriteTypesToLoad = spriteTypePaths.length;
        this.numSpriteTypesLoaded = 0;
        let thisResourceManager = this;
        let startNumSpriteTypes = this.gameSpriteTypes.length;
        for (let i : number = 0; i < this.numSpriteTypesToLoad; i++) {
            let spriteTypeId = startNumSpriteTypes + i;
            this.loadSpriteType(spriteTypePaths[i], spriteTypeId, function() {
                thisResourceManager.completeLoadingSpriteType(callback);
            });
        }
    }

    // PRIVATE HELPER METHODS

    // LOADS A NEW JSON FILE AND UPON COMPLETION CALLS THE callback FUNCTION
    private loadJsonFile(testFilePath : string, callback : Function) : void {
        let xobj : XMLHttpRequest = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', testFilePath, true);
        xobj.onreadystatechange = function () {
            if ((xobj.readyState == 4) && (xobj.status == 200)) {
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }

    // CHECKS TO SEE IF ALL TEXTURE LOADING IS COMPLETE, IF YES, callback IS INVOKED
    private completeLoadingTexture(callback : Function) : void {
        this.numTexturesLoaded++;
        if (this.numTexturesLoaded === this.numTexturesToLoad) {
            callback();
        }
    }

    /**
     * Loads an Image into RAM and once that process is complete it
     * calls the callback method argument, presumably to then load
     * it into GPU memory.
     */
    private loadImage(path : string, id : number, callback : Function) : void {
        // MAKE THE IMAGE
        var image = new Image();

        // ONCE THE IMAGE LOADING IS COMPLETED, THE CALLBACK WILL GET CALLED
        image.onload = function () { 
            callback(id, image); 
        }

        // START IMAGE LOADING
        image.src = path;
    }

    /*
     * This function loads a single sprite type resource from a JSON file and upon
     * completion calls the callback function.
     */
    private loadSpriteType(jsonFilePath : string, spriteTypeId : number, callback : Function) : void {
        let thisResourceManager : ResourceManager = this;
        this.loadJsonFile(jsonFilePath, function(jsonText : string) {
            let spriteType : AnimatedSpriteType = thisResourceManager.loadSpriteTypeData(jsonText);
            thisResourceManager.gameSpriteTypes[spriteTypeId] = spriteType;
            thisResourceManager.gameSpriteTypeIds[jsonFilePath] = spriteTypeId;
            callback();
        });
    }

    /*
     * This helper function loads all the json text into an AnimatedSpriteType
     * object and returns it.
     */
    private loadSpriteTypeData = (jsonText : string) : AnimatedSpriteType => {
        let jsonData : SpriteTypeData = <SpriteTypeData>JSON.parse(jsonText);
        let texturePath = jsonData.spriteSheetImage;
        let textureId = this.gameTextureIds[texturePath];
        let texture : WebGLGameTexture = this.gameTextures[textureId];
        let spriteWidth : number = jsonData.spriteWidth;
        let spriteHeight : number = jsonData.spriteHeight;
        let animatedSpriteType = new AnimatedSpriteType(texture, spriteWidth, spriteHeight);
        for (let i = 0; i < jsonData.animations.length; i++) {
            let animation = <AnimationStateData>jsonData.animations[i];
            animatedSpriteType.addAnimation(animation.name);
            for (var j = 0; j < animation.frames.length; j++) {
                var frame = animation.frames[j];
                animatedSpriteType.addAnimationFrame(animation.name, frame.index, frame.duration);
            }
        }
        return animatedSpriteType;
    }

    // CHECKS TO SEE IF ALL SPRITE TYPE LOADING IS COMPLETE, IF YES, callback IS INVOKED
    private completeLoadingSpriteType(callback : Function) : void {
        this.numSpriteTypesLoaded++;
        if (this.numSpriteTypesLoaded === this.numSpriteTypesToLoad) {
            callback();
        }
    }    
}