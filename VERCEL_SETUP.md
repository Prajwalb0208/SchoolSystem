# Vercel Environment Variables Setup Guide

## Two Issues to Fix:

1. **Frontend Environment Variables** - The React app needs API URL configured in Vercel
2. **Backend CORS** - Already fixed in code, but backend needs to be redeployed

---

## Step 1: Set Frontend Environment Variables in Vercel

Your frontend is deployed at: `https://school-system-dfii.vercel.app`

### Steps:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **frontend project** (`school-system-dfii` or similar)
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

   ```
   Name: REACT_APP_API_URL
   Value: https://school-system-lxrvdmotp-prajwalb0208s-projects.vercel.app/api
   
   Name: REACT_APP_SOCKET_URL
   Value: https://school-system-lxrvdmotp-prajwalb0208s-projects.vercel.app
   
   Name: REACT_APP_BASE_URL
   Value: https://school-system-lxrvdmotp-prajwalb0208s-projects.vercel.app
   ```

5. Make sure to select **Production**, **Preview**, and **Development** environments
6. Click **Save**
7. **Redeploy** your frontend:
   - Go to **Deployments** tab
   - Click the **3 dots** (⋯) on the latest deployment
   - Click **Redeploy**

---

## Step 2: Set Backend Environment Variables in Vercel

Your backend is deployed at: `https://school-system-lxrvdmotp-prajwalb0208s-projects.vercel.app`

### Steps:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **backend project** (`school-system-lxrvdmotp-prajwalb0208s-projects` or similar)
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

   ```
   Name: CLIENT_URL
   Value: https://school-system-dfii.vercel.app
   
   Name: MONGODB_URI
   Value: [Your MongoDB Atlas connection string]
   
   Name: JWT_SECRET
   Value: [Your JWT secret key]
   
   Name: JWT_EXPIRE
   Value: 7d
   
   Name: PORT
   Value: (leave empty - Vercel assigns automatically)
   ```

5. Make sure to select **Production**, **Preview**, and **Development** environments
6. Click **Save**
7. **Redeploy** your backend:
   - Go to **Deployments** tab
   - Click the **3 dots** (⋯) on the latest deployment
   - Click **Redeploy**

---

## Step 3: Verify the Fix

After redeploying both frontend and backend:

1. Open your frontend: `https://school-system-dfii.vercel.app`
2. Open browser console (F12)
3. You should see:
   ```
   API_URL: https://school-system-lxrvdmotp-prajwalb0208s-projects.vercel.app/api
   REACT_APP_API_URL env: https://school-system-lxrvdmotp-prajwalb0208s-projects.vercel.app/api
   ```
4. Try signing up - the CORS error should be gone!

---

## Important Notes:

- **Environment variables are only available at build time** for React apps
- After adding env vars, you **MUST redeploy** for changes to take effect
- The `.env` file only works for local development
- For production on Vercel, always use the dashboard to set environment variables

---

## Troubleshooting:

### Still seeing `localhost:5000`?
- Make sure you redeployed after adding environment variables
- Check that env vars are set for **Production** environment
- Clear browser cache

### Still getting CORS errors?
- Make sure backend is redeployed with the updated CORS config
- Check that `CLIENT_URL` is set correctly in backend env vars
- Verify the frontend URL matches exactly (including https://)


