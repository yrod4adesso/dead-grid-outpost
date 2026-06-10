# Dead Grid Outpost - Deployment Guide

**Version:** 0.2.0 (Meta-Progression Release)  
**Mode:** Starship  
**Target Environments:** Local Development, Production

---

## Quick Start

### Local Development

```bash
# Navigate to project directory
cd /home/azureuser/.openclaw/workspace-captain-context/dead-grid-outpost

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Access application
# http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Verify build
ls -la .next/

# Start production server
npm run start

# Access application
# http://localhost:3000
```

---

## Environment Setup

### Prerequisites

| Requirement | Version | Verify Command |
|-------------|---------|----------------|
| Node.js | v22+ | `node --version` |
| npm | v10+ | `npm --version` |
| Git | Latest | `git --version` |

### Environment Variables

**Current Release:** No environment variables required.

**Future Considerations:**
Create `.env.local` for development:
```bash
# Example (not used in current release)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Configuration Files

| File | Purpose | Edit Required |
|------|---------|---------------|
| `next.config.ts` | Next.js configuration | No |
| `tsconfig.json` | TypeScript configuration | No |
| `package.json` | Dependencies and scripts | No |
| `.env.local` | Environment variables | Optional |

---

## Deployment Targets

### Option 1: Vercel (Recommended)

**Why Vercel:**
- Native Next.js support
- Automatic deployments from git
- Built-in CDN and edge functions
- Free tier available

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy to Preview:**
   ```bash
   vercel
   ```

4. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

5. **Set Environment Variables (if needed):**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   ```

**Vercel Project Settings:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Option 2: Static Export

**When to Use:**
- Fully static site (no server functions)
- Deploy to any static host (Netlify, GitHub Pages, S3)

**Steps:**

1. **Update `next.config.ts`:**
   ```typescript
   const nextConfig = {
     output: 'export',
     // other config...
   };
   ```

2. **Build for export:**
   ```bash
   npm run build
   ```

3. **Deploy `out/` directory** to static host

**Limitations:**
- No server-side rendering
- No API routes
- Limited dynamic functionality

### Option 3: Custom Node.js Server

**When to Use:**
- Full control over server configuration
- Integration with existing infrastructure

**Steps:**

1. **Build application:**
   ```bash
   npm run build
   ```

2. **Start server:**
   ```bash
   NODE_ENV=production npm run start
   ```

3. **Configure reverse proxy (nginx example):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Use process manager (PM2 example):**
   ```bash
   npm install -g pm2
   pm2 start npm --name "dead-grid-outpost" -- start
   pm2 save
   pm2 startup
   ```

---

## Pre-Deployment Checklist

### Build Verification

