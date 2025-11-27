# NomadEvents Quick Start Guide

## 🎉 Welcome to NomadEvents!

This guide will help you get started with the new Events feature in NomadLand.

---

## 📍 Accessing Events

### From Region Page
1. Navigate to any region (e.g., `/region/tel-aviv`)
2. Click the **"לוח אירועים"** (Events Board) button
3. You'll see the Events Board with two tabs: Today and Week

### Direct Access
- Events Board: `/region/{slug}/events`
- Single Event: `/event/{id}`
- My Events: `/me/events`

---

## ➕ Creating an Event

### Prerequisites
- You must be logged in
- Navigate to a specific region first

### Steps
1. Go to region events board: `/region/{slug}/events`
2. Click **"הוסף אירוע"** (Add Event) button
3. Fill in the form:
   - **Title** (required): Event name
   - **Description** (required): Full event details
   - **Cost** (optional): e.g., "Free", "50 ₪", "$10"
   - **Image** (optional): Upload event photo
   - **Start Date** (required): First occurrence
   - **End Date** (required): Last occurrence (same as start for single events)
   - **Time** (required): Event time (HH:MM format)
   - **Language** (required): Hebrew (shows in both) or English (English only)
   - **Repeat**: None, Daily, Weekly, Monthly
   - **Location** (required): Click on map to select

4. For weekly events, select which days to repeat
5. Click **"צור אירוע"** (Create Event)

### Validation
- Location must be inside region boundaries (warning shown if outside)
- End date must be after start date
- Weekly events require at least one day selected

---

## 👀 Viewing Events

### Today View
- Shows all events happening today
- Large cards with full details
- Sorted by time
- Displays: image, title, description, time, cost, location

### Week View
- Shows next 7 days in a grid
- Compact cards showing time and title
- Click any event to see full details

### Event Details Page
Displays:
- Hero image (if available)
- Title and full description
- Date, time, cost, region
- Interactive map showing location
- Repeat pattern (if applicable)
- Status badge (approved/under review/rejected)
- Edit/Delete buttons (if you're the owner)

---

## ✏️ Editing Events

### Single Events (repeat = "none")
1. Open event details page
2. Click **"ערוך"** (Edit) button
3. Update any fields
4. Click **"שמור שינויים"** (Save Changes)

### Repeating Events
When you click Edit, you'll see two options:

**Option 1: Edit this occurrence only**
- Creates an override for the specific date
- Doesn't affect other occurrences
- Good for: changing time, cancelling one instance, updating details for specific date

**Option 2: Edit entire series**
- Updates the template
- Affects all future occurrences
- Good for: changing the event fundamentally, updating recurring details

### What Can Be Edited
- **Single Occurrence**: Title, description, cost, time, location, image
- **Entire Series**: All of the above + repeat pattern, date range, days of week

---

## 🗑️ Deleting Events

1. Open event details or My Events page
2. Click **"מחק"** (Delete) button
3. Confirm deletion in dialog
4. Event is permanently removed

**Note:** Deleting a repeating event removes all occurrences.

---

## 📅 My Events Page

Access your events: `/me/events`

### Features
- View all events you've created
- Filter tabs:
  - **All**: Every event
  - **Upcoming**: Events ending in the future
  - **Past**: Events that have ended

### Quick Actions
- **👁️ View**: See event details
- **✏️ Edit**: Edit the event
- **🗑️ Delete**: Remove the event

### Event Information Displayed
- Title and description
- Status badge (approved/review/rejected)
- Date range
- Time
- Region
- Repeat pattern (if applicable)

---

## 🔁 Understanding Repeat Patterns

### None (Single Event)
- Occurs once on the start date
- End date = start date

### Daily
- Repeats every day
- From start date to end date
- Example: Daily meditation, 7 days

### Weekly
- Repeats on selected days of the week
- Choose one or more days (Sunday=0 to Saturday=6)
- Example: Yoga every Monday and Wednesday

### Monthly
- Repeats on the same day of each month
- Example: Monthly meetup on the 15th

---

## 🌍 Language System

### Hebrew Events (`language: 'he'`)
- Appear when viewing in Hebrew mode
- **Also appear when viewing in English mode**
- Best for: Events targeting both Hebrew and English speakers

### English Events (`language: 'en'`)
- **Only** appear when viewing in English mode
- Hidden from Hebrew mode viewers
- Best for: English-only events

**Recommendation:** Use Hebrew for most events to maximize visibility.

---

## 🎨 Event Status

### Under Review (`underReview`)
- Default status for new events
- Visible to creator
- Awaiting admin approval (if enabled)

### Approved (`approved`)
- Event is live and visible to all users
- Appears in event boards
- Currently: auto-approved (admin system coming soon)

### Rejected (`rejected`)
- Event was not approved
- Only visible to creator in "My Events"

---

## 🗺️ Location & Region Boundaries

### Selecting Location
- Click anywhere on the map
- Marker shows selected position
- Coordinates displayed below map

### Region Validation
- Events should be inside region boundaries
- Warning shown if location is outside
- You can proceed anyway (with confirmation)

**Best Practice:** Keep events within their region boundaries for better organization.

---

## 💡 Tips & Best Practices

### Creating Events
- ✅ Use clear, descriptive titles
- ✅ Include detailed descriptions (what, where, who should attend)
- ✅ Add an engaging image
- ✅ Specify cost clearly (or mark as "Free")
- ✅ Choose accurate location on map
- ✅ Use appropriate repeat pattern

### Images
- Recommended size: 1200x600px minimum
- Formats: JPG, PNG
- Shows in event cards and details page
- Optional but highly recommended

### Descriptions
- Be specific about what to expect
- Include any requirements (bring laptop, etc.)
- Mention target audience if relevant
- Add contact info if needed

### Repeat Events
- Weekly events work great for recurring activities
- Monthly events for regular meetups
- Use overrides to cancel or modify specific dates

---

## 🐛 Troubleshooting

### Can't create event
- ✅ Make sure you're logged in
- ✅ Check all required fields are filled
- ✅ Verify location is selected on map

### Event not showing
- Check the date range (past events don't appear in today/week view)
- Verify language settings
- Check status (underReview vs approved)

### Edit button not visible
- Only owner or admin can edit
- Make sure you're logged in with the creator account

### Location warning
- Event location is outside region boundary
- You can proceed anyway or adjust location
- Best to keep events within region

---

## 🚀 Next Steps

1. **Create Your First Event**
   - Start with a simple single event
   - Add an image for better visibility
   - Share with the community!

2. **Explore Events**
   - Check today's events in your region
   - Browse the week view
   - Join community activities!

3. **Manage Your Events**
   - Visit "My Events" to see all your creations
   - Edit as needed
   - Keep event info up-to-date

---

## 📞 Support

For questions or issues:
- Check the full documentation: `STAGE_2.5b_NOMADEVENTS_SUMMARY.md`
- Review code examples in the implementation
- Contact the development team

---

**Happy Event Planning! 🎉**

Built with ❤️ for the NomadLand community
