import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Field-specific instructions for each section
const FIELD_INSTRUCTIONS = {
  hero: {
    title: {
      instructions:
        "Create a powerful, concise headline (max 8 words) that immediately grabs attention and starts with an action word. It should be trigger emotionnally by focusing on pain point solving.",
      examples: [
        "Give your X posts the engagement they deserve!",
        "Ship your startup in days, not weeks",
      ],
    },
    subtitle: {
      instructions:
        "Write a clear, benefit-focused subtitle (15-20 words) that expands on the headline.",
      examples: [
        "AI-powered analytics that help you make smarter decisions in half the time",
        "The NextJS boilerplate with all you need to build your SaaS, AI tool, or any other web app and make your first $ online fast.",
        "The simplest way to post and grow on all platforms. Built for creators and small teams without the ridiculous price tag.",
        "Get sales, growth and new networks. Faster than what you're currently trying.",
      ],
    },
    cta: {
      instructions:
        "Create a strong call-to-action (2-4 words) that drives action.",
      examples: ["Start Free Trial", "Get Started", "Try It Free"],
    },
  },
  features: {
    title: {
      instructions:
        "Write a feature title (3-5 words) that focuses on the benefit.",
      examples: ["Real-Time Analytics", "Seamless Integration"],
    },
    description: {
      instructions:
        "Create a clear feature description (15-20 words) that explains the benefit and how it works.",
      examples: [
        "Get instant insights from your data with our AI-powered analytics engine that never sleeps.",
      ],
    },
  },
  testimonials: {
    quote: {
      instructions:
        "Write a authentic-sounding testimonial (30-40 words) that focuses on specific results and benefits.",
      examples: [
        "The AI analytics helped us identify trends we were missing. Within 3 months, we increased conversion rates by 47% and reduced costs by 28%.",
      ],
    },
  },
  pricing: {
    perfect: {
      instructions:
        "Write a short description (5-8 words) of who this plan is for.",
      examples: ["Perfect for growing startups and SMBs"],
    },
  },
};

// Get field-specific instructions
function getFieldInstructions(section, path) {
  const pathParts = path.split(".");
  const fieldName = pathParts[pathParts.length - 1];

  // Get section-specific instructions if they exist
  const sectionInstructions = FIELD_INSTRUCTIONS[section] || {};

  // Try to match the exact field path
  for (const [key, value] of Object.entries(sectionInstructions)) {
    if (path.endsWith(key)) {
      return value;
    }
  }

  // Default instructions based on field name patterns
  if (fieldName.includes("title")) {
    return {
      instructions: "Write a clear, benefit-focused title (5-7 words).",
      examples: ["Transform Your Business with AI"],
    };
  }
  if (fieldName.includes("description")) {
    return {
      instructions: "Write a clear, engaging description (15-20 words).",
      examples: [
        "Our AI-powered platform helps you make better decisions faster, with real-time insights.",
      ],
    };
  }
  if (fieldName.includes("cta")) {
    return {
      instructions: "Write a clear call-to-action (2-4 words).",
      examples: ["Get Started", "Try It Free"],
    };
  }

  // Generic instructions
  return {
    instructions:
      "Write clear, benefit-focused copy appropriate for this field.",
    examples: [],
  };
}

export async function POST(req) {
  try {
    const { section, currentContent, productDescription, audiencePainPoints } =
      await req.json();

    console.log("🎯 Generating copy for section:", section);
    console.log("📝 Current content structure:", currentContent);

    // Helper function to identify which fields need text generation
    function getTextFields(obj, path = "") {
      const fields = [];

      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        // Skip technical fields
        if (key === "id" || key === "iconName" || key === "logo") continue;

        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === "object" && item !== null) {
              fields.push(...getTextFields(item, `${currentPath}[${index}]`));
            } else if (typeof item === "string") {
              fields.push({
                path: `${currentPath}[${index}]`,
                currentValue: item,
              });
            }
          });
        } else if (typeof value === "object" && value !== null) {
          fields.push(...getTextFields(value, currentPath));
        } else if (typeof value === "string") {
          fields.push({
            path: currentPath,
            currentValue: value,
          });
        }
      }

      return fields;
    }

    // Get all fields that need text generation
    const textFields = getTextFields(currentContent);
    console.log("📝 Fields to generate:", textFields);

    const prompt = `As an expert conversion copywriter, generate new text content for the "${section}" section of a landing page.

Product Description:
${productDescription}

Audience Pain Points:
${audiencePainPoints}

I will provide you with fields that need new text content. For each field, I will show:
- The field path
- Current value
- Specific instructions for that type of content
- Examples of good copy (if available)

Generate new, persuasive content for each field while:
1. Following the specific instructions for each field
2. Maintaining appropriate length and style
3. Addressing the pain points directly
4. Emphasizing the unique value proposition
5. Using persuasive, benefit-focused language
6. Maintaining authenticity and credibility
7. Avoiding using double quotes and other special characters

Here are the fields that need new content:

${textFields
  .map((field) => {
    const instructions = getFieldInstructions(section, field.path);
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
---

Generate content for each field one by one, strictly following the length and style guidelines provided.`;

    console.log("🤖 Calling GPT-4...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert conversion copywriter who specializes in creating high-converting landing page copy. Provide new text content for each field as requested, following the exact format specified and adhering strictly to the length and style guidelines provided.",
        },
        { role: "user", content: prompt },
      ],
    });

    // Parse the response and update the content structure
    const generatedText = completion.choices[0].message.content;
    console.log("✨ Generated text:", generatedText);

    // Helper function to update a value at a specific path
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

    // Parse the generated text and update the content
    const newContent = JSON.parse(JSON.stringify(currentContent)); // Deep clone
    const textBlocks = generatedText
      .split("---")
      .filter((block) => block.trim());

    textBlocks.forEach((block) => {
      const pathMatch = block.match(/PATH: (.*)\n/);
      const textMatch = block.match(/NEW TEXT: ([\s\S]*?)(?=\nPATH:|$)/);

      if (pathMatch && textMatch) {
        const path = pathMatch[1].trim();
        const newText = textMatch[1].trim();
        setValueAtPath(newContent, path, newText);
      }
    });

    console.log("✨ Final content structure:", newContent);
    return NextResponse.json({ content: newContent });
  } catch (error) {
    console.error("❌ Generate copy error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to generate copy" },
      { status: 500 }
    );
  }
}
