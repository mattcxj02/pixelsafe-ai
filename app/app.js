// app.js - Full Gallery Implementation (Client Side Vanilla JS)
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
        this.icons = this.initializeIcons();
    }

    // Initialize SVG icons
    initializeIcons() {
        return {
            camera: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
            eye: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
            eyeOff: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`,
            shield: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
            lock: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><circle cx="12" cy="16" r="1"></circle><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
            unlock: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><circle cx="12" cy="16" r="1"></circle><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`,
            user: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
            file: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline></svg>`,
            type: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>`,
            mapPin: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
            baby: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12h6l-3-9-3 9Z"></path><path d="M12 3c2.21 0 4 1.79 4 4 0 1.657-2 3-2 3s-2-1.343-2-3c0-2.21 1.79-4 4-4Z"></path><circle cx="12" cy="20" r="1"></circle><path d="M12 16s4-2 4-6"></path><path d="M12 16s-4-2-4-6"></path></svg>`,
            car: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H8.5a1 1 0 0 0-.8.4L5 11l-5.16 1.86a1 1 0 0 0-.84.99V16h3m0 0a2 2 0 1 0 4 0m10 0a2 2 0 1 0 4 0"></path></svg>`,
            robot: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>`,
            search: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>`,
            image: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21,15 16,10 5,21"></polyline></svg>`,
            alertTriangle: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
        };
    }

    mount(selector) {
        this.container = document.querySelector(selector);
        this.attachEventListeners();
        this.render();
        this.loadPreloadedImages();
    }
    // Load preloaded images
    async loadPreloadedImages() {
        try {
            const response = await fetch('/api/images');
            if (!response.ok) {
                console.error('Failed to load preloaded images.');
                return;
            }
            const imageUrls = await response.json();

            // Add skeleton placeholders immediately for better UX
            const skeletonPhotos = imageUrls.map(() => ({
                id: Date.now() + Math.random(),
                src: null,
                name: 'Loading...',
                analysis: null,
                protected: false,
                loading: true,
                skeleton: true
            }));

            this.setState({ photos: [...this.state.photos, ...skeletonPhotos] });

            // Load images progressively
            for (let i = 0; i < imageUrls.length; i++) {
                const imageUrl = imageUrls[i];
                const imageResponse = await fetch(`/images/${imageUrl}`);
                const blob = await imageResponse.blob();
                const reader = new FileReader();
                
                reader.onload = async (e) => {
                    const photo = {
                        id: skeletonPhotos[i].id,
                        src: e.target.result,
                        name: imageUrl.split('/').pop(),
                        analysis: null,
                        protected: false,
                        loading: true,
                        skeleton: false
                    };

                    // Update the skeleton with actual photo
                    const updatedPhotos = this.state.photos.map(p => 
                        p.id === photo.id ? photo : p
                    );
                    this.setState({ photos: updatedPhotos });

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
    // Handle file inputs
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
    // Analyze a single photo for privacy risks using LLM via Ollama Local API
    async analyzePhoto(photo) {
        this.setState({
            analyzing: true,
            currentAnalysis: `${this.icons.search} Analyzing ${photo.name}...`
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
            - Documents (IDs, cards, medical, financial, license plate,passport)
            - Personal text (names, addresses, emails, phones)
            - Location markers (signs, landmarks, buildings)
            - Screens with private data (PDPA, work info)
            - Sensitive contexts (medical, intimate,passports, IDs)
            
            Score 1-5: 1=no risk, 2-3= medium risk (faces/partial-info/documents), 4-5=critical (children/sensitive docs(eg. passport, IDs)).
            
            Return ONLY this JSON:
            {
                "privacy_score": <1-5>,
                "faces_count": <number>,
                "has_documents": <true/false>,
                "has_personal_text": <true/false>,
                "has_location_data": <true/false>,
                "has_license_plates": <true/false>,
                "has_children": <true/false>,
                "bounding_boxes_faces": [<array of [x1,y1,x2,y2] coordinates> or empty],
                "risk_level": "<low|medium|high|critical>",
                "explanation": "<less than 20 words describing what you see>"
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

    // Generate a unique ID for the photo based on its content from base64 encoding (hashing)
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

    // Add image resizing for faster processing qwen2.5vl uses multiple of 28 pixels therefore 28x28 = 784

    async resizeImage(base64Str, maxWidth = 784) {
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
    // toggle protection status of a photo
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
    // Determine if photo should be blurred based on privacy mode and analysis if >= 2
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
    // Get color based on risk level
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
                <!-- Header with Logo -->
                <header class="header">
                    <div class="header-top">
                        <div class="logo-container">
                            <img src="/assets/pixelsafe-ai-svg.svg" alt="PixelSafe AI Logo" class="logo" />
                        </div>
                    </div>
                    <div class="stats-bar">
                        <span>${this.icons.image} ${this.state.stats.total} photos</span>
                        <span>${this.icons.alertTriangle} ${this.state.stats.highRisk} high risk</span>
                        <span>${this.icons.shield} ${this.state.stats.protected} protected</span>
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
                            ${this.icons.camera} Add Photos
                        </label>
                    </div>
                    
                    <div class="privacy-modes">
                        <button class="${this.state.privacyMode === 'auto' ? 'active' : ''}">
                            ${this.icons.robot} Auto
                        </button>
                        <button class="${this.state.privacyMode === 'show-all' ? 'active' : ''}">
                            ${this.icons.eye} Show All
                        </button>
                        <button class="${this.state.privacyMode === 'hide-all' ? 'active' : ''}">
                            ${this.icons.eyeOff} Hide Sensitive
                        </button>
                    </div>
                </div>

                <!-- Analysis Status -->
                ${this.state.analyzing ? `
                    <div class="analysis-status">
                        ${this.state.currentAnalysis}
                    </div>
                ` : ''}

                <!-- Gallery Grid -->
                <div class="gallery-grid">
                    ${this.state.photos.map(photo => this.renderPhotoCard(photo)).join('')}
                </div>

                <!-- Empty State -->
                ${this.state.photos.length === 0 ? `
                    <div class="empty-state">
                        <p>${this.icons.camera} No photos yet. Add some photos to analyze their privacy risks!</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderPhotoCard(photo) {
        // Render skeleton if photo is still loading
        if (photo.skeleton) {
            return `
                <div class="photo-card" data-photo-id="${photo.id}">
                    <div class="photo-wrapper">
                        <div class="photo-skeleton skeleton"></div>
                        <div class="skeleton-badge skeleton"></div>
                        <div class="skeleton-button skeleton"></div>
                    </div>
                    <div class="photo-info">
                        <div class="skeleton-text title skeleton"></div>
                        <div class="skeleton-text subtitle skeleton"></div>
                        <div class="skeleton-text description skeleton"></div>
                    </div>
                </div>
            `;
        }

        const shouldBlur = this.shouldBlur(photo);
        const riskColor = photo.analysis ?
            this.getRiskColor(photo.analysis.risk_level) : '#ccc';

        return `
            <div class="photo-card ${shouldBlur ? 'blurred' : ''}" data-photo-id="${photo.id}">
                <div class="photo-wrapper">
                    <img src="${photo.src}" alt="${photo.name}" />
                    
                    ${photo.loading && !photo.skeleton ? `
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
                                ${photo.protected ? this.icons.lock : this.icons.unlock}
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
                                `<span>${this.icons.user} ${photo.analysis.faces_count} face(s)</span>` : ''}
                            ${photo.analysis.has_documents ? `<span>${this.icons.file} Documents</span>` : ''}
                            ${photo.analysis.has_personal_text ? `<span>${this.icons.type} Personal text</span>` : ''}
                            ${photo.analysis.has_location_data ? `<span>${this.icons.mapPin} Location</span>` : ''}
                            ${photo.analysis.has_children ? `<span>${this.icons.baby} Children</span>` : ''}
                            ${photo.analysis.has_license_plates ? `<span>${this.icons.car} License plates</span>` : ''}
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