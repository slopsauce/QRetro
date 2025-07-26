# QRetro - Future Ideas

## IPFS-Based Secure Sharing System

### Overview
Implement unforgeable share URLs using IPFS for public key storage while keeping QR data local-only.

### Implementation Steps

#### 1. IPFS Integration Layer (`lib/ipfs.ts`)
- Add Pinata API integration functions
- Implement public key upload/retrieval
- Add multiple IPFS gateway fallbacks for reliability
- Handle API errors gracefully

#### 2. Cryptographic Utilities (`lib/crypto.ts`) 
- Key generation (ECDSA P-256 keypairs)
- Digital signing/verification functions
- Content hashing utilities
- Base64 encoding/decoding helpers

#### 3. Secure Sharing Hook (`hooks/use-secure-sharing.ts`)
- Manage user keypair lifecycle
- Handle secure share URL generation
- Implement share URL verification
- Store keypair in IndexedDB (encrypted)

#### 4. UI Components
- **Settings panel**: Enable/disable secure sharing
- **Share modal**: Show both regular and secure share options  
- **Verification indicator**: Show authenticity status when viewing shared URLs
- **Key management**: View/regenerate keypairs

#### 5. Environment Configuration
- Add Pinata API key to GitHub Actions
- Inject as build-time environment variable
- Add fallback mode for development

#### 6. URL Handling Updates
- Extend share URL parsing for secure format
- Add verification step in share route
- Display authenticity badges/warnings

### Technical Details
- **Storage**: Public keys on IPFS via Pinata (free tier)
- **Security**: ECDSA digital signatures (unforgeable)
- **Privacy**: QR data never leaves device (fragment URLs)
- **Reliability**: Multiple IPFS gateways for global access
- **Cost**: Free (Pinata free tier sufficient)

### Files to Create/Modify
- `lib/ipfs.ts` (new)
- `lib/crypto.ts` (new) 
- `hooks/use-secure-sharing.ts` (new)
- `components/secure-share-settings.tsx` (new)
- `app/share/page.tsx` (modify)
- `components/qr-generator.tsx` (modify)
- `.github/workflows/deploy.yml` (add Pinata API key)

This maintains the current static deployment while adding cryptographically secure sharing capabilities.