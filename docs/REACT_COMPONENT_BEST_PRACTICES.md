# React Component Best Practices

This document outlines best practices for React components in the Orpheus Engine project, with a focus on common issues and their solutions.

## Boolean Props in DOM Elements

### Problem

When using boolean attributes like `active` or `disabled` in custom components that eventually get passed to DOM elements, React will log warnings like:

```
Warning: Received `false` for a non-boolean attribute `active`.

If you want to write it to the DOM, pass a string instead: active="false" or active={value.toString()}.
```

### Solution

Filter out custom boolean props before passing them to DOM elements. There are several ways to handle this:

1. **Using styled-components with forwarding**:

```tsx
// CORRECT: Filter out custom props in styled-components
const StyledButton = styled(
  ({ active, ...otherProps }) => <button {...otherProps} />
)(({ active }) => ({
  color: active ? 'red' : 'blue'
}));
```

2. **Destructuring props**:

```tsx
function CustomButton({ active, children, ...domProps }) {
  // active is not passed to the <button>
  return <button className={active ? 'active' : ''} {...domProps}>{children}</button>;
}
```

3. **Using `as` component with styled-components**:
   
```tsx
const StyledButton = styled.button<{ active?: boolean }>`
  color: ${props => props.active ? 'red' : 'blue'};
`;
```

## Using forwardRef with Display Names

When using `forwardRef`, always add a display name to improve debugging experience:

```tsx
const MyComponent = React.forwardRef<HTMLDivElement, MyProps>((props, ref) => {
  return <div ref={ref} />;
});

// Add display name
MyComponent.displayName = 'MyComponent';
```

## Ref Forwarding with Styled Components

When using styled-components with components that need to accept refs, make sure to properly forward refs:

### Problem

```tsx
// INCORRECT: This will cause ref warnings
const StyledButton = styled(
  ({ customProp, ...props }) => <button {...props} /> // No ref forwarding
)(...);
```

### Solution

```tsx
// CORRECT: Using forwardRef with styled-components
const ForwardRefButton = React.forwardRef(({ customProp, ...props }, ref) => (
  <button ref={ref} {...props} />
));
ForwardRefButton.displayName = 'ForwardRefButton';

const StyledButton = styled(ForwardRefButton)(...);
```

### When You Need Ref Forwarding

- Components wrapped in Material-UI's `Tooltip` component
- Components that need DOM measurements or focus management
- Custom input components that need to be accessible via forms
- When parent components need direct access to a child DOM element

## Common React Warning Prevention

1. **Key prop in lists**: Always use unique and stable keys for list items

2. **useEffect dependencies**: Include all variables used in the effect in the dependency array

3. **React.memo/useMemo usage**: Use for expensive computations or preventing unnecessary rerenders

4. **Event handler optimization**: Define handlers outside the render function when possible or memoize with useCallback

5. **Avoid direct DOM manipulation**: Use refs instead of direct DOM access

## Common Prop Types Issues

1. **Required vs Optional props**: Clearly mark which props are required

2. **Union types**: Use TypeScript union types for props that can accept multiple formats

3. **Default props**: Define default values for optional props

4. **Children typing**: Properly type the children prop based on what's allowed

## Testing Components

1. **Test rendering**: Ensure components render without errors
2. **Test interactions**: Test button clicks, form submissions, etc.
3. **Test prop changes**: Verify component updates correctly when props change
4. **Test error states**: Ensure components handle error states gracefully
