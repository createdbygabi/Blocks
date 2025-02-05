import { NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  if (data) {
    console.log("Data:", JSON.stringify(data, null, 2));
  }
  return logMessage;
}

export async function POST(request) {
  const logs = [];
  try {
    logs.push(log("🚀 Starting deployment process"));

    // Parse request
    logs.push(log("📥 Parsing request payload"));
    const { config, projectName } = await request.json();
    logs.push(log("Request data:", { projectName }));

    const exportPath = "blocks-landing-page-export-test";
    logs.push(log(`📂 Using export path: ${exportPath}`));

    // Check if export directory exists
    const fullExportPath = path.join(process.cwd(), exportPath);
    logs.push(log(`📁 Full export path: ${fullExportPath}`));

    if (!fs.existsSync(fullExportPath)) {
      logs.push(log("⚠️ Export directory does not exist!"));
      throw new Error(
        "Export directory not found. Please ensure the project is exported first."
      );
    }
    logs.push(log("✅ Export directory exists"));

    // Read current environment variables
    logs.push(log("📝 Reading current environment variables"));
    const currentEnv = process.env;
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: currentEnv.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: currentEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: currentEnv.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_BLOCKS_USER_ID: config.userId,
      BLOCKS_USER_ID: config.userId,
    };

    console.log("[Deploy Route] Setting user ID in env vars:", {
      NEXT_PUBLIC_BLOCKS_USER_ID: config.userId,
      BLOCKS_USER_ID: config.userId,
    });
    logs.push(log("Setting user ID in env vars:", { userId: config.userId }));

    // Create .env file in the export directory
    logs.push(log("📝 Creating .env file"));
    const envContent = Object.entries(envVars)
      .filter(([_, value]) => value) // Only include non-empty values
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const envPath = path.join(fullExportPath, ".env");
    fs.writeFileSync(envPath, envContent);
    logs.push(log("✅ .env file created"));

    // Verify Vercel CLI
    logs.push(log("🔍 Checking Vercel CLI installation"));
    try {
      const vercelVersion = execSync("vercel --version", { encoding: "utf8" });
      logs.push(
        log(`✅ Vercel CLI is installed, version: ${vercelVersion.trim()}`)
      );
    } catch (error) {
      logs.push(log("⚠️ Vercel CLI not found, installing..."));
      const installOutput = execSync("npm i -g vercel", { encoding: "utf8" });
      logs.push(
        log("✅ Vercel CLI installed successfully", {
          installOutput: installOutput.trim(),
        })
      );
    }

    // Create vercel.json
    logs.push(log("📝 Creating vercel.json configuration"));
    const vercelConfig = {
      version: 2,
      buildCommand: "npm run build",
      devCommand: "npm run dev",
      installCommand: "npm install",
      framework: "nextjs",
      outputDirectory: ".next",
      env: envVars, // Include environment variables in vercel.json
    };
    logs.push(log("Vercel config:", vercelConfig));

    const vercelConfigPath = path.join(fullExportPath, "vercel.json");
    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
    logs.push(log(`✅ vercel.json written to: ${vercelConfigPath}`));

    // Check package.json exists
    const packageJsonPath = path.join(fullExportPath, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      logs.push(log("⚠️ package.json not found!"));
      throw new Error("package.json not found in export directory");
    }
    logs.push(log("✅ package.json exists"));

    // Deploy to Vercel with environment variables
    logs.push(log("🚀 Starting Vercel deployment"));
    logs.push(log(`Project name: ${projectName}`));

    // Construct environment variable flags
    const envFlags = Object.entries(envVars)
      .filter(([_, value]) => value)
      .map(([key, value]) => `--env ${key}=${value}`)
      .join(" ");

    const deployCommand = `cd "${exportPath}" && vercel deploy --prod --force --yes --name  ${projectName} ${envFlags}`;
    logs.push(log(`Executing command: ${deployCommand}`));

    const deploymentStart = Date.now();
    const result = execSync(deployCommand, { encoding: "utf8" });
    const deploymentDuration = Date.now() - deploymentStart;

    logs.push(log(`Deployment output:`, { output: result.trim() }));
    logs.push(log(`⏱️ Deployment took ${deploymentDuration}ms`));

    // Extract deployment URL
    const deploymentOutput = result.trim().split("\n");
    logs.push(log(`Raw deployment output:`, { deploymentOutput }));

    // Find the public URL (shorter one without the extra suffix)
    const deployUrl =
      deploymentOutput
        .find((line) => line.includes(".vercel.app") && !line.includes("-git-"))
        ?.trim() || deploymentOutput.pop();

    logs.push(log(`🔍 Found deployment URL:`, { deployUrl }));

    // Ensure we have a valid URL
    if (!deployUrl || !deployUrl.includes(".vercel.app")) {
      throw new Error("Could not find valid deployment URL in Vercel output");
    }

    logs.push(log(`🎉 Deployment successful! URL: ${deployUrl}`));

    return NextResponse.json({
      success: true,
      url: deployUrl,
      logs: logs,
      deploymentDuration: `${deploymentDuration}ms`,
      environmentSetup: {
        variables: Object.keys(envVars),
        configured: true,
      },
    });
  } catch (error) {
    logs.push(log(`❌ Deployment failed: ${error.message}`));
    logs.push(
      log("Error details:", {
        message: error.message,
        stack: error.stack,
        command: error.cmd,
        output: error.stdout,
        errorOutput: error.stderr,
      })
    );

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        logs: logs,
        errorDetails: {
          command: error.cmd,
          output: error.stdout,
          errorOutput: error.stderr,
        },
      },
      { status: 500 }
    );
  }
}
