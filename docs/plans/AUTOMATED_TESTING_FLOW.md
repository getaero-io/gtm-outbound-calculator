# Automated Testing Flow - Claude for Chrome

## Overview

Automated testing using Claude for Chrome to interact with the live application at http://localhost:3001 (or production URL). Uses the user's logged-in browser session for realistic testing.

## Prerequisites

- Claude for Chrome extension installed
- Dev server running: `npm run dev` (or production URL)
- Browser open to the calculator URL

## Testing Architecture

### Strategy
- **Tool**: Claude for Chrome with Puppeteer MCP integration
- **Browser**: User's logged-in Chrome session (not headless)
- **Scope**: Full UI interaction testing, calculation verification, visual regression
- **Reports**: Screenshot-based test results with pass/fail status

## Test Suites

### Suite 1: Waterfall Builder UI Tests

**Test 1.1: Create Email Finding Waterfall**
```
1. Navigate to http://localhost:3001
2. Scroll to "Waterfall Enrichment" section
3. Click "Add Waterfall" button
4. Verify waterfall card appears with category "email_finding"
5. Screenshot: waterfall-builder-empty.png
```

**Test 1.2: Add Provider Steps**
```
1. In the waterfall card, find dropdown "Add provider to sequence"
2. Select "Apollo" from dropdown
3. Verify Step 1 appears with Apollo name
4. Select "Hunter.io" from dropdown
5. Verify Step 2 appears with Hunter.io name
6. Screenshot: waterfall-two-steps.png
```

**Test 1.3: Adjust Coverage Rates**
```
1. Find Step 1 coverage rate input (default 60%)
2. Change value to 65
3. Verify input shows 65%
4. Find Step 2 coverage rate input
5. Change value to 50
6. Verify input shows 50%
7. Screenshot: waterfall-coverage-adjusted.png
```

**Test 1.4: Remove Step**
```
1. Click "×" button on Step 2 (Hunter)
2. Verify Step 2 is removed
3. Verify only Step 1 (Apollo) remains
4. Screenshot: waterfall-step-removed.png
```

**Test 1.5: Toggle Waterfall On/Off**
```
1. Click checkbox to disable waterfall
2. Verify checkbox is unchecked
3. Click checkbox to enable waterfall
4. Verify checkbox is checked
5. Screenshot: waterfall-toggled.png
```

**Test 1.6: Delete Waterfall**
```
1. Click "Remove" button on waterfall card
2. Verify waterfall card disappears
3. Verify empty state message appears
4. Screenshot: waterfall-deleted.png
```

---

### Suite 2: Waterfall Calculation Tests

**Test 2.1: Single-Step Waterfall Calculation**
```
Setup:
1. Set meetings needed: 10
2. Create email finding waterfall
3. Add Apollo (65% coverage)
4. Scroll to results section

Verify:
1. Waterfall Analysis section appears
2. Total Coverage shows ~65%
3. Total Cost calculated
4. Cost per Find calculated
5. Step breakdown shows Apollo with contacts processed
6. Screenshot: waterfall-single-step-results.png
```

**Test 2.2: Multi-Step Waterfall Calculation**
```
Setup:
1. Keep meetings needed: 10
2. Add Hunter.io to waterfall (50% coverage)
3. Add Prospeo (40% coverage)

Verify:
1. Total Coverage increases (should be ~82.5%)
2. Coverage formula: 65% + (35% × 50%) = 82.5%
3. Step breakdown shows 3 steps
4. Step 1 processes all contacts
5. Step 2 processes remaining from Step 1
6. Step 3 processes remaining from Step 2
7. Costs sum correctly across steps
8. Screenshot: waterfall-multi-step-results.png
```

**Test 2.3: Cost Accumulation**
```
Verify:
1. Find "Cost Breakdown" section
2. Verify "Waterfall Enrichment" category appears
3. Verify each step has separate cost line item
4. Verify step costs sum to waterfall total cost
5. Verify waterfall costs included in "Total Cost"
6. Screenshot: waterfall-cost-breakdown.png
```

---

### Suite 3: Visualization Tests

