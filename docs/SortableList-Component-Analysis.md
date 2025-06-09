# SortableList Component Analysis and Consolidation Plan

## Overview

The Orpheus Engine project currently contains **5 distinct SortableList component implementations** across different directories, causing test failures, type conflicts, and import confusion. This document analyzes each implementation, their differences, usage patterns, and provides a consolidation strategy.

## Current Implementations

### 1. Main Implementation: `/src/components/SortableList.tsx`
**Primary implementation** - Most complete and actively used.

**Interface:**
```typescript
interface WindowAutoScrollThresholds {
  top: { slow: number; medium: number; fast: number };
  right: { slow: number; medium: number; fast: number };
  bottom?: { slow: number; medium: number; fast: number };
  left?: { slow: number; medium: number; fast: number };
}

interface SortableListProps {
  children: React.ReactNode;
  autoScroll: { thresholds: WindowAutoScrollThresholds };
  cancel?: string;
  onSortUpdate: (data: any) => void;
  onStart: (event: React.MouseEvent, data: any) => void;
  onEnd: (event: MouseEvent, data: any) => void;
}
```

**Features:**
- Full drag-and-drop implementation
- Mouse event handling with proper state management
- Supports cancel selectors
- Complex auto-scroll threshold structure (nested objects)
- Position calculation based on getBoundingClientRect
- Edge index calculation for precise positioning

**Used By:**
- `/src/screens/workstation/Editor.tsx`
- `/src/screens/workstation/components/Mixer.tsx`

**Export Pattern:** Named export (`export const SortableList`)

---

### 2. Widgets Implementation: `/src/components/widgets/SortableList.tsx`
**Widgets-specific implementation** - Similar to main but located in widgets.

**Interface:**
```typescript
interface WindowAutoScrollThresholds {
  top: { slow: number; medium: number; fast: number };
  right: { slow: number; medium: number; fast: number };
  bottom?: { slow: number; medium: number; fast: number };
  left?: { slow: number; medium: number; fast: number };
}

interface SortData {
  sourceIndex: number;
  edgeIndex: number;
  destIndex?: number;
}

interface SortableListProps {
  children: React.ReactNode;
  autoScroll?: { thresholds: WindowAutoScrollThresholds };
  cancel?: string;
  direction?: "horizontal" | "vertical";
  onSortUpdate: (data: SortData) => void;
  onStart?: (event: React.MouseEvent, data: SortData) => void;
  onEnd: (event: MouseEvent, data: SortData) => void;
}
```

**Features:**
- Nearly identical to main implementation
- Adds `direction` prop for horizontal/vertical sorting
- Proper TypeScript SortData interface
- Same drag-and-drop logic
- Optional autoScroll (with `?`)

**Export Pattern:** Named export (`export { SortableList }` from index.ts)

---

### 3. Frontend Widgets: `/workstation/frontend/OEW-main/src/components/widgets/SortableList.tsx`
**Frontend-specific widgets implementation** - Simplified auto-scroll structure.

**Interface:**
```typescript
interface WindowAutoScrollThresholds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface SortData {
  sourceIndex: number;
  edgeIndex: number;
  destIndex?: number;
}

interface SortableListProps {
  children: React.ReactNode;
  autoScroll?: { thresholds: WindowAutoScrollThresholds };
  cancel?: string;
  direction?: "horizontal" | "vertical";
  onSortUpdate: (data: SortData) => void;
  onStart?: (event: React.MouseEvent, data: SortData) => void;
  onEnd: (event: MouseEvent, data: SortData) => void;
}
```

**Key Difference:** Auto-scroll thresholds are **simple numbers** instead of nested objects:
```typescript
// Frontend widgets - SIMPLE
thresholds: { top: 5, right: 10, bottom: 15, left: 20 }

// Main/widgets - COMPLEX
thresholds: { 
  top: { slow: 5, medium: 10, fast: 20 },
  right: { slow: 5, medium: 10, fast: 20 }
}
```

