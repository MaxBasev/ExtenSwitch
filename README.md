# ExtenSwitch for Chrome

<p align="center">
  <img src="images/Promo.png" alt="ExtenSwitch Promo" width="100%">
</p>

Modern extension for easily managing Chrome extensions with just one click. ExtenSwitch provides a clean, intuitive interface to control your browser extensions, perfect for managing crypto wallets and other extensions you want to enable only when needed.

[![Available in the Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-blue?style=for-the-badge&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/pkgomffofapfpgmebfcdjnchjleflpcn?authuser=1&hl=en)

## Features

- **Smart Profiles**: Save snapshots of your current setup (New!)
- **Quick Toggle**: Enable/disable any Chrome extension with a single click
- **Smart Search**: Find extensions instantly by name
- **Convenient Filters**: View all, enabled, or disabled extensions
- **Easy Configuration**: Access extension settings with one click
- **Clear Labeling**: Deprecated extensions are clearly marked
- **User-Friendly Stats**: See the number of extensions in each category
- **Elegant Design**: Modern and minimalist interface
- **Smart Sorting**: Enabled extensions appear at the top for easy access

## Screenshots

<p align="center">
  <img src="images/Screen-1.png" alt="ExtenSwitch Main Interface" width="400">
</p>

<p align="center">
  <img src="images/Screen-2.png" alt="ExtenSwitch Filtering Extensions" width="400">
</p>

## Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store page](https://chromewebstore.google.com/detail/pkgomffofapfpgmebfcdjnchjleflpcn?authuser=1&hl=en)
2. Click "Add to Chrome"
3. Confirm the installation

### From Source
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the upper right corner)
4. Click the "Load unpacked extension" button
5. Select the folder with this project

## Usage

After installation, you will see the ExtenSwitch icon in the Chrome toolbar. Click on it to open the extension manager.

- **Use Profiles**: Click the Bookmark icon to save or restore extension snapshots (e.g. "Work", "Crypto", "All Off")
- **Enable/disable extensions**: Use the toggle to the right of each extension
- **Search for extensions**: Enter the extension name in the search field
- **Filter extensions**: Use the "Enabled", "Disabled", or "All" tabs to view different sets of extensions
- **Access extension settings**: Click on the extension name to open its settings
- **View in Chrome Web Store**: Click the play button ▶ to open the extension's page in Chrome Web Store
- **Identify deprecated extensions**: Clearly marked with a "DEPRECATED" label

## Privacy

ExtenSwitch respects your privacy. The extension operates solely within your browser and does not communicate with external servers.

- No data collection
- No analytics
- No external communication

For more details, please see [About app on my blog](https://blog.maxbasev.com/webdev/the-journey-of-creating-extenswitch/).

## Development

ExtenSwitch is built with pure JavaScript, HTML, and CSS - no frameworks or external dependencies. This makes the extension extremely lightweight and fast.

### Project Structure
- `manifest.json` - Extension configuration
- `popup.html` - Main interface
- `popup.js` - Core functionality
- `styles.css` - Visual styling
- `background.js` - Background service worker
- `images/` - Icons and promotional images

## Future Plans

- Dark theme toggle for better night-time usage
- Export/import extension configuration
- Hotkeys for quick access to common functions
- Localization for multiple languages

## Credits

Developed by [SkazOff](https://skazoff.com/)

## License

This project is licensed under the MIT License. 