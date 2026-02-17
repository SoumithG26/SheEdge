"""
SafetyAI System Test Script
Run this to verify your installation is working correctly
"""

import sys

def test_imports():
    """Test if all required packages are installed"""
    print("=" * 60)
    print("🧪 Testing Python Package Imports")
    print("=" * 60)
    
    packages = {
        'flask': 'Flask',
        'flask_cors': 'flask-cors',
        'cv2': 'opencv-python',
        'numpy': 'numpy'
    }
    
    failed = []
    
    for module, package in packages.items():
        try:
            __import__(module)
            print(f"✓ {package:20s} - OK")
        except ImportError:
            print(f"✗ {package:20s} - MISSING")
            failed.append(package)
    
    if failed:
        print("\n❌ Missing packages. Install with:")
        print(f"   pip install {' '.join(failed)}")
        return False
    else:
        print("\n✅ All packages installed correctly!")
        return True

def test_camera():
    """Test if camera is accessible"""
    print("\n" + "=" * 60)
    print("📷 Testing Camera Access")
    print("=" * 60)
    
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("✗ Camera cannot be opened")
            print("  Possible causes:")
            print("  - Camera in use by another app")
            print("  - Permission denied")
            print("  - No camera connected")
            return False
        
        ret, frame = cap.read()
        cap.release()
        
        if ret:
            print(f"✓ Camera working! Frame size: {frame.shape[1]}x{frame.shape[0]}")
            return True
        else:
            print("✗ Camera opened but cannot read frames")
            return False
            
    except Exception as e:
        print(f"✗ Camera test failed: {e}")
        return False

def test_models():
    """Test if YOLO model files exist"""
    print("\n" + "=" * 60)
    print("🤖 Testing YOLO Model Files")
    print("=" * 60)
    
    import os
    
    files = {
        'yolov4-tiny.cfg': 'Configuration file',
        'yolov4-tiny.weights': 'Model weights',
        'coco.names': 'Class names'
    }
    
    missing = []
    
    for filename, description in files.items():
        if os.path.exists(filename):
            size = os.path.getsize(filename) / (1024 * 1024)
            print(f"✓ {filename:22s} - Found ({size:.1f} MB)")
        else:
            print(f"✗ {filename:22s} - Missing")
            missing.append(filename)
    
    if missing:
        print("\n⚠️  YOLO models not found. System will use HOG detector (slower)")
        print("   Download models with: python download_models.py")
        return False
    else:
        print("\n✅ All model files present!")
        return True

def test_opencv_dnn():
    """Test OpenCV DNN module"""
    print("\n" + "=" * 60)
    print("🧠 Testing OpenCV DNN Module")
    print("=" * 60)
    
    try:
        import cv2
        import os
        
        if not os.path.exists('yolov4-tiny.weights'):
            print("⚠️  Skipping (YOLO models not found)")
            return True
        
        net = cv2.dnn.readNet('yolov4-tiny.weights', 'yolov4-tiny.cfg')
        print("✓ YOLO model loaded successfully")
        print(f"✓ OpenCV DNN backend: {cv2.dnn.DNN_BACKEND_DEFAULT}")
        return True
        
    except Exception as e:
        print(f"✗ OpenCV DNN test failed: {e}")
        return False

def test_ports():
    """Test if port 5000 is available"""
    print("\n" + "=" * 60)
    print("🔌 Testing Port Availability")
    print("=" * 60)
    
    import socket
    
    port = 5000
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    try:
        sock.bind(('localhost', port))
        sock.close()
        print(f"✓ Port {port} is available for Flask server")
        return True
    except OSError:
        print(f"✗ Port {port} is already in use")
        print(f"  Another application might be using it")
        return False

def main():
    """Run all tests"""
    print("\n")
    print("╔══════════════════════════════════════════════════════════╗")
    print("║           🛡️  SAFETYAI INSTALLATION TEST                ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()
    
    results = []
    
    # Run tests
    results.append(("Package Imports", test_imports()))
    results.append(("Camera Access", test_camera()))
    results.append(("YOLO Models", test_models()))
    results.append(("OpenCV DNN", test_opencv_dnn()))
    results.append(("Port 5000", test_ports()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:20s} - {status}")
    
    print("=" * 60)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 60)
    
    if passed == total:
        print("\n🎉 Perfect! Your system is ready to run!")
        print("\nNext steps:")
        print("1. Run: python backend.py")
        print("2. Open the React frontend")
        print("3. Click 'Start Monitoring'")
        print("\nGood luck with your hackathon! 🚀")
    else:
        print("\n⚠️  Some tests failed. Please fix the issues above.")
        print("\nCommon fixes:")
        print("• Missing packages: pip install -r requirements.txt")
        print("• Missing models: python download_models.py")
        print("• Camera issues: Check permissions or close other apps")
        print("\nSee README.md for detailed troubleshooting.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
