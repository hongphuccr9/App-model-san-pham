
import React, { useRef, useState, useEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { CloseIcon } from './icons/CloseIcon';

interface FileUploadProps {
    title: string;
    required?: boolean;
    image: File | null;
    setImage: (file: File | null) => void;
    isLarge?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ title, required = false, image, setImage, isLarge = false }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (image) {
            const objectUrl = URL.createObjectURL(image);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [image]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImage(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-gray-800">
                {title} {required && <span className="text-red-500">*</span>}
            </h2>
            <div
                onClick={() => inputRef.current?.click()}
                className={`relative cursor-pointer bg-white rounded-xl border-2 border-dashed border-gray-300 transition-all hover:border-violet-400 group
                    ${isLarge ? 'p-6 h-48' : 'aspect-square'}
                    ${previewUrl ? 'border-solid' : ''}`}
            >
                <input
                    type="file"
                    ref={inputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                {previewUrl ? (
                    <>
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        <button
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 hover:bg-opacity-75 transition-colors"
                            aria-label="Remove image"
                        >
                            <CloseIcon />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <UploadIcon />
                        <p className="mt-2 text-sm text-center">Nhấn để tải lên</p>
                    </div>
                )}
            </div>
        </div>
    );
};
   