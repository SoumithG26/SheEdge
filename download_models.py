import urllib.request
import os

print("=" * 60)
print("Downloading YOLO Model Files for Person Detection")
print("=" * 60)

# URLs for model files
files = {
    'yolov4-tiny.cfg': 'https://raw.githubusercontent.com/AlexeyAB/darknet/master/cfg/yolov4-tiny.cfg',
    'yolov4-tiny.weights': 'https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights',
    'coco.names': 'https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names'
}

def download_file(url, filename):
    """Download file with progress"""
    print(f"\nDownloading {filename}...")
    try:
        urllib.request.urlretrieve(url, filename)
        print(f"✓ {filename} downloaded successfully")
        return True
    except Exception as e:
        print(f"✗ Error downloading {filename}: {e}")
        return False

# Download all files
success_count = 0
for filename, url in files.items():
    if download_file(url, filename):
        success_count += 1

print("\n" + "=" * 60)
if success_count == len(files):
    print("✓ All files downloaded successfully!")
    print("\nYou can now run: python backend.py")
else:
    print(f"⚠ {success_count}/{len(files)} files downloaded")
    print("Please check your internet connection and try again")
print("=" * 60)
