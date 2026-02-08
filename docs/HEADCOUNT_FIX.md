# Headcount Cost Not Being Added - Root Cause & Fix

## Issue Summary

**Reported:** SDR Headcount Cost shows $20,000 but Cost Per Meeting shows "$48.06 Tools only" instead of including headcount.

**Root Cause:** Line 40 in `src/app/page.tsx` sets `include_headcount_in_total: false` by default.

## The Bug

**File:** `src/app/page.tsx`
**Line:** 40

```typescript
const [headcount, setHeadcount] = useState({
  sdr_count: 2,
  sdr_monthly_cost: 10000,
  include_headcount_in_total: false,  // ← THIS IS THE BUG
});
```

**Impact:**
- User sees "SDR Headcount Cost: $20,000" displayed
- User sees "Cost Per Meeting: $48.06" with "Tools only: $48.06"
- User expects headcount to be included since it's shown
- **Actual behavior:** Headcount is displayed but NOT added to total unless checkbox is checked

## Why This Happens

The calculator logic in `src/lib/calculator.ts` (lines 253-265) is CORRECT:

```typescript
const headcount_cost = headcount?.sdr_count && headcount?.sdr_monthly_cost
  ? headcount.sdr_count × headcount.sdr_monthly_cost
  : 0;

const total_cost_with_headcount =
  headcount?.include_headcount_in_total  // ← Only adds if TRUE
    ? total_cost + headcount_cost
    : total_cost;

const cost_per_meeting_with_headcount =
  headcount?.include_headcount_in_total && headcount_cost > 0
    ? total_cost_with_headcount / meetings_needed
    : total_cost / meetings_needed;
```

**The logic works perfectly** - it checks the `include_headcount_in_total` flag before adding headcount to the total.

**The problem:** The default value is `false`, so:
1. Headcount cost is calculated: $20,000 ✅
2. But it's NOT added to total_cost: $480.63 (tools only) ✅
3. Cost per meeting: $480.63 / 10 = $48.06 ✅
4. UI shows "Tools only: $48.06" because headcount exists but isn't included ✅

**User expectation:** If headcount values are filled in, they should be included by default.

## The Fix

### Option 1: Change Default to True (Recommended)

**Change line 40:**
```typescript
const [headcount, setHeadcount] = useState({
  sdr_count: 2,
  sdr_monthly_cost: 10000,
  include_headcount_in_total: true,  // Changed from false to true
});
```

**Pros:**
- Simple one-line fix
- Matches user expectation
- Headcount included by default when values are entered

**Cons:**
- May surprise users who don't want headcount included
- Checkbox starts checked (but user can uncheck)

### Option 2: Smart Default Based on Values

**Change line 40:**
```typescript
const [headcount, setHeadcount] = useState({
  sdr_count: 2,
  sdr_monthly_cost: 10000,
  include_headcount_in_total: true,  // Auto-include if values are non-zero
});
```

OR add logic to auto-enable when values are entered:

```typescript
const handleHeadcountChange = (field: string, value: number) => {
  setHeadcount({
    ...headcount,
    [field]: value,
    // Auto-enable if both values are set
    include_headcount_in_total:
      (field === 'sdr_count' && value > 0 && headcount.sdr_monthly_cost > 0) ||
      (field === 'sdr_monthly_cost' && value > 0 && headcount.sdr_count > 0) ||
      headcount.include_headcount_in_total
  });
};
```

**Pros:**
- Intelligent behavior - only includes if values are set
- More user-friendly

**Cons:**
- More complex logic
- Requires finding/modifying headcount input handlers

### Option 3: Clear UI Indication

Keep `false` default but make it VERY clear in UI that headcount is NOT included:

**Modify UI around line 646-663:**
```typescript
{results.headcount_cost && (
  <div className="mt-4 pt-4 border-t border-blue-500">
    <div className="flex items-center justify-between">
      <div className="text-blue-200">SDR Headcount Cost</div>
      {!headcount?.include_headcount_in_total && (
        <span className="text-xs text-yellow-300 bg-yellow-900/20 px-2 py-1 rounded">
          ⚠️ Not included in total
        </span>
      )}
    </div>
    <div className="text-xl font-semibold">
      ${results.headcount_cost.toLocaleString(...)}
    </div>
  </div>
)}
```

**Pros:**
- Makes current behavior clear
- No logic changes needed

