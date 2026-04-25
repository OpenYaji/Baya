"use client";

import { useState } from "react";
import {
  Wand2,
  Layers,
  FileCode,
  Rocket,
  Plus,
  X,
  ChevronRight,
  Download,
  Loader2,
  Terminal,
  Folder,
  Orbit
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type StackItem = { name: string; value: string; initCommand?: string };
type ArchitectureData = {
  stack: {
    frontend: StackItem;
    backend: StackItem;
    database: StackItem;
    infrastructure: StackItem;
  };
  blueprint: Record<string, string[]>;
  rationale: string;
};

export default function ArchitectApp() {
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [intent, setIntent] = useState("");
  const [projectName, setProjectName] = useState("enterprise-app");
  const [sandbox, setSandbox] = useState<string[]>([]);
  const [currentTool, setCurrentTool] = useState("");
  const [archData, setArchData] = useState<ArchitectureData | null>(null);

  const addTool = () => {
    if (currentTool && !sandbox.includes(currentTool)) {
      setSandbox([...sandbox, currentTool]);
      setCurrentTool("");
    }
  };

  const removeTool = (tool: string) => {
    setSandbox(sandbox.filter((t) => t !== tool));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, sandbox, projectName }),
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}...`);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to generate architecture (Status: ${res.status})`);
      }

      setArchData(data);
      setPhase(2);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to generate architecture. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const [launchStatus, setLaunchStatus] = useState<string>("");

  const handleLaunch = async () => {
    if (!confirm(`This will create '${projectName}' and run full installation commands (e.g. npx create-expo-app). Proceed?`)) {
      return;
    }

    setLaunching(true);
    setLaunchStatus("Initiating launch...");
    try {
      const res = await fetch("/api/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueprint: archData?.blueprint,
          stack: archData?.stack,
          projectName: projectName
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || `Launch failed (Status: ${res.status})`);
        } catch {
          throw new Error(`Launch failed (Status: ${res.status}): ${errorText.slice(0, 100)}`);
        }
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let finalMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(l => l.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.error) throw new Error(data.error);
            if (data.message) {
              setLaunchStatus(data.message);
              if (data.success) finalMessage = data.message;
            }
          } catch (e: any) {
            console.error("Error parsing stream line:", e);
            if (e.message) throw e;
          }
        }
      }

      if (finalMessage) alert(finalMessage);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to launch CLI action.");
    } finally {
      setLaunching(false);
      setLaunchStatus("");
    }
  };

  const updateStack = (key: keyof ArchitectureData["stack"], newValue: string) => {
    if (!archData) return;
    setArchData({
      ...archData,
      stack: {
        ...archData.stack,
        [key]: { ...archData.stack[key], value: newValue },
      },
    });
  };

  const openAntiGravity = () => {
    const win = window.open('', 'Anti-Gravity', 'width=800,height=600');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Anti-Gravity</title>
            <style>
              body { margin: 0; overflow: hidden; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; font-family: sans-serif; height: 100vh; }
              .container { position: relative; width: 100%; height: 100%; }
              .floating {
                position: absolute;
                font-size: 3rem;
                animation: float 4s ease-in-out infinite alternate;
              }
              @keyframes float {
                0% { transform: translateY(0px) rotate(0deg); }
                100% { transform: translateY(-100px) rotate(15deg); }
              }
            </style>
          </head>
          <body>
            <div class="container" id="space">
              <div class="floating" style="left: 40%; top: 50%; animation-delay: 0s;">🚀</div>
              <div class="floating" style="left: 60%; top: 30%; animation-delay: -1s;">🌍</div>
              <div class="floating" style="left: 20%; top: 60%; animation-delay: -2s;">⭐</div>
              <div class="floating" style="left: 70%; top: 70%; animation-delay: -3s;">🧑‍🚀</div>
              <div style="position: absolute; top: 10%; width: 100%; text-align: center; font-size: 2rem; font-weight: bold; animation: float 3s ease-in-out infinite alternate;">Anti-Gravity Mode Activated</div>
            </div>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  const downloadScript = () => {
    if (!archData) return;

    const scriptLines = [
      "#!/bin/bash",
      `# Project Scaffold for ${projectName}`,
      "mkdir -p frontend backend infrastructure agents",
    ];

    Object.entries(archData.blueprint).forEach(([category, folders]) => {
      folders.forEach(folder => {
        scriptLines.push(`mkdir -p ${category}/${folder}`);
        scriptLines.push(`touch ${category}/${folder}/.gitkeep`);
      });
    });

    scriptLines.push("echo 'Project scaffolded successfully!'");
    scriptLines.push("echo 'Open this directory in your favorite AI IDE.'");

    const blob = new Blob([scriptLines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "init-project.sh";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Wand2 className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Baya AI</h1>
          </div>
          <button
            onClick={openAntiGravity}
            className="ml-4 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-full transition-colors border border-slate-700 hover:border-slate-600"
            title="Anti-Gravity Mode"
          >
            <Orbit className="w-3.5 h-3.5 text-indigo-400" />
            Anti-Gravity
          </button>
        </div>

        <nav className="flex items-center gap-2 text-sm font-medium text-slate-400">
          {[1, 2, 3, 4].map((p) => (
            <div key={p} className="flex items-center gap-2">
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs border transition-all",
                phase === p ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-800"
              )}>
                {p}
              </span>
              {p < 4 && <ChevronRight className="w-4 h-4" />}
            </div>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto">
        {phase === 1 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="text-4xl font-extrabold mb-4">Eliminate blank canvas paralysis.</h2>
              <p className="text-slate-400 text-lg">Define your product intent and let the AI build the enterprise structure.</p>
            </div>

            <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-indigo-400" />
                    Project Folder Name
                  </label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-600 mb-6 font-mono"
                    placeholder="e.g. enterprise-app"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Product Intent</label>
                  <textarea
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all h-32"
                    placeholder="e.g. I want to build a cross-platform health tracker that uses AI for data verification."
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">The Developer Sandbox (Preferred Tech)</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {sandbox.map((tool) => (
                      <span key={tool} className="bg-indigo-900/40 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {tool}
                        <button onClick={() => removeTool(tool)} className="hover:text-white transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 outline-none focus:ring-1 focus:ring-indigo-600"
                      placeholder="e.g. React Native, NestJS"
                      value={currentTool}
                      onChange={(e) => setCurrentTool(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTool()}
                    />
                    <button
                      onClick={addTool}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-100 p-2 rounded-xl transition-colors"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <button
                  disabled={!intent || loading}
                  onClick={handleGenerate}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                  Generate Enterprise Stack
                </button>
              </div>
            </div>
          </section>
        )}

        {phase === 2 && archData && archData.stack && (
          <section className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">The Mixing Board</h2>
                <p className="text-slate-400">Review and tweak your proposed enterprise tech stack.</p>
              </div>
              <button
                onClick={() => setPhase(3)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                Proceed to Blueprint
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.keys(archData.stack) as Array<keyof ArchitectureData["stack"]>).map((key) => {
                const item = archData.stack[key];
                if (!item) return null;
                return (
                  <div key={key} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Layers className="w-12 h-12" />
                    </div>
                    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4">{item.name}</h3>
                    <div className="space-y-4">
                      <input
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-lg font-semibold text-indigo-400 focus:ring-1 focus:ring-indigo-600 outline-none"
                        value={item.value}
                        onChange={(e) => updateStack(key, e.target.value)}
                      />
                      {item.initCommand && (
                        <div className="p-2 bg-black rounded border border-slate-800">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                            <Terminal className="w-3 h-3" /> Bootstrapping Command
                          </div>
                          <div className="text-[10px] font-mono text-green-500/80 truncate" title={item.initCommand}>
                            {item.initCommand}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 bg-indigo-900/10 border border-indigo-900/30 rounded-2xl p-6">
              <h4 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                AI Rationale
              </h4>
              <p className="text-slate-300 leading-relaxed italic">&quot;{archData.rationale}&quot;</p>
            </div>
          </section>
        )}

        {phase === 3 && archData && (
          <section className="animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">The Modern Blueprint</h2>
                <p className="text-slate-400 font-mono text-sm">Target Root: {projectName}/</p>
              </div>
              <button
                onClick={() => setPhase(4)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                Final Handoff
                <Rocket className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8 font-mono text-sm">
                <div className="flex items-center gap-2 text-slate-500 mb-6 border-b border-slate-800 pb-4">
                  <FileCode className="w-4 h-4" />
                  {projectName}/
                </div>
                <div className="space-y-4">
                  {Object.entries(archData.blueprint).map(([category, folders]) => (
                    <div key={category} className="ml-4">
                      <div className="text-indigo-400 font-bold mb-1">/{category}</div>
                      <div className="ml-4 space-y-1 border-l border-slate-800">
                        {folders.map(folder => (
                          <div key={folder} className="flex items-center gap-2 text-slate-400 pl-4 before:content-[''] before:w-2 before:h-[1px] before:bg-slate-800 before:inline-block">
                            {folder}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h4 className="font-bold mb-4 text-slate-200">Standard Packages</h4>
                  <ul className="space-y-3 text-sm text-slate-400">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                      ESLint / Prettier Config
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                      TypeScript Base Config
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                      Shared UI Library
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {phase === 4 && archData && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-500 text-center py-12">
            <div className="max-w-xl mx-auto">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto mb-8">
                <Rocket className="text-white w-10 h-10" />
              </div>
              <h2 className="text-4xl font-extrabold mb-4">Architecture Locked.</h2>
              <p className="text-slate-400 text-lg mb-12">Launch your project instantly on this machine. This will install all frameworks and libraries automatically.</p>

              <div className="grid grid-cols-1 gap-4">
                <button
                  disabled={launching}
                  onClick={handleLaunch}
                  className="bg-white text-slate-950 hover:bg-slate-200 font-bold py-6 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {launching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Terminal className="w-6 h-6" />}
                  Launch & Bootstrap Whole Package
                </button>

                {launching && launchStatus && (
                  <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-4 flex items-center gap-3 text-indigo-400 animate-pulse">
                    <Terminal className="w-4 h-4" />
                    <span className="text-sm font-mono">{launchStatus}</span>
                  </div>
                )}

                <button
                  onClick={downloadScript}
                  className="bg-slate-800 text-slate-100 hover:bg-slate-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download init-project.sh
                </button>
              </div>

              <button
                onClick={() => setPhase(1)}
                className="mt-12 text-slate-500 hover:text-slate-300 font-medium underline underline-offset-4"
              >
                Start Over
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
