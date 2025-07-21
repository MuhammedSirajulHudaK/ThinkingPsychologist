class PhotoEditor {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
        this.currentImage = null;
        this.history = [];
        this.historyIndex = -1;
        this.zoomLevel = 1;
        this.cropMode = false;
        this.cropBox = null;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.currentFilter = 'none';
        
        this.adjustments = {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            hue: 0
        };
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File upload
        const fileInput = document.getElementById('file-input');
        const uploadArea = document.getElementById('upload-area');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Adjustment sliders
        ['brightness', 'contrast', 'saturation', 'hue'].forEach(adjustment => {
            const slider = document.getElementById(adjustment);
            const valueSpan = slider.nextElementSibling;
            
            slider.addEventListener('input', (e) => {
                this.adjustments[adjustment] = parseInt(e.target.value);
                valueSpan.textContent = e.target.value;
                this.applyAdjustments();
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.applyFilter(this.currentFilter);
            });
        });

        // Transform buttons
        document.getElementById('rotate-left').addEventListener('click', () => this.rotateImage(-90));
        document.getElementById('rotate-right').addEventListener('click', () => this.rotateImage(90));
        document.getElementById('flip-horizontal').addEventListener('click', () => this.flipImage('horizontal'));
        document.getElementById('flip-vertical').addEventListener('click', () => this.flipImage('vertical'));

        // Crop controls
        document.getElementById('crop-btn').addEventListener('click', () => this.toggleCropMode());
        document.getElementById('apply-crop').addEventListener('click', () => this.applyCrop());

        // History controls
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('redo-btn').addEventListener('click', () => this.redo());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetImage());

        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => this.zoom(1.2));
        document.getElementById('zoom-out').addEventListener('click', () => this.zoom(0.8));
        document.getElementById('fit-to-screen').addEventListener('click', () => this.fitToScreen());

        // Save and export
        document.getElementById('save-btn').addEventListener('click', () => this.saveImage());
        document.getElementById('export-btn').addEventListener('click', () => this.exportImage());

        // Canvas events for cropping
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            this.loadImage(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        this.showLoading(true);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.resetAdjustments();
                this.saveToHistory();
                this.drawImage();
                document.getElementById('no-image').style.display = 'none';
                this.showLoading(false);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    drawImage() {
        if (!this.originalImage) return;

        const canvasContainer = document.querySelector('.canvas-container');
        const containerWidth = canvasContainer.clientWidth;
        const containerHeight = canvasContainer.clientHeight;

        // Calculate canvas size to fit the image
        const imageAspectRatio = this.originalImage.width / this.originalImage.height;
        let canvasWidth, canvasHeight;

        if (imageAspectRatio > containerWidth / containerHeight) {
            canvasWidth = Math.min(containerWidth * 0.9, this.originalImage.width);
            canvasHeight = canvasWidth / imageAspectRatio;
        } else {
            canvasHeight = Math.min(containerHeight * 0.9, this.originalImage.height);
            canvasWidth = canvasHeight * imageAspectRatio;
        }

        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;

        // Apply current adjustments and filters
        this.applyAdjustments();
    }

    applyAdjustments() {
        if (!this.originalImage) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create temporary canvas for processing
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        
        // Draw original image
        tempCtx.drawImage(this.originalImage, 0, 0, this.canvas.width, this.canvas.height);
        
        // Apply adjustments
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            // Brightness
            data[i] = Math.max(0, Math.min(255, data[i] + this.adjustments.brightness * 2.55));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + this.adjustments.brightness * 2.55));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + this.adjustments.brightness * 2.55));
            
            // Contrast
            const contrastFactor = (259 * (this.adjustments.contrast + 255)) / (255 * (259 - this.adjustments.contrast));
            data[i] = Math.max(0, Math.min(255, contrastFactor * (data[i] - 128) + 128));
            data[i + 1] = Math.max(0, Math.min(255, contrastFactor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.max(0, Math.min(255, contrastFactor * (data[i + 2] - 128) + 128));
        }
        
        tempCtx.putImageData(imageData, 0, 0);
        
        // Apply saturation and hue
        if (this.adjustments.saturation !== 0 || this.adjustments.hue !== 0) {
            tempCtx.globalCompositeOperation = 'source-over';
            tempCtx.filter = `saturate(${100 + this.adjustments.saturation}%) hue-rotate(${this.adjustments.hue}deg)`;
            tempCtx.drawImage(tempCanvas, 0, 0);
        }
        
        // Draw to main canvas
        this.ctx.drawImage(tempCanvas, 0, 0);
        
        // Apply current filter
        if (this.currentFilter !== 'none') {
            this.applyFilter(this.currentFilter);
        }
    }

    applyFilter(filterName) {
        if (!this.originalImage) return;

        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        switch (filterName) {
            case 'grayscale':
                for (let i = 0; i < data.length; i += 4) {
                    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                    data[i] = gray;
                    data[i + 1] = gray;
                    data[i + 2] = gray;
                }
                break;
                
            case 'sepia':
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                    data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                    data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
                }
                break;
                
            case 'vintage':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.2);
                    data[i + 1] = Math.min(255, data[i + 1] * 0.9);
                    data[i + 2] = Math.min(255, data[i + 2] * 0.7);
                }
                break;
                
            case 'blur':
                this.applyConvolutionFilter([
                    1/9, 1/9, 1/9,
                    1/9, 1/9, 1/9,
                    1/9, 1/9, 1/9
                ]);
                return;
                
            case 'sharpen':
                this.applyConvolutionFilter([
                    0, -1, 0,
                    -1, 5, -1,
                    0, -1, 0
                ]);
                return;
                
            case 'emboss':
                this.applyConvolutionFilter([
                    -2, -1, 0,
                    -1, 1, 1,
                    0, 1, 2
                ]);
                return;
                
            case 'edge':
                this.applyConvolutionFilter([
                    -1, -1, -1,
                    -1, 8, -1,
                    -1, -1, -1
                ]);
                return;
        }

        if (filterName !== 'none') {
            this.ctx.putImageData(imageData, 0, 0);
        }
    }

    applyConvolutionFilter(kernel) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const output = new Uint8ClampedArray(data);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let r = 0, g = 0, b = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const weight = kernel[(ky + 1) * 3 + (kx + 1)];
                        
                        r += data[idx] * weight;
                        g += data[idx + 1] * weight;
                        b += data[idx + 2] * weight;
                    }
                }
                
                const outputIdx = (y * width + x) * 4;
                output[outputIdx] = Math.max(0, Math.min(255, r));
                output[outputIdx + 1] = Math.max(0, Math.min(255, g));
                output[outputIdx + 2] = Math.max(0, Math.min(255, b));
            }
        }

        const newImageData = new ImageData(output, width, height);
        this.ctx.putImageData(newImageData, 0, 0);
    }

    rotateImage(degrees) {
        if (!this.originalImage) return;
        
        this.showLoading(true);
        
        setTimeout(() => {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            if (Math.abs(degrees) === 90) {
                tempCanvas.width = this.canvas.height;
                tempCanvas.height = this.canvas.width;
                
                tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
                tempCtx.rotate((degrees * Math.PI) / 180);
                tempCtx.drawImage(this.canvas, -this.canvas.width / 2, -this.canvas.height / 2);
                
                this.canvas.width = tempCanvas.width;
                this.canvas.height = tempCanvas.height;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(tempCanvas, 0, 0);
            }
            
            this.saveToHistory();
            this.showLoading(false);
        }, 100);
    }

    flipImage(direction) {
        if (!this.originalImage) return;
        
        this.showLoading(true);
        
        setTimeout(() => {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            
            tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
            
            if (direction === 'horizontal') {
                tempCtx.scale(-1, 1);
            } else {
                tempCtx.scale(1, -1);
            }
            
            tempCtx.drawImage(this.canvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(tempCanvas, 0, 0);
            
            this.saveToHistory();
            this.showLoading(false);
        }, 100);
    }

    toggleCropMode() {
        this.cropMode = !this.cropMode;
        const cropOverlay = document.getElementById('crop-overlay');
        const cropBtn = document.getElementById('crop-btn');
        const applyCropBtn = document.getElementById('apply-crop');
        
        if (this.cropMode) {
            cropOverlay.style.display = 'block';
            cropBtn.textContent = 'Cancel Crop';
            applyCropBtn.disabled = false;
            this.initializeCropBox();
        } else {
            cropOverlay.style.display = 'none';
            cropBtn.textContent = 'Enable Crop';
            applyCropBtn.disabled = true;
        }
    }

    initializeCropBox() {
        const canvasRect = this.canvas.getBoundingClientRect();
        const cropBox = document.getElementById('crop-box');
        
        this.cropBox = {
            x: canvasRect.width * 0.1,
            y: canvasRect.height * 0.1,
            width: canvasRect.width * 0.8,
            height: canvasRect.height * 0.8
        };
        
        this.updateCropBoxDisplay();
    }

    updateCropBoxDisplay() {
        const cropBox = document.getElementById('crop-box');
        cropBox.style.left = this.cropBox.x + 'px';
        cropBox.style.top = this.cropBox.y + 'px';
        cropBox.style.width = this.cropBox.width + 'px';
        cropBox.style.height = this.cropBox.height + 'px';
    }

    applyCrop() {
        if (!this.cropMode || !this.cropBox) return;
        
        this.showLoading(true);
        
        setTimeout(() => {
            const canvasRect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / canvasRect.width;
            const scaleY = this.canvas.height / canvasRect.height;
            
            const cropData = this.ctx.getImageData(
                this.cropBox.x * scaleX,
                this.cropBox.y * scaleY,
                this.cropBox.width * scaleX,
                this.cropBox.height * scaleY
            );
            
            this.canvas.width = this.cropBox.width * scaleX;
            this.canvas.height = this.cropBox.height * scaleY;
            this.ctx.putImageData(cropData, 0, 0);
            
            this.toggleCropMode();
            this.saveToHistory();
            this.showLoading(false);
        }, 100);
    }

    handleMouseDown(e) {
        if (!this.cropMode) return;
        
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        this.dragStart = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    handleMouseMove(e) {
        if (!this.cropMode || !this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        this.cropBox.x = Math.min(this.dragStart.x, currentX);
        this.cropBox.y = Math.min(this.dragStart.y, currentY);
        this.cropBox.width = Math.abs(currentX - this.dragStart.x);
        this.cropBox.height = Math.abs(currentY - this.dragStart.y);
        
        this.updateCropBoxDisplay();
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    zoom(factor) {
        this.zoomLevel *= factor;
        this.zoomLevel = Math.max(0.1, Math.min(5, this.zoomLevel));
        
        this.canvas.style.transform = `scale(${this.zoomLevel})`;
        document.getElementById('zoom-level').textContent = Math.round(this.zoomLevel * 100) + '%';
    }

    fitToScreen() {
        this.zoomLevel = 1;
        this.canvas.style.transform = 'scale(1)';
        document.getElementById('zoom-level').textContent = '100%';
    }

    saveToHistory() {
        if (!this.canvas) return;
        
        const imageData = this.canvas.toDataURL();
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(imageData);
        this.historyIndex++;
        
        this.updateHistoryButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadFromHistory();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadFromHistory();
        }
    }

    loadFromHistory() {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = this.history[this.historyIndex];
        this.updateHistoryButtons();
    }

    updateHistoryButtons() {
        document.getElementById('undo-btn').disabled = this.historyIndex <= 0;
        document.getElementById('redo-btn').disabled = this.historyIndex >= this.history.length - 1;
    }

    resetImage() {
        if (!this.originalImage) return;
        
        this.resetAdjustments();
        this.currentFilter = 'none';
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-filter="none"]').classList.add('active');
        this.drawImage();
        this.saveToHistory();
    }

    resetAdjustments() {
        this.adjustments = { brightness: 0, contrast: 0, saturation: 0, hue: 0 };
        
        ['brightness', 'contrast', 'saturation', 'hue'].forEach(adjustment => {
            const slider = document.getElementById(adjustment);
            const valueSpan = slider.nextElementSibling;
            slider.value = 0;
            valueSpan.textContent = '0';
        });
    }

    saveImage() {
        if (!this.canvas) return;
        
        this.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'edited_image.png';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    exportImage() {
        if (!this.canvas) return;
        
        const link = document.createElement('a');
        link.download = 'photo_editor_export.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'flex' : 'none';
    }
}

// Initialize the photo editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PhotoEditor();
});