'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    const ALLOWED_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, DOC, DOCX, JPEG, or PNG');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Document uploaded successfully');
        setFile(null);
      } else {
        toast.error(result.error || 'Document upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center  bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Upload Your Document</h2>
        <div className="mb-4">
          <label 
            htmlFor="file-upload" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Document
          </label>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
        </div>

        {file && (
          <div className="bg-gray-50 border border-gray-300 rounded-md p-4 mb-4">
            <p className="text-sm text-gray-800 font-medium">
              <span className="font-semibold">Selected file:</span> {file.name}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Size:</span> {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file}
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            uploading || !file
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {uploading ? (
            <span className="flex justify-center items-center gap-2">
              <AiOutlineLoading3Quarters className="animate-spin" />
              Uploading...
            </span>
          ) : (
            'Upload Document'
          )}
        </button>
      </form>
    </div>
  );
}
