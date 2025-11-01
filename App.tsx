
import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { OptionGroup } from './components/OptionGroup';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { OUTFIT_STYLES, PHOTO_STYLES, ACCESSORIES, POSES, BACKGROUND_STYLES } from './constants';
import { generateFashionImage } from './services/geminiService';

const App: React.FC = () => {
    const [modelImage, setModelImage] = useState<File | null>(null);
    const [productImage, setProductImage] = useState<File | null>(null);
    const [outfitImage, setOutfitImage] = useState<File | null>(null);

    const [selectedOutfits, setSelectedOutfits] = useState<string[]>(['Chân váy']);
    const [selectedBackground, setSelectedBackground] = useState<string[]>(['Studio trắng']);
    const [customBackground, setCustomBackground] = useState<string>('');
    const [selectedPhotoStyle, setSelectedPhotoStyle] = useState<string[]>(['Chân dung']);
    const [customPhotoStyle, setCustomPhotoStyle] = useState<string>('');
    const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
    const [customAccessories, setCustomAccessories] = useState<string>('');
    const [selectedPoses, setSelectedPoses] = useState<string[]>(['Giơ lên cao']);
    const [customPose, setCustomPose] = useState<string>('');

    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const isGenerationDisabled = !modelImage || !productImage || isLoading;

    const buildPrompt = useCallback(() => {
        const promptParts: string[] = [];

        promptParts.push(`Create a photorealistic image of the model from the first image wearing the product from the second image.`);

        let imageCounter = 2;
        let outfitImageIndex = 0;

        if (outfitImage) {
            imageCounter++;
            outfitImageIndex = imageCounter;
            promptParts.push(`The overall outfit should be inspired by the image at position ${outfitImageIndex}.`);
        }

        if (selectedOutfits.length > 0) {
            promptParts.push(`The model is also wearing: ${selectedOutfits.join(', ')}.`);
        }

        const accessories = customAccessories || (selectedAccessories.length > 0 ? selectedAccessories.join(', ') : '');
        if (accessories) {
            promptParts.push(`Accessories include: ${accessories}.`);
        }

        const poses = customPose || (selectedPoses.length > 0 ? selectedPoses.join(', ') : '');
        if (poses) {
            promptParts.push(`The model's pose is: ${poses}.`);
        }

        const photoStyle = customPhotoStyle || (selectedPhotoStyle.length > 0 ? selectedPhotoStyle[0] : '');
        if (photoStyle) {
            promptParts.push(`This is a ${photoStyle} style shot.`);
        }
        
        const background = customBackground || (selectedBackground.length > 0 ? selectedBackground[0] : '');
        if (background) {
            promptParts.push(`The background is: ${background}.`);
        } else {
            promptParts.push(`The background is a clean, minimalist studio setting with soft lighting.`);
        }

        promptParts.push(`Ensure the final image is high-resolution and suitable for a fashion catalog.`);

        return promptParts.join(' ');
    }, [outfitImage, selectedOutfits, selectedBackground, customBackground, selectedPhotoStyle, customPhotoStyle, selectedAccessories, customAccessories, selectedPoses, customPose]);

    const handleGenerate = async () => {
        if (isGenerationDisabled) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        const prompt = buildPrompt();

        try {
            const result = await generateFashionImage(modelImage!, productImage!, outfitImage, prompt);
            
            if (!result) {
                throw new Error('Image generation failed. Please try again.');
            }

            setGeneratedImage(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadImage = (src: string, index: number) => {
        const link = document.createElement('a');
        link.href = src;
        const mimeType = src.match(/data:([^;]+);/)?.[1] || 'image/png';
        const extension = mimeType.split('/')[1] || 'png';
        link.download = `generated-image-${index + 1}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleDownload = () => {
        if (!generatedImage) return;
        handleDownloadImage(generatedImage, 0);
    };


    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-violet-50">
            <header className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">App tạo ảnh model cầm sản phẩm</h1>
            </header>
            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Form */}
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FileUpload title="1. Ảnh Người Mẫu" required image={modelImage} setImage={setModelImage} />
                        <FileUpload title="2. Ảnh Sản Phẩm" required image={productImage} setImage={setProductImage} />
                    </div>
                    <FileUpload title="3. Ảnh Trang Phục (Tùy chọn)" image={outfitImage} setImage={setOutfitImage} isLarge />
                    
                    <OptionGroup
                        title="4. Bối Cảnh (Tùy chọn)"
                        options={BACKGROUND_STYLES}
                        selectedOptions={selectedBackground}
                        setSelectedOptions={setSelectedBackground}
                        customValue={customBackground}
                        setCustomValue={setCustomBackground}
                        placeholder="ví dụ: 'trên du thuyền sang trọng'"
                    />

                    <OptionGroup
                        title="5. Kiểu Trang Phục (Tùy chọn)"
                        options={OUTFIT_STYLES}
                        selectedOptions={selectedOutfits}
                        setSelectedOptions={setSelectedOutfits}
                        allowMultiple
                    />
                     <OptionGroup
                        title="6. Kiểu Ảnh (Tùy chọn)"
                        options={PHOTO_STYLES}
                        selectedOptions={selectedPhotoStyle}
                        setSelectedOptions={setSelectedPhotoStyle}
                        customValue={customPhotoStyle}
                        setCustomValue={setCustomPhotoStyle}
                        placeholder="ví dụ: 'chụp từ trên xuống'"
                    />
                    <OptionGroup
                        title="7. Phụ Kiện (Tùy chọn)"
                        options={ACCESSORIES}
                        selectedOptions={selectedAccessories}
                        setSelectedOptions={setSelectedAccessories}
                        allowMultiple
                        customValue={customAccessories}
                        setCustomValue={setCustomAccessories}
                        placeholder="ví dụ: 'dây chuyền vàng tinh xảo'"
                    />
                    <OptionGroup
                        title="8. Dáng Cầm (Tùy chọn)"
                        options={POSES}
                        selectedOptions={selectedPoses}
                        setSelectedOptions={setSelectedPoses}
                        allowMultiple
                        customValue={customPose}
                        setCustomValue={setCustomPose}
                        placeholder="ví dụ: 'cầm nhẹ nhàng bằng hai tay', 'vắt qua vai'"
                    />
                </div>

                {/* Right Column: Results & Actions */}
                <div className="sticky top-8 self-start flex flex-col gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                        <div className="aspect-square w-full">
                            {isLoading ? (
                                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"></path></svg>
                                </div>
                            ) : generatedImage ? (
                                <div className="relative group h-full w-full">
                                    <img src={generatedImage} alt="Generated Image" className="w-full h-full object-cover rounded-lg" />
                                    <button
                                        onClick={() => handleDownloadImage(generatedImage, 0)}
                                        className="absolute top-2 right-2 bg-black bg-opacity-40 text-white rounded-full p-1.5 hover:bg-opacity-60 transition-opacity opacity-0 group-hover:opacity-100"
                                        aria-label="Download image"
                                    >
                                        <DownloadIcon />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                    <img src="https://picsum.photos/500/500?random=1" alt="Placeholder" className="w-full h-full object-cover rounded-lg opacity-50" />
                                </div>
                            )}
                        </div>

                         {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        
                        <div className="mt-6 flex flex-col gap-3">
                            <button 
                                onClick={handleDownload}
                                className="w-full py-3 px-4 bg-violet-100 text-violet-700 font-semibold rounded-lg hover:bg-violet-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!generatedImage}
                            >
                                Tải Xuống
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerationDisabled}
                                className="w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors disabled:bg-violet-300 disabled:cursor-not-allowed"
                            >
                                <SparklesIcon />
                                {isLoading ? 'Đang tạo...' : 'Tạo Ảnh'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