**Used By:**
- `/workstation/frontend/OEW-main/src/screens/workstation/components/Mixer.tsx`
- `/workstation/frontend/OEW-main/src/screens/workstation/Editor.tsx`

**Export Pattern:** Default export (`export { default as SortableList }` from index.ts)

---

### 4. Frontend Main: `/workstation/frontend/OEW-main/src/components/SortableList.tsx`
**Frontend main implementation** - Hybrid approach.

**Interface:** Same as main implementation (complex nested thresholds)

**Features:**
- Complex auto-scroll threshold structure (like main)
- Located outside widgets directory
- Similar implementation to main SortableList

**Export Pattern:** Named export

---

### 5. Shared Stub: `/workstation/shared/packages/components/src/widgets/SortableList.tsx`
**Stub implementation** - Placeholder for shared package.

**Interface:**
```typescript
interface SortData {
  sourceIndex: number;
  destIndex: number;
  edgeIndex: number;
}

interface SortableListProps {
  children?: ReactNode;
  autoScroll?: { thresholds?: number[] };
  cancel?: string;
  onSortUpdate?: (data: SortData) => void;
  onStart?: (e: React.MouseEvent, data: SortData) => void;
  onEnd?: (e: MouseEvent, data: SortData) => void;
}
```

**Features:**
- **STUB IMPLEMENTATION** - just renders children
- Simplified thresholds as `number[]`
- All props are optional
- No actual drag-and-drop functionality

**Export Pattern:** Default export

---

## Problems Identified

### 1. Type Conflicts
**Auto-scroll threshold incompatibility:**
```typescript
// Tests expect complex nested structure:
thresholds: {
  top: { slow: 5, medium: 10, fast: 20 }
}

// But frontend widgets expects simple numbers:
thresholds: {
  top: 5
}
```

### 2. Interface Inconsistencies
- **SortData properties vary** across implementations
- **Optional vs required props** differ
- **Event signatures** inconsistent (React.MouseEvent vs MouseEvent)

### 3. Import Confusion
- Multiple files with same name in different directories
- Conflicting export patterns (default vs named)
- Path resolution ambiguity

### 4. Test Failures
- Tests written for complex thresholds fail with simple thresholds
- Mock expectations don't match actual interfaces
- Cross-implementation test conflicts

## Usage Analysis

### Active Consumers
1. **Main Editor** (`/src/screens/workstation/Editor.tsx`)
   - Uses: `/src/components/SortableList.tsx`
   - Track reordering functionality

2. **Main Mixer** (`/src/screens/workstation/components/Mixer.tsx`)
   - Uses: `/src/components/SortableList.tsx`
   - Track sorting in mixer view

3. **Frontend Editor** (`/workstation/frontend/OEW-main/src/screens/workstation/Editor.tsx`)
   - Uses: `/workstation/frontend/OEW-main/src/components/widgets/SortableList.tsx`
   - Track reordering in frontend

4. **Frontend Mixer** (`/workstation/frontend/OEW-main/src/screens/workstation/components/Mixer.tsx`)
   - Uses: `/workstation/frontend/OEW-main/src/components/widgets/SortableList.tsx`
   - Horizontal track sorting

### Test Coverage
- Each implementation has its own test file
- Tests are largely duplicated but with different expectations
- Some tests fail due to interface mismatches

## Consolidation Strategy

### Phase 1: Choose Canonical Implementation
**Recommended:** Use `/src/components/SortableList.tsx` as the canonical implementation because:
- Most complete implementation
- Best test coverage
- Used by core workstation components
- Proper error handling and edge cases

