# Journey Analyzer Frontend

A React-based web interface for analyzing user journeys and assessing their risk levels based on GitHub repositories.

## Features

- **User-Friendly Form**: Input GitHub URLs and define multiple user journeys with steps
- **Real-Time Analysis**: Submit journeys for analysis and view results
- **Visual Risk Dashboard**: Color-coded risk levels (Critical, High, Medium, Low)
- **Detailed Metrics**: View complexity analysis, file involvement, and dependencies
- **Example Data**: Load pre-configured examples to test the application

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Journey Analyzer API running on `http://localhost:3000`

### Installation

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

The frontend will be available at `http://localhost:5173`

## Usage

1. **Enter GitHub URL**: Provide the repository URL you want to analyze
2. **Add User Journeys**: Define one or more user journeys
3. **Click "Load Example"**: Or load a pre-configured example
4. **Analyze**: Click the "Analyze User Journeys" button
5. **View Results**: See detailed risk analysis and metrics

## Technology Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
