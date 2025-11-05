# Sign In Troubleshooting Guide

## What to Check:

### 1. Check Browser Console (F12)
Open browser console and look for:
- Network errors
- CORS errors
- API errors
- Login attempt logs

### 2. Verify Backend is Deployed
- Go to Vercel Dashboard → Backend Project
- Check latest deployment status
- Should show "Ready" ✅

### 3. Test Backend Directly
Try this URL in your browser:
```
https://school-system-lxrvdmotp-prajwalb0208s-projects.vercel.app/api/notes
```

If this works, backend is deployed. If not, backend needs deployment.

### 4. Check Environment Variables
**Frontend (Vercel):**
- `REACT_APP_API_URL` = `https://school-system-lxrvdmotp-prajwalb0208s-projects.vercel.app/api`

**Backend (Vercel):**
- `MONGODB_URI` = Your MongoDB connection string
- `JWT_SECRET` = Your secret key
- `CLIENT_URL` = `https://school-system-dfii.vercel.app` (optional)

### 5. Verify Account Exists
- Make sure you've signed up first
- Check username/password are correct
- Username is case-sensitive

### 6. Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to sign in
4. Look for `/api/auth/student/login` request
5. Check:
   - Status code (should be 200)
   - Response body
   - Request headers

## Common Issues:

### Issue: "Invalid credentials"
**Solution:**
- Make sure you've signed up first
- Check username spelling (case-sensitive)
- Check password is correct
- Try signing up again with a new account

### Issue: Network Error / CORS Error
**Solution:**
- Backend needs to be redeployed with CORS fix
- Check deployment status in Vercel
- Wait 1-2 minutes after deployment

### Issue: "Server error" or 500 Error
**Solution:**
- Check MongoDB connection in backend
- Verify MongoDB Atlas IP whitelist
- Check backend logs in Vercel Dashboard → Functions

### Issue: "Login failed" (generic)
**Solution:**
- Check browser console for detailed error
- Check Network tab for actual error response
- Verify API_URL is correct

## Quick Test:

1. **Sign Up First** (if you haven't):
   - Go to Sign Up page
   - Create a student account
   - Note your username and password

2. **Then Sign In**:
   - Use exact username and password from signup
   - Select correct user type (student/teacher)

3. **Check Console Logs**:
   - Should see: `Login attempt: { username, userType, API_URL }`
   - Should see API response or error details

## Still Not Working?

Check Vercel backend logs:
1. Go to Backend Project → **Functions** tab
2. Click on latest function invocation
3. Check logs for errors

Or check backend logs locally:
```bash
cd server
npm start
# Try signing in and watch console for errors
```