- [ ] `npm run build` completes without errors
- [ ] TypeScript compilation clean (`tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] All tests pass (`npm run test:e2e` if browsers available)

### Code Quality

- [ ] No console.log statements in production code
- [ ] Error boundaries implemented
- [ ] Loading states for async operations
- [ ] Accessibility basics (alt text, semantic HTML)

### Security

- [ ] No hardcoded secrets in code
- [ ] Environment variables properly scoped
- [ ] CORS configured (if API endpoints added)
- [ ] Input validation on all user inputs

### Performance

- [ ] Build size acceptable (< 500KB initial load)
- [ ] Images optimized (WebP, lazy loading)
- [ ] Code splitting working (check `.next/server/`)
- [ ] No unnecessary re-renders (React DevTools)

### Data & Migration

- [ ] localStorage keys documented
- [ ] Migration path tested (if applicable)
- [ ] Data backup strategy in place
- [ ] Rollback procedure documented

---

## Post-Deployment Verification

### Smoke Tests

1. **Application Loads:**
   ```bash
   curl -I https://your-domain.com
   # Expected: HTTP 200
   ```

2. **Home Page Renders:**
   - Visit `/`
   - Verify landing screen loads
   - Check profile panel visible

3. **Game Loop Works:**
   - Start new game
   - Complete a mission
   - Check localStorage persistence

4. **Meta-Progression Functions:**
   - Complete a run (victory or defeat)
   - Verify blueprint shards awarded
   - Check profile panel updates
   - Reload page → verify persistence

5. **Unlock System:**
   - Earn enough shards
   - Unlock a node (e.g., "Storage Doctrine")
   - Start new game → verify bonus applied

### Monitoring Setup

**Error Tracking:**
```bash
# Example: Add Sentry (if not already)
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Analytics:**
```bash
# Example: Add Google Analytics
# Add to src/app/layout.tsx
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

**Performance Monitoring:**
- Use Chrome DevTools Lighthouse
- Check Core Web Vitals in Google Search Console
- Monitor Time to First Byte (TTFB)

---

## Troubleshooting

### Build Failures

**Issue:** `npm run build` fails

**Solutions:**
1. Clear cache and reinstall:
   ```bash
   rm -rf node_modules .next
   npm install
   npm run build
   ```

2. Check Node.js version:
   ```bash
   node --version
   # Should be v22+
   ```

3. Check for TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```

### Runtime Errors

**Issue:** Application crashes on startup

**Solutions:**
1. Check server logs:
   ```bash
   pm2 logs dead-grid-outpost
   # or
   journalctl -u your-service-name
   ```

2. Verify environment:
   ```bash
   echo $NODE_ENV
   # Should be "production"
   ```

3. Check port availability:
   ```bash
   lsof -i :3000
   ```

### localStorage Issues

**Issue:** Profile data not persisting

**Solutions:**
1. Check browser console for errors
2. Verify localStorage quota not exceeded
3. Check private/incognito mode (may block localStorage)
4. Verify key names match exactly:
   ```javascript
   console.log(Object.keys(localStorage));
   // Should include 'dead-grid-outpost/profile-v1'
   ```

### Performance Issues

**Issue:** Slow page load or interactions

**Solutions:**
1. Run Lighthouse audit
2. Check bundle size:
   ```bash
   npm run build && du -sh .next/
   ```
3. Profile with React DevTools
4. Check for unnecessary re-renders

---

## Rollback Procedure

### Immediate Rollback

**Scenario:** Critical bug discovered post-deployment

**Steps:**

1. **Revert to Previous Version:**
   ```bash
   # On deployment server
   cd /path/to/dead-grid-outpost
   git checkout <previous-commit-hash>
   npm install
   npm run build
   pm2 restart dead-grid-outpost
   ```

2. **Vercel Rollback:**
   ```bash
   vercel rollback
   ```

3. **Notify Users:**
   - Post incident report
   - Document what went wrong
   - Outline fix timeline

### Data Recovery

**Scenario:** Data corruption after migration

**Steps:**

1. **Assess Impact:**
   - Check error logs
   - Identify affected users (if possible)
   - Determine data loss scope

2. **Rollback Migration:**
   - Deploy previous version
   - Users with corrupted data get fresh profile
   - Document data loss in release notes

3. **Communicate:**
   - Inform affected users
   - Provide workaround if available
   - Set expectations for fix

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Review performance metrics
- Monitor user feedback

**Monthly:**
- Update dependencies (`npm update`)
- Security audit (`npm audit`)
- Backup any server-side data (if added)

**Quarterly:**
- Review and update documentation
- Evaluate new features/optimizations
- Plan next major release

### Dependency Updates

**Safe Updates:**
```bash
# Check for updates
npm outdated

# Update patch versions (safe)
npm update

# Update minor versions (test first)
npm install <package>@latest
```

**Breaking Changes:**
```bash
# Check changelog before major updates
npm view <package>@latest changelog

# Test in feature branch first
git checkout -b test-major-update
npm install <package>@latest
npm run build
npm run test:e2e
```

### Security Updates

**Critical Patches:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically (review changes)
npm audit fix

# Fix breaking (review carefully)
npm audit fix --force
```

---

## Support & Contacts

**Development Team:**
- Captain Context: Primary orchestrator
- Deployasaurus Rex: Deployment specialist
- Sir NullPointer: Security & hardening
- Bugzilla von Chaosberg: QA & bug tracking

**External Resources:**
- Next.js Documentation: https://nextjs.org/docs
- Vercel Deployment: https://vercel.com/docs
- React Documentation: https://react.dev

**Incident Response:**
1. Critical: Immediate rollback + team notification
2. High: Hotfix within 24 hours
3. Medium: Next scheduled release
4. Low: Backlog prioritization

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-09 21:42 UTC  
**Author:** Deployasaurus Rex
