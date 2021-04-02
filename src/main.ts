import { Plugin, WorkspaceLeaf, TextFileView } from 'obsidian';
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
		this.previewEl = this.viewEl.createDiv({ cls: 'screenplay', attr: { 'style': 'display: none' } });
		// Add Source Mode Container
		this.sourceEl = this.viewEl.createDiv({ cls: 'fountain-source-view', attr: { 'stylle': 'display: none' } });
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
		// register events to render preview on on file open
		this.registerEvent(this.app.workspace.on('file-open', this.initialize.bind(this)));

		let changeMode = this.containerEl.getElementsByClassName('view-actions')[0].createEl('a', { cls: 'view-action', attr: { 'aria-label': 'Edit (Ctrl/Cmd+Click to edit in new pane)' } });
		changeMode.innerHTML = `<svg viewBox="0 0 100 100" width="17" height="17" class="pencil">
		<path fill="currentColor" stroke="currentColor" d="M86.3,4c-2.5,0-5,1-6.9,2.9l-1.6,1.6l13.7,13.7c0,0,1.6-1.6,1.6-1.6c3.8-3.8,3.8-10,
		0-13.8C91.2,5,88.7,4,86.3,4z M74.7,12.1c-0.5,0.1-0.9,0.3-1.2,0.6L8.6,77.6c-0.3,0.2-0.5,0.5-0.6,0.9l-4,15c-0.2,0.7,0,1.4,0.5,1.9s1.2,
		0.7,1.9,0.5l15-4 c0.3-0.1,0.6-0.3,0.9-0.6l64.9-64.9c0.8-0.8,0.8-2,0-2.8c-0.8-0.8-2-0.8-2.8,0L19.9,88.2l-8.1-8.1l64.6-64.6 c0.6-0.6,
		0.8-1.5,0.4-2.2c-0.3-0.8-1.1-1.2-1.9-1.2C74.8,12.1,74.7,12.1,74.7,12.1z"></path></svg>`;

		// Add listener to change into between edit / preview modes
		changeMode.addEventListener("click", () => {

			let currentMode = this.previewEl.style.getPropertyValue('display');
			if (currentMode == "block") {
				this.previewEl.style.setProperty('display', 'none');
				this.sourceEl.style.setProperty('display', 'block');
				return;
			}

			this.render();
			this.previewEl.style.setProperty('display', 'block');
			this.sourceEl.style.setProperty('display', 'none');
		});

		// Save file on change
		this.editor.on('change', () => {
			setTimeout(this.requestSave, 5000);
		});
	}

	getViewData() {
		this.data = this.editor.getValue();
		return this.data;
	}

	setViewData() {
		this.render();
	}

	clear() {
	}

	async initialize() {
		let fileText = await this.app.vault.cachedRead(this.file);
		this.data = fileText;
		this.editor.setValue(fileText);
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