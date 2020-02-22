export abstract class GameLoopTemplate {
    // ALL INSTANCE VARIABLES WILL BE INITIALIZED VIA THE CONSTRUCTOR
    private fps: number;
    private simulationTimestep: number;
    private frameDelta: number;
    private lastFrameTimeMs: number;
    private fpsAlpha: number;
    private fpsUpdateInterval: number;
    private lastFpsUpdate: number;
    private framesSinceLastFpsUpdate: number;
    private numUpdateSteps: number;
    private minFrameDelay: number;
    private running: boolean;
    private started: boolean;
    private panic: boolean;
    private raf: number;

    constructor() {
        // An exponential moving average of the frames per second.
        this.fps = 60;

        // The amount of time (in milliseconds) to simulate each time update() runs.
        // See `MainLoop.setSimulationTimestep()` for details.
        this.simulationTimestep = 1000 / this.fps;

        // The cumulative amount of in-app time that hasn't been simulated yet.
        // See the comments inside animate() for details.
        this.frameDelta = 0;

        // The timestamp in milliseconds of the last time the main loop was run.
        // Used to compute the time elapsed between frames.
        this.lastFrameTimeMs = 0;

        // A factor that affects how heavily to weight more recent seconds'
        // performance when calculating the average frames per second. Valid values
        // range from zero to one inclusive. Higher values result in weighting more
        // recent seconds more heavily.
        this.fpsAlpha = 0.9;

        // The minimum duration between updates to the frames-per-second estimate.
        // Higher values increase accuracy, but result in slower updates.
        this.fpsUpdateInterval = 1000;

        // The timestamp (in milliseconds) of the last time the `fps` moving
        // average was updated.
        this.lastFpsUpdate = 0;

        // The number of frames delivered since the last time the `fps` moving
        // average was updated (i.e. since `lastFpsUpdate`).
        this.framesSinceLastFpsUpdate = 0;

        // The number of times update() is called in a given frame. This is only
        // relevant inside of animate(), but a reference is held externally so that
        // this variable is not marked for garbage collection every time the main
        // loop runs.
        this.numUpdateSteps = 0;

        // The minimum amount of time in milliseconds that must pass since the last
        // frame was executed before another frame can be executed. The
        // multiplicative inverse caps the FPS (the default of zero means there is
        // no cap).
        this.minFrameDelay = 0;

        // Whether the main loop is running.
        this.running = false;

        // `true` if `MainLoop.start()` has been called and the most recent time it
        // was called has not been followed by a call to `MainLoop.stop()`. This is
        // different than `running` because there is a delay of a few milliseconds
        // after `MainLoop.start()` is called before the application is considered
        // "running." This delay is due to waiting for the next frame.
        this.started = false;

        // Whether the simulation has fallen too far behind real time.
        // Specifically, `panic` will be set to `true` if too many updates occur in
        // one frame. This is only relevant inside of animate(), but a reference is
        // held externally so that this variable is not marked for garbage
        // collection every time the main loop runs.
        this.panic = false;
    }

    /**
     * Gets how many milliseconds should be simulated by every run of update().
     *
     * See `MainLoop.setSimulationTimestep()` for details on this value.
     *
     * @return {Number}
     *   The number of milliseconds that should be simulated by every run of
     *   {@link #setUpdate update}().
     */
    getSimulationTimestep(): number {
        return this.simulationTimestep;
    }

    /**
     * Sets how many milliseconds should be simulated by every run of update().
     *
     * The perceived frames per second (FPS) is effectively capped at the
     * multiplicative inverse of the simulation timestep. That is, if the
     * timestep is 1000 / 60 (which is the default), then the maximum perceived
     * FPS is effectively 60. Decreasing the timestep increases the maximum
     * perceived FPS at the cost of running {@link #setUpdate update}() more
     * times per frame at lower frame rates. Since running update() more times
     * takes more time to process, this can actually slow down the frame rate.
     * Additionally, if the amount of time it takes to run update() exceeds or
     * very nearly exceeds the timestep, the application will freeze and crash
     * in a spiral of death (unless it is rescued; see `MainLoop.setEnd()` for
     * an explanation of what can be done if a spiral of death is occurring).
     *
     * The exception to this is that interpolating between updates for each
     * render can increase the perceived frame rate and reduce visual
     * stuttering. See `MainLoop.setDraw()` for an explanation of how to do
     * this.
     *
     * If you are considering decreasing the simulation timestep in order to
     * raise the maximum perceived FPS, keep in mind that most monitors can't
     * display more than 60 FPS. Whether humans can tell the difference among
     * high frame rates depends on the application, but for reference, film is
     * usually displayed at 24 FPS, other videos at 30 FPS, most games are
     * acceptable above 30 FPS, and virtual reality might require 75 FPS to
     * feel natural. Some gaming monitors go up to 144 FPS. Setting the
     * timestep below 1000 / 144 is discouraged and below 1000 / 240 is
     * strongly discouraged. The default of 1000 / 60 is good in most cases.
     *
     * The simulation timestep should typically only be changed at
     * deterministic times (e.g. before the main loop starts for the first
     * time, and not in response to user input or slow frame rates) to avoid
     * introducing non-deterministic behavior. The update timestep should be
     * the same for all players/users in multiplayer/multi-user applications.
     *
     * See also `MainLoop.getSimulationTimestep()`.
     *
     * @param {Number} timestep
     *   The number of milliseconds that should be simulated by every run of
     *   {@link #setUpdate update}().
     */
    setSimulationTimestep(timestep: number): void {
        this.simulationTimestep = timestep;
    }

    /**
     * Returns the exponential moving average of the frames per second.
     *
     * @return {Number}
     *   The exponential moving average of the frames per second.
     */
    getFPS(): number {
        return this.fps;
    }

    /**
     * Gets the maximum frame rate.
     *
     * Other factors also limit the FPS; see `MainLoop.setSimulationTimestep`
     * for details.
     *
     * See also `MainLoop.setMaxAllowedFPS()`.
     *
     * @return {Number}
     *   The maximum number of frames per second allowed.
     */
    getMaxAllowedFPS(): number {
        return 1000 / this.minFrameDelay;
    }

    /**
     * Sets a maximum frame rate.
     *
     * See also `MainLoop.getMaxAllowedFPS()`.
     *
     * @param {Number} [fps=Infinity]
     *   The maximum number of frames per second to execute. If Infinity or not
     *   passed, there will be no FPS cap (although other factors do limit the
     *   FPS; see `MainLoop.setSimulationTimestep` for details). If zero, this
     *   will stop the loop, and when the loop is next started, it will return
     *   to the previous maximum frame rate. Passing negative values will stall
     *   the loop until this function is called again with a positive value.
     *
     * @chainable
     */
    setMaxAllowedFPS(fps: number): void {
        if (typeof fps === 'undefined') {
            fps = Infinity;
        }
        if (fps === 0) {
            this.stop();
        }
        else {
            // Dividing by Infinity returns zero.
            this.minFrameDelay = 1000 / fps;
        }
    }

    /**
     * Reset the amount of time that has not yet been simulated to zero.
     *
     * This introduces non-deterministic behavior if called after the
     * application has started running (unless it is being reset, in which case
     * it doesn't matter). However, this can be useful in cases where the
     * amount of time that has not yet been simulated has grown very large
     * (for example, when the application's tab gets put in the background and
     * the browser throttles the timers as a result). In applications with
     * lockstep the player would get dropped, but in other networked
     * applications it may be necessary to snap or ease the player/user to the
     * authoritative state and discard pending updates in the process. In
     * non-networked applications it may also be acceptable to simply resume
     * the application where it last left off and ignore the accumulated
     * unsimulated time.
     *
     * @return {Number}
     *   The cumulative amount of elapsed time in milliseconds that has not yet
     *   been simulated, but is being discarded as a result of calling this
     *   function.
     */
    resetFrameDelta() : number {
        var oldFrameDelta = this.frameDelta;
        this.frameDelta = 0;
        return oldFrameDelta;
    }

    /**
     * Starts the main loop.
     *
     * Note that the application is not considered "running" immediately after
     * this function returns; rather, it is considered "running" after the
     * application draws its first frame. The distinction is that event
     * handlers should remain paused until the application is running, even
     * after `MainLoop.start()` is called. Check `MainLoop.isRunning()` for the
     * current status. To act after the application starts, register a callback
     * with requestAnimationFrame() after calling this function and execute the
     * action in that callback. It is safe to call `MainLoop.start()` multiple
     * times even before the application starts running and without calling
     * `MainLoop.stop()` in between, although there is no reason to do this;
     * the main loop will only start if it is not already started.
     *
     * See also `MainLoop.stop()`.
     */
    start(): void {
        if (!this.started) {
            // Since the application doesn't start running immediately, track
            // whether this function was called and use that to keep it from
            // starting the main loop multiple times.
            this.started = true;

            // In the main loop, draw() is called after update(), so if we
            // entered the main loop immediately, we would never render the
            // initial state before any updates occur. Instead, we run one
            // frame where all we do is draw, and then start the main loop with
            // the next frame.
            this.raf = requestAnimationFrame(this.startLoop.bind(this));
        }
    }

    startLoop(timestamp : number): void {
        // Render the initial state before any updates occur.
        this.draw(1);

        // The application isn't considered "running" until the
        // application starts drawing.
        this.running = true;

        // Reset variables that are used for tracking time so that we
        // don't simulate time passed while the application was paused.
        this.lastFrameTimeMs = timestamp;
        this.lastFpsUpdate = timestamp;
        this.framesSinceLastFpsUpdate = 0;

        // Start the main loop.
        this.raf = window.requestAnimationFrame(this.animate.bind(this));
    }

    /**
     * Returns whether the main loop is currently running.
     *
     * See also `MainLoop.start()` and `MainLoop.stop()`.
     *
     * @return {Boolean}
     *   Whether the main loop is currently running.
     */
    isRunning(): boolean {
        return this.running;
    }

    /**
     * Stops the main loop.
     *
     * Event handling and other background tasks should also be paused when the
     * main loop is paused.
     *
     * Note that pausing in multiplayer/multi-user applications will cause the
     * player's/user's client to become out of sync. In this case the
     * simulation should exit, or the player/user needs to be snapped to their
     * updated position when the main loop is started again.
     *
     * See also `MainLoop.start()` and `MainLoop.isRunning()`.
     */
    stop(): void {
        this.running = false;
        this.started = false;
        window.cancelAnimationFrame(this.raf);
    }

    /**
     * The main loop that runs updates and rendering.
     * 
     * @param {DOMHighResTimeStamp} timestamp
     * The current timestamp. In practice this is supplied by
     * requestAnimationFrame at the time that it starts to fire callbacks. This
     * should only be used for comparison to other timestamps because the epoch
     * (i.e. the "zero" time) depends on the engine running this code. In engines
     * that support `DOMHighResTimeStamp` (all modern browsers except iOS Safari
     * 8) the epoch is the time the page started loading, specifically
     * `performance.timing.navigationStart`. Everywhere else, including node.js,
     * the epoch is the Unix epoch (1970-01-01T00:00:00Z).
     * 
     * @ignore
     */
    animate(timestamp : number): void {
        // Run the loop again the next time the browser is ready to render.
        // We set rafHandle immediately so that the next frame can be canceled
        // during the current frame.
        this.raf = window.requestAnimationFrame(this.animate.bind(this));

        // Throttle the frame rate (if minFrameDelay is set to a non-zero value by
        // `MainLoop.setMaxAllowedFPS()`).
        if (timestamp < this.lastFrameTimeMs + this.minFrameDelay) {
            return;
        }

        // frameDelta is the cumulative amount of in-app time that hasn't been
        // simulated yet. Add the time since the last frame. We need to track total
        // not-yet-simulated time (as opposed to just the time elapsed since the
        // last frame) because not all actually elapsed time is guaranteed to be
        // simulated each frame. See the comments below for details.
        this.frameDelta += timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;

        // Run any updates that are not dependent on time in the simulation. See
        // `MainLoop.setBegin()` for additional details on how to use this.
        this.begin(timestamp, this.frameDelta);

        // Update the estimate of the frame rate, `fps`. Approximately every
        // second, the number of frames that occurred in that second are included
        // in an exponential moving average of all frames per second. This means
        // that more recent seconds affect the estimated frame rate more than older
        // seconds.
        if (timestamp > this.lastFpsUpdate + this.fpsUpdateInterval) {
            // Compute the new exponential moving average.
            this.fps =
                // Divide the number of frames since the last FPS update by the
                // amount of time that has passed to get the mean frames per second
                // over that period. This is necessary because slightly more than a
                // second has likely passed since the last update.
                this.fpsAlpha * this.framesSinceLastFpsUpdate * 1000 / (timestamp - this.lastFpsUpdate) +
                (1 - this.fpsAlpha) * this.fps;

            // Reset the frame counter and last-updated timestamp since their
            // latest values have now been incorporated into the FPS estimate.
            this.lastFpsUpdate = timestamp;
            this.framesSinceLastFpsUpdate = 0;
        }
        // Count the current frame in the next frames-per-second update. This
        // happens after the previous section because the previous section
        // calculates the frames that occur up until `timestamp`, and `timestamp`
        // refers to a time just before the current frame was delivered.
        this.framesSinceLastFpsUpdate++;

        /*
         * A naive way to move an object along its X-axis might be to write a main
         * loop containing the statement `obj.x += 10;` which would move the object
         * 10 units per frame. This approach suffers from the issue that it is
         * dependent on the frame rate. In other words, if your application is
         * running slowly (that is, fewer frames per second), your object will also
         * appear to move slowly, whereas if your application is running quickly
         * (that is, more frames per second), your object will appear to move
         * quickly. This is undesirable, especially in multiplayer/multi-user
         * applications.
         *
         * One solution is to multiply the speed by the amount of time that has
         * passed between rendering frames. For example, if you want your object to
         * move 600 units per second, you might write `obj.x += 600 * delta`, where
         * `delta` is the time passed since the last frame. (For convenience, let's
         * move this statement to an update() function that takes `delta` as a
         * parameter.) This way, your object will move a constant distance over
         * time. However, at low frame rates and high speeds, your object will move
         * large distances every frame, which can cause it to do strange things
         * such as move through walls. Additionally, we would like our program to
         * be deterministic. That is, every time we run the application with the
         * same input, we would like exactly the same output. If the time between
         * frames (the `delta`) varies, our output will diverge the longer the
         * program runs due to accumulated rounding errors, even at normal frame
         * rates.
         *
         * A better solution is to separate the amount of time simulated in each
         * update() from the amount of time between frames. Our update() function
         * doesn't need to change; we just need to change the delta we pass to it
         * so that each update() simulates a fixed amount of time (that is, `delta`
         * should have the same value each time update() is called). The update()
         * function can be run multiple times per frame if needed to simulate the
         * total amount of time passed since the last frame. (If the time that has
         * passed since the last frame is less than the fixed simulation time, we
         * just won't run an update() until the the next frame. If there is
         * unsimulated time left over that is less than our timestep, we'll just
         * leave it to be simulated during the next frame.) This approach avoids
         * inconsistent rounding errors and ensures that there are no giant leaps
         * through walls between frames.
         *
         * That is what is done below. It introduces a new problem, but it is a
         * manageable one: if the amount of time spent simulating is consistently
         * longer than the amount of time between frames, the application could
         * freeze and crash in a spiral of death. This won't happen as long as the
         * fixed simulation time is set to a value that is high enough that
         * update() calls usually take less time than the amount of time they're
         * simulating. If it does start to happen anyway, see `MainLoop.setEnd()`
         * for a discussion of ways to stop it.
         *
         * Additionally, see `MainLoop.setUpdate()` for a discussion of performance
         * considerations.
         *
         * Further reading for those interested:
         *
         * - http://gameprogrammingpatterns.com/game-loop.html
         * - http://gafferongames.com/game-physics/fix-your-timestep/
         * - https://gamealchemist.wordpress.com/2013/03/16/thoughts-on-the-javascript-game-loop/
         * - https://developer.mozilla.org/en-US/docs/Games/Anatomy
         */
        this.numUpdateSteps = 0;
        while (this.frameDelta >= this.simulationTimestep) {
            this.update(this.simulationTimestep);
            this.frameDelta -= this.simulationTimestep;

            /*
             * Sanity check: bail if we run the loop too many times.
             *
             * One way this could happen is if update() takes longer to run than
             * the time it simulates, thereby causing a spiral of death. For ways
             * to avoid this, see `MainLoop.setEnd()`. Another way this could
             * happen is if the browser throttles serving frames, which typically
             * occurs when the tab is in the background or the device battery is
             * low. An event outside of the main loop such as audio processing or
             * synchronous resource reads could also cause the application to hang
             * temporarily and accumulate not-yet-simulated time as a result.
             *
             * 240 is chosen because, for any sane value of simulationTimestep, 240
             * updates will simulate at least one second, and it will simulate four
             * seconds with the default value of simulationTimestep. (Safari
             * notifies users that the script is taking too long to run if it takes
             * more than five seconds.)
             *
             * If there are more updates to run in a frame than this, the
             * application will appear to slow down to the user until it catches
             * back up. In networked applications this will usually cause the user
             * to get out of sync with their peers, but if the updates are taking
             * this long already, they're probably already out of sync.
             */
            if (++this.numUpdateSteps >= 240) {
                this.panic = true;
                break;
            }
        }

        /*
         * Render the screen. We do this regardless of whether update() has run
         * during this frame because it is possible to interpolate between updates
         * to make the frame rate appear faster than updates are actually
         * happening. See `MainLoop.setDraw()` for an explanation of how to do
         * that.
         *
         * We draw after updating because we want the screen to reflect a state of
         * the application that is as up-to-date as possible. (`MainLoop.start()`
         * draws the very first frame in the application's initial state, before
         * any updates have occurred.) Some sources speculate that rendering
         * earlier in the requestAnimationFrame callback can get the screen painted
         * faster; this is mostly not true, and even when it is, it's usually just
         * a trade-off between rendering the current frame sooner and rendering the
         * next frame later.
         *
         * See `MainLoop.setDraw()` for details about draw() itself.
         */
        this.draw(this.frameDelta / this.simulationTimestep);

        // Run any updates that are not dependent on time in the simulation. See
        // `MainLoop.setEnd()` for additional details on how to use this.
        this.end(this.fps, this.panic);

        this.panic = false;
    }

    // SUBCLASSES MUST OVERRIDE FOUR REQUIRED METHODS:
        // begin
        // update
        // draw
        // end

    /**
     * A function that runs at the beginning of the main loop.
     *
     * The begin() function is typically used to process input before the
     * updates run. Processing input here (in chunks) can reduce the running
     * time of event handlers, which is useful because long-running event
     * handlers can sometimes delay frames.
     *
     * Unlike {@link #setUpdate update}(), which can run zero or more times per
     * frame, begin() always runs exactly once per frame. This makes it useful
     * for any updates that are not dependent on time in the simulation.
     * Examples include adjusting HUD calculations or performing long-running
     * updates incrementally. Compared to {@link #setEnd end}(), generally
     * actions should occur in begin() if they affect anything that
     * {@link #setUpdate update}() or {@link #setDraw draw}() use.
     *
     * @param {Function} begin
     *   The begin() function.
     * @param {Number} [begin.timestamp]
     *   The current timestamp (when the frame started), in milliseconds. This
     *   should only be used for comparison to other timestamps because the
     *   epoch (i.e. the "zero" time) depends on the engine running this code.
     *   In engines that support `DOMHighResTimeStamp` (all modern browsers
     *   except iOS Safari 8) the epoch is the time the page started loading,
     *   specifically `performance.timing.navigationStart`. Everywhere else,
     *   including node.js, the epoch is the Unix epoch (1970-01-01T00:00:00Z).
     * @param {Number} [begin.delta]
     *   The total elapsed time that has not yet been simulated, in
     *   milliseconds.
     */
    abstract begin(timestamp : number, delta : number) : void;

    /**
     * A function that runs updates (i.e. AI and physics).
     *
     * The update() function should simulate anything that is affected by time.
     * It can be called zero or more times per frame depending on the frame
     * rate.
     *
     * As with everything in the main loop, the running time of update()
     * directly affects the frame rate. If update() takes long enough that the
     * frame rate drops below the target ("budgeted") frame rate, parts of the
     * update() function that do not need to execute between every frame can be
     * moved into Web Workers. (Various sources on the internet sometimes
     * suggest other scheduling patterns using setTimeout() or setInterval().
     * These approaches sometimes offer modest improvements with minimal
     * changes to existing code, but because JavaScript is single-threaded, the
     * updates will still block rendering and drag down the frame rate. Web
     * Workers execute in separate threads, so they free up more time in the
     * main loop.)
     *
     * This script can be imported into a Web Worker using importScripts() and
     * used to run a second main loop in the worker. Some considerations:
     *
     * - Profile your code before doing the work to move it into Web Workers.
     *   It could be the rendering that is the bottleneck, in which case the
     *   solution is to decrease the visual complexity of the scene.
     * - It doesn't make sense to move the *entire* contents of update() into
     *   workers unless {@link #setDraw draw}() can interpolate between frames.
     *   The lowest-hanging fruit is background updates (like calculating
     *   citizens' happiness in a city-building game), physics that doesn't
     *   affect the scene (like flags waving in the wind), and anything that is
     *   occluded or happening far off screen.
     * - If draw() needs to interpolate physics based on activity that occurs
     *   in a worker, the worker needs to pass the interpolation value back to
     *   the main thread so that is is available to draw().
     * - Web Workers can't access the state of the main thread, so they can't
     *   directly modify objects in your scene. Moving data to and from Web
     *   Workers is a pain. The fastest way to do it is with Transferable
     *   Objects: basically, you can pass an ArrayBuffer to a worker,
     *   destroying the original reference in the process.
     *
     * You can read more about Web Workers and Transferable Objects at
     * [HTML5 Rocks](http://www.html5rocks.com/en/tutorials/workers/basics/).
     *
     * @param {Function} update
     *   The update() function.
     * @param {Number} [update.delta]
     *   The amount of time in milliseconds to simulate in the update. In most
     *   cases this timestep never changes in order to ensure deterministic
     *   updates. The timestep is the same as that returned by
     *   `MainLoop.getSimulationTimestep()`.
     */
    abstract update(timeStep : number) : void;

    /**
     * A function that draws things on the screen.
     *
     * The draw() function gets passed the percent of time that the next run of
     * {@link #setUpdate update}() will simulate that has actually elapsed, as
     * a decimal. In other words, draw() gets passed how far between update()
     * calls it is. This is useful because the time simulated by update() and
     * the time between draw() calls is usually different, so the parameter to
     * draw() can be used to interpolate motion between frames to make
     * rendering appear smoother. To illustrate, if update() advances the
     * simulation at each vertical bar in the first row below, and draw() calls
     * happen at each vertical bar in the second row below, then some frames
     * will have time left over that is not yet simulated by update() when
     * rendering occurs in draw():
     *
     *     update() timesteps:  |  |  |  |  |  |  |  |  |
     *     draw() calls:        |   |   |   |   |   |   |
     *
     * To interpolate motion for rendering purposes, objects' state after the
     * last update() must be retained and used to calculate an intermediate
     * state. Note that this means renders will be up to one update() behind.
     * This is still better than extrapolating (projecting objects' state after
     * a future update()) which can produce bizarre results. Storing multiple
     * states can be difficult to set up, and keep in mind that running this
     * process takes time that could push the frame rate down, so it's often
     * not worthwhile unless stuttering is visible.
     *
     * @param {Function} draw
     *   The draw() function.
     * @param {Number} [draw.interpolationPercentage]
     *   The cumulative amount of time that hasn't been simulated yet, divided
     *   by the amount of time that will be simulated the next time update()
     *   runs. Useful for interpolating frames.
     */
    public abstract draw(interpolationPercentage : number) : void;

    /**
     * A function that runs at the end of the main loop.
     *
     * Unlike {@link #setUpdate update}(), which can run zero or more times per
     * frame, end() always runs exactly once per frame. This makes it useful
     * for any updates that are not dependent on time in the simulation.
     * Examples include cleaning up any temporary state set up by
     * {@link #setBegin begin}(), lowering the visual quality if the frame rate
     * is too low, or performing long-running updates incrementally. Compared
     * to begin(), generally actions should occur in end() if they use anything
     * that update() or {@link #setDraw draw}() affect.
     *
     * @param {Function} end
     *   The end() function.
     * @param {Number} [end.fps]
     *   The exponential moving average of the frames per second. This is the
     *   same value returned by `MainLoop.getFPS()`. It can be used to take
     *   action when the FPS is too low (or to restore to normalcy if the FPS
     *   moves back up). Examples of actions to take if the FPS is too low
     *   include exiting the application, lowering the visual quality, stopping
     *   or reducing activities outside of the main loop like event handlers or
     *   audio playback, performing non-critical updates less frequently, or
     *   increasing the simulation timestep (by calling
     *   `MainLoop.setSimulationTimestep()`). Note that this last option
     *   results in more time being simulated per update() call, which causes
     *   the application to behave non-deterministically.
     * @param {Boolean} [end.panic=false]
     *   Indicates whether the simulation has fallen too far behind real time.
     *   Specifically, `panic` will be `true` if too many updates occurred in
     *   one frame. In networked lockstep applications, the application should
     *   wait for some amount of time to see if the user can catch up before
     *   dropping the user. In networked but non-lockstep applications, this
     *   typically indicates that the user needs to be snapped or eased to the
     *   current authoritative state. When this happens, it may be convenient
     *   to call `MainLoop.resetFrameDelta()` to discard accumulated pending
     *   updates. In non-networked applications, it may be acceptable to allow
     *   the application to keep running for awhile to see if it will catch up.
     *   However, this could also cause the application to look like it is
     *   running very quickly for a few frames as it transitions through the
     *   intermediate states. An alternative that may be acceptable is to
     *   simply ignore the unsimulated elapsed time by calling
     *   `MainLoop.resetFrameDelta()` even though this introduces
     *   non-deterministic behavior. In all cases, if the application panics
     *   frequently, this is an indication that the main loop is running too
     *   slowly. However, most of the time the drop in frame rate will probably
     *   be noticeable before a panic occurs. To help the application catch up
     *   after a panic caused by a spiral of death, the same steps can be taken
     *   that are suggested above if the FPS drops too low.
     */
    abstract end(fps : number, panic : boolean) : void;
}