# Fix CORS Error - Step by Step Guide

## Current Issue:
- Frontend: `https://school-system-dfii.vercel.app` ✅
- Backend: `https://school-system-lxrvdmotp-prajwalb0208s-projects.vercel.app` 
- Error: CORS blocking requests from frontend to backend

## Solution Steps:

### Step 1: Set Backend Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **BACKEND project** (`school-system-lxrvdmotp-prajwalb0208s-projects`)
3. Go to **Settings** → **Environment Variables**
4. Add/Update this variable:

   ```
   Name: CLIENT_URL
   Value: https://school-system-dfii.vercel.app
   ```

5. Make sure it's enabled for **Production**, **Preview**, and **Development**
6. Click **Save**

### Step 2: Commit and Push Backend Changes

The backend code has been updated with improved CORS handling. You need to commit and push:

```bash
git add server/server.js server/vercel.json
git commit -m "Fix CORS configuration for Vercel deployment"
git push
```

This will trigger a new deployment automatically.

### Step 3: Manual Redeploy (Alternative)

If you don't want to use git, you can manually redeploy:

1. In Vercel Dashboard → Backend Project
2. Go to **Deployments** tab
3. Click the **3 dots** (⋯) on the latest deployment
4. Click **Redeploy**

**Note:** Make sure `CLIENT_URL` environment variable is set before redeploying!

### Step 4: Verify the Fix

After redeployment:

1. Open your frontend: `https://school-system-dfii.vercel.app`
2. Open browser console (F12)
3. Try signing up
4. Check backend logs in Vercel Dashboard → Backend Project → **Functions** tab
5. You should see: `Allowed CORS origins: [ 'https://school-system-dfii.vercel.app', ... ]`

## What Changed:

1. ✅ Added explicit OPTIONS handler for preflight requests
2. ✅ Added logging to debug CORS issues
3. ✅ Created `vercel.json` for proper Vercel routing
4. ✅ Hardcoded frontend URL as fallback

## Still Having Issues?

Check Vercel backend logs:
1. Go to Backend Project → **Functions** tab
2. Look for any CORS-related errors
3. Check if `CLIENT_URL` is being read correctly

If CORS still fails, temporarily allow all origins for testing:
```javascript
origin: '*' // Only for testing!
```



