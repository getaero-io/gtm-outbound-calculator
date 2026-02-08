# Waterfall Enrichment Guide

## Overview

Waterfall enrichment allows you to configure sequential provider fallback strategies to maximize data coverage while controlling costs.

## How It Works

A waterfall processes contacts through multiple providers in sequence:

1. **Step 1** processes all contacts (e.g., 1,000 contacts)
   - Finds 650 emails (65% coverage)
   - 350 contacts remain without emails

2. **Step 2** processes remaining 350 contacts
   - Finds 175 emails (50% of 350)
   - 175 contacts remain without emails

3. **Step 3** processes remaining 175 contacts
   - Finds 70 emails (40% of 175)
   - 105 contacts remain without emails

**Total Result:**
- **Coverage:** 895/1,000 = 89.5%
- **Cost:** Sum of all step costs
- **Cost per find:** Total cost / 895

## Use Cases

### Email Finding Waterfall
**Goal:** Maximize email coverage for outbound campaigns

**Strategy:**
1. Start with high-coverage provider (Apollo, 65%)
2. Add mid-cost provider for remaining (Hunter, 50%)
3. Optional: Add premium provider for final pass (Prospeo, 40%)

### Phone Finding Waterfall
**Goal:** Get mobile numbers for high-value accounts

**Strategy:**
1. Use waterfall provider (BetterContact, 70% with built-in waterfall)
2. Add premium provider for remaining (Lusha, 40%)

### Email Verification Waterfall
**Goal:** Validate emails before sending

**Strategy:**
1. Quick validation (ZeroBounce, 95%)
2. Deep validation for unknowns (NeverBounce, 90%)

## Configuration

### Coverage Rates
Set realistic expected coverage rates for each provider based on:
- Provider documentation
- Your historical data
- Industry benchmarks (see [docs/EMAIL_INFRASTRUCTURE_OPTIMIZATION.md](./EMAIL_INFRASTRUCTURE_OPTIMIZATION.md))

### Step Order
Order matters! Place providers strategically:
- **First:** Highest coverage or best price/performance ratio
- **Middle:** Complementary data sources
- **Last:** Premium/expensive providers for final coverage boost

## Cost Analysis

The calculator shows:
- **Total Coverage:** Combined coverage across all steps
- **Total Cost:** Sum of all provider costs
- **Cost per Find:** Total cost / successful finds
- **Step Breakdown:** Per-step metrics (processed, found, cost)

## Comparison: Waterfall vs Single Provider

### Single Provider (Apollo only)
- Coverage: 65%
- Cost: 1,000 x $0.10 = $100
- Cost per find: $100 / 650 = $0.154

### Waterfall (Apollo -> Hunter)
- Coverage: 65% + (35% x 50%) = 82.5%
- Cost: (1,000 x $0.10) + (350 x $0.068) = $123.80
- Cost per find: $123.80 / 825 = $0.150

**Result:** 17.5% more coverage for 2.6% lower cost per find!

## Best Practices

1. **Test Coverage Rates:** Use historical data to set accurate coverage rates
2. **Monitor Performance:** Track actual vs. expected coverage
3. **Optimize Sequence:** Reorder steps based on performance
4. **Balance Cost vs Coverage:** More steps = higher coverage but higher cost
5. **Use Presets:** Start with built-in presets, then customize

## Preset Configurations

The calculator includes tested preset waterfalls:

- **Max Email Coverage:** Apollo -> Hunter -> Prospeo (89.5% coverage)
- **Cost-Optimized Email:** Apollo -> FindyMail (82% coverage, lower cost)
- **Standard Phone:** BetterContact -> Lusha (82% coverage)

## Related Documentation

- [Provider Pricing](../PROVIDERS_ADDED.md) - All 27 providers with costs
- [Infrastructure Optimization](./EMAIL_INFRASTRUCTURE_OPTIMIZATION.md) - Email warming best practices
- [GTM User Stories](./launch/gtm-user-stories-exhaustive.md) - Real-world workflows
