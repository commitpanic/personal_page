# Blog Frontend Testing Checklist

## ✅ Pre-Testing Setup

- [ ] Backend API is running at http://localhost:5000
- [ ] Frontend dev server is running (`npm run dev`)
- [ ] Browser console is open (F12) for debugging
- [ ] Test user account created (via `register` or backend)
- [ ] At least 2-3 test articles exist in database

---

## 🖥️ Terminal Commands Testing

### Basic Article Viewing
- [ ] `help` - Shows blog commands in the list
- [ ] `blog` - Lists all articles
- [ ] `blog list` - Same as above
- [ ] `blog list -page 1` - Shows first page
- [ ] `blog list -page 2` - Shows second page (if articles exist)
- [ ] `blog read <slug>` - Displays full article
- [ ] `blog read invalid-slug` - Shows appropriate error

### Search & Filter
- [ ] `blog search javascript` - Returns matching articles
- [ ] `blog search "nonexistent keyword"` - Shows no results message
- [ ] `blog tags` - Displays all available tags
- [ ] `blog filter -tag javascript` - Filters by tag
- [ ] `blog filter -tag nonexistent` - Shows no results

### Comments
- [ ] `blog comments 1` - Shows comments for article ID 1
- [ ] `blog comment 1 "Test User" test@email.com "Great post!"` - Adds comment
- [ ] Verify success message after comment submission
- [ ] `blog comments 1` again - See new comment (may be pending)
- [ ] Try comment with invalid article ID - See error

### Reactions
- [ ] `blog like 1` - Toggle like on article 1
- [ ] Verify success message
- [ ] `blog like 1` again - Toggle off (should show different message)
- [ ] `blog reactions 1` - Display all reactions with counts
- [ ] Try with invalid article ID - See error

### Article Creation (Requires Auth)
- [ ] `blog new "Test" "Test" "Test"` without login - See auth error
- [ ] `login <username> <password>` - Login first
- [ ] `whoami` - Verify logged in
- [ ] `blog new "Test Article" "Test excerpt" "Test content"` - Create draft
- [ ] Verify success message with article details
- [ ] `blog new "Published" "Excerpt" "Content" -publish` - Create published
- [ ] `blog new "Tagged" "Excerpt" "Content" -tags test,demo` - Create with tags
- [ ] `blog new "Full" "Excerpt" "Content" -tags web,js -publish` - All options
- [ ] `blog list` - See newly created articles

### Edge Cases
- [ ] Empty input (just hit Enter) - No error
- [ ] `blog` with no articles in DB - Appropriate message
- [ ] Very long article title/content - Formats correctly
- [ ] Special characters in search - Handles gracefully
- [ ] Multiple spaces in command - Parses correctly

---

## 🌐 GUI Pages Testing

### Blog List Page (`/blog`)

#### Initial Load
- [ ] Navigate to http://localhost:3000/blog
- [ ] Page loads without errors
- [ ] Header shows "Blog" as active link
- [ ] Articles display in list format
- [ ] Each article shows: title, slug, date, views, tags, excerpt

#### Pagination
- [ ] Pagination controls visible (if > 5 articles)
- [ ] "Previous" button disabled on page 1
- [ ] Click "Next" - Goes to page 2
- [ ] Page indicator updates (e.g., "Page 2 of 3")
- [ ] Click "Previous" - Goes back to page 1
- [ ] "Next" button disabled on last page

#### Interaction
- [ ] Hover over article - Border effect shows
- [ ] Click article title - Navigates to detail page
- [ ] Click tag - Could filter (if implemented)
- [ ] Back button in browser - Returns to list

#### Responsive Design
- [ ] Resize to mobile width - Layout adapts
- [ ] Text remains readable at small sizes
- [ ] Navigation menu hides on mobile
- [ ] Buttons remain touchable

#### Loading & Errors
- [ ] Stop backend, reload page - Error message shows
- [ ] Click "Retry" button - Attempts reload
- [ ] Slow connection - Loading state appears

---

### Article Detail Page (`/blog/[slug]`)

#### Initial Load
- [ ] Navigate to `/blog/my-first-post` (use actual slug)
- [ ] Article title displays correctly
- [ ] Publication date shows
- [ ] View count shows (if available)
- [ ] Tags display as badges
- [ ] Full content renders with line breaks
- [ ] "Back to all articles" button visible

#### Navigation
- [ ] Click "Back to all articles" - Returns to `/blog`
- [ ] Click "Blog" in header - Returns to `/blog`
- [ ] Click "Terminal" in header - Goes to home
- [ ] Browser back button works

#### Reactions Section
- [ ] Reactions section visible
- [ ] Shows reaction counts (or "No reactions yet")
- [ ] "Like this article" button present
- [ ] Click like button - Request sent
- [ ] Reaction count updates immediately
- [ ] Click again - Count decrements

#### Comments Section
- [ ] Comments section visible below reactions
- [ ] Shows comment count in header
- [ ] Existing comments display (if any)
- [ ] Comment form visible with 3 fields (name, email, content)

#### Comment Submission
- [ ] Fill in name: "Test User"
- [ ] Fill in email: "test@example.com"
- [ ] Fill in comment: "This is a test comment"
- [ ] Click "Submit Comment"
- [ ] Success message appears
- [ ] Form clears after submission
- [ ] New comment appears in list (may show "Pending")

#### Comment Form Validation
- [ ] Try submit with empty fields - Validation error
- [ ] Try invalid email format - Validation error
- [ ] Try very long comment - Handles appropriately

#### Responsive Design
- [ ] Mobile view - Single column layout
- [ ] Form fields stack vertically
- [ ] Buttons remain accessible
- [ ] Content readable at all sizes

