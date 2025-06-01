# Orpheus Engine Workstation

Orpheus Engine Workstation (OEW) is Digital Audio & Video Workstation coded in React and Typescript.

![OEW Development May 2025](/assets/screenshots/2022-12-20.png)

## Setup

1. Clone this repository and enter the resulting directory
2. Run `npm install`

## To Run

1. Run `npm run dev`

## To Build and Package

1. Run `npm run build`
2. The packaged application will be located in the `dist` folder.

<hr>

## Notes

- User interface is the only functional aspect of this project as of May 4, 2025.
- Audio, will need to be implemented.
- Main functionality is prioritized over performance as of May 4, 2025. The project may feel slow when a large number of tracks are present.

## WindowAutoScroll Component Fixes

- Fixed a TypeScript error where the `thresholds` prop could be a number or an array of objects, but the code assumed it was always an array.
- Improved code readability by replacing nested ternary operators with `if/else if/else` statements.
- Fixed a bug where the component would scroll in the wrong direction when the scroll amount was negative.

## Extending the AudioSearch API

The AudioSearch context and provider are designed to be modular and extensible. You can add new search context fields (such as instrument, genre, etc.) by updating the `AudioSearchContext` and passing additional parameters to the `search` function.

### How to Add New Search Context Fields

1. **Update the `AudioSearchContext`**
   - Edit `src/contexts/AudioSearchContext.tsx`.
   - The `search` function accepts a second argument: `context: Record<string, any> = {}`. You can pass any additional fields here.
   - Example:
     ```ts
     await search(query, { instrument: 'piano', genre: 'jazz' });
     ```

2. **Update the UI to Collect Extra Context**
   - In your search component (e.g., `AudioSearch.tsx`), add new input fields for the extra context (e.g., instrument dropdown).
   - Pass these values to the `search` function.

3. **Update the Backend (if needed)**
   - If your backend supports filtering by new fields, update the API to accept and use them.

### Example: Adding Instrument Context

```tsx
// In your component:
const [instrument, setInstrument] = useState('');
const handleSearch = async () => {
  await search(queryInput, { instrument });
};
```

The context and API are designed to be flexible, so you can add as many fields as needed for your use case.
