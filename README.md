# AI Privacy Gallery
This project is a privacy-first AI gallery that helps users identify and protect sensitive information in their photos. It is a full-stack application with a Python backend and a vanilla JavaScript frontend.




## **Problem Statement:**
In the age of social media and cloud storage, it is easy to lose track of the sensitive information contained in our photos. Personal information such as faces, documents, and location data can be inadvertently shared, leading to privacy risks. This project aims to provide a tool that helps users to identify and protect their privacy by analyzing images for sensitive content and providing easy-to-use tools for redacting or protecting this information.

### **Development Tools:**

*   **Backend:** Python, Flask
*   **Frontend:** Vanilla JS, HTML, CSS
*   **AI Model:** Qwen2.5-VL-3B-Instruct
*   **AI Framework:** Ollama

**APIs Used:**
*   **Ollama API:** The application uses the Ollama API to interact with the local AI model. The frontend sends a request to the backend, which then proxies the request to the Ollama server.
*   **Flask API:** The backend is built using Flask and provides a set of RESTful APIs for the frontend to consume. These APIs are used to list images, serve images, and cache analysis results.

**Assets Used:**

*   The project uses a set of sample images located in the `data/pictures` directory. These images are used to demonstrate the functionality of the application.

**Libraries Used:**

*   **Python:**
    *   `Flask`: A lightweight web framework for Python.
    *   `Flask-CORS`: A Flask extension for handling Cross-Origin Resource Sharing (CORS).
    *   `requests`: A Python library for making HTTP requests.
*   **JavaScript:**
    *   No external libraries are used in the frontend. The application is built using vanilla JavaScript.
### **Installation/Requirements:**


#### **Usage Examples:**
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








