console.log("Starting test runner...");

import * as glob from "glob";
import * as Mocha from "mocha";
import * as path from "path";

module.exports = {
	run(testsRoot: string, cb: (error: any, failures?: number) => void): void {
		// Create the mocha test
		const mocha = new Mocha({
			reporter: "list",
			slow: 10000,       // increased threshold before marking a test as slow
			timeout: 180000,   // increased timeout because starting up Code, Analyzer, Pub, etc. is slooow
			ui: "bdd",        // the TDD UI is being used in extension.test.ts (suite, test, etc.)
			useColors: true,  // colored output from test results
		});
		// Use any mocha API
		mocha.useColors(true);

		// Set up source map support.
		require("source-map-support").install();

		glob("**/**.test.js", { cwd: testsRoot }, (err, files) => {
			if (err) {
				return cb(err);
			}

			// Add files to the test suite
			files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

			try {
				// Run the mocha test
				mocha.run((failures) => cb(null, failures));
			} catch (err) {
				cb(err);
			}
		});
	},
};
