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
            throw new Error("API Key must be provided.");
        }
        const ai = new GoogleGenAI({ apiKey });

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

        if (error instanceof Error) {
            const lowerCaseMessage = error.message.toLowerCase();

            // 1. Quota errors (429)
            if (lowerCaseMessage.includes('429') || lowerCaseMessage.includes('quota')) {
                 throw new Error(
                    '<strong>Lỗi Hạn Mức:</strong> Bạn đã sử dụng hết lượt miễn phí. Vui lòng <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" class="underline hover:text-red-800">thiết lập thanh toán</a> cho API key của bạn để tiếp tục.'
                );
            }
    
            // 2. Invalid API key errors
            if (lowerCaseMessage.includes('api key not valid') || lowerCaseMessage.includes('invalid api key')) {
                throw new Error(
                    '<strong>API Key Không Hợp Lệ:</strong> Vui lòng kiểm tra lại API key bạn đã nhập. Key phải bắt đầu bằng "AIza..."'
                );
            }
    
            // 3. Region blocking errors
            if (lowerCaseMessage.includes('user location is not supported')) {
                 throw new Error(
                    '<strong>Lỗi Vị Trí:</strong> Rất tiếc, Gemini API hiện không được hỗ trợ tại khu vực của bạn.'
                );
            }

            // Let other specific errors pass through to be handled by the UI
            throw error;
        }
    
        // Fallback for other errors
        throw new Error(
            '<strong>Đã xảy ra lỗi không xác định:</strong> Vui lòng thử lại sau hoặc kiểm tra console của trình duyệt để biết thêm chi tiết.'
        );
    }
};
