
import React from 'react';

interface OptionGroupProps {
    title: string;
    options: string[];
    selectedOptions: string[];
    setSelectedOptions: (options: string[]) => void;
    allowMultiple?: boolean;
    customValue?: string;
    setCustomValue?: (value: string) => void;
    placeholder?: string;
}

export const OptionGroup: React.FC<OptionGroupProps> = ({
    title,
    options,
    selectedOptions,
    setSelectedOptions,
    allowMultiple = false,
    customValue,
    setCustomValue,
    placeholder
}) => {

    const handleSelect = (option: string) => {
        if (allowMultiple) {
            const newSelection = selectedOptions.includes(option)
                ? selectedOptions.filter(item => item !== option)
                : [...selectedOptions, option];
            setSelectedOptions(newSelection);
        } else {
            setSelectedOptions([option]);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col gap-3">
            <h2 className="font-semibold text-gray-800">{title}</h2>
            <div className="flex flex-wrap gap-2">
                {options.map(option => {
                    const isSelected = selectedOptions.includes(option);
                    return (
                        <button
                            key={option}
                            onClick={() => handleSelect(option)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border
                                ${isSelected
                                    ? 'bg-violet-600 text-white border-violet-600'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
            {setCustomValue !== undefined && (
                 <input
                    type="text"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
                />
            )}
        </div>
    );
};
   