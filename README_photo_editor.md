# Photo Editor Pro 🎨

A comprehensive photo editing application with both web frontend and Python backend capabilities.

## Features ✨

### Frontend (Web-based)
- **Drag & Drop Upload** - Easy image uploading with visual feedback
- **Real-time Adjustments** - Brightness, contrast, saturation, and hue controls
- **Filters** - Grayscale, sepia, vintage, blur, sharpen, emboss, and edge detection
- **Transform Tools** - Rotate, flip horizontally/vertically
- **Crop Functionality** - Interactive cropping with aspect ratio options
- **Zoom Controls** - Zoom in/out and fit to screen
- **History Management** - Undo/redo and reset functionality
- **Export Options** - Save and download edited images
- **Responsive Design** - Works on desktop, tablet, and mobile

### Backend (Python-powered)
- **Advanced Image Processing** - OpenCV and PIL integration
- **REST API** - Complete API for all editing operations
- **Noise Reduction** - Remove image noise
- **Auto Enhancement** - Automatic image improvement
- **Multiple Format Support** - PNG, JPG, JPEG, GIF, BMP, TIFF
- **Batch Processing Ready** - Scalable architecture

## Technology Stack 🛠️

### Frontend
- **HTML5 Canvas** - For image manipulation and display
- **CSS3** - Modern styling with animations and responsive design
- **Vanilla JavaScript** - No frameworks, pure JS functionality
- **Font Awesome** - Professional icons

### Backend
- **Python 3.7+** - Core language
- **Flask** - Web framework
- **OpenCV** - Computer vision and image processing
- **PIL/Pillow** - Image manipulation
- **NumPy** - Numerical operations
- **Flask-CORS** - Cross-origin resource sharing

## Installation & Setup 🚀

### Prerequisites
```bash
# Python 3.7 or higher
python --version

# pip package manager
pip --version
```

### Backend Setup
1. **Install Dependencies**
   ```bash
   pip install flask flask-cors opencv-python pillow numpy werkzeug
   ```

2. **Run the Backend Server**
   ```bash
   python photo_editor_backend.py
   ```
   
   The server will start at `http://localhost:5000`

### Frontend Setup
1. **Option 1: Open HTML directly**
   ```bash
   # Simply open photo_editor.html in your browser
   open photo_editor.html
   ```

2. **Option 2: Use a local server**
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Then visit http://localhost:8080/photo_editor.html
   ```

3. **Option 3: Use the Flask backend template**
   ```bash
   # The backend serves the frontend at http://localhost:5000
   ```

## Usage Guide 📖

### Basic Editing Workflow

1. **Upload an Image**
   - Click the upload area or drag & drop an image
   - Supported formats: PNG, JPG, JPEG, GIF, BMP, TIFF

2. **Make Adjustments**
   - Use sliders for brightness, contrast, saturation, and hue
   - Real-time preview of changes

3. **Apply Filters**
   - Choose from 8 different filters
   - Instant application with visual feedback

4. **Transform Image**
   - Rotate left/right (90-degree increments)
   - Flip horizontally or vertically

5. **Crop if Needed**
   - Enable crop mode
   - Select area by dragging
   - Choose aspect ratio (free, 1:1, 4:3, 16:9, 3:2)
   - Apply crop

6. **Save Your Work**
   - Use Save button for quick download
   - Use Export for custom filename

### Advanced Features

#### History Management
- **Undo/Redo** - Navigate through editing history
- **Reset** - Return to original image
- **Auto-save** - Actions automatically saved to history

#### Zoom and Navigation
- **Zoom In/Out** - Detailed editing view
- **Fit to Screen** - Optimal viewing size
- **Pan** - Move around zoomed image

#### Keyboard Shortcuts
- `Ctrl + Z` - Undo (when implemented)
- `Ctrl + Y` - Redo (when implemented)
- `Ctrl + S` - Save image (when implemented)

## API Documentation 📋

### Endpoints

#### Upload Image
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (image file)

Response:
{
    "success": true,
    "image": "base64_encoded_image",
    "message": "Image uploaded successfully"
}
```

#### Apply Adjustments
```
POST /api/adjust
Content-Type: application/json
Body: {
    "type": "brightness|contrast|saturation|hue",
    "value": -100 to 100 (or 0-360 for hue)
}

Response:
{
    "success": true,
    "image": "base64_encoded_image"
}
```

