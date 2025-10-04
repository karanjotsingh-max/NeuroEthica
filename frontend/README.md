# NeuroEthica - NASA Bioscience Research Platform

A Next.js-based research platform featuring AI-powered tools for NASA bioscience research, including an LLM chatbot trained on NASA publications, neural data classification GUI, and comprehensive research resources.


## Prerequisites

Before installation, ensure you have:
- **Node.js** 18.17 or later
- **npm** 9.0 or later (or yarn/pnpm)
- **Git** for cloning the repository

## Installation

### Step 1: Clone the Repository
\`\`\`bash
git clone <your-repo-url>
cd neuroethica-frontend
\`\`\`

### Step 2: Install Dependencies
\`\`\`bash
npm install
\`\`\`

The project includes an `.npmrc` file configured with `legacy-peer-deps=true` to automatically resolve React 19 peer dependency conflicts with UI libraries.

## Running the Project

### Development Server

Start the Next.js development server with hot-reload:

\`\`\`bash
npm run dev
\`\`\`

Access the application at **http://localhost:3000**

Available pages:
- `/` - Landing page
- `/chatbot` - AI Chatbot interface
- `/classifier` - Neural Data Classifier
- `/about` - About Us
- `/research` - Research publications
- `/donate` - Donation page
- `/contact` - Contact form with BCI-abuse hotline

### Production Build

Create an optimized production build:

\`\`\`bash
npm run build
\`\`\`

Start the production server:

\`\`\`bash
npm start
\`\`\`

The production server runs on **http://localhost:3000** by default.

### Code Linting

Check code quality with ESLint:

\`\`\`bash
npm run lint
\`\`\`

## Troubleshooting

### React 19 Peer Dependency Conflicts

**Issue**: `ERESOLVE unable to resolve dependency tree` errors during `npm install`

**Root Cause**: Some UI libraries (vaul, @radix-ui packages) have not updated their peer dependency declarations to officially support React 19.

**Solution 1: Automatic (Recommended)**
The included `.npmrc` file handles this automatically:
\`\`\`bash
npm install
\`\`\`

**Solution 2: Manual Flag**
If `.npmrc` is missing or you prefer explicit control:
\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

**Solution 3: Clean Reinstall**
For persistent issues, perform a clean installation:
\`\`\`bash
# Windows
rmdir /s /q node_modules
del package-lock.json
npm install

# macOS/Linux
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Port 3000 Already in Use

**Issue**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**: Run on a different port:
\`\`\`bash
npm run dev -- -p 3001
\`\`\`

### Next.js Build Cache Issues

**Issue**: Stale build artifacts causing unexpected behavior

**Solution**: Clear the Next.js cache:
\`\`\`bash
# Windows
rmdir /s /q .next
npm run build

# macOS/Linux
rm -rf .next
npm run build
\`\`\`

### TypeScript Errors

**Issue**: Type checking failures during build

**Solution**: Ensure TypeScript version matches package.json (5.9.3):
\`\`\`bash
npm install typescript@5.9.3 --save-dev
\`\`\`

<!-- ## Project Structure

\`\`\`
neuroethica-frontend/
├── app/                          # Next.js 15 App Router (file-based routing)
│   ├── page.tsx                 # Landing page (/)
│   ├── layout.tsx               # Root layout with sidebar navigation
│   ├── globals.css              # Tailwind CSS v4 config & design tokens
│   ├── chatbot/
│   │   └── page.tsx            # AI Chatbot page (/chatbot)
│   ├── classifier/
│   │   └── page.tsx            # Neural Data Classifier (/classifier)
│   ├── about/
│   │   └── page.tsx            # About Us page (/about)
│   ├── research/
│   │   ├── page.tsx            # Research hub (/research)
│   │   └── loading.tsx         # Loading state
│   ├── donate/
│   │   └── page.tsx            # Donation page (/donate)
│   └── contact/
│       └── page.tsx            # Contact & hotline (/contact)
├── components/
│   ├── sidebar.tsx              # Main navigation sidebar component
│   └── ui/                      # shadcn/ui components (button, card, etc.)
├── lib/
│   └── utils.ts                 # Utility functions (cn for classnames)
├── public/                       # Static assets (images, fonts)
├── .npmrc                        # npm configuration (legacy-peer-deps)
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
\`\`\` -->

## Technology Stack

### Core Framework
- **Next.js** 15.1.6 - React framework with App Router, Server Components, and file-based routing
- **React** 19.1.0 - UI library with latest concurrent features
- **TypeScript** 5.9.3 - Type-safe JavaScript

### Styling & UI
- **Tailwind CSS** 4.1.9 - Utility-first CSS framework
- **shadcn/ui** - Accessible component library built on Radix UI primitives
- **Radix UI** - Unstyled, accessible UI components
- **Lucide React** 0.468.0 - Icon library with 1000+ icons
- **Framer Motion** 12.0.0 - Animation library

### Data Visualization
- **Recharts** 2.15.0 - Composable charting library for React

### Development Tools
- **ESLint** 9 - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

<!-- ## Key Features Explained

### Sidebar Navigation
- **Design**: Inspired by OpenAI's navigation pattern
- **Behavior**: Collapsible on desktop, drawer on mobile
- **Implementation**: Uses Framer Motion for smooth animations
- **State**: Persists open/closed state in component state

### AI Chatbot (`/chatbot`)
- **Purpose**: Query NASA bioscience research papers using natural language
- **UI**: Chat interface with message history and streaming responses
- **Backend**: Requires LLM API integration (placeholder UI provided)

### Neural Data Classifier (`/classifier`)
- **Purpose**: Upload neural datasets for classification and visualization
- **Features**: File upload, real-time classification, interactive charts
- **Visualization**: Uses Recharts for data plotting
- **Data Format**: Accepts CSV/JSON neural data files

### Research Hub (`/research`)
- **Purpose**: Browse NASA bioscience publications
- **Features**: Search, filter by category, publication cards
- **Data**: Static placeholder data (integrate with NASA API)

### Donation System (`/donate`)
- **Tiers**: 
  - Supporter: $25/month
  - Contributor: $100/month
  - Partner: $500/month
- **Integration**: Requires payment processor (Stripe recommended)

### BCI-Abuse Hotline (`/contact`)
- **Purpose**: Emergency contact for brain-computer interface abuse cases
- **Features**: Priority contact form, emergency hotline number
- **Routing**: Form submissions require backend integration -->

## Environment Variables

Create a `.env.local` file in the project root for environment-specific configuration:

\`\`\`env


## Deployment

### Vercel (Recommended)

Next.js is built by Vercel and deploys seamlessly:

1. **Push to GitHub**: Commit and push your code
2. **Import to Vercel**: Go to [vercel.com/new](https://vercel.com/new)
3. **Configure**: Vercel auto-detects Next.js settings
4. **Add Environment Variables**: Set production env vars in Vercel dashboard
5. **Deploy**: Automatic deployment on every push

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Build Settings** (auto-configured):
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`


