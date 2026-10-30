import React, { useState } from 'react';
import {
  Sliders,
  Play,
  Code,
  Copy,
  Check,
  Sparkles,
  Braces,
  Brain,
  FileCode,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { MarkdownRenderer } from '../utils/markdownRenderer';

export function Playground() {
  const [model, setModel] = useState('gemini-3.5-flash');
  const [systemInstruction, setSystemInstruction] = useState(
    'You are an authoritative AI research scientist and lead software engineer. You provide deeply analytical, structured, and production-tested solutions.'
  );
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.95);
  const [thinkingLevel, setThinkingLevel] = useState<'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [prompt, setPrompt] = useState(
    'Explain the computational trade-offs between dense vs sparse mixture-of-experts (MoE) architectures in next-gen multimodal foundation models.'
  );

  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [thinkingOutput, setThinkingOutput] = useState<string | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeLang, setCodeLang] = useState<'ts' | 'python' | 'curl'>('ts');
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!prompt.trim() || isRunning) return;
    setError(null);
    setIsRunning(true);
    setOutput(null);
    setThinkingOutput(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model,
          systemInstruction: systemInstruction.trim() || undefined,
          temperature,
          topP,
          thinkingLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Playground execution failed.');
      }

      setOutput(data.text);
      setThinkingOutput(data.thinkingProcess);
    } catch (err: any) {
      setError(err.message || 'Execution error.');
    } finally {
      setIsRunning(false);
    }
  };

  const getExportCode = () => {
    if (codeLang === 'ts') {
      return `import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

async function main() {
  const response = await ai.models.generateContent({
    model: "${model}",
    contents: ${JSON.stringify(prompt)},
    config: {
      systemInstruction: ${JSON.stringify(systemInstruction)},
      temperature: ${temperature},
      topP: ${topP},
      thinkingConfig: { thinkingLevel: ThinkingLevel.${thinkingLevel} },
    }
  });

  console.log(response.text);
}

main();`;
    }
    if (codeLang === 'python') {
      return `from google import genai
from google.genai import types
import os

client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY"),
    http_options={'headers': {'User-Agent': 'aistudio-build'}}
)

response = client.models.generate_content(
    model="${model}",
    contents="${prompt.replace(/"/g, '\\"')}",
    config=types.GenerateContentConfig(
        system_instruction="${systemInstruction.replace(/"/g, '\\"')}",
        temperature=${temperature},
        top_p=${topP},
    )
)

print(response.text)`;
    }
    return `curl "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=$GEMINI_API_KEY" \\
  -H 'Content-Type: application/json' \\
  -d '{
    "contents": [{"parts": [{"text": ${JSON.stringify(prompt)}}]}],
    "systemInstruction": {"parts": [{"text": ${JSON.stringify(systemInstruction)}}]},
    "generationConfig": {
      "temperature": ${temperature},
      "topP": ${topP}
    }
  }'`;
  };

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-4rem)] bg-[#131314] overflow-y-auto p-4 md:p-8">
      <div className="mx-auto max-w-6xl w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#303134] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#FBBC04] to-[#D96570] text-white">
                <Sliders className="h-4 w-4" />
              </span>
              <h1 className="text-xl font-bold text-white">Prompt & System Architect</h1>
            </div>
            <p className="mt-1 text-xs text-[#9aa0a6]">
              Tune system instructions, temperature, top-p, thinking levels, and export SDK code
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCodeModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[#3c4043] bg-[#1e1f20] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#282a2c] transition-colors"
            >
              <Code className="w-4 h-4 text-[#8ab4f8]" />
              <span>Get Code</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Tuning Parameters Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-[#303134] bg-[#1e1f20] p-5 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] block mb-1.5">
                  Model Architecture
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-xl border border-[#3c4043] bg-[#131314] px-3 py-2 text-xs text-white focus:border-[#8ab4f8] focus:outline-none"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Free Tier · Recommended)</option>
                  <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Free Tier · High Throughput)</option>
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
                </select>
              </div>

              {/* System Instruction */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] block mb-1.5">
                  System Instruction
                </label>
                <textarea
                  rows={4}
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  placeholder="Define role, persona, tone and constraints..."
                  className="w-full resize-none rounded-xl border border-[#3c4043] bg-[#131314] p-3 text-xs text-white placeholder-[#9aa0a6] focus:border-[#8ab4f8] focus:outline-none font-mono"
                />
              </div>

              {/* Temperature Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold uppercase tracking-wider text-[#9aa0a6]">Temperature</span>
                  <span className="font-mono text-white">{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[#8ab4f8]"
                />
              </div>

              {/* Top P Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold uppercase tracking-wider text-[#9aa0a6]">Top P</span>
                  <span className="font-mono text-white">{topP.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full accent-[#8ab4f8]"
                />
              </div>

              {/* Thinking Level */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] block mb-1.5">
                  Thinking Level
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['MINIMAL', 'LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setThinkingLevel(level)}
                      className={`rounded-lg py-1.5 text-[11px] font-semibold border transition-colors ${
                        thinkingLevel === level
                          ? 'border-[#9b72cb] bg-[#9b72cb]/20 text-white'
                          : 'border-[#303134] bg-[#131314] text-[#9aa0a6] hover:bg-[#282a2c]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Input & Output Playground */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="rounded-2xl border border-[#303134] bg-[#1e1f20] p-4 shadow-sm space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6] block">
                User Prompt
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt..."
                className="w-full resize-none rounded-xl border border-[#3c4043] bg-[#131314] p-3 text-sm text-white placeholder-[#9aa0a6] focus:border-[#8ab4f8] focus:outline-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleRun}
                  disabled={isRunning || !prompt.trim()}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4285F4] to-[#9B72CB] px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-50 transition-all"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Executing Prompt...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Run Playground</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Display */}
            <div className="flex-1 rounded-2xl border border-[#303134] bg-[#1e1f20] p-5 shadow-sm min-h-[300px]">
              <div className="flex items-center justify-between border-b border-[#303134] pb-3 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9aa0a6]">
                  Response Output
                </span>
                {output && (
                  <button
                    onClick={() => navigator.clipboard.writeText(output)}
                    className="flex items-center gap-1 text-xs text-[#8ab4f8] hover:underline"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                )}
              </div>

              {thinkingOutput && (
                <div className="mb-4 rounded-xl border border-[#9b72cb]/40 bg-[#9b72cb]/10 p-3 text-xs text-[#c58af9] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-[#9b72cb]" />
                    <span>Chain of Thought Reasoning:</span>
                  </div>
                  {thinkingOutput}
                </div>
              )}

              {output ? (
                <MarkdownRenderer content={output} />
              ) : isRunning ? (
                <div className="flex items-center justify-center py-12 text-[#9aa0a6] text-xs gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#8ab4f8]" />
                  <span>Generating response with {model}...</span>
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-[#9aa0a6]">
                  Click "Run Playground" to execute your configured system instructions and prompt.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Code Export Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-[#3c4043] bg-[#1e1f20] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#303134] px-5 py-3.5">
              <h3 className="font-semibold text-white text-sm">Export Integration Code</h3>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-[#9aa0a6] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex border-b border-[#303134] bg-[#131314] px-5 pt-2 gap-2">
              {(['ts', 'python', 'curl'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCodeLang(lang)}
                  className={`border-b-2 px-3 py-1.5 text-xs font-medium uppercase ${
                    codeLang === lang
                      ? 'border-[#8ab4f8] text-[#8ab4f8]'
                      : 'border-transparent text-[#9aa0a6] hover:text-white'
                  }`}
                >
                  {lang === 'ts' ? 'TypeScript' : lang === 'python' ? 'Python' : 'cURL'}
                </button>
              ))}
            </div>

            <div className="relative p-4 bg-[#131314] overflow-x-auto max-h-96">
              <pre className="text-xs font-mono text-[#c4c7c5] leading-relaxed">
                {getExportCode()}
              </pre>
            </div>

            <div className="flex justify-end border-t border-[#303134] p-3 bg-[#1e1f20]">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getExportCode());
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-[#8ab4f8] px-4 py-2 text-xs font-semibold text-black hover:bg-[#aecbfa]"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
