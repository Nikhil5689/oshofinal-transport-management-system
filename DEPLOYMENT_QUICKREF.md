# Production Deployment - Quick Reference

## Files Changed/Created

### New Files
```
✅ .env.production          - Production environment config
✅ .htaccess               - Hostinger web server config
✅ DEPLOYMENT.md           - Full deployment guide
✅ PRODUCTION_CHECKLIST.md - Pre-launch verification
✅ PRODUCTION_READY.md     - Quick reference
✅ HOSTINGER_HTACCESS_GUIDE.md - .htaccess explained
✅ DEPLOYMENT_QUICKREF.md  - This file
```

### Updated Files
```
✅ src/utils/api.ts        - Token expiry handling
✅ server.js               - Security headers, compression, health endpoint
✅ package.json            - Added compression dependency
✅ .gitignore              - Added sessions.json, backups/
```

---

## 5-Minute Production Setup

### 1. Build
```bash
npm install
npm run build
```

### 2. Configure
Edit `.env.production`:
```
VITE_API_URL=https://yourdomain.com/api
```

Edit `server.js` line 13-24:
```javascript
'https://yourdomain.com',
'https://subdomain.yourdomain.com',  // if using subdomain
```

### 3. Deploy
Upload to Hostinger:
```
public_html/
├── .htaccess
├── .env
├── server.js
├── package.json
├── dist/index.html
└── data/
```

### 4. Install & Run
On Hostinger via SSH:
```bash
npm install
npm start
```

### 5. Verify
```bash
# Test
curl https://yourdomain.com/api/health

# Visit
https://yourdomain.com
```

---

## What Each File Does

| File | Purpose | Hostinger Effect |
|------|---------|-----------------|
| `.htaccess` | URL rewriting, security headers, compression | Enables SPA routing, gzip, HTTPS |
| `.env` | Domain configuration | API calls go to right backend |
| `server.js` | Express backend | Handles all API requests |
| `dist/index.html` | Frontend bundle | Single 1MB file with all CSS/JS |
| `data/*.json` | Persistent storage | Data survives server restart |

---

## Key Features Configured

✅ **Multi-Device Sessions**
- Same user can login from multiple devices
- Each device gets unique token
- Tokens persist for 30 days
- Automatic cleanup every 10 minutes

✅ **Security**
- HTTPS enforced
- CORS restricted to your domain
- Security headers prevent attacks
- Sensitive files protected

✅ **Performance**
- Gzip compression (60% smaller)
- Browser caching optimized
- SPA routing working

---

## Important: Update These 2 Places

### 1. server.js (CORS)
**Line 13-24:**
```javascript
const allowedDomains = [
  'https://yourdomain.com',           // ← Change this
  'https://subdomain.yourdomain.com', // ← And this if subdomain
];
```

### 2. .env.production
**Line 1:**
```
VITE_API_URL=https://yourdomain.com/api  // ← Change this
```

---

## Hostinger Subdomain Setup

If using `subdomain.yourdomain.com`:

1. **Hostinger hPanel:**
   - Add Subdomain → `subdomain`

2. **Update server.js CORS:**
   ```javascript
   'https://subdomain.yourdomain.com'
   ```

3. **Update .env.production:**
   ```
   VITE_API_URL=https://subdomain.yourdomain.com/api
   ```

4. **Upload to:** `public_html/subdomain/`

---

## Build Output

```bash
$ npm run build

✓ 2706 modules transformed.
✓ dist/index.html  1,068.75 kB │ gzip: 316.00 kB
✓ built in 19.41s
```

**Result:**
- Single HTML file: 1MB (not split)
- Gzipped: 316KB (what server sends)
- Contains: React + UI + all dependencies

---

## Test Production Locally

```bash
# Build
npm run build

# Run
npm start

# Test
# Open http://localhost:5000
# Login: rishabh / Rishabh5689
# Add data → verify persists
```

---

## Production .htaccess Features

