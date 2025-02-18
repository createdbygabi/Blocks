import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI();

// Define template structure for each section
const SECTION_TEMPLATES = {
  hero: {
    title: "",
    subtitle: "",
    cta: "",
    secondaryCta: "",
    metrics: [],
    socialProof: {
      rating: 0,
      reviews: 0,
      platform: "",
    },
  },
  features: [
    {
      id: "feature-1",
      title: "",
      description: "",
      iconName: "zap",
      metrics: "",
    },
  ],
  process: {
    title: "",
    subtitle: "",
    steps: [
      {
        number: "01",
        title: "",
        description: "",
        detail: "",
      },
    ],
  },
  testimonials: {
    title: "",
    subtitle: "",
    items: [
      {
        id: "testimonial-1",
        quote: "",
        author: "",
        role: "",
        company: {
          name: "",
          detail: "",
          result: "",
        },
      },
    ],
  },
  pricing: {
    title: "",
    subtitle: "",
    plans: [
      {
        name: "",
        price: "",
        period: "/month",
        perfect: "",
        features: [],
        cta: "",
      },
    ],
  },
  faq: {
    title: "",
    items: [
      {
        question: "",
        answer: "",
      },
    ],
  },
  final: {
    title: "",
    subtitle: "",
    cta: "",
    secondaryCta: "",
    guarantee: "",
  },
};

// Field-specific instructions for each section
const FIELD_INSTRUCTIONS = {
  hero: {
    title: {
      instructions:
        "Create a powerful, concise headline (max 8 words) that starts with an action word. Focus on solving pain points.",
      examples: [
        "Transform Your Business with AI",
        "Build Landing Pages in Minutes",
      ],
    },
    subtitle: {
      instructions:
        "Write a clear, benefit-focused subtitle (10-15 words) that expands on the headline.",
      examples: [
        "AI-powered landing pages that convert visitors into customers in record time",
      ],
    },
    cta: {
      instructions:
        "Create a strong call-to-action (2-4 words) that drives action.",
      examples: ["Start Free Trial", "Get Started Free"],
    },
    metrics: {
      instructions: "Create 2-3 compelling metrics that build trust.",
      examples: ["10,000+ Users", "99.9% Uptime", "$2M+ Generated"],
    },
  },
  features: {
    title: {
      instructions:
        "Write a feature title (3-5 words) that focuses on the benefit.",
      examples: ["AI-Powered Generation", "One-Click Deployment"],
    },
    description: {
      instructions:
        "Create a clear feature description (15-20 words) that explains the benefit and how it works.",
      examples: [
        "Generate complete landing pages in minutes with our AI copywriting and design engine.",
      ],
    },
  },
  process: {
    instructions: "Describe the process of using the product/service",
    fields: {
      title: "Write a process section title (4-6 words)",
      subtitle: "Write a process subtitle (8-12 words)",
      steps: "Create 3-4 clear steps in the process",
    },
  },
  testimonials: {
    instructions:
      "Create authentic-sounding testimonials from satisfied customers",
    fields: {
      title: "Write a testimonials section title (3-5 words)",
      subtitle: "Write a testimonials subtitle (8-12 words)",
      items: "Create 2-3 compelling testimonials with customer details",
    },
  },
  pricing: {
    instructions:
      "Create clear pricing plans with compelling value propositions",
    fields: {
      title: "Write a pricing section title (2-4 words)",
      subtitle: "Write a pricing subtitle (6-10 words)",
      plans: "Create 2-3 pricing plans with features and benefits",
    },
  },
  faq: {
    instructions:
      "Create frequently asked questions that address common concerns",
    fields: {
      title: "Write an FAQ section title (2-4 words)",
      items: "Create 3-4 common questions with clear answers",
    },
  },
  final: {
    instructions: "Create a compelling call to action section",
    fields: {
      title: "Write a final CTA title (5-8 words)",
      subtitle: "Write a final CTA subtitle (10-15 words)",
      cta: "Create a primary call-to-action (2-4 words)",
      secondaryCta: "Create a secondary call-to-action (2-4 words)",
      guarantee: "Write a guarantee statement (5-8 words)",
    },
  },
};

