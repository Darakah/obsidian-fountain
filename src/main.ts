import { Plugin, WorkspaceLeaf, TextFileView, setIcon } from 'obsidian';
import * as CodeMirror from 'codemirror';
import * as fountain from '../node_modules/Fountain-js/fountain.js';

function parseFountain(text: string, container: HTMLElement) {
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
		return new FountainView(leaf);
	};

	onunload() {
		console.log('unloading Fountain Plugin');
	}
}


class FountainView extends TextFileView {
	viewEl: HTMLElement;
	previewEl: HTMLElement;
	sourceEl: HTMLElement;
	editorEl: HTMLTextAreaElement;
	editor: CodeMirror.Editor;
	data: string;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		// Get View Container Element
		this.viewEl = this.containerEl.getElementsByClassName('view-content')[0] as HTMLElement;
		// Add Preview Mode Container
		this.previewEl = this.viewEl.createDiv({ cls: 'screenplay', attr: { 'style': 'display: block' } });
		// Add Source Mode Container
		this.sourceEl = this.viewEl.createDiv({ cls: 'fountain-source-view', attr: { 'style': 'display: none' } });
		// Add code mirro editor
		this.editorEl = this.sourceEl.createEl('textarea', { cls: 'fountain-cm-editor' });
		// Create Code Mirror Editor with specific config
		this.editor = CodeMirror.fromTextArea(this.editorEl, {
			lineNumbers: false,
			lineWrapping: true,
			scrollbarStyle: null,
			keyMap: "default"
		});
		this.render = this.render.bind(this);
	}

	onload() {
		let changeMode = this.containerEl.getElementsByClassName('view-actions')[0].createEl('a', { cls: 'view-action', attr: { 'aria-label': 'Edit' } });
		setIcon(changeMode, 'pencil', 17);

		changeMode.onClickEvent(() => {

			let currentMode = this.previewEl.style.getPropertyValue('display');
			if (currentMode == "block") {
				this.previewEl.style.setProperty('display', 'none');
				this.sourceEl.style.setProperty('display', 'block');
				this.editor.refresh();
				return;
			}

			this.render();
			this.previewEl.style.setProperty('display', 'block');
			this.sourceEl.style.setProperty('display', 'none');
		});

		// Save file on change
		this.editor.on('change', () => {
			this.requestSave();
		});
	}

	getViewData() {
		this.data = this.editor.getValue();
		return this.data;
	}

	async setViewData() {
		let fileText = await this.app.vault.cachedRead(this.file);
		this.data = fileText;
		this.editor.setValue(fileText);
		parseFountain(this.data, this.previewEl);
	}

	clear() {
		this.previewEl.empty();
		this.sourceEl.empty();
	}

	async render() {
		let editorValue = this.editor.getValue();
		this.data = editorValue;
		parseFountain(editorValue, this.previewEl);
		return editorValue;
	}

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