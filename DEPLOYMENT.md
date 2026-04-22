# Production Deployment Guide - Hostinger

## Overview
This guide provides step-by-step instructions for deploying the Transport Management System to Hostinger with proper security, performance, and multi-device session management.

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Build and Optimization](#build-and-optimization)
4. [Hostinger Setup](#hostinger-setup)
5. [Node.js Server Configuration](#nodejs-server-configuration)
6. [Security Implementation](#security-implementation)
7. [Database and Session Management](#database-and-session-management)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Frontend
- [ ] All components rendering correctly
- [ ] Login/logout working on development
- [ ] Multi-device session persistence tested locally
- [ ] No console errors in development build
- [ ] Environment variables configured in `.env.production`
- [ ] API endpoint URLs verified for production domain

### Backend
- [ ] All API endpoints tested with Postman or curl
- [ ] `sessions.json` and `server-data.json` writable
- [ ] CORS configuration appropriate for production
- [ ] Error handling and logging configured
- [ ] Token expiration logic validated (30 days)
- [ ] Session cleanup running every 10 minutes

### Security
- [ ] SSL certificate obtained (Hostinger provides free)
- [ ] HTTPS enforced in `.htaccess`
- [ ] Security headers configured
- [ ] Input validation implemented on backend
- [ ] Sensitive files protected (`.env`, `node_modules`, etc.)

### Performance
- [ ] Production build size verified (< 500KB gzipped target)
- [ ] Gzip compression enabled in `.htaccess`
- [ ] Static asset caching configured
- [ ] Database files in non-web-accessible directory (if possible)

---

## Environment Configuration

### 1. Create `.env.production` (if not already created)
```bash
VITE_API_URL=https://yourdomain.com/api
NODE_ENV=production
PORT=5000
```

**For Hostinger Subdomains:**
```bash
VITE_API_URL=https://subdomain.yourdomain.com/api
```

### 2. Update `vite.config.ts` for Production
```typescript
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    target: 'ES2015',
    minify: 'terser',
    outDir: 'dist',
    emptyOutDir: true,
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
  },
});
```

### 3. Build Production Bundle
```bash
# Install dependencies (if not already done)
npm install

# Build frontend with production environment
npm run build

# This creates a single index.html file in dist/ directory (vite-plugin-singlefile)
```

---

## Build and Optimization

### Output Structure
After `npm run build`:
```
dist/
  └── index.html         (Single file with embedded CSS/JS)
  └── server.js         (Backend Express server)
```

### Production Build Size
- **Target:** < 500KB gzipped
- **Typical Size:** ~300KB (React 19 + Zustand + Recharts + UI components)
- **Gzip Enabled:** Reduces size by ~60%

### Build Verification
```bash
# Check build size
ls -lh dist/index.html

# Test production build locally
npm start
# Visit http://localhost:5000
```

---

## Hostinger Setup

### Step 1: Upload Files

**Via SFTP (Recommended):**
1. Connect to Hostinger SFTP using credentials from hPanel
2. Navigate to domain root (usually `public_html/` or `subdomain_name/`)
3. Upload the entire project:
   ```
   server.js
   package.json
   .htaccess
   .env.production (rename to .env)
   dist/index.html
   data/server-data.json (create if doesn't exist)
   data/sessions.json (will be created automatically)
   ```

**File Structure on Hostinger:**
```
public_html/  (or subdomain_name/)
├── server.js
├── package.json
├── .htaccess
├── .env (production environment)
├── dist/
│   └── index.html
├── data/
│   ├── server-data.json
│   └── sessions.json
└── node_modules/ (created after npm install)
```

### Step 2: Install Dependencies

Connect via SSH (if available) or use Hostinger terminal:
```bash
cd public_html  # or your domain path

# Install npm dependencies
npm install

# Verify installation
npm list --depth=0
```

**If npm not available, use Hostinger's Node.js app deployment:**
1. Go to hPanel → Auto Installers → Node.js
2. Select your domain
3. Set application root to `public_html`
4. Set start command to `npm start` or `node server.js`

### Step 3: Configure SSL Certificate

1. In Hostinger hPanel → SSL/TLS
2. Install free SSL certificate (usually pre-installed)
3. Force HTTPS (Hostinger does this automatically)

---

## Node.js Server Configuration

### Step 1: Update `server.js` for Production

The current `server.js` is production-ready, but verify these settings:

```javascript
// Production port (Hostinger will set PORT environment variable)
const PORT = process.env.PORT || 5000;

// CORS configuration for your domain
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com'  // Update with your domain
    : 'http://localhost:5000',
  credentials: true,
}));

// Enable compression
app.use(compression());
```

### Step 2: Update `server.js` CORS for Hostinger

If deploying to subdomain, update server.js:
```javascript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://subdomain.yourdomain.com',
  // Add other domains if needed
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));
```

### Step 3: Configure Data Directory

On Hostinger, data files are stored in the same directory as app:
```javascript
// In server.js - Update file paths for production
const DATA_FILE = process.env.NODE_ENV === 'production'
  ? './data/server-data.json'
  : './server-data.json';

const SESSIONS_FILE = process.env.NODE_ENV === 'production'
  ? './data/sessions.json'
  : './sessions.json';
```

**Create data directory on Hostinger:**
```bash
mkdir -p data
chmod 755 data  # Make writable
```

### Step 4: Start the Server

**Option A: Using Hostinger Node.js Auto Installer**
- The server starts automatically after deployment
- Monitor via Hostinger hPanel → Node.js

**Option B: Using SSH**
```bash
ssh user@yourdomain.com
cd public_html
node server.js &  # Run in background
```

**Option C: Using PM2 (if available)**
```bash
npm install -g pm2
pm2 start server.js --name "transport-app"
pm2 save
pm2 startup
```

---

## Security Implementation

### 1. Input Validation

Add to `server.js` for all POST endpoints:
```javascript
// Validate login inputs
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({ error: 'Invalid username format' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password too short' });
  }
  
  // Continue with authentication...
});
```

### 2. Rate Limiting

Add to `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/login', loginLimiter, (req, res) => {
  // Login logic
});
```

Install rate limiter:
```bash
npm install express-rate-limit
```

### 3. HSTS Header

`.htaccess` already includes:
```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

### 4. Secure Cookies (Optional)

If switching to cookies instead of localStorage:
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // HTTPS only
    httpOnly: true,                                  // No JavaScript access
    sameSite: 'strict',                              // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000,               // 30 days
  },
}));
```

---

## Database and Session Management

### 1. File-Based Persistence (Current)

**Advantages:**
- No external database needed
- Easy to backup
- Works on shared hosting

**Limitations:**
- Scales to ~10,000 records
- Not suitable for high concurrency
- Requires local file access

### 2. Backup Strategy

Create backup script `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp data/server-data.json $BACKUP_DIR/server-data_$DATE.json
cp data/sessions.json $BACKUP_DIR/sessions_$DATE.json

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.json" -mtime +30 -delete
```

Run via cron job (contact Hostinger support for scheduling):
```bash
0 2 * * * cd /path/to/app && ./backup.sh  # Daily at 2 AM
```

### 3. Monitor Session Cleanup

The cleanup runs every 10 minutes. Verify in `server.js`:
```javascript
// Cleanup expired sessions every 10 minutes
setInterval(() => {
  cleanupExpiredSessions();
  console.log('[' + new Date().toISOString() + '] Cleanup executed');
}, 10 * 60 * 1000);
```

Check logs:
```bash
# If using PM2
pm2 logs transport-app | grep "Cleanup executed"
```

---

## .htaccess Configuration Explained

The `.htaccess` file handles:

### 1. Security Headers
```apache
# Prevent MIME sniffing attacks
Header always set X-Content-Type-Options "nosniff"

# Prevent clickjacking
Header always set X-Frame-Options "SAMEORIGIN"

# Enable XSS protection
Header always set X-XSS-Protection "1; mode=block"

# HSTS forces HTTPS
Header always set Strict-Transport-Security "max-age=31536000"

# CSP - Controls resource loading
Header always set Content-Security-Policy "default-src 'self'; ..."
```

### 2. Compression
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```
Reduces bandwidth by ~60% for text-based resources.

### 3. Caching Rules
```apache
# HTML: Always check with server (Cache-Control: max-age=0)
ExpiresByType text/html "access plus 0 seconds"

# CSS/JS (versioned by Vite): Cache for 1 year
ExpiresByType application/javascript "access plus 1 year"

# Images: Cache for 1 month
ExpiresByType image/* "access plus 1 month"
```

### 4. SPA Routing
```apache
# Serve index.html for all non-file requests
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```
This enables client-side routing in React Router.

### 5. HTTPS Redirect
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```
Forces all traffic to HTTPS.

### For Hostinger Subdomains

If deploying to `subdomain.yourdomain.com`:

1. **Update Hostinger DNS:**
   - Add CNAME record: `subdomain` → `yourdomain.com`
   - Or use A record with Hostinger IP

2. **Update `.htaccess`:**
   The current `.htaccess` works for both main domain and subdomains. No changes needed.

3. **Update `server.js` CORS:**
   ```javascript
   const origin = process.env.NODE_ENV === 'production'
     ? 'https://subdomain.yourdomain.com'
     : 'http://localhost:5000';
   ```

4. **Update `.env.production`:**
   ```
   VITE_API_URL=https://subdomain.yourdomain.com/api
   ```

---

## Monitoring and Maintenance

### 1. Monitor Error Logs

Check server logs (if available via Hostinger):
```bash
tail -f /var/log/nodejs.log  # Depends on Hostinger setup
```

Or add file logging to `server.js`:
```javascript
const fs = require('fs');
const logStream = fs.createWriteStream('app.log', { flags: 'a' });

app.use((req, res, next) => {
  res.on('finish', () => {
    logStream.write(`${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode}\n`);
  });
  next();
});
```

### 2. Monitor Performance

Add to `server.js`:
```javascript
app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  res.json({
    status: 'ok',
    uptime: `${Math.floor(uptime / 60)} minutes`,
    memory: {
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
    },
  });
});
```

Check health:
```bash
curl https://yourdomain.com/api/health
```

### 3. Regular Backups

**Daily Backups:**
1. Use Hostinger's File Manager → Backups
2. Or set up scheduled backup script

**Monitor file sizes:**
```bash
# Check if database files are growing too large
ls -lh data/server-data.json
ls -lh data/sessions.json

# If > 50MB, archive old entries or migrate to database
```

### 4. Security Updates

- Monthly: Update npm dependencies
  ```bash
  npm update
  npm audit fix
  ```
- Monthly: Check for Node.js security advisories
- Quarterly: Review CORS and security headers

---

## Troubleshooting

### Issue 1: "Cannot GET /path"

**Cause:** SPA routing not working
**Solution:**
1. Verify `.htaccess` is in root directory
2. Check `mod_rewrite` is enabled on Hostinger
3. Verify `RewriteBase` in `.htaccess` (usually not needed on Hostinger)

```apache
# Add if needed:
RewriteBase /
```

### Issue 2: API Calls Return 401

**Cause:** Token expired or CORS issue
**Solution:**
1. Check browser DevTools → Network → API call response
2. Verify `VITE_API_URL` in `.env.production` matches domain
3. Check server.js CORS configuration
4. Verify token in localStorage (DevTools → Application)

### Issue 3: Blank Page on Production

**Cause:** Build not complete or wrong `dist/` directory
**Solution:**
1. Verify `dist/index.html` exists on Hostinger
2. Check file size > 300KB (CSS/JS should be embedded)
3. Check browser console for errors
4. Verify API endpoint in network tab

### Issue 4: Sessions Lost After Server Restart

**Cause:** Sessions not persisting
**Solution:**
1. Verify `data/sessions.json` exists and is writable
2. Check server.js file paths are correct for production
3. Verify `loadSessions()` function is called on startup

```javascript
// In server.js, add logging:
console.log('Loading sessions...');
const sessions = loadSessions();
console.log(`Loaded ${Object.keys(sessions).length} sessions`);
```

### Issue 5: CORS Errors

**Error:** `Access to XMLHttpRequest at 'https://yourdomain.com/api/login' from origin 'https://yourdomain.com' has been blocked by CORS policy`

**Solution:**
1. Update `server.js` CORS to match your domain:
   ```javascript
   app.use(cors({
     origin: 'https://yourdomain.com',  // Exact match
     credentials: true,
   }));
   ```
2. Rebuild frontend and redeploy:
   ```bash
   npm run build
   ```

### Issue 6: High Memory Usage

**Cause:** Sessions not cleaning up
**Solution:**
1. Verify cleanup interval runs (check console every 10 minutes)
2. Manually clean old sessions:
   ```javascript
   // Add temporary route to server.js
   app.get('/api/cleanup-sessions', (req, res) => {
     cleanupExpiredSessions();
     res.json({ message: 'Cleanup completed' });
   });
   ```
3. Call: `curl https://yourdomain.com/api/cleanup-sessions`

### Issue 7: Cannot Write to Data Files

**Cause:** Permission denied on data directory
**Solution:**
1. Via SSH, set proper permissions:
   ```bash
   chmod 755 data
   chmod 644 data/server-data.json
   chmod 644 data/sessions.json
   ```
2. Or contact Hostinger support for permission help

---

## Multi-Device Session Testing

### Test 1: Login on Device A, Access on Device B

1. **Device A (Browser 1):**
   - Visit `https://yourdomain.com`
   - Login with credentials
   - Note the token in DevTools → Application → localStorage

2. **Device B (Browser 2 or Incognito):**
   - Visit `https://yourdomain.com`
   - You should need to login (fresh session)
   - Add new booking/client
   - Token should be different

3. **Verify Sync:**
   - Go back to Device A
   - Refresh page → New data should appear
   - Verify without re-login (token still valid)

### Test 2: Token Expiration (30 days)

```javascript
// Temporarily set expiration to 1 minute for testing:
const expiresAt = Date.now() + 60 * 1000;  // 1 minute

// After 1 minute, token should expire
// API calls should return 401
// Frontend should redirect to login
```

### Test 3: Session Cleanup

1. Login multiple times and note token count
2. Wait for cleanup interval (10 minutes)
3. Check `data/sessions.json` size should remain stable

---

## Performance Optimization Checklist

- [x] Gzip compression enabled in `.htaccess`
- [x] Static asset caching configured (1 year for versioned files)
- [x] HTML cache set to 0 (always fresh)
- [x] Production build creates single `index.html` file
- [x] Build size < 500KB gzipped
- [ ] CDN for images (optional, if needed)
- [ ] Database query optimization (if expanding beyond 10K records)
- [ ] Implement lazy loading for routes (optional)

---

## Next Steps

1. **Test locally:**
   ```bash
   npm run build
   npm start
   ```
   Visit `http://localhost:5000`

2. **Upload to Hostinger:**
   Use SFTP to upload all files

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start server:**
   Via Hostinger hPanel or SSH

5. **Test production:**
   - Visit `https://yourdomain.com`
   - Test login/logout
   - Add data and verify multi-device sync
   - Check DevTools for errors

6. **Monitor:**
   - Check health endpoint daily
   - Review backups weekly
   - Monitor file sizes monthly

---

## Support and Resources

- **Hostinger Support:** https://support.hostinger.com
- **Node.js Docs:** https://nodejs.org/docs
- **Express.js Docs:** https://expressjs.com
- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev

---

**Last Updated:** $(date)
**Version:** 1.0 - Production Ready