// Helper function to get field instructions
function getFieldInstructions(section, path) {
  const pathParts = path.split(".");
  const fieldName = pathParts[pathParts.length - 1];

  // Get section-specific instructions
  const sectionInstructions = FIELD_INSTRUCTIONS[section] || {};

  // Try to match exact field path
  for (const [key, value] of Object.entries(sectionInstructions)) {
    if (path.endsWith(key)) {
      return value;
    }
  }

  // Default instructions based on field patterns
  if (fieldName.includes("title")) {
    return {
      instructions: "Write a clear, benefit-focused title (5-7 words).",
      examples: ["Transform Your Business with AI"],
    };
  }
  // ... other default patterns

  return {
    instructions:
      "Write clear, benefit-focused copy appropriate for this field.",
    examples: [],
  };
}

// Helper function to get text fields that need generation
function getTextFields(obj, path = "") {
  const fields = [];

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof value === "string") {
      fields.push({ path: currentPath, currentValue: value });
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "string") {
          fields.push({ path: `${currentPath}[${index}]`, currentValue: item });
        } else if (typeof item === "object") {
          fields.push(...getTextFields(item, `${currentPath}[${index}]`));
        }
      });
    } else if (typeof value === "object" && value !== null) {
      fields.push(...getTextFields(value, currentPath));
    }
  }

  return fields;
}

export async function POST(req) {
  try {
    const { businessInfo, brandingResults } = await req.json();

    if (!businessInfo || !brandingResults?.name) {
      return NextResponse.json(
        { error: "Missing required information" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are an expert conversion copywriter who specializes in creating high-converting landing page copy.",
        },
        {
          role: "user",
          content: `Generate a complete landing page for a ${
            businessInfo.niche
          } business named "${brandingResults.name}".

Business Details:
- Main Feature: ${businessInfo.mainFeature}
- Pain Point: ${businessInfo.painPoint}
- Target Audience: ${businessInfo.targetAudience}

Generate persuasive content for each section while:
1. Being clear and benefit-focused
2. Addressing pain points directly
3. Matching the target audience
4. Using persuasive language
5. Maintaining authenticity

For each field below, provide the content using this format:
PATH: [field path]
NEW TEXT: [your generated text]
---

${Object.entries(SECTION_TEMPLATES)
  .map(([section, template]) => {
    const fields = getTextFields(template);
    return fields
      .map((field) => {
        const instructions = getFieldInstructions(section, field.path);
        return `
PATH: ${field.path}
INSTRUCTIONS: ${instructions.instructions}
${
  instructions.examples.length
    ? `EXAMPLES:\n${instructions.examples.join("\n")}`
    : ""
}`;
      })
      .join("\n---\n");
  })
  .join("\n---\n")}`,
        },
      ],
    });

    // Parse the response and update all sections at once
    const generatedText = completion.choices[0].message.content;
    const content = JSON.parse(JSON.stringify(SECTION_TEMPLATES));

    const blocks = generatedText
      .split(/\n*---\n*/)
      .filter((block) => block.trim());
    blocks.forEach((block) => {
      const pathMatch = block.match(/PATH:\s*([^\n]+)/i);
      const textMatch = block.match(/NEW TEXT:\s*([\s\S]+?)(?=\n*PATH:|$)/i);

      if (pathMatch && textMatch) {
        const path = pathMatch[1].trim();
        const newText = textMatch[1].trim();
        setValueAtPath(content, path, newText);
      }
    });

    return NextResponse.json({
      content,
      previewUrl: `/preview/${Date.now()}`,
      thumbnailUrl: `https://placehold.co/1200x630/1a1a1a/ffffff?text=${encodeURIComponent(
        brandingResults.name
      )}`,
    });
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}

// Helper function to set value at path
function setValueAtPath(obj, path, value) {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }

  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;
}
