# Owner Note Chrome Extension

A Chrome extension that automatically replaces XRPL wallet addresses on supported websites with human-readable names from your imported list.

## Features

- **Address Recognition**: Automatically detects and replaces XRPL wallet addresses with customizable names
- **Local Storage**: All data is stored locally in your browser using Chrome storage API
- **No External Servers**: No data is transmitted to external servers or third parties
- **User-Friendly Interface**: Simple popup interface to manage your address list
- **Toggle Functionality**: Easily enable or disable address replacement with a single click
- **Hovercard Details**: View full details by hovering over replaced addresses
- **Search Functionality**: Quickly find addresses or names in your imported list
- **Copy to Clipboard**: One-click copy for addresses and names

## How It Works

1. Import your XRPL address groups through the Owner Note website
2. Browse any website with XRPL addresses
3. The extension automatically recognizes and replaces addresses with your custom names
4. Hover over replaced names to see full details including the original address

## Privacy

- The Owner Note extension stores XRPL address-to-name mappings locally using the Chrome storage API
- No data is transmitted to external servers or third parties
- The extension does not collect any personal information, browsing history, or user activity
- All data stays within your browser and is used solely for improving address readability on supported websites

## Installation

1. Download the extension from the Chrome Web Store
2. Click on the extension icon in your browser toolbar
3. Visit [Owner Note Website](https://owner-note.shirome.net/owners/) to import your address list
4. Start browsing with improved address readability!

## Development

### Project Structure
- `background.js` - Background service worker for extension
- `content.js` - Main content script that runs on all pages
- `inject-collect-owner-note-data.js` - Collects address data from the Owner Note website
- `inject-replace-addresses.js` - Replaces addresses on web pages
- `popup.html/js` - Extension popup interface
- `manifest.json` - Extension configuration

### Build and Install Locally
1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory
5. The extension should now be installed and active

## License

MIT License

## Contact

For support or feature requests, please fill out the contact form in the extension popup.
