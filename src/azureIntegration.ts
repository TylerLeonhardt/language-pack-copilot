import { AzureOpenAI } from "openai";
import { addTranslation as addTranslationToCache, getTranslation as getTranslationFromCache } from "./azureCache";

export async function translatePhrases(phrases: string[]): Promise<string | null> {
  const cachedEntry = getTranslationFromCache(phrases);
  if (cachedEntry) {
    return cachedEntry;
  }

  // I am currently using process.env["AZURE_OPENAI_API_KEY"] to hold the API key instead of using @azure/identity.
  // The name of the deployment in Azure OpenAI that we want to use.
  const deployment = "Turbo";
  const endpoint = "https://vscode-openai.openai.azure.com/";
  const apiVersion = "2024-04-01-preview"; // Not sure what are the possible values here.
  const client = new AzureOpenAI({ deployment, apiVersion, endpoint });
  const result = await client.chat.completions.create({
    messages:  [
      { role: "system", content: "You are a translator. The phrases you translate will be related to Visual Studio Code, a code editor. Your goal is to output a sentence in British English given the same sentence in multiple languages. Pick a concise translation that best captures the meaning of the original sentence." },
      { role: "user", content: "Закрыть диалоговое окно, Zavřít dialogové okno, Cerrar cuadro de diálogo" }, // example 1 input
      { role: "assistant", content: "Close Dialog" }, // example 1 response
      { role: "user", content: "Soubory s více příponami, Dateien mit mehreren Erweiterunge, 複数の拡張子のファイル" }, // example 2 input
      { role: "assistant", content: "Files with multiple extensions" }, // example 2 response
      { role: "user", content: "あいまい一致, Correspondência Difusa, Benzer Öğe Eşleşmesi" }, // example 3 input
      { role: "assistant", content: "Fuzzy Search" }, // example 3 response
      { role: "user", content: phrases.join(", ") },
    ],
    model: deployment,
    top_p: 0.95,
  });

  const translation = result.choices[0].message.content;
  if (!translation) {
    console.error("Translation failed for phrases: ", phrases, " with result: ", JSON.stringify(result, null, 2));
    return null;
  }

  addTranslationToCache(phrases, translation);
  return translation;
}
