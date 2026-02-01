# Scroll Behavior Implementation Plan

## Goal

Add consistent and smooth vertical scroll behavior across all dashboard pages without changing UI design, layout, or functionality.

## Changes Required

### 1. app/search.tsx ✅ DONE

- [x] Wrap container content with SafeScrollView
- [x] Ensure proper scroll behavior when filters exceed viewport on small screens
- [x] Current: Uses View with FlatList for results only
- [x] Fix: Wrap title, filters, and search button in SafeScrollView

### 2. app/screens/dashboard/NotificationsScreen.tsx ✅ DONE

- [x] Wrap content with SafeScrollView
- [x] Ensure header and filter bar scroll with the list
- [x] Current: Uses View with FlatList for results only
- [x] Fix: Wrap header, filters, and list in SafeScrollView

### 3. Verified Screens with Existing ScrollView ✅

- [x] app/reports.tsx - ReportsScreen has ScrollView with proper settings
- [x] app/screens/dashboard/DonorManagementScreen.tsx - Has ScrollView with proper settings
- [x] app/chatbot.tsx - Has ScrollView with proper settings
- [x] app/settings.tsx - Has ScrollView with proper settings

## Scroll Props Standard

- `showsVerticalScrollIndicator={false}` - Keep UI clean
- `keyboardShouldPersistTaps="always"` - Allow taps while keyboard is open
- `bounces={true}` - Natural iOS scroll feel
- `overScrollMode="always"` - Allow overscroll on Android

## Implementation Steps

- [x] 1. Update SearchScreen.tsx with SafeScrollView wrapper
- [x] 2. Update NotificationsScreen.tsx with SafeScrollView wrapper
- [ ] 3. Verify all other screens have proper scroll behavior
- [ ] 4. Test on both desktop and mobile

## Constraints

- DO NOT remove, refactor, or rewrite existing code
- DO NOT change UI design, layout, spacing, or styling
- Only append minimal, non-breaking code
- Maintain current performance
- Avoid layout shifts or visual glitches
