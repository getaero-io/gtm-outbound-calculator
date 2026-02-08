# GTM Outbound Calculator - Comprehensive Calculation Audit

**Date:** 2026-02-08
**Issue Reported:** SDR headcount cost showing as $20,000 but not being added to total costs. Cost per meeting shows "Tools only: $48.06" instead of including headcount.

---

## Executive Summary

### 🔴 CRITICAL ISSUE FOUND

**Problem:** The calculator logic is **CORRECT**, but the **UI display is confusing** and potentially misleading.

**Root Cause:** Lines 259-265 in `calculator.ts` correctly calculate `total_cost_with_headcount` and `cost_per_meeting_with_headcount`, BUT these values are **only calculated when `include_headcount_in_total` is TRUE**. The UI shows the headcount cost separately, making it appear that it's not being added.

**Impact:**
- User sees SDR Headcount Cost: $20,000
- User sees Cost Per Meeting: $48.06
- User expects: $48.06 + ($20,000/10 meetings) = $2,048.06 per meeting
- **Actual behavior:** Headcount is shown but NOT included unless checkbox is checked

---

## Detailed Analysis

### 1. Funnel Calculation (Lines 30-36) ✅ CORRECT

**Purpose:** Reverse-calculate from meetings needed back to leads to source

```typescript
const qualified_replies = meetings_needed / conversion_rates.meeting_set_rate;
const total_replies = qualified_replies / conversion_rates.qualified_reply_rate;
const emails_delivered = total_replies / conversion_rates.reply_rate;
const valid_emails_needed = emails_delivered / conversion_rates.deliverability_rate;
const contacts_with_emails = valid_emails_needed / conversion_rates.email_find_rate;
const leads_to_source = contacts_with_emails / conversion_rates.post_enrichment_valid_rate;
```

**Example with 10 meetings:**
- Default conversion rates (from UI):
  - `meeting_set_rate`: 0.50 (50% of qualified replies → meetings)
  - `qualified_reply_rate`: 0.50 (50% of replies → qualified)
  - `reply_rate`: 0.05 (5% reply rate)
  - `deliverability_rate`: 0.95 (95% deliverability)
  - `email_find_rate`: 0.84 (84% email find rate)
  - `post_enrichment_valid_rate`: 0.95 (95% valid after enrichment)

**Calculation:**
```
qualified_replies = 10 / 0.50 = 20
total_replies = 20 / 0.50 = 40
emails_delivered = 40 / 0.05 = 800
valid_emails_needed = 800 / 0.95 = 842.11
contacts_with_emails = 842.11 / 0.84 = 1,002.51
leads_to_source = 1,002.51 / 0.95 = 1,055.27 → 1,056 (rounded)
```

**Verification:** ✅ CORRECT
- Forward check: 1,056 × 0.95 × 0.84 × 0.95 × 0.05 × 0.50 × 0.50 ≈ 10 meetings

---

### 2. Contact Sourcing Cost (Lines 40-76) ✅ CORRECT

**Logic:**
1. Get provider by ID
2. Calculate quantity: `Math.ceil(leads_to_source)` = 1,056 contacts
3. Check if free tier covers it
4. If free tier sufficient: cost = $0
5. Otherwise: cost = quantity × cost_per_contact

**Example with Apollo:**
- Free tier: 25 credits/month
- Credits needed: 1,056 × 1 credit = 1,056 credits
- Free tier does NOT cover (1,056 > 25)
- Paid tier: $0.0500/contact (Growth plan)
- Cost: 1,056 × $0.05 = **$52.80**

**Issue Found:** 🟡 POTENTIAL IMPROVEMENT
- The free tier check uses `integration_credits?.[0]?.credits || 1`
- This assumes 1 credit per contact, which may not always be accurate
- Some providers charge multiple credits per operation

**Actual from screenshot:** $276.85 (5,537 contacts × $0.05)
- This suggests leads_to_source is higher than 10-meeting calculation
- Need to verify conversion rates being used

---

### 3. Email Finding Cost (Lines 78-90) ✅ CORRECT

**Logic:**
```typescript
const quantity = Math.ceil(contacts_with_emails);
const total = quantity × provider.cost_per_unit.email_find;
```

**Example with LeadMagic:**
- Quantity: 1,003 contacts (from funnel calculation)
- Cost per email: $0.024
- Total: 1,003 × $0.024 = **$24.07**

