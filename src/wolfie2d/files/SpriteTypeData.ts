/*
 * SpriteTypeData, AnimationStateData, and AnimationFrameData are interfaces
 * representing animated sprite types that we use for loading such data
 * from JSON files.
 */
export interface SpriteTypeData {
    name: string,
    spriteSheetImage: string,
    spriteWidth: number;
    spriteHeight: number;
    columns: number;
    rows: number;
    animations: Array<AnimationStateData>;
}

export interface AnimationStateData {
    name: "string";
    frames: Array<AnimationFrameData>;
}

export interface AnimationFrameData {
    index: number;
    duration: number;
}