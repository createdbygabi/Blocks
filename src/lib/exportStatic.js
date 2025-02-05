export async function exportStaticPage() {
  // Get the main content element
  const mainElement = document.querySelector("main");
  if (!mainElement) throw new Error("Could not find main element");

  // Get computed styles for all elements
  const styles = new Set();
  const elements = mainElement.getElementsByTagName("*");
  for (const element of elements) {
    const computed = window.getComputedStyle(element);
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i];
      const value = computed.getPropertyValue(prop);
      if (value) styles.add(`${prop}: ${value};`);
    }
  }

  // Create a style tag with all computed styles
  const styleTag = `<style>
    /* Tailwind base styles */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    /* Computed styles */
    .landing-page {
      ${Array.from(styles).join("\n      ")}
    }
  </style>`;

  // Get the HTML content
  const htmlContent = mainElement.outerHTML;

  // Create script tags for required dependencies
  const scriptTags = `
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>
    <script src="https://unpkg.com/react-icons@4.11.0/fi/index.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
  `;

  // Get all script elements from the current page
  const scripts = document.getElementsByTagName("script");
  let inlineScripts = "";
  for (const script of scripts) {
    if (script.textContent) {
      inlineScripts += `<script>${script.textContent}</script>\n`;
    }
  }

  // Create the full HTML document
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page</title>
    ${scriptTags}
    ${styleTag}
</head>
<body>
    <div id="root" class="landing-page">
        ${htmlContent}
    </div>
    ${inlineScripts}
    <script>
      // Initialize React and Framer Motion
      const { motion, AnimatePresence } = FramerMotion;
      
      // Re-hydrate any interactive components
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement('div', { 
            className: 'landing-page',
            dangerouslySetInnerHTML: { __html: document.querySelector('.landing-page').innerHTML }
          })
        )
      );
    </script>
</body>
</html>`;

  // Create a blob and download
  const blob = new Blob([fullHtml], { type: "text/html" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "landing-page.html";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
