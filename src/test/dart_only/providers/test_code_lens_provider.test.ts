import * as vs from "vscode";
import { activateWithoutAnalysis, delay, getCodeLens, getPackages, helloWorldTestMainFile } from "../../helpers";

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
		it(`includes run/debug actions for tests (${attempt})`, async () => {
			console.info(`Opening doc ${attempt}!`);
			const doc = await vs.workspace.openTextDocument(helloWorldTestMainFile);
			console.info(`Showing doc!`);
			const editor = await vs.window.showTextDocument(doc);
			console.info(`Delaying 100!`);
			await delay(100);

			console.info(`Getting code lens!`);
			const fileCodeLens = await getCodeLens(editor.document);
			console.info(`Got ${fileCodeLens.length} code lens`);
			debugCheck(fileCodeLens);
		});
	});
});
