# Railway Deployment Guide

## Prerequisites
- Railway account ([railway.app](https://railway.app))
- MongoDB Atlas account ([mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 Sandbox)
3. Create a database user:
   - Go to **Database Access** → **Add New Database User**
   - Username: `landslide-admin` (or your choice)
   - Password: Generate a secure password
   - Database User Privileges: **Read and write to any database**

4. Whitelist all IPs:
   - Go to **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (0.0.0.0/0)
   - This is needed for Railway to connect

5. Get your connection string:
   - Go to **Database** → **Connect** → **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `landslide-system`
   
   Example:
   ```
   mongodb+srv://landslide-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/landslide-system?retryWrites=true&w=majority
   ```

## Step 2: Deploy to Railway

1. Go to [Railway](https://railway.app) and sign in with GitHub

2. Click **New Project** → **Deploy from GitHub repo**

3. Select your `Landslide-backend` repository

4. Add environment variable:
   - Click on your service
   - Go to **Variables** tab
   - Click **+ New Variable**
   - Add:
     ```
     MONGO_URI=mongodb+srv://landslide-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/landslide-system?retryWrites=true&w=majority
     ```
   - Replace with your actual MongoDB Atlas connection string

5. Railway will automatically:
   - Detect it's a Node.js app
   - Run `npm install`
   - Run `npm start`
   - Assign a public URL

6. Your backend will be live at: `https://your-app.railway.app`

## Step 3: Test Your Deployment

Test the API:
```bash
curl https://your-app.railway.app/
# Should return: "Landslide Alert System Backend is Running"

curl https://your-app.railway.app/api/thresholds
# Should return default thresholds
```

## Troubleshooting

### Deployment fails with "MONGO_URI not set"
- Make sure you added the `MONGO_URI` variable in Railway
- Check that the connection string is correct
- Verify your MongoDB Atlas user password

### Cannot connect to MongoDB
- Check Network Access in MongoDB Atlas allows 0.0.0.0/0
- Verify database user exists and password is correct
- Make sure connection string includes database name

### App crashes immediately
- Check Railway logs: **Deployments** → Click on latest deployment → **View Logs**
- Look for MongoDB connection errors

## Your API Endpoints

Once deployed, your ESP32 should send data to:
```
POST https://your-app.railway.app/api/sensors
```

Frontend/Dashboard should connect to:
```
GET https://your-app.railway.app/api/sensors/realtime
GET https://your-app.railway.app/api/alerts
WebSocket: wss://your-app.railway.app
```
