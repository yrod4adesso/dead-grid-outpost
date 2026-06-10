# Dead Grid Outpost - Post-Release Monitoring Guide

**Version:** 0.2.0 (Meta-Progression Release)  
**Purpose:** Guide for monitoring production deployment health

---

## 1. Error Tracking

### Immediate Monitoring (First 24 Hours)

**Checklist:**
- [ ] Monitor error logs every 2 hours
- [ ] Watch for localStorage access errors
- [ ] Track uncaught exceptions
- [ ] Verify profile load success rate

**Key Error Patterns to Watch:**

```javascript
// localStorage quota exceeded
QuotaExceededError: The quota has been exceeded.

// Invalid JSON in profile data
SyntaxError: Unexpected token in JSON at position X

// Profile version mismatch (expected, not critical)
Profile version X does not match current version 1

// React hydration mismatch
Hydration failed when rendering initial HTML
```

**Error Response Matrix:**

| Error Type | Severity | Action | Owner |
|------------|----------|--------|-------|
| localStorage access denied | Medium | Check browser privacy settings | Support |
| Profile parse failure | Low | Fresh profile created (expected) | Auto-handled |
| Build/runtime mismatch | High | Immediate rollback required | Deployasaurus |
| Uncaught exception | High | Investigate + hotfix if critical | Commit Kong |
| Performance degradation | Medium | Investigate + schedule fix | Lord Schema |

### Error Logging Setup

**Manual Error Tracking (No External Service):**

```javascript
// Add to src/app/layout.tsx
useEffect(() => {
  const handleError = (error: ErrorEvent) => {
    console.error('Production error:', {
      message: error.message,
      stack: error.error?.stack,
      url: error.filename,
      timestamp: new Date().toISOString(),
    });
    
    // Optional: Send to analytics endpoint
    // fetch('/api/error', {
    //   method: 'POST',
    //   body: JSON.stringify({ ... })
    // });
  };

  window.addEventListener('error', handleError);
  return () => window.removeEventListener('error', handleError);
}, []);
```

**Recommended External Services:**

1. **Sentry** (Error Tracking)
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

2. **LogRocket** (Session Replay)
   ```bash
   npm install @logrocket/logrocket
   ```

3. **Bugsnag** (Error Tracking Alternative)
   ```bash
   npm install @bugsnag/js @bugsnag/plugin-react
   ```

---

## 2. Performance Metrics

### Core Web Vitals

**Targets:**

| Metric | Target | Good | Needs Improvement | Poor |
|--------|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | < 2.5s | 2.5-4.0s | > 4.0s |
| FID (First Input Delay) | < 100ms | < 100ms | 100-300ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | < 0.1 | 0.1-0.25 | > 0.25 |
| TTFB (Time to First Byte) | < 600ms | < 600ms | 600-800ms | > 800ms |

**Monitoring Commands:**

```bash
# Lighthouse CLI (if installed)
lighthouse https://your-domain.com --view

# Chrome DevTools
# Open DevTools → Lighthouse tab → Run audit

# Programmatic check (Node.js)
npm install -g @puppeteer/browsers
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://your-domain.com');
  const metrics = await page.metrics();
  console.log('Metrics:', metrics);
  await browser.close();
})();
"
```

### Application-Specific Metrics

**Track These Metrics:**

1. **Profile Load Time:**
   ```javascript
   const start = performance.now();
   const profile = loadGameProfile();
   const end = performance.now();
   console.log('Profile load time:', end - start, 'ms');
   // Target: < 5ms
   ```

2. **Unlock Application Time:**
   ```javascript
   const start = performance.now();
   const derivedStats = getDerivedStats(buildings, survivors);
   const unlockedStats = applyUnlockEffectsToState(profile, derivedStats);
   const end = performance.now();
   console.log('Unlock application time:', end - start, 'ms');
   // Target: < 1ms
   ```

