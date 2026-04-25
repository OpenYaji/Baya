import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { blueprint, stack, projectName } = await req.json();

    if (!blueprint) {
      return NextResponse.json({ error: "Blueprint is required" }, { status: 400 });
    }

    const baseDir = path.join(process.cwd(), "scaffolds", projectName || "enterprise-app");
    await fs.mkdir(baseDir, { recursive: true });

    // Step 1: Execute Framework Initialization Commands (Whole Package Install)
    const pillars = ["frontend", "backend"];
    const results: string[] = [];
    
    for (const pillar of pillars) {
      const config = stack[pillar];
      if (config && config.initCommand) {
        console.log(`Executing ${pillar} init: ${config.initCommand}`);
        try {
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
