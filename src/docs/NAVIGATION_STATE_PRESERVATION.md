# Navigation State Preservation System

## Overview
Comprehensive navigation state preservation across the entire application, ensuring users return to their exact position when navigating back from detail pages.

## Features Implemented

### 1. State Persistence
- **Scroll Position**: Pixel-perfect scroll restoration using RAF (RequestAnimationFrame)
- **Search Queries**: Preserved across navigation
- **Filters & Categories**: Maintained when returning to lists
- **Sort Order**: Current sort field and direction saved
- **Expanded Items**: Accordion/expandable item states preserved
- **Active Tabs**: Tab selection maintained per page
- **Navigation Stack**: Full back/forward navigation history

### 2. Storage Mechanism
- **SessionStorage**: All state persisted in browser sessionStorage
- **Auto-Save**: State saved on every change with throttling
- **Auto-Restore**: State restored immediately on page mount
- **Key Structure**: `app_navigation_state_v2`

### 3. PageStateContext API

```javascript
const {
  getPageState,      // Get state for a page key
  setPageState,      // Set/update state for a page key
  clearPageState,    // Clear state for a page key
  pushNavState,      // Push state to navigation stack before detail navigation
  popNavState,       // Pop state from stack when returning
  getLastNavState,   // Get last saved state for a page
  clearNavStack,     // Clear entire navigation stack
  navStack           // Raw navigation stack array
} = usePageState();
```

### 4. Hooks Available

#### useScrollPersist(pageKey?)
Automatically preserves and restores scroll position for the current page.

```javascript
const scrollRef = useScrollPersist('my-page-key');
```

#### useListStatePersistence(listKey, initialState)
Complete list state management with auto-persistence.

```javascript
const { state, updateListState, resetListState } = useListStatePersistence('my-list', {
  searchQuery: '',
  filters: {},
  sortField: null,
  expandedItems: []
});
```

## Implementation by Module

### Holy Names (Section A & B)
**File**: `pages/MagicalHolyNamesPage.jsx`

**State Preserved**:
- Active tab (Section A/B)
- Search query
- Category filter (low/medium/high)
- Sort order (default/A-Z/Z-A/Value)
- Expanded item IDs
- Scroll position

**Keys Used**:
- `magical-holy-names-page` (active tab)
- `magical-holy-names-section-a` (Section A state)
- `magical-holy-names-section-b` (Section B state)

### Holy Names Detail Page
**File**: `pages/HolyOneDetailPage.jsx`

**Navigation Flow**:
1. Before opening detail: push current list state to navigation stack
2. On detail unmount: pop state and restore to list page
3. User returns to exact position, filters, and scroll

## Usage Guidelines

### For List Pages

```javascript
function MyListPage() {
  const { getPageState, setPageState } = usePageState();
  const listKey = 'my-list-key';
  
  // Get initial state
  const initial = getPageState(listKey, {
    searchQuery: '',
    filters: {},
    sortIdx: 0,
    scrollTop: 0
  });
  
  // Initialize state
  const [search, setSearch] = useState(initial.searchQuery || '');
  const [scroll, setScroll] = useState(initial.scrollTop || 0);
  
  // Save on change
  useEffect(() => {
    setPageState(listKey, { searchQuery: search, scrollTop: scroll });
  }, [search, scroll]);
  
  // Restore scroll on mount
  useEffect(() => {
    if (initial.scrollTop) {
      const container = document.querySelector('[data-scroll-container="true"]');
      if (container) {
        requestAnimationFrame(() => {
          container.scrollTop = initial.scrollTop;
        });
      }
    }
  }, []);
  
  // Save scroll continuously
  useEffect(() => {
    const container = document.querySelector('[data-scroll-container="true"]');
    if (!container) return;
    
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setPageState(listKey, { scrollTop: container.scrollTop });
          ticking = false;
        });
        ticking = true;
      }
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [listKey, setPageState]);
}
```

### For Detail Pages

```javascript
function MyDetailPage() {
  const { pushNavState, popNavState } = usePageState();
  const navigate = useNavigate();
  
  // Save navigation state on mount
  useEffect(() => {
    const currentState = getPageState('my-list-key', {});
    pushNavState('my-page', {
      listKey: 'my-list-key',
      ...currentState,
      fromPage: '/my-list'
    });
    
    // Restore on cleanup
    return () => {
      popNavState('my-page');
    };
  }, []);
  
  const handleBack = () => {
    popNavState('my-page');
    navigate(-1);
  };
}
```

## Best Practices

### DO:
- ✅ Use unique, descriptive keys for each page/list
- ✅ Save state on every user interaction
- ✅ Restore scroll position using requestAnimationFrame
- ✅ Throttle scroll saves to prevent performance issues
- ✅ Clear state only when user explicitly resets filters
- ✅ Push navigation state before navigating to detail pages

### DON'T:
- ❌ Clear state on page unmount (preserve for return)
- ❌ Reset filters unless user explicitly requests it
- ❌ Save state too frequently (use RAF throttling)
- ❌ Use generic keys like "page" or "list" (be specific)
- ❌ Forget to restore scroll on mount

## Performance Optimizations

### Scroll Throttling
Uses RequestAnimationFrame to batch scroll saves:
```javascript
let ticking = false;
const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      setPageState(key, { scrollTop: container.scrollTop });
      ticking = false;
    });
    ticking = true;
  }
};
```

### Immediate Restore
Scroll restored immediately on mount using RAF:
```javascript
requestAnimationFrame(() => {
  container.scrollTop = savedScroll || 0;
});
```

## Testing Checklist

- [ ] Navigate to list page
- [ ] Apply filters, search, sort
- [ ] Scroll to middle of list
- [ ] Open an item detail
- [ ] Press back button
- [ ] Verify exact scroll position restored
- [ ] Verify filters still applied
- [ ] Verify search query preserved
- [ ] Verify sort order maintained
- [ ] Verify expanded items still expanded

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (iOS/macOS)
- ✅ Mobile browsers

**Storage Limit**: ~5-10MB depending on browser

## Troubleshooting

### State Not Restoring
1. Check sessionStorage is enabled
2. Verify page keys match exactly
3. Ensure component mounts before state restore
4. Check console for warnings

### Scroll Jumping
1. Use requestAnimationFrame for restore
2. Ensure scroll container has `data-scroll-container="true"`
3. Check for competing scroll handlers
4. Verify container exists before setting scrollTop

### Performance Issues
1. Reduce save frequency (use RAF throttling)
2. Minimize state object size
3. Avoid saving on every render
4. Use specific keys, not broad patterns

## Future Enhancements

- [ ] Cross-tab synchronization
- [ ] State compression for large lists
- [ ] Selective state clearing
- [ ] State export/import
- [ ] Time-based state expiration
- [ ] Memory usage monitoring

## Related Files

- `context/PageStateContext.jsx` - Core state management
- `components/PageLayout.jsx` - Scroll persistence integration
- `pages/MagicalHolyNamesPage.jsx` - Reference implementation
- `pages/HolyOneDetailPage.jsx` - Detail page integration