import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    console.log("=== Starting generate-reel API route ===");
    const { user_id, format_number, niche, reel_id, custom_content } =
      await req.json();
    console.log("Received parameters:", {
      user_id,
      format_number,
      niche,
      reel_id,
      custom_content,
    });

    if (!user_id || !format_number || !niche || !reel_id) {
      console.error("Missing required parameters");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // First verify Python is available
    const pythonVersionProcess = spawn("python3", ["--version"]);

    await new Promise((resolve) => {
      pythonVersionProcess.stdout.on("data", (data) => {
        console.log("Python version:", data.toString());
      });
      pythonVersionProcess.on("close", (code) => {
        console.log("Python version check exited with code:", code);
        resolve();
      });
    });

    console.log("Starting reel generation script execution...");
    const pythonProcess = spawn(
      "/Users/gabi/Desktop/SaaS/blocks-social-media-marketing/env/bin/python",
      [
        "/Users/gabi/Desktop/SaaS/blocks-social-media-marketing/reel_composer/make_reel.py",
        format_number.toString(),
        niche,
        "test_product",
        custom_content ? JSON.stringify(custom_content) : "",
      ],
      {
        env: {
          ...process.env,
          PYTHONPATH: "/Users/gabi/Desktop/SaaS/blocks-social-media-marketing",
          PATH: `/Users/gabi/Desktop/SaaS/blocks-social-media-marketing/env/bin:${process.env.PATH}`,
        },
      }
    );

    return new Promise((resolve) => {
      let stdoutData = "";
      let stderrData = "";

      console.log("Setting up Python process listeners...");

      pythonProcess.stdout.on("data", (data) => {
        const output = data.toString();
        console.log("[Python stdout]:", output);
        stdoutData += output;
      });

      pythonProcess.stderr.on("data", (data) => {
        const error = data.toString();
        console.error("[Python stderr]:", error);
        stderrData += error;
      });

      pythonProcess.on("error", (error) => {
        console.error("[Python process error]:", error);
        stderrData += `Process error: ${error.message}\n`;
      });

      pythonProcess.on("close", async (code) => {
        console.log("[Python process closed] Exit code:", code);
        console.log("=== Complete stdout ===\n", stdoutData);
        console.log("=== Complete stderr ===\n", stderrData);

        resolve(
          NextResponse.json({
            message: "Python script execution completed",
            stdout: stdoutData,
            stderr: stderrData,
            exitCode: code,
            cwd: process.cwd(), // Include Node.js working directory
            env: {
              PATH: process.env.PATH,
              PYTHONPATH: process.env.PYTHONPATH,
            },
          })
        );
      });
    });
  } catch (error) {
    console.error("Error in generate-reel route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
