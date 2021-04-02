# obsidian-fountain
![GitHub release)](https://img.shields.io/github/v/release/Darakah/obsidian-fountain)
![GitHub all releases](https://img.shields.io/github/downloads/Darakah/obsidian-fountain/total)

[Obsidian](https://obsidian.md/) plugin to edit, write and render [Fountain](https://fountain.io/) Writing Syntax for screenplays and scripts (implements [fountain-js](https://github.com/mattdaly/Fountain.js) project to parse fountain script).

## Example

<img src="https://raw.githubusercontent.com/Darakah/obsidian-fountain/main/images/Example_1.png"/>

## Features
- Obsidian support for `.fountain` files (Edit and render `.fountain` files from inside obsidian)
- Obsidian Block to render fountain script inside md notes

## Usage
- Write Fountain script inside render block with block id `fountain`
- Example:

<img src="https://raw.githubusercontent.com/Darakah/obsidian-fountain/main/images/Example_2.png"/>

## Customization 
Appearance can be modified by changing the `style.css` found inside the `obsidian-fountain` plugin folder. Feel free to submit additional fancy css features (the current ones are the simple basics in default fountain).

## Release Notes

### v0.2.0
- Changed from using `markdownEditor` of obsidian to `CodeMirror` to avoid possible conflicts with other plugins and wasted parsing by obsidian.

### v0.1.0
- Added Obsidian support for `.fountain` files (Edit and render `.fountain` files from inside obsidian)
- Code cleanup 

### v0.0.1
- Initial release


## Support

[![Github Sponsorship](https://raw.githubusercontent.com/Darakah/Darakah/e0fe245eaef23cb4a5f19fe9a09a9df0c0cdc8e1/icons/github_sponsor_btn.svg)](https://github.com/sponsors/Darakah) [<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/darakah)
