## 📋 Overview to Changes Made

This repo introduces major improvements to the game lifecycle, change-calculation accuracy, UI layout consistency, and session flow behavior. These updates resolve issues with stale game state, incorrect change validation, misaligned UI elements, and incomplete end-of-game handling.

---

## 🔑 Key Changes

### 1. Reworked GameService Initialization

**Changes Made:**
- Removed the globally created `GameService` instance
- Introduced a new `App()` wrapper that creates a fresh `GameService` per render
- Wrapped the root in `ComponentRefresh` to enable full game restarts

**Why:** The previous approach reused the same `GameService` instance across component refreshes, causing stale state, broken restarts, and inconsistent session behavior. Tying the instance lifecycle to React ensures predictable and clean resets.

**Impact:**
- ✅ Game properly resets to Level 1 after completion
- ✅ Lives reset to 3 on restart
- ✅ All state is fresh on "Play Again"
- ✅ No stale data from previous sessions

---

### 2. Accurate and Reliable Change Calculation

**Changes Made:**
- Implemented a full calculation process for bills and coins
- Converted all amounts to integer cents to prevent floating-point precision errors
- Compared player input to expected change using exact integer matching

---

### 3. Corrected Result Handling & Animation Flow

**Changes Made:**
- Ensured result feedback remains visible before reset
- Added proper state cleanup after wrong answers

**Why:** Double-resetting caused animations to flicker or disappear before they could display properly. Cleaning this up allows stable and clear feedback.

**Impact:**
- ✅ Success/error animations display properly for 1 second

---

### 4. UI Layout and Positioning Fixes

**Changes Made:**
- Adjusted absolute layout of cash register to `top-[40%]` for better centering
- Removed conflicting `overflow-hidden` class
- Improved alignment for tall screens and various aspect ratios
- Added proper validation to prevent negative cash values

**Why:** UI elements previously overlapped, appeared off-screen, or became misaligned depending on device height. Positioning fixes ensure a consistent and responsive layout.

**Impact:**
- ✅ Cash register displays in correct position on all screens

---

### 5. Enhanced Game Session Flow

**Changes Made:**
- Implemented a proper "game complete" screen for the final level
- Added `gameComplete` state flag to track completion separately
- Consolidated `gs.nextLevel()` and session-end logic to avoid duplicates
- Improved error handling during asset preloading with specific error messages
- Added proper level reset on advancement (lives, customer, cash)
- Cleaned up alerts and level-transition behavior
- Added session start call: `gs.startSession()`
- Wrapped game in `GameServiceWrapper` for proper context

**Why:** The old flow had issues like double advancement, missing completion screens, and silent asset-loading failures. The new logic results in a clean, understandable, deterministic session flow.

**Impact:**
- ✅ Players see congratulations screen after completing all levels
- ✅ Lives reset to 3 when advancing to new levels
- ✅ Customer counter resets properly
- ✅ Clear feedback for success/failure/timeout
- ✅ "Play Again" properly restarts from Level 1

---

### 6. GameServiceWrapper Integration

**Changes Made:**
- Wrapped the gameplay component in `GameServiceWrapper` to maintain proper service context across refreshes

**Why:** Required by the `gamez` library architecture for `useGameService()` hook to work properly in child components.

**Impact:**
- ✅ Proper context provider for game service
- ✅ Follows gamez library best practices
- ✅ Enables future component composition

---

## 🔍 Debugging Process

During debugging, I:

1. **Reproduced bugs** related to change validation, level restarts, and UI positioning
   - Tested various change amounts to identify validation failures
   - Completed multiple levels to observe restart behavior
   - Tested on different screen sizes to find layout issues

2. **Logged intermediate values** during change calculation to confirm floating-point rounding errors
   - Added console logging for player and expected totals
   - Verified exact comparison failures

3. **Tracked the GameService lifecycle** and discovered stale state persisted across refreshes
   - Added logging to `GameService` constructor
   - Confirmed instance was not being recreated on refresh
   - Identified root cause in App.tsx structure

4. **Inspected layout layers** and found conflicting absolute-positioned elements causing misalignment
   - Used browser DevTools to visualize z-index stacking
   - Tested different positioning strategies
   - Settled on percentage-based positioning for responsiveness

5. **Simplified and reorganized session-end logic** to clarify intended behavior and eliminate duplicated calls
   - Drew flowcharts of session lifecycle
   - Identified redundant `nextLevel()` and `refresh()` calls
   - Consolidated into single, clear logic path

---

## ✅ Result

This PR provides major stability and UX improvements:

- ✅ **Reliable game state resets** - No more stale data between sessions
- ✅ **Accurate change-checking** - Players aren't penalized for correct answers
- ✅ **Consistent session progression** - Predictable flow through all 8 levels
- ✅ **Fully functional end-of-game flow** - Proper completion screen and restart
- ✅ **Cleaner UI layout across screen sizes** - Responsive design that works everywhere
- ✅ **More maintainable and predictable codebase** - Clear separation of concerns

