// app/dashboard/leetcode/page.tsx
'use client'

import LeetCodeData from "@/frontend/leetcodedata";

export default function LeetCodePage() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">LeetCode Progress</h3>
      <LeetCodeData />
    </div>
  );
}