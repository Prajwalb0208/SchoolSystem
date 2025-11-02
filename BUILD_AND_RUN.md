# Build and Run Instructions

## Option 1: Build First, Then Run (Production Mode)

This is the recommended approach to avoid service worker and caching issues.

### Step 1: Build the React App
```bash
cd client
npm run build
```

### Step 2: Start the Server (Serves Built App)
```bash
cd ../server
node server.js
```

Or use the combined command:
```bash
npm run build-and-start
```

The app will be available at: **http://localhost:5000**

The server now serves the built React app from the `client/build` folder.

## Option 2: Development Mode (Hot Reload)

```bash
npm run dev
```

This runs both frontend (port 3000) and backend (port 5000) simultaneously.

## What Changed

1. **Server Updated**: The Express server now serves the built React app
   - Static files from `client/build` are served
   - API routes are at `/api/*`
   - All other routes return the React app (for client-side routing)

2. **Homepage**: Set to `"."` in `client/package.json` to ensure correct paths

3. **Build Output**: The build creates optimized production files in `client/build/`

## Benefits of Building First

- ✅ No service worker issues
- ✅ No webpack dev server caching problems
- ✅ Production-ready optimized bundle
- ✅ Single server to manage
- ✅ Better performance

## Access the Application

After running the server:
- Open: **http://localhost:5000**
- The React app is served from the backend
- All API calls work normally
- Socket.io still works for real-time features

## Troubleshooting

If you see errors after building:
1. Make sure the build completed successfully
2. Check that `client/build` folder exists
3. Verify server is running on port 5000
4. Clear browser cache (Ctrl+Shift+R)

