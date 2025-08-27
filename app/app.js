// app.js - Full Gallery Implementation (Vanilla JS)
class PrivacyGallery {
    constructor() {
        this.state = {
            photos: [],
            analyzing: false,
            currentAnalysis: '',
            privacyMode: 'auto', // auto, show-all, hide-all
            stats: {
                total: 0,
                highRisk: 0,
                protected: 0
            }
        };
        this.container = null;
    }

    mount(selector) {
        this.container = document.querySelector(selector);
        this.attachEventListeners();
        this.render();
        this.loadPreloadedImages();
    }

    async loadPreloadedImages() {
        try {
            const response = await fetch('/api/images');
            if (!response.ok) {
                console.error('Failed to load preloaded images.');
                return;
            }
            const imageUrls = await response.json();

            for (const imageUrl of imageUrls) {
                const imageResponse = await fetch(`/images/${imageUrl}`);
                const blob = await imageResponse.blob();
                const reader = new FileReader();
                
                reader.onload = async (e) => {
                    const photo = {
                        id: Date.now() + Math.random(),
                        src: e.target.result,
                        name: imageUrl.split('/').pop(),
                        analysis: null,
                        protected: false,
                        loading: true
                    };

                    // Add to gallery immediately
                    this.setState({ photos: [...this.state.photos, photo] });

                    // Analyze in background
                    await this.analyzePhoto(photo);
                };
                
                reader.readAsDataURL(blob);
            }
        } catch (error) {
            console.error('Error loading preloaded images:', error);
        }
    }

    setState(newState) {
        Object.assign(this.state, newState);
        this.render();
    }

