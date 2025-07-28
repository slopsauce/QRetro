#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function generateBuildVersion() {
  try {
    // Try to get git commit hash
    const gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(36);
    return `${gitHash}-${timestamp}`;
  } catch (error) {
    // Fallback to timestamp if git is not available
    console.warn('Git not available, using timestamp for build version');
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(36);
    return `build-${timestamp}`;
  }
}

function injectBuildVersion() {
  const buildVersion = generateBuildVersion();
  const swPath = path.join(process.cwd(), 'out', 'sw.js');
  
  // Check if the built service worker exists
  if (!fs.existsSync(swPath)) {
    console.error('Service worker not found at:', swPath);
    process.exit(1);
  }
  
  // Read the service worker file
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // Replace the placeholder with actual build version
  const updatedContent = swContent.replace('__BUILD_VERSION__', buildVersion);
  
  // Write back the updated content
  fs.writeFileSync(swPath, updatedContent);
  
  console.log(`✅ Injected build version: ${buildVersion} into service worker`);
  console.log(`📁 Service worker updated: ${swPath}`);
}

// Run the injection
injectBuildVersion();