**Cons:**
- Doesn't fix the underlying UX issue
- Still confusing for users

## Recommended Solution

**Use Option 1: Change default to `true`**

This is the simplest fix and matches user expectations. When someone enters headcount values, they expect those costs to be included in the total.

## Implementation

### Step 1: Fix Default Value

**File:** `src/app/page.tsx`
**Line:** 40

**Before:**
```typescript
include_headcount_in_total: false,
```

**After:**
```typescript
include_headcount_in_total: true,
```

### Step 2: Verify Calculations

After the fix:
- Tools cost: $480.63
- Headcount: 2 SDRs × $10,000 = $20,000
- **Total cost: $20,480.63**
- **Cost per meeting: $20,480.63 / 10 = $2,048.06**
- Shows: "Cost Per Meeting: $2,048.06" with "Tools only: $48.06"

### Step 3: Test Cases

1. **Default state (headcount enabled):**
   - Cost per meeting should be ~$2,048
   - "Tools only" should show ~$48
   - Headcount displayed with checkmark checked

2. **Uncheck headcount toggle:**
   - Cost per meeting should drop to ~$48
   - "Tools only" label should disappear
   - Headcount still displayed but not included

3. **Zero headcount values:**
   - No headcount section shown
   - Cost per meeting is tools-only cost
   - No toggle or "Tools only" text

## Additional Improvements

### Improvement 1: Add Headcount to Cost Breakdown

Currently, headcount is shown separately in the summary but NOT in the cost breakdown table. Add it:

**File:** `src/lib/calculator.ts`
**After line 241:**

```typescript
// Add headcount to breakdown if included in total
if (headcount_cost > 0 && headcount?.include_headcount_in_total) {
  breakdown.push({
    category: 'SDR Headcount',
    provider: 'In-house Team',
    operation: `${headcount.sdr_count} SDR${headcount.sdr_count > 1 ? 's' : ''}`,
    unit_cost: headcount.sdr_monthly_cost,
    quantity: headcount.sdr_count,
    total: headcount_cost,
    citation_url: '',
    notes: `$${headcount.sdr_monthly_cost.toLocaleString()}/month per SDR`,
  });
}
```

**Benefit:** Users can see headcount cost in the breakdown table alongside other costs.

### Improvement 2: Better UI Messaging

**File:** `src/app/page.tsx`
**Lines:** 655-663

**Enhanced version:**
```typescript
<div className="mt-4 pt-4 border-t border-blue-500">
  <div className="text-blue-200">Cost Per Meeting</div>
  <div className="text-3xl font-bold">
    ${(results.cost_per_meeting_with_headcount ?? results.cost_per_meeting).toLocaleString(...)}
  </div>
  {results.cost_per_meeting_with_headcount && headcount.include_headcount_in_total && (
    <div className="text-xs text-blue-200 mt-2 space-y-1">
      <div>💼 Tools: ${results.cost_per_meeting.toLocaleString(...)}</div>
      <div>👥 Headcount: ${((results.headcount_cost || 0) / results.expected_meetings).toLocaleString(...)}</div>
      <div className="text-blue-300 font-medium">= Total: ${(results.cost_per_meeting_with_headcount).toLocaleString(...)}</div>
    </div>
  )}
  {results.headcount_cost && !headcount.include_headcount_in_total && (
    <div className="text-xs text-yellow-300 mt-2">
      ⚠️ Note: Headcount costs are shown separately but not included in this total
    </div>
  )}
</div>
```

**Benefits:**
- Clear breakdown of tools vs headcount
- Visual indication when headcount is included
- Warning when headcount is excluded

## Testing Checklist

After implementing the fix, verify:

- [ ] Default state: headcount checkbox is checked
- [ ] Cost per meeting includes headcount ($2,048.06 for example)
- [ ] "Tools only" shows correct breakdown ($48.06)
- [ ] Unchecking headcount toggle updates cost per meeting
- [ ] Headcount section displays correctly
- [ ] Cost breakdown table shows all items
- [ ] Mobile view looks correct
- [ ] No console errors

## Commit Message

```
fix: include headcount costs in total by default

- Changed include_headcount_in_total default from false to true
- Matches user expectation that entered headcount costs are included
- Users can still uncheck toggle to exclude headcount
- Fixes confusing "Tools only" display when headcount is configured

Closes issue: SDR headcount not being added to total cost
```
