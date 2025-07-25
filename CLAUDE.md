# QRetro - Development Notes

## Project Overview
QRetro is a retro-styled QR code generator with an authentic terminal/CRT aesthetic. Built with Next.js 14+ and TypeScript.

**Live URL**: https://slopsauce.github.io/QRetro

## Recent Changes

### UI Improvements
- **ASCII Borders**: Simplified RetroFrame component with clean double-line box drawing characters (╔═══╗, ║, ╚═══╝)
- **Cursor Position**: Moved blinking cursor to appear after "QRETRO" text instead of separate line
- **Layout Optimization**: Changed from 3-column to 2-column layout for cleaner interface
- **Error Correction**: Moved QR options to INPUT DATA section, removed separate QR OPTIONS panel

### CRT Effects
- **QR Code Styling**: Added subtle CRT effects to QR codes
  - Horizontal scanlines overlay
  - Subtle phosphor glow background
  - Clean static effects (removed complex animations for performance)

### Performance Optimizations
- **Theme Switching**: Optimized QR regeneration for faster theme transitions
  - Separated theme changes from data changes
  - Immediate regeneration for theme (no debounce)
  - 500ms debounce for data input changes

### Typography
- **Font**: Changed from VT323 to Source Code Pro for better teletype authenticity
- **Sizing**: Reduced font size to 16px with improved letter spacing

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