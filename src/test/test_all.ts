import * as childProcess from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as vstest from "vscode-test";
import { twentyMinutesInMs } from "../shared/constants";

let exitCode = 0;
const cwd = process.cwd();
const testEnv = Object.create(process.env);

function red(message: string): string { return color(91, message); }
function yellow(message: string): string { return color(93, message); }
function green(message: string): string { return color(92, message); }
function color(col: number, message: string) {
	return "\u001b[" + col + "m" + message + "\u001b[0m";
}

// Set timeout at 30 mins (Travis kills us with no output for too long).
const timeoutInMilliseconds = twentyMinutesInMs;
function runNode(cwd: string, args: string[], env: any, printTimes = false): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		let timerWarn: NodeJS.Timer;
		let timerKill: NodeJS.Timer;
		console.log(`    Spawning test run:`);
		console.log(`        Command: node ${args.join(" ")}`);
		console.log(`        CWD: ${cwd}`);
		console.log(`        ENV: ${JSON.stringify(env, undefined, 4).replace(/    /gm, "                ").replace(/\n}/, "\n              }")}`);
		const testRunStart = Date.now();
		const proc = childProcess.spawn("node", args, { env, stdio: "inherit", cwd });
		proc.on("data", (data: Buffer | string) => console.log(data.toString()));
		proc.on("error", (data: Buffer | string) => console.warn(data.toString()));
		proc.on("close", (code: number) => {
			if (timerWarn)
				clearTimeout(timerWarn);
			if (timerKill)
				clearTimeout(timerKill);
			const testRunEnd = Date.now();
			const timeTaken = testRunEnd - testRunStart;
			if (printTimes)
				console.log(`      Ended after: ${timeTaken / 1000}s`);
			resolve(code);
		});
		timerWarn = setTimeout(() => {
			if (!proc || proc.killed)
				return;
			console.log(yellow(`Process is still going after ${timeoutInMilliseconds / 2 / 1000}s.`));
			console.log(yellow(`Waiting another ${timeoutInMilliseconds / 2 / 1000}s before terminating`));
			console.log(yellow("    " + JSON.stringify(args)));
		}, timeoutInMilliseconds / 2);
		timerKill = setTimeout(() => {
			if (!proc || proc.killed)
				return;
			proc.kill();
			console.log(red(`Terminating process for taking too long after ${timeoutInMilliseconds / 1000}s!`));
			console.log(yellow("    " + JSON.stringify(args)));
			// We'll throw and bring the tests down here, because when this happens, the Code process doesn't
			// get terminated (only the node wrapper) so subsequent tests fail anyway.
			reject("Terminating test run due to hung process.");
		}, timeoutInMilliseconds);
	});
}

async function runTests(testFolder: string, workspaceFolder: string, sdkPaths: string, codeVersion: string | undefined): Promise<void> {
	// For some reason, updating PATH here doesn't get through to Code
	// even though other env vars do! 😢
	testEnv.DART_PATH_OVERRIDE = sdkPaths;
	testEnv.CODE_VERSION = codeVersion;

	// Figure out a filename for results...
	const dartFriendlyName = (process.env.ONLY_RUN_DART_VERSION || "local").toLowerCase();
	const codeFriendlyName = codeVersion || "stable";

	// Set some paths that are used inside the test run.
	const testRunName = testFolder.replace("/", "_");
	testEnv.TEST_RUN_NAME = testRunName;
	testEnv.DC_TEST_LOGS = path.join(cwd, ".dart_code_test_logs", `${testRunName}_${dartFriendlyName}_${codeFriendlyName}`);
	testEnv.COVERAGE_OUTPUT = path.join(cwd, ".nyc_output", `${testRunName}_${dartFriendlyName}_${codeFriendlyName}.json`);
	testEnv.TEST_XML_OUTPUT = path.join(cwd, ".test_results", `${testRunName}_${dartFriendlyName}_${codeFriendlyName}.xml`);
	testEnv.TEST_CSV_SUMMARY = path.join(cwd, ".test_results", `${dartFriendlyName}_${codeFriendlyName}_summary.csv`);

	if (!fs.existsSync(testEnv.DC_TEST_LOGS))
		fs.mkdirSync(testEnv.DC_TEST_LOGS);

	const res = await vstest.runTests({
		extensionDevelopmentPath: cwd,
		extensionTestsEnv: testEnv,
		extensionTestsPath: path.join(cwd, "out", "src", "test", testFolder),
		launchArgs: [
			path.isAbsolute(workspaceFolder)
				? workspaceFolder
				: path.join(cwd, "src", "test", "test_projects", workspaceFolder),
			"--user-data-dir",
			path.join(cwd, ".dart_code_test_data_dir"),
		],
		version: codeVersion,
	});
	exitCode = exitCode || res;

	console.log(yellow("############################################################"));
	console.log("\n\n");
}

async function runAllTests(): Promise<void> {
	const codeVersion = process.env.ONLY_RUN_CODE_VERSION === "DEV" ? "insiders" : undefined;
	const dartSdkPath = process.env.DART_PATH_SYMLINK || process.env.DART_PATH || process.env.PATH;

	if (!dartSdkPath)
		throw new Error("Could not find Dart SDK");

	testEnv.DART_CODE_IS_TEST_RUN = true;
	// testEnv.MOCHA_FORBID_ONLY = true;

	// Ensure any necessary folders exist.
	if (!fs.existsSync(".nyc_output"))
		fs.mkdirSync(".nyc_output");
	if (!fs.existsSync(".dart_code_test_logs"))
		fs.mkdirSync(".dart_code_test_logs");

	try {
		await runTests("dart_only", "hello_world", dartSdkPath, codeVersion);
	} catch (e) {
		exitCode = 1;
		console.error(e);
	}
}

runAllTests().then(() => process.exit(exitCode));
