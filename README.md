# Youtube Community Search - Firefox Extension for YouTube Creators

This is my first browser extension. 

## Overview
YouTube Community Search is a Firefox extension that allows you to search community posts on your YouTube Channel. You can quickly find any post, no matter how long ago you created it. 

## Features
- Search community posts seamlessly. 
- Filter by impressions, likes, date, like rate, and response rate
- Easy to use interface.

## Why I Created this Extension

I've been a YouTuber for about 6 years, and I conduct a lot of polls and question posts on my YT community page. The problem is, if I want to get access to a poll or post older than a few months or years, there's no way to do that without sitting there scrolling for an hour.

I had originally planned on using the YT data API for this project, but YT does not provide post data through their API, so I had to find a workaround. This workaround involved finding the exact url for post information in YT analytics, and programmatically selecting the option "download to csv." After the zip file is downloaded, the extension unzips it, parses the data into JSON, and stores it into web storage for future access.

Now, I can search and find any post I want. I don't know how useful this will be to other YT creators, as I'm known to use the community page more than most, but I hope some people find it as useful as me.

## Installation

To install this extension, follow these steps:

1. Once downloaded, you will have no post data loaded. Click the "update" button to the right.

2. This will request your YouTube Channel Id. This can be found in the web url after navigating to your youtube channel in the browser. It starts with a 'U' and should be right after "youtube.com/channel/".

3. After entering your ID, your will be taken to your post information in YT analytics. Wait a few seconds for the page to fully load, as there's often a lot of data to load, then click "download data."

4. Wait for the counter to count all the way down, and you will be notified when your zip file is downloaded.

5. Click "Go to Home." This will load your posts into your main extension popup.

6. After you complete this process, your posts should load automatically after opening the extension from now on.

7. If you ever want to update your post data, simply click Update -> "Get Latest Data" again. 

8. You can also upload your own zip file with Update --> "Upload Zip File" if you want to get your posts zip file yourself (some may want to select a different time period than 'lifetime,' like 'last 90 days,' or 'past year.').

## Usage

To use this project, follow these steps:

1. Follow steps 7-8 above

## Support
If you encounter any issues or have questions, please reach out to us:
- **Email**: mike@lionhartweb.com
- **GitHub Issues**: [Submit an issue](https://github.com/mlionhart/yt-firefox-extension-v1/issues)

## Changelog

- **v1.0**: Initial release.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

# Extension Information - for Firefox Reviewers

## Use of Minified Libraries
Our extension includes minified versions of third-party libraries:
- **PapaParse**: I used `papaparse.min.js` to parse csv data into json for storage.
- **JSZip**: I used `jszip.min.js` to handle ZIP file manipulation. I needed this to unzip a zip file that is downloaded by the extension.
- **DomPurify**: I used purify.min.js to sanitize most innerHTML property instances to enhance security by preventing XSS attacks
- **Bootstrap**: I used bootstrap.bundle.min.js and bootstrap.min.css to apply Bootstrap styling
- **jQuery**: I used jquery-3.7.1.min.js for Bootstrap

### Security Measures
- **DOMPurify**: Used to sanitize dynamic HTML content to prevent XSS attacks. I was able to use this on all but one innerHTML. The large one slowed the extension down dramatically, and rendered it unusable.
- **Code Review**: Regularly review all code, including third-party libraries, to ensure security and performance standards are met.

## Build Instructions
I did not use any code generators, minifiers, bundlers, or template engines in the build process. The minified files included are standard versions provided by the respective libraries.

### Prerequisites
- Operating System: Any (Windows, macOS, Linux)
- Web Browser: Firefox (latest version recommended)

### Files Included
- `manifest.json`: The manifest file for the extension.
- `popup.html`: The HTML file for the main popup UI.
- `popup2.html`: The HTML file for the secondary popup UI.
- `popup.js`: The JavaScript file for the main popup logic.
- `popup2.js`: The JavaScript file for the secondary popup logic.
- `content.js`: Content script that injects a script to manipulate the browser page.
- `background.js`: Background script for handling background tasks.
- `style.css`: Custom styles for the extension.
- `lib/jquery-3.7.1.min.js`: Minified jQuery library.
- `lib/jszip.min.js`: Minified JSZip library.
- `lib/dompurify.min.js`: Minified DOMPurify library.
- `lib/bootstrap.bundle.min.js`: Minified Bootstrap JavaScript bundle.
- `lib/bootstrap.min.css`: Minified Bootstrap CSS.
- `icons/`: Directory containing extension icons.

### Build Process
1. **Download the Source Code**
   - Ensure all the above-mentioned files are in the same directory structure.

2. **Load the Extension in Firefox**
   - Open Firefox and navigate to `about:debugging`.
   - Click on "This Firefox" in the sidebar.
   - Click on "Load Temporary Add-on".
   - Select the `manifest.json` file from the source code directory.

3. **Verify the Extension**
   - The extension should now be loaded in Firefox. Verify that it works as expected.

## Notes
- No additional build steps, code generators, or minifiers are used in this extension.
- All libraries are included as-is and no compilation or bundling is required.

### Operating System and Build Environment Requirements
- This extension can be built and tested on any operating system that supports Firefox.
- No specific build environment is required other than having Firefox installed.

### Programs Used
- No additional programs such as node or npm are used in the build process.

### Reviewer Notes:
- This extension requires access to a YouTube channel with many community posts to be fully tested.
- For instruction on how to use the extension after installation, see installation instructions towards the beginning of this README file.
- No advanced build tools are used; the extension can be tested directly by loading the `manifest.json` file in Firefox.


