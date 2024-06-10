// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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
		token: vscode.CancellationToken
	): Promise<MyChatResult> => {
		if (request.command === 'translate') {
			stream.progress('Translating...');
			const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
			if (model) {
				const messages = [
					vscode.LanguageModelChatMessage.User('You are a translator. Your goal is to output a new language pack in the requested language based on the language pack file the user currently has open. Output a JSON object with the exact same keys in the exact same order as the first opened language pack, but with the values translated.'),
					vscode.LanguageModelChatMessage.User('The user requests a language pack in the following language: ' + request.prompt)
				];

				const chatResponse = await model.sendRequest(messages, {}, token);
				for await (const fragment of chatResponse.text) {
					stream.markdown(fragment);
				}
			} else {
				stream.markdown('No model available for translation. Please try again later.');
			}
		}
		return {};
	};

	const participant = vscode.chat.createChatParticipant(PARTICIPANT_ID, handler);
	context.subscriptions.push(participant);
}

// This method is called when your extension is deactivated
export function deactivate() {}