    async handleFiles(event) {
        const files = Array.from(event.target.files);

        for (const file of files) {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const photo = {
                    id: Date.now() + Math.random(),
                    src: e.target.result,
                    name: file.name,
                    analysis: null,
                    protected: false,
                    loading: true
                };

                // Add to gallery immediately
                this.setState({ photos: [...this.state.photos, photo] });

                // Analyze in background
                await this.analyzePhoto(photo);
            };

            reader.readAsDataURL(file);
        }
    }

    async analyzePhoto(photo) {
        this.setState({
            analyzing: true,
            currentAnalysis: `Analyzing ${photo.name}...`
        });

        try {
            const photoId = await this.getPhotoId(photo);
            
            // Check cache on server
            const cacheResponse = await fetch(`/cache/${photoId}`);
            if (cacheResponse.ok) {
                const analysis = await cacheResponse.json();
                const updatedPhotos = this.state.photos.map(p => {
                    if (p.id === photo.id) {
                        return { ...p, analysis, loading: false, protected: analysis.privacy_score >= 2 };
                    }
                    return p;
                });
                const stats = this.calculateStats(updatedPhotos);
                this.setState({
                    photos: updatedPhotos,
                    stats,
                    analyzing: false,
                    currentAnalysis: ''
                });
                return;
            }

            const prompt = `Analyze this image for privacy risks. Check for:
            - Faces (count them, note if children)
            - Documents (IDs, cards, medical, financial)
            - Personal text (names, addresses, emails, phones)
            - Location markers (signs, landmarks, buildings)
            - Screens with private data
            - Sensitive contexts (medical, intimate)
            
            Score 1-5: 1=no risk, 2-3= medium risk (faces/partial info/documents), 4-5=critical (children/sensitive docs i.e IDs, medical).
            
            Return ONLY this JSON:
            {
                "privacy_score": <1-5>,
                "faces_count": <number>,
                "has_documents": <true/false>,
                "has_personal_text": <true/false>,
                "has_location": <true/false>,
                "has_children": <true/false>,
                "risk_level": "<low|medium|high|critical>",
                "action": "<safe|blur_all|encrypt>",
                "explanation": "<less than 30words describing what you see>"
            }`;


            // Create abort controller for this request
            window.abortController = new AbortController();

            // Add image resizing for faster processing
            const resizedImage = await this.resizeImage(photo.src);
            
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: window.abortController.signal,
                body: JSON.stringify({
                    model: 'qwen2.5vl:3b',
                    prompt: prompt,
                    images: [resizedImage.split(',')[1]],
                    format: 'json',
                    stream: false,
                    options: {
                        temperature: 0.1,
                        num_predict: 200
                    }
                })
            });

            const data = await response.json();
            const analysis = JSON.parse(data.response);

            // Cache the result on the server
            await fetch(`/cache/${photoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(analysis)
            });

            const updatedPhotos = this.state.photos.map(p => {
                if (p.id === photo.id) {
                    return { ...p, analysis, loading: false, protected: analysis.privacy_score >= 2 };
                }
                return p;
            });

            const stats = this.calculateStats(updatedPhotos);

            this.setState({
                photos: updatedPhotos,
                stats,
                analyzing: false,
                currentAnalysis: ''
            });

        } catch (error) {
            console.error('Analysis failed:', error);
            const updatedPhotos = this.state.photos.map(p => {
                if (p.id === photo.id) {
                    return { ...p, loading: false, analysis: { risk_level: 'error', explanation: 'Analysis failed' } };
                }
                return p;
            });
            const stats = this.calculateStats(updatedPhotos);
            this.setState({
                photos: updatedPhotos,
                stats,
                analyzing: false
            });
        }
    }

    calculateStats(photos) {
        return {
            total: photos.length,
            highRisk: photos.filter(p =>
                p.analysis?.privacy_score >= 4).length,
            protected: photos.filter(p => p.protected).length
        };
    }

    async getPhotoId(photo) {
        const hash = await this.sha256(photo.src.split(',')[1]); // Hash the base64 part
        return `privacy-gallery-cache-${hash}`;
    }

    async sha256(str) {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder("utf-8").encode(str));
        return Array.from(new Uint8Array(buf))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Add image resizing for faster processing
    async resizeImage(base64Str, maxWidth = 800) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = base64Str;
        });
    }

    toggleProtection(photoId) {
        const updatedPhotos = this.state.photos.map(p => {
            if (p.id == photoId) {
                return { ...p, protected: !p.protected };
            }
            return p;
        });
        const stats = this.calculateStats(updatedPhotos);
        this.setState({ photos: updatedPhotos, stats });
    }

    shouldBlur(photo) {
        if (!photo.analysis) return false;

        switch (this.state.privacyMode) {
            case 'show-all':
                return false;
            case 'hide-all':
                return photo.analysis.privacy_score >= 2;
            case 'auto':
            default:
                return photo.protected;
        }
    }

    getRiskColor(riskLevel) {
        const colors = {
            low: '#4CAF50',
            medium: '#FF9800',
            high: '#FF5722',
            critical: '#F44336'
        };
        return colors[riskLevel] || '#9E9E9E';
    }
    /*
    async exportSafeVersion(photoId) {
        const photo = this.state.photos.find(p => p.id == photoId);
        if (!photo) return;

        // Apply blur and download
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            if (photo.analysis.faces_count > 0) {
                ctx.filter = 'blur(15px)';
            }

            ctx.drawImage(img, 0, 0);

            // Download
            const link = document.createElement('a');
            link.download = `safe_${photo.name}`;
            link.href = canvas.toDataURL();
            link.click();
        };

        img.src = photo.src;
    }
     */

    attachEventListeners() {
        this.container.addEventListener('change', (e) => {
            if (e.target.id === 'file-input') {
                this.handleFiles(e);
            }
        });

        this.container.addEventListener('click', (e) => {
            // Privacy mode buttons
            const privacyButton = e.target.closest('.privacy-modes button');
            if (privacyButton) {
                const modes = ['auto', 'show-all', 'hide-all'];
                const index = Array.from(privacyButton.parentElement.children).indexOf(privacyButton);
                this.setState({ privacyMode: modes[index] });
                return;
            }

            // Protection toggle buttons
            const protectButton = e.target.closest('.protect-btn');
            if (protectButton) {
                const photoCard = protectButton.closest('.photo-card');
                const photoId = photoCard.dataset.photoId;
                if (photoId) {
                    this.toggleProtection(photoId);
                }
                return;
            }
            /*
            // Export safe version buttons
            const exportButton = e.target.closest('.export-safe-btn');
            if (exportButton) {
                const photoCard = exportButton.closest('.photo-card');
                const photoId = photoCard.dataset.photoId;
                if (photoId) {
                    this.exportSafeVersion(photoId);
                }
                return;
            }
            */
        });
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="privacy-gallery-container">
                <!-- Header -->
                <header class="header">
                    <h1>🔒 Privacy Gallery</h1>
                    <div class="stats-bar">
                        <span>📸 ${this.state.stats.total} photos</span>
                        <span>⚠️ ${this.state.stats.highRisk} high risk</span>
                        <span>🛡️ ${this.state.stats.protected} protected</span>
                    </div>
                </header>

                <!-- Controls -->
                <div class="controls">
                    <div class="upload-section">
                        <input 
                            type="file" 
                            id="file-input"
                            multiple 
                            accept="image/*"
                        />
                        <label for="file-input" class="upload-btn">
                            📷 Add Photos
                        </label>
                    </div>
                    
                    <div class="privacy-modes">
                        <button class="${this.state.privacyMode === 'auto' ? 'active' : ''}">
                            🤖 Auto
                        </button>
                        <button class="${this.state.privacyMode === 'show-all' ? 'active' : ''}">
                            👁️ Show All
                        </button>
                        <button class="${this.state.privacyMode === 'hide-all' ? 'active' : ''}">
                            🔒 Hide Sensitive
                        </button>
                    </div>
                </div>

                <!-- Analysis Status -->
                ${this.state.analyzing ? `
                    <div class="analysis-status">
                        🔍 ${this.state.currentAnalysis}
                    </div>
                ` : ''}

                <!-- Gallery Grid -->
                <div class="gallery-grid">
                    ${this.state.photos.map(photo => this.renderPhotoCard(photo)).join('')}
                </div>

                <!-- Empty State -->
                ${this.state.photos.length === 0 ? `
                    <div class="empty-state">
                        <p>📷 No photos yet. Add some photos to analyze their privacy risks!</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderPhotoCard(photo) {
        const shouldBlur = this.shouldBlur(photo);
        const riskColor = photo.analysis ?
            this.getRiskColor(photo.analysis.risk_level) : '#ccc';

        return `
            <div class="photo-card ${shouldBlur ? 'blurred' : ''}" data-photo-id="${photo.id}">
                <div class="photo-wrapper">
                    <img src="${photo.src}" alt="${photo.name}" />
                    
                    ${photo.loading ? `
                        <div class="loading-overlay">
                            <div class="spinner"></div>
                            Analyzing...
                        </div>
                    ` : ''}
                    
                    ${photo.analysis ? `
                        <div class="privacy-badge" style="background: ${riskColor}">
                            ${photo.analysis.privacy_score}/5
                        </div>
                        
                        <div class="photo-controls">
                            <button 
                                class="protect-btn ${photo.protected ? 'active' : ''}"
                                title="${photo.protected ? 'Unprotect' : 'Protect'}">
                                ${photo.protected ? '🔒' : '🔓'}
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                ${photo.analysis ? `
                    <div class="photo-info">
                        <div class="risk-level" style="color: ${riskColor}">
                            ${photo.analysis.risk_level.toUpperCase()}
                        </div>
                        <div class="risk-details">
                            ${photo.analysis.faces_count > 0 ? 
                                `👤 ${photo.analysis.faces_count} face(s)` : ''}
                            ${photo.analysis.has_documents ? '📄 Documents' : ''}
                            ${photo.analysis.has_personal_text ? '📝 Personal text' : ''}
                        </div>
                        <div class="explanation">
                            ${photo.analysis.explanation}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// Initialize the app
const app = new PrivacyGallery();
app.mount('#app');

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    // Cancel any ongoing fetch requests
    if (window.abortController) {
        window.abortController.abort();
    }
});