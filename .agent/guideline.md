🏗️ Product Guideline: "Architect" (AI Folder Structurer)
Core Objective: Eliminate "blank canvas paralysis" by dynamically architecting and scaffolding a software project based on a user's product intent and existing skill set, ending with a seamless handoff to an AI coding agent.

🧠 Phase 1: Discovery (The Skill Baseline & Intent)
Before the AI generates anything, the system needs to understand both the goal and the developer.

Input 1: Product Intent: A text area where the user describes what they are building.

Example: "I want to build a cross-platform health tracker that uses AI for data verification."

Input 2: The Developer Sandbox (New Feature): A multi-select or tag-input field where the user lists the tools they already know or strictly want to use.

Example: "React, PHP, MySQL."

The AI Action: The Gemini 2.0 Flash API processes both inputs. It is prompted to design a stack that achieves the product goal while maximizing the use of the developer's known tools.

🎛️ Phase 2: The Mixing Board (Review & Edit)
The AI shouldn't just force a stack on the user; it should propose a draft that the user can tweak.

The Output: The app renders a visual architecture board mapping out the AI's suggestions across four pillars:

Frontend / Mobile: (e.g., React Native)

Backend / API: (e.g., PHP / Laravel)

Database: (e.g., MySQL)

AI / Infrastructure: (e.g., Python / LangChain)

The "Mix" Feature: Each pillar is a dropdown or editable card. If the AI suggests Node.js for the backend but the user changes their mind, they can manually swap it to PHP.

Dynamic Update: When a user swaps a framework, the underlying JSON structure representing the folders updates automatically in the state.

🏗️ Phase 3: The Modern Blueprint (Folder Structuring)
Once the stack is locked in on the Mixing Board, the system finalizes the battle-tested monorepo structure.

/apps: Contains the user-facing workspaces (e.g., /apps/web-react, /apps/mobile-expo).

/backend: Contains the server logic (e.g., /backend/php-api).

/packages: Shared internal resources (UI components, database schemas).

/infrastructure: DevOps files, Docker compose, and GitHub Actions.

/agents: The dedicated AI folder. Pre-configured with system prompts and connection scripts for their chosen AI tools.

🚀 Phase 4: The Handoff (Executable Generation)
Clicking "Generate & Launch" triggers the final output.

The Execution: The web app compiles the approved JSON structure into a downloadable init-project.sh (or .bat for Windows) script.

Terminal Action: When the user runs this script:

It creates the complex folder tree instantly.

It touches the necessary boilerplate files (index.php, App.tsx, package.json).

It runs the CLI command to open the exact project directory directly inside Anti Gravity or Claude Code.