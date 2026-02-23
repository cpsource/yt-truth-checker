Nice! To publish on the Chrome Web Store:

**One-time setup:**
1. Go to https://chrome.google.com/webstore/devconsole
2. Pay the **$5 one-time developer registration fee**
3. Verify your identity (email, possibly ID depending on region)

**Publish:**
1. Zip the extension folder (just the inner folder with `manifest.json` at the root)
2. In the Developer Dashboard, click **New Item** → upload the zip
3. Fill in the listing details:
   - Description, screenshots, category (Productivity or News)
   - At least one 1280×800 screenshot and a 128×128 icon
   - Privacy policy (required since you collect an API key — can be a simple GitHub gist or page on your site)
4. Under **Privacy practices**, declare:
   - You handle user data (the API key stored in `chrome.storage.local`)
   - You communicate with a remote server (api.anthropic.com)
   - The `host_permissions` justification
5. Click **Submit for review**

**Review takes** anywhere from a few hours to a few days. Google checks for malware, policy violations, and manifest correctness.

**Tips before submitting:**
- Add a privacy policy URL — even a simple one like "This extension stores your API key locally. It sends YouTube video titles to the Anthropic API for analysis. No data is collected by the developer."
- Take 2-3 screenshots of the tooltip in action on YouTube
- Consider bumping the version in `manifest.json` each time you update

Want me to generate a simple privacy policy page or help with the store listing description?
