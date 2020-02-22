/*
 * This is a wrapper class for a WebGLProgram, i.e. a shader for custom rendering
 * using WebGL's programmable pipeline.
 */
export class WebGLGameShader {
    private program : WebGLProgram;
    private vertexShader : WebGLShader;
    private fragmentShader : WebGLShader;

    public constructor() {}

    public getProgram() : WebGLProgram {
        return this.program;
    }

    public init(webGL : WebGLRenderingContext, vSource : string, fSource : string) : void {
        this.vertexShader = <WebGLShader>this.createShader(webGL, webGL.VERTEX_SHADER, vSource);
        this.fragmentShader = <WebGLShader>this.createShader(webGL, webGL.FRAGMENT_SHADER, fSource);
        this.program = this.createShaderProgram(webGL, this.vertexShader, this.fragmentShader);
    }

    public createShader(webGL : WebGLRenderingContext, type : number, source : string) : WebGLShader {
        // MAKE A NEW SHADER OBJECT, LOAD IT'S SOURCE, AND COMPILE IT
        var shader = webGL.createShader(type);
        webGL.shaderSource(shader, source);
        webGL.compileShader(shader);

        // DID IT COMPILE?
        var success = webGL.getShaderParameter(shader, webGL.COMPILE_STATUS);
        if (success) {
            return shader;
        }

        // DISASTER
        console.log(webGL.getShaderInfoLog(shader));
        webGL.deleteShader(shader);
        return null;
    }

    public createShaderProgram(webGL : WebGLRenderingContext, vShader : WebGLShader, fShader : WebGLShader) : WebGLProgram {
        // MAKE THE GLSL SHADER PROGRAM
        let programToCreate = webGL.createProgram();

        // LINK THE VERT AND FRAG
        webGL.attachShader(programToCreate, vShader);
        webGL.attachShader(programToCreate, fShader);

        // NOW WE CAN LINK THE SHADER PROGRAM
        webGL.linkProgram(programToCreate);
        let linked : boolean = webGL.getProgramParameter(programToCreate, webGL.LINK_STATUS);

        // IS IT LINKED?
        if (!linked) {
            // DISASTER
            let errorFeedback : string = webGL.getProgramInfoLog(programToCreate);
            console.log(errorFeedback);

            // DISASTER
            console.log(webGL.getProgramInfoLog(programToCreate));
            webGL.deleteProgram(programToCreate);
        }
        return programToCreate;
    }
}