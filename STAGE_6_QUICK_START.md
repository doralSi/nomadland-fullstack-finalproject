# 🌍 STAGE 6 – MULTILINGUAL CONTENT LAYER
## Quick Start Guide

---

## 🚀 HOW TO TEST THE IMPLEMENTATION

### 1. Start the Backend Server
```powershell
cd server
npm start
```

The server should show:
```
✅ Language test routes registered at /api/languages
```

### 2. Start the Frontend Client
```powershell
cd client
npm run dev
```

### 3. Test the Language System

#### Test Language Switching:
1. **Open the app** in your browser
2. **Look at the Navbar** → You should see a 🌐 button with "HE" or "EN"
3. **Click the globe button** → Language should toggle
4. **Refresh the page** → Language preference should persist

#### Test Content Filtering:
1. **Set language to Hebrew (HE)**
   - Go to Points page → Should see both Hebrew and English points
   - Go to Events page → Should see both Hebrew and English events

2. **Set language to English (EN)**
   - Go to Points page → Should see ONLY English points
   - Go to Events page → Should see ONLY English events

#### Test Content Creation:
1. **Create a new point:**
   - Go to "Create Point"
   - Fill in the form
   - **Notice the "Language" dropdown** → Select עברית or English
   - Submit the form

2. **Create a new event:**
   - Go to a region's events page
   - Click "הוסף אירוע" (Add Event)
   - **Language field should be present** in the form
   - Submit the form

#### Test Review Language Rules:
1. **Find an English point** (language='en')
   - Open point details
   - Look for "🌐 Language: English"
   - Click "Write a Review"
   - **You should see a blue notice:** "This is an English point. Please write your review in English only."

2. **Find a Hebrew point** (language='he')
   - Reviews can be written in Hebrew
   - No language restriction notice

#### Test Map Ranger / Admin Access:
1. **Login as Map Ranger or Admin**
2. **Change language to English**
3. **You should still see ALL content** (both Hebrew and English)
4. **Regular users see only English in EN mode**

---

## 🧪 TEST API ENDPOINTS

### Language System Test:
```
GET http://localhost:5000/api/languages/test
```

Returns statistics and sample data about the language system.

### Test Point Filtering:
```
# Hebrew mode (both languages):
GET http://localhost:5000/api/points?languages=he,en

# English mode (English only):
GET http://localhost:5000/api/points?languages=en
```

### Test Event Filtering:
```
# Hebrew mode:
GET http://localhost:5000/api/events?languages=he,en&region=<region_id>&from=2025-01-01&to=2025-12-31

# English mode:
GET http://localhost:5000/api/events?languages=en&region=<region_id>&from=2025-01-01&to=2025-12-31
```

---

## 📋 EXPECTED BEHAVIOR SUMMARY

| Scenario | Expected Result |
|----------|----------------|
| User clicks globe icon | Language toggles HE ↔ EN |
| User sets English mode | Sees only English content |
| User sets Hebrew mode | Sees Hebrew + English content |
| Map Ranger in EN mode | Sees ALL content (override) |
| Admin in EN mode | Sees ALL content (override) |
| Create point with language='en' | Point saved with English language |
| Create event with language='he' | Event saved with Hebrew language |
| Review on English point | Review must be in English |
| Review on Hebrew point | Review in Hebrew |
| Page refresh | Language preference persists |
| Personal maps | Show all user's points (no filter) |

---

## 🐛 TROUBLESHOOTING

### Globe icon not showing:
- Check browser console for errors
- Verify LanguageProvider is wrapping the app
- Check Navbar imports LanguageContext

### Content not filtering:
- Check browser network tab → verify `languages` param in requests
- Check backend console → verify language filter in queries
- Use `/api/languages/test` to check database content

### Language not persisting:
- Check localStorage in browser DevTools
- Look for key: `nomadland_language`
- Should be 'he' or 'en'

### Form doesn't have language field:
- For CreatePoint → verify you're on the updated version
- For AddEvent → language field already existed

### Reviews not respecting language:
- Check point details shows language field
- Verify ReviewForm receives `requiredLanguage` prop
- Check review is saved with language in database

---

## 🎯 TESTING CHECKLIST

### Frontend Tests:
- [ ] Globe icon visible in Navbar
- [ ] Click globe → language switches
- [ ] Language label shows HE or EN
- [ ] Language persists after refresh
- [ ] Hebrew mode shows both languages
- [ ] English mode shows only English
- [ ] Create Point has language dropdown
- [ ] Point details shows language
- [ ] Review form enforces language rules
- [ ] Map Rangers see all content

### Backend Tests:
- [ ] `/api/languages/test` works
- [ ] POST point with language saves correctly
- [ ] GET points filters by languages param
- [ ] GET events filters by languages param
- [ ] POST review saves language field
- [ ] Database has language fields

### Integration Tests:
- [ ] Switch language → content updates
- [ ] Create content → appears in correct mode
- [ ] Different user roles → correct filtering
- [ ] EventsBoard respects language
- [ ] PointList respects language

---

## 📞 NEED HELP?

### Check the detailed documentation:
- `STAGE_6_MULTILINGUAL_COMPLETE.md` - Full implementation details

### Common issues:
1. **Existing data without language field:**
   - Models have default values ('he')
   - Optionally run migration script (see STAGE_6_MULTILINGUAL_COMPLETE.md)

2. **API returns wrong data:**
   - Verify `languages` param is being sent
   - Check backend receives and processes param correctly

3. **UI not updating:**
   - Check useEffect dependencies include language context
   - Verify component imports and uses LanguageContext

---

## ✅ SUCCESS CRITERIA

Your implementation is working correctly when:
1. ✅ Globe icon appears and toggles language
2. ✅ English mode filters content to English only
3. ✅ Hebrew mode shows both Hebrew and English
4. ✅ Language preference persists across sessions
5. ✅ Map Rangers always see all content
6. ✅ New content can be created in both languages
7. ✅ Reviews respect point language rules
8. ✅ No console errors

---

**Stage 6 Complete! 🎉**

You now have a fully functional multilingual content filtering system!
