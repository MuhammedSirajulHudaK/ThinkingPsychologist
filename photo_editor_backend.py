import os
import base64
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from flask import Flask, request, jsonify, render_template, send_file
from flask_cors import CORS
import io
import tempfile
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

class PhotoEditor:
    def __init__(self):
        self.original_image = None
        self.processed_image = None
        self.history = []
        
    def load_image(self, image_path):
        """Load image from path"""
        self.original_image = cv2.imread(image_path)
        if self.original_image is None:
            # Try with PIL for formats OpenCV doesn't support
            pil_image = Image.open(image_path)
            self.original_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        
        self.processed_image = self.original_image.copy()
        self.history = [self.original_image.copy()]
        return True
    
    def load_image_from_bytes(self, image_bytes):
        """Load image from bytes"""
        nparr = np.frombuffer(image_bytes, np.uint8)
        self.original_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if self.original_image is None:
            return False
        
        self.processed_image = self.original_image.copy()
        self.history = [self.original_image.copy()]
        return True
    
    def save_to_history(self):
        """Save current state to history"""
        self.history.append(self.processed_image.copy())
        if len(self.history) > 20:  # Limit history size
            self.history.pop(0)
    
    def adjust_brightness(self, value):
        """Adjust brightness (-100 to 100)"""
        if self.processed_image is None:
            return False
        
        brightness = value / 100.0
        self.processed_image = cv2.convertScaleAbs(self.processed_image, alpha=1, beta=brightness * 255)
        return True
    
    def adjust_contrast(self, value):
        """Adjust contrast (-100 to 100)"""
        if self.processed_image is None:
            return False
        
        contrast = (value + 100) / 100.0
        self.processed_image = cv2.convertScaleAbs(self.processed_image, alpha=contrast, beta=0)
        return True
    
    def adjust_saturation(self, value):
        """Adjust saturation (-100 to 100)"""
        if self.processed_image is None:
            return False
        
        # Convert to HSV
        hsv = cv2.cvtColor(self.processed_image, cv2.COLOR_BGR2HSV)
        hsv = hsv.astype(np.float32)
        
        # Adjust saturation
        saturation_scale = (value + 100) / 100.0
        hsv[:, :, 1] = hsv[:, :, 1] * saturation_scale
        hsv[:, :, 1] = np.clip(hsv[:, :, 1], 0, 255)
        
        # Convert back to BGR
        hsv = hsv.astype(np.uint8)
        self.processed_image = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        return True
    
    def adjust_hue(self, value):
        """Adjust hue (0 to 360)"""
        if self.processed_image is None:
            return False
        
        # Convert to HSV
        hsv = cv2.cvtColor(self.processed_image, cv2.COLOR_BGR2HSV)
        hsv = hsv.astype(np.float32)
        
        # Adjust hue
        hsv[:, :, 0] = (hsv[:, :, 0] + value / 2) % 180  # OpenCV uses 0-180 for hue
        
        # Convert back to BGR
        hsv = hsv.astype(np.uint8)
        self.processed_image = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        return True
    
    def apply_filter(self, filter_name):
        """Apply various filters"""
        if self.processed_image is None:
            return False
        
        if filter_name == 'grayscale':
            gray = cv2.cvtColor(self.processed_image, cv2.COLOR_BGR2GRAY)
            self.processed_image = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
        
        elif filter_name == 'sepia':
            kernel = np.array([[0.272, 0.534, 0.131],
                              [0.349, 0.686, 0.168],
                              [0.393, 0.769, 0.189]])
            self.processed_image = cv2.transform(self.processed_image, kernel)
        
        elif filter_name == 'blur':
            self.processed_image = cv2.GaussianBlur(self.processed_image, (15, 15), 0)
        
        elif filter_name == 'sharpen':
            kernel = np.array([[-1, -1, -1],
                              [-1,  9, -1],
                              [-1, -1, -1]])
            self.processed_image = cv2.filter2D(self.processed_image, -1, kernel)
        
        elif filter_name == 'emboss':
            kernel = np.array([[-2, -1,  0],
                              [-1,  1,  1],
                              [ 0,  1,  2]])
            self.processed_image = cv2.filter2D(self.processed_image, -1, kernel)
        
        elif filter_name == 'edge':
            gray = cv2.cvtColor(self.processed_image, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 100, 200)
            self.processed_image = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
        
        elif filter_name == 'vintage':
            # Apply vintage effect
            self.processed_image = self.processed_image.astype(np.float32)
            self.processed_image[:, :, 0] = np.clip(self.processed_image[:, :, 0] * 0.7, 0, 255)  # Blue
            self.processed_image[:, :, 1] = np.clip(self.processed_image[:, :, 1] * 0.9, 0, 255)  # Green
            self.processed_image[:, :, 2] = np.clip(self.processed_image[:, :, 2] * 1.2, 0, 255)  # Red
            self.processed_image = self.processed_image.astype(np.uint8)
        
        return True
    
    def rotate_image(self, angle):
        """Rotate image by specified angle"""
        if self.processed_image is None:
            return False
        
        height, width = self.processed_image.shape[:2]
        center = (width // 2, height // 2)
        
        rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        self.processed_image = cv2.warpAffine(self.processed_image, rotation_matrix, (width, height))
        return True
    
    def flip_image(self, direction):
        """Flip image horizontally or vertically"""
        if self.processed_image is None:
            return False
        
        if direction == 'horizontal':
            self.processed_image = cv2.flip(self.processed_image, 1)
        elif direction == 'vertical':
            self.processed_image = cv2.flip(self.processed_image, 0)
        
        return True
    
    def crop_image(self, x, y, width, height):
        """Crop image to specified rectangle"""
        if self.processed_image is None:
            return False
        
        h, w = self.processed_image.shape[:2]
        x = max(0, min(x, w))
        y = max(0, min(y, h))
        width = max(1, min(width, w - x))
        height = max(1, min(height, h - y))
        
        self.processed_image = self.processed_image[y:y+height, x:x+width]
        return True
    
    def resize_image(self, width, height):
        """Resize image to specified dimensions"""
        if self.processed_image is None:
            return False
        
        self.processed_image = cv2.resize(self.processed_image, (width, height))
        return True
    
    def auto_enhance(self):
        """Apply automatic enhancement"""
        if self.processed_image is None:
            return False
        
        # Convert to PIL for enhancement
        pil_image = Image.fromarray(cv2.cvtColor(self.processed_image, cv2.COLOR_BGR2RGB))
        
        # Auto contrast
        pil_image = ImageOps.autocontrast(pil_image)
        
        # Enhance color
        enhancer = ImageEnhance.Color(pil_image)
        pil_image = enhancer.enhance(1.2)
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(pil_image)
        pil_image = enhancer.enhance(1.1)
        
        # Convert back to OpenCV
        self.processed_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        return True
    
    def remove_noise(self):
        """Remove noise from image"""
        if self.processed_image is None:
            return False
        
        self.processed_image = cv2.fastNlMeansDenoisingColored(self.processed_image, None, 10, 10, 7, 21)
        return True
    
    def get_image_base64(self):
        """Get processed image as base64 string"""
        if self.processed_image is None:
            return None
        
        _, buffer = cv2.imencode('.png', self.processed_image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        return image_base64
    
    def save_image(self, filename):
        """Save processed image to file"""
        if self.processed_image is None:
            return False
        
        filepath = os.path.join(app.config['PROCESSED_FOLDER'], filename)
        cv2.imwrite(filepath, self.processed_image)
        return filepath
    
    def reset_image(self):
        """Reset to original image"""
        if self.original_image is None:
            return False
        
        self.processed_image = self.original_image.copy()
        return True

# Global photo editor instance
photo_editor = PhotoEditor()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('photo_editor.html')

@app.route('/api/upload', methods=['POST'])
def upload_image():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            if photo_editor.load_image(filepath):
                image_data = photo_editor.get_image_base64()
                return jsonify({
                    'success': True,
                    'image': image_data,
                    'message': 'Image uploaded successfully'
                })
            else:
                return jsonify({'error': 'Failed to load image'}), 400
        
        return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/adjust', methods=['POST'])
def adjust_image():
    try:
        data = request.get_json()
        adjustment_type = data.get('type')
        value = data.get('value', 0)
        
        success = False
        if adjustment_type == 'brightness':
            success = photo_editor.adjust_brightness(value)
        elif adjustment_type == 'contrast':
            success = photo_editor.adjust_contrast(value)
        elif adjustment_type == 'saturation':
            success = photo_editor.adjust_saturation(value)
        elif adjustment_type == 'hue':
            success = photo_editor.adjust_hue(value)
        
        if success:
            image_data = photo_editor.get_image_base64()
            return jsonify({
                'success': True,
                'image': image_data
            })
        else:
            return jsonify({'error': 'Failed to apply adjustment'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/filter', methods=['POST'])
def apply_filter():
    try:
        data = request.get_json()
        filter_name = data.get('filter')
        
        if photo_editor.apply_filter(filter_name):
            photo_editor.save_to_history()
            image_data = photo_editor.get_image_base64()
            return jsonify({
                'success': True,
                'image': image_data
            })
        else:
            return jsonify({'error': 'Failed to apply filter'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transform', methods=['POST'])
def transform_image():
    try:
        data = request.get_json()
        transform_type = data.get('type')
        
        success = False
        if transform_type == 'rotate_left':
            success = photo_editor.rotate_image(-90)
        elif transform_type == 'rotate_right':
            success = photo_editor.rotate_image(90)
        elif transform_type == 'flip_horizontal':
            success = photo_editor.flip_image('horizontal')
        elif transform_type == 'flip_vertical':
            success = photo_editor.flip_image('vertical')
        elif transform_type == 'rotate':
            angle = data.get('angle', 0)
            success = photo_editor.rotate_image(angle)
        
        if success:
            photo_editor.save_to_history()
            image_data = photo_editor.get_image_base64()
            return jsonify({
                'success': True,
                'image': image_data
            })
        else:
            return jsonify({'error': 'Failed to apply transformation'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/crop', methods=['POST'])
def crop_image():
    try:
        data = request.get_json()
        x = data.get('x', 0)
        y = data.get('y', 0)
        width = data.get('width', 100)
        height = data.get('height', 100)
        
        if photo_editor.crop_image(x, y, width, height):
            photo_editor.save_to_history()
            image_data = photo_editor.get_image_base64()
            return jsonify({
                'success': True,
                'image': image_data
            })
        else:
            return jsonify({'error': 'Failed to crop image'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/resize', methods=['POST'])
def resize_image():
    try:
        data = request.get_json()
        width = data.get('width')
        height = data.get('height')
        
        if not width or not height:
            return jsonify({'error': 'Width and height required'}), 400
        
        if photo_editor.resize_image(width, height):
            photo_editor.save_to_history()
            image_data = photo_editor.get_image_base64()
            return jsonify({
                'success': True,
                'image': image_data
            })
        else:
            return jsonify({'error': 'Failed to resize image'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/enhance', methods=['POST'])
def enhance_image():
    try:
        data = request.get_json()
        enhancement_type = data.get('type')
        
        success = False
        if enhancement_type == 'auto':
            success = photo_editor.auto_enhance()
        elif enhancement_type == 'denoise':
            success = photo_editor.remove_noise()
        
        if success:
            photo_editor.save_to_history()
            image_data = photo_editor.get_image_base64()
            return jsonify({
                'success': True,
                'image': image_data
            })
        else:
            return jsonify({'error': 'Failed to enhance image'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset', methods=['POST'])
def reset_image():
    try:
        if photo_editor.reset_image():
            image_data = photo_editor.get_image_base64()
            return jsonify({
                'success': True,
                'image': image_data
            })
        else:
            return jsonify({'error': 'Failed to reset image'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/save', methods=['POST'])
def save_image():
    try:
        data = request.get_json()
        filename = data.get('filename', 'edited_image.png')
        
        filepath = photo_editor.save_image(filename)
        if filepath:
            return jsonify({
                'success': True,
                'filepath': filepath,
                'message': 'Image saved successfully'
            })
        else:
            return jsonify({'error': 'Failed to save image'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<filename>')
def download_image(filename):
    try:
        filepath = os.path.join(app.config['PROCESSED_FOLDER'], filename)
        if os.path.exists(filepath):
            return send_file(filepath, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/image_info')
def get_image_info():
    try:
        if photo_editor.processed_image is not None:
            height, width, channels = photo_editor.processed_image.shape
            return jsonify({
                'width': int(width),
                'height': int(height),
                'channels': int(channels),
                'size': f"{width}x{height}"
            })
        else:
            return jsonify({'error': 'No image loaded'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🎨 Photo Editor Pro Backend")
    print("📸 Starting server...")
    print("🌐 Visit: http://localhost:5000")
    print("📁 Upload folder:", UPLOAD_FOLDER)
    print("💾 Processed folder:", PROCESSED_FOLDER)
    app.run(debug=True, host='0.0.0.0', port=5000)