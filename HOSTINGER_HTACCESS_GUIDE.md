# Hostinger Deployment Guide - Complete

## Hostinger Configuration Overview

Your Transport Management System is configured for optimal performance on Hostinger shared hosting with the following setup:

```
Frontend (React/Vite) ← runs in browser
    ↓
.htaccess (URL rewriting, security headers)
    ↓
Express Backend (Node.js) ← processes API requests
    ↓
File Storage (sessions.json, server-data.json) ← persistent data
```

---

## .htaccess Configuration Explained for Hostinger

### 1. Security Headers (Lines 6-37)

```apache
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set Content-Security-Policy "default-src 'self'; ..."
```

**What they do on Hostinger:**
- Prevent browsers from MIME-sniffing files
- Prevent app from being framed in iframes
- Enable XSS protection in older browsers
- Force HTTPS for 1 year (browsers remember this)
- Control what resources can be loaded (scripts, styles, images)

**On Hostinger:**
- These work automatically in public_html
- No additional server configuration needed
- Can be tested with: `curl -I https://yourdomain.com`

### 2. Gzip Compression (Lines 40-50)

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>
```

**What it does:**
- Compresses HTML, CSS, JavaScript before sending to browsers
- Reduces bandwidth by ~60%
- Your 1MB bundle becomes ~300KB

**On Hostinger:**
- `mod_deflate` is enabled by default
- Works automatically for all file types listed
- Check browser DevTools → Network → Response headers for `Content-Encoding: gzip`

### 3. Browser Caching (Lines 53-89)

```apache
ExpiresByType text/html "access plus 0 seconds"           # Always fresh
ExpiresByType application/javascript "access plus 1 year" # Cache forever
ExpiresByType image/* "access plus 1 month"              # Cache 1 month
```

**How it works:**
- First visit: Browser downloads all files
- Subsequent visits: Browser uses cached files if not expired
- Vite automatically versioning JS/CSS filenames (hash: `main-ABC123.js`)
- When you deploy new code, filenames change, so cache busts automatically

**On Hostinger:**
- `mod_expires` is enabled by default
- Check Chrome DevTools → Network → Type → JS/CSS/Images for `304 Not Modified` responses

### 4. SPA Routing Rewrite (Lines 92-115)

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

**How it works:**
1. Client requests `/bookings` (route in React)
2. Server checks: Is `/bookings` a real file? No. Is it a directory? No.
3. Server rewrites to `index.html` and sends it
4. React loads and checks URL → shows Bookings page
5. Client never sees 404 error

**On Hostinger:**
- `mod_rewrite` is enabled by default
- Verify with: Visit `https://yourdomain.com/bookings` → should show app (not 404)
- Works for all React routes without changes

**Important:** Make sure `.htaccess` is in the directory where `index.html` is deployed:
```
public_html/
├── .htaccess          ← HERE
├── server.js
├── dist/
│   └── index.html
```

### 5. HTTPS Redirect (Lines 117-121)

```apache
RewriteCond %{HTTPS} off
RewriteCond %{HTTP:X-Forwarded-Proto} !https
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

**What it does:**
- User visits `http://yourdomain.com`
- Server redirects to `https://yourdomain.com`
- All traffic encrypted

**On Hostinger:**
- SSL certificate is free and automatic
- This rule ensures everyone uses HTTPS
- Check browser address bar: should show 🔒 padlock

### 6. Protect Sensitive Files (Lines 148-157)

```apache
<FilesMatch "^\.env">
    Order allow,deny
    Deny from all
</FilesMatch>

<FilesMatch "^(\.git|node_modules|server\.js|sessions\.json)">
    Order allow,deny
    Deny from all
</FilesMatch>
```

**What it does:**
- Blocks direct access to `.env` file (contains secrets)
- Blocks `node_modules` folder
- Blocks `server.js` source code
- Blocks `sessions.json` (user session tokens)

**Example attacks prevented:**
- ❌ `curl https://yourdomain.com/.env` → 403 Forbidden
- ❌ `curl https://yourdomain.com/server.js` → 403 Forbidden
- ✅ API still works normally

---

## Hostinger Deployment Steps

### Step 1: Prepare Files Locally

```bash
cd c:\Users\nikhi\Downloads\Nikhil-Softwares\transport-management-system

# Build frontend
npm run build

# Creates dist/index.html with all CSS/JS embedded
# Size: ~1MB (316KB gzipped)
```

### Step 2: Connect via SFTP (Recommended)

**Using FileZilla (Free):**
1. Download: https://filezilla-project.org
2. File → Site Manager → New Site
3. Protocol: SFTP
4. Host: `yourdomain.com` or IP from Hostinger hPanel
5. Username/Password: From Hostinger hPanel → FTP Accounts

**Or via Hostinger File Manager:**
1. Hostinger hPanel → File Manager
2. Navigate to `public_html/` (or subdomain folder)
3. Use browser-based upload

### Step 3: Upload Files to Hostinger

**Complete directory structure:**
```
public_html/  (or subdomain_name/)
├── .htaccess                    ← REQUIRED for routing
├── .env                         ← Create from .env.production
├── server.js                    ← Backend Express server
├── package.json                 ← Dependencies list
├── package-lock.json            ← Dependency locks
├── dist/
│   └── index.html               ← Single-file bundle (1MB)
├── node_modules/                ← Will be created by npm install
└── data/
    ├── server-data.json         ← Create if doesn't exist
    └── sessions.json            ← Created automatically by server
```

### Step 4: Create .env File

On Hostinger, create `.env` file with:
```
NODE_ENV=production
PORT=5000
VITE_API_URL=https://yourdomain.com/api
```

Or for subdomain:
```
VITE_API_URL=https://subdomain.yourdomain.com/api
```

### Step 5: Install Node.js Dependencies

**Option A: Via SSH (Recommended)**
```bash
ssh user@yourdomain.com
cd public_html
npm install
npm start
```

**Option B: Hostinger Node.js Installer**
1. Go to Hostinger hPanel
2. Auto Installers → Node.js
3. Select domain/subdomain
4. Application URL: `/`
5. Application Startup File: `server.js`
6. Application Root: `public_html`
7. Start command: `npm start`
8. Click Install

**Option C: Using PM2 (for persistent running)**
```bash
npm install -g pm2
pm2 start server.js --name "transport-app"
pm2 save
pm2 startup
```

### Step 6: Verify Installation

Test health endpoint:
```bash
curl https://yourdomain.com/api/health

# Should respond with JSON:
# {
#   "status": "healthy",
#   "uptime": {...},
#   "memory": {...},
#   "sessions": {"active": 0},
#   "environment": "production"
# }
```

### Step 7: Test Application

1. Open `https://yourdomain.com` in browser
2. Should see login page (not blank, not 404)
3. DevTools → Console: no errors
4. Login with `rishabh` / `Rishabh5689`
5. Add booking/client
6. Refresh page → data still there
7. Open different browser/device → login again, data synced

---

## Hostinger-Specific Configuration Changes

### Update CORS in server.js

**Before (works anywhere):**
```javascript
app.use(cors());  // Allow all origins
```

**After (production on Hostinger):**
```javascript
app.use(cors({
  origin: function(origin, callback) {
    const allowedDomains = [
      'https://yourdomain.com',           // Main domain
      'https://subdomain.yourdomain.com', // Subdomain (if using)
    ];
    if (!origin || allowedDomains.some(domain => origin.includes(domain))) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));
```

**Replace with your actual domain(s).**

### Update API URL in .env.production

Before deploying to Hostinger, update:
```bash
VITE_API_URL=https://yourdomain.com/api
```

Then rebuild:
```bash
npm run build
```

### Create Data Directories

On Hostinger, create directories:
```bash
mkdir -p data
chmod 755 data
```

---

## Hostinger Subdomain Configuration

If deploying to `subdomain.yourdomain.com`:

### Step 1: Add Subdomain in Hostinger

1. Hostinger hPanel → Domains → Subdomains
2. Subdomain: `subdomain`
3. Root: `public_html/subdomain` (or your choice)
4. Add Subdomain

### Step 2: Update DNS (if needed)

Usually automatic, but verify:
- Type: CNAME
- Name: `subdomain`
- Value: `yourdomain.com`
- TTL: 3600

### Step 3: Deploy to Subdomain Directory

Upload files to `public_html/subdomain/`:
```
public_html/subdomain/
├── .htaccess
├── .env
├── server.js
├── dist/index.html
└── data/
```

### Step 4: Update Configuration

In `server.js`, add subdomain to CORS:
```javascript
const allowedDomains = [
  'https://subdomain.yourdomain.com',
];
```

In `.env.production`:
```
VITE_API_URL=https://subdomain.yourdomain.com/api
```

Rebuild and redeploy:
```bash
npm run build
```

### Step 5: Install Dependencies in Subdomain

```bash
ssh user@yourdomain.com
cd public_html/subdomain
npm install
npm start
```

---

## Troubleshooting on Hostinger

### Issue: "Cannot GET /path"

**Cause:** .htaccess not working or in wrong location

**Fix:**
1. Verify `.htaccess` is in root directory (where `index.html` is)
2. Check that `mod_rewrite` is enabled (usually is on Hostinger)
3. Try accessing: `https://yourdomain.com/bookings` → should work

### Issue: API Calls Return CORS Error

**Cause:** CORS not configured for your domain

**Fix:**
1. Update `server.js` CORS config with your domain
2. Rebuild: `npm run build`
3. Redeploy to Hostinger
4. Restart Node.js server

### Issue: Static Files Not Loading (CSS/JS Missing)

**Cause:** Wrong path in `dist/index.html`

**Fix:**
1. Verify `dist/index.html` exists on Hostinger
2. File size should be ~1MB
3. Check `.htaccess` `RewriteBase` is correct (usually not needed)

### Issue: Port 5000 Already in Use

**Cause:** Another process using the port or server not shutting down properly

**Fix:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or restart Hostinger Node.js app via hPanel
```

### Issue: Permissions Denied Writing sessions.json

**Cause:** Wrong directory permissions

**Fix:**
```bash
ssh user@yourdomain.com
cd public_html
chmod 755 data
chmod 644 data/server-data.json
chmod 644 data/sessions.json
```

---

## Monitoring on Hostinger

### Check Server Status

```bash
# Health check
curl https://yourdomain.com/api/health

# Application info
curl https://yourdomain.com/api/info
```

### View Logs

Hostinger hPanel → Node.js → View Logs

Or via SSH:
```bash
tail -f ~/logs/yourdomain.com.log
```

### Monitor Disk Usage

```bash
du -sh ~/*
# Check if data files growing too large
du -sh data/*
```

---

## Performance on Hostinger

### Expected Performance

- **First Page Load:** 2-3 seconds (depends on internet)
- **API Response:** <500ms (local file storage)
- **Gzip Compression:** ~70% reduction in transfer size
- **Browser Cache:** Second visit <1 second

### Optimization Tips

1. **Enable Hostinger Caching** (if available in hPanel)
2. **Monitor Memory Usage:** `free -h` on SSH
3. **Regular Cleanup:** Delete old sessions from `sessions.json`
4. **Backup Daily:** Use Hostinger backup or custom script

---

## Security Checklist for Hostinger

- [ ] SSL Certificate installed (usually auto on Hostinger)
- [ ] .htaccess in root directory
- [ ] CORS configured with your domain only
- [ ] .env file not accessible (blocked by .htaccess)
- [ ] sessions.json not accessible (blocked by .htaccess)
- [ ] HTTPS redirect working (test with http://yourdomain.com)
- [ ] Security headers present (`curl -I https://yourdomain.com`)
- [ ] Node.js server running (check via health endpoint)
- [ ] Data directory writable (sessions saving correctly)

---

## Hostinger Support Resources

- **Documentation:** https://support.hostinger.com
- **Node.js Guide:** https://support.hostinger.com/en/articles/360001191971
- **SSH Access:** https://support.hostinger.com/en/articles/360001263033
- **File Manager:** https://support.hostinger.com/en/articles/360001280914
- **Security:** https://support.hostinger.com/en/articles/360001269633

---

## Production Checklist for Hostinger

Before going live:

- [ ] Tested locally with `npm run build && npm start`
- [ ] Updated server.js CORS with production domain
- [ ] Updated .env.production with your domain
- [ ] Uploaded all files via SFTP
- [ ] Created data/ directory
- [ ] Ran `npm install` on Hostinger
- [ ] Started Node.js server
- [ ] Tested health endpoint: `https://yourdomain.com/api/health`
- [ ] Tested app login: `https://yourdomain.com`
- [ ] Verified SSL certificate (🔒 in address bar)
- [ ] Tested SPA routing (/bookings, /clients, etc.)
- [ ] Tested multi-device session persistence
- [ ] Checked DevTools for errors
- [ ] Verified gzip compression working (DevTools → Network)
- [ ] Set up monitoring alerts (optional)

---

## Next Steps After Deployment

1. **Monitor for 24 hours** - Check error logs regularly
2. **Test thoroughly** - All features, across devices
3. **Set up backups** - Daily backup of data files
4. **Create runbook** - Document how to restart server
5. **Plan maintenance** - Quarterly security updates

---

**Your app is now deployed to Hostinger with production-ready configuration!** 🚀

For detailed guidance, see `DEPLOYMENT.md` and `PRODUCTION_CHECKLIST.md`
