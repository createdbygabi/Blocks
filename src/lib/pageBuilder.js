import { supabase } from "./supabase";

// Available section types
export const SECTION_TYPES = {
  HERO: "hero",
  FEATURES: "features",
  TESTIMONIALS: "testimonials",
  PRICING: "pricing",
  CTA: "cta",
  FAQ: "faq",
};

// Default empty page structure
export const createEmptyPage = () => ({
  meta: {
    title: "Untitled Page",
    description: "",
    favicon: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  sections: [],
  styles: {
    theme: null,
    design: null,
    typography: null,
  },
});

// Section templates
export const sectionTemplates = {
  [SECTION_TYPES.HERO]: {
    type: SECTION_TYPES.HERO,
    content: {
      title: "Welcome to our platform",
      subtitle: "The best solution for your needs",
      cta: "Get Started",
      secondaryCta: "Learn More",
    },
    settings: {
      layout: "centered", // centered, split, minimal
      showImage: true,
      imagePosition: "right", // right, left, background
    },
  },
  [SECTION_TYPES.FEATURES]: {
    type: SECTION_TYPES.FEATURES,
    content: {
      title: "Features",
      subtitle: "What we offer",
      features: [
        {
          title: "Feature 1",
          description: "Description here",
          icon: "FiZap",
        },
      ],
    },
    settings: {
      columns: 3,
      showIcons: true,
      style: "cards", // cards, minimal, grid
    },
  },
  // Add more section templates as needed
};

// Database operations
export const pageBuilder = {
  // Save page to database
  async savePage(pageData) {
    const { data, error } = await supabase.from("pages").upsert({
      content: pageData,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    return data;
  },

  // Load page from database
  async loadPage(pageId) {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("id", pageId)
      .single();

    if (error) throw error;
    return data?.content || createEmptyPage();
  },

  // Add section to page
  addSection(page, sectionType) {
    const template = sectionTemplates[sectionType];
    if (!template) throw new Error(`Invalid section type: ${sectionType}`);

    return {
      ...page,
      sections: [...page.sections, { ...template, id: Date.now() }],
    };
  },

  // Update section content
  updateSection(page, sectionId, updates) {
    return {
      ...page,
      sections: page.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    };
  },

  // Update page styles
  updateStyles(page, styles) {
    return {
      ...page,
      styles: { ...page.styles, ...styles },
    };
  },

  // Generate export data
  async generateExport(page) {
    return {
      meta: page.meta,
      sections: page.sections,
      styles: page.styles,
      timestamp: new Date().toISOString(),
    };
  },
};
