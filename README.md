# Rafman.js
Rafman.js helps you manage requestAnimationFrame work.

## Installation
Just include `rafman.js` in your page. There are no dependencies.

## Usage
Rafman.js registers a `Rafman` object in the global namespace.

### `Rafman.start()`
Starts the ticking. Every tick is requested using requestAnimationFrame. On ever tick your registered callbacks will be executed.

### `Rafman.pause()`
Stops the ticking.

### `Rafman.once([id, ]callback, [args, ...])`
Register a callback to be executed only on the next tick. This is particularly useful to throttle events.

	Rafman.once(function() {
		// do something
	});

An id can be specified which can later be used to cancel the callback.
	
	Rafman.once('someId', function() {
		// do something
	});

	Rafman.cancel('someId');

In case of an event handler you could do something like the following. Note that it's possible to pass the arguments you want the callback to be called with.

	var scrollCallback = function(event, anotherArg) {
		// do something
	}
	
	window.onscroll = function(event) {
		Rafman.once(scrollCallback, event, anotherArg);
	}

### `Rafman.always([id, ]callback)`
Register a callback to be called on every tick. Useful if you are constantly animating like in a game.

### `Rafman.cancel(id|callback)`
Cancel the execution of a callback. It's possible to pass the callback itself, or the id it was registered with. This function cancels callbacks registered with both `once` and `always`.

### `Rafman.clear()`
Clear all registered callbacks.

## To do
- Add tests because `test.html` is a mess. requestAnimationFrame is kinda hard to test. Any tips?

## License
Licensed under the MIT license.

Copyright (c) 2013 Roald Hacquebord