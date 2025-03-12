import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI();

// Define template structure for each section
const SECTION_TEMPLATES = {
  hero: {
    badge: "",
    title: "",
    subtitle: "",
    cta: "",
    hero_image: null, // Optional, if provided will use two-column layout
    userType: "",
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
    title: "",
    subtitle: "",
    plans: [
      {
        name: "",
        price: "",
        period: "/month",
        description: "",
        feature1: "",
        feature2: "",
        feature3: "",
        feature4: "",
        cta: "Get Started",
        highlight: false,
        setupFee: "0",
        mainFeature: "",
        limitations: "",
        billingPeriod: "monthly",
      },
      null, // Middle plan comes from pricingPlan
      {
        name: "",
        price: "",
        period: "/month",
        description: "",
        feature1: "",
        feature2: "",
        feature3: "",
        feature4: "",
        feature5: "",
        feature6: "",
        feature7: "",
        cta: "Contact Sales",
        highlight: false,
        setupFee: "0",
        mainFeature: "",
        limitations: "",
        billingPeriod: "monthly",
      },
    ],
  },
  faq: {
    title: "Common questions",
    items: [
      {
        question: "",
        answer: "",
      },
      {
        question: "",
        answer: "",
      },
      {
        question: "",
        answer: "",
      },
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
  },
  painPoints: {
    title: "",
    subtitle: "",
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
  benefits: {
    title: "",
    subtitle: "",
    features: [
      {
        title: "",
        description: "",
        iconName: "zap",
      },
      {
        title: "",
        description: "",
        iconName: "clock",
      },
      {
        title: "",
        description: "",
        iconName: "layers",
      },
      {
        title: "",
        description: "",
        iconName: "box",
      },
    ],
    stats: {
      title: "",
      value: "",
      label: "",
      cta: "",
    },
  },
  howItWorks: {
    title: "",
    subtitle: "",
    steps: [
      {
        title: "",
        description: "",
        iconName: "zap",
      },
      {
        title: "",
        description: "",
        iconName: "upload",
      },
      {
        title: "",
        description: "",
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
        "Create a powerful, concise headline (max 8 words) that immediately grabs attention and starts with an action word. It should be trigger emotionnally by focusing on the user pain point. Only uppercase the first letter of the first word.",
      examples: [
        "Give your X posts the engagement they deserve",
        "Ship your startup in days, not weeks",
        "Save hours on social media posting",
        "Build & monetize your audience, fast",
      ],
    },
    subtitle: {
      instructions:
        "Write a clear, benefit-focused subtitle (15-20 words) that expands on the headline. One sentence.",
      examples: [
        "AI-powered analytics that help you make smarter decisions in half the time",
        "The NextJS boilerplate with all you need to build your SaaS, AI tool, or any other web app and make your first $ online fast.",
        "The simplest way to post and grow on all platforms. Built for creators and small teams without the ridiculous price tag.",
        "Get sales, growth and new networks. Faster than what you're currently trying.",
      ],
    },
    cta: {
      instructions:
        "Create a strong call-to-action (2 words) that drives action related to the main feature (should not contain any mention of free or similar phrases).",
      examples: ["Get Started", "Generate content", "Start Generating"],
    },
    userType: {
      instructions:
        "Write the user type based on the business niche/product that will be integrated at the end of the sentence 'Loved by 99+ [word]'",
      examples: ["small businesses", "freelancers", "entrepreneurs"],
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
            "Describe the pain point in a relatable way understanding the pain point of the user (10-15 words)",
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
        "Write a headline emphasizing the solving of the user problem (6-8 words)",
      examples: ["Get more views, with less effort"],
    },
    subtitle: {
      instructions: "Write a brief subtitle about choosing plans (5-8 words)",
      examples: ["Choose the perfect plan for your needs"],
    },
    // Middle plan fields (position [0])
    "plans[0].name": {
      instructions:
        "Name for the middle plan consistent with the product (one word)",
      examples: ["Professional", "Growth"],
    },
    "plans[0].price": {
      instructions:
        "Price for middle plan (number only, without currency or $ sign)",
      examples: ["49"],
    },
    "plans[0].description": {
      instructions: "Brief description of middle plan value",
      examples: ["Perfect for growing businesses and teams"],
    },
    "plans[0].mainFeature": {
      instructions: "Describe the main feature for middle plan",
      examples: ["Advanced AI features"],
    },
    "plans[0].limitations": {
      instructions: "List usage limits for middle plan",
      examples: ["Up to 10 projects per month"],
    },
    "plans[0].feature1": {
      instructions: "First core feature for middle plan",
      examples: ["5 landing pages per month"],
    },
    "plans[0].feature2": {
      instructions: "Second core feature for middle plan",
      examples: ["Advanced AI assistance"],
    },
    "plans[0].feature3": {
      instructions: "Third core feature for middle plan",
      examples: ["Priority support"],
    },
    "plans[0].feature4": {
      instructions: "Fourth core feature for middle plan",
      examples: ["Advanced analytics"],
    },
    // Enterprise plan fields
    "plans[2].name": {
      instructions:
        "Name for the premium plan (2.5-3x middle plan price), one word only",
      examples: ["Enterprise", "Pro"],
    },
    "plans[2].price": {
      instructions:
        "Price for enterprise plan (number only, without currency or $ sign)",
      examples: ["99"],
    },
    "plans[2].description": {
      instructions:
        "Write a brief description for premium features (10-15 words)",
      examples: ["Advanced features and priority support for growing teams"],
    },
    "plans[2].mainFeature": {
      instructions: "Describe the main feature for premium plan",
      examples: ["Advanced AI suite with priority features"],
    },
    "plans[2].limitations": {
      instructions: "List usage limits for premium plan",
      examples: ["Unlimited usage", "No restrictions"],
    },
    "plans[2].feature1": {
      instructions: "First premium feature",
      examples: ["Unlimited landing pages"],
    },
    "plans[2].feature2": {
      instructions: "Second premium feature",
      examples: ["Advanced AI features"],
    },
    "plans[2].feature3": {
      instructions: "Third premium feature",
      examples: ["Priority support"],
    },
    "plans[2].feature4": {
      instructions: "Fourth premium feature",
      examples: ["Custom branding"],
    },
    "plans[2].feature5": {
      instructions: "Fifth premium feature",
      examples: ["A/B testing"],
    },
    "plans[2].feature6": {
      instructions: "Sixth premium feature",
      examples: ["API access"],
    },
    "plans[2].feature7": {
      instructions: "Seventh premium feature",
      examples: ["Team collaboration"],
    },
  },
  faq: {
    title: {
      instructions: "Write a simple FAQ section title (2-3 words)",
      examples: ["Common questions", "Quick answers"],
    },
    items: [
      {
        question: {
          instructions:
            "Write a clear, concise question about the product (5-10 words)",
          examples: [
            "What social platforms do you support?",
            "How many social accounts can I connect?",
            "Is there a free trial?",
          ],
        },
        answer: {
          instructions:
            "Provide a helpful, straightforward answer (10-20 words)",
          examples: [
            "We support all major platforms including Twitter/X, Instagram, LinkedIn, Facebook, TikTok, and more.",
            "The number of accounts depends on your plan - from 3 accounts on Basic to unlimited on Enterprise.",
            "Yes, you can try all features free for 14 days, no credit card required.",
          ],
        },
      },
    ],
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
        "Write a strong call-to-action related to the main feature emotionally appealing to the pain point of the user (2 words)",
      examples: ["Generate content"],
    },
  },
  benefits: {
    title: {
      instructions:
        "Create a compelling title that emphasizes the main benefits (6-8 words)",
      examples: [
        "Grow your social reach with less effort for less money",
        "Save time and reach more people with smart automation",
      ],
    },
    subtitle: {
      instructions: "Write a subtitle that introduces the features (5-8 words)",
      examples: [
        "Using our powerful platform features",
        "Powerful features to grow your presence",
      ],
    },
    features: [
      {
        title: {
          instructions: "Write a clear feature title (2-4 words)",
          examples: ["Cross-posting", "Smart Scheduling", "Content Management"],
        },
        description: {
          instructions: "Explain the feature benefit clearly (10-15 words)",
          examples: [
            "Upload your content once and post it to all platforms instantly",
            "Plan and schedule your content for optimal posting times",
          ],
        },
      },
    ],
    stats: {
      title: {
        instructions: "Write an engaging stats title (2-4 words)",
        examples: ["Watch views grow", "See results fast"],
      },
      label: {
        instructions:
          "Write a clear realistic label that is relevant to the user problem, such as time saved, posts automated, conversion rate, etc. (2-4 words)",
        examples: [
          "Monthly posts",
          "Posts automated",
          "Time saved",
          "Conversion rate",
        ],
      },
      value: {
        instructions:
          "Write a VERY REALISTIC result number of the metric above, has to not sound fake or exaggerated (2-4 words)",
        examples: ["100K", "2.5M", "500K+", "+20%"],
      },
      cta: {
        instructions: "Write an action-focused button text (2-4 words)",
        examples: ["Start Growing Now", "Boost Your Reach"],
      },
    },
  },
  howItWorks: {
    title: {
      instructions:
        "Write a headline emphasizing the main feature solving the pain point (6-8 words)",
      examples: ["Create Viral Videos in Seconds"],
    },
    subtitle: {
      instructions: "Write a brief subtitle emphasizing simplicity (4-8 words)",
      examples: ["Post everywhere in 3 simple steps"],
    },
    steps: [
      {
        title: {
          instructions: "Write a clear step title (2-4 words)",
          examples: ["Connect accounts", "Upload content", "Post everywhere"],
        },
        description: {
          instructions: "Explain the step clearly (8-12 words)",
          examples: [
            "Link your social media accounts in just a few clicks",
            "Add your post, image, or video once",
            "Click once to share on all platforms instantly",
          ],
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

  // Special handling for array items
  const arrayMatch = path.match(/items\[(\d+)\]\.(\w+)/);
  if (arrayMatch) {
    const [_, index, itemField] = arrayMatch;
    // Get instructions from the first item in the items array (used as template)
    if (sectionInstructions.items?.[0]?.[itemField]) {
      return sectionInstructions.items[0][itemField];
    }
  }

  // First try to find exact path match
  let currentObj = sectionInstructions;
  for (const part of pathParts) {
    const arrayPart = part.match(/(\w+)\[(\d+)\]/);
    if (arrayPart) {
      // Skip array indices when looking up instructions
      if (currentObj[arrayPart[1]]) {
        currentObj = currentObj[arrayPart[1]][0];
      } else {
        break;
      }
    } else if (currentObj && currentObj[part]) {
      currentObj = currentObj[part];
    } else {
      break;
    }
  }

  if (currentObj && currentObj.instructions) {
    return currentObj;
  }

  // If no exact match found, try to match the last field name
  if (sectionInstructions[fieldName]) {
    return sectionInstructions[fieldName];
  }

  // Default instructions based on field patterns
  if (fieldName.includes("title")) {
    return {
      instructions: "Write a clear, benefit-focused title (5-7 words).",
      examples: ["Transform Your Business with AI"],
    };
  }

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

    if (typeof value === "string" && value === "") {
      fields.push({ path: currentPath, currentValue: value });
    } else if (Array.isArray(value)) {
      // Include empty arrays as fields that need generation
      if (value.length === 0) {
        fields.push({ path: currentPath, currentValue: value });
      }
      // Continue with normal array processing
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          const arrayItemPath = `${currentPath}[${index}]`;
          const nestedFields = getTextFields(item, arrayItemPath);
          fields.push(...nestedFields);
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
    const { businessInfo, brandingResults, pricingPlan } = await req.json();

    if (!businessInfo || !brandingResults?.name || !pricingPlan) {
      return NextResponse.json(
        { error: "Missing required information" },
        { status: 400 }
      );
    }

    // Initialize only the sections we're generating
    const sections = [
      // "hero",
      // "painPoints",
      // "benefits",
      // "howItWorks",
      // "pricing",
      // "faq",
      "final",
    ];
    const generatedContent = {};

    for (const section of sections) {
      try {
        console.log(`\n📝 Starting generation for ${section} section...`);

        // Get template structure just for this section
        const sectionTemplate = SECTION_TEMPLATES[section];

        // Get fields for just this section
        const textFields = getTextFields(sectionTemplate);
        console.log(
          `\n📋 Fields to generate for ${section}:`,
          JSON.stringify(textFields, null, 2)
        );

        // Construct the prompt
        const prompt = `As an expert conversion copywriter, generate new text content for the "${section}" section of a landing page.

Product main feature:
${businessInfo.mainFeature}

Audience Pain Points:
${businessInfo.painPoint}

Generate new, persuasive content for each field while:
1. Following the specific instructions EXACTLY (especially word count requirements)
2. Using the examples as style guides - match their tone and structure
3. Addressing the pain points directly
4. Emphasizing the unique value proposition
5. Using persuasive, benefit-focused language
6. Maintaining authenticity and credibility
7. Avoiding using double quotes and other special characters

IMPORTANT: For each field, make sure your generated text:
- Matches the exact word count specified in instructions
- Follows the style and structure of the examples
- Expands on previous sections (e.g. subtitle should expand on title)

Don't forget that it is a copywriting for a landing page of a MVP so only one main feature, no complex features.
Also, no free trials.

Here are the fields that need new content:

${textFields
  .map((field) => {
    const instructions = getFieldInstructions(section, field.path);
    return `Path: ${field.path}
Current text: ${field.currentValue}
Instructions: ${instructions.instructions}
${
  instructions.examples.length > 0
    ? `Examples (MATCH THIS STYLE):\n${instructions.examples
        .map((ex) => `- ${ex}`)
        .join("\n")}\n`
    : ""
}
---`;
  })
  .join("\n\n")}

For each field, respond with:
PATH: [field path]
NEW TEXT: [your generated text]
---`;

        const pricingPrompt = `As an expert conversion copywriter, generate pricing tiers around this main plan:

STARTER PLAN (from pricingPlan):
Name: ${pricingPlan.name}
Price: $${pricingPlan.price}
Description: ${pricingPlan.description}
Main Feature: ${pricingPlan.mainFeature}
Features: ${pricingPlan.features.join(", ")}
Limitations: ${pricingPlan.limitations}

Generate TWO complementary pricing tiers:
1. Middle Tier (1.5x-2x starter plan price)
   - 4-5 core features
   - Include all starter plan features
   - Add 1-2 enhanced features
   - Focus on growing businesses
   - Less limitations than starter

2. Pro Tier (2.5x starter plan price)
   - 6-7 features total
   - Include ALL middle tier features
   - Add 2-3 premium features like "API access", "Priority support", "Advanced customization"
   - Focus on scalability and advanced needs
   - Minimal limitations

IMPORTANT: Each plan MUST include a features array with actual features, not an empty array.

Each plan must include:
- name
- price (number only, without currency or $ sign)
- description
- features list (3-4 for middle, 6-7 for pro)
- main feature
- limitations
- period ("/month")
- setupFee ("0")
- billingPeriod ("monthly")
- cta text

Here are the fields that need new content:

${textFields
  .map((field) => {
    const instructions = getFieldInstructions("pricing", field.path);

    return `Path: ${field.path}
Current text: ${field.currentValue}
Instructions: ${instructions.instructions}
${
  instructions.examples.length > 0
    ? `Examples:\n${instructions.examples.map((ex) => `- ${ex}`).join("\n")}\n`
    : ""
}
---`;
  })
  .join("\n\n")}

For each field, respond with:
PATH: [field path]
NEW TEXT: [your generated text]
---`;

        // Log the API request
        console.log("\n🔍 API Request for section:", section);
        console.log("Model:", "gpt-4o");
        console.log(
          "System Message:",
          "You are an expert conversion copywriter who specializes in creating high-converting landing page copy..."
        );
        console.log("User Message:", prompt);

        // Call OpenAI
        console.log(`\n🤖 Calling OpenAI API for ${section}...`);
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are an expert conversion copywriter who specializes in creating high-converting landing page copy. Provide new text content for each field as requested, following the exact format specified and adhering strictly to the length and style guidelines provided.",
            },
            {
              role: "user",
              content: section === "pricing" ? pricingPrompt : prompt,
            },
          ],
        });

        // Log the API response
        console.log("\n📥 API Response:");
        console.log("Status:", completion.choices[0].finish_reason);
        console.log("Generated Text:", completion.choices[0].message.content);
        console.log("Usage:", {
          prompt_tokens: completion.usage?.prompt_tokens,
          completion_tokens: completion.usage?.completion_tokens,
          total_tokens: completion.usage?.total_tokens,
        });

        const generatedText = completion.choices[0].message.content;
        console.log(
          `\n📥 Received response for ${section}:`,
          JSON.stringify(generatedText, null, 2)
        );

        // Initialize section content with template
        generatedContent[section] = JSON.parse(JSON.stringify(sectionTemplate));

        // Modify the blocks parsing section
        const blocks = generatedText
          .split(/\n*---\n*/)
          .filter((block) => block.trim());

        console.log(`\n🔍 Parsing response for ${section}...`);

        // Process all PATH/NEW TEXT pairs in the entire response
        const allPairs = generatedText
          .split(/\n*(?=PATH:)/g)
          .filter((pair) => pair.trim().startsWith("PATH:"));

        allPairs.forEach((pair) => {
          const pathMatch = pair.match(/PATH:\s*([^\n]+)/i);
          const textMatch = pair.match(
            /NEW TEXT:\s*([\s\S]+?)(?=\n*(?:PATH:|$))/i
          );

          if (pathMatch && textMatch) {
            const path = pathMatch[1].trim();
            let newText = textMatch[1].trim();

            // Remove trailing "---" if present
            newText = newText.replace(/---\s*$/, "").trim();

            console.log(`✏️ Setting value for path "${path}":`, newText);
            setValueAtPath(generatedContent[section], path, newText);
          }
        });

        console.log(
          `\n✅ Final content for ${section}:`,
          JSON.stringify(generatedContent[section], null, 2)
        );
      } catch (error) {
        console.error(`\n❌ Error generating ${section} section:`, error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          type: error.type,
          stack: error.stack,
        });
      }
    }

    return NextResponse.json({
      content: generatedContent,
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
  const parts = path.split(".");
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    // Handle array indices in the path
    const match = part.match(/(\w+)\[(\d+)\]/);
    if (match) {
      const [_, arrayName, index] = match;
      if (!current[arrayName]) {
        current[arrayName] = [];
      }
      if (!current[arrayName][index]) {
        current[arrayName][index] = {};
      }
      current = current[arrayName][index];
    } else {
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }
  }

  const lastPart = parts[parts.length - 1];
  // Handle array index in the last part
  const match = lastPart.match(/(\w+)\[(\d+)\]/);
  if (match) {
    const [_, arrayName, index] = match;
    if (!current[arrayName]) {
      current[arrayName] = [];
    }
    current[arrayName][index] = value;
  } else {
    current[lastPart] = value;
  }
}
