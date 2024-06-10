import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";

export async function translatePhrases(phrases: string[]): Promise<string | null> {
  const scope = "https://cognitiveservices.azure.com/.default";
  const azureADTokenProvider = getBearerTokenProvider(new DefaultAzureCredential(), scope);
  const deployment = "gpt-35-turbo";
  const apiVersion = "2024-04-01-preview";
  const endpoint = "https://vscode-openai.openai.azure.com/";
  const client = new AzureOpenAI({ azureADTokenProvider, deployment, apiVersion, endpoint });
  const result = await client.chat.completions.create({
    messages:  [
      { role: "system", content: "You are a translator. The phrases you translate will be related to Visual Studio Code, a code editor. Your goal is to output a sentence in English given the same sentence in multiple languages. Pick a concise translation that best captures the meaning of the original sentence." },
      { role: "user", content: "Закрыть диалоговое окно, Zavřít dialogové okno, Cerrar cuadro de diálogo" },
      { role: "assistant", content: "Close Dialog" },
      { role: "user", content: phrases.join(", ") },
    ],
    model: deployment,
    top_p: 0.95,
  });

  for (const choice of result.choices) {
    console.log(choice.message);
  }

  return result.choices[0].message.content;
}
