
# X.AI Grok Chat - Enterprise AI Assistant

A powerful, production-ready AI chat application built with X.AI Grok integration, featuring enterprise monitoring, advanced AI capabilities, and real-time collaboration tools.

## Features

### Core Features
- **X.AI Grok Integration** - Direct integration with X.AI's Grok models
- **Real-time Chat** - Instant messaging with AI assistants
- **Conversation Management** - Save, organize, and search chat history
- **Dark/Light Theme** - Responsive design with theme switching
- **Mobile Responsive** - Optimized for all device sizes

### Enterprise Features
- **Enterprise Monitoring** - Real-time system metrics and performance tracking
- **Production Optimization** - Automatic performance tuning and resource optimization
- **Advanced AI Services** - Enhanced AI capabilities with custom models
- **Security Audit** - Built-in security scanning and vulnerability detection
- **GitHub Integration** - Seamless code analysis and documentation generation

### Technical Features
- **Rate Limiting** - API protection with intelligent rate limiting
- **Database Integration** - PostgreSQL with Drizzle ORM
- **Authentication** - Secure user authentication system
- **Performance Monitoring** - Real-time performance metrics
- **Error Handling** - Comprehensive error tracking and logging

## Technology Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Wouter** - Lightweight routing
- **Lucide Icons** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **PostgreSQL** - Reliable database
- **Drizzle ORM** - Type-safe database operations

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd x-ai-grok-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```env
   XAI_API_KEY=your_xai_api_key_here
   DATABASE_URL=your_database_url_here
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Usage

### Basic Chat
1. Open the application in your browser
2. Click "New Chat" to start a conversation
3. Type your message and press Enter
4. The AI will respond in real-time

### Enterprise Monitoring
1. Navigate to the Monitoring page
2. View real-time system metrics
3. Monitor performance and resource usage
4. Set up alerts and notifications

### GitHub Integration
1. Connect your GitHub account
2. Analyze repositories for security issues
3. Generate automatic documentation
4. Get code quality insights

## Configuration

### Environment Variables
- `XAI_API_KEY` - Your X.AI API key for Grok access
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)

### Customization
- Modify `tailwind.config.ts` for styling customization
- Update `server/services/` for service configuration
- Customize AI models in `server/services/grok.ts`

## API Endpoints

### Chat API
- `POST /api/chat` - Send chat messages
- `GET /api/conversations` - Get conversation history
- `POST /api/conversations` - Create new conversation

### Monitoring API
- `GET /api/monitoring/metrics` - Get system metrics
- `GET /api/monitoring/health` - Health check endpoint

### GitHub API
- `POST /api/github/analyze` - Analyze repository
- `GET /api/github/repos` - Get repository list

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema
- `npm run lint` - Run ESLint

### Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility libraries
├── server/                 # Backend Express application
│   ├── services/           # Business logic services
│   ├── middleware/         # Express middleware
│   └── routes.ts           # API route definitions
├── shared/                 # Shared types and schemas
└── package.json            # Dependencies and scripts
```

## Deployment

### On Replit
1. Import this repository to Replit
2. Set environment variables in Secrets
3. Click Run to start the application
4. Use Deployments to publish to production

### Production Considerations
- Set `NODE_ENV=production`
- Configure proper database connection
- Set up SSL certificates
- Enable compression and caching
- Configure rate limiting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Security

- All API endpoints are protected with rate limiting
- Input validation on all user inputs
- SQL injection protection via Drizzle ORM
- XSS protection with proper escaping
- CSRF protection enabled

## Performance

- Automatic code splitting
- Image optimization
- Gzip compression
- Database query optimization
- Caching strategies implemented

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## Acknowledgments

- X.AI for Grok API access
- Replit for hosting platform
- Open source community for libraries used

---

© 2025 Ervin Remus Radosavlevici. All rights reserved.
