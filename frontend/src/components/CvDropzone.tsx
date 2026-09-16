import { useState, useRef } from "react";

interface CvDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFileName?: string;
  isDark: boolean;
  labelText: string;
}

export function CvDropzone({ onFileSelect, selectedFileName, isDark, labelText }: CvDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    } else {
      alert("Molimo priložite PDF fajl");
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleClick() {
    inputRef.current?.click();
  }

  const dropzoneClass = isDragging
    ? isDark
      ? "bg-green-400/10 rounded-2xl p-8 text-center cursor-pointer transition-all"
      : "bg-purple-100 rounded-2xl p-8 text-center cursor-pointer transition-all"
    : isDark
      ? "bg-gray-800/50 rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-800 transition-all"
      : "bg-gray-50 rounded-2xl p-8 text-center cursor-pointer hover:bg-purple-50 transition-all";

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={dropzoneClass}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
        style={{ display: "none" }}
      />
      <svg
        className={isDark ? "w-8 h-8 mx-auto mb-2 text-gray-500" : "w-8 h-8 mx-auto mb-2 text-gray-400"}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p className={isDark ? "text-gray-300 text-sm font-medium" : "text-gray-600 text-sm font-medium"}>
        {selectedFileName ? `Izabrano: ${selectedFileName}` : labelText}
      </p>
      <p className={isDark ? "text-gray-500 text-xs mt-1" : "text-gray-400 text-xs mt-1"}>
        Prevucite fajl ovde ili kliknite da izaberete
      </p>
    </div>
  );
}