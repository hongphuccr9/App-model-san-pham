
import { GoogleGenAI, Modality, Part } from "@google/genai";

// Helper to convert File to Gemini-compatible Part
const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export const generateFashionImage = async (
  modelImage: File,
  productImage: File,
  outfitImage: File | null,
  promptText: string,
  apiKey: string,
): Promise<string | null> => {
    try {
        if (!apiKey) {
            throw new Error("API Key is required.");
        }
        const ai = new GoogleGenAI({ apiKey: apiKey });

        const modelImagePart = await fileToGenerativePart(modelImage);
        const productImagePart = await fileToGenerativePart(productImage);

        const parts: Part[] = [
            modelImagePart,
            productImagePart,
        ];

        if (outfitImage) {
            const outfitImagePart = await fileToGenerativePart(outfitImage);
            parts.push(outfitImagePart);
        }
        
        parts.push({ text: promptText });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        // Rethrow or return null to indicate failure
        throw error;
    }
};
