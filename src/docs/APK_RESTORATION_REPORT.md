# APK RESTORATION REPORT
## Screen Stability & Keyboard Behavior Restoration

**Date:** 2026-06-20  
**Backup Source:** sirrulhurufcode.zip  
**Priority:** Screen stability, keyboard behavior, scroll behavior, page layout

---

## CRITICAL REGRESSIONS FOUND & FIXED

### 1. **index.css - Viewport Height Constraints** ✅ FIXED

**Problem:**
```css
/* BROKEN - causes keyboard jumps */
html { height: auto; min-height: 100%; }
body { height: auto; min-height: 100%; }
#root { height: auto; overflow: visible; }
```

**Restored to APK:**
```css
/* STABLE - fixed height prevents jumps */
html { height: 100%; }
body { height: 100%; }
#root { height: 100%; overflow: hidden; }
```

**Impact:** Prevents viewport expansion when keyboard opens on iPhone Safari.

---

### 2. **PageLayout.jsx - Container Height** ✅ FIXED

**Problem:**
```jsx
// BROKEN - allows expansion
height: "auto",
minHeight: "100%",
overflow: "visible",
```

**Restored to APK:**
```jsx
// STABLE - fixed constraint
height: "100%",
overflow: "hidden",
```

**Impact:** Prevents page container from growing when keyboard triggers viewport resize.

---

### 3. **PageLayout.jsx - Scroll Container** ✅ FIXED

**Problem:**
```jsx
// Missing height constraint
flex: "1 1 auto",
minHeight: "0",
```

**Restored to APK:**
```jsx
// Fixed height
flex: "1 1 auto",
height: "100%",
minHeight: "0",
```

**Impact:** Scroll container maintains fixed height, preventing content shift.

---

### 4. **PageLayout.jsx - Motion Content Wrapper** ✅ FIXED

**Problem:**
```jsx
// Allows expansion
minHeight: '100%',
```

**Restored to APK:**
```jsx
// Fixed height
height: '100%',
```

**Impact:** Page content doesn't push container when keyboard appears.

---

### 5. **PageLayout.jsx - Resize Listener** ✅ FIXED

**Problem:**
```jsx
// Comment shows it was disabled but left in code
// window.addEventListener('resize', updateMetrics); // DISABLED
```

**Restored to APK:**
```jsx
// Completely removed - no resize listener at all
nav.addEventListener('scroll', updateMetrics, { passive: true });
// No window resize listener
```

**Impact:** Eliminates state updates during keyboard open that caused page jumps.

---

### 6. **SirrPage.jsx - VisualViewport Handler** ✅ REMOVED

**Problem:**
- Page-specific VisualViewport handler conflicting with global constraints
- Body lock/unlock causing scroll position jumps
- Unnecessary complexity now that global fix is in place

**Restored to APK:**
- Removed entire VisualViewport useEffect
- Removed pageContainerRef
- Simplified container styles

**Impact:** Sirr page now uses stable global viewport constraints.

---

### 7. **AbjadKabirPage.jsx - Background Container** ✅ FIXED

**Problem:**
```jsx
minHeight: "100dvh", // Dynamic viewport height causes issues
```

**Restored to APK:**
```jsx
minHeight: "100%", // Fixed percentage
```

**Impact:** Prevents background container from resizing on keyboard open.

---

## FILES MODIFIED

1. ✅ `index.css` - Viewport height constraints
2. ✅ `components/PageLayout.jsx` - Container heights, overflow, resize listener
3. ✅ `pages/SirrPage.jsx` - Removed VisualViewport handler
4. ✅ `pages/AbjadKabirPage.jsx` - Background container height

---

## VERIFICATION CHECKLIST

### Screen Stability
- [ ] No page jump on keyboard open (iPhone Safari)
- [ ] No viewport compression
- [ ] No modal resizing during keyboard transition
- [ ] Background doesn't shift

### Keyboard Behavior
- [ ] Input fields remain visible when focused
- [ ] No automatic scroll-to-top on focus
- [ ] Keyboard doesn't trigger layout recalculation
- [ ] Typing doesn't cause page movement

### Scroll Behavior
- [ ] Scroll position preserved during keyboard open/close
- [ ] No scroll reset on input focus
- [ ] Native momentum scrolling preserved
- [ ] Pull-to-refresh disabled during keyboard focus

### Page Layout
- [ ] Fixed viewport height (no auto/min-height)
- [ ] Overflow properly constrained
- [ ] No horizontal scroll
- [ ] Safe area insets respected

### Navigation
- [ ] Tab navigation smooth
- [ ] No layout shift on page change
- [ ] Back button works correctly
- [ ] Admin button visible for authorized users

---

## BUSINESS LOGIC PRESERVED

✅ **No changes to:**
- Abjad calculations (Kebir, Saghir, Cumeli, Bast)
- Hadim calculations (Ulvi, Sufli, Sherli)
- Mizan calculations (all 9 methods)
- Vefk calculations (magic squares)
- Bast Huroof algorithms
- Database schemas
- Entity relationships
- Backend functions
- Calculation engines

**Only UI/layout/keyboard/scroll behavior restored to match APK.**

---

## TESTING REQUIRED

### iPhone Safari (Primary)
1. Open Sirr page
2. Tap input field
3. Verify: No page jump, no viewport shrink
4. Type text
5. Verify: No layout shift during typing
6. Close keyboard
7. Verify: Scroll position restored

### Android Chrome
1. Open any page with inputs
2. Focus input
3. Verify: Keyboard opens smoothly
4. Verify: No content pushed upward
5. Verify: Input remains visible

### All Devices
1. Navigate between pages
2. Verify: No layout shifts
3. Scroll content
4. Verify: Native momentum scrolling
5. Pull-to-refresh
6. Verify: Works when keyboard closed, disabled when open

---

## DEPLOYMENT NOTES

- Changes are minimal and focused only on viewport/keyboard stability
- No calculation engines touched
- No database changes
- No backend function changes
- Fully backward compatible
- PWA behavior preserved
- Safe area insets maintained

---

## NEXT STEPS

1. Test on actual iPhone Safari device
2. Verify keyboard behavior matches APK exactly
3. Test all pages with input fields
4. Confirm scroll behavior on all devices
5. Verify modal behavior during keyboard interaction

---

**Status:** ✅ RESTORATION COMPLETE  
**Confidence:** HIGH - Changes match APK stable version  
**Risk:** LOW - Only layout CSS/JS, no business logic