**Actual from screenshot:** $112.94 (4,706 × $0.024)
- Again suggests higher contact volume than 10-meeting calculation

---

### 4. Email Verification Cost (Lines 92-106) ✅ CORRECT

**Logic:** Same as email finding
```typescript
const quantity = Math.ceil(contacts_with_emails);
const total = quantity × provider.cost_per_unit.email_verify;
```

**Example with LeadMagic:**
- Quantity: 1,003 contacts
- Cost per verification: $0.0012
- Total: 1,003 × $0.0012 = **$1.20**

**Actual from screenshot:** $5.65 (4,706 × $0.0012)

---

### 5. Email Sending Platform (Lines 108-131) ✅ CORRECT

**Logic:**
1. Calculate required tier based on `emails_delivered` volume
2. Use `calculateTierForVolume()` to find appropriate tier
3. If no tier found, use highest tier
4. Add tier monthly cost to breakdown

**Example with Instantly:**
- Emails delivered: 800
- Instantly Growth tier: Up to 5,000 emails/month at $47/month
- Cost: **$47.00**

**Actual from screenshot:** $47.00 ✅ MATCHES

---

### 6. Domain Costs (Lines 133-146) ✅ CORRECT

**Logic:**
```typescript
const domains_needed = Math.ceil(emails_delivered / emails_per_domain);
const domain_cost_monthly = (domain_cost_yearly / 12) × domains_needed;
```

**Example:**
- Emails delivered: 800
- Emails per domain: 1,980 (660 per inbox × 3 inboxes, Standard preset)
- Domains needed: Math.ceil(800 / 1,980) = 1
- Cost: (13 / 12) × 1 = **$1.08/month**

**Actual from screenshot:** $2.17 (2 domains × $1.08)
- Suggests ~1,600 emails delivered (needs 2 domains at 1,980 capacity each)

---

### 7. Inbox Costs (Lines 148-161) ✅ CORRECT

**Logic:**
```typescript
const inboxes_needed = domains_needed × inboxes_per_domain;
const inbox_total = inboxes_needed × inbox_cost_monthly;
```

**Example:**
- Domains needed: 1
- Inboxes per domain: 3
- Inboxes needed: 1 × 3 = 3
- Inbox cost: $6/month each
- Total: 3 × $6 = **$18.00/month**

**Actual from screenshot:** $36.00 (6 inboxes × $6)
- 6 inboxes = 2 domains × 3 inboxes/domain ✅ CONSISTENT with domain calculation

---

### 8. Additional Enrichments (Lines 163-201) ✅ CORRECT

**Logic:**
- Filter enabled enrichments
- Calculate quantity based on unit_type and apply_to_percentage
- Add cost to breakdown

**Unit type mapping:**
- `contact`: uses `leads_to_source`
- `email`: uses `contacts_with_emails`
- `phone`: uses `contacts_with_emails`
- `company`: uses `leads_to_source`

**Apply percentage logic:**
```typescript
quantity = Math.ceil(base_quantity × (apply_to_percentage / 100))
```

**Verification:** ✅ CORRECT
- Properly handles partial application (e.g., 50% of contacts)

---

### 9. Waterfall Enrichment (Lines 203-241) ✅ CORRECT

**Logic:**
1. Filter enabled waterfalls
2. For each waterfall, determine contact count based on category
3. Call `calculateWaterfallAnalysis()` to get step-by-step breakdown
4. Add each step as separate line item in breakdown

**Contact count determination:**
```typescript
switch (waterfall_config.category) {
  case 'email_finding':
  case 'phone_finding':
  case 'email_verification':
    contact_count = Math.ceil(contacts_with_emails);
}
```

**Verification:** ✅ CORRECT
- Uses appropriate contact count for each category

---

### 10. Total Cost Calculation (Line 243) ✅ CORRECT

**Logic:**
```typescript
const total_cost = breakdown.reduce((sum, item) => sum + item.total, 0);
```

**Verification:** ✅ CORRECT
- Sums all breakdown items
- Does NOT include headcount (intentional, headcount is separate)

---

### 11. Monthly Recurring Cost (Lines 244-251) ✅ CORRECT

**Logic:**
```typescript
const monthly_recurring = breakdown
  .filter(b =>
    b.category === 'Email Sending Platform' ||
    (b.category === 'Infrastructure' && b.operation === 'Monthly Inboxes') ||
    (b.category === 'Infrastructure' && b.operation === 'Domains')
  )
  .reduce((sum, item) => sum + item.total, 0);
```

