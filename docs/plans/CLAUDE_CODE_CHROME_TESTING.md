# Automated Testing with Claude Code Chrome Integration

## Overview

Use Claude Code's Chrome integration (beta) to automate frontend testing. This uses your actual logged-in browser session for realistic testing.

**Source:** [Claude Code with Chrome (beta)](https://code.claude.com/docs/en/chrome)

## Setup

### Prerequisites
1. **Claude Max plan subscription** (required for Chrome beta)
2. **Claude in Chrome extension** installed from [Chrome Web Store](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)
3. **Dev server running:** `npm run dev` at http://localhost:3001

### Connect Claude Code to Chrome

Run in terminal:
```bash
claude --chrome
```

This establishes live connection between Claude Code and your Chrome browser.

**Check connection status:**
```bash
/chrome
```

## Testing Capabilities

Claude Code can:
- ✅ Navigate pages
- ✅ Click buttons and links
- ✅ Fill forms and inputs
- ✅ Read console logs and errors
- ✅ Monitor network requests
- ✅ Take screenshots
- ✅ Record GIFs of interactions
- ✅ Read DOM state
- ✅ Execute JavaScript in browser context

**Source:** [Medium - Claude Code Browser Feature](https://medium.com/@joe.njenga/i-tested-new-claude-code-browser-feature-claude-code-can-now-control-your-browser-d526024c033b)

## Automated Test Suite

### Test 1: Waterfall Builder UI Flow

**Prompt for Claude Code:**
```
I need you to test the waterfall enrichment feature at http://localhost:3001

Using the Chrome integration, please:

1. Navigate to http://localhost:3001
2. Wait for page to load, take screenshot
3. Scroll to the "Waterfall Enrichment" section
4. Click the "Add Waterfall" button
5. Take screenshot of the new waterfall card
6. In the waterfall card, find the dropdown that says "Add provider to sequence"
7. Select "Apollo" from the dropdown
8. Take screenshot showing Step 1 with Apollo
9. Select "Hunter.io" from the dropdown
10. Take screenshot showing both steps
11. Change Step 1 coverage rate input to 65
12. Change Step 2 coverage rate input to 50
13. Take screenshot of configured waterfall
14. Scroll to "Waterfall Analysis" section in the results panel
15. Take screenshot of the analysis results
16. Check browser console for any errors
17. Verify the Total Coverage shows approximately 82.5% (65% + 35% × 50%)

Report back with:
- All screenshots taken
- Console errors (if any)
- Whether the coverage calculation is correct
- Any UI issues you observed
```

### Test 2: Multiple Waterfalls Integration

**Prompt for Claude Code:**
```
Continue testing at http://localhost:3001

1. Change the category dropdown to "Phone Finding"
2. Click "Add Waterfall" again
3. Take screenshot showing two waterfalls
4. In the phone waterfall, add "BetterContact" (coverage 70%)
5. Add "Lusha" to the same waterfall (coverage 40%)
6. Take screenshot of both configured waterfalls
7. Scroll to results and take screenshot of both analysis sections
8. Verify both waterfalls show in Cost Breakdown
9. Check for console errors
10. Report if calculations look correct for both waterfalls
```

### Test 3: Infrastructure Integration

**Prompt for Claude Code:**
```
Continue at http://localhost:3001 with waterfalls still configured

1. Scroll to "Email Infrastructure Settings"
2. Click the "Aggressive (50/day)" preset button
3. Take screenshot
4. Verify the page recalculates (loading indicator or value changes)
5. Scroll to Cost Breakdown section
6. Take screenshot showing both waterfall costs and infrastructure costs
7. Verify total cost includes all items
8. Check console for errors
9. Record a GIF of the recalculation happening
```

### Test 4: Mobile Responsiveness

**Prompt for Claude Code:**
```
Test mobile layout at http://localhost:3001

1. Open Chrome DevTools (you can click F12 or use browser controls)
2. Enable device toolbar (mobile viewport)
3. Select "iPhone 12 Pro" device
4. Refresh the page
5. Take screenshot of initial mobile view
6. Scroll to Waterfall Enrichment section
7. Take screenshot of mobile waterfall builder
8. Verify buttons are large enough to tap
9. Try adding a waterfall on mobile
10. Take screenshot of mobile waterfall chart in results
11. Report any layout issues
```

### Test 5: Error Handling

**Prompt for Claude Code:**
```
Test error states at http://localhost:3001

1. Create a waterfall with no steps
2. Try to view results
3. Take screenshot - verify graceful handling
4. Add a step with 0% coverage
5. Take screenshot of results
6. Add a step with 100% coverage
7. Verify calculation handles edge cases
8. Check console for errors throughout
9. Report any crashes or incorrect calculations
```

## Quick Smoke Test

**Single prompt for rapid validation:**
```
Quick smoke test at http://localhost:3001:

1. Navigate to page, verify it loads
2. Add email waterfall: Apollo (65%) → Hunter (50%)
3. Verify analysis shows ~82.5% coverage
4. Change infrastructure to Aggressive preset
5. Verify costs recalculate
6. Check console for errors
7. Take final screenshot of working calculator

Report: PASS/FAIL with screenshots
```

## Continuous Testing Workflow

### Before Each Deployment:

```bash
# 1. Start dev server
npm run dev

# 2. Connect Claude Code to Chrome
claude --chrome

# 3. Run in Claude Code terminal:
```

**Prompt:**
```
Run the complete waterfall enrichment test suite for http://localhost:3001:

Test Suite:
1. ✅ Waterfall Builder UI (add, remove, configure)
2. ✅ Calculation accuracy (single & multi-step)
3. ✅ Visualization rendering (charts, metrics)
4. ✅ Integration (infrastructure, headcount)
5. ✅ Mobile responsiveness

For each test:
- Execute all steps
- Take screenshots
- Check console for errors
- Verify calculations
- Report PASS/FAIL

Provide final summary with:
- Test results (5/5 passed)
- All screenshots
- Any issues found
- Deployment recommendation
```

## Expected Output Format

Claude Code will respond with:

```markdown
## Test Results Summary

### Test 1: Waterfall Builder UI - ✅ PASS
- Added waterfall successfully
- Configured Apollo (65%) and Hunter (50%)
- UI responsive and functional
- Screenshots: [attached]

### Test 2: Multiple Waterfalls - ✅ PASS
- Created email and phone waterfalls
- Both display correctly
- Cost breakdown accurate
- Screenshots: [attached]

### Test 3: Infrastructure Integration - ✅ PASS
- Preset applies correctly
- Recalculation works
- All costs included
- Screenshots: [attached]

### Test 4: Mobile Responsiveness - ✅ PASS
- Layout adapts to mobile
- Buttons are tappable
- Charts resize properly
- Screenshots: [attached]

### Test 5: Error Handling - ✅ PASS
- Graceful error states
- No console errors
- Edge cases handled
- Screenshots: [attached]

## Console Errors
None found ✅

## Calculation Verification
- Expected: 82.5% coverage
- Actual: 82.5% coverage
- Match: ✅ YES

## Issues Found
None

## Recommendation
✅ READY FOR DEPLOYMENT
```

## Integration with CI/CD

### GitHub Actions (Future Enhancement)

```yaml
# .github/workflows/test.yml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - name: Claude Code Tests
        run: |
          npm run dev &
          claude --chrome << EOF
          Run waterfall enrichment test suite at http://localhost:3001
          Report results
          EOF
```

## Benefits vs Puppeteer

✅ **Uses real browser session** (logged in, with cookies)
✅ **No headless issues** (tests exactly what users see)
✅ **Natural language control** (no brittle selectors)
✅ **Visual verification** (screenshots + GIFs)
✅ **Console monitoring** (catches runtime errors)
✅ **Flexible execution** (can adapt to UI changes)
✅ **No test infrastructure** (no Jest, no test files)

## Security Note

From [Anthropic's blog](https://claude.com/blog/claude-for-chrome):
- Attack success rate: ~11% (1 in 9) even with defenses
- Be cautious with untrusted websites during testing
- Prompt injection risks exist on malicious sites

## Sources

- [Claude Code with Chrome (beta)](https://code.claude.com/docs/en/chrome)
- [Getting Started with Claude in Chrome](https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome)
- [Claude for Chrome Complete Guide (2026)](https://almcorp.com/blog/claude-for-chrome-complete-guide/)
- [DataCamp - Claude for Chrome Tutorial](https://www.datacamp.com/tutorial/claude-for-chrome-ai-powered-browser-assistance-automation)
- [Medium - Claude Code Browser Feature](https://medium.com/@joe.njenga/i-tested-new-claude-code-browser-feature-claude-code-can-now-control-your-browser-d526024c033b)