3. **LocalStorage Operations:**
   ```javascript
   const start = performance.now();
   saveGameProfile(profile);
   const end = performance.now();
   console.log('Save time:', end - start, 'ms');
   // Target: < 10ms
   ```

**Performance Dashboard (Manual):**

Create a simple stats page for internal monitoring:

```typescript
// src/app/stats/page.tsx (internal only)
export default function StatsPage() {
  const [metrics, setMetrics] = useState({
    profileLoadTime: 0,
    unlockApplicationTime: 0,
    saveTime: 0,
    totalRuns: 0,
    totalShards: 0,
  });

  useEffect(() => {
    // Collect metrics from localStorage or analytics
    const profile = loadGameProfile();
    setMetrics({
      ...metrics,
      totalRuns: profile?.lifetimeRuns ?? 0,
      totalShards: profile?.blueprintShards ?? 0,
    });
  }, []);

  return (
    <div>
      <h1>Internal Stats</h1>
      <p>Profile Load Time: {metrics.profileLoadTime}ms</p>
      <p>Total Runs: {metrics.totalRuns}</p>
      <p>Total Shards Earned: {metrics.totalShards}</p>
    </div>
  );
}
```

---

## 3. User Feedback Channels

### In-Game Feedback

**Current (v0.2.0):**
- Activity log shows all major actions
- Combat summary provides outcome feedback
- Profile panel shows progression status

**Planned (v0.2.1):**
- In-game feedback button
- Quick rating system (1-5 stars)
- Bug report form

**Implementation:**

```typescript
// src/components/feedback-button.tsx (future)
export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Send Feedback
      </button>
      
      {isOpen && (
        <FeedbackForm onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
```

### External Feedback Channels

**Telegram:**
- Channel: `@devsquad`
- Purpose: Real-time user reports, feature requests
- Response Time: < 24 hours

**GitHub Issues:**
- URL: `https://github.com/your-org/dead-grid-outpost/issues`
- Purpose: Bug reports, feature tracking
- Labels: `bug`, `enhancement`, `question`

**Email (Future):**
- Address: `feedback@deadgrid.example.com`
- Purpose: Detailed feedback, partnership inquiries

### Feedback Triage Process

**Triage Matrix:**

| Category | Severity | Response Time | Owner |
|----------|----------|---------------|-------|
| Critical Bug (game-breaking) | Critical | < 2 hours | Commit Kong |
| High Bug (major feature broken) | High | < 24 hours | Commit Kong |
| Medium Bug (minor issue) | Medium | < 3 days | Bugzilla |
| Low Bug (cosmetic) | Low | Next release | Bugzilla |
| Feature Request | Low | Backlog review | Captain Context |
| Question/Support | Low | < 48 hours | Support |

**Feedback Workflow:**

```
User Feedback → Telegram/GitHub/Email
    ↓
Captain Context Triage
    ↓
├─ Critical/High → Immediate hotfix
├─ Medium → Next patch release
├─ Low → Backlog prioritization
└─ Question → Support response
```

---

## 4. Health Check Scripts

### Automated Health Check

**Script: `scripts/health-check.sh`**

```bash
#!/bin/bash

# Dead Grid Outpost Health Check Script
# Run every 5 minutes via cron

set -e

URL="${1:-http://localhost:3000}"
EXPECTED_STATUS=200

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Health Check: $URL"

# Check HTTP status
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

if [ "$STATUS" -ne "$EXPECTED_STATUS" ]; then
  echo "❌ Health check FAILED: Expected $EXPECTED_STATUS, got $STATUS"
  
  # Send alert (example: Telegram bot)
  # curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  #   -d "chat_id=<CHAT_ID>&text=Health check failed for $URL"
  
  exit 1
fi

echo "✅ Health check PASSED: Status $STATUS"

# Check for critical errors in recent logs (if available)
if [ -f "/var/log/dead-grid-outpost/error.log" ]; then
  RECENT_ERRORS=$(tail -n 100 /var/log/dead-grid-outpost/error.log | grep -c "FATAL\|CRITICAL" || true)
  
  if [ "$RECENT_ERRORS" -gt 0 ]; then
    echo "⚠️  Warning: $RECENT_ERRORS critical errors in last 100 log lines"
  fi
fi

exit 0
```

