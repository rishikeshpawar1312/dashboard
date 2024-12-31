// app/dashboard/documents/page.tsx
'use client'

import DocumentList from "@/frontend/DocumentList";
import DocumentUpload from "@/frontend/DocumentUpload";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
        <DocumentUpload />
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Your Documents</h3>
        <DocumentList />
      </div>
    </div>
  );
}