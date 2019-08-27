import * as path from "path";
import * as vs from "vscode";

const dartCodeExtensionIdentifier = "issue-repro.dart-code-issue-repro";
const ext = vs.extensions.getExtension(dartCodeExtensionIdentifier);
const testFolder = path.join(ext.extensionPath, "src/test");
export const helloWorldFolder = vs.Uri.file(path.join(testFolder, "test_projects/hello_world"));
export const emptyFile = vs.Uri.file(path.join(helloWorldFolder.fsPath, "lib/empty.dart"));
export const helloWorldTestMainFile = vs.Uri.file(path.join(helloWorldFolder.fsPath, "test/basic_test.dart"));


describe(`test_code_lens`, () => {
	console.info(`Starting tests!`);
	before("activate", () => ext.activate());

	[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((attempt) => {
		it(`includes run/debug actions for tests (${attempt})`, async () => {
			const doc = await vs.workspace.openTextDocument(helloWorldTestMainFile);
			await vs.window.showTextDocument(doc);

			console.info(`Getting code lens!`);
			const fileCodeLens = await (vs.commands.executeCommand("vscode.executeCodeLensProvider", doc.uri, 500) as Thenable<vs.CodeLens[]>);
			console.info(`Got ${fileCodeLens.length} code lens`);

			for (const cl of fileCodeLens) {
				if (!cl.command) {
					throw new Error(`Got code lens without a command! ${JSON.stringify(cl, undefined, 4)}\n\n`);
				}
			}
		});
	});
});
