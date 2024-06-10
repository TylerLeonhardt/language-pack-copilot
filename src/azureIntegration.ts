import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";

export async function translatePhrases(phrases: string[]): Promise<string | null> {
  // I am currently using the process.env["AZURE_OPENAI_API_KEY"] to hold the API key
  // instead of using @azure/identity.
  // const scope = "https://cognitiveservices.azure.com/.default";
  // const azureADTokenProvider = getBearerTokenProvider(new DefaultAzureCredential(), scope);

  // The name of the deployment in Azure OpenAI that we want to use.
  const deployment = "Turbo";
  const endpoint = "https://vscode-openai.openai.azure.com/";
  const apiVersion = "2024-04-01-preview"; // Not sure what are the possible values here.
  const client = new AzureOpenAI({ deployment, apiVersion, endpoint });
  const result = await client.chat.completions.create({
    messages:  [
      { role: "system", content: "You are a translator. The phrases you translate will be related to Visual Studio Code, a code editor. Your goal is to output a sentence in English given the same sentence in multiple languages. Pick a concise translation that best captures the meaning of the original sentence." },
      { role: "user", content: "Закрыть диалоговое окно, Zavřít dialogové okno, Cerrar cuadro de diálogo" }, // example 1 user input
      { role: "assistant", content: "Close Dialog" }, // example 1 bot response
      { role: "user", content: phrases.join(", ") },
    ],
    model: deployment,
    top_p: 0.95,
  });

  // Example output: {content: 'Use Regular Expression', role: 'assistant'}
  // for (const choice of result.choices) {
  //   console.log(choice.message);
  // }

  return result.choices[0].message.content;
}
