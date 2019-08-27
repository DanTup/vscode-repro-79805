import { CancellationToken, CodeLens, CodeLensProvider, commands, Event, EventEmitter, Range, TextDocument } from "vscode";
import { IAmDisposable } from "../../shared/interfaces";
import { TestOutlineInfo } from "../../shared/utils/outline";

export class TestCodeLensProvider implements CodeLensProvider, IAmDisposable {
	private disposables: IAmDisposable[] = [];
	private onDidChangeCodeLensesEmitter: EventEmitter<void> = new EventEmitter<void>();
	public readonly onDidChangeCodeLenses: Event<void> = this.onDidChangeCodeLensesEmitter.event;

	constructor() {
		console.log(`Creating code lens provider`);
		this.disposables.push(commands.registerCommand("_dart.startDebuggingTestFromOutline", (test: TestOutlineInfo, launchTemplate: any | undefined) => {
			// Nothing
		}));
	}

	public provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] | undefined {
		const res: CodeLens[] = [];
		for (let i = 1; i < 30; i++) {
			res.push(new CodeLens(
				new Range(document.positionAt(i), document.positionAt(i + 1)),
				{
					arguments: [{
						file: "Test file",
						fullName: "Test name",
						isGroup: false,
						length: 2,
						offset: 1,
					} as TestOutlineInfo],
					command: "_dart.startDebuggingTestFromOutline",
					title: "Run",
				},
			));
		}
		return res;
	}

	public dispose(): any {
		this.disposables.forEach((d) => d.dispose());
	}
}
