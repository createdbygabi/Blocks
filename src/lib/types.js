// Landing page configuration types
export const PAGE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

export const SECTION_TYPES = {
  HERO: "hero",
  FEATURES: "features",
  TESTIMONIALS: "testimonials",
  PRICING: "pricing",
  FAQ: "faq",
  CTA: "cta",
};

// Main landing page type
export const DEFAULT_PAGE = {
  id: null,
  name: "Untitled Page",
  slug: "",
  status: PAGE_STATUS.DRAFT,
  theme: null,
  design: null,
  font: null,
  content: null,
  created_at: null,
  updated_at: null,
  user_id: null,
};

// Default landing page structure
export const DEFAULT_LANDING_PAGE = {
  content: null, // Will be populated with defaultContent if no data exists
  theme: null, // Will be populated with default theme if no data exists
  design: null, // Will be populated with default design if no data exists
  font: null, // Will be populated with default font if no data exists
  updated_at: new Date().toISOString(),
};
