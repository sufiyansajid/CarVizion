# AI-Based 3D Car Part Detection with Hugging Face

## Overview

This guide explains how to use Hugging Face AI models to automatically detect and segment car parts in 3D models.

## 🤗 Recommended Hugging Face Models

### **1. SAM (Segment Anything Model)** ⭐ Recommended
- **Model:** `facebook/sam-vit-huge`
- **Purpose:** Segment any object in images
- **Accuracy:** Very high
- **Speed:** Medium
- **Best for:** General-purpose segmentation

### **2. CLIP (Contrastive Language-Image Pre-training)**
- **Model:** `openai/clip-vit-large-patch14`
- **Purpose:** Zero-shot image classification
- **Accuracy:** High
- **Speed:** Fast
- **Best for:** Classifying individual parts

### **3. DINOv2**
- **Model:** `facebook/dinov2-large`
- **Purpose:** Feature extraction + segmentation
- **Accuracy:** Very high
- **Speed:** Medium

### **4. PointNet++ (For direct 3D processing)**
- **Model:** Custom implementation needed
- **Purpose:** 3D point cloud segmentation
- **Accuracy:** High for 3D data
- **Speed:** Slow
- **Best for:** Direct 3D mesh analysis

---

## 🚀 Implementation Steps

### **Step 1: Install Dependencies**

```bash
npm install @huggingface/inference
```

### **Step 2: Get Hugging Face API Key**

1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a new token (Read access is sufficient)
3. Copy the token

### **Step 3: Add API Key to Environment**

Create or update `.env` file:

```env
VITE_HUGGINGFACE_API_KEY=your_api_key_here
```

### **Step 4: Use AI Part Detection**

The service is already created at `src/services/aiPartDetection.ts`

#### **Method 1: CLIP-based Detection** (Recommended - Fastest)

```tsx
import { detectCarParts } from '@/services/aiPartDetection';

// In your component
const handleAIDetection = async () => {
  try {
    const result = await detectCarParts(scene, renderer, camera, 'clip');
    
    console.log('AI Detection Results:', {
      body: result.body.length,
      rims: result.rims.length,
      windows: result.windows.length,
      lights: result.lights.length,
      confidence: result.confidence
    });
    
    // Use the detected parts
    setCarParts(result);
  } catch (error) {
    console.error('AI detection failed:', error);
  }
};
```

#### **Method 2: SAM-based Detection** (Most Accurate)

```tsx
const result = await detectCarParts(scene, renderer, camera, 'sam');
```

---

## 📊 How Each Method Works

### **CLIP Method** (Recommended)

1. **Render each mesh individually** to an image
2. **Send image to CLIP** with candidate labels:
   - "car body"
   - "wheel"
   - "window"
   - "headlight"
   - "taillight"
3. **CLIP returns probabilities** for each label
4. **Assign mesh to category** with highest probability

**Pros:**
- Fast (processes one mesh at a time)
- Accurate for distinct parts
- Works well with any car model

**Cons:**
- Requires rendering each mesh
- May struggle with very similar parts

### **SAM Method**

1. **Render 3D model** from multiple angles (front, side, top)
2. **SAM segments each view** into distinct regions
3. **Map 2D segments back to 3D meshes** using raycasting
4. **Combine results** from all views

**Pros:**
- Very accurate segmentation
- Handles complex shapes well

**Cons:**
- Slower (processes multiple views)
- More complex implementation
- Requires view-to-mesh mapping

---

## 🔧 Integration with CarModel3D

### **Option 1: Automatic AI Detection on Load**

Update `CarModel3D.tsx`:

```tsx
import { detectCarParts } from '@/services/aiPartDetection';

useEffect(() => {
  if (scene && useAI) {
    const detectParts = async () => {
      try {
        const result = await detectCarParts(scene, renderer, camera, 'clip');
        setCarParts(result);
        console.log('AI detection complete:', result.confidence);
      } catch (error) {
        console.error('AI detection failed, using heuristics:', error);
        // Fallback to heuristic detection
        detectPartsWithHeuristics();
      }
    };
    
    detectParts();
  }
}, [scene, useAI]);
```

### **Option 2: Manual AI Detection Button**

Add button in AR Studio:

```tsx
<Button onClick={handleAIDetection}>
  <Sparkles className="w-4 h-4 mr-2" />
  AI Detect Parts
</Button>
```

---

## 💰 Cost Considerations

### **Hugging Face Inference API Pricing**

- **Free Tier:** 
  - 30,000 requests/month
  - Rate limited
  - Good for development

- **Pro Tier ($9/month):**
  - 300,000 requests/month
  - Faster inference
  - Better for production

### **Self-Hosted Alternative** (Free)

You can run models locally:

