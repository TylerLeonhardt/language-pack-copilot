// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { fetchLanguagePacks } from './utils/fetchLanguagePacks';
import { getLanguageFiles } from './utils/getLanguageFiles';
import { getTranslationsStrings } from './utils/getTranslationsStrings';
import { translatePhrases } from './azureIntegration';
import { getAndSaveLanguageBookCollection } from './languageBookCollection';

const PARTICIPANT_ID = 'l10n-participant.translator';

const MODEL_SELECTOR: vscode.LanguageModelChatSelector = {
	vendor: 'copilot',
	family: 'gpt-3.5-turbo'
};

interface MyChatResult extends vscode.ChatResult {
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const handler: vscode.ChatRequestHandler = async (
		request: vscode.ChatRequest,
		context: vscode.ChatContext,
		stream: vscode.ChatResponseStream,
		token: vscode.CancellationToken): Promise<MyChatResult> => {
		if (request.command === 'translate') {
			stream.progress('Translating...');
			const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
			if (model) {
				const messages: vscode.LanguageModelChatMessage[] = [
					vscode.LanguageModelChatMessage.User(`You are a translator. The phrases you translate will be related to Visual Studio Code, a code editor.
						Your goal is to output a sentence in English given the same sentence in multiple languages.
						Pick a concise translation that best captures the meaning of the original sentence.
						Example input: Закрыть диалоговое окно, Zavřít dialogové okno, Cerrar cuadro de diálogo
						Example output: Close Dialog`),
					vscode.LanguageModelChatMessage.User(request.prompt),
				];

				const chatResponse = await model.sendRequest(messages, {}, token);
				for await (const fragment of chatResponse.text) {
					stream.markdown(fragment);
				}
				const languagePacks = await fetchLanguagePacks();
				const languageFiles =  await getLanguageFiles(languagePacks[0]);
				let translationsStrings: { [key: string]: {} } = {};

				await Promise.all(languageFiles.map(async (languageFile: { name: string }) => {
					translationsStrings[languageFile.name] = await getTranslationsStrings(languageFile);
				}));

				console.log(translationsStrings);

			} else {
				stream.markdown('No model available for translation. Please try again later.');
			}
		}
		return {};
	};

	const participant = vscode.chat.createChatParticipant(PARTICIPANT_ID, handler);
	context.subscriptions.push(participant);

	context.subscriptions.push(vscode.commands.registerCommand('l10n-participant.translate.example', async () => {
		const phrases: string[] = ["Usar expresión regular", "Použit regulární výraz", "Использовать регулярное выражение"];
		const answer = await translatePhrases(phrases);
		vscode.window.showInformationMessage(answer ?? 'NULL');

		const phrases2: string[] = ["Ошибка: {0}", "Chyba: {0}", "오류: {0}"];
		const answer2 = await translatePhrases(phrases2);
		vscode.window.showInformationMessage(answer2 ?? 'NULL');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('l10n-participant.translate.fetch', async () => {
		await getAndSaveLanguageBookCollection('languageBookCollection.json');
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}
