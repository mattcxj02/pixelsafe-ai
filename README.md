# AI Privacy Gallery
A fully offline privacy-focused gallery with AI that analyzes images for sensitive content, assigns privacy risk scores, and gives short descriptions using local AI inference.


### **Installation/Requirements:**


#### **Usage Examples:**

#### **Features**

#### **Privacy Analysis Pipeline:**
  1. Image Input [Resized for faster processing] 

  2. Qwen2.5vl:3b Analysis Layer via Ollama Local Inference:
     - Detects sensitive elements (faces, documents, text, locations)
     - Assigns privacy score
     - Suggests redaction strategy
     - Provides Bounding Boxes for faces location
  
  3. Action Layer:
     - Auto-blur/encrypt based on score
     - Store explanation for user
     - Generate privacy risk description








