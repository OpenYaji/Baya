import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  console.log("Launch API called - Streaming mode");
  
  const { blueprint, stack, projectName } = await req.json();

  if (!blueprint) {
    return NextResponse.json({ error: "Blueprint is required" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      try {
        // Check if we are in a cloud environment (e.g. Vercel)
        const isVercel = process.env.VERCEL === "1";
        if (isVercel) {
          send({ error: "Direct project launching is only supported in local development environments. Please use 'Download Script' instead.", status: 403 });
          controller.close();
          return;
        }

        const baseDir = path.join(process.cwd(), "scaffolds", projectName || "enterprise-app");
        send({ status: "progress", message: `Scaffolding at: ${baseDir}` });
        
        try {
          await fs.mkdir(baseDir, { recursive: true });
        } catch (e: any) {
          send({ error: `Filesystem error: ${e.message}. Cloud deployments are often read-only.`, status: 500 });
          controller.close();
          return;
        }

        // Step 1: Execute Framework Initialization Commands
        const pillars = ["frontend", "backend"];
        
        for (const pillar of pillars) {
          const config = stack[pillar];
          if (config && config.initCommand) {
            send({ status: "progress", message: `Executing ${pillar} init: ${config.initCommand}` });
            try {
              // We use spawn instead of exec for better streaming potential, 
              // but for now keeping it simple with execAsync and sending status
              const { stdout, stderr } = await execAsync(config.initCommand, { cwd: baseDir, timeout: 600000 });
              if (stdout) console.log(`${pillar} stdout:`, stdout);
              if (stderr) console.error(`${pillar} stderr:`, stderr);
              send({ status: "progress", message: `${pillar} successfully initialized.` });
            } catch (e: any) {
              console.error(`Init command failed for ${pillar}.`, e);
              send({ status: "warning", message: `${pillar} initialization failed: ${e.message}` });
            }
          }
        }

        // Step 2: Create Custom Enterprise Folder Structure
        send({ status: "progress", message: "Creating enterprise folder structure..." });
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
          send({ status: "progress", message: "Opening VS Code..." });
        } catch (e) {
          console.log("Could not open editor automatically.");
        }

        send({ 
          success: true, 
          path: baseDir,
          message: `Project '${projectName}' successfully scaffolded and installed at ${baseDir}`
        });
      } catch (error: any) {
        console.error("Scaffold Error:", error);
        send({ error: error.message || "Failed to scaffold project", status: 500 });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
