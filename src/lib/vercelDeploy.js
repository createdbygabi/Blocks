import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export async function deployToVercel(exportPath, projectName) {
  try {
    // Ensure Vercel CLI is installed
    try {
      execSync("vercel --version");
    } catch (error) {
      console.log("Installing Vercel CLI...");
      execSync("npm i -g vercel");
    }

    // Create vercel.json if it doesn't exist
    const vercelConfig = {
      version: 2,
      buildCommand: "npm run build",
      devCommand: "npm run dev",
      installCommand: "npm install",
      framework: "nextjs",
      outputDirectory: ".next",
    };

    fs.writeFileSync(
      path.join(exportPath, "vercel.json"),
      JSON.stringify(vercelConfig, null, 2)
    );

    // Deploy to Vercel
    console.log("Deploying to Vercel...");
    const deployCommand = `cd "${exportPath}" && vercel deploy --prod --yes --name ${projectName}`;
    const result = execSync(deployCommand, { encoding: "utf8" });

    // Extract deployment URL from result
    const deployUrl = result.trim().split("\n").pop();
    return { success: true, url: deployUrl };
  } catch (error) {
    console.error("Deployment failed:", error);
    return { success: false, error: error.message };
  }
}