| Feature | Effect |
|---------|--------|
| **RewriteRule** | `/bookings` → `index.html` (SPA routing) |
| **Header Security** | Prevents XSS, clickjacking, MIME sniffing |
| **Gzip** | Compresses JavaScript/CSS/HTML |
| **Cache** | HTML: always fresh, JS/CSS: 1 year |
| **HTTPS** | Redirects `http://` → `https://` |
| **Protect Files** | Blocks `.env`, `node_modules`, `server.js` |

---

## Monitoring & Health

```bash
# Check server running
curl https://yourdomain.com/api/health

# Expected response
{
  "status": "healthy",
  "uptime": { "seconds": 3600, ... },
  "sessions": { "active": 2 },
  "environment": "production"
}
```

---

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Blank page | Check browser console for errors |
| API 401 | Token expired → login again |
| API CORS error | Update server.js CORS + rebuild |
| Routes show 404 | Verify .htaccess in root directory |
| Permissions error | `chmod 755 data && chmod 644 data/*.json` |
| Port in use | `killall node` or restart Hostinger app |

---

## Before Going Live

```
☐ Build works locally: npm run build && npm start
☐ CORS updated with your domain
☐ .env.production updated
☐ .htaccess in correct location (root)
☐ SSL certificate enabled (automatic on Hostinger)
☐ Node.js app installed on Hostinger
☐ Health endpoint working
☐ Login works from two different devices
☐ Data syncs between devices
☐ No console errors in browser
```

---

## Key Endpoints

**Public (no login required):**
- `GET /api/health` - Server status
- `GET /api/info` - App information
- `POST /api/login` - User authentication

**Protected (requires token):**
- `POST /api/bookings` - Add booking
- `POST /api/clients` - Add client
- `POST /api/payments` - Add payment
- `POST /api/logout` - Logout

---

## File Sizes

| File | Size |
|------|------|
| dist/index.html | ~1,068 KB |
| dist/index.html (gzipped) | ~316 KB |
| server.js | ~15 KB |
| package.json | ~1 KB |
| .htaccess | ~2 KB |

**Total to upload:** ~1,100 KB (uncompressed)
**Transfer size:** ~300 KB (gzipped)

---

## Support Files

Read these in order:
1. **PRODUCTION_READY.md** - Overview (you are here)
2. **HOSTINGER_HTACCESS_GUIDE.md** - .htaccess explained
3. **DEPLOYMENT.md** - Detailed step-by-step
4. **PRODUCTION_CHECKLIST.md** - Pre-launch verification

---

## Is Everything Ready?

✅ **Frontend:** React 19 + Vite bundle (single HTML file)
✅ **Backend:** Express with security headers & compression
✅ **Authentication:** Token-based with 30-day expiry
✅ **Multi-Device:** Server-side session persistence
✅ **Security:** CORS, HTTPS, headers, file protection
✅ **Performance:** Gzip (60% reduction), browser caching
✅ **Configuration:** .htaccess for Hostinger routing & caching
✅ **Monitoring:** Health endpoint for server status
✅ **Documentation:** 6 comprehensive guides

---

## Next Steps

1. ✅ Read HOSTINGER_HTACCESS_GUIDE.md
2. ✅ Build locally: `npm run build`
3. ✅ Update server.js CORS with your domain
4. ✅ Update .env.production with your domain
5. ✅ Upload to Hostinger via SFTP
6. ✅ Run `npm install` on Hostinger
7. ✅ Start server: `npm start`
8. ✅ Verify: `curl https://yourdomain.com/api/health`
9. ✅ Test login and features
10. ✅ Monitor for 24 hours

---

## Questions?

- **Deployment:** See DEPLOYMENT.md → Troubleshooting
- **.htaccess:** See HOSTINGER_HTACCESS_GUIDE.md
- **Security:** See PRODUCTION_CHECKLIST.md
- **Configuration:** See PRODUCTION_READY.md

---

**Your app is production-ready!** 🚀

**Last Updated:** $(date)
**Status:** Ready for Hostinger Deployment
