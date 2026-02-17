from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from datetime import datetime
import threading
import time

app = Flask(__name__)
CORS(app)

# Global variables
camera = None
latest_analysis = {
    'riskScore': 0,
    'riskLevel': 'safe',
    'lighting': 'good',
    'crowdDensity': 'moderate',
    'timeRisk': 'low',
    'movementPattern': 'normal',
    'personCount': 0,
    'timestamp': datetime.now().isoformat()
}
analysis_lock = threading.Lock()

# Initialize YOLO model for person detection
def load_yolo_model():
    """Load YOLOv3 or YOLOv4-tiny model for person detection"""
    try:
        # Try to load YOLOv4-tiny (faster, lighter)
        net = cv2.dnn.readNet('yolov4-tiny.weights', 'yolov4-tiny.cfg')
        print("✓ YOLOv4-tiny model loaded successfully")
    except:
        try:
            # Fallback to YOLOv3
            net = cv2.dnn.readNet('yolov3.weights', 'yolov3.cfg')
            print("✓ YOLOv3 model loaded successfully")
        except:
            print("⚠ YOLO models not found. Using HOG detector instead.")
            return None
    
    # Load COCO class names
    try:
        with open('coco.names', 'r') as f:
            classes = f.read().strip().split('\n')
    except:
        # If file not found, use minimal class list
        classes = ['person']
    
    return net, classes

# Initialize HOG person detector as fallback
hog = cv2.HOGDescriptor()
hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

# Try to load YOLO, fallback to HOG
yolo_model = load_yolo_model()
if yolo_model:
    net, classes = yolo_model
    use_yolo = True
else:
    use_yolo = False
    print("Using HOG detector for person detection")

def detect_people_yolo(frame, net, classes):
    """Detect people using YOLO"""
    height, width = frame.shape[:2]
    
    # Create blob from image
    blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), swapRB=True, crop=False)
    net.setInput(blob)
    
    # Get output layer names
    layer_names = net.getLayerNames()
    try:
        output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]
    except:
        output_layers = [layer_names[i[0] - 1] for i in net.getUnconnectedOutLayers()]
    
    # Run forward pass
    outputs = net.forward(output_layers)
    
    # Process detections
    boxes = []
    confidences = []
    class_ids = []
    
    for output in outputs:
        for detection in output:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            
            # Filter for 'person' class (class_id = 0 in COCO)
            if confidence > 0.5 and class_id == 0:
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)
                
                x = int(center_x - w/2)
                y = int(center_y - h/2)
                
                boxes.append([x, y, w, h])
                confidences.append(float(confidence))
                class_ids.append(class_id)
    
    # Apply non-maximum suppression
    indices = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)
    
    person_boxes = []
    if len(indices) > 0:
        for i in indices.flatten():
            person_boxes.append(boxes[i])
    
    return person_boxes

def detect_people_hog(frame):
    """Detect people using HOG (fallback method)"""
    # Resize frame for faster processing
    scale = 0.5
    small_frame = cv2.resize(frame, None, fx=scale, fy=scale)
    
    # Detect people
    boxes, weights = hog.detectMultiScale(small_frame, winStride=(8, 8), padding=(4, 4), scale=1.05)
    
    # Scale boxes back to original size
    person_boxes = []
    for (x, y, w, h) in boxes:
        person_boxes.append([int(x/scale), int(y/scale), int(w/scale), int(h/scale)])
    
    return person_boxes

def analyze_lighting(frame):
    """Analyze lighting conditions"""
    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Calculate average brightness
    avg_brightness = np.mean(gray)
    
    # Classify lighting
    if avg_brightness < 50:
        return 'poor', 30
    elif avg_brightness < 80:
        return 'dim', 20
    elif avg_brightness < 120:
        return 'moderate', 10
    elif avg_brightness < 180:
        return 'good', 5
    else:
        return 'excellent', 0

def analyze_crowd_density(person_count, frame_area):
    """Analyze crowd density based on person count"""
    # Calculate density (people per unit area)
    density = person_count / (frame_area / 100000)  # Normalize
    
    if person_count == 0:
        return 'isolated', 25
    elif person_count <= 2:
        return 'sparse', 15
    elif person_count <= 5:
        return 'moderate', 5
    elif person_count <= 10:
        return 'crowded', 10
    else:
        return 'very_crowded', 20

