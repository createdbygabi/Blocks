import React from "react";

const PatternSection = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

const Pattern = ({ pattern, posts, template }) => (
  <div className="mb-6 last:mb-0">
    <div className="font-medium text-blue-600 mb-2">{pattern}</div>
    <div className="space-y-2 ml-4 mb-3">
      {posts.map((post, index) => (
        <div key={index} className="text-sm text-gray-600">
          • {post}
        </div>
      ))}
    </div>
    {template && (
      <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
        Template: "{template}"
      </div>
    )}
  </div>
);

const PatternAnalysis = ({ analysis }) => {
  console.log("PatternAnalysis - Received analysis:", analysis);

  if (!analysis) {
    console.log("PatternAnalysis - No analysis data provided");
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-purple-400">
          Analysis Results
        </h3>
        <div className="prose prose-invert max-w-none whitespace-pre-wrap">
          {analysis}
        </div>
      </div>
    </div>
  );
};

export default PatternAnalysis;
