# Install Updatable Third-Party Apps on LG TVs

Install third-party apps on LG TVs using **webOS Dev Manager** and **LG Developer Mode auto-renewal** - completely free.

**Requirement**: LG TV running webOS 2015+
- Install extra apps not available on the LG Content Store, such as:
  - [Ad-free YouTube](https://github.com/webosbrew/youtube-webos/) (with SponsorBlock)
  - [Kodi](https://kodi.tv/)
- Does *not* void your warranty
- [Rooting](https://www.webosbrew.org/rooting/) is *not* needed 
- Safe if done correctly
- Beginner-friendly guide

## Guide

### Pair TV to Computer & Install Homebrew

1. Follow the steps **[here](https://www.webosbrew.org/devmode)** to enable Developer Mode on your TV. 
   - Leave the Developer Mode app running.
2. Install the latest **[webOS Dev Manager](https://github.com/webosbrew/dev-manager-desktop/releases)**
   - Download the version under **Assets** for your OS.
3. Open **webOS Dev Manager**:  
   - Select **Use Developer Mode** → Next → Skip  
   - Copy the **Paraphrase** and **IP Address** from the Developer Mode app on your TV  
   - Paste both into the Dev Manager and click **Finish**
4. In the Dev Manager app:  
   - Click **Apps** → **Available**  
   - Install the **Homebrew Channel** app
5. You may now **close the Developer Mode app** on your TV

### Using Homebrew Channel

1. Press the **Home** button on your remote
2. Open the **Homebrew Channel** app
3. Browse the available third-party apps and install as needed

The **YouTube Ad-free** app requires you to uninstall the stock YouTube app first.

You’ll also update apps from this same interface in the future.

### Auto-Renew Developer Mode (Recommended)

> [!important]  
> LG Developer Mode expires after **42 days**, which deletes Homebrew apps. 
> Use this method to keep it refreshed automatically

1. Open the **Homebrew Channel**
2. Install the **Auto Dev Token Refresh** app
3. Open the app and click **Renew Automatically**
4. *(Optional)* You can delete the app - the auto-renewal will stay active

## Other Recommended Apps

- [Stremio](https://www.stremio.com) - Free streaming app

Install via LG Content Store. [How to Use Stremio](https://bye.undi.rest)

- [Jellyfin](https://jellyfin.org) - Free and open-source media server

Install via LG Content Store or Homebrew Channel (for faster updates). [Jellyfin Clients / Tools](https://fmhy.net/video-tools#jellyfin-tools)

---
Proudly backed by [FMHY](https://fmhy.net/) and [webOS Homebrew](https://www.webosbrew.org/). 

Guide Written by [wispy](https://gist.github.com/VVispy/)
