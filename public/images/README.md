# Open Graph Image Files

This directory contains image files used for social media sharing via Open Graph and Twitter Cards metadata.

## Required Images

Please create and add the following image files to this directory:

1. `og-image-desktop.jpg` - Open Graph image for the desktop application (1200×630px)
2. `twitter-image-desktop.jpg` - Twitter Card image for the desktop application (1200×630px)
3. `og-image-browser.jpg` - Open Graph image for the browser version (1200×630px)
4. `twitter-image-browser.jpg` - Twitter Card image for the browser version (1200×630px)

## Image Requirements

- **Format**: JPG or PNG (JPG recommended for smaller file size)
- **Dimensions**: 1200×630 pixels (aspect ratio of 1.91:1)
- **Maximum file size**: Keep under 1MB (ideally under 300KB for better performance)
- **Content**: Include the Orpheus Engine logo, product screenshot, and minimal text

## Best Practices

1. **Keep text minimal**: Facebook recommends using less than 20% of the image for text
2. **Use high contrast**: Ensure text is legible on all backgrounds
3. **Include branding**: Add your logo to maintain brand consistency
4. **Test your images**: Use the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## Example Content for Images

- Desktop version: Show the full Orpheus Engine Workstation interface with tracks, mixer, and timeline
- Browser version: Show the browser interface highlighting web-specific features

## Technical Notes

These images are referenced in the `<meta>` tags in both `index.html` and `browser.html` files.
