"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  FiX,
  FiCheck,
  FiSettings,
  FiLayout,
  FiDroplet,
  FiType,
  FiDownload,
  FiUploadCloud,
} from "react-icons/fi";
import { landingThemes, designPresets, fontPresets } from "@/lib/themes";
import { exportPage, EXPORT_FORMATS } from "@/lib/exportManager";
import { useUser } from "@/hooks/useUser";

export function ThemeSwitcher({
  currentTheme,
  onThemeChange,
  currentDesign,
  onDesignChange,
  currentFont,
  onFontChange,
  onExport,
  isExporting,
  pageContent,
  onSave,
  isSaving,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("theme"); // "theme", "design", or "font"
  const [deploymentStatus, setDeploymentStatus] = useState({
    status: "idle",
    url: null,
    error: null,
  });
  const { user } = useUser();

  const handleThemeChange = (theme) => {
    onThemeChange(theme);
  };

  const handleDesignChange = (design) => {
    onDesignChange(design);
  };

  const handleFontChange = (font) => {
    onFontChange(font);
  };

  const handleExportAndDeploy = async () => {
    try {
      setDeploymentStatus({ status: "exporting", url: null, error: null });

      if (!user?.id) {
        throw new Error("No user authenticated");
      }

      console.log("[ThemeSwitcher] User ID:", user.id);

      // Export the project
      const config = {
        userId: user.id,
        theme: currentTheme,
        design: currentDesign,
        font: currentFont,
        content: {
          hero: {
            title: "Create Landing Pages That Convert",
            subtitle:
              "AI-powered landing page builder that helps you achieve 3x higher conversion rates",
            cta: "Start Free Trial",
            secondaryCta: "See Examples",
            metrics: [
              { value: "3,721+", label: "Pages Created" },
              { value: "89%", label: "Conversion Rate" },
              { value: "12min", label: "Avg. Build Time" },
            ],
            socialProof: {
              rating: 4.9,
              reviews: 847,
              platform: "Rated 4.9/5 on G2 Crowd",
            },
          },
          features: [
            {
              title: "Write Once, Convert Forever",
              description:
                "Our AI learns from your best-performing copy and continuously optimizes it. No more guesswork, just data-driven results.",
              metrics: "83% better engagement",
              detail: "Trained on 1M+ successful landing pages",
            },
            {
              title: "Real-Time Optimization",
              description:
                "Watch your page evolve as visitors interact. Our smart analytics suggest improvements that actually make sense.",
              metrics: "2.4x conversion lift",
              detail: "Based on live user behavior",
            },
            {
              title: "Lightning-Fast Publishing",
              description:
                "Deploy changes instantly to any platform. Built-in CDN ensures your pages load blazingly fast, everywhere.",
              metrics: "0.8s average load time",
              detail: "99.9% uptime guaranteed",
            },
          ],
          meta: {
            title: "Landing Page Builder - Create High-Converting Pages",
            description:
              "Create beautiful, high-converting landing pages in minutes with our AI-powered builder.",
          },
        },
      };

      const { blob, filename } = await exportPage(
        config,
        EXPORT_FORMATS.NEXT_PROJECT
      );

      setDeploymentStatus({ status: "deploying", url: null, error: null });

      // Deploy using the API route
      const projectName = `blocks-landing-${Date.now()}`;
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config,
          projectName,
        }),
      });

      const deployResult = await response.json();

      if (deployResult.success) {
        setDeploymentStatus({
          status: "success",
          url: deployResult.url,
          error: null,
        });
      } else {
        setDeploymentStatus({
          status: "error",
          url: null,
          error: deployResult.error,
        });
      }
    } catch (error) {
      console.error("Export and deploy failed:", error);
      setDeploymentStatus({ status: "error", url: null, error: error.message });
    }
  };

  return (
    <>
      {/* Theme Switcher Button */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-50 p-3 bg-black/80 hover:bg-black text-white rounded-full backdrop-blur-sm transition-all group border border-white/10 shadow-lg"
      >
        <FiSettings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
      </motion.button>

      {/* Theme Sidebar */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed right-0 top-0 h-screen w-96 bg-black/90 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">Page Settings</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <FiX className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Main Menu */}
        <div className="p-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab("theme")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              activeTab === "theme"
                ? "bg-white/20 text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FiDroplet className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Theme</span>
              <span className="text-xs opacity-60">
                Colors and visual style
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("design")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              activeTab === "design"
                ? "bg-white/20 text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FiLayout className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Design</span>
              <span className="text-xs opacity-60">Layout and spacing</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("font")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              activeTab === "font"
                ? "bg-white/20 text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <FiType className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Typography</span>
              <span className="text-xs opacity-60">Fonts and text styles</span>
            </div>
          </button>
        </div>

        {/* Options Container */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2 custom-scrollbar">
          {activeTab === "theme" ? (
            // Theme Options
            <>
              <div className="text-sm font-medium text-white/60 px-2 mb-2">
                Select Theme
              </div>
              {landingThemes.map((theme) => (
                <motion.button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${
                    currentTheme.id === theme.id
                      ? "bg-white/20 text-white"
                      : "hover:bg-white/10 text-white/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${theme.colors.section.primary}`}
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{theme.name}</span>
                      <span className="text-xs text-white/60">
                        {theme.audience}
                      </span>
                    </div>
                  </div>
                  {currentTheme.id === theme.id && (
                    <FiCheck className="w-4 h-4 text-green-400" />
                  )}
                </motion.button>
              ))}
            </>
          ) : activeTab === "design" ? (
            // Design Options
            <>
              <div className="text-sm font-medium text-white/60 px-2 mb-2">
                Select Design Style
              </div>
              {designPresets.map((design) => (
                <motion.button
                  key={design.id}
                  onClick={() => handleDesignChange(design)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${
                    currentDesign?.id === design.id
                      ? "bg-white/20 text-white"
                      : "hover:bg-white/10 text-white/80"
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{design.name}</span>
                    <span className="text-xs text-white/60">
                      {design.description}
                    </span>
                  </div>
                  {currentDesign?.id === design.id && (
                    <FiCheck className="w-4 h-4 text-green-400" />
                  )}
                </motion.button>
              ))}
            </>
          ) : (
            // Font Options
            <>
              <div className="text-sm font-medium text-white/60 px-2 mb-2">
                Select Typography
              </div>
              {fontPresets.map((font) => (
                <motion.button
                  key={font.id}
                  onClick={() => handleFontChange(font)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${
                    currentFont?.id === font.id
                      ? "bg-white/20 text-white"
                      : "hover:bg-white/10 text-white/80"
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span
                      className={`text-sm font-medium ${font.styles.heading}`}
                    >
                      {font.name}
                    </span>
                    <span
                      className={`text-xs text-white/60 ${font.styles.body}`}
                    >
                      {font.description}
                    </span>
                  </div>
                  {currentFont?.id === font.id && (
                    <FiCheck className="w-4 h-4 text-green-400" />
                  )}
                </motion.button>
              ))}
            </>
          )}
        </div>

        {/* Export & Deploy Button */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {/* Save Changes Button */}
          <button
            onClick={onSave}
            disabled={isSaving}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-white text-black hover:bg-gray-100 transition-colors ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <FiCheck className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>

          {/* Export & Deploy Button */}
          <button
            onClick={handleExportAndDeploy}
            disabled={
              deploymentStatus.status === "exporting" ||
              deploymentStatus.status === "deploying"
            }
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors ${
              deploymentStatus.status === "exporting" ||
              deploymentStatus.status === "deploying"
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {deploymentStatus.status === "idle" && (
              <>
                <FiUploadCloud className="w-5 h-5" />
                Export & Deploy
              </>
            )}
            {deploymentStatus.status === "exporting" && "Exporting..."}
            {deploymentStatus.status === "deploying" && "Deploying..."}
            {deploymentStatus.status === "success" && (
              <>
                <FiCheck className="w-5 h-5" />
                Deployed Successfully
              </>
            )}
            {deploymentStatus.status === "error" && (
              <>
                <FiX className="w-5 h-5" />
                Deployment Failed
              </>
            )}
          </button>

          {deploymentStatus.status === "success" && (
            <a
              href={deploymentStatus.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1"
            >
              <FiUploadCloud className="w-4 h-4" />
              View Deployment
            </a>
          )}

          {deploymentStatus.status === "error" && (
            <p className="mt-2 text-sm text-red-400 text-center">
              {deploymentStatus.error}
            </p>
          )}
        </div>
      </motion.div>

      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
}
