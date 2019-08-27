import * as path from "path";
import * as vstest from "vscode-test";

let exitCode = 0;
const cwd = process.cwd();
async function runAllTests(): Promise<void> {
	try {
		await vstest.runTests({
			extensionDevelopmentPath: cwd,
			extensionTestsPath: path.join(cwd, "out", "src", "test", "dart_only"),
			launchArgs: [
				path.join(cwd, "src", "test", "test_projects", "hello_world"),
				"--user-data-dir",
				path.join(cwd, ".dart_code_test_data_dir"),
			],
			version: "insiders",
		})
	} catch (e) {
		exitCode = 1;
		console.error(e);
	}
}

runAllTests().then(() => process.exit(exitCode));
