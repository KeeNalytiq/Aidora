# Deploying Aidora to Vercel

## Prerequisites
- Vercel account (free tier works)
- Git repository with your code

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to GitHub
```bash
# If not already done
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure as follows:

**Framework Preset:** Vite
**Root Directory:** `frontend`
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

### Step 3: Environment Variables
Add these in Vercel dashboard (Settings → Environment Variables):

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=https://your-backend-api.com
```

### Step 4: Deploy
Click "Deploy" - Vercel will automatically build and deploy!

---

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
cd frontend
vercel
```

Follow the prompts:
- Setup and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **aidora** (or your choice)
- Directory? **./frontend**
- Override settings? **N**

---

## Important Files for Vercel

### ✅ vercel.json (Already Created)
Located at `frontend/vercel.json` - handles React Router routing

### ✅ Build Configuration
Your `package.json` already has:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

---

## Troubleshooting

### 404 Errors on Page Refresh
**Problem**: Routes like `/dashboard` or `/tickets` show 404
**Solution**: The `vercel.json` file handles this ✅

### Build Fails
**Check**:
1. All dependencies in `package.json`
2. Environment variables are set
3. Build runs locally: `npm run build`

### Environment Variables Not Working
**Solution**: 
- Must prefix with `VITE_` for Vite
- Set in Vercel Dashboard → Settings → Environment Variables
- Redeploy after adding variables

### API Calls Failing
**Problem**: Backend API returns CORS errors
**Solution**: Make sure your backend allows the Vercel domain:
```javascript
// In backend
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-vercel-app.vercel.app'
  ]
}));
```

---

## Deployment Checklist

- [ ] `vercel.json` file in `frontend` directory
- [ ] Environment variables configured in Vercel
- [ ] Backend CORS allows Vercel domain
- [ ] Build script works locally (`npm run build`)
- [ ] Firebase credentials are correct
- [ ] API URL points to deployed backend

---

## After Deployment

Your site will be live at:
```
https://your-project-name.vercel.app
```

### Custom Domain (Optional)
1. Go to Vercel dashboard → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Full Stack Deployment

### Frontend (Vercel) ✅
- Deploy as described above

### Backend (Options)
1. **Render.com** (Free tier available)
2. **Railway.app** (Free tier available)
3. **Heroku** (Free tier deprecated, but alternatives exist)
4. **Firebase Cloud Functions** (If using Firebase)

### NLP Service (Options)
1.  **Railway.app** (supports Python)
2. **Google Cloud Run**
3. **AWS EC2** (free tier)

---

## Pro Tips

1. **Auto-Deploy**: Vercel automatically redeploys when you push to GitHub
2. **Preview Deployments**: Every PR gets a preview URL
3. **Environment per Branch**: Set different variables for production/staging
4. **Analytics**: Enable Vercel Analytics in dashboard (optional)

---

**Need Help?** Check Vercel logs in Dashboard → Deployments → View Function Logs