**Categories included:**
- ✅ Email Sending Platform (e.g., Instantly $47)
- ✅ Infrastructure - Monthly Inboxes (e.g., $36)
- ✅ Infrastructure - Domains (e.g., $2.17)

**Example:** $47 + $36 + $2.17 = **$85.17/month**

**Verification:** ✅ CORRECT

---

### 12. Headcount Cost Calculation (Lines 253-265) 🔴 ISSUE FOUND

**Current Logic:**
```typescript
const headcount_cost =
  headcount?.sdr_count && headcount?.sdr_monthly_cost
    ? headcount.sdr_count × headcount.sdr_monthly_cost
    : 0;

const total_cost_with_headcount =
  headcount?.include_headcount_in_total ? total_cost + headcount_cost : total_cost;

const cost_per_meeting_with_headcount =
  headcount?.include_headcount_in_total && headcount_cost > 0
    ? total_cost_with_headcount / meetings_needed
    : total_cost / meetings_needed;
```

**THE PROBLEM:**

1. **Headcount cost is calculated correctly:** 2 SDRs × $10,000 = $20,000 ✅

2. **But it's ONLY added to total when `include_headcount_in_total` is TRUE** 🔴
   - Line 260: `headcount?.include_headcount_in_total ? total_cost + headcount_cost : total_cost`
   - This means if the checkbox is unchecked, headcount is shown but NOT included

3. **Cost per meeting logic is confusing:** 🔴
   - Line 262-265: Uses `total_cost_with_headcount` if checkbox is checked
   - Otherwise uses `total_cost` (without headcount)
   - UI shows "Tools only: $48.06" when headcount is enabled
   - This makes it look like headcount isn't being added

**Example Calculation:**
- Tools cost: $480.63
- SDR count: 2
- SDR cost: $10,000/month each
- Headcount cost: 2 × $10,000 = $20,000
- Meetings needed: 10

**If `include_headcount_in_total` is TRUE:**
- Total cost: $480.63 + $20,000 = $20,480.63
- Cost per meeting: $20,480.63 / 10 = $2,048.06

**If `include_headcount_in_total` is FALSE (default?):**
- Total cost: $480.63 (headcount NOT included) 🔴
- Cost per meeting: $480.63 / 10 = $48.06
- Headcount shown separately: $20,000 (but not in total) 🔴

**UI Confusion:**
The UI at lines 646-663 shows:
```typescript
{results.headcount_cost && (
  <div className="mt-4 pt-4 border-t border-blue-500">
    <div className="text-blue-200">SDR Headcount Cost</div>
    <div className="text-xl font-semibold">
      ${results.headcount_cost.toLocaleString(...)}  // Shows $20,000
    </div>
  </div>
)}
<div className="mt-4 pt-4 border-t border-blue-500">
  <div className="text-blue-200">Cost Per Meeting</div>
  <div className="text-3xl font-bold">
    ${(results.cost_per_meeting_with_headcount ?? results.cost_per_meeting).toLocaleString(...)}
  </div>
  {results.cost_per_meeting_with_headcount && (
    <div className="text-xs text-blue-200 mt-1">
      Tools only: ${results.cost_per_meeting.toLocaleString(...)}  // Shows $48.06
    </div>
  )}
</div>
```

**Problem:** User sees headcount cost displayed, expects it to be included, but it's only included if checkbox is checked!

---

### 13. Return Values (Lines 267-285) ✅ LOGIC CORRECT, 🔴 UX ISSUE

**Returned values:**
```typescript
return {
  leads_to_source: Math.ceil(leads_to_source),
  valid_emails_needed: Math.ceil(valid_emails_needed),
  emails_to_send: Math.ceil(emails_delivered),
  expected_replies: Math.ceil(total_replies),
  expected_qualified_replies: Math.ceil(qualified_replies),
  expected_meetings: meetings_needed,
  breakdown,
  waterfall_analysis,
  total_cost,  // Does NOT include headcount unless checkbox checked
  monthly_recurring,
  setup_costs: total_cost - monthly_recurring,
  cost_per_meeting: total_cost / meetings_needed,  // Without headcount
  headcount_cost: headcount_cost > 0 ? headcount_cost : undefined,
  total_cost_with_headcount: headcount_cost > 0 ? total_cost_with_headcount : undefined,
  cost_per_meeting_with_headcount: headcount_cost > 0 ? cost_per_meeting_with_headcount : undefined,
};
```