**Cron Setup:**
```bash
# Add to crontab (crontab -e)
*/5 * * * * /home/azureuser/.openclaw/workspace-captain-context/dead-grid-outpost/scripts/health-check.sh http://localhost:3000 >> /var/log/health-check.log 2>&1
```

### Manual Health Check Commands

```bash
# 1. Check application is running
curl -I http://localhost:3000

# 2. Check build ID matches expected
curl -s http://localhost:3000/_next/static/BUILD_ID

# 3. Check Node.js process
pm2 list
# or
systemctl status dead-grid-outpost

# 4. Check memory usage
pm2 show dead-grid-outpost
# or
ps aux | grep "next start"

# 5. Check disk space (for logs)
df -h

# 6. Check Node.js version
node --version

# 7. Check for recent errors
pm2 logs dead-grid-outpost --lines 50
```

---

## 5. Alerting Strategy

### Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| HTTP 5xx Error Rate | > 1% | > 5% | Investigate + rollback if persists |
| Response Time (p95) | > 3s | > 5s | Scale up / optimize |
| Memory Usage | > 70% | > 90% | Restart + investigate leak |
| CPU Usage | > 60% | > 85% | Scale up / optimize |
| Error Log Rate | > 10/min | > 50/min | Investigate root cause |

### Alert Channels

**Priority Matrix:**

| Severity | Channel | Response Time | Escalation |
|----------|---------|---------------|------------|
| Critical | Telegram + SMS | < 15 min | Captain Context → All hands |
| High | Telegram + Email | < 1 hour | Captain Context → Dev team |
| Medium | Email | < 24 hours | Bugzilla triage |
| Low | Log only | Next business day | Backlog |

**Telegram Alert Example:**

```bash
#!/bin/bash
# scripts/send-alert.sh

MESSAGE="$1"
CHAT_ID="${TELEGRAM_CHAT_ID:-your-chat-id}"
BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-your-bot-token}"

curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -d "chat_id=${CHAT_ID}" \
  -d "text=🚨 ALERT: ${MESSAGE}" \
  -d "parse_mode=Markdown"
```

---

## 6. Metrics Dashboard

### Manual Dashboard (v0.2.0)

**Daily Check List:**

```bash
# Morning check (run manually or via cron)
echo "=== Dead Grid Outpost Daily Report ==="
echo "Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo ""

# Application status
echo "🟢 Application Status:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000

# Build info
echo ""
echo "📦 Build Info:"
cat .next/BUILD_ID 2>/dev/null || echo "BUILD_ID not found"

# Process status
echo ""
echo "⚙️ Process Status:"
pm2 list 2>/dev/null || echo "PM2 not available"

# Error count (last 24 hours)
echo ""
echo "🚨 Error Count (last 24h):"
tail -n +$(date -d "yesterday" +%Y-%m-%d) /var/log/dead-grid-outpost/error.log 2>/dev/null | wc -l || echo "Log not available"

# Disk space
echo ""
echo "💾 Disk Space:"
df -h . | tail -1
```

### Recommended Dashboards

**Option 1: Grafana + Prometheus**
- Best for: Long-term metrics, custom dashboards
- Setup: Install Prometheus exporter for Node.js
- Metrics: Response times, error rates, resource usage

**Option 2: Datadog**
- Best for: All-in-one monitoring
- Setup: Install Datadog APM agent
- Metrics: Built-in Next.js instrumentation

**Option 3: New Relic**
- Best for: Full-stack observability
- Setup: New Relic Node.js agent
- Metrics: End-to-end transaction tracing

---

