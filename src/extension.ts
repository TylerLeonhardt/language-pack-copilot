import * as fs from 'fs';
import * as vscode from 'vscode';
import { translatePhrases } from './azureIntegration';
import { getAndSaveLanguagePackCollection, getLanguagePackCollection, LanguagePack, LanguagePackFile } from './languagePackCollection';
import { scanLanguagePackCollection, ScanChunkCollection } from './languagePackCollectionScanner';
import { exportCacheToFile as exportTranslationsCacheToFile } from './azureCache';

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

	context.subscriptions.push(vscode.commands.registerCommand('l10n-participant.translate.fetch', async () => {
		await getAndSaveLanguagePackCollection('languagePackCollection.json');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('l10n-participant.translate.process', async () => {
		const languagePackCollection = await getLanguagePackCollection();
		const referenceLanguagePack = languagePackCollection[Object.keys(languagePackCollection)[0]];
		const newLanguagePack: LanguagePack = {};
		const scanChunkCollection: ScanChunkCollection = scanLanguagePackCollection(languagePackCollection);
		for (const fileKey in scanChunkCollection) {
			const file = scanChunkCollection[fileKey];
			const newLanguagePackFile: LanguagePackFile = {
				"": referenceLanguagePack[fileKey][""],
				"version": "1.0.0",
				"contents": {}
			};
			for (const chunkKey in file) {
				const chunk = file[chunkKey];
				const newLanguagePackChunk: Record<string, string> = {};
				for (const key in chunk) {
					const values = chunk[key];
					// e.g. ["Ошибка: {0}", "Chyba: {0}", "오류: {0}"] => "Error: {0}"
					const translation = await translatePhrases(values);
					if (translation === null) {
						vscode.window.showErrorMessage('Translation failed for key: ' + key + ' in chunk: ' + chunkKey + ' in file: ' + fileKey);
						return;
					}
					newLanguagePackChunk[key] = translation;
				}
				newLanguagePackFile.contents[chunkKey] = newLanguagePackChunk;
			}
			newLanguagePack[fileKey] = newLanguagePackFile;
		}

		fs.writeFileSync('newLanguagePack.json', JSON.stringify(newLanguagePack, null, 2));
		exportTranslationsCacheToFile();
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}
