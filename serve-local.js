#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_PATH = '/QRetro';

// Check if build directory exists
const buildDir = path.join(__dirname, 'out');
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory "out" not found!');
  console.error('   Please run "npm run build" first.');
  process.exit(1);
}

// Serve static files under the base path
app.use(BASE_PATH, express.static(buildDir, {
  // Allow serving .html files without extension
  extensions: ['html'],
  // Set proper MIME types
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.woff2')) {
      res.setHeader('Content-Type', 'font/woff2');
    }
  }
}));

// Redirect root to base path
app.get('/', (req, res) => {
  res.redirect(BASE_PATH + '/');
});

// Handle all routes - must be last
app.use((req, res) => {
  // Only handle routes under base path
  if (req.path.startsWith(BASE_PATH)) {
    // Check if requesting a file (has extension)
    const hasExtension = path.extname(req.path);
    
    if (!hasExtension) {
      // For routes without extensions, serve index.html
      res.sendFile(path.join(buildDir, 'index.html'));
    } else {
      // For files that don't exist, return 404
      res.status(404).send('Not found');
    }
  } else {
    // Not under base path, redirect to base
    res.redirect(BASE_PATH + '/');
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Local production server running!');
  console.log(`   Visit: http://localhost:${PORT}${BASE_PATH}/`);
  console.log('');
  console.log('📝 Notes:');
  console.log('   - This mimics GitHub Pages behavior');
  console.log('   - Service Worker will register and work');
  console.log('   - All features including PWA installation available');
  console.log('   - Press Ctrl+C to stop');
});