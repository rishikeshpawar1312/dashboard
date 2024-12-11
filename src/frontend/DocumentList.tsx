'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { 
  Download, 
  Trash2, 
  FileText, 
  Star, 
  FileImage, 
  FileArchive, 
  File,
  Eye 
} from 'lucide-react';

interface Document {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
  fileType: string;
  fileSize: number;
}

// Modal component for previewing documents
const DocumentPreviewModal = ({ 
  document, 
  onClose 
}: { 
  document: Document | null, 
  onClose: () => void 
}) => {
  if (!document) return null;

  const renderPreview = () => {
    const fileType = document.fileType.toLowerCase();

    // PDF Preview with multiple fallback options
    if (fileType === 'pdf') {
      return (
        <div className="w-full h-[70vh] flex flex-col">
          {/* Google Docs Viewer for PDFs */}
          <iframe 
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`}
            width="100%" 
            height="600" 
            style={{ border: 'none' }}
            title={`Preview of ${document.filename}`}
          />
          <div className="p-4 bg-gray-100 text-center">
            <a 
              href={document.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
            >
              Open PDF in New Tab
            </a>
          </div>
        </div>
      );
    }

    // DOC/DOCX Preview with multiple fallback options
    if (fileType === 'doc' || fileType === 'docx') {
      return (
        <div className="w-full h-[70vh] flex flex-col">
          {/* Google Docs Viewer for DOC files */}
          <iframe 
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`}
            width="100%" 
            height="600" 
            style={{ border: 'none' }}
            title={`Preview of ${document.filename}`}
          />
          <div className="p-4 bg-gray-100 text-center">
            <a 
              href={document.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
            >
              Open Document in New Tab
            </a>
          </div>
        </div>
      );
    }

    // Images
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(fileType)) {
      return (
        <img 
          src={document.url} 
          alt={document.filename} 
          className="max-w-full max-h-[70vh] mx-auto object-contain" 
        />
      );
    }

    // Text files
    if (['txt', 'csv', 'json', 'xml', 'md'].includes(fileType)) {
      return (
        <div className="p-4 bg-gray-100 rounded-lg max-h-[70vh] overflow-auto">
          <iframe 
            src={document.url} 
            width="100%" 
            height="500px" 
            title={document.filename}
            className="border-none"
          />
        </div>
      );
    }

    // For unsupported file types
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">
          Preview not available for this file type. 
          <br />
          <a 
            href={document.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline"
          >
            Open file directly
          </a>
        </p>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{document.filename}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-auto">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default function EnhancedDocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data.documents);
      setLoading(false);
    } catch (err) {
      setError('Failed to load documents');
      setLoading(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success(`Downloading ${filename}`);
  };

  const handleDelete = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(documents.filter((doc) => doc.id !== documentId));
        toast.success('Document deleted successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete document');
      }
    } catch (err) {
      toast.error('An error occurred while deleting the document');
    }
  };

  // Return loading state
  if (loading) return (
    <div className="flex justify-center items-center h-64 animate-pulse">
      <div className="bg-gray-300 h-12 w-12 rounded-full"></div>
    </div>
  );

  // Return error state
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      {error}
    </div>
  );

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-3xl font-extrabold text-gray-800">My Documents</h2>
            <div className="text-gray-500">{documents.length} total</div>
          </div>
          
          {documents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-24 w-24 mx-auto text-gray-300"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <p className="mt-4 text-xl text-gray-500">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-4 text-left">Filename</th>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Size</th>
                    <th className="py-3 px-4 text-left">Uploaded At</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {documents.map((doc) => (
                    <tr 
                      key={doc.id} 
                      className="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <td className="py-3 px-4 flex items-center">
                        <div className="mr-3">
                          {getFileIcon(doc.fileType)}
                        </div>
                        <span className="font-medium">{doc.filename}</span>
                      </td>
                      <td className="py-3 px-4 uppercase">{doc.fileType}</td>
                      <td className="py-3 px-4">
                        {(doc.fileSize / 1024).toFixed(2)} KB
                      </td>
                      <td className="py-3 px-4">
                        {format(new Date(doc.uploadedAt), 'PPpp')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => setPreviewDocument(doc)}
                            className="text-green-500 hover:text-green-700 transition-transform transform hover:scale-125"
                            title="Preview"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.url, doc.filename)}
                            className="text-blue-500 hover:text-blue-700 transition-transform transform hover:scale-125"
                            title="Download"
                          >
                            <Download size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-500 hover:text-red-700 transition-transform transform hover:scale-125"
                            title="Delete"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal 
          document={previewDocument} 
          onClose={() => setPreviewDocument(null)} 
        />
      )}
    </>
  );
}

// Updated file icon logic to include DOC files
const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return <Star className="text-red-500" />;
    case 'txt':
      return <FileText className="text-blue-500" />;
    case 'doc':
    case 'docx':
      return <FileText className="text-blue-700" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return <FileImage className="text-green-500" />;
    case 'zip':
    case 'rar':
      return <FileArchive className="text-purple-500" />;
    default:
      return <File className="text-gray-500" />;
  }
};