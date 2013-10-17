// Rafman 0.1.1
// (C) 2013 Roald Hacquebord
// This code is licensed under the MIT license.

Rafman = (function() {
    // Setup
    // -----

    // Define all necessary variables with default values
    var paused = true;
    var requestId = null;

    var ids = [];
    var callbacks = [];
    var onceIds = [];
    var onceArgs = [];
    var onceCallbacks = [];

    // Protected functions
    // -------------------

    // This utility function is taken from Underscore.js
    // http://underscorejs.org/
    function isFunction(obj) {
        return toString.call(obj) == '[object Function]';
    }

    // Optimize isFunction if appropiate
    if (typeof (/./) !== 'function') {
        isFunction = function(obj) {
            return typeof obj === 'function';
        };
    }

    // Request a tick. Makes sure there won't be more than 2 ticks running
    // at the same time.
    function requestTick() {
        if (paused || requestId !== null)
            return;

        requestId = requestAnimationFrame(tick);
    }

    // Define the loop variables used in tick() here so
    // they don't have to be allocated again on every tick.
    var i;
    var length;

    // Do the actual work.
    function tick() {
        if (paused)
            return;

        // There is no clear winner between different types of loops, so no fancy looping here.
        // http://jsperf.com/fastest-array-loops-in-javascript/86
        for (i = 0, length = callbacks.length; i < length; i++) {
            callbacks[i].apply();
        }

        while (onceCallbacks.length > 0) {
            // Execute the callbacks starting at the first one registered.
            onceCallbacks[0].apply(this, onceArgs[0] || undefined);
            onceCallbacks.shift();
            onceIds.shift();
            onceArgs.shift();
        }

        // The current tick is done so reset the requestId.
        requestId = null;

        // Immediately request another tick if there is still work to do.
        if (callbacks.length > 0) {
            requestTick();
        }
    }

    function returnWrapper(fn, callback) {
        return function() {
            fn(callback);
        };
    }

    // Public functions
    // ----------------

    // Define the variables used in once() here so
    // they don't have to be allocated again on every call.
    var id = null;
    var callback;
    var args;
    var index;

    // Register a callback to be executed once on the next tick. Makes
    // sure the same callback can't be registered more than once. It's
    // not required to specify an id.
    function once() {
        args = Array.prototype.slice.call(arguments);
        if (!isFunction(args[0])) {
            id = args.shift();
        }

        callback = args.shift();

        if (onceCallbacks.indexOf(callback) !== -1) {
            // This callback is already registered. Bail!
            return;
        }

        // Register the callback and get the index at which it was placed.
        index = onceCallbacks.push(callback) - 1;

        // Register the id if given
        if (id !== null) {
            onceIds[index] = id;
        }

        // Register the arguments if given
        if (args.length > 0) {
            onceArgs[index] = args;
        }

        // Start doing some work!
        requestTick();

        // Set the used variables to null so they don't
        // retain unneeded references for too long.
        id = null;
        callback = null;
        args = null;
        index = null;
    }

    // Register a callback to be executed on every tick from now on.
    // Makes sure the same callback can't be registered more than once.
    // It's not required to specify an id.
    function always(id, callback) {
        if (isFunction(id)) {
            callback = id;
            id = null;
        }

        if (callbacks.indexOf(callback) !== -1) {
            // This callback is already registered. Bail!
            return;
        }

        // Register the callback and get the index at which it was placed.
        var index = callbacks.push(callback) - 1;

        // Register the id if given
        if (id !== null) {
            ids[index] = id;
        }

        // Start doing some work!
        requestTick();

        return callback;
    }

    // Cancel a registered callback. It's possible to specify
    // the callback's id, or the callback itself.
    function cancel(obj) {
        // I couldn't think of a cleaner way to do this right now. Any ideas to refactor?
        if (isFunction(obj)) {
            // Look for a callback
            var index = callbacks.indexOf(obj);
            if (index > -1) {
                callbacks.splice(index, 1);
            }

            index = onceCallbacks.indexOf(obj);
            if (index > -1) {
                onceCallbacks.splice(index, 1);
            }
        }
        else {
            // Look for an id
            index = ids.indexOf(obj);
            if (index > -1) {
                callbacks.splice(index, 1);
                ids.splice(index, 1);
            }

            index = onceIds.indexOf(obj);
            if (index > -1) {
                onceCallbacks.splice(index, 1);
                onceIds.splice(index, 1);
            }
        }
    }

    // Start ticking.
    function start() {
        paused = false;
        requestTick();
    }

    // Stop ticking.
    function pause() {
        paused = true;
        requestId = null;
    }

    // Clear all registered callbacks. Also pauses the ticking
    // because there isn't any work left to do.
    function clear() {
        callbacks = [];
        ids = [];
        onceCallbacks = [];
        onceIds = [];

        pause();
    }

    // Expose the public API
    return {
        once: once,
        always: always,
        cancel: cancel,
        start: start,
        pause: pause,
        clear: clear
    };

}).call(this);