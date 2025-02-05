"use client";

import { useState, useEffect } from "react";
import { Input, TextArea, Button, Card } from "./components/ui/FormElements";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { getUserBusiness, saveBusiness } from "@/lib/db";
import Toast from "./components/Toast";

export default function AppSettings() {
  const { user } = useUser();
  const [settings, setSettings] = useState({
    niche: "",
    product: "",
    mainFeature: "",
    painPoint: "",
    audience: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Load settings when component mounts
  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const business = await getUserBusiness(user.id);
      if (business) {
        setSettings({
          niche: business.niche || "",
          product: business.product || "",
          mainFeature: business.main_feature || "",
          painPoint: business.pain_point || "",
          audience: business.target_audience || "",
        });
      }
    } catch (error) {
      console.error("Error loading business settings:", error);
      setMessage({ type: "error", text: "Failed to load business settings" });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!settings.niche.trim()) {
      setMessage({ type: "error", text: "Business niche is required" });
      return;
    }

    setIsSaving(true);
    try {
      await saveBusiness(user.id, {
        niche: settings.niche,
        product: settings.product,
        main_feature: settings.mainFeature,
        pain_point: settings.painPoint,
        target_audience: settings.audience,
      });

      setMessage({
        type: "success",
        text: "Business settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving business settings:", error);
      setMessage({ type: "error", text: "Failed to save business settings" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl"
    >
      <Toast
        message={message.text}
        type={message.type}
        onClose={() => setMessage({ type: "", text: "" })}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1.5">Business Settings</h1>
        <p className="text-sm text-gray-400">
          Configure your business fundamentals
        </p>
      </motion.div>

      <Card>
        <div className="space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-[2px] bg-white/20" />
              <h2 className="text-xl font-semibold text-white">
                Business Configuration
              </h2>
            </div>
            <div className="grid gap-8">
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Business Niche"
                  value={settings.niche}
                  onChange={(e) =>
                    setSettings({ ...settings, niche: e.target.value })
                  }
                  placeholder="Your business niche"
                  required
                />
                <Input
                  label="Product"
                  value={settings.product}
                  onChange={(e) =>
                    setSettings({ ...settings, product: e.target.value })
                  }
                  placeholder="Your main product or service"
                />
              </div>
              <Input
                label="Main Feature"
                value={settings.mainFeature}
                onChange={(e) =>
                  setSettings({ ...settings, mainFeature: e.target.value })
                }
                placeholder="Your product's key feature"
              />
              <TextArea
                label="Pain Point"
                value={settings.painPoint}
                onChange={(e) =>
                  setSettings({ ...settings, painPoint: e.target.value })
                }
                placeholder="What problem does your product solve?"
              />
              <TextArea
                label="Target Audience"
                value={settings.audience}
                onChange={(e) =>
                  setSettings({ ...settings, audience: e.target.value })
                }
                placeholder="Describe your ideal customer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              variant="secondary"
              onClick={() => loadSettings()}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