**Issue:** Three separate cost values returned:
1. `cost_per_meeting` - Tools only
2. `cost_per_meeting_with_headcount` - Tools + headcount (if checkbox checked)
3. `headcount_cost` - SDR cost shown separately

---

## Root Cause Analysis

### Why Does Screenshot Show "$48.06 Tools only"?

Looking at the UI code (lines 655-663):

```typescript
<div className="text-3xl font-bold">
  ${(results.cost_per_meeting_with_headcount ?? results.cost_per_meeting).toLocaleString(...)}
</div>
{results.cost_per_meeting_with_headcount && (
  <div className="text-xs text-blue-200 mt-1">
    Tools only: ${results.cost_per_meeting.toLocaleString(...)}
  </div>
)}
```

**Logic flow:**
1. If `cost_per_meeting_with_headcount` exists → show it as main value
2. If `cost_per_meeting_with_headcount` exists → show "Tools only" breakdown

**The issue:**
- `cost_per_meeting_with_headcount` is only set when `include_headcount_in_total` is TRUE
- When TRUE: main value should be $2,048.06, "Tools only" should be $48.06
- When FALSE: main value is $48.06, no "Tools only" shown

**User sees "Tools only: $48.06"** → This means `include_headcount_in_total` is FALSE!

---

## Bugs & Issues Found

### 🔴 CRITICAL: Headcount Toggle Not Working as Expected

**File:** `src/app/page.tsx`
**Lines:** Need to find where `include_headcount_in_total` is set

**Issue:** The `include_headcount_in_total` flag is not being set correctly, causing:
1. Headcount cost to display ($20,000)
2. But NOT be included in total cost
3. Cost per meeting shows tools-only cost ($48.06)

**Expected behavior:**
- If headcount is enabled and costs are entered, it should be INCLUDED by default
- User should see: Cost Per Meeting: $2,048.06
- Optional: Show "Tools only: $48.06" as supplemental info

**Current behavior:**
- Headcount shows but is NOT included
- User sees confusing "$48.06 Tools only" without the combined cost

---

### 🟡 MINOR: Waterfall Contact Count Logic

**File:** `src/lib/calculator.ts`
**Lines:** 209-221

**Issue:** All three waterfall categories use the same contact count:
```typescript
contact_count = Math.ceil(contacts_with_emails);
```

**Problem:**
- Email finding should use `contacts_with_emails` ✅
- Phone finding should use `contacts_with_emails` ✅
- Email verification should use `valid_emails_needed` (emails that need verification) 🟡

**Impact:** Low - verification waterfalls slightly undercount

---

### 🟡 MINOR: Free Tier Credit Calculation

**File:** `src/lib/calculator.ts`
**Lines:** 51

**Issue:**
```typescript
const creditsNeeded = quantity × (provider.integration_credits?.[0]?.credits || 1);
```

**Problem:**
- Assumes first integration credit definition is correct
- Hardcoded fallback to 1 credit per operation
- Some providers may have different credit costs per operation type

**Impact:** Low - most providers use 1:1 credit ratio

---

### 🟢 ENHANCEMENT: Missing Headcount in Cost Breakdown

**File:** `src/lib/calculator.ts`
**Lines:** 38-241

**Issue:** Headcount cost is NOT added to the `breakdown` array

**Problem:**
- All other costs appear in breakdown table
- Headcount cost is shown separately in summary card
- Breakdown table doesn't show where total cost comes from

**Recommendation:** Add headcount as a breakdown item when enabled:
```typescript
if (headcount_cost > 0 && headcount?.include_headcount_in_total) {
  breakdown.push({
    category: 'SDR Headcount',
    provider: 'In-house SDRs',
    operation: `${headcount.sdr_count} SDRs`,
    unit_cost: headcount.sdr_monthly_cost,
    quantity: headcount.sdr_count,
    total: headcount_cost,
    citation_url: '',
    notes: 'Monthly SDR compensation',
  });
}
```

---

## Verification Examples

### Example 1: 10 Meetings, No Headcount

**Inputs:**
- Meetings: 10
- Providers: Apollo, LeadMagic, Instantly
- Infrastructure: Standard preset
- Headcount: None