def analyze_time_risk():
    """Analyze risk based on time of day"""
    hour = datetime.now().hour
    
    if (hour >= 22 or hour <= 5):
        return 'high', 25
    elif (hour >= 18 or hour <= 7):
        return 'medium', 15
    else:
        return 'low', 5

def calculate_risk_score(lighting_risk, crowd_risk, time_risk):
    """Calculate overall risk score"""
    total_risk = lighting_risk + crowd_risk + time_risk
    
    # Determine risk level
    if total_risk >= 70:
        risk_level = 'critical'
    elif total_risk >= 50:
        risk_level = 'high'
    elif total_risk >= 30:
        risk_level = 'medium'
    else:
        risk_level = 'safe'
    
    return total_risk, risk_level

def process_frame(frame):
    """Process frame and update analysis"""
    global latest_analysis
    
    # Detect people
    if use_yolo:
        person_boxes = detect_people_yolo(frame, net, classes)
    else:
        person_boxes = detect_people_hog(frame)
    
    person_count = len(person_boxes)
    
    # Draw bounding boxes
    for (x, y, w, h) in person_boxes:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.putText(frame, 'Person', (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    # Analyze lighting
    lighting, lighting_risk = analyze_lighting(frame)
    
    # Analyze crowd density
    frame_area = frame.shape[0] * frame.shape[1]
    crowd_density, crowd_risk = analyze_crowd_density(person_count, frame_area)
    
    # Analyze time risk
    time_risk, time_risk_score = analyze_time_risk()
    
    # Calculate total risk
    risk_score, risk_level = calculate_risk_score(lighting_risk, crowd_risk, time_risk_score)
    
    # Add info overlay
    cv2.putText(frame, f'People Detected: {person_count}', (10, 30), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.putText(frame, f'Risk Score: {risk_score}', (10, 60), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.putText(frame, f'Risk Level: {risk_level.upper()}', (10, 90), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0) if risk_level == 'safe' else (0, 0, 255), 2)
    
    # Update global analysis
    with analysis_lock:
        latest_analysis = {
            'riskScore': risk_score,
            'riskLevel': risk_level,
            'lighting': lighting,
            'crowdDensity': crowd_density,
            'timeRisk': time_risk,
            'movementPattern': 'normal',  # Could be enhanced with motion tracking
            'personCount': person_count,
            'timestamp': datetime.now().isoformat()
        }
    
    return frame

def generate_frames():
    """Generate frames for video streaming"""
    global camera
    
    if camera is None:
        camera = cv2.VideoCapture(0)
        # Set camera properties for better performance
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        camera.set(cv2.CAP_PROP_FPS, 30)
    
    while True:
        success, frame = camera.read()
        if not success:
            break
        
        # Process frame
        processed_frame = process_frame(frame)
        
        # Encode frame to JPEG
        ret, buffer = cv2.imencode('.jpg', processed_frame)
        frame = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/analysis')
def get_analysis():
    """Get latest analysis data"""
    with analysis_lock:
        return jsonify(latest_analysis)

@app.route('/status')
def status():
    """Check if backend is running"""
    return jsonify({'status': 'running', 'model': 'YOLO' if use_yolo else 'HOG'})

@app.route('/start_camera')
def start_camera():
    """Initialize camera"""
    global camera
    if camera is None:
        camera = cv2.VideoCapture(0)
        return jsonify({'status': 'started'})
    return jsonify({'status': 'already_running'})

@app.route('/stop_camera')
def stop_camera():
    """Release camera"""
    global camera
    if camera is not None:
        camera.release()
        camera = None
        return jsonify({'status': 'stopped'})
    return jsonify({'status': 'already_stopped'})

if __name__ == '__main__':
    print("=" * 50)
    print("🛡️  SafetyAI Computer Vision Backend")
    print("=" * 50)
    print(f"Model: {'YOLO' if use_yolo else 'HOG (Fallback)'}")
    print("Starting Flask server on http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
