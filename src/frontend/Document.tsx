import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function DocumentUploadComponent() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle file selection with validation
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB max size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 10MB.');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Allowed types: PDF, JPEG, PNG, DOCX.');
      return;
    }

    setSelectedFile(file);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first.');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      // Check response status
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed.');
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Document uploaded successfully.');
        setSelectedFile(null); // Reset the file input
        // Optionally, refresh the document list here
      } else {
        toast.error(result.error || 'Upload failed.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An error occurred during the upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
      <ToastContainer />
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileSelect}
          className="w-full p-2 border rounded"
          disabled={isUploading}
        />
      </div>
      {selectedFile && (
        <div className="mb-4">
          <p>Selected File: <strong>{selectedFile.name}</strong></p>
          <p>Size: <strong>{(selectedFile.size / 1024).toFixed(2)} KB</strong></p>
        </div>
      )}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isUploading ? 'Uploading...' : 'Upload Document'}
      </button>
    </div>
  );
}

export default DocumentUploadComponent;
