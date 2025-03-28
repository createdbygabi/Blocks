import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI();

// Field-specific instructions for each section
const SECTION_INSTRUCTIONS = {
  hero: {
    title: {
      instructions:
        "Create a powerful, concise headline (max 8 words) that immediately grabs attention and starts with an action word. It should trigger emotion by focusing on the user pain point. Only uppercase the first letter of the first word.",
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
};

// Helper function to get field instructions
function getFieldInstructions(section, path) {
  const pathParts = path.split(".");
  const fieldName = pathParts[pathParts.length - 1];

  // Get section-specific instructions
  const sectionInstructions = SECTION_INSTRUCTIONS[section] || {};

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
    const {
      businessNiche,
      productService,
      mainFeature,
      painPoint,
      targetAudience,
      section,
      businessId,
      userId,
    } = await req.json();

    if (
      !businessNiche ||
      !productService ||
      !mainFeature ||
      !painPoint ||
      !targetAudience ||
      !section
    ) {
      return NextResponse.json(
        { error: "Missing required information" },
        { status: 400 }
      );
    }

    // Get template structure for the requested section
    const sectionTemplate = {
      hero: {
        title: "",
        subtitle: "",
      },
      benefits: {
        title: "",
        subtitle: "",
        features: [
          {
            title: "",
            description: "",
          },
          {
            title: "",
            description: "",
          },
          {
            title: "",
            description: "",
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
    }[section];

    // Get fields for the section
    const textFields = getTextFields(sectionTemplate);

    // Construct the prompt
    const prompt = `As an expert conversion copywriter, generate new text content for the "${section}" section of a landing page.

Business Information:
- Niche: ${businessNiche}
- Product/Service: ${productService}
- Main Feature: ${mainFeature}
- Pain Point: ${painPoint}
- Target Audience: ${targetAudience}

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

Here are the fields that need new content:

${textFields
  .map((field) => {
    const instructions = getFieldInstructions(section, field.path);
    return `Path: ${field.path}
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

    // Call OpenAI
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
          content: prompt,
        },
      ],
    });

    const generatedText = completion.choices[0].message.content;

    // Initialize section content with template
    const content = JSON.parse(JSON.stringify(sectionTemplate));

    // Process all PATH/NEW TEXT pairs in the response
    const allPairs = generatedText
      .split(/\n*(?=PATH:)/g)
      .filter((pair) => pair.trim().startsWith("PATH:"));

    allPairs.forEach((pair) => {
      const pathMatch = pair.match(/PATH:\s*([^\n]+)/i);
      const textMatch = pair.match(/NEW TEXT:\s*([\s\S]+?)(?=\n*(?:PATH:|$))/i);

      if (pathMatch && textMatch) {
        const path = pathMatch[1].trim();
        let newText = textMatch[1].trim();

        // Remove trailing "---" if present
        newText = newText.replace(/---\s*$/, "").trim();

        // Set the value in the content object
        setValueAtPath(content, path, newText);
      }
    });

    return NextResponse.json({ content });
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