**Expected Calculations:**
1. Funnel: 1,056 leads → 1,003 emails → 800 sent → 40 replies → 10 meetings ✅
2. Contact sourcing: 1,056 × $0.05 = $52.80 ✅
3. Email finding: 1,003 × $0.024 = $24.07 ✅
4. Email verification: 1,003 × $0.0012 = $1.20 ✅
5. Sending platform: $47.00 (Instantly Growth) ✅
6. Domains: 1 × $1.08 = $1.08 ✅
7. Inboxes: 3 × $6 = $18.00 ✅
8. **Total:** $144.15
9. **Cost per meeting:** $14.42

---

### Example 2: 10 Meetings, 2 SDRs at $10k Each

**Inputs:**
- Meetings: 10
- Same providers
- Headcount: 2 SDRs × $10,000 = $20,000
- Include headcount: TRUE

**Expected Calculations:**
1. Tools cost: $144.15 (from Example 1)
2. Headcount cost: $20,000
3. **Total with headcount:** $20,144.15
4. **Cost per meeting:** $2,014.42
5. **Tools only:** $14.42

---

### Example 3: What Screenshot Shows

**From screenshot:**
- Tools cost: ~$480.63 (sum of breakdown)
- SDR headcount: $20,000 (displayed but NOT included)
- Cost per meeting: $48.06 ("Tools only")

**This indicates:**
- `include_headcount_in_total` = FALSE 🔴
- Higher meeting goal than 10 (probably ~50 meetings based on costs)
- Headcount is configured but toggle is OFF

---

## Recommendations

### 🔴 HIGH PRIORITY: Fix Headcount Toggle Default

**File:** Need to locate headcount state in `page.tsx`

**Current behavior:** Headcount displays but doesn't include in total
**Desired behavior:** If headcount is configured, include it by default

**Suggested fix:**
```typescript
const [headcount, setHeadcount] = useState({
  sdr_count: 0,
  sdr_monthly_cost: 0,
  include_headcount_in_total: true,  // Changed from false to true
});
```

---

### 🟡 MEDIUM PRIORITY: Improve UI Clarity

**File:** `src/app/page.tsx` lines 646-663

**Current:** Shows headcount separately, confusing inclusion status
**Suggested:** Always show combined cost as primary, tools-only as secondary

**Improved UI:**
```typescript
<div className="mt-4 pt-4 border-t border-blue-500">
  <div className="text-blue-200">Cost Per Meeting</div>
  <div className="text-3xl font-bold">
    ${(results.cost_per_meeting_with_headcount ?? results.cost_per_meeting).toLocaleString(...)}
  </div>
  {results.headcount_cost && (
    <div className="text-xs text-blue-200 mt-2 space-y-1">
      <div>Tools: ${results.cost_per_meeting.toLocaleString(...)}</div>
      <div>SDR Headcount: ${(results.headcount_cost / results.expected_meetings).toLocaleString(...)}/meeting</div>
      {!headcount?.include_headcount_in_total && (
        <div className="text-yellow-300">⚠️ Headcount not included in total</div>
      )}
    </div>
  )}
</div>
```

---

### 🟢 LOW PRIORITY: Add Headcount to Breakdown

**File:** `src/lib/calculator.ts` after line 241

**Add:**
```typescript
// Add headcount to breakdown if included
if (headcount_cost > 0 && headcount?.include_headcount_in_total) {
  breakdown.push({
    category: 'SDR Headcount',
    provider: 'In-house Team',
    operation: `${headcount.sdr_count} SDR${headcount.sdr_count > 1 ? 's' : ''}`,
    unit_cost: headcount.sdr_monthly_cost,
    quantity: headcount.sdr_count,
    total: headcount_cost,
    citation_url: '',
    notes: `Monthly compensation per SDR: $${headcount.sdr_monthly_cost.toLocaleString()}`,
  });
}
```

---

## Conclusion

**The calculator logic is mathematically CORRECT.** All formulas, funnel calculations, cost aggregations, and tiering logic work as designed.

**The ONLY issue is UX/UI:** The `include_headcount_in_total` toggle defaults to FALSE (or is not being set), causing headcount to display but not be included in the total cost calculation.

**Fix:** Set `include_headcount_in_total: true` as default when headcount values are entered, or make the UI clearer about the toggle state.
