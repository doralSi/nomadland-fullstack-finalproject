# STAGE 2 - Testing Guide

## Quick Test Checklist

### ✅ Hero Section
- [ ] Hero image displays correctly
- [ ] Region name shown prominently
- [ ] Subtitle displays
- [ ] "Back to All Regions" button works
- [ ] Button navigates to /regions

### ✅ About Section
- [ ] Region description displays centered
- [ ] Text is readable and properly formatted

### ✅ Map Section
- [ ] Map loads and displays region
- [ ] Map auto-fits to region boundaries
- [ ] Region polygon outline visible (purple)
- [ ] Approved points show as blue markers
- [ ] Clicking markers opens popups with point info
- [ ] "Show Events" toggle button works
- [ ] Events show as red markers when toggled

### ✅ FAB (Floating Action Button)
- [ ] "+" button visible in lower-right corner
- [ ] Clicking FAB activates "add point" mode
- [ ] Button turns red when active
- [ ] Tooltip appears: "Click on map to choose location"
- [ ] Clicking inside region opens Add Point modal
- [ ] Clicking outside region shows error message
- [ ] Canceling exits add mode

### ✅ Add Point Modal
- [ ] Modal appears with overlay
- [ ] Title field works
- [ ] Category dropdown shows all options
- [ ] Description textarea works
- [ ] Location shows correct coordinates (read-only)
- [ ] Cancel button closes modal
- [ ] Create Point button submits
- [ ] Success message shows
- [ ] Map refreshes with new point (after moderation)
- [ ] Modal matches Auth page styling

### ✅ Tabs Section
- [ ] Two tabs visible: "Events" and "Points List"
- [ ] Active tab has purple underline
- [ ] Clicking tab switches content
- [ ] Content fades in smoothly
- [ ] Map stays visible when switching tabs

### ✅ Events Tab
- [ ] "Upcoming Events" header displays
- [ ] "Add Event" button visible
- [ ] Events grouped by Today/Tomorrow/This Week
- [ ] Each section has icon and title
- [ ] Event cards display correctly
- [ ] "No events" message shows if empty
- [ ] Clicking "Add Event" opens modal

### ✅ Add Event Modal
- [ ] Modal appears with larger size
- [ ] All fields present: title, description, dates, time, cost, repeat, location
- [ ] Date picker works
- [ ] Time picker works
- [ ] Repeat dropdown shows options
- [ ] Lat/Lng fields accept numbers
- [ ] Validation works (end date after start date)
- [ ] Cancel and Submit buttons work
- [ ] Success refreshes events list

### ✅ Points List Tab
- [ ] "Points of Interest" header displays
- [ ] Point count shows (e.g., "15 points")
- [ ] Category filter buttons display
- [ ] "All" filter selected by default
- [ ] Clicking category filters points
- [ ] Active filter has purple background
- [ ] Point cards show icon, title, category, description
- [ ] Location coordinates displayed
- [ ] Hover effect works on cards
- [ ] "No points" message shows when filtered

### ✅ Responsive Design
- [ ] Works on desktop (1920px)
- [ ] Works on tablet (768px)
- [ ] Works on mobile (375px)
- [ ] Hero scales appropriately
- [ ] Map height adjusts
- [ ] Tabs stack on mobile
- [ ] Modals fit on small screens

### ✅ No Legacy Elements
- [ ] No "Coming Soon" sections
- [ ] No standalone "Map" button
- [ ] No standalone "Events Board" button
- [ ] No standalone "All Points" button
- [ ] No standalone "Add Point" button (now FAB)
- [ ] No info cards
- [ ] No debug buttons

## Test URLs
1. `/region/tel-aviv` - Test with Tel Aviv region
2. `/region/lisbon` - Test with Lisbon region
3. `/regions` - All regions page (unchanged)

## Expected Behavior

### Adding a Point
1. Click FAB button
2. Click anywhere on map inside region
3. Fill form: "Test Cafe", category "cafe", "Great coffee"
4. Click "Create Point"
5. See success message
6. Point appears in pending status (visible to admins only)

### Adding an Event
1. Go to Events tab
2. Click "Add Event"
3. Fill form with event details
4. Make sure end date is after start date
5. Enter valid coordinates inside region
6. Click "Create Event"
7. Event goes to moderation

### Filtering Points
1. Go to Points List tab
2. Click "Cafes" filter
3. Only cafe points show
4. Click "All" to show all again

## Console Checks
- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No 404 errors for assets
- [ ] API calls complete successfully
- [ ] Polygon validation logs show correct results

## Performance
- [ ] Map loads quickly
- [ ] Tab switching is smooth
- [ ] No lag when opening modals
- [ ] Points/events load without delay

---

If all items checked, STAGE 2 is successfully implemented! 🎉
