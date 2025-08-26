async function testOllama() {
    console.log('Testing Ollama connection...');

    try {
        const response = await fetch('http://localhost:11434/api/tags');
        const data = await response.json();
        console.log('Available models:', data.models);

        // Check if gemma3n:e4b is available
        const hasModel = data.models.some(m => m.name.includes('gemma3n'));
        if (hasModel) {
            console.log('✅ Gemma model found!');
            document.getElementById('results').innerHTML =
                '<p style="color: green">✅ Model ready!</p>';
        } else {
            console.log('❌ Model not found, pull it with: ollama pull gemma3n:e4b');
        }
    } catch (error) {
        console.error('Cannot connect to Ollama:', error);
        document.getElementById('results').innerHTML =
            '<p style="color: red">❌ Cannot connect to Ollama. Is it running?</p>';
    }
}


async function analyzeImage(imageBase64) {

    const prompt = `Analyze this image for privacy concerns. 
    Look for: faces, documents, text, personal information.
    Return a simple JSON with:
    {
        "has_faces": true/false,
        "has_text": true/false,
        "privacy_risk": "low/medium/high",
        "description": "briefly explain what you found"
    }`;

    const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'gemma3n:e4b',
            prompt: prompt,
            images: [imageBase64.split(',')[1]], // Remove data:image prefix
            format: 'json',
            stream: false
        })
    });

    const data = await response.json();
    return JSON.parse(data.response);
}

// Wire up the file input
document.getElementById('file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Display the image
            document.getElementById('results').innerHTML =
                `<img src="${e.target.result}" style="max-width: 300px">`;

            // Store for analysis
            window.currentImage = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('analyze-btn').addEventListener('click', async () => {
    if (window.currentImage) {
        document.getElementById('results').innerHTML +=
            '<p>🔍 Analyzing...</p>';

        try {
            const analysis = await analyzeImage(window.currentImage);
            document.getElementById('results').innerHTML +=
                `<pre>${JSON.stringify(analysis, null, 2)}</pre>`;
        } catch (error) {
            console.error('Analysis failed:', error);
        }
    }
});

// Test on page load
window.onload = testOllama;