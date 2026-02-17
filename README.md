# 🛡️ SafetyAI - Edge AI-Based Personal & Environmental Safety Intelligence System

## 🎯 Project Overview

**SafetyAI** is a real-time safety intelligence system that uses computer vision and AI to analyze your surroundings and provide predictive safety assessments. The system runs entirely on your device (Edge AI) to protect your privacy.

### Key Features
- ✅ **Real-time Person Detection** using YOLO/HOG models
- ✅ **Crowd Density Analysis** 
- ✅ **Lighting Condition Assessment**
- ✅ **Time-based Risk Calculation**
- ✅ **Live Camera Feed** with overlay annotations
- ✅ **Dynamic Safety Scoring** (0-100 scale)
- ✅ **Emergency SOS Button**
- ✅ **100% Privacy-focused** (all processing on device)

---

## 📋 Prerequisites

### Required Software
- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Node.js 16+** (for running the React frontend) - [Download here](https://nodejs.org/)
- **Webcam** - Built-in or external camera

### System Requirements
- **OS**: Windows 10/11, macOS, or Linux
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 500MB free space for models
- **Camera**: Any webcam with 640x480 resolution or higher

---

## 🚀 Installation & Setup

### Step 1: Download the Project Files

Save all files to a folder, for example: `SafetyAI/`

```
SafetyAI/
├── backend.py
├── requirements.txt
├── download_models.py
├── download_models.sh
├── safety-intelligence-system-backend.jsx
└── README.md
```

### Step 2: Install Python Dependencies

Open terminal/command prompt in the project folder and run:

```bash
# Install required Python packages
pip install -r requirements.txt
```

**For Windows users:**
```bash
pip install -r requirements.txt
```

**For Mac/Linux users:**
```bash
pip3 install -r requirements.txt
```

### Step 3: Download YOLO Model Files

The system uses YOLOv4-tiny for person detection. Download the model files:

**Option A: Using Python script (Works on all platforms)**
```bash
python download_models.py
```

**Option B: Using shell script (Mac/Linux only)**
```bash
chmod +x download_models.sh
./download_models.sh
```

**Option C: Manual download**
1. Download these files to your project folder:
   - [yolov4-tiny.cfg](https://raw.githubusercontent.com/AlexeyAB/darknet/master/cfg/yolov4-tiny.cfg)
   - [yolov4-tiny.weights](https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights) (23 MB)
   - [coco.names](https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names)

---

## 🎮 Running the Application

### Step 1: Start the Python Backend

Open terminal in the project folder and run:

```bash
python backend.py
```

You should see:
```
==================================================
🛡️  SafetyAI Computer Vision Backend
==================================================
Model: YOLO
Starting Flask server on http://localhost:5000
==================================================
```

**Keep this terminal window open!** The backend needs to run continuously.

### Step 2: Start the React Frontend

**: Create a React App**

Run it as a standalone app:

```bash
# Create new React app
npx create-react-app safety-ai-frontend
cd safety-ai-frontend

# Replace src/App.js with safety-intelligence-system-backend.jsx content
# Install Lucide React icons
npm install lucide-react

# Start the app
npm start
```

### Step 3: Allow Camera Access

When you click "Start Monitoring", your browser will ask for camera permission. Click **Allow**.

---

## 💡 How to Use

### Basic Operation

1. **Start Backend**: Run `python backend.py` in terminal
2. **Open Frontend**: View the React artifact or open in browser
3. **Check Connection**: Look for green "Backend Connected" indicator
4. **Start Monitoring**: Click the green "▶ START MONITORING" button
5. **Allow Camera**: Grant camera permission when prompted
6. **View Analysis**: Watch real-time person detection and safety analysis

### Understanding the Interface

#### Safety Status Panel
- **Risk Score**: 0-100 scale (0 = Safe, 100 = Critical)
- **Risk Level**: Safe → Medium → High → Critical
- **Person Count**: Number of people detected in frame

#### Environmental Analysis Cards
1. **Lighting**: Poor → Dim → Moderate → Good → Excellent
2. **Crowd**: Isolated → Sparse → Moderate → Crowded → Very Crowded
3. **Time Risk**: Based on current time of day
4. **Movement**: Normal patterns (can be extended for motion tracking)

#### Emergency Features
- **SOS Button**: One-tap emergency alert (simulated)
- **Alert Feed**: Shows warnings when risk levels are elevated

---

## 🔧 Troubleshooting

### Backend Won't Start

**Problem**: `ModuleNotFoundError: No module named 'flask'`
```bash
# Solution: Install dependencies
pip install -r requirements.txt
```

**Problem**: `cv2.error: OpenCV(4.x.x) camera access denied`
```bash
# Solution: Check camera permissions
# Windows: Settings → Privacy → Camera → Allow apps
# Mac: System Preferences → Security & Privacy → Camera
# Linux: Check /dev/video0 permissions
```

### YOLO Models Not Found

**Problem**: `YOLO models not found. Using HOG detector instead.`
```bash
# Solution: Download models
python download_models.py

# Verify files exist:
ls -la yolov4-tiny.*
ls -la coco.names
```

### Frontend Can't Connect to Backend

**Problem**: "Backend Offline" indicator shows red
```bash
# Solution 1: Check if backend is running
# You should see Flask server output in terminal

# Solution 2: Check the URL
# Make sure backend is at http://localhost:5000

# Solution 3: Check firewall
# Allow Python to access network
```

### Camera Not Showing

**Problem**: Black screen or "Camera access denied"
```bash
# Solution: 
# 1. Close other apps using camera (Zoom, Skype, etc.)
# 2. Refresh the page and allow camera access
# 3. Check camera drivers are up to date
```

---

## 🎨 Customization

### Adjust Detection Sensitivity

Edit `backend.py`:

```python
# Line ~42: Adjust YOLO confidence threshold
if confidence > 0.5 and class_id == 0:  # Change 0.5 to 0.3 for more detections
```

### Modify Risk Scoring

Edit `backend.py`:

```python
# Lines ~124-135: Adjust risk weights
if lighting == 'poor': score += 30  # Increase for higher sensitivity
if crowdDensity == 'isolated': score += 25
```

### Change Camera Resolution

Edit `backend.py`:

```python
# Lines ~170-172: Adjust camera settings
camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)  # Change from 640
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)  # Change from 480
```

---

## 📊 Technical Details

### Architecture

```
┌─────────────────┐
│  React Frontend │ ← User Interface
└────────┬────────┘
         │ HTTP/WebSocket
         ↓
┌─────────────────┐
│  Flask Backend  │ ← API Server
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌──────┐
│ OpenCV │ │ YOLO │ ← Computer Vision
└────────┘ └──────┘
    │
    ↓
┌─────────┐
│ Camera  │ ← Video Input
└─────────┘
```

### Technology Stack

**Backend:**
- Flask 3.0 - Web framework
- OpenCV 4.8 - Computer vision
- NumPy 1.24 - Numerical computing
- YOLO v4-tiny - Person detection

**Frontend:**
- React 18 - UI framework
- Tailwind CSS - Styling
- Lucide React - Icons

### Detection Models

1. **YOLO v4-tiny** (Primary)
   - Fast, lightweight CNN
   - 23MB model size
   - ~30-60 FPS on modern hardware
   - Accuracy: 85-90% for person detection

2. **HOG Detector** (Fallback)
   - Classical CV method
   - No model download needed
   - ~15-25 FPS
   - Accuracy: 70-80% for person detection

---

## 🎓 For Hackathon Judges

### Demonstration Points

1. **Real AI/CV Implementation**
   - Show live person detection with bounding boxes
   - Explain YOLO architecture briefly
   - Demonstrate edge processing (no cloud)

2. **Multi-factor Safety Analysis**
   - Point out 4 analysis factors (lighting, crowd, time, movement)
   - Show how they combine into risk score
   - Explain the scoring algorithm

3. **Privacy Focus**
   - Emphasize on-device processing
   - No data sent to external servers
   - Show the privacy indicator

4. **Practical Application**
   - Women's safety in public spaces
   - Night-time commuting
   - Isolated area awareness

5. **Scalability**
   - Mobile deployment potential (TensorFlow Lite)
   - Smart city integration
   - Wearable device compatibility

### Live Demo Tips

✅ Test camera before presentation
✅ Have good lighting for better detection
✅ Show both low and high person counts
✅ Demonstrate SOS button
✅ Explain technical stack briefly
✅ Mention UN SDG alignment (Gender Equality, Sustainable Cities)

---

## 📱 Mobile Deployment (Future)

The system can be adapted for mobile:

1. **React Native** - Convert frontend to mobile app
2. **TensorFlow Lite** - Convert YOLO to mobile-optimized model
3. **On-device Processing** - Maintain privacy-first approach
4. **GPS Integration** - Add location-based features
5. **Emergency Contacts** - Real SOS integration

---

## 🆘 Support

If you encounter issues:

1. Check this README thoroughly
2. Verify all prerequisites are installed
3. Ensure backend is running before starting frontend
4. Check terminal for error messages

**Quick Checklist:**
- [ ] Python 3.8+ installed
- [ ] `pip install -r requirements.txt` completed
- [ ] YOLO model files downloaded
- [ ] Backend running (`python backend.py`)
- [ ] Camera permissions granted
- [ ] Green "Backend Connected" indicator showing

---

## 🎉 Success!

If you see:
- ✅ Green "Backend Connected" indicator
- ✅ Live camera feed with bounding boxes
- ✅ Real-time person count updating
- ✅ Risk score changing based on conditions

**Congratulations! Your SafetyAI system is working! 🎊**

---

**Project for**: SUDHEE 2026 - Emerging Technologies Led by Women
**Organized by**: IEEE CBIT, IEEE WIE Hyderabad Section
**Supported by**: AICTE Idea Lab, CBIT
