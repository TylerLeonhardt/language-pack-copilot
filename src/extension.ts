import * as fs from 'fs';
import * as vscode from 'vscode';
import { translatePhrases } from './azureIntegration';
import { exportCacheToFile as exportTranslationsCacheToFile } from './azureCache';
import { DownloadVScodeLocRepoToATempLocation, LanguagePack, LanguagePackFile, LanguagePackFileContentPart, LanguagePackTranslation, loadLanguagePacks } from './languagePacks';
import { writeLanguagePack } from './writeLanguagePack';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('l10n-participant.translate.create', async () => {
		const tempLocation = await DownloadVScodeLocRepoToATempLocation();
		const languagePackCollection = loadLanguagePacks(tempLocation);

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
		await writeLanguagePack(newLanguagePack);

		// fs.writeFileSync('newLanguagePack.json', JSON.stringify(newLanguagePack, null, 2));
		exportTranslationsCacheToFile();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('l10n-participant.translate.export', async () => {
		const filePath = await DownloadVScodeLocRepoToATempLocation();
		const collection = loadLanguagePacks(filePath);
		const languagePack = collection['cs'];

		await writeLanguagePack(languagePack);
	}));

}

// This method is called when your extension is deactivated
export function deactivate() {}
