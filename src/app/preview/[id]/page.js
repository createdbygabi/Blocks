"use client";

import { useEffect, useState } from "react";
import { getUserLandingPage } from "@/lib/db";
import { defaultContent, LandingPage } from "@/app/landing/page";

export default function PreviewPage({ params }) {
  const [pageData, setPageData] = useState({ content: defaultContent });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const data = await getUserLandingPage(params.id);
        if (data) {
          setPageData(data);
        }
      } catch (error) {
        console.error("Failed to load preview:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPage();
  }, [params.id]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <LandingPage
      content={pageData.content}
      theme={pageData.theme}
      design={pageData.design}
      font={pageData.font}
      preview={true}
    />
  );
}
