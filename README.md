
# Advanced AI Chat Platform

A production-ready AI chat platform with real-time collaboration, GitHub integration, and enterprise features.

## Features

- **AI Chat Interface**: Powered by Grok AI with streaming responses
- **Real-time Collaboration**: Multi-user editing and suggestions
- **GitHub Integration**: Repository analysis and code insights
- **Enterprise Dashboard**: Analytics and performance monitoring
- **Security Features**: Rate limiting, audit logging, and security monitoring
- **Visualization Tools**: Data visualization and collaboration mapping

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OIDC)
- **AI**: Grok API integration
- **Real-time**: WebSocket connections

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Replit account for authentication

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in Replit Secrets:
   - `GROK_API_KEY`: Your Grok API key
   - `DATABASE_URL`: PostgreSQL connection string
   - `SESSION_SECRET`: Random string for session encryption

4. Run the development server:
   ```bash
   npm run dev
   ```

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript schemas
└── dist/           # Built application
```

## API Endpoints

- `/api/chat` - AI chat completions
- `/api/github/*` - GitHub integration
- `/api/collaboration/*` - Real-time collaboration
- `/api/analytics/*` - Enterprise analytics

## Contributing

This project is developed and maintained by Ervin Remus Radosavlevici.

### Payment for Contributions

Contributions are welcome! For paid contributions, please contact:

**GitHub**: [radosavlevici210](https://github.com/radosavlevici210)  
**Email**: radosavlevici210@icloud.com

**International Bank Transfer Details:**
- **Name**: Ervin Remus Radosavlevici
- **IBAN**: GB45 NAIA 0708 0620 7951 39
- **BIC**: NAIAGB21
- **Swift Intermediary Bank**: MIDLGB22

*All payment information is secure under radosavlevici210 GitHub account.*

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security

For security issues, please contact radosavlevici210@icloud.com

## Deployment

This application is designed to run on Replit with autoscaling deployment.
