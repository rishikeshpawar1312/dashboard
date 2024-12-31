// app/dashboard/github/page.tsx
'use client'

import GitHubIntegration from "@/frontend/GitHubIntegration";

export default function GitHubPage() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">GitHub Activity</h3>
      <GitHubIntegration />
    </div>
  );
}