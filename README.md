# Commit Migration Tool

An interactive web-based tool designed to help you selectively migrate commits between branches, run local CI playground environments, and automatically generate descriptive Pull Requests using AI.

## Features
- **Git Graph Visualization**: Inspect and select commits via a VS Code-style interactive git graph.
- **Local Sandbox**: Safely checkout, branch, and test code before doing any pushes.
- **AI Pull Requests**: Leverages AI (Gemini, OpenAI, etc.) to evaluate local diffs and automatically write a comprehensive PR description.
- **Zero Configuration**: Uses pure `git` commands underneath, handling multi-line commits and complex branching painlessly.

## Getting Started

First, install the necessary dependencies using Bun:
```bash
bun install
```

Then, run the development server locally:
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to launch the tool.

## Prerequisites

To finalize migration and publish Pull Requests directly to GitHub, you will need a **GitHub Personal Access Token (Classic)**. 

### How to Generate a GitHub Token

1. Go to your GitHub account settings and navigate to [Developer Settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens/new).
2. Look for the **Generate new token** button in the top right and click **Generate new token (classic)**.
3. In the **Note** field, give it a descriptive name (e.g., "Commit Migration Tool").
4. Under the **Select scopes** section, check the box next to **`repo`**. This grants the token full control of private and public repositories to read source code and create pull requests.
5. Scroll down to the bottom and click the **Generate token** button.
6. **Important:** Copy the generated token immediately! GitHub will only show it to you once. 

Once copied, paste it into the **Settings Modal** (gear icon) on the top right of the application.

## Technologies Used
- Next.js (App Router)
- React & Tailwind CSS
- Bun Runtime
- native `child_process` (for Git operations)