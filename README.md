# AI Agent CLI Tool - Assignment 02

A conversational command-line agent built with Node.js and the Gemini API. This tool acts as an autonomous web developer that takes natural language prompts, reasons through the necessary steps using a ReAct (Reason-Act) loop, and generates a fully functioning, styled website clone locally.

## Features
* **Conversational Interface:** Chat directly with the AI in your terminal.
* **Autonomous File Creation:** The agent automatically generates `index.html`, `style.css`, and `script.js` files based on design instructions.
* **System Command Execution:** The agent can run system commands to automatically open the generated webpage in the browser.
* **Strict JSON Reasoning:** Uses Gemini's JSON mode to reliably loop through `THINK`, `TOOL`, and `OBSERVE` states before finalizing the `OUTPUT`.

## Prerequisites
* Node.js installed on your machine.
* A valid Gemini API Key from Google AI Studio.

## Setup Instructions

1. **Clone this repository and navigate to the project directory:**
   \`\`\`bash
   git clone https://github.com/MSSAYED11/Cli-Assignment.git
   cd Cli-Assignment
   \`\`\`

2. **Install the required dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure your API Key:**
   * Rename the `.env.example` file to `.env`.
   * Add your actual Gemini API key to the file:
     \`\`\`env
     GEMINI_API_KEY=your_actual_api_key_here
     \`\`\`

## How to Run

1. **Start the Agent:**
   Open your terminal and run the following command:
   \`\`\`bash
   node index.js
   \`\`\`

2. **Test the Agent (Demo Prompt):**
   Once the tool is running and waiting for input, paste the following prompt to watch the agent clone the Scaler Academy landing page step-by-step:

   > Clone the Scaler Academy landing page in a folder 'scaler_clone' with index.html, style.css, and script.js. Use a professional white-label design: white background, navy text (#0b122f), and primary blue buttons (#0052ff). Section 1: Flexbox Navbar with links and a blue CTA. Section 2: Hero section with the headline 'Become the Professional Built for the Next Decade in AI' (color 'Next Decade in AI' blue). Section 3: Dual CTA buttons with hover effects. Section 4: Dark footer. Use the 'Inter' font and ensure it's responsive. Open the site in my browser when finished.

## Architecture
This project utilizes the **ReAct (Reason-Act)** framework. The agent is provided with a system prompt that enforces a strict JSON output structure, allowing it to think about the task, call specific tools (`createFile`, `executeCommand`), observe the outcome, and repeat the cycle until the overall objective is completed.
