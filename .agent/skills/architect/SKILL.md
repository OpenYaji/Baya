# Architect Skill: AI Folder Structurer

This skill provides specialized guidance for the "Architect" project, an AI-powered folder structurer that eliminates "blank canvas paralysis" for developers.

## Core Technologies
- **Frontend**: Next.js (TypeScript), Tailwind CSS.
- **Backend as a Service**: Google Firebase (Firestore for state management, Auth for user sessions).
- **AI Integration**: Google Gemini 2.0 Flash API (via Vertex AI or Google AI SDK) for architectural design and folder scaffolding.
- **Infrastructure**: Google Cloud Platform.

## Implementation Guidelines

### Phase 1: Discovery
- Implement a dual-input form:
  1. **Product Intent**: Text area for goal description.
  2. **Developer Sandbox**: Tag-based input for known tools/stack.
- Use Gemini 2.0 Flash to process inputs and propose an optimal stack.

### Phase 2: The Mixing Board
- Create an interactive UI with four pillars: Frontend/Mobile, Backend/API, Database, AI/Infrastructure.
- Each pillar must be editable, allowing users to swap suggested technologies.
- State should be synced with Firebase to allow persistence and collaboration.

### Phase 3: Modern Blueprint
- Generate a standardized monorepo structure: `/apps`, `/backend`, `/packages`, `/infrastructure`, `/agents`.
- The structure should be represented as a JSON object that updates dynamically based on the Mixing Board.

### Phase 4: The Handoff
- Generate an executable script (`.sh` for Unix, `.bat` for Windows) that:
  - Scaffolds the full directory tree.
  - Creates boilerplate files.
  - Opens the project in a supported AI-first IDE (e.g., Cursor, Claude Code).

## Design Principles
- **Visual Feedback**: Use rich animations and clear transitions between phases.
- **Dynamic State**: Ensure the folder structure JSON is always in sync with user edits.
- **Handoff Accuracy**: The generated script must be reliable and production-ready.
