import * as vs from "vscode";
import { helloWorldTestMainFile } from "../../helpers";

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
	beforeEach("activate", async () => {
		const dartCodeExtensionIdentifier = "Dart-Code.dart-code";
		const ext = vs.extensions.getExtension(dartCodeExtensionIdentifier);
		ext.activate();
	});

	[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((attempt) => {
		it(`includes run/debug actions for tests (${attempt})`, async () => {
			const doc = await vs.workspace.openTextDocument(helloWorldTestMainFile);
			await vs.window.showTextDocument(doc);

			console.info(`Getting code lens!`);
			const fileCodeLens = await (vs.commands.executeCommand("vscode.executeCodeLensProvider", doc.uri, 500) as Thenable<vs.CodeLens[]>);
			console.info(`Got ${fileCodeLens.length} code lens`);
			debugCheck(fileCodeLens);
		});
	});
});
