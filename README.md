# GraphChat

A real-time collaborative graph visualization chat application with molecular viewer support.

## Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended package manager)
- If you don't have `pnpm` installed, you can install it with:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## Setup

1. Clone the repository:
```bash
git clone https://github.com/EvoEvolver/graphchat.git
cd graphchat
```

2. Install dependencies:
```bash
pnpm i
```

3. Install Python dependencies for the SDK:
```bash
uv sync
```

## Development

Start both frontend and backend development servers:

```bash
pnpm dev
```

This will start:
- Frontend (React + Vite) on `http://localhost:5173`
- Backend (Express + WebSocket) on `http://localhost:3000`


## Project Structure

- `packages/frontend/` - React frontend with graph visualization
- `packages/backend/` - Express backend with WebSocket support
- `graphchat/` - Python SDK for GraphChat integration

## Features

- Real-time collaborative graph editing
- Molecular structure visualization
- WebSocket-based synchronization using Yjs
- React Flow for graph visualization
- 3Dmol.js for molecular viewer