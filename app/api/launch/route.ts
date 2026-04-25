import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  console.log("Launch API called");
  try {
    const { blueprint, stack, projectName } = await req.json();

    if (!blueprint) {
      return NextResponse.json({ error: "Blueprint is required" }, { status: 400 });
    }

    // Check if we are in a cloud environment (e.g. Vercel)
    const isVercel = process.env.VERCEL === "1";
    if (isVercel) {
      console.error("Attempted to launch in a Vercel environment. This is not supported.");
      return NextResponse.json({ 
        error: "Direct project launching is only supported in local development environments. Please use 'Download Script' instead." 
      }, { status: 403 });
    }

    const baseDir = path.join(process.cwd(), "scaffolds", projectName || "enterprise-app");
    console.log(`Scaffolding at: ${baseDir}`);
    
    try {
      await fs.mkdir(baseDir, { recursive: true });
    } catch (e: any) {
      console.error("Failed to create directory:", e);
      return NextResponse.json({ error: `Filesystem error: ${e.message}. Cloud deployments are often read-only.` }, { status: 500 });
    }

    // Step 1: Execute Framework Initialization Commands (Whole Package Install)
    const pillars = ["frontend", "backend"];
    const results: string[] = [];
    
    for (const pillar of pillars) {
      const config = stack[pillar];
      if (config && config.initCommand) {
        console.log(`Executing ${pillar} init: ${config.initCommand}`);
        try {
          // Increase timeout for heavy installs
          const { stdout, stderr } = await execAsync(config.initCommand, { cwd: baseDir, timeout: 600000 });
          if (stdout) console.log(`${pillar} stdout:`, stdout);
          if (stderr) console.error(`${pillar} stderr:`, stderr);
          results.push(`${pillar} successfully initialized.`);
        } catch (e: any) {
          console.error(`Init command failed for ${pillar}.`, e);
          results.push(`${pillar} initialization failed: ${e.message}`);
        }
      }
    }

    // Step 2: Create Custom Enterprise Folder Structure (Modules, Common, etc.)
    for (const [category, folders] of Object.entries(blueprint)) {
      if (!Array.isArray(folders)) continue;
      for (const folder of folders) {
        const folderPath = path.join(baseDir, category, folder);
        await fs.mkdir(folderPath, { recursive: true });
        await fs.writeFile(path.join(folderPath, ".gitkeep"), "");
      }
    }

    try {
      await execAsync(`code "${baseDir}"`);
    } catch (e) {
      console.log("Could not open editor automatically.");
    }

    return NextResponse.json({ 
      success: true, 
      path: baseDir,
      message: `Project '${projectName}' successfully scaffolded and installed at ${baseDir}`
    });
  } catch (error: unknown) {
    console.error("Scaffold Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to scaffold project";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
