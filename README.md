# AI Privacy Gallery

**Privacy Analysis Pipeline:**
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

**AI Model Prompt:**
  System: "You are a privacy protection assistant"
  
  Prompt = `Analyze this image for privacy risks. Check for:
            - Faces (count them, note if children)
            - Documents (IDs, cards, medical, financial, license plate)
            - Personal text (names, addresses, emails, phones)
            - Location markers (signs, landmarks, buildings)
            - Screens with private data (PDPA, work info)
            - Sensitive contexts (medical, intimate)
            
            Score 1-5: 1=no risk, 2-3= medium risk (faces/partial info/documents), 4-5=critical (children/sensitive docs i.e IDs, medical).
            
            Return ONLY this JSON:
            {
                "privacy_score": <1-5>,
                "faces_count": <number>,
                "has_documents": <true/false>,
                "has_personal_text": <true/false>,
                "has_location_data": <true/false>,
                "has_children": <true/false>,
                "bounding_boxes_faces": [<array of [x1,y1,x2,y2] coordinates> or empty],
                "risk_level": "<low|medium|high|critical>",
                "action": "<safe|blur_all|encrypt>",
                "explanation": "<less than 30words describing what you see>"

            }`;