**Test 3.1: Waterfall Chart Rendering**
```
1. Scroll to Waterfall Analysis section
2. Verify Recharts BarChart renders
3. Verify chart shows "Processed" and "Found" bars
4. Verify X-axis shows step names
5. Verify Y-axis shows contact counts
6. Screenshot: waterfall-chart-rendered.png
```

**Test 3.2: Metrics Cards**
```
1. Verify "Total Coverage" card displays percentage
2. Verify "Total Cost" card displays dollar amount
3. Verify "Cost per Find" card displays cost
4. Verify all values are non-zero
5. Screenshot: waterfall-metrics-cards.png
```

**Test 3.3: Step Breakdown Details**
```
1. Verify step breakdown list shows all steps
2. Verify each step shows:
   - Step number (colored badge)
   - Provider name
   - Contacts processed count
   - Successful finds count
   - Coverage percentage
   - Cost
   - Cost per contact
3. Screenshot: waterfall-step-details.png
```

---

### Suite 4: Integration Tests

**Test 4.1: Waterfall + Infrastructure Settings**
```
Setup:
1. Create waterfall (Apollo → Hunter)
2. Change infrastructure preset to "Aggressive (50/day)"
3. Verify calculator recalculates

Verify:
1. Waterfall analysis updates
2. Infrastructure costs adjust
3. Total cost reflects both waterfall and infrastructure
4. No console errors
5. Screenshot: waterfall-infrastructure-integration.png
```

**Test 4.2: Waterfall + Headcount Tracking**
```
Setup:
1. Keep waterfall enabled
2. Enable "Headcount & SDR Costs"
3. Set SDR count: 2
4. Set SDR cost: $5000/month
5. Enable "Include headcount in total"

Verify:
1. Waterfall costs still calculated
2. Headcount costs added separately
3. Total cost includes both
4. Cost per meeting reflects headcount
5. Screenshot: waterfall-headcount-integration.png
```

**Test 4.3: Multiple Waterfalls**
```
Setup:
1. Create email finding waterfall (Apollo → Hunter)
2. Create phone finding waterfall (BetterContact → Lusha)

Verify:
1. Both waterfalls appear in builder
2. Both waterfalls have separate analysis sections
3. Both waterfall costs in breakdown
4. Total coverage calculated for each independently
5. Screenshot: multiple-waterfalls.png
```

**Test 4.4: Category Switching**
```
1. Create email finding waterfall
2. Change category dropdown to "Phone Finding"
3. Click "Add Waterfall"
4. Verify new waterfall is phone_finding category
5. Verify provider dropdown shows phone providers only
6. Screenshot: waterfall-category-switch.png
```

---

### Suite 5: Mobile Responsiveness

**Test 5.1: Mobile Viewport - Waterfall Builder**
```
1. Resize browser to 375px width (iPhone size)
2. Verify waterfall builder is readable
3. Verify buttons are tappable
4. Verify dropdowns work
5. Verify step cards stack vertically
6. Screenshot: mobile-waterfall-builder.png
```

**Test 5.2: Mobile Viewport - Waterfall Chart**
```
1. Keep mobile viewport (375px)
2. Scroll to Waterfall Analysis
3. Verify chart resizes responsively
4. Verify metrics cards stack vertically
5. Verify step breakdown is readable
6. Screenshot: mobile-waterfall-chart.png
```

---

## Implementation: Claude for Chrome Test Script

### Manual Test Execution (Give to Claude for Chrome)

