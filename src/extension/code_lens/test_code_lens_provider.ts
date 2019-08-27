import { CancellationToken, CodeLens, CodeLensProvider, commands, Event, EventEmitter, Range, TextDocument } from "vscode";

export class TestCodeLensProvider implements CodeLensProvider, IAmDisposable {
	private disposables: IAmDisposable[] = [];
	private onDidChangeCodeLensesEmitter: EventEmitter<void> = new EventEmitter<void>();
	public readonly onDidChangeCodeLenses: Event<void> = this.onDidChangeCodeLensesEmitter.event;

	constructor() {
		console.log(`Creating code lens provider`);
		this.disposables.push(commands.registerCommand("_dart2.startDebuggingTestFromOutline", (test: TestOutlineInfo, launchTemplate: any | undefined) => {
			// Nothing
		}));
		console.log(`Done!`);
	}

	public provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] | undefined {
		const res: CodeLens[] = [];
		for (let i = 0; i < 30; i++) {
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
					command: "_dart2.startDebuggingTestFromOutline",
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

interface IAmDisposable {
	dispose(): void | Promise<void>;

}

interface TestOutlineInfo {
	fullName: string;
	file: string;
	offset: number;
	length: number;
	isGroup: boolean;
}
