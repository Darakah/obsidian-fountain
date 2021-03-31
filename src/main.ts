import { Plugin } from 'obsidian';
import * as fountain from '../node_modules/Fountain-js/fountain.js';

class FountainProcessor {

	async run(source: string, el: HTMLElement) {

		let container = el.createDiv({
			cls: "screenplay"
		});

		fountain.parse(source, function (output) {
			container.innerHTML = output.html.script;
		});
	}
}

export default class FountainPlugin extends Plugin {
	containerEl: HTMLElement;

	async onload() {
		// Load message
		console.log('Loaded Fountain Plugin');

		// Register Fountain block renderer
		this.registerMarkdownCodeBlockProcessor('fountain', async (source, el) => {
			const proc = new FountainProcessor();
			await proc.run(source, el);
		});
	}

	onunload() {
		console.log('unloading Fountain Plugin');
	}
}