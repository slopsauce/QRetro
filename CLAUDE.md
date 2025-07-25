# QRetro - Development Notes

## Project Overview
QRetro is a retro-styled QR code generator with an authentic terminal/CRT aesthetic. Built with Next.js 14+ and TypeScript.

**Live URL**: https://slopsauce.github.io/QRetro

**Note**: `slopsauce` is a GitHub organization, not a user. It's valid in URLs and repository paths, but cannot be used as a reviewer/assignee in GitHub workflows.

## Recent Changes

### UI Improvements
- **Frame Simplification**: Removed ASCII border titles and simplified RetroFrame to clean borders
- **Cursor Position**: Moved blinking cursor to appear after "QRETRO" text instead of separate line
- **Layout Optimization**: Changed from 3-column to 2-column layout for cleaner interface
- **Icon Consistency**: Removed emojis and squares, using only ASCII characters for type selection

### CRT Effects
- **QR Code Styling**: Added minimal CRT effects to QR codes
  - Horizontal scanlines overlay only
  - Subtle phosphor glow background
  - Removed rotation and complex animations for clean aesthetic

### Performance Optimizations
- **Theme Switching**: Optimized QR regeneration for faster theme transitions
  - Separated theme changes from data changes
  - Immediate regeneration for theme (no debounce)
  - 500ms debounce for data input changes
- **Font Loading**: Fixed CSS conflicts and Tailwind overrides for proper custom font rendering

### Typography & Fonts
- **Dual Font System**: Implemented theme-specific authentic fonts
  - **Dark Mode**: PixelOperatorMonoHB (authentic terminal font) at 16px
  - **Light Mode**: TT2020Base-Regular (typewriter font) at 16px
- **Font Management**: Custom @font-face declarations with proper fallbacks
- **CSS Cleanup**: Removed conflicting body selectors and Tailwind font overrides

### Performance & Reliability Improvements
- **Input Debouncing**: Added proper useDebounce hook (500ms) to prevent excessive QR generation
- **Error Boundary**: React error boundary component for graceful crash handling with retro styling
- **Optimization Focus**: Removed unnecessary React.memo - kept only essential improvements

## Build Commands
```bash
# Development
npm run dev

# Production build  
npm run build

# Linting
npm run lint
```

## CI/CD Pipeline
- **GitHub Actions**: Runs on every PR and push to main
  - Install dependencies (`npm ci`)
  - Run linting (`npm run lint`)
  - Build application (`npm run build`)
- **Dependabot**: Weekly dependency updates (Mondays 9 AM)
  - Auto-merge patch/minor updates if CI passes
  - Manual review required for major version changes

## Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom retro theme
- **Fonts**: Custom TTF/WOFF2 fonts (PixelOperatorMonoHB, TT2020Base)
- **QR Generation**: qrcode.js library
- **CI/CD**: GitHub Actions + Dependabot for automated maintenance
- **Deployment**: GitHub Pages with automated CI/CD
- **PWA**: Manifest support for installable app

## File Structure
- `app/` - Next.js app router pages
- `components/` - React components (QRGenerator, RetroFrame, ErrorBoundary, etc.)
- `hooks/` - Custom React hooks (useDebounce)
- `lib/` - Utilities (QR generation, data types)
- `public/` - Static assets

## Key Components
- **QRGenerator**: Main component with form inputs and QR display
- **RetroFrame**: ASCII border wrapper component  
- **ThemeToggle**: Dark/light mode switcher
- **ErrorBoundary**: Graceful error handling with retro crash screen
- **ShareQRDisplay**: QR code display for share URLs
- **useDebounce**: Custom hook for input debouncing (500ms delay)

## Development Notes
- Static site generation compatible with GitHub Pages
- All client-side interactions (no server required)
- Responsive design with mobile support
- Accessible with proper ARIA labels

### Font Troubleshooting
- Custom fonts stored in `public/fonts/` directory
- **Use `next/font/local` instead of CSS @font-face** for static exports
- Fonts must be imported in layout.tsx to be included in build
- CSS @font-face declarations don't work with `output: 'export'`
- Use CSS variables (--font-pixel, --font-typewriter) for theme-specific fonts
- Ensure no `font-mono` class conflicts in layout.tsx
- CSS body selectors must not duplicate (use theme-specific selectors)

### Performance Notes
- WOFF2 format preferred for modern browsers (smaller file size)
- TTF format as fallback for broader compatibility
- Font display: swap for better loading experience

## Development Checklist

### CSS/Font Changes
- ✅ Use `next/font/local` for custom fonts (not CSS @font-face)
- ✅ Import fonts in layout.tsx to include in static export build
- ✅ Check for CSS selector conflicts (avoid multiple body rules)
- ✅ Remember basePath `/QRetro/` affects all asset URLs in production
- ✅ Test both light/dark themes after changes

### Feature/Config Additions
- ✅ Update README.md and CLAUDE.md immediately when adding features
- ✅ Update tech stack section for new dependencies/tools
- ✅ Consider production vs development environment differences

### Pre-Commit Validation
- ✅ Run `npm run build` to catch build issues
- ✅ Check browser console for errors (especially 404s)
- ✅ Verify font loading works properly
- ✅ Test both light/dark theme functionality
- ✅ Test input debouncing works (QR only generates after 500ms of no typing)

### GitHub Pages Gotchas
- ✅ All asset paths must be relative or account for basePath
- ✅ Static exports behave differently than dev server
- ✅ Font loading commonly breaks due to path issues
- ✅ Build output goes to `out/` directory for deployment

## Git & Workflow Reminders
- Always check if you need to update the markdown files when committing