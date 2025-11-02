# Server Status & Troubleshooting

## Quick Start Server

### Option 1: Use Batch File (Windows)
```bash
START_SERVER.bat
```

### Option 2: Manual Start
```bash
cd server
node server.js
```

### Option 3: Using npm
```bash
cd server
npm start
```

## Check if Server is Running

Open browser and go to: **http://localhost:5000**

You should see the React app or a response from the API.

## If Port 5000 is Already in Use

### Kill Process on Port 5000:
```bash
# Windows PowerShell
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Or use the batch file:
KILL_PORT_5000.bat
```

### Or Change Port:

1. Create/Edit `server/.env`:
```env
PORT=5001
```

2. Update `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
```

3. Rebuild client:
```bash
cd client
npm run build
```

4. Restart server

## Verify Server is Running

```bash
# Check if port is listening
netstat -ano | findstr :5000 | findstr LISTENING

# Test API endpoint
curl http://localhost:5000/api/notes
```

## Common Issues

### ERR_CONNECTION_REFUSED
- **Cause**: Server is not running
- **Fix**: Start the server using one of the methods above

### Port Already in Use
- **Cause**: Another process is using port 5000
- **Fix**: Kill the process or change port

### MongoDB Connection Error
- **Cause**: MongoDB is not running
- **Fix**: Start MongoDB or update MONGODB_URI in `server/.env`

### Questions Not Found (404)
- **Cause**: Database not seeded
- **Fix**: Run `cd server && npm run seed`

