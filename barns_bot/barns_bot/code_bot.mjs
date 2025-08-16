import OpenAI from "openai";
import fs from "fs";
import path from "path";
import readline from "readline";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Path to the file
const filePath = path.resolve("./employee_vacations.md");

if (!fs.existsSync(filePath)) {
  console.error("❌ File not found:", filePath);
  process.exit(1);
}

// Create Vector Store and upload the file
console.log("📂 Uploading file to Vector Store...");
const vectorStore = await client.vectorStores.create({ name: "vacations-knowledge" });

await client.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
  files: [fs.createReadStream(filePath)]
});

console.log("✅ File uploaded. Vector Store ID:", vectorStore.id);

// Interactive chat setup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\n💬 Ask me about employee vacations (type 'exit' to quit):");

function askQuestion() {
  rl.question("> ", async (question) => {
    if (question.toLowerCase() === "exit") {
      rl.close();
      return;
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: "You are an assistant that answers only from the provided file about employee vacations." },
        { role: "user", content: question }
      ],
      tools: [{ type: "file_search", vector_store_ids: [vectorStore.id] }]
    });

    console.log("\n🗨️ Answer:");
    console.log(response.output_text);
    console.log("");

    askQuestion();
  });
}

askQuestion();
