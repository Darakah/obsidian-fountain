import { App, Setting, Plugin, WorkspaceLeaf, TextFileView, setIcon, PluginSettingTab, DropdownComponent } from 'obsidian';
import * as CodeMirror from 'codemirror';
import { Fountain } from 'fountain-js'

interface FountainSettings {
	dpi: string
}

const DEFAULT_SETTINGS: FountainSettings = {
	dpi: '72'
}

let dpi = DEFAULT_SETTINGS.dpi;

function parseFountain(text: string, container: HTMLElement) {
	const { html } = new Fountain().parse(text);

	// Renders pages individually as if they were printed.
	// DPI can be changed to 72, 100, or 150.
	const pages = container.createDiv({
		cls: `us-letter dpi${dpi}`
	})
	pages.id = "script"

	// Adds title page if found.
	if (html.title_page) {
		const titlePage = pages.createDiv({
			cls: "page title-page"
		})
		titlePage.innerHTML = html.title_page;
	}
	
	// Adds all script pages.
	const script = pages.createDiv({
		cls: "page"
	})
	script.innerHTML = html.script;
}

export default class FountainPlugin extends Plugin {
	settings: FountainSettings = DEFAULT_SETTINGS

	containerEl: HTMLElement;

	async onload() {
		// Load message
		console.log('Loaded Fountain Plugin');

		// load settings
		await this.loadSettings();
		dpi = this.settings.dpi;

		// register .fountain extension
		this.registerExtensions(["fountain"], "fountain");

		// register Fountain view
		this.registerView("fountain", this.fountainViewCreator);

		// register Fountain block renderer
		this.registerMarkdownCodeBlockProcessor('fountain', async (source, el) => {
			let container = el.createDiv({
				cls: "screenplay"
			});

			parseFountain(source, container);
		});

		// register Fountain setting tab
		this.addSettingTab(new FountainSettingTab(this.app, this));
	}

	fountainViewCreator(leaf: WorkspaceLeaf) {
		return new FountainView(leaf);
	};

	onunload() {
		console.log('unloading Fountain Plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class FountainView extends TextFileView {
	viewEl: HTMLElement;
	previewEl: HTMLElement;
	sourceEl: HTMLElement;
	editorEl: HTMLTextAreaElement;
	editor: CodeMirror.Editor;

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
			keyMap: "default",
			theme: "fountain"
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
		return this.editor.getValue();
	}

	async setViewData(data: string, clear: boolean) {
		this.editor.setValue(data);
		parseFountain(data, this.previewEl);
		if (clear) {
			this.editor.clearHistory();
		}
	}

	clear() {
		this.previewEl.empty();
		this.editor.setValue('');
		this.editor.clearHistory();
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

class FountainSettingTab extends PluginSettingTab {
	plugin: FountainPlugin;

	constructor(app: App, plugin: FountainPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Fountain'});

		new Setting(containerEl)
			.setName('Preview Render Size')
			.setDesc('Changes the size of the screenplay render in Live Preview')
			.addDropdown(dropdown => dropdown
				.addOption(DEFAULT_SETTINGS.dpi, 'Default')
				.addOption('100', 'Larger')
				.addOption('150', 'Largest')
				.setValue(this.plugin.settings.dpi)
				.onChange(async (value) => {
					console.log(`DPI set to ${value}. Changes will take affect on reload.`);
					this.plugin.settings.dpi = value;
					await this.plugin.saveSettings();
					const script = this.app.workspace.containerEl.querySelector('#script')
					if (script) {
						script.className = `us-letter dpi${value}`
					}
				}));
	}
}