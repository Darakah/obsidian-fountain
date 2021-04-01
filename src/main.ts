import { Plugin, WorkspaceLeaf, MarkdownView } from 'obsidian';
import * as fountain from '../node_modules/Fountain-js/fountain.js';


async function parseFountain(text: string, container: HTMLElement) {
	fountain.parse(text, function (output) {
		container.innerHTML = output.html.script;
	});
}


export default class FountainPlugin extends Plugin {
	containerEl: HTMLElement;

	async onload() {
		// Load message
		console.log('Loaded Fountain Plugin');

		// register .fountain extension
		this.registerExtensions(["fountain"], "fountain");
		// register fountain view
		this.registerView("fountain", this.fountainViewCreator);

		// Register Fountain block renderer
		this.registerMarkdownCodeBlockProcessor('fountain', async (source, el) => {
			let container = el.createDiv({
				cls: "screenplay"
			});

			parseFountain(source, container);
		});
	}

	fountainViewCreator(leaf: WorkspaceLeaf) {
		return new fountainView(leaf);
	};

	onunload() {
		console.log('unloading Fountain Plugin');
	}
}


class fountainView extends MarkdownView {
	parsedEl: HTMLElement;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.parsedEl = this.containerEl.getElementsByClassName('markdown-preview-view')[0] as HTMLElement;
		this.parsedEl.className = 'screenplay';
	}

	setViewData = () => {
		parseFountain(this.data, this.parsedEl);
	};

	getViewData = () => {
		let editorValue = this.editor.getValue();
		parseFountain(editorValue, this.parsedEl);

		return editorValue;
	};

	getDisplayText() {
		if (this.file) return this.file.basename;
		else return "fountain (no file)";
	}

	canAcceptExtension(extension: string) {
		return extension == 'fountain';
	}

	getViewType() {
		return "fountain";
	}
}