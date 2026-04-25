import { NextRequest, NextResponse } from "next/server";
import { getModel, ARCHITECT_SYSTEM_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { intent, sandbox, projectName } = await req.json();

    if (!intent) {
      return NextResponse.json({ error: "Product intent is required" }, { status: 400 });
    }

    const model = getModel();

    if (process.env.MOCK_AI === "true" || !model) {
      return NextResponse.json({
        stack: {
          frontend: { 
            name: "Frontend/Mobile", 
            value: "Next.js", 
            initCommand: "npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias \"@/*\" --use-npm --no-git" 
          },
          backend: { 
            name: "Backend/API", 
            value: "NestJS", 
            initCommand: "npx @nestjs/cli new backend --package-manager npm --skip-git" 
          },
          database: { name: "Database", value: "PostgreSQL", initCommand: "" },
          infrastructure: { name: "AI/Infrastructure", value: "Docker & K8s", initCommand: "" }
        },
        blueprint: {
          frontend: ["src/components", "src/hooks", "src/services"],
          backend: ["src/modules/auth", "src/modules/users", "src/common/guards", "src/common/interceptors"],
          infrastructure: ["docker", "k8s"]
        },
        rationale: "This enterprise stack provides a scalable React frontend with a robust, modular NestJS backend."
      });
    }

    const prompt = `
    ${ARCHITECT_SYSTEM_PROMPT}
    
    Project Name: ${projectName}
    User Intent: ${intent}
    Developer Sandbox: ${sandbox.join(", ")}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Architect API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate architecture";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
