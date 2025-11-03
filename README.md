# Journey Analyzer API

A comprehensive standalone API for analyzing user journeys based on GitHub repositories, determining business value, complexity, and risk levels.

## Overview

The Journey Analyzer API helps you:
- Determine the business value of user journeys (low/medium/high)
- Retrieve and scan GitHub repositories (public and private with authentication)
- Link user journeys to specific code files
- Calculate complexity based on codebase analysis
- Generate risk overviews per user journey

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start the development server
npm run dev
```

The API will start on `http://localhost:3000` (or the port specified in `.env`).

### Build for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## Architecture

The system consists of several key components:

1. **GitHubScanner**: Clones and scans GitHub repositories
2. **BusinessValueAnalyzer**: Determines business value based on journey keywords
3. **ComplexityAnalyzer**: Links journeys to code and calculates complexity metrics
4. **RiskCalculator**: Computes risk levels based on value and complexity
5. **JourneyAnalyzerService**: Orchestrates the entire analysis pipeline

## API Endpoints

### POST /api/journey-analyzer/analyze

Analyzes user journeys based on a GitHub repository.

**Request Body:**
```json
{
  "githubUrl": "https://github.com/username/repository",
  "userJourneys": [
    {
      "name": "User Checkout Flow",
      "description": "Complete purchase and payment process",
      "steps": [
        "User adds items to cart",
        "User reviews cart contents",
        "User enters shipping information",
        "User enters payment details",
        "User confirms order"
      ]
    },
    {
      "name": "User Profile Management",
      "description": "User updates their profile information",
      "steps": [
        "User navigates to profile page",
        "User edits personal information",
        "User saves changes"
      ]
    }
  ]
}
```

**Response:**
```json
{
  "githubUrl": "https://github.com/username/repository",
  "repositoryName": "repository",
  "analysisTimestamp": "2024-11-03T19:30:00.000Z",
  "journeyRisks": [
    {
      "journey": {
        "name": "User Checkout Flow",
        "description": "Complete purchase and payment process",
        "steps": [...]
      },
      "businessValue": "high",
      "complexity": "high",
      "riskLevel": "critical",
      "complexityAnalysis": {
        "filesInvolved": [
          "src/checkout/cart.ts",
          "src/checkout/payment.ts",
          "src/checkout/order.ts"
        ],
        "dependencies": [
          "stripe",
          "react",
          "axios"
        ],
        "linesOfCode": 1250,
        "cyclomaticComplexity": 85
      },
      "reasoning": "High business value: Journey involves critical business functions (payment, checkout, purchase, transaction)...",
    }
  ],
  "summary": {
    "totalJourneys": 2,
    "highRisk": 1,
    "mediumRisk": 1,
    "lowRisk": 0
  }
}
```

### GET /api/journey-analyzer/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "journey-analyzer",
  "timestamp": "2024-11-03T19:30:00.000Z"
}
```

## Risk Matrix

Risk is calculated based on the combination of business value and complexity:

| Business Value | Complexity | Risk Level |
|----------------|------------|------------|
| High           | High       | Critical   |
| High           | Medium     | High       |
| High           | Low        | Medium     |
| Medium         | High       | High       |
| Medium         | Medium     | Medium     |
| Medium         | Low        | Low        |
| Low            | High       | Medium     |
| Low            | Medium     | Low        |
| Low            | Low        | Low        |

## Business Value Determination

Business value is determined by analyzing journey keywords:

**High Value Keywords:**
- payment, checkout, purchase, transaction, revenue
- subscription, billing, order, sale
- security, authentication, login, signup
- critical, essential, core

**Medium Value Keywords:**
- search, filter, browse, view
- notification, settings, profile
- share, export, report, dashboard

**Low Value Keywords:**
- help, documentation, tutorial
- about, contact, footer
- theme, preference, cosmetic

## Complexity Metrics

Complexity is calculated based on multiple factors:

1. **File Count**: Number of files involved in the journey
2. **Lines of Code**: Total lines of code across relevant files
3. **Dependencies**: Number of imports and dependencies
4. **Cyclomatic Complexity**: Estimated decision points (if/for/while/case statements)

## Example Usage

### Basic Example (Public Repository)

```bash
curl -X POST http://localhost:3000/api/journey-analyzer/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "githubUrl": "https://github.com/username/my-app",
    "userJourneys": [
      {
        "name": "User Login",
        "description": "User authenticates into the application",
        "steps": [
          "User enters email and password",
          "System validates credentials",
          "User is redirected to dashboard"
        ]
      }
    ]
  }'
```

### Using Example Files

Example request files are included in the `src/` directory:

```bash
# Use the generic example
curl -X POST http://localhost:3000/api/journey-analyzer/analyze \
  -H "Content-Type: application/json" \
  -d @src/example-request.json

# Use the superpowers app example
curl -X POST http://localhost:3000/api/journey-analyzer/analyze \
  -H "Content-Type: application/json" \
  -d @src/superpowers-example.json
```

### Check API Status

```bash
# Root endpoint (API information)
curl http://localhost:3000/

# Health check
curl http://localhost:3000/health

# Journey analyzer health check
curl http://localhost:3000/api/journey-analyzer/health
```

## GitHub Authentication

### Public Repositories

Public repositories work out of the box - no authentication required. The API uses `git clone` to fetch the repository.

### Private Repositories

For private repositories, you need to configure Git authentication on the server where this API runs:

**Option 1: SSH Keys (Recommended for servers)**
```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to your GitHub account: Settings → SSH Keys
cat ~/.ssh/id_ed25519.pub

# Use SSH URL format in API requests
{
  "githubUrl": "git@github.com:username/private-repo.git",
  ...
}
```

**Option 2: Personal Access Token (PAT)**
```bash
# Configure Git credential helper
git config --global credential.helper store

# On first git clone, enter your GitHub username and PAT
# Or embed in URL (not recommended for production):
{
  "githubUrl": "https://username:TOKEN@github.com/username/private-repo.git",
  ...
}
```

**Option 3: GitHub CLI**
```bash
# Install and authenticate with GitHub CLI
gh auth login

# Git will automatically use gh credentials
```

## Requirements

- **Node.js**: Version 18 or higher
- **Git**: Must be installed and accessible in PATH
- **GitHub Access**:
  - Public repositories: No authentication needed
  - Private repositories: SSH keys, PAT, or GitHub CLI authentication

## Technical Notes

- The system clones repositories into a temporary directory (`.tmp-repos`)
- Repositories are automatically cleaned up after analysis
- Only source code files are scanned (js, ts, py, java, go, etc.)
- Excluded directories: `node_modules`, `dist`, `build`, `.git`
- The API performs a shallow clone (`--depth 1`) for faster processing

## Project Structure

```
journey-analyzer/
├── src/
│   ├── server.ts                      # Main Express server
│   ├── types.ts                       # TypeScript type definitions
│   ├── journey-analyzer-routes.ts     # API routes
│   ├── journey-analyzer-service.ts    # Main orchestration service
│   ├── github-scanner.ts              # GitHub repository cloning/scanning
│   ├── business-value-analyzer.ts     # Business value determination
│   ├── complexity-analyzer.ts         # Code complexity analysis
│   ├── risk-calculator.ts             # Risk level calculation
│   ├── example-request.json           # Generic example request
│   ├── superpowers-example.json       # Superpowers app example
│   └── sample-output.json             # Example API response
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```