#### Error Handling
- [ ] Visit invalid slug `/blog/nonexistent` - Error page
- [ ] Error message displays
- [ ] "Back to Blog" button works
- [ ] Stop backend during page view - Handles gracefully

---

## 🔐 Authentication Flow Testing

### Registration
- [ ] `register testuser test@email.com password123`
- [ ] Success message with username
- [ ] `whoami` - Shows "Not logged in"
- [ ] User can now login

### Login
- [ ] `login testuser password123`
- [ ] Success message: "Welcome back, testuser!"
- [ ] `whoami` - Shows logged in user info
- [ ] Token stored in localStorage (check DevTools → Application → Local Storage)
- [ ] User object stored in localStorage

### Authenticated Actions
- [ ] `blog new ...` - Works (previously failed)
- [ ] Created article shows correct author_id
- [ ] Token included in request headers (check Network tab)

### Logout
- [ ] `logout`
- [ ] Success message
- [ ] `whoami` - Shows "Not logged in"
- [ ] localStorage cleared
- [ ] `blog new ...` - Fails again with auth error

### Session Persistence
- [ ] Login
- [ ] Refresh page
- [ ] `whoami` - Still logged in
- [ ] Close tab, reopen - Still logged in
- [ ] Clear localStorage manually - Logged out

---

## 🎨 Visual & UX Testing

### Terminal Interface
- [ ] Typewriter effect works (if implemented)
- [ ] Text color matches theme (green/white/red/yellow)
- [ ] Box-drawing characters render correctly
- [ ] Spacing and alignment consistent
- [ ] Scroll behavior smooth
- [ ] Command history works (↑/↓ arrows)
- [ ] Input cursor visible and blinks

### GUI Interface
- [ ] Terminal aesthetic maintained
- [ ] Monospace font used throughout
- [ ] Green color theme consistent
- [ ] Hover effects smooth
- [ ] Transitions not jarring
- [ ] Loading states clear
- [ ] Error states visible

### Formatting
- [ ] Article lists formatted with borders
- [ ] Tags displayed consistently
- [ ] Dates formatted nicely
- [ ] Long text wraps properly
- [ ] Code blocks (if any) formatted
- [ ] Emojis display correctly

---

## 🐛 Error Scenarios Testing

### Network Errors
- [ ] Stop backend during command - Appropriate error
- [ ] Stop backend during page load - Error page
- [ ] Slow network - Loading states appear
- [ ] Timeout - Error message

### Invalid Input
- [ ] `blog read` without slug - Usage error
- [ ] `blog comment` without required params - Usage error
- [ ] `blog like` without ID - Usage error
- [ ] `blog new` with missing fields - Error message

### Authorization Errors
- [ ] Create article without login - Auth required message
- [ ] Expired token (simulate) - Handles gracefully
- [ ] Invalid credentials - Login fails with message

### Data Errors
- [ ] Article with missing fields - Handles gracefully
- [ ] Malformed API response - Error handled
- [ ] Empty arrays returned - Shows appropriate message
- [ ] Null/undefined values - Doesn't crash

---

## ⚡ Performance Testing

### Load Times
- [ ] Initial page load < 2 seconds
- [ ] Article list loads quickly
- [ ] Article detail loads quickly
- [ ] Comment submission feels instant
- [ ] Like toggle immediate feedback

### Large Data Sets
- [ ] Test with 50+ articles - Pagination works
- [ ] Test with 100+ comments - Displays efficiently
- [ ] Search with many results - Doesn't lag
- [ ] Long article content - Scrolls smoothly

### Multiple Operations
- [ ] Rapid command execution - No crashes
- [ ] Quick navigation between pages - Smooth
- [ ] Multiple likes/unlikes - Handles correctly
- [ ] Concurrent comments - All succeed

---

## 📱 Cross-Browser Testing

- [ ] Chrome - All features work
- [ ] Firefox - All features work
- [ ] Safari - All features work
- [ ] Edge - All features work
- [ ] Mobile browsers - Responsive design works

---

## 🔍 Accessibility Testing

- [ ] Tab navigation works
- [ ] Form labels present
- [ ] Error messages clear
- [ ] Color contrast sufficient
- [ ] Keyboard shortcuts work (if any)

---

## 📊 Console Check

Throughout testing:
- [ ] No console errors
- [ ] No console warnings (or expected ones only)
- [ ] Network requests succeed (200 status)
- [ ] No CORS errors
- [ ] No memory leaks (check after prolonged use)

---

## ✅ Final Verification

- [ ] All documentation files present and accurate
- [ ] Code has no syntax errors
- [ ] TypeScript compiles without errors
- [ ] All imports resolve correctly
- [ ] Environment variables set (if needed)
- [ ] Git committed with clear message
- [ ] README updated with blog features

---

## 🎉 Success Criteria

**All systems GO if:**
- ✅ Can list, read, search, and filter articles via terminal
- ✅ Can add comments and toggle likes via terminal
- ✅ Can create articles via terminal (when authenticated)
- ✅ Can browse articles via GUI at `/blog`
- ✅ Can read full articles via GUI at `/blog/[slug]`
- ✅ Can submit comments via GUI form
- ✅ Can like articles via GUI button
- ✅ All error cases handled gracefully
- ✅ No console errors under normal operation
- ✅ Responsive design works on mobile and desktop
- ✅ Authentication flow complete and secure

---

**If all checkboxes are ticked, your blog frontend is production-ready! 🚀**

**Test Date:** _______________  
**Tested By:** _______________  
**Result:** ⬜ PASS  ⬜ FAIL  
**Notes:** _________________________________
