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
