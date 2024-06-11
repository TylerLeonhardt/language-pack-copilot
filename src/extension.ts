import * as fs from 'fs';
import * as vscode from 'vscode';
import { translatePhrases } from './azureIntegration';
// import { scanLanguagePackCollection, ScanChunkCollection } from './languagePackCollectionScanner';
import { exportCacheToFile as exportTranslationsCacheToFile } from './azureCache';
import { DownloadVScodeLocRepoToATempLocation, LanguagePack, LanguagePackFile, LanguagePackFileContent, LanguagePackFileContentPart, LanguagePackTranslation, loadLanguagePacks } from './languagePacks';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('l10n-participant.translate.example', async () => {
		const phrases: string[] = ["Usar expresión regular", "Použit regulární výraz", "Использовать регулярное выражение"];
		const answer = await translatePhrases(phrases);
		vscode.window.showInformationMessage(answer ?? 'NULL');

		const phrases2: string[] = ["Ошибка: {0}", "Chyba: {0}", "오류: {0}"];
		const answer2 = await translatePhrases(phrases2);
		vscode.window.showInformationMessage(answer2 ?? 'NULL');
	}));

	let tempLocation: string | undefined;
	context.subscriptions.push(vscode.commands.registerCommand('l10n-participant.translate.fetch', async () => {
		tempLocation = await DownloadVScodeLocRepoToATempLocation();
		vscode.window.showInformationMessage('Downloaded to ' + tempLocation);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('l10n-participant.translate.process', async () => {
		const languagePackCollection = loadLanguagePacks(tempLocation!);

		const referenceLanguagePack = languagePackCollection[Object.keys(languagePackCollection)[0]];
		const newLanguagePack: LanguagePack = {
			"languageId": 'en-gb',
			"languageName": "British English",
			"localizedLanguageName": "Bri'ish English",
			"contents": []
		};
		for (let i = 0; i < referenceLanguagePack.contents.length; i++) {
			const file = referenceLanguagePack.contents[i];
			const fileContents = file.contents;
			const newLanguagePackFileContentPart: LanguagePackFileContentPart = {};
			for (const partKey in fileContents.contents) {
				const part = fileContents.contents[partKey];
				const newLanguagePackTranslations: LanguagePackTranslation = {};
				for (const key in part) {
					const values: string[] = [];
					for (const languagePackName in languagePackCollection) {
						const matchingPart = languagePackCollection[languagePackName].contents[i].contents.contents[partKey];
						const matchingValue = matchingPart?.[key];
						if (matchingValue !== undefined) {
							values.push(matchingValue);
						}
					}
					// e.g. ["Ошибка: {0}", "Chyba: {0}", "오류: {0}"] => "Error: {0}"
					const translation = await translatePhrases(values);
					if (translation === null) {
						vscode.window.showErrorMessage('Translation failed for key: ' + key);
						continue;
					}
					newLanguagePackTranslations[key] = translation;
				}
				newLanguagePackFileContentPart[partKey] = newLanguagePackTranslations;
			}

			const newLanguagePackFile: LanguagePackFile = {
				"id": file.id,
				"path": file.path,
				"contents": {
					"": file.contents[""],
					"version": "1.0.0",
					"contents": newLanguagePackFileContentPart
				}
			};
			newLanguagePack.contents.push(newLanguagePackFile);
		}
		console.log(newLanguagePack);
		// fs.writeFileSync('newLanguagePack.json', JSON.stringify(newLanguagePack, null, 2));
		exportTranslationsCacheToFile();
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}
