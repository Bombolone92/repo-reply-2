# Fix for GitHub Issue #291: CopilotSidebar Import Error

## 🐛 **Issue**
User encounters error: `'CopilotSidebar' is not exported from '@copilotkit/react-ui'`

## 🔍 **Root Cause**
The user **did not run `npm install`** after cloning/pulling the repository, causing missing or outdated CopilotKit dependencies.

## ✅ **Solution**

### **Step 1: Clean Install Dependencies**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**For Windows PowerShell:**
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install
```

### **Step 2: Verify CopilotKit Installation**

Check that the following packages are installed:
```bash
npm list @copilotkit/react-core @copilotkit/react-ui @copilotkit/shared
```

Expected output:
```
@copilotkit/react-core@1.10.3
@copilotkit/react-ui@1.10.3
@copilotkit/shared@1.10.3
```

### **Step 3: Build the Frontend**

```bash
npm run build
```

### **Step 4: Start Development Server**

```bash
npm start
```

## 📋 **Complete Setup Instructions for New Users**

### **Frontend Setup:**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file from template
cp env_template.txt .env

# Add your environment variables to .env:
# REACT_APP_CLERK_PUBLISHABLE_KEY=<your-clerk-key>
# REACT_APP_COPILOTKIT_API_KEY=<your-copilotkit-key>

# Build the project
npm run build

# Start development server
npm start
```

### **Backend Setup:**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
cp env_template.txt .env

# Add your environment variables to .env

# Initialize database tables
python scripts/create_subscription_tables.py

# Start backend server
python app.py
```

## 🎯 **Why This Happens**

1. **Missing `node_modules`**: Package dependencies not installed
2. **Outdated packages**: Old version of CopilotKit that doesn't export `CopilotSidebar`
3. **Skipped installation**: Running `npm start` before `npm install`

## ✅ **Verification**

After following the steps above, you should see:
- ✅ No import errors for `CopilotSidebar`
- ✅ Frontend compiles successfully
- ✅ Development server starts on `http://localhost:3000`
- ✅ Backend API accessible on `http://localhost:8000`

## 📚 **Reference**

- [CopilotKit UI Components Documentation](https://docs.copilotkit.ai/crewai-crews/custom-look-and-feel/built-in-ui-components)
- CopilotKit exports: `CopilotChat`, `CopilotSidebar`, `CopilotPopup` from `@copilotkit/react-ui`

## 🚨 **Common Mistakes to Avoid**

1. ❌ Running `npm start` without `npm install` first
2. ❌ Using outdated `package-lock.json`
3. ❌ Missing environment variables in `.env` files
4. ❌ Not running database migration scripts for backend

## 💡 **Pro Tip**

Always run these commands after pulling new code:
```bash
# Frontend
cd frontend && npm install && npm run build

# Backend
cd backend && pip install -r requirements.txt
```

---

## 🐛 **Issue: "Failed to process subscription" (500 Error)**

**Symptoms:**
- User selects Free or Basic plan on Pricing page
- Clicks "Subscribe to [Plan]"
- Gets error: "Failed to process subscription"
- Backend logs: `name 'UsageStatus' is not defined`

**Root Cause:**
Missing `UsageStatus` import in `backend/api/subscription_api.py`

**Fix:**
✅ Already fixed in latest version. Update to latest code:

```bash
git pull origin main
cd backend
python app.py  # Restart backend
```

**Verify Fix:**
Check that `backend/api/subscription_api.py` line 18 includes:
```python
from models.subscription_models import (
    ..., UsageStatus  # <-- This should be present
)
```