```markdown
# Test Execution Script for Claude for Chrome

I need you to test the GTM Outbound Calculator at http://localhost:3001

## Test Suite 1: Waterfall Builder UI

Execute each test step-by-step, take screenshots at each checkpoint, and report pass/fail status.

### Test 1: Create and Configure Waterfall

**Steps:**
1. Navigate to http://localhost:3001
2. Take screenshot (name: 01-initial-page.png)
3. Scroll to "Waterfall Enrichment" section
4. Click "Add Waterfall" button
5. Take screenshot (name: 02-waterfall-created.png)
6. In the dropdown below the waterfall card, select "Apollo"
7. Take screenshot (name: 03-apollo-added.png)
8. In the same dropdown, select "Hunter.io"
9. Take screenshot (name: 04-hunter-added.png)
10. Find the coverage rate input for Step 1, change to 65
11. Find the coverage rate input for Step 2, change to 50
12. Take screenshot (name: 05-coverage-adjusted.png)
13. Scroll down to "Waterfall Analysis" section in results
14. Take screenshot (name: 06-waterfall-results.png)

**Expected Results:**
- Waterfall card appears with 2 steps
- Step 1 shows "Apollo" with 65% coverage
- Step 2 shows "Hunter.io" with 50% coverage
- Waterfall Analysis section shows:
  - Total Coverage: ~82.5% (65% + 35% × 50%)
  - BarChart with processed vs found contacts
  - Step breakdown with costs

**Report:**
- Status: [PASS/FAIL]
- Screenshots: [List all screenshot filenames]
- Issues: [Any problems encountered]

### Test 2: Multiple Waterfalls

**Steps:**
1. Change category dropdown to "Phone Finding"
2. Click "Add Waterfall"
3. Take screenshot (name: 07-phone-waterfall.png)
4. Add "BetterContact" to the new waterfall
5. Set coverage to 70%
6. Add "Lusha" to the same waterfall
7. Set coverage to 40%
8. Take screenshot (name: 08-two-waterfalls.png)
9. Scroll to results
10. Take screenshot (name: 09-multiple-waterfall-results.png)

**Expected Results:**
- Two separate waterfall cards visible
- Each has its own Waterfall Analysis section
- Cost breakdown includes both waterfalls
- No console errors

**Report:**
- Status: [PASS/FAIL]
- Screenshots: [List all screenshot filenames]
- Issues: [Any problems encountered]

### Test 3: Integration with Infrastructure

**Steps:**
1. Scroll to "Email Infrastructure Settings"
2. Click "Aggressive (50/day)" preset button
3. Take screenshot (name: 10-infrastructure-preset.png)
4. Verify results recalculate
5. Scroll to Cost Breakdown
6. Take screenshot (name: 11-cost-breakdown.png)
7. Verify waterfall costs and infrastructure costs both appear

**Expected Results:**
- Infrastructure preset applies (1100 emails/inbox/month)
- Waterfall analysis updates
- Cost breakdown shows separate line items for waterfall and infrastructure
- Total cost includes both

**Report:**
- Status: [PASS/FAIL]
- Screenshots: [List all screenshot filenames]
- Issues: [Any problems encountered]

### Test 4: Calculation Accuracy

**Steps:**
1. Note down from results:
   - Total contacts to enrich
   - Waterfall Total Coverage %
   - Waterfall Total Cost
2. Manually calculate:
   - Step 1 finds: contacts × 0.65
   - Step 2 processes: contacts - step1_finds
   - Step 2 finds: step2_processes × 0.50
   - Total found: step1_finds + step2_finds
   - Expected coverage: total_found / contacts
3. Compare manual calculation to displayed results
4. Take screenshot (name: 12-calculation-verification.png)

**Expected Results:**
- Manual calculation matches displayed coverage (±1% due to rounding)
- Cost calculations are reasonable
- No negative numbers or NaN values

**Report:**
- Status: [PASS/FAIL]
- Manual calculation: [Show your work]
- Displayed results: [From screenshot]
- Match: [YES/NO]
- Issues: [Any discrepancies]

### Test 5: Mobile Responsiveness

**Steps:**
1. Open Chrome DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" from device dropdown
4. Refresh page
5. Take screenshot (name: 13-mobile-initial.png)
6. Scroll to Waterfall Enrichment section
7. Take screenshot (name: 14-mobile-waterfall-builder.png)
8. Scroll to Waterfall Analysis
9. Take screenshot (name: 15-mobile-waterfall-chart.png)

**Expected Results:**
- All elements visible and readable on mobile
- Buttons are tappable (not too small)
- Charts resize to fit screen
- No horizontal scrolling required
- Text is legible (not too small)

**Report:**
- Status: [PASS/FAIL]
- Screenshots: [List all screenshot filenames]
- Issues: [Any layout problems]

## Final Report Format

After completing all tests, provide:

### Summary
- Total tests: 5
- Passed: X
- Failed: Y
- Pass rate: Z%

### Screenshots
[Attach all 15+ screenshots]

### Issues Found
[List all bugs, layout problems, calculation errors]

### Recommendations
[Suggest fixes for any issues found]

### Overall Status
[READY FOR DEPLOYMENT / NEEDS FIXES]
```

