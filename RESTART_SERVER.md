# How to Restart the Server

## Steps:

1. **Stop the current server** (if running):
   - Press `Ctrl+C` in the terminal where server is running
   - Or close the terminal window

2. **Kill any process on port 5000** (if needed):
   ```bash
   # PowerShell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
   
   # Or use:
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

3. **Start the server**:
   ```bash
   cd server
   node server.js
   ```

4. **Verify it's running**:
   - You should see: "Server running on port 5000"
   - You should see: "MongoDB Connected"
   - Open browser: http://localhost:5000

5. **Rebuild React app** (if needed):
   ```bash
   cd client
   npm run build
   ```

## Quick Commands:

### Option 1: Using Batch File
```bash
START_SERVER.bat
```

### Option 2: Using npm
```bash
cd server
npm start
```

### Option 3: Using nodemon (auto-restart on changes)
```bash
cd server
npm run dev
```

## Troubleshooting:

- **Port in use**: Kill the process or change PORT in `server/.env`
- **MongoDB not connected**: Start MongoDB or update MONGODB_URI
- **CORS errors**: Server should now allow requests from both ports
- **404 on API**: Make sure routes are registered before catch-all route

