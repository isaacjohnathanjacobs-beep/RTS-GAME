# Troubleshooting Guide

## Common Issues and Solutions

### 1. CORS Error / "Cross origin requests" Error

**Error Message:**
```
Access to script at 'file:///.../src/main.js' from origin 'null' has been blocked by CORS policy
```

**Cause:** Browsers block ES modules from loading via `file://` protocol for security reasons.

**Solution:** Run a local web server instead of opening the file directly.

**How to fix:**
1. **Easiest**: Double-click `start-server.bat` (Windows) or run `./start-server.sh` (Mac/Linux)
2. **Python**: Run `python -m http.server 8000` in the project folder
3. **Node.js**: Run `npx http-server -p 8000` in the project folder
4. **VS Code**: Install "Live Server" extension and use it

Then open http://localhost:8000 in your browser.

---

### 2. Models Not Loading / Black Screen

**Symptoms:** Game loads but you see a black screen or no characters appear.

**Possible Causes:**
- FBX files not in the correct location
- Web server not serving from the correct directory
- Assets still loading

**Solutions:**
1. Make sure you're running the server from the project root directory (where `index.html` is)
2. Wait longer - FBX files are large and take time to load
3. Check browser console (F12) for specific error messages
4. Ensure all `.fbx` files are in the root directory alongside `index.html`

---

### 3. Animations Not Playing

**Symptoms:** Characters appear but don't move or animate.

**Solutions:**
1. Check that all animation FBX files are present
2. Look at browser console for animation loading errors
3. Ensure the character model FBX is loaded before animations
4. Try refreshing the page

---

### 4. Controls Not Responding

**Symptoms:** Can't select units or give commands.

**Solutions:**
1. Make sure the game has finished loading (wait for "Game Started!" message)
2. Click on the game canvas to ensure it has focus
3. Try right-clicking on units after selecting them
4. Check browser console for JavaScript errors

---

### 5. Performance Issues / Low FPS

**Symptoms:** Game runs slowly or stutters.

**Solutions:**
1. Close other browser tabs and applications
2. Use a modern browser (Chrome or Firefox recommended)
3. Ensure your GPU drivers are up to date
4. Reduce browser zoom level to 100%
5. Try a different browser

---

### 6. Units Not Moving

**Symptoms:** Units selected but won't move when you right-click.

**Solutions:**
1. Make sure pathfinding is initialized (check console)
2. Try clicking closer to the units
3. Units may be stuck - try selecting and stopping them (S key)
4. Refresh the page and try again

---

### 7. "Module not found" Error

**Error Message:**
```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/plain"
```

**Cause:** Server not configured to serve `.js` files with correct MIME type.

**Solutions:**
1. Use the provided launcher scripts (`start-server.bat` or `start-server.sh`)
2. Use Python's http.server which handles MIME types correctly
3. Configure your web server to serve `.js` files with `application/javascript` MIME type

---

### 8. Blank White Screen

**Symptoms:** Page loads but shows only white screen.

**Solutions:**
1. Open browser console (F12) to check for errors
2. Ensure all JavaScript files are loading correctly
3. Check that Three.js is loading from CDN (requires internet connection)
4. Try clearing browser cache and refreshing

---

## Checking for Errors

To see detailed error messages:
1. Press **F12** to open Developer Tools
2. Click the **Console** tab
3. Look for red error messages
4. Copy the error message and search for it in this guide

## Still Having Issues?

If you're still experiencing problems:
1. Check that all files are present (use `ls` or `dir` command)
2. Verify FBX files are not corrupted
3. Try a different browser
4. Check that you have a stable internet connection (for Three.js CDN)
5. Look at browser console for specific error messages

## System Requirements

**Minimum:**
- Modern browser with WebGL 2.0 support
- 4GB RAM
- Integrated GPU

**Recommended:**
- Chrome 90+ or Firefox 88+
- 8GB RAM
- Dedicated GPU
- Stable internet connection (for CDN assets)

## Browser Compatibility

**Fully Supported:**
- Chrome 90+
- Firefox 88+
- Edge 90+

**Limited Support:**
- Safari 14+ (may have performance issues)

**Not Supported:**
- Internet Explorer (use Edge instead)
- Very old browser versions