---

## Automated Puppeteer Script (Alternative)

For fully automated testing with Puppeteer MCP:

```javascript
// test-waterfall.js
// Run with Claude for Chrome using Puppeteer MCP

async function testWaterfallFeature() {
  // Navigate
  await navigate("http://localhost:3001");
  await takeScreenshot("01-initial-page");

  // Add waterfall
  await click("button:has-text('Add Waterfall')");
  await takeScreenshot("02-waterfall-created");

  // Add Apollo
  await select("select", "apollo");
  await takeScreenshot("03-apollo-added");

  // Add Hunter
  await select("select", "hunter");
  await takeScreenshot("04-hunter-added");

  // Adjust coverage
  await fill("input[type='number']:nth(0)", "65");
  await fill("input[type='number']:nth(1)", "50");
  await takeScreenshot("05-coverage-adjusted");

  // Verify results
  const coverageText = await evaluate(() => {
    return document.querySelector('[data-testid="total-coverage"]')?.textContent;
  });

  console.log("Total Coverage:", coverageText);
  await takeScreenshot("06-waterfall-results");

  // Verify calculation
  const expected = 0.65 + (0.35 * 0.50);
  const actual = parseFloat(coverageText) / 100;

  if (Math.abs(expected - actual) < 0.01) {
    console.log("✅ Calculation PASS");
  } else {
    console.log("❌ Calculation FAIL", { expected, actual });
  }
}
```

---

## Test Data Templates

### Test Case 1: Email Finding Waterfall
```json
{
  "meetings_needed": 10,
  "waterfall": {
    "category": "email_finding",
    "steps": [
      { "provider": "apollo", "coverage": 0.65 },
      { "provider": "hunter", "coverage": 0.50 },
      { "provider": "prospeo", "coverage": 0.40 }
    ]
  },
  "expected_coverage": 0.895,
  "expected_steps": 3
}
```

### Test Case 2: Phone Finding Waterfall
```json
{
  "meetings_needed": 25,
  "waterfall": {
    "category": "phone_finding",
    "steps": [
      { "provider": "bettercontact", "coverage": 0.70 },
      { "provider": "lusha", "coverage": 0.40 }
    ]
  },
  "expected_coverage": 0.82,
  "expected_steps": 2
}
```

---

## Continuous Testing Strategy

### For Each PR/Deployment:

1. **Pre-deployment checks:**
   - Run build: `npm run build`
   - No TypeScript errors
   - No console warnings

2. **Manual testing with Claude for Chrome:**
   - Give Claude the test script above
   - Review screenshots
   - Verify calculations
   - Check mobile responsiveness

3. **Production smoke test:**
   - Test on live URL (gtm-outbound-calculator.vercel.app)
   - Verify waterfall builder works
   - Verify calculations match dev environment
   - Check for console errors in production

4. **Regression testing:**
   - Verify existing features still work:
     - Provider selection
     - Infrastructure settings
     - Headcount tracking
     - Cost breakdown
   - Ensure waterfalls don't break old functionality

---

## Next Steps

1. **Immediate:** Run Suite 1 (Waterfall Builder UI) using Claude for Chrome
2. **If Suite 1 passes:** Run Suite 2 (Calculations)
3. **If Suite 2 passes:** Run Suite 3 (Visualizations)
4. **If all pass:** Deploy to production
5. **Post-deployment:** Run production smoke test

**Ready to execute?** Copy the "Test Execution Script for Claude for Chrome" section above and give it to Claude for Chrome to run the tests.
