import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import readline from "readline";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// We force Gemini to strictly output JSON so it never breaks our parser
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-lite",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

// --- TOOLS ---

async function executeCommand(cmd) {
    return new Promise((resolve) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                resolve(`Error: ${stderr || error.message}`);
                return;
            }
            resolve(stdout || "Command executed successfully");
        });
    });
}

async function createFile(filename, content) {
    try {
        const filePath = path.join(process.cwd(), filename);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
        return `File ${filename} created successfully.`;
    } catch (err) {
        return `Error creating file: ${err.message}`;
    }
}

const tool_map = {
    executeCommand: executeCommand,
    createFile: createFile
};

// --- SYSTEM PROMPT ---

const system_prompt = `
You are an expert Web Developer AI Agent. Your goal is to clone websites based on user instructions.
You operate in a strict loop: THINK -> TOOL -> OBSERVE -> OUTPUT.

Available Tools:
1. createFile: Creates a file. Arguments required: { "filename": "string", "content": "string" }
2. executeCommand: Runs terminal commands. Arguments required: { "cmd": "string" }

Rules:
1. You MUST ALWAYS respond in a valid JSON object.
2. JSON Structure: 
{ 
  "step": "THINK" | "TOOL" | "OUTPUT", 
  "content": "Description of what you are doing", 
  "tool_name": "createFile" | "executeCommand" | null, 
  "tool_args": { "filename": "...", "content": "..." } | { "cmd": "..." } | null
}
3. To clone Scaler, create index.html, style.css, and script.js in a loop.
4. After creating all files, use executeCommand to open the HTML file (e.g., 'start scaler_clone/index.html' on Windows).
5. Once everything is done, finish with step: "OUTPUT".
`;

// --- CORE ENGINE ---

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function chat() {
    const messages = [{ role: "user", parts: [{ text: system_prompt }] }];

    const askQuestion = () => {
        rl.question("\nUser: ", async (input) => {
            messages.push({ role: "user", parts: [{ text: input }] });
            
            let loading = true;
            while (loading) {
                try {
                    const chatSession = model.startChat({ history: messages });
                    const result = await chatSession.sendMessage(input);
                    const responseText = result.response.text();
                    
                    let action;
                    try {
                        action = JSON.parse(responseText);
                    } catch (e) {
                        console.log("\n[SYSTEM] Error parsing JSON. Forcing retry...");
                        messages.push({ role: "model", parts: [{ text: responseText }] });
                        messages.push({ role: "user", parts: [{ text: `OBSERVE: Formatting Error. You must output ONLY valid JSON.` }] });
                        continue;
                    }

                    if (action.step === "THINK") {
                        console.log(`\n[THINKING] ${action.content}`);
                        messages.push({ role: "model", parts: [{ text: responseText }] });
                        messages.push({ role: "user", parts: [{ text: `OBSERVE: Thought recorded. Proceed to next step.` }] });
                    }
                    else if (action.step === "TOOL") {
                        console.log(`\n[TOOL CALL] Executing: ${action.tool_name}...`);
                        
                        let observation;
                        if (!tool_map[action.tool_name]) {
                            observation = `Error: Tool ${action.tool_name} not found.`;
                        } else {
                            if (action.tool_name === "createFile") {
                                observation = await tool_map[action.tool_name](action.tool_args.filename, action.tool_args.content);
                            } else if (action.tool_name === "executeCommand") {
                                observation = await tool_map[action.tool_name](action.tool_args.cmd);
                            }
                        }
                        
                        console.log(`[OBSERVE] ${observation}`);
                        messages.push({ role: "model", parts: [{ text: responseText }] });
                        messages.push({ role: "user", parts: [{ text: `OBSERVE: ${observation}` }] });
                    } 
                    else if (action.step === "OUTPUT") {
                        console.log(`\n[FINAL OUTPUT] ${action.content}`);
                        loading = false;
                        askQuestion();
                    }

                } catch (error) {
                    console.error("\n[API ERROR] Something went wrong:", error.message);
                    loading = false;
                    askQuestion();
                }
            }
        });
    };

    console.log("========================================");
    console.log(" AI Agent CLI Started. ");
    console.log(" Type your prompt to clone the website.");
    console.log("========================================");
    askQuestion();
}

chat();