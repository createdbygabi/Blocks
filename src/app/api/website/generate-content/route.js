import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI();

// Define template structure for each section
const SECTION_TEMPLATES = {
  hero: {
    badge: "",
    title: "",
    subtitle: "",
    cta: "Try it for free",
    hero_image: null, // Optional, if provided will use two-column layout
    socialProof: {
      userType: "small businesses",
    },
  },
  features: [
    {
      id: "feature-1",
      title: "",
      description: "",
      iconName: "zap", // One of: zap, clock, box, layers, activity, trending-up
    },
  ],
  pricing: {
    title: "Simple pricing for everyone",
    subtitle: "Choose the perfect plan for your needs",
    plans: [
      {
        name: "Basic",
        price: "$9",
        period: "/month",
        perfect: "For solo creators",
        features: [
          "3 social accounts",
          "10 posts/month",
          "Basic analytics",
          "Standard support",
        ],
        cta: "Get Started",
        highlight: false,
      },
      // Middle plan comes from database/API
      {
        name: "Enterprise",
        price: "$99",
        period: "/month",
        perfect: "For large teams",
        features: [
          "Unlimited accounts",
          "Unlimited posts",
          "Advanced analytics",
          "Priority support",
          "Custom features",
          "API access",
        ],
        cta: "Contact Sales",
        highlight: false,
      },
    ],
  },
  faq: {
    title: "Common questions",
    items: [
      {
        question: "What social platforms do you support?",
        answer:
          "We support all major platforms including Twitter/X, Instagram, LinkedIn, Facebook, TikTok, and more.",
      },
      {
        question: "How many social accounts can I connect?",
        answer:
          "The number of accounts depends on your plan - from 3 accounts on Basic to unlimited on Enterprise.",
      },
      {
        question: "Can I schedule posts in advance?",
        answer:
          "Yes! You can schedule your content to be posted at optimal times across all your connected platforms.",
      },
      {
        question: "Is there a free trial?",
        answer:
          "Yes, you can try all features free for 14 days, no credit card required.",
      },
    ],
  },
  final: {
    title: "Start posting everywhere in seconds",
    subtitle: "Stop wasting time posting manually. Try it free for 14 days.",
    cta: "Get started free",
  },
  painPoints: {
    title: "Posting content shouldn't be this hard",
    subtitle: "Other solutions and tools...",
    items: [
      {
        title: "",
        description: "",
        iconName: "clock",
      },
      {
        title: "",
        description: "",
        iconName: "box",
      },
      {
        title: "",
        description: "",
        iconName: "layers",
      },
      {
        title: "",
        description: "",
        iconName: "activity",
      },
    ],
  },
  growth: {
    title: "Grow your social reach with less effort for less money",
    subtitle: "Using post bridge features...",
    features: [
      {
        title: "Cross-posting",
        description:
          "Upload your content to post bridge and post it to any of your connected social media accounts; including posting to all platforms at the same time.",
        iconName: "zap",
      },
      {
        title: "Scheduling",
        description:
          "Plan and schedule your content for optimal posting times across all platforms.",
        iconName: "clock",
      },
      {
        title: "Content management",
        description:
          "Organize and manage all your content in one central location.",
        iconName: "layers",
      },
      {
        title: "Content Studio",
        description: "Create and edit content directly within the platform.",
        iconName: "box",
      },
    ],
    stats: {
      title: "Watch views grow",
      value: "6,932,049",
      label: "Potential views",
      cta: "Start Growing Now",
    },
  },
  howItWorks: {
    title: "How it works",
    subtitle: "Post everywhere in 3 simple steps",
    steps: [
      {
        title: "Connect your accounts",
        description: "Link your social media accounts in just a few clicks",
        iconName: "zap",
      },
      {
        title: "Upload your content",
        description: "Add your post, image, or video once",
        iconName: "upload",
      },
      {
        title: "Post everywhere",
        description: "Click once to share on all platforms instantly",
        iconName: "trending-up",
      },
    ],
  },
};

