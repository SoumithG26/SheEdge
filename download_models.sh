#!/bin/bash

echo "================================================"
echo "Downloading YOLO Model Files for Person Detection"
echo "================================================"

# Create models directory if it doesn't exist
mkdir -p models
cd models

echo ""
echo "Downloading YOLOv4-tiny configuration..."
wget -q --show-progress https://raw.githubusercontent.com/AlexeyAB/darknet/master/cfg/yolov4-tiny.cfg

echo ""
echo "Downloading YOLOv4-tiny weights (23 MB)..."
wget -q --show-progress https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights

echo ""
echo "Downloading COCO class names..."
wget -q --show-progress https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names

cd ..

# Move files to root directory for easy access
mv models/yolov4-tiny.cfg .
mv models/yolov4-tiny.weights .
mv models/coco.names .
rmdir models

echo ""
echo "✓ Download complete!"
echo ""
echo "Files downloaded:"
echo "  - yolov4-tiny.cfg"
echo "  - yolov4-tiny.weights"
echo "  - coco.names"
echo ""
echo "You can now run: python backend.py"
