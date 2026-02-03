# 🚀 Deployment Guide

This application is configured to be deployed as a **Monolithic Application** (Frontend + Backend served together) or as separate services. 

The **easiest way** to deploy this full-stack application for free is using **Render**.

## Option 1: Deploy on Render.com (Recommended)

Render can host both your Node.js backend and React frontend together.

### 1. Requirements
- A GitHub account.
- The project pushed to a GitHub repository (You have already done this!).
- A MongoDB Atlas URI (You already have this).
- Razorpay API Keys.

### 2. Steps to Deploy

1.  **Sign up/Login to [Render.com](https://render.com/)**.
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository (`BusBee`).
4.  Configure the service:
    *   **Name**: `busbee-app` (or any unique name)
    *   **Region**: Singapore (or nearest to you)
    *   **Branch**: `main`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install && npm run build`
        *   *Note: This runs the script in `package.json` that installs frontend dependencies and builds the React app.*
    *   **Start Command**: `npm start`
5.  **Environment Variables**:
    Click on **"Advanced"** or **"Environment"** and add the following keys from your `.env` file:

    | Key | Value (Example) |
    | :--- | :--- |
    | `NODE_ENV` | `production` |
    | `MONGODB_URI` | `mongodb+srv://...` (Your actual secure connection string) |
    | `JWT_SECRET` | `your_jwt_secret` |
    | `SESSION_SECRET` | `your_session_secret` |
    | `RAZORPAY_KEY_ID` | `rzp_test_...` |
    | `RAZORPAY_KEY_SECRET`| `your_razorpay_secret` |
    | `REACT_APP_RAZORPAY_KEY_ID` | `rzp_test_...` (Same as above, needed for frontend build) |
    | `CLIENT_URL` | `https://your-app-name.onrender.com` (The URL Render gives you) |
    | `REACT_APP_BACKEND_URL` | `https://your-app-name.onrender.com` (Same as above) |

    > **Important:** Make sure `CLIENT_URL` matches the URL Render generates for you (e.g., `https://busbee.onrender.com`). You might need to deploy once, get the URL, update the var, and redeploy.

6.  Click **Create Web Service**.

### 3. Verify Deployment
Render will start building your app. It will:
1.  Install backend dependencies.
2.  Go into the `frontend` folder and install frontend dependencies.
3.  Build the React app into `frontend/build`.
4.  Start the Node.js server.

Once it says **"Live"**, your app is running!

---

## Option 2: Deploy on Vercel (Frontend) + Render (Backend)

If you prefer to host the frontend separately on Vercel for better performance:

### Backend (Render)
Follow the steps above but:
1.  **Build Command**: `npm install` (Only backend deps)
2.  **Start Command**: `node server.js`
3.  **Env Var**: `CLIENT_URL` = `https://your-vercel-app.vercel.app`

### Frontend (Vercel)
1.  Go to [Vercel](https://vercel.com) -> New Project.
2.  Import your git repo.
3.  **Root Directory**: Click "Edit" and select `frontend`.
4.  **Environment Variables**:
    *   `REACT_APP_BACKEND_URL`: `https://your-render-backend.onrender.com/api` (Point to your active backend)
    *   `REACT_APP_RAZORPAY_KEY_ID`: `rzp_test_...`
5.  Deploy.

---

## Troubleshooting

-   **White screen on frontend?**
    Check if the `build` script ran successfully. The backend expects `frontend/build` folder to exist.
-   **API Errors?**
    Check `CLIENT_URL` in backend env and `REACT_APP_BACKEND_URL` in frontend env. They must match the live URLs.
-   **MongoDB Connection Error?**
    Ensure your MongoDB Atlas "Network Access" allows access from "Anywhere" (`0.0.0.0/0`) since Render IPs change.