---

## 🧪 Testing Checklist

- [x] Game starts without errors
- [x] Assets load correctly
- [x] Initial state includes all required fields (cash, customer, remainingLives)
- [x] Lives display correctly in TopBar
- [x] Submit button validates change accurately
- [x] Correct answers progress to next customer
- [x] Wrong answers deduct lives and clear tray
- [x] Customer progresses through 5 customers per level
- [x] Session ends correctly on success/error/timeout
- [x] Lives reset to 3 when advancing to next level
- [x] Level progression works through all 8 levels
- [x] Game completion screen appears after level 8
- [x] "Play Again" button properly restarts from Level 1
- [x] UI elements position correctly on various screen sizes
- [x] Cash register displays correct Total and Change amounts
- [x] Cannot remove money that doesn't exist
- [x] Animations display for full duration before resetting

---

## 🤔 Assumptions Made
1. Game Structure Assumptions:
    * Each level requires exactly 5 customers to complete (hardcoded customer === 4 check)
    * Level 8 (index 7) is the final level and should trigger game completion
    * All levels start with 3 lives as defined in constants.ts
2. Currency Assumptions:
    * Customers always pay with exactly $100.00
    * Change amounts are always positive (customer never overpays or underpays)
    * The available denominations ($20, $10, $5, $2, $1, 100¢, 50¢, 20¢, 10¢) are sufficient to make any change amount
3. Asset Assumptions:
    * All asset files exist at the specified paths in /public/images/
    * Asset naming follows the pattern: dollar_X for bills and cent_X for coins where X is the value
    * Customer images follow the pattern: personX_Y where X is person number (1-8) and Y is variation (1-4)
    * The dollar_1 asset exists (was missing in original constants but assumed to be available)
4. User Experience Assumptions:
    * 1 second (1000ms) is sufficient time for users to see success/error feedback
    * Users will understand that clicking money buttons adds them to the tray
    * Users will understand that clicking money on the tray removes them
    * Alert dialogs are acceptable for level completion/failure notifications (could be improved with modal UI)
5. Game Logic Assumptions:
    * Wrong answers should clear the cash tray (prevents players from resubmitting the same wrong answer)
    * Players should retry the same customer after a wrong answer (customer counter doesn't increment on error)
    * Session timeout should end the game (via gs.endSession("timeout"))
    * The timer starts when the session begins, not when each customer appears
6. UI/Layout Assumptions:
    * The game is primarily designed for landscape orientation or wide screens
    * Absolute positioning with percentage values (top-[40%]) works across target screen sizes
    * The cash register display should always show 2 decimal places for cents (e.g., "45.05" not "45.5")
    * The white tray scales at 1.4x to accommodate the money display
7. Data/Reporting Assumptions:
    * The gamez library's saveReport() method handles data persistence/transmission
    * Report data should include level number and result (success/error/timeout)
    * No additional analytics or detailed gameplay metrics need to be tracked beyond what collectReport() provides
8. Error Handling Assumptions:
    * Asset loading failures are rare and can be handled with a simple alert + page refresh suggestion
    * If GameService operations fail, the game state becomes unrecoverable and requires a full refresh
    * Network issues (if any) are handled by the gamez library internally

---

## 📊 Files Changed

| File | Changes | Lines |
|------|---------|-------|
| `src/App.tsx` | Added App wrapper, moved GameService creation | 
| `src/Game.tsx` | Added session start, completion flow, state resets | 
| `src/CashierChaos.tsx` | Fixed change calculation, UI positioning, result flow | 
---

## 🔄 Migration Guide

**For Developers:**
1. Pull latest changes
2. Clear `node_modules` and reinstall: `npm install`
3. Clear browser cache and restart dev server
4. Test complete game flow from start to finish

**No Breaking Changes:** All changes are internal improvements. The game interface and user experience are enhanced, not altered.

---

## 📚 References

- [[GAMEZ_GUIDE.md](https://claude.ai/chat/GAMEZ_GUIDE.md)](./GAMEZ_GUIDE.md) - GameService API and best practices
- [[GameTemplate.md](https://claude.ai/chat/GameTemplate.md)](./GameTemplate.md) - Project structure requirements
- [[README.md](https://claude.ai/chat/README.md)](./README.md) - Game overview and features

---

## 🎓 Lessons Learned

1. **Instance Lifecycle Matters:** Creating stateful services outside React's lifecycle leads to stale state
2. **Floating-Point Math is Unreliable:** Always use integers for currency calculations
3. **UI Positioning Needs Testing:** Absolute positioning requires testing across screen sizes
4. **Clear State Flow:** Complex state transitions benefit from explicit state flags
5. **Validation Prevents Bugs:** Input validation (like preventing negative counts) catches edge cases
6. **Animation Timing Matters:** Give users time to see feedback before state changes
7. **Separation of Concerns:** Keep display logic, calculation logic, and state management separate
