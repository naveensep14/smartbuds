# SmartBuds - Educational Testing Platform

An intelligent educational testing platform built with Next.js, React, and Supabase, designed to help students practice and excel in their coursework.

## 🎯 Features

- **Adaptive Testing** - Smart question generation based on curriculum standards
- **Multiple Boards** - Support for ICSE, CBSE, IGCSE, IB, and US curricula
- **Test Types** - Coursework tests and weekly timed assessments
- **Progress Tracking** - Resume tests from where you left off
- **Real-time Results** - Instant feedback and detailed explanations
- **Question Reports** - Report issues with questions for quality improvement
- **Mobile Responsive** - Full mobile experience with dedicated navigation
- **User Profiles** - Complete profile management including account deletion

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 📁 Project Structure

```
SmartBuds/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── tests/             # Test pages
│   ├── my-results/        # Results page
│   ├── profile/           # User profile/settings
│   └── ...
├── components/            # React components
├── lib/                   # Utility libraries
├── scripts/              # Organized scripts
│   ├── sql/              # Database migrations (19 files)
│   ├── python/           # Python utilities (24 files)
│   └── javascript/       # Node.js scripts (46 files)
├── docs/                 # Documentation (18 files)
├── backups/              # Database backups
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 📚 Documentation

All documentation is located in the `/docs` folder:

### Setup & Deployment
- **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Production deployment guide
- **[setup-instructions.md](docs/setup-instructions.md)** - Initial setup instructions
- **[FREE_AI_SETUP.md](docs/FREE_AI_SETUP.md)** - Free AI model setup

### Features
- **[TEST_PROGRESS_FEATURE.md](docs/TEST_PROGRESS_FEATURE.md)** - Test progress & resume functionality
- **[REPORT_FEATURE_FIX.md](docs/REPORT_FEATURE_FIX.md)** - Question reporting system
- **[DELETE_ACCOUNT_SETUP.md](docs/DELETE_ACCOUNT_SETUP.md)** - Account deletion feature
- **[mobile-features-demo.md](docs/mobile-features-demo.md)** - Mobile experience features

### Database & Migrations
- **[MIGRATION_USER_ID.md](docs/MIGRATION_USER_ID.md)** - User ID foreign key migration
- **[SECURITY_REMEDIATION.md](docs/SECURITY_REMEDIATION.md)** - Security improvements
- **[VERCEL_DEPLOYMENT_FIX.md](docs/VERCEL_DEPLOYMENT_FIX.md)** - Deployment fixes

### Development
- **[AI_TEST_GENERATION_PROMPT.md](docs/AI_TEST_GENERATION_PROMPT.md)** - AI test generation guide
- **[HELP_EMAIL_SETUP.md](docs/HELP_EMAIL_SETUP.md)** - Help email system setup
- **[test-features.md](docs/test-features.md)** - Feature testing guide
- **[test-results.md](docs/test-results.md)** - Results system documentation

See [docs/README.md](docs/README.md) for the complete documentation index.

## 🔧 Scripts

All scripts are organized in the `/scripts` folder:

- **SQL Scripts** (`scripts/sql/`) - Database migrations and setup
- **Python Scripts** (`scripts/python/`) - Test generation and PDF processing
- **JavaScript Scripts** (`scripts/javascript/`) - Database operations and utilities

See [scripts/README.md](scripts/README.md) for detailed script documentation.

## 🗄️ Database

The application uses Supabase (PostgreSQL) with the following main tables:

- **`tests`** - Test definitions and questions
- **`results`** - User test results and scores
- **`profiles`** - User profiles and preferences
- **`test_progress`** - Test progress tracking
- **`question_reports`** - User-reported question issues

### Running Migrations

```bash
# Backup database first
node backup-database.js

# Run SQL migration in Supabase SQL Editor
# Copy from scripts/sql/[migration-name].sql
```

## 🔐 Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📦 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React, Tailwind CSS, Framer Motion
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel (recommended)
- **Language:** TypeScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Your License Here]

## 🆘 Support

For issues or questions:
- Check the [docs/](docs/) folder for detailed documentation
- Review [test-features.md](docs/test-features.md) for feature testing
- See [HELP_EMAIL_SETUP.md](docs/HELP_EMAIL_SETUP.md) for support contact setup

## 📈 Recent Updates

- ✅ Mobile navigation menu with full feature access
- ✅ Account deletion feature with complete data cleanup
- ✅ User ID foreign key migration for proper relational integrity
- ✅ Test progress tracking with resume functionality
- ✅ Question reporting system for quality assurance
- ✅ Organized project structure (scripts & docs folders)

---

**Built with ❤️ for students everywhere**