## 7. Incident Response

### Incident Severity Levels

**P0 - Critical (Site Down)**
- Symptoms: HTTP 500 errors, complete unavailability
- Response: Immediate page all hands
- Target Resolution: < 1 hour
- Post-Mortem: Required within 24 hours

**P1 - High (Major Feature Broken)**
- Symptoms: Core gameplay loop broken, data loss
- Response: Page on-call developer
- Target Resolution: < 4 hours
- Post-Mortem: Required within 48 hours

**P2 - Medium (Minor Feature Broken)**
- Symptoms: Non-critical feature issues, performance degradation
- Response: Address within 24 hours
- Target Resolution: < 24 hours
- Post-Mortem: Optional

**P3 - Low (Cosmetic/Edge Case)**
- Symptoms: UI glitches, rare edge cases
- Response: Add to backlog
- Target Resolution: Next release
- Post-Mortem: Not required

### Incident Response Steps

**1. Detect:**
- Automated alert fires
- User reports issue
- Manual monitoring detects problem

**2. Acknowledge:**
- On-call responds to alert
- Confirm incident severity
- Notify stakeholders

**3. Contain:**
- Implement immediate workaround if available
- Consider rollback if severe
- Communicate status to users

**4. Resolve:**
- Identify root cause
- Implement fix
- Deploy hotfix

**5. Verify:**
- Confirm fix resolves issue
- Monitor for regressions
- Close alert

**6. Learn:**
- Conduct post-mortem (P0/P1 incidents)
- Document lessons learned
- Implement preventive measures

### Incident Communication Template

```
🚨 INCIDENT: [P0/P1/P2/P3] - [Brief Description]

Status: [Investigating/Identified/Monitoring/Resolved]

Impact: [What users are affected]

Timeline:
- [Time]: Incident detected
- [Time]: Investigation started
- [Time]: Root cause identified
- [Time]: Fix deployed
- [Time]: Incident resolved

Next Steps:
- [Action item 1]
- [Action item 2]

Updates every 30 minutes until resolved.
```

---

## 8. Post-Release Review

### 24-Hour Review Checklist

- [ ] Error rate below threshold (< 1%)
- [ ] Performance metrics within targets
- [ ] No critical user reports
- [ ] Profile load success rate > 99%
- [ ] Unlock system functioning correctly
- [ ] Team debrief completed

### 7-Day Review Checklist

- [ ] Stable error rate over 7 days
- [ ] User adoption of meta-progression
- [ ] Shard economy balanced (not too easy/hard)
- [ ] Unlock progression feels rewarding
- [ ] No major bugs reported
- [ ] Performance stable under load

### 30-Day Review Checklist

- [ ] Retention metrics improved (due to meta-progression)
- [ ] Average session duration increased
- [ ] User feedback predominantly positive
- [ ] Unlock balance validated
- [ ] Plan v0.2.1 features based on data
- [ ] Roadmap updated for v0.3.0

---

## Appendix: Monitoring Tools Reference

### Quick Commands Reference

```bash
# Application logs
pm2 logs dead-grid-outpost --lines 100

# Error log analysis
grep -c "ERROR" /var/log/dead-grid-outpost/error.log

# Performance test
ab -n 1000 -c 10 http://localhost:3000/

# Memory profiling
node --inspect app.js  # Then Chrome DevTools

# Network latency
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000
```

### curl-format.txt (for performance testing)

```
   time_namelookup:  %{time_namelookup}\n
      time_connect:  %{time_connect}\n
   time_appconnect:  %{time_appconnect}\n
  time_pretransfer:  %{time_pretransfer}\n
     time_redirect:  %{time_redirect}\n
time_starttransfer:  %{time_starttransfer}\n
                    -
       time_total:  %{time_total}\n
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-09 21:42 UTC  
**Author:** Deployasaurus Rex (Monitoring Specialist)  
**Review Status:** For Captain Context Review
