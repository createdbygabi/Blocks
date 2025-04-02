"use client";

import { useEffect, useState } from "react";

export default function HeroScoringClient({ subdomain }) {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Here you would typically fetch data based on the subdomain
    // For now, we'll just simulate a loading state
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setScore({
          overall: 85,
          metrics: {
            engagement: 90,
            conversion: 80,
            retention: 85,
          },
        });
      } catch (error) {
        console.error("Error fetching hero scoring data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subdomain]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl">
          Loading hero scoring data for {subdomain}...
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Hero Scoring Dashboard for {subdomain}
          </h1>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Overall Score
            </h2>
            <div className="text-5xl font-bold text-blue-600">
              {score.overall}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Engagement
              </h3>
              <div className="text-3xl font-bold text-green-600">
                {score.metrics.engagement}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Conversion
              </h3>
              <div className="text-3xl font-bold text-purple-600">
                {score.metrics.conversion}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Retention
              </h3>
              <div className="text-3xl font-bold text-orange-600">
                {score.metrics.retention}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
