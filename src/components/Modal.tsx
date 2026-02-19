import React from "react";

export type ModalProps = {
    children: React.ReactNode;
    onClose: () => void;
};

export function Modal({ children, onClose }: ModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* semi-transparent background that closes modal when clicked */}
            <div
                className="absolute inset-0 bg-transparent bg-opacity-40 backdrop-blur-lg"
                onClick={onClose}
            />

            {/* modal container */}
            <div className="relative bg-orange-100 rounded-lg shadow-lg max-w-4xl w-full mx-4 p-6 overflow-auto">
                {/* close button in corner */}
                <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition cursor-pointer"
                    onClick={onClose}
                >
                    ❌
                </button>

                {children}
            </div>
        </div>
    );
}
