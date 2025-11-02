# Troubleshooting Guide

## Error: "Unexpected token '<'" 

This error occurs when JavaScript files are receiving HTML instead of JS. Common causes and solutions:

### Solution 1: Clear Browser Cache and Service Workers

1. **Open Developer Tools** (F12)
2. **Go to Application tab** (Chrome) or **Storage tab** (Firefox)
3. **Clear Storage**:
   - Click "Clear site data" or "Clear storage"
   - Check all boxes
   - Click "Clear site data"

4. **Unregister Service Workers**:
   - Go to Application > Service Workers (Chrome)
   - Click "Unregister" for all service workers
   - Or run in browser console:
     ```javascript
     navigator.serviceWorker.getRegistrations().then(function(registrations) {
       for(let registration of registrations) {
         registration.unregister();
       }
     });
     ```

5. **Hard Refresh**:
   - Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

### Solution 2: Clear npm Cache and Reinstall

```bash
cd client
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm start
```

### Solution 3: Check if Dev Server is Running Correctly

1. **Stop the dev server** (Ctrl+C)
2. **Check if port 3000 is free**:
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :3000
   
   # If port is in use, kill the process or change port
   ```

3. **Start fresh**:
   ```bash
   cd client
   npm start
   ```

4. **Check the console** - should see:
   ```
   Compiled successfully!
   webpack compiled successfully
   ```

### Solution 4: Check for Port Conflicts

If port 3000 is already in use, React will suggest another port. Make sure you're accessing the correct port shown in the terminal.

### Solution 5: Verify File Structure

Ensure these files exist:
- `client/src/index.js`
- `client/src/App.js`
- `client/public/index.html`
- `client/package.json`

### Solution 6: Disable Browser Extensions

Some browser extensions can interfere with local development:
1. Try **Incognito/Private mode**
2. Disable extensions one by one
3. Use a different browser

### Solution 7: Check Network Tab

1. Open **Developer Tools** > **Network tab**
2. Look for failed requests (red)
3. Check what's being returned for `.js` files
4. If they return HTML, it's a routing/cache issue

### Solution 8: Reset React Scripts

```bash
cd client
npm uninstall react-scripts
npm install react-scripts@5.0.1
npm start
```

## Common Issues

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in package.json
# Add to scripts: "start": "set PORT=3001 && react-scripts start"
```

### Module Not Found
```bash
cd client
rm -rf node_modules
npm install
```

### Build Errors
```bash
cd client
npm run build
# Check build folder for errors
```

## Still Having Issues?

1. **Check React Scripts Version**: Should be 5.0.1
2. **Node Version**: Use Node.js 14.x or higher
3. **Clear Everything**:
   ```bash
   cd client
   rm -rf node_modules package-lock.json build
   npm cache clean --force
   npm install
   npm start
   ```

4. **Check for conflicting processes**:
   - Close other React apps
   - Close VS Code if it has a terminal running React
   - Restart your computer if needed