```bash
# Install transformers.js (browser-based inference)
npm install @xenova/transformers
```

Then use models directly in the browser (no API calls):

```tsx
import { pipeline } from '@xenova/transformers';

// Load CLIP model
const classifier = await pipeline('zero-shot-image-classification', 
  'Xenova/clip-vit-base-patch32');

// Classify
const result = await classifier(imageBlob, ['car body', 'wheel', 'window']);
```

**Pros:**
- Free (no API costs)
- Works offline
- Privacy (data stays local)

**Cons:**
- Slower (runs in browser)
- Larger bundle size
- Limited to smaller models

---

## 🎯 Recommended Approach

### **For Development:**
1. Use **heuristic detection** (current implementation)
2. Add **AI detection button** for testing
3. Compare results and fine-tune

### **For Production:**
1. **Hybrid approach:**
   - Try heuristic detection first (fast, free)
   - If confidence is low, use AI detection
   - Cache AI results for each model

2. **Implementation:**
```tsx
const detectParts = async () => {
  // Try heuristics first
  const heuristicResult = detectWithHeuristics(scene);
  
  // Check confidence
  const avgConfidence = calculateConfidence(heuristicResult);
  
  if (avgConfidence < 0.7) {
    console.log('Low confidence, using AI detection...');
    const aiResult = await detectCarParts(scene, renderer, camera, 'clip');
    return aiResult;
  }
  
  return heuristicResult;
};
```

---

## 📝 Alternative: Backend-Based Detection

For better performance and cost control, run AI models on your backend:

### **Backend Setup (Python + FastAPI)**

```python
# backend/ai_detection.py
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch

model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")

@app.post("/api/detect-parts")
async def detect_parts(image: UploadFile):
    # Load image
    img = Image.open(image.file)
    
    # Prepare inputs
    labels = ["car body", "wheel", "window", "headlight"]
    inputs = processor(text=labels, images=img, return_tensors="pt", padding=True)
    
    # Get predictions
    outputs = model(**inputs)
    logits_per_image = outputs.logits_per_image
    probs = logits_per_image.softmax(dim=1)
    
    # Return results
    return {
        "predictions": [
            {"label": label, "score": float(prob)}
            for label, prob in zip(labels, probs[0])
        ]
    }
```

### **Frontend Integration**

```tsx
const detectPartsViaBackend = async (imageBlob: Blob) => {
  const formData = new FormData();
  formData.append('image', imageBlob);
  
  const response = await fetch('http://localhost:3001/api/detect-parts', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  return result.predictions;
};
```

---

## 🔍 Testing AI Detection

### **1. Enable Debug Mode**
```tsx
<CarModel3D debugMode={true} useAI={true} />
```

### **2. Compare Results**
```tsx
// Heuristic detection
const heuristicParts = detectWithHeuristics(scene);

// AI detection
const aiParts = await detectCarParts(scene, renderer, camera, 'clip');

// Compare
console.table({
  'Heuristic': {
    body: heuristicParts.body.length,
    rims: heuristicParts.rims.length,
    windows: heuristicParts.windows.length,
    lights: heuristicParts.lights.length,
  },
  'AI': {
    body: aiParts.body.length,
    rims: aiParts.rims.length,
    windows: aiParts.windows.length,
    lights: aiParts.lights.length,
  }
});
```

---

## 📚 Resources

### **Hugging Face Models**
- [SAM Model](https://huggingface.co/facebook/sam-vit-huge)
- [CLIP Model](https://huggingface.co/openai/clip-vit-large-patch14)
- [DINOv2 Model](https://huggingface.co/facebook/dinov2-large)

### **Documentation**
- [Hugging Face Inference API](https://huggingface.co/docs/api-inference/index)
- [Transformers.js](https://huggingface.co/docs/transformers.js)
- [CLIP Paper](https://arxiv.org/abs/2103.00020)

### **Tutorials**
- [Using CLIP for Zero-Shot Classification](https://huggingface.co/blog/clip-zero-shot)
- [SAM for Image Segmentation](https://huggingface.co/blog/segment-anything)

---

## 🎯 Next Steps

1. **Get Hugging Face API key**
2. **Install dependencies:** `npm install @huggingface/inference`
3. **Add API key to `.env`**
4. **Test AI detection** with debug mode
5. **Compare with heuristic detection**
6. **Choose best approach** for your use case

---

## ⚠️ Important Notes

- **API Rate Limits:** Free tier has limits, use caching
- **Model Size:** Browser-based models increase bundle size
- **Accuracy:** AI is not 100% accurate, always have fallbacks
- **Privacy:** Consider where data is processed (client vs server vs API)

---

**Questions?** Check the console logs for detailed detection results!
