const back = require('androidjs').back;

back.on("hello from front", () => {
	back.send("hello from back", "Hello from Android JS");
});
