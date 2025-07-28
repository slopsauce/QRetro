# QRetro - Development Notes

## Project Overview
QRetro is a retro-styled QR code generator with an authentic terminal/CRT aesthetic. Built with Next.js 15+ and TypeScript.

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

### Share Functionality & Privacy Improvements
- **Privacy-First Share URLs**: Uses URL fragments (#) instead of query parameters (?)
  - Data never sent to server - stays completely client-side
  - Share URLs like `/share#type=text&data=example` instead of `/share?type=text&data=example`
  - Protects sensitive data (WiFi passwords, contact info, crypto addresses)
- **Share Page Security**: Enhanced share page with privacy and security messaging
  - Clear privacy notice: "No tracking - your data stays private"
  - Security warning: "Only scan QR codes from people you trust"
  - Removed raw data display to prevent accidental exposure
- **Toast Notifications**: Replaced ugly alert() with retro-styled toast component
  - Appears above share button with authentic terminal styling
  - Auto-dismisses after 3 seconds with smooth animations
  - Green accent color with checkmark for consistent theme
- **Clipboard Fallback**: Improved clipboard copying with multiple fallback strategies
  - Modern clipboard API for secure contexts
  - Document.execCommand fallback for older browsers
  - Console logging fallback when all copying methods fail
  - Removed ugly prompt() dialogs completely

### Visual Polish
- **Glow Effect Optimization**: Refined QRETRO title glow in dark mode
  - Reduced luminosity from `currentColor` to `rgba(0, 255, 0, 0.3/0.1)`
  - Increased spread radius for softer, more authentic CRT appearance
  - Better balance between visibility and subtlety

### Offline PWA Support Implementation
- **Service Worker**: Comprehensive caching with cache-first strategy for static assets
  - `/public/sw.js` - Complete offline functionality with cache management
  - **Automated Cache Versioning**: Build-time injection of git hash + timestamp for unique cache versions
  - Cache cleanup and size management for optimal performance
  - Background sync capabilities for future enhancements
- **Service Worker Registration**: Auto-registration in production with update notifications
  - `components/service-worker-register.tsx` - Handles SW lifecycle and user notifications
  - Update prompts and offline capability notifications
- **Offline Indicator**: Real-time connection status with retro styling
  - `components/offline-indicator.tsx` - Shows online/offline state
  - Graceful degradation messaging for network-dependent features
- **Enhanced User Experience**: Offline-aware functionality
  - Share functionality detects offline state and provides appropriate feedback
  - QR codes cached via service worker for offline access
  - Footer messaging highlights offline capabilities

## Build Commands
```bash
# Development
npm run dev

# Production build (includes service worker version injection)
npm run build

# Start production server
npm start

# Linting
npm run lint

# Test production build locally with proper routing
npm run serve:local

# One-command production testing (build + serve)  
npm run test:pwa
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
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom retro theme
- **Fonts**: Custom TTF/WOFF2 fonts (PixelOperatorMonoHB, TT2020Base)
- **QR Generation**: qrcode.js library
- **CI/CD**: GitHub Actions + Dependabot for automated maintenance
- **Deployment**: GitHub Pages with automated CI/CD
- **PWA**: Full Progressive Web App with offline support and service worker
- **Offline Support**: Complete functionality without internet connection

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
- **HistoryPanel**: Privacy-first local history with collapsible interface
- **SharePageClient**: Privacy-enhanced share page with security messaging
- **Toast**: Retro-styled notification component for user feedback
- **useToast**: Custom hook for toast notifications (3s auto-dismiss)
- **useHistory**: Custom hook for local history management
- **useDebounce**: Custom hook for input debouncing (500ms delay)

## Privacy & Security Features

### Privacy-First Design
- **Local-Only Data Storage**: All QR history stored in browser localStorage, never transmitted to servers
- **Fragment-Based Sharing**: Share URLs use fragments (#) instead of query parameters (?) to keep data client-side
- **No Server Logging**: Sensitive data (WiFi passwords, contact info, crypto addresses) never appears in server logs
- **Cross-Tab Sync**: History synchronization happens locally via storage events, not through external services
- **Export Control**: Users can export their data as JSON files under their complete control

### Security Education
- **QR Code Safety**: Clear warnings about only scanning QR codes from trusted sources
- **Privacy Messaging**: Prominent UI notices explaining local-only data storage
- **No Raw Data Display**: Share pages don't expose sensitive data in plain text

## Offline PWA Support

### Service Worker Architecture
- **Cache-First Strategy**: Static assets (fonts, icons, CSS, JS) served from cache for instant loading
- **Network-First Strategy**: App navigation attempts network first, falls back to cache
- **Dynamic Caching**: Generated QR codes and user data cached for offline access
- **Cache Management**: Automatic cleanup of old cache versions and size management

### Offline Functionality
- **Core Features**: Complete QR generation, history management, and downloads work offline
- **Graceful Degradation**: Share functionality provides appropriate offline messaging
- **Connection Detection**: Real-time online/offline status with user notifications
- **Background Sync**: Future-ready for syncing when connection restored

### PWA Compliance
- **Service Worker**: Comprehensive caching and offline support
- **Web App Manifest**: Enhanced with offline-specific properties
- **Responsive Design**: Works across all device sizes and orientations
- **Install Prompts**: Native installation experience on supported platforms

## Code Quality & Performance

### Recent Optimizations
- **Dead Code Removal**: Eliminated unused `qr-options.tsx` component (89 lines)
- **DOM Optimization**: Removed unnecessary `select-wrapper` div elements
- **CSS Cleanup**: Streamlined stylesheets, removed redundant formatting
- **Bundle Analysis**: Zero unused CSS, minimal unused JavaScript
- **Build Verification**: All changes maintain functionality while reducing bundle size


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
- **IMPORTANT**: Font paths in `next/font/local` are relative to the file location
  - From `app/layout.tsx`, use `../public/fonts/filename.ttf` 
  - Do NOT use `./fonts/` as this looks for fonts in the app directory
  - The original paths `../public/fonts/` are correct and should not be "simplified"

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

## Claude Workflow Rules
- **Always ask for user confirmation before git push operations**
- Never push to GitHub without explicit approval

## Git & Workflow Reminders
- Always check if you need to update the markdown files when committing