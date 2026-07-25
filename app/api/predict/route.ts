import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import sharp from 'sharp';
import { GoogleGenAI, Type } from '@google/genai';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000/predict';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

function cleanUndefined(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) cleaned[key] = obj[key];
  }
  return cleaned;
}

async function compressImageToBase64(buffer: Buffer, mimeType: string): Promise<string> {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const maxDimension = 800;
  const width = metadata.width || 800;
  const height = metadata.height || 800;
  const ratio = Math.min(maxDimension / width, maxDimension / height, 1);
  const newWidth = Math.round(width * ratio);
  const newHeight = Math.round(height * ratio);
  const compressed = await image
    .resize(newWidth, newHeight, { fit: 'inside' })
    .jpeg({ quality: 70 })
    .toBuffer();
  return `data:image/jpeg;base64,${compressed.toString('base64')}`;
}

// -------------------------------------------------------------------------
// Gemini Vision Call
// -------------------------------------------------------------------------

async function callGeminiVision(imageBuffer: Buffer, mimeType: string): Promise<any> {
  if (!ai) throw new Error('Gemini API key not configured');
  const base64Image = imageBuffer.toString('base64');

  const prompt = `You are an expert agricultural plant pathologist. Analyze this leaf image and diagnose any crop diseases.
Determine:
- plant: crop type (e.g., Tomato, Potato, Corn, Apple, Grape, Pepper)
- disease: disease name or 'Healthy Leaf'
- scientificName: scientific name of the pathogen (if known)
- description: brief description
- symptoms: visual symptoms
- causes: conditions that favor the disease
- severity: 'None', 'Low', 'Moderate', 'High', or 'Critical'
- confidence: 0-100
- chemical: recommended chemical treatment
- organic: recommended organic treatment
- fertilizer: fertilizer recommendations
- water: watering recommendations
- prevention: prevention guidelines
- qualityMetrics: { blurScore, isBlurry, avgBrightness, brightnessStatus, contrastValue, contrastStatus, overallQualityScore }
- leafCoveragePercentage: 0-100

Return JSON matching the schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: [
      { inlineData: { mimeType, data: base64Image } },
      { text: prompt }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plant: { type: Type.STRING },
          disease: { type: Type.STRING },
          scientificName: { type: Type.STRING },
          description: { type: Type.STRING },
          symptoms: { type: Type.STRING },
          causes: { type: Type.STRING },
          severity: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          chemical: { type: Type.STRING },
          organic: { type: Type.STRING },
          fertilizer: { type: Type.STRING },
          water: { type: Type.STRING },
          prevention: { type: Type.STRING },
          qualityMetrics: {
            type: Type.OBJECT,
            properties: {
              blurScore: { type: Type.NUMBER },
              isBlurry: { type: Type.BOOLEAN },
              avgBrightness: { type: Type.NUMBER },
              brightnessStatus: { type: Type.STRING },
              contrastValue: { type: Type.NUMBER },
              contrastStatus: { type: Type.STRING },
              overallQualityScore: { type: Type.NUMBER },
            },
            required: ['blurScore', 'isBlurry', 'avgBrightness', 'brightnessStatus', 'contrastValue', 'contrastStatus', 'overallQualityScore'],
          },
          leafCoveragePercentage: { type: Type.NUMBER },
        },
        required: ['plant', 'disease', 'scientificName', 'description', 'symptoms', 'causes', 'severity', 'confidence', 'chemical', 'organic', 'fertilizer', 'water', 'prevention', 'qualityMetrics', 'leafCoveragePercentage'],
      },
    },
  });

  const text = response.text || '{}';
  return JSON.parse(text);
}

// -------------------------------------------------------------------------
// Extract Prediction from Various Structures
// -------------------------------------------------------------------------

function extractPrediction(raw: any) {
  // Try common nesting: prediction, data, result, or the root
  const data = raw?.prediction || raw?.data || raw?.result || raw;

  if (!data || typeof data !== 'object') {
    return {
      plant: 'Unknown Plant',
      disease: 'Unknown Disease',
      confidence: 0,
      scientificName: 'N/A',
      description: '',
      symptoms: '',
      causes: '',
      severity: 'Moderate',
      treatment: {},
      preprocessing: {}
    };
  }

  // Scientific name - try multiple common keys
  const scientificName =
    data.scientificName ||
    data.scientific_name ||
    data.scientific ||
    data['scientific name'] ||
    'N/A';

  const plant = data.plant || data.plantType || data.crop || 'Unknown Plant';
  const disease = data.disease || data.diseaseName || 'Unknown Disease';
  const confidence = Number(data.confidence) || 0;
  const description = data.description || '';
  const symptoms = data.symptoms || '';
  const causes = data.causes || '';
  const severity = data.severity || 'Moderate';

  const treatment = data.treatment || {
    chemical: data.chemical || '',
    organic: data.organic || '',
    fertilizer: data.fertilizer || '',
    water: data.water || '',
    prevention: data.prevention || '',
  };

  const preprocessing = data.preprocessing || data.qualityMetrics ? {
    dimensions: data.dimensions || { original: '1024x768', processed: '224x224' },
    qualityMetrics: data.qualityMetrics || { blurScore: 0, isBlurry: false, avgBrightness: 128, brightnessStatus: 'Good', contrastValue: 60, contrastStatus: 'Good', overallQualityScore: 85 },
    leafCoveragePercentage: data.leafCoveragePercentage || 90,
    images: { original: '', denoised: '', gaussianBlur: '', medianFilter: '', histogramEqualized: '', segmented: '', resized: '' }
  } : {};

  return { plant, disease, confidence, scientificName, description, symptoms, causes, severity, treatment, preprocessing };
}

// -------------------------------------------------------------------------
// POST Handler
// -------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    let uid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // 2. Get file
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file' }, { status: 400 });
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type) || file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Invalid file type or size' }, { status: 400 });
    }
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 3. Compress original image for Firestore
    const compressedOriginal = await compressImageToBase64(fileBuffer, file.type);

    // 4. Try FastAPI, fallback to Gemini
    let rawResult: any = null;
    let aiSource = 'fastapi';

    try {
      const fastApiFormData = new FormData();
      const blob = new Blob([fileBuffer], { type: file.type });
      fastApiFormData.append('file', blob, file.name);

      const response = await fetch(FASTAPI_URL, {
        method: 'POST',
        body: fastApiFormData,
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`FastAPI status ${response.status}`);
      rawResult = await response.json();
      console.log('📥 FastAPI raw response:', JSON.stringify(rawResult, null, 2));
      if (!rawResult.success) throw new Error(rawResult.error || 'FastAPI inference failed');
    } catch (fastApiError) {
      console.warn('⚠️ FastAPI failed, falling back to Gemini:', fastApiError);
      aiSource = 'gemini';
      try {
        rawResult = await callGeminiVision(fileBuffer, file.type);
        console.log('📥 Gemini raw response:', JSON.stringify(rawResult, null, 2));
        rawResult.success = true; // mark success
      } catch (geminiError) {
        console.error('❌ Gemini also failed:', geminiError);
        return NextResponse.json(
          { success: false, error: `AI services unavailable: ${geminiError}` },
          { status: 503 }
        );
      }
    }

    // 5. Extract prediction from whatever we got
    const extracted = extractPrediction(rawResult);
    const { plant, disease, confidence, scientificName, description, symptoms, causes, severity, treatment, preprocessing } = extracted;

    // 6. If still unknown, return error
    if (plant === 'Unknown Plant' || disease === 'Unknown Disease') {
      console.error('❌ Failed to extract plant/disease from:', JSON.stringify(rawResult));
      return NextResponse.json(
        { success: false, error: 'AI returned incomplete diagnosis data' },
        { status: 500 }
      );
    }

    // 7. Disease lookup/create
    let diseaseId: string;
    try {
      const diseaseQuery = await adminDb
        .collection('diseases')
        .where('name', '==', disease)
        .where('plantType', '==', plant)
        .limit(1)
        .get();

      if (diseaseQuery.empty) {
        const newRef = adminDb.collection('diseases').doc();
        await newRef.set({
          name: disease,
          scientificName,
          description,
          symptoms,
          causes,
          severity,
          plantType: plant,
          treatment,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        diseaseId = newRef.id;
      } else {
        diseaseId = diseaseQuery.docs[0].id;
      }
    } catch (e) {
      console.error('Disease lookup failed:', e);
      diseaseId = `fallback_${Date.now()}_${disease.replace(/\s/g, '_')}`;
    }

    // 8. Handle preprocessed image if available
    let preprocessedImageUrl = compressedOriginal;
    if (preprocessing.images?.segmented) {
      const seg = preprocessing.images.segmented;
      const matches = seg.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mime = matches[1];
        const buf = Buffer.from(matches[2], 'base64');
        preprocessedImageUrl = await compressImageToBase64(buf, mime);
      }
    }

    // 9. Prepare prediction document
    const predictionData = {
      userId: uid,
      diseaseId,
      confidence,
      processingTime: rawResult.processingTime || '0.0s',
      originalImage: compressedOriginal,
      preprocessedImage: preprocessedImageUrl,
      blurScore: preprocessing.qualityMetrics?.blurScore ?? 0,
      brightness: preprocessing.qualityMetrics?.avgBrightness ?? 0,
      contrastValue: preprocessing.qualityMetrics?.contrastValue ?? 0,
      qualityScore: preprocessing.qualityMetrics?.overallQualityScore ?? 0,
      leafCoverage: preprocessing.leafCoveragePercentage ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      diseaseName: disease,
      plantType: plant,
      severity,
      aiSource,
    };

    const cleaned = cleanUndefined(predictionData);
    const predictionRef = await adminDb.collection('predictions').add(cleaned);
    await adminDb.collection('scanHistories').add({
      userId: uid,
      predictionId: predictionRef.id,
      createdAt: new Date().toISOString(),
    });

    // 10. Build response payload
    const resultPayload = {
      ...rawResult,
      prediction: {
        plant,
        disease,
        scientificName,   // <-- now correctly extracted
        description,
        symptoms,
        causes,
        severity,
        treatment,
        confidence,
        processingTime: rawResult.processingTime || '0.0s',
        topPredictions: rawResult.topPredictions || [],
      },
      preprocessing: {
        dimensions: preprocessing.dimensions || { original: '1024x768', processed: '224x224' },
        qualityMetrics: preprocessing.qualityMetrics || {
          blurScore: 0,
          isBlurry: false,
          avgBrightness: 128,
          brightnessStatus: 'Good',
          contrastValue: 60,
          contrastStatus: 'Good',
          overallQualityScore: 85,
        },
        leafCoveragePercentage: preprocessing.leafCoveragePercentage ?? 90,
        images: {
          original: compressedOriginal,
          denoised: compressedOriginal,
          gaussianBlur: compressedOriginal,
          medianFilter: compressedOriginal,
          histogramEqualized: compressedOriginal,
          segmented: preprocessedImageUrl,
          resized: compressedOriginal,
        },
      },
      aiSource,
    };

    return NextResponse.json({
      success: true,
      predictionId: predictionRef.id,
      data: resultPayload,
    });

  } catch (e: any) {
    console.error('❌ Prediction route error:', e);
    return NextResponse.json(
      { success: false, error: e.message || 'Internal server error' },
      { status: 500 }
    );
  }
}