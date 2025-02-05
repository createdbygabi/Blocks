import JSZip from "jszip";

export function generatePage({ theme, design, font, content }) {
  // Create a mapping of feature icons
  const featureIcons = {
    FiZap: '<FiZap className="w-6 h-6" />',
    FiStar: '<FiStar className="w-6 h-6" />',
    FiClock: '<FiClock className="w-6 h-6" />',
    FiBox: '<FiBox className="w-6 h-6" />',
    FiTrendingUp: '<FiTrendingUp className="w-6 h-6" />',
    FiLayers: '<FiLayers className="w-6 h-6" />',
    FiActivity: '<FiActivity className="w-6 h-6" />',
  };

  // Map content features to use direct icon references
  const processedContent = {
    ...content,
    features: content.features.map((feature, index) => ({
      ...feature,
      icon: featureIcons[["FiZap", "FiStar", "FiClock"][index] || "FiZap"],
    })),
  };

  return `
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiStar, FiClock, FiBox, FiTrendingUp, FiLayers, FiActivity } from 'react-icons/fi';

// Styles are embedded directly
const styles = {
  theme: ${JSON.stringify(theme)},
  design: ${JSON.stringify(design)},
  font: ${JSON.stringify(font)}
};

// Content is embedded directly
const content = ${JSON.stringify(processedContent)};

export default function LandingPage() {
  return (
    <div className={styles.font.className}>
      {/* Hero Section */}
      <motion.section className={\`relative min-h-screen \${styles.theme.colors.surface}\`}>
        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={\`text-5xl md:text-6xl font-bold mb-6 \${styles.theme.colors.text.primary}\`}
          >
            {content.hero.title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={\`text-xl md:text-2xl mb-12 \${styles.theme.colors.text.secondary}\`}
          >
            {content.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className={\`px-8 py-4 rounded-full \${styles.theme.colors.button.primary.base} \${styles.theme.colors.button.primary.hover}\`}>
              {content.hero.cta}
            </button>
            <button className={\`px-8 py-4 rounded-full \${styles.theme.colors.button.secondary.base} \${styles.theme.colors.button.secondary.hover}\`}>
              {content.hero.secondaryCta}
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className={\`py-32 \${styles.theme.colors.background}\`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {content.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={\`p-8 rounded-xl \${styles.theme.colors.card.base} \${styles.theme.colors.card.hover}\`}
              >
                <div className={\`text-3xl mb-4 \${styles.theme.colors.text.accent}\`}
                  dangerouslySetInnerHTML={{ __html: feature.icon }}
                />
                <h3 className={\`text-xl font-semibold mb-3 \${styles.theme.colors.text.primary}\`}>
                  {feature.title}
                </h3>
                <p className={\`\${styles.theme.colors.text.secondary}\`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add remaining sections similarly */}
    </div>
  );
}
`;
}

export async function exportSimpleLandingPage(config) {
  try {
    const zip = new JSZip();

    // Generate the main page component
    const pageContent = generatePage(config);
    zip.file("pages/index.js", pageContent);

    // Add minimal package.json with Tailwind dependencies
    zip.file(
      "package.json",
      JSON.stringify(
        {
          name: "landing-page",
          version: "0.1.0",
          private: true,
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
          },
          dependencies: {
            next: "latest",
            react: "latest",
            "react-dom": "latest",
            "framer-motion": "latest",
            "react-icons": "latest",
          },
          devDependencies: {
            autoprefixer: "latest",
            postcss: "latest",
            tailwindcss: "latest",
          },
        },
        null,
        2
      )
    );

    // Add Tailwind config
    zip.file(
      "tailwind.config.js",
      `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
    );

    // Add PostCSS config
    zip.file(
      "postcss.config.js",
      `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
    );

    // Add global styles with Tailwind directives
    zip.file(
      "styles/globals.css",
      `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Additional global styles */
html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}`
    );

    // Add _app.js to import global styles
    zip.file(
      "pages/_app.js",
      `import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}`
    );

    // Add next.config.js
    zip.file(
      "next.config.js",
      `/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
}`
    );

    // Add README with setup instructions
    zip.file(
      "README.md",
      `# Landing Page

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy on Vercel

1. Push to GitHub
2. Import to [Vercel](https://vercel.com/new)
3. Deploy`
    );

    return await zip.generateAsync({ type: "blob" });
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}
