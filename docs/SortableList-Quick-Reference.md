# SortableList Quick Reference Guide

## Current Implementation Status

⚠️ **WARNING**: Multiple conflicting SortableList implementations exist in this project. See [SortableList-Component-Analysis.md](./SortableList-Component-Analysis.md) for full details.

## Quick Implementation Map

| Location | Status | Usage | Issues |
|----------|--------|-------|--------|
| `/src/components/SortableList.tsx` | ✅ **Primary** | Main Editor/Mixer | Complex thresholds |
| `/src/components/widgets/SortableList.tsx` | 🔄 **Secondary** | Widget exports | Similar to primary |
| `/workstation/frontend/OEW-main/src/components/widgets/SortableList.tsx` | ⚠️ **Conflicting** | Frontend widgets | Simple thresholds |
| `/workstation/frontend/OEW-main/src/components/SortableList.tsx` | ⚠️ **Duplicate** | Frontend main | Redundant |
| `/workstation/shared/packages/components/src/widgets/SortableList.tsx` | ❌ **Stub** | Shared package | Not implemented |

## Interface Differences

### Auto-Scroll Thresholds

**Complex (Main/Widgets):**
```typescript
const autoScroll = {
  thresholds: {
    top: { slow: 5, medium: 10, fast: 20 },
    right: { slow: 5, medium: 10, fast: 20 },
    bottom: { slow: 5, medium: 10, fast: 20 },
    left: { slow: 5, medium: 10, fast: 20 }
  }
};
```

**Simple (Frontend Widgets):**
```typescript
const autoScroll = {
  thresholds: {
    top: 5,
    right: 10, 
    bottom: 15,
    left: 20
  }
};
```

### SortData Interface

**Standard:**
```typescript
interface SortData {
  sourceIndex: number;
  edgeIndex: number;
  destIndex?: number;
}
```

**Stub:**
```typescript
interface SortData {
  sourceIndex: number;
  destIndex: number;
  edgeIndex: number;
}
```

## Current Usage Patterns

### Main Workstation
```typescript
// Editor.tsx and Mixer.tsx
import { SortableList, SortableListItem } from "../components/SortableList";

<SortableList
  autoScroll={complexAutoScroll}
  onSortUpdate={handleSortUpdate}
  onStart={handleStart}
  onEnd={handleEnd}
>
  {items.map((item, idx) => (
    <SortableListItem key={item.id} index={idx}>
      {item.content}
    </SortableListItem>
  ))}
</SortableList>
```

### Frontend Workstation
```typescript
// Frontend Editor.tsx and Mixer.tsx
import { SortableList, SortableListItem } from "../components/widgets/SortableList";

<SortableList
  autoScroll={simpleAutoScroll}
  direction="horizontal"
  onSortUpdate={handleSortUpdate}
  onStart={handleStart}
  onEnd={handleEnd}
>
  {/* Same structure but with simple thresholds */}
</SortableList>
```

## Test Issues

### Current Test Failures
1. **Threshold Structure Mismatch**: Tests expect complex thresholds but some implementations use simple
2. **Interface Conflicts**: SortData properties in different orders
3. **Mock Scope Issues**: Mock variables not accessible across test blocks
4. **Position Calculation Errors**: Off-by-one errors in edge index calculations

### Working Test Pattern
```typescript
// Correct mock setup for complex thresholds
const mockAutoScroll = {
  thresholds: {
    top: { slow: 5, medium: 10, fast: 20 },
    right: { slow: 5, medium: 10, fast: 20 },
    bottom: { slow: 5, medium: 10, fast: 20 },
    left: { slow: 5, medium: 10, fast: 20 },
  },
};

// Move mocks outside describe blocks for global access
const mockOnSortUpdate = vi.fn();
const mockOnStart = vi.fn();
const mockOnEnd = vi.fn();
```

## Migration Guidelines

### DO NOT
- Add new SortableList implementations
- Import from multiple locations in the same file
- Modify the stub implementation directly
- Create new test files for SortableList

### DO
- Use primary implementation (`/src/components/SortableList.tsx`) for new features
- Report interface conflicts as bugs
- Use complex threshold structure in tests
- Reference this documentation when debugging

## Recommended Immediate Actions

1. **For New Development**: Use `/src/components/SortableList.tsx`
2. **For Bug Fixes**: Check all 5 implementations for consistency
3. **For Tests**: Use complex threshold structure
4. **For Frontend**: Understand you're using a different interface

## Future State (Post-Consolidation)

```typescript
// Single import path for entire project
import { SortableList, SortableListItem } from "@shared/components/widgets";

// Unified interface
interface SortableListProps {
  children: React.ReactNode;
  autoScroll?: { thresholds: WindowAutoScrollThresholds };
  cancel?: string;
  direction?: "horizontal" | "vertical";
  onSortUpdate?: (data: SortData) => void;
  onStart?: (event: React.MouseEvent, data: SortData) => void;
  onEnd?: (event: MouseEvent, data: SortData) => void;
}
```

---

⚠️ **This is a temporary reference. See the full analysis document for consolidation plans.**
