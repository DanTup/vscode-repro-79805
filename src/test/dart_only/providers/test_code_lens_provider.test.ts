import * as vs from "vscode";
import { activateWithoutAnalysis, delay, getCodeLens, getPackages, helloWorldTestMainFile, openFile } from "../../helpers";

function debugCheck(cls: vs.CodeLens[]) {
	// TEMP DEBUG
	for (const cl of cls) {
		if (!cl.command) {
			throw new Error(`Got code lens without a command! ${JSON.stringify(cl, undefined, 4)}\n\n\nFull response (${cls.length} items) was:${JSON.stringify(cls, undefined, 4)}`);
		}
	}
}

describe(`test_code_lens`, () => {
	console.info(`Starting tests!`);
	before("get packages", async () => {
		console.info(`Getting packages!`);
		await getPackages();
		console.info(`Done!`);
	});
	beforeEach("activate", async () => {
		console.info(`Activating!`);
		await activateWithoutAnalysis();
		console.info(`Done!`);
	});

	[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((attempt) => {
		console.info(`Going to run test ${attempt}!`);
		it(`includes run/debug actions for tests (${attempt})`, async () => {
			console.info(`Inside test ${attempt}!`);
			const editor = await openFile(helloWorldTestMainFile);
			await delay(100);

			const fileCodeLens = await getCodeLens(editor.document);
			console.info(`Got ${fileCodeLens.length} code lens`);
			debugCheck(fileCodeLens);
		});
	});
});
