import * as vs from "vscode";
import { TestCodeLensProvider } from "./code_lens/test_code_lens_provider";

const DART_MODE: vs.DocumentFilter = { language: "dart", scheme: "file" };
export const FLUTTER_SUPPORTS_ATTACH = "dart-code:flutterSupportsAttach";
export const SERVICE_EXTENSION_CONTEXT_PREFIX = "dart-code:serviceExtension.";
export const SERVICE_CONTEXT_PREFIX = "dart-code:service.";

export function activate(context: vs.ExtensionContext) {
	const codeLensProvider = new TestCodeLensProvider();
	context.subscriptions.push(codeLensProvider);
	context.subscriptions.push(vs.languages.registerCodeLensProvider(DART_MODE, codeLensProvider));
}