## Development Workflow

### Adding New Pages

1. Create a new folder in `app/` directory
2. Add `page.tsx` file for the route
3. Update `components/sidebar.tsx` navigation links

Example:
\`\`\`tsx
// app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page Content</div>
}
\`\`\`

### Adding UI Components

Use shadcn/ui CLI to add components:
\`\`\`bash
npx shadcn@latest add button
npx shadcn@latest add dialog
\`\`\`

### Styling Guidelines

- Use Tailwind utility classes
- Follow design tokens in `app/globals.css`
- Maintain consistent spacing (gap-4, p-6, etc.)
- Use semantic color classes (bg-background, text-foreground)

## Contributing

### Contribution Guidelines

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Follow code style**: Run `npm run lint` before committing
4. **Write descriptive commits**: Use conventional commit format
5. **Test thoroughly**: Ensure all pages render correctly
6. **Push changes**: `git push origin feature/your-feature-name`
7. **Open Pull Request**: Provide detailed description of changes

### Code Style

- Use TypeScript for all new files
- Follow ESLint rules (`npm run lint`)
- Use functional components with hooks
- Prefer server components (default in App Router)
- Add "use client" directive only when necessary

## License

This project is licensed under the **MIT License** - see LICENSE file for details.

## Support & Contact

### For Technical Issues
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Refer to this README and inline code comments

### For Research Inquiries
- **Email**: research@neuroethica.org
- **Website**: Contact form at `/contact`

### For Emergencies
- **BCI-Abuse Hotline**: Available 24/7 at `/contact`
- **Emergency Number**: 1-800-BCI-HELP

## Acknowledgments

- **NASA Bioscience Research Division** - Research data and domain expertise
- **OpenAI** - Navigation design inspiration
- **Vercel** - Next.js framework and hosting platform
- **shadcn** - UI component library
- **Radix UI** - Accessible component primitives

## Roadmap

### Planned Features
- [ ] Real-time LLM integration for chatbot
- [ ] NASA API integration for research publications
- [ ] Stripe payment processing for donations
- [ ] User authentication and profiles
- [ ] Advanced neural data visualization (3D plots)
- [ ] Export functionality for classifier results
- [ ] Multi-language support

---

**Built for advancing NASA bioscience research**

**Version**: 1.0.0  
**Last Updated**: 2025  
**Maintained by**: NeuroEthica Team