### Phase 2: Standardize Interface
**Unified SortData Interface:**
```typescript
export interface SortData {
  sourceIndex: number;
  edgeIndex: number;
  destIndex: number;
}

export interface WindowAutoScrollThresholds {
  top: { slow: number; medium: number; fast: number };
  right: { slow: number; medium: number; fast: number };
  bottom: { slow: number; medium: number; fast: number };
  left: { slow: number; medium: number; fast: number };
}

export interface SortableListProps {
  children: React.ReactNode;
  autoScroll?: { thresholds: WindowAutoScrollThresholds };
  cancel?: string;
  direction?: "horizontal" | "vertical";
  onSortUpdate?: (data: SortData) => void;
  onStart?: (event: React.MouseEvent, data: SortData) => void;
  onEnd?: (event: MouseEvent, data: SortData) => void;
}
```

### Phase 3: Create Shared Package
**Target Location:** `/workstation/shared/packages/components/src/widgets/SortableList.tsx`

**Steps:**
1. Replace stub with full implementation
2. Add proper TypeScript exports
3. Include comprehensive tests
4. Add JSDoc documentation

### Phase 4: Update Imports
**Path Mapping Strategy:**
```typescript
// tsconfig.json paths
{
  "paths": {
    "@shared/components": [
      "workstation/shared/packages/components/src"
    ]
  }
}

// Usage
import { SortableList, SortableListItem } from "@shared/components/widgets";
```

### Phase 5: Remove Duplicates
**Files to Remove:**
1. `/src/components/widgets/SortableList.tsx`
2. `/workstation/frontend/OEW-main/src/components/widgets/SortableList.tsx`
3. `/workstation/frontend/OEW-main/src/components/SortableList.tsx`

**Files to Keep:**
1. `/src/components/SortableList.tsx` (migrate to shared, then remove)
2. `/workstation/shared/packages/components/src/widgets/SortableList.tsx` (final location)

### Phase 6: Test Consolidation
**Unified Test Structure:**
```
/workstation/shared/packages/components/src/widgets/__tests__/
├── SortableList.test.tsx           # Main test suite
├── SortableList.integration.test.tsx # Integration tests
└── SortableListItem.test.tsx       # Item component tests
```

## Implementation Plan

### Step 1: Backup and Analysis (✅ Complete)
- Document all current implementations
- Identify usage patterns
- Map dependencies

### Step 2: Create Unified Implementation
```bash
# Copy best implementation to shared location
cp /src/components/SortableList.tsx /workstation/shared/packages/components/src/widgets/SortableList.tsx

# Add TypeScript path mapping
# Update tsconfig.json with shared paths
```

### Step 3: Update Consumers
```typescript
// Before (multiple imports)
import { SortableList } from "../components/SortableList";
import { SortableList } from "../widgets/SortableList";

// After (unified import)
import { SortableList, SortableListItem } from "@shared/components/widgets";
```

### Step 4: Consolidate Tests
- Merge test suites
- Fix interface mismatches
- Ensure 100% compatibility

### Step 5: Remove Duplicates
- Delete old implementation files
- Update package.json exports
- Clean up index.ts files

### Step 6: Validation
- Run full test suite
- Verify all components still work
- Check for import errors

## Benefits of Consolidation

1. **Reduced Maintenance Burden** - Single implementation to maintain
2. **Consistent Behavior** - Same drag-and-drop logic everywhere
3. **Better Testing** - Consolidated test coverage
4. **Cleaner Imports** - Single source of truth
5. **Type Safety** - Unified interfaces across the application
6. **Easier Debugging** - No confusion about which implementation is being used

## Risk Mitigation

1. **Gradual Migration** - Update one consumer at a time
2. **Backward Compatibility** - Keep old files during transition
3. **Comprehensive Testing** - Test each migration step
4. **Rollback Plan** - Git branches for easy reversion
5. **Documentation** - Clear migration guide for developers

## Next Steps

1. ✅ Create this documentation
2. ⏳ Create unified implementation in shared package
3. ⏳ Update TypeScript configuration for path mapping
4. ⏳ Migrate first consumer (main Editor)
5. ⏳ Update remaining consumers one by one
6. ⏳ Remove duplicate implementations
7. ⏳ Update all tests
8. ⏳ Final validation and cleanup

---

*Generated: $(date)*
*Last Updated: $(date)*