#### Apply Filters
```
POST /api/filter
Content-Type: application/json
Body: {
    "filter": "grayscale|sepia|blur|sharpen|emboss|edge|vintage"
}

Response:
{
    "success": true,
    "image": "base64_encoded_image"
}
```

#### Transform Image
```
POST /api/transform
Content-Type: application/json
Body: {
    "type": "rotate_left|rotate_right|flip_horizontal|flip_vertical"
}

Response:
{
    "success": true,
    "image": "base64_encoded_image"
}
```

#### Crop Image
```
POST /api/crop
Content-Type: application/json
Body: {
    "x": 0,
    "y": 0,
    "width": 100,
    "height": 100
}

Response:
{
    "success": true,
    "image": "base64_encoded_image"
}
```

#### Enhancement
```
POST /api/enhance
Content-Type: application/json
Body: {
    "type": "auto|denoise"
}

Response:
{
    "success": true,
    "image": "base64_encoded_image"
}
```

#### Reset Image
```
POST /api/reset

Response:
{
    "success": true,
    "image": "base64_encoded_image"
}
```

#### Save Image
```
POST /api/save
Content-Type: application/json
Body: {
    "filename": "my_edited_image.png"
}

Response:
{
    "success": true,
    "filepath": "/path/to/saved/image",
    "message": "Image saved successfully"
}
```

#### Download Image
```
GET /api/download/<filename>

Response: Binary image file
```

#### Get Image Info
```
GET /api/image_info

Response:
{
    "width": 1920,
    "height": 1080,
    "channels": 3,
    "size": "1920x1080"
}
```

## Configuration ⚙️

### Backend Configuration
```python
# File size limit (16MB default)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Upload and processed folders
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}
```

### Frontend Configuration
```javascript
// Adjust these in photo_editor.js
const MAX_HISTORY_SIZE = 20;  // Maximum undo/redo steps
const ZOOM_STEP = 0.2;        // Zoom increment
const MAX_ZOOM = 5;           // Maximum zoom level
const MIN_ZOOM = 0.1;         // Minimum zoom level
```

## File Structure 📁

```
photo-editor/
├── photo_editor.html          # Main frontend interface
├── photo_editor.css           # Styling
├── photo_editor.js            # Frontend JavaScript
├── photo_editor_backend.py    # Python backend server
├── README_photo_editor.md     # This documentation
├── uploads/                   # Uploaded images
├── processed/                 # Processed images
└── templates/                 # Flask templates (if using backend)
    └── photo_editor.html
```

## Browser Support 🌐

- **Chrome** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

Required features:
- HTML5 Canvas
- File API
- Drag and Drop API
- ES6+ JavaScript

## Performance Optimization 🚀

### Frontend
- Canvas-based rendering for smooth performance
- Efficient image processing algorithms
- History management with size limits
- Lazy loading for large images

### Backend
- OpenCV optimizations
- Memory-efficient image processing
- File cleanup routines
- Error handling and validation

## Troubleshooting 🔧

### Common Issues

1. **Image won't load**
   - Check file format is supported
   - Ensure file size is under 16MB
   - Verify file isn't corrupted

2. **Backend server won't start**
   ```bash
   # Install missing dependencies
   pip install -r requirements.txt
   
   # Check Python version
   python --version  # Should be 3.7+
   ```

3. **Canvas appears blank**
   - Refresh the page
   - Check browser console for errors
   - Ensure JavaScript is enabled

4. **Filters not applying**
   - Ensure an image is loaded first
   - Check network connection for backend version
   - Verify API endpoints are accessible

### Performance Issues

1. **Slow processing**
   - Reduce image size before editing
   - Use lower quality for preview
   - Consider using backend for heavy operations

2. **Memory usage**
   - Clear history periodically
   - Avoid extremely large images
   - Close unused browser tabs

## Development 👨‍💻

### Adding New Filters
```javascript
// Frontend (photo_editor.js)
case 'my_filter':
    // Implement filter logic
    break;
```

```python
# Backend (photo_editor_backend.py)
elif filter_name == 'my_filter':
    # Implement filter using OpenCV/PIL
    pass
```

### Adding New API Endpoints
```python
@app.route('/api/my_endpoint', methods=['POST'])
def my_endpoint():
    try:
        # Implement functionality
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## License 📄

This project is open source and available under the MIT License.

## Support 💬

For questions, issues, or contributions:
- Create an issue on GitHub
- Check existing documentation
- Review the troubleshooting section

---

**Built with ❤️ for creative photo editing**