// Field-specific instructions for each section
const FIELD_INSTRUCTIONS = {
  hero: {
    badge: {
      instructions:
        "Create a short, attention-grabbing badge text with emoji (4-6 words)",
      examples: [
        "✨ AI-Powered Scheduling in Seconds →",
        "🚀 New: Post Everywhere at Once",
      ],
    },
    title: {
      instructions:
        "Create a powerful, action-focused headline that emphasizes the pain point and the value proposition, trigger emotional reaction to the user, action-oriented (max 8 words)",
      examples: [
        "Schedule your content everywhere in seconds",
        "Post once, reach all platforms instantly",
      ],
    },
    subtitle: {
      instructions:
        "Write a clear subtitle explaining the main benefit clearly (10-15 words)",
      examples: [
        "The simplest way to post and grow on all platforms. Built for creators and small teams.",
      ],
    },
  },
  painPoints: {
    title: {
      instructions:
        "Create a compelling title that resonates with user frustrations (8-12 words)",
      examples: [
        "Posting content shouldn't be this hard",
        "Stop wasting time with manual social posting",
      ],
    },
    subtitle: {
      instructions:
        "Write a subtitle that acknowledges the current pain points (15-20 words)",
      examples: [
        "Other solutions and tools are expensive, complex, and time-consuming. There's a better way to manage your content.",
      ],
    },
    items: [
      {
        title: {
          instructions: "Write a short, relatable pain point title (2-4 words)",
          examples: [
            "Manually posting",
            "Unfairly expensive",
            "Complex tools",
            "Features you don't need",
          ],
        },
        description: {
          instructions:
            "Describe the pain point in a relatable, sometimes humorous way (10-15 words)",
          examples: [
            "Hours of time you can't get back - spent posting your content 1 by 1",
            "You're not an enterprise company, so why are you paying like one?",
            "The learning curve is steeper than a UFO's flight path. Houston, we have a problem!",
          ],
        },
        iconName: {
          instructions: "Choose an icon that represents the pain point",
          examples: ["clock", "box", "layers", "activity"],
        },
      },
    ],
  },
  pricing: {
    title: {
      instructions:
        "Write a clear pricing section title emphasizing simplicity (3-5 words)",
      examples: [
        "Simple pricing for everyone",
        "Transparent, flexible pricing",
      ],
    },
    subtitle: {
      instructions: "Write a brief subtitle about choosing plans (5-8 words)",
      examples: [
        "Choose the perfect plan for your needs",
        "Find the right plan for you",
      ],
    },
    plans: {
      basic: {
        name: {
          instructions: "Name for the entry-level plan",
          examples: ["Basic", "Starter"],
        },
        price: {
          instructions: "Set an attractive entry price point ($9-$15)",
          examples: ["$9", "$12"],
        },
        perfect: {
          instructions: "Describe ideal user for basic plan (2-4 words)",
          examples: ["For solo creators", "For getting started"],
        },
        features: {
          instructions:
            "List 4-5 basic features, starting with number of accounts and posts",
          examples: [
            [
              "3 social accounts",
              "10 posts/month",
              "Basic analytics",
              "Standard support",
            ],
          ],
        },
        cta: {
          instructions: "Write action-oriented button text (2-3 words)",
          examples: ["Get Started", "Try Basic"],
        },
      },
      enterprise: {
        name: {
          instructions: "Name for the enterprise-level plan",
          examples: ["Enterprise", "Business"],
        },
        price: {
          instructions: "Set premium price point ($89-$199)",
          examples: ["$99", "$149"],
        },
        perfect: {
          instructions: "Describe ideal user for enterprise plan (2-4 words)",
          examples: ["For large teams", "For growing companies"],
        },
        features: {
          instructions:
            "List 6-7 premium features, emphasizing unlimited usage and exclusive features",
          examples: [
            [
              "Unlimited accounts",
              "Unlimited posts",
              "Advanced analytics",
              "Priority support",
              "Custom features",
              "API access",
            ],
          ],
        },
        cta: {
          instructions: "Write enterprise-focused button text (2-3 words)",
          examples: ["Contact Sales", "Get Enterprise"],
        },
      },
    },
  },
  faq: {
    title: {
      instructions: "Write a simple FAQ section title (2-3 words)",
      examples: ["Common questions", "Quick answers"],
    },
    items: {
      instructions:
        "Create 3-5 essential questions focused on the core cross-posting feature, pricing, and getting started",
      examples: [
        {
          question: "What social platforms do you support?",
          answer:
            "We support all major platforms including Twitter/X, Instagram, LinkedIn, Facebook, TikTok, and more.",
        },
        {
          question: "How many social accounts can I connect?",
          answer:
            "The number of accounts depends on your plan - from 3 accounts on Basic to unlimited on Enterprise.",
        },
        {
          question: "Is there a free trial?",
          answer:
            "Yes, you can try all features free for 14 days, no credit card required.",
        },
      ],
    },
  },
  final: {
    title: {
      instructions:
        "Write a compelling final CTA focused on the main action and benefit (4-7 words)",
      examples: [
        "Start posting everywhere in seconds",
        "Save time, reach more people",
      ],
    },
    subtitle: {
      instructions:
        "Write a brief subtitle emphasizing the free trial (8-12 words)",
      examples: [
        "Stop wasting time posting manually. Try it free for 14 days.",
        "Join thousands of creators saving hours every week.",
      ],
    },
    cta: {
      instructions:
        "Write a strong call-to-action emphasizing 'free' (2-4 words)",
      examples: ["Get started free", "Try free today"],
    },
  },
  growth: {
    title: {
      instructions:
        "Create a compelling title that emphasizes growth and ease of use. Include 2-3 key benefits separated by line breaks (10-15 words)",
      examples: [
        "Grow your social reach with less effort\nfor less money",
        "Scale your social presence faster\nwith smarter tools",
      ],
    },
    subtitle: {
      instructions: "Write a brief introduction to the features (8-12 words)",
      examples: [
        "Powerful features that make social media management effortless",
        "Everything you need to grow your social presence efficiently",
      ],
    },
    features: [
      {
        title: {
          instructions: "Write a clear feature name (1-3 words)",
          examples: [
            "Cross-posting",
            "Smart Scheduling",
            "Content Management",
            "Content Studio",
          ],
        },
        description: {
          instructions:
            "Explain the feature benefit clearly and concisely (15-20 words)",
          examples: [
            "Upload once and post everywhere. Save hours by publishing to all platforms simultaneously.",
            "Plan and schedule your content for optimal posting times across all platforms.",
          ],
        },
        iconName: {
          instructions: "Choose an icon that best represents the feature",
          examples: ["zap", "clock", "layers", "box"],
        },
      },
    ],
    stats: {
      title: {
        instructions: "Write an engaging stats title (2-4 words)",
        examples: ["Watch views grow", "See the impact"],
      },
      value: {
        instructions:
          "Generate a realistic but impressive number for potential views",
        examples: ["6,932,049", "5,847,123"],
      },
      label: {
        instructions: "Label the stat value (2-3 words)",
        examples: ["Potential views", "Monthly reach"],
      },
      cta: {
        instructions: "Write an action-oriented button text (3-4 words)",
        examples: ["Start Growing Now", "Boost Your Reach"],
      },
    },
  },
  howItWorks: {
    title: {
      instructions: "Write a simple section title (2-4 words)",
      examples: ["How it works", "Simple steps"],
    },
    subtitle: {
      instructions: "Write a brief subtitle emphasizing simplicity (4-8 words)",
      examples: [
        "Post everywhere in 3 simple steps",
        "Three steps to cross-platform posting",
      ],
    },
    steps: [
      {
        title: {
          instructions: "Write a clear, action-oriented step title (2-4 words)",
          examples: [
            "Connect your accounts",
            "Upload your content",
            "Post everywhere",
          ],
        },
        description: {
          instructions: "Explain the step in simple terms (5-10 words)",
          examples: [
            "Link your social media accounts in minutes",
            "Add your post, image, or video once",
            "Click once to share on all platforms",
          ],
        },
        iconName: {
          instructions: "Choose an icon that represents the step",
          examples: ["zap", "upload", "trending-up"],
        },
      },
    ],
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
      model: "gpt-3.5-turbo",
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
