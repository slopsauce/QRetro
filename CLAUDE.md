# QRetro - Development Notes

## Project Overview
QRetro is a retro-styled QR code generator with an authentic terminal/CRT aesthetic. Built with Next.js 14+ and TypeScript.

**Live URL**: https://slopsauce.github.io/QRetro

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

## Build Commands
```bash
# Development
npm run dev

# Production build  
npm run build

# Linting
npm run lint
```

## Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom retro theme
- **Fonts**: Custom TTF/WOFF2 fonts (PixelOperatorMonoHB, TT2020Base)
- **QR Generation**: qrcode.js library
- **Deployment**: GitHub Pages with automated CI/CD
- **PWA**: Manifest support for installable app

## File Structure
- `app/` - Next.js app router pages
- `components/` - React components (QRGenerator, RetroFrame, etc.)
- `lib/` - Utilities (QR generation, data types)
- `public/` - Static assets

## Key Components
- **QRGenerator**: Main component with form inputs and QR display
- **RetroFrame**: ASCII border wrapper component
- **ThemeToggle**: Dark/light mode switcher
- **ShareQRDisplay**: QR code display for share URLs

## Development Notes
- Static site generation compatible with GitHub Pages
- All client-side interactions (no server required)
- Responsive design with mobile support
- Accessible with proper ARIA labels

### Font Troubleshooting
- Custom fonts stored in `public/fonts/` directory
- Ensure no `font-mono` class conflicts in layout.tsx
- CSS body selectors must not duplicate (use theme-specific selectors)
- Font loading uses CSS @font-face with fallbacks to system monospace fonts

### Performance Notes
- WOFF2 format preferred for modern browsers (smaller file size)
- TTF format as fallback for broader compatibility
- Font display: swap for better loading experience