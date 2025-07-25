# QRetro - Initial Development Plan

## Project Overview
**QRetro** is a retro-styled QR code generator with a terminal/teletype aesthetic. It allows users to generate QR codes for various data types with a nostalgic, skeuomorphic design reminiscent of old terminals and Minitel systems.

## Core Features
- **Multiple QR Data Types**: Text, URL, WiFi credentials, vCard contacts, SMS, Email, Calendar events, Crypto addresses
- **Retro UI Design**: Terminal-style interface with phosphor green/amber colors, CRT effects, and bitmap fonts
- **Dark/Light Modes**: Toggle between classic terminal dark and paper-white light themes
- **Shareable Links**: Generate permanent URLs for QR codes
- **Download Options**: Save QR codes as PNG or SVG
- **No Authentication**: Free and open for everyone
- **PWA Support**: Installable as an app with offline functionality
- **MIT License**: Open source and freely usable

## Technical Stack
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS with custom retro theme
- **QR Generation**: qrcode.js library
- **Theme Management**: next-themes
- **Fonts**: VT323 or similar monospace bitmap fonts
- **Deployment**: GitHub Pages via GitHub Actions

## Repository Structure
```
QRetro/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main QR generator page
│   ├── qr/[id]/page.tsx   # Shareable QR code page
│   └── layout.tsx         # Root layout with theme provider
├── components/            # React components
│   ├── QRGenerator.tsx    # Main generation logic
│   ├── QRDisplay.tsx      # QR code display and download
│   ├── InputPanel.tsx     # Data type selector and inputs
│   ├── ThemeToggle.tsx    # Dark/light mode switcher
│   └── RetroFrame.tsx     # Skeuomorphic container
├── lib/                   # Utility functions
│   ├── qr-types.ts       # QR data type definitions
│   └── qr-generator.ts   # QR generation logic
├── public/               # Static assets
├── styles/               # Global styles
└── .github/              # GitHub Actions workflows

```

## Development Phases

### Phase 1: Foundation (Current)
1. Create GitHub repository at github.com/slopsauce/QRetro
2. Initialize Next.js project with TypeScript
3. Set up basic project structure
4. Configure linting and formatting

### Phase 2: Core Functionality
1. Implement basic QR code generation for text
2. Create retro-styled UI components
3. Add dark/light theme support
4. Set up routing for shareable links

### Phase 3: Feature Expansion
1. Add multiple QR data types (URL, WiFi, vCard, etc.)
2. Implement download functionality (PNG/SVG)
3. Add copy-to-clipboard feature
4. Create history storage in localStorage

### Phase 4: Polish & Deploy
1. Add CRT effects and animations
2. Implement keyboard shortcuts
3. Set up GitHub Actions for deployment
4. Configure GitHub Pages hosting
5. Add PWA manifest and service worker

### Phase 5: Enhancement
1. Batch QR code generation
2. Custom QR code styling options
3. Print-optimized view
4. Performance optimizations

## Design Guidelines

### Visual Design
- **Colors**: 
  - Dark mode: Black background (#000000), phosphor green (#00ff00), amber highlights (#ffb000)
  - Light mode: Paper white (#f8f8f0), typewriter black (#1a1a1a)
- **Typography**: VT323 or similar bitmap/monospace font
- **Effects**: Subtle CRT scan lines, phosphor glow, cursor blink animations
- **Layout**: Terminal-style frames with ASCII borders

### UX Principles
- Minimize clicks to generate QR codes
- Clear visual feedback for all actions
- Keyboard navigation support
- Fast load times and smooth animations
- Mobile-responsive design

## Deployment Strategy
- Main branch deploys automatically to GitHub Pages
- Custom domain support (if provided)
- Environment variables for production URLs
- Optimized static export with `next export`

## Success Metrics
- Page load time < 2 seconds
- QR generation time < 100ms
- Works offline after first visit
- Accessible on all modern browsers
- Mobile-friendly interface

## Future Considerations
- API endpoint for programmatic QR generation
- Browser extension version
- Electron desktop app
- QR code scanning feature
- Multi-language support

---

*This plan serves as the initial roadmap for QRetro development. It will be updated as the project evolves.*