import JSZip from "jszip";
import { getStyles } from "./themes";

// Export formats supported by the system
export const EXPORT_FORMATS = {
  NEXT_PROJECT: "next-project", // Full Next.js project
  STATIC_HTML: "static-html", // Single HTML file
  REACT_COMPONENT: "react-component", // React component only
};

// Helper to clean and format class names
const cleanClassNames = (classString) => {
  return classString
    .split(" ")
    .filter(Boolean)
    .map((c) => c.trim())
    .join(" ");
};

// Helper to process theme and styles
const processStyles = (theme, design, font) => {
  const styles = getStyles(theme, design, font);
  return {
    layout: Object.entries(styles.layout).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: cleanClassNames(value),
      }),
      {}
    ),
    text: Object.entries(styles.text).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: cleanClassNames(value),
      }),
      {}
    ),
    button: Object.entries(styles.button).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: cleanClassNames(value),
      }),
      {}
    ),
    card: cleanClassNames(styles.card),
    section: styles.section,
    utils: styles.utils,
  };
};

// Generate static HTML export
const generateStaticHtml = ({ theme, design, font, content }) => {
  const styles = processStyles(theme, design, font);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${content.meta?.description || ""}">
    <title>${content.meta?.title || "Landing Page"}</title>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '${theme.colors.primary}',
              secondary: '${theme.colors.secondary}',
              accent: '${theme.colors.accent}',
            },
            borderRadius: {
              'custom': '${design.borderRadius || "0.5rem"}'
            }
          }
        }
      }
    </script>
    <style>
      .animate-fade-up {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .animate-fade-up.visible {
        opacity: 1;
        transform: translateY(0);
      }
    </style>
</head>
<body class="${theme.colors.background}">
    <main>
        <section class="relative overflow-hidden ${theme.colors.surface} py-24">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div class="text-center max-w-3xl mx-auto">
                    <div class="inline-flex items-center px-4 py-2 rounded-full ${
                      theme.colors.highlight
                    } ${
    theme.colors.text.accent
  } text-sm font-medium mb-8 animate-fade-up">
                        New: AI-Powered Templates Available →
                    </div>
                    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold ${
                      theme.colors.text.primary
                    } mb-6 tracking-tight animate-fade-up">
                        ${content.hero.title}
                    </h1>
                    <p class="text-xl sm:text-2xl ${
                      theme.colors.text.secondary
                    } mb-10 animate-fade-up">
                        ${content.hero.subtitle}
                    </p>
                    <div class="flex flex-wrap justify-center gap-4 animate-fade-up">
                        <a href="#" class="${
                          theme.colors.button.primary.base
                        } ${
    theme.colors.button.primary.hover
  } px-8 py-3 rounded-full font-semibold transition-all duration-200">
                            ${content.hero.cta}
                        </a>
                        <a href="#" class="${
                          theme.colors.button.secondary.base
                        } ${
    theme.colors.button.secondary.hover
  } px-8 py-3 rounded-full font-semibold transition-all duration-200">
                            ${content.hero.secondaryCta}
                        </a>
                    </div>
                    
                    <div class="mt-8 flex items-center justify-center gap-2 ${
                      theme.colors.text.secondary
                    } animate-fade-up">
                        <div class="text-yellow-400 tracking-tight">
                            ${"★".repeat(5)}
                        </div>
                        <span>${content.hero.socialProof.rating}</span>
                        <span class="opacity-70">(${
                          content.hero.socialProof.reviews
                        } reviews)</span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                        ${content.hero.metrics
                          .map(
                            (metric) => `
                            <div class="${theme.colors.card.base} ${theme.colors.card.hover} p-8 rounded-custom shadow-lg transition-all duration-300 animate-fade-up">
                                <div class="text-4xl font-bold ${theme.colors.text.primary} mb-2">${metric.value}</div>
                                <div class="${theme.colors.text.muted}">${metric.label}</div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
            </div>
        </section>

        <section class="py-24 ${theme.colors.background}">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div class="text-center max-w-3xl mx-auto mb-16">
                    <h2 class="text-3xl sm:text-4xl font-bold ${
                      theme.colors.text.primary
                    } mb-4 animate-fade-up">
                        Features That Drive Results
                    </h2>
                    <p class="text-xl ${
                      theme.colors.text.secondary
                    } animate-fade-up">
                        Everything you need to create high-converting landing pages
                    </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${content.features
                      .map(
                        (feature) => `
                        <div class="${theme.colors.card.base} ${theme.colors.card.hover} p-8 rounded-custom shadow-lg transition-all duration-300 animate-fade-up">
                            <div class="w-12 h-12 ${theme.colors.highlight} ${theme.colors.text.accent} rounded-xl flex items-center justify-center text-2xl mb-6">
                                <i class="bi bi-lightning-charge-fill"></i>
                            </div>
                            <h3 class="text-xl font-semibold ${theme.colors.text.primary} mb-3">
                                ${feature.title}
                            </h3>
                            <p class="${theme.colors.text.secondary} mb-4">
                                ${feature.description}
                            </p>
                            <div class="${theme.colors.text.accent} font-semibold mb-2">
                                ${feature.metrics}
                            </div>
                            <div class="${theme.colors.text.muted} text-sm">
                                ${feature.detail}
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        </section>
    </main>

    <script>
        // Add intersection observer for animations
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { 
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        // Apply animations to all elements with animate-fade-up class
        document.querySelectorAll('.animate-fade-up').forEach(element => {
            observer.observe(element);
        });
    </script>
</body>
</html>`;
};

// Generate Next.js project export
const generateNextProject = async (config) => {
  const zip = new JSZip();
  const { theme, design, font, content } = config;

  // Add package.json
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
          "@tailwindcss/typography": "latest",
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

  // Add Next.js config
  zip.file(
    "next.config.js",
    `/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
}`
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
  plugins: [
    require('@tailwindcss/typography'),
  ],
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

  // Add global styles
  zip.file(
    "styles/globals.css",
    `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply antialiased;
  }
}`
  );

  // Add main page component
  zip.file("pages/index.js", generateReactComponent(config));

  // Add _app.js
  zip.file(
    "pages/_app.js",
    `import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}`
  );

  // Add README
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

## Deploy

1. Push to GitHub
2. Import to [Vercel](https://vercel.com/new)
3. Deploy`
  );

  return await zip.generateAsync({ type: "blob" });
};

// Generate React component
const generateReactComponent = ({ theme, design, font, content }) => {
  const styles = processStyles(theme, design, font);

  return `import { motion } from 'framer-motion';
import { FiZap, FiStar, FiClock } from 'react-icons/fi';

// Styles configuration
const styles = ${JSON.stringify(styles, null, 2)};

// Content configuration
const content = ${JSON.stringify(content, null, 2)};

export default function LandingPage() {
  return (
    <div className={styles.layout.background}>
      {content.sections.map((section, index) => {
        switch(section.type) {
          case 'hero':
            return <HeroSection key={index} content={section.content} />;
          case 'features':
            return <FeaturesSection key={index} content={section.content} />;
          // Add more section types as needed
          default:
            return null;
        }
      })}
    </div>
  );
}

// Add section components here
`;
};

// Main export function
export async function exportPage(config, format = EXPORT_FORMATS.NEXT_PROJECT) {
  try {
    switch (format) {
      case EXPORT_FORMATS.STATIC_HTML:
        const html = generateStaticHtml(config);
        const blob = new Blob([html], { type: "text/html" });
        return { blob, filename: "landing-page.html" };

      case EXPORT_FORMATS.NEXT_PROJECT:
        const zipBlob = await generateNextProject(config);
        return { blob: zipBlob, filename: "landing-page.zip" };

      case EXPORT_FORMATS.REACT_COMPONENT:
        const component = generateReactComponent(config);
        const componentBlob = new Blob([component], {
          type: "text/javascript",
        });
        return { blob: componentBlob, filename: "LandingPage.js" };

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}

// Helper function to generate section HTML
function generateSectionHtml(section, styles) {
  switch (section.type) {
    case "hero":
      return `
        <section class="${styles.layout.surface} min-h-screen">
          <div class="${styles.layout.container} pt-24 pb-20">
            <h1 class="${styles.text.heading}">${section.content.title}</h1>
            <p class="${styles.text.body}">${section.content.subtitle}</p>
            <div class="flex gap-4 mt-8">
              <button class="${styles.button.primary}">${section.content.cta}</button>
              <button class="${styles.button.secondary}">${section.content.secondaryCta}</button>
            </div>
          </div>
        </section>`;

    case "features":
      return `
        <section class="${styles.layout.background} py-32">
          <div class="${styles.layout.container}">
            <div class="grid md:grid-cols-3 gap-8">
              ${section.content.features
                .map(
                  (feature) => `
                <div class="${styles.card}">
                  <div class="${styles.text.accent} text-3xl mb-4">${feature.icon}</div>
                  <h3 class="${styles.text.heading}">${feature.title}</h3>
                  <p class="${styles.text.body}">${feature.description}</p>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </section>`;

    default:
      return "";
  }
}
