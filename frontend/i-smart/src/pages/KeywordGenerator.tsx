import React, { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle,
  Sparkles,
  Save,
  ArrowDownCircle,
  Plus,
  X,
  Upload,
  RefreshCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ For navigation
import { BASE_URL as EXTERNAL_BASE } from "../utils/constant";

const API_BASE: string =
  (typeof EXTERNAL_BASE !== "undefined" && EXTERNAL_BASE) ||
  "http://127.0.0.1:8000";

async function safeJson(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
const getUserId = (): number => {
  try {
    const raw =
      sessionStorage.getItem("user") ||
      localStorage.getItem("user");

    if (!raw) return 0;

    const user = JSON.parse(raw);
    return Number(user.user_id) || 0;
  } catch {
    return 0;
  }
};

type Project = {
  project_id: number;
  user_id?: number; // ✅ added so we can send an integer user_id
  project_name?: string;
  raw_query?: string;
};

type ProjectStats = {
  project_id: number;
  project_name: string;
  total_papers: number;
  analyzed_papers: number;
  unanalyzed_papers: number;
};

const KeywordWorkspace: React.FC = () => {
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsErr, setStatsErr] = useState<string | null>(null);

  const [prompt, setPrompt] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [editable, setEditable] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  const [chromeBuild, setChromeBuild] = useState(true);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // 🧩 Load selected project from localStorage
  useEffect(() => {
    const projectId = localStorage.getItem("selectedProjectId");
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const selected = projects.find(
      (p: any) => p.project_id.toString() === projectId
    );
    if (selected) {
      setProject(selected);
      setPrompt(selected.raw_query || "");
      fetchProjectKeywords(selected.project_id);
      fetchProjectStats(selected.project_id);
    }
  }, []);

  const fetchProjectKeywords = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/keyword/fetch/${id}`);
      const data = await safeJson(res);
      if (res.ok && data?.keywords?.length) {
        setKeywords(data.keywords);
        setEditable(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjectStats = async (id: number) => {
    try {
      setStatsLoading(true);
      setStatsErr(null);
      const res = await fetch(`${API_BASE}/papers/stats/project/${id}`, {
        headers: { accept: "application/json" },
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.detail || "Failed to fetch stats");
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setStatsErr(err.message || "Error loading stats");
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  // 🔁 Shared Gemini analysis (with or without file)
//   const analyzeWithGemini = async (file?: File | null): Promise<void> => {
//     if (!project) {
//       setAlertMsg("⚠️ Please select a project first.");
//       throw new Error("No project selected");
//     }

//     try {
//       setIsUploading(!!file);
//       if (!file) {
//         setUploadStatus("Analyzing with Gemini...");
//       } else {
//         setUploadProgress(0);
//         setUploadStatus("Uploading & analyzing...");
//       }

//       const formData = new FormData();

//       // ✅ Backend expects integer user_id & project_id (as strings in form-data)
//       // const userId = project.user_id ?? 0; // fallback to 0 if not present
//       const userId = getUserId();

// if (!userId) {
//   setAlertMsg("⚠️ User not authenticated.");
//   throw new Error("Missing user_id");
// }

//       formData.append("user_id", String(userId));
//       formData.append("project_id", String(project.project_id));
//       formData.append("prompt", prompt || "");

//       // files is optional – only append when present
//       if (file) {
//         formData.append("files", file);
//       }

//       await new Promise<void>((resolve, reject) => {
//         const xhr = new XMLHttpRequest();
//         xhr.open("POST", `${API_BASE}/keyword/analyze`);

//         xhr.upload.onprogress = (e) => {
//           if (e.lengthComputable && file) {
//             const percent = Math.round((e.loaded / e.total) * 100);
//             setUploadProgress(percent);
//           }
//         };

//         xhr.onload = async () => {
//           setIsUploading(false);
//           if (xhr.status === 200) {
//             setUploadStatus(
//               file ? "✅ Upload and analysis complete!" : "✅ Analysis complete!"
//             );
//             setAlertMsg("✅ Gemini analysis finished. Keywords updated from server.");
//             try {
//               await fetchProjectKeywords(project.project_id);
//               await fetchProjectStats(project.project_id);
//             } catch (e) {
//               console.error("Post-analysis refresh failed", e);
//             }
//             resolve();
//           } else {
//             setUploadStatus("❌ Analysis failed.");
//             setAlertMsg("❌ Server error while analyzing with Gemini.");
//             reject(new Error(`Status ${xhr.status}`));
//           }
//         };

//         xhr.onerror = () => {
//           setIsUploading(false);
//           setUploadStatus("❌ Network error.");
//           setAlertMsg("❌ Network error while calling Gemini analysis.");
//           reject(new Error("Network error"));
//         };

//         xhr.send(formData);
//       });
//     } catch (err) {
//       console.error(err);
//       setIsUploading(false);
//       setUploadStatus("❌ Analysis failed.");
//       if (!alertMsg) {
//         setAlertMsg("❌ Unexpected error during Gemini analysis.");
//       }
//       throw err;
//     }
//   };
const analyzeWithGemini = async (file?: File | null): Promise<void> => {
  if (!project) {
    setAlertMsg("⚠️ Please select a project first.");
    throw new Error("No project selected");
  }

  try {
    setIsUploading(!!file);
    setUploadStatus(file ? "Uploading & analyzing..." : "Analyzing with Gemini...");

    const formData = new FormData();

    // ✅ FIXED: user_id comes from session/local storage
    const userId = getUserId();
    if (!userId) {
      setAlertMsg("⚠️ User not authenticated.");
      throw new Error("Missing user_id");
    }

    formData.append("user_id", String(userId));
    formData.append("project_id", String(project.project_id));
    formData.append("prompt", prompt || "");

    if (file) {
      formData.append("files", file);
    }

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/keyword/analyze`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && file) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = async () => {
        setIsUploading(false);
        if (xhr.status === 200) {
          setUploadStatus(
            file ? "✅ Upload and analysis complete!" : "✅ Analysis complete!"
          );
          setAlertMsg("✅ Gemini analysis finished. Keywords updated from server.");
          await fetchProjectKeywords(project.project_id);
          await fetchProjectStats(project.project_id);
          resolve();
        } else {
          setUploadStatus("❌ Analysis failed.");
          setAlertMsg("❌ Server error while analyzing with Gemini.");
          reject(new Error(`Status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setUploadStatus("❌ Network error.");
        setAlertMsg("❌ Network error while calling Gemini analysis.");
        reject(new Error("Network error"));
      };

      xhr.send(formData);
    });
  } catch (err) {
    console.error(err);
    setIsUploading(false);
    setUploadStatus("❌ Analysis failed.");
    throw err;
  }
};

  // 🧠 Keyword generation using Chrome or Gemini backend
  const handleGenerateKeywords = async () => {
    if (!prompt.trim() || !project) {
      setAlertMsg("⚠️ Enter a valid research prompt first.");
      return;
    }

    // ⚡ Gemini Mode → always hit /keyword/analyze (even without file)
    if (!chromeBuild) {
      try {
        setIsAnalyzing(true);
        setAlertMsg("⚡ Sending prompt to Gemini for keyword extraction…");
        await analyzeWithGemini(null); // no file, just prompt
        // Keywords are refreshed from backend
        setEditable(true);
      } catch (err: any) {
        console.error(err);
        setAlertMsg("❌ Failed to generate keywords via Gemini.");
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    // 🧠 Chrome Build Mode (local AI / heuristic)
    try {
      setIsAnalyzing(true);
      setAlertMsg("🧠 Generating domain-specific keywords… please wait.");

      let result = "";
      const start = performance.now();

      // ✅ Chrome Prompt API
      if ("ai" in self && (self as any).ai?.prompt) {
        const session = await (self as any).ai.prompt.create({
          output: { type: "text", language: "en" },
        });
        const keywordPrompt = `
          You are an expert research assistant.
          Analyze the topic and extract only the most domain-specific and relevant scientific keywords.

          Guidelines:
          - Provide a maximum of 7 keywords (fewer are fine).
          - Include only precise, topic-related terms.
          - Exclude generic or broad words like "growth", "development", "yield", "biomass", or "physiology".
          - Focus on terminology relevant to the specific field, experiment type, or measurement methods.
          - Output only the keywords separated by commas — no extra text.

          Topic: "${prompt}"
        `;
        result = await session.prompt(keywordPrompt);
      }

      // 🔁 Chrome LanguageModel fallback
      else if ("LanguageModel" in self) {
        const model = await (self as any).LanguageModel.create({
          expectedInputs: [{ type: "text", languages: ["en"] }],
          output: { type: "text", language: "en" },
        });
        const keywordPrompt = `
          Generate up to 7 research-specific keywords directly relevant to this topic.
          Exclude general or unrelated terms.
          Only output keywords separated by commas.

          Topic: "${prompt}"
        `;
        result = await model.prompt(keywordPrompt);
      }

      // 🧠 Heuristic fallback
      else {
        const words = prompt
          .replace(/[^\w\s]/g, "")
          .split(/\s+/)
          .filter((w) => w.length > 4)
          .slice(0, 7);
        result = words.join(", ");
      }

      const end = performance.now();
      const timeTaken = ((end - start) / 1000).toFixed(2);

      const extracted = result
        .split(/[,;\n]/)
        .map((x) => x.trim())
        .filter((x) => x.length > 1)
        .slice(0, 7);

      setKeywords(extracted);
      setEditable(true);
      setAlertMsg(`✅ Keywords generated in ${timeTaken}s. You can edit before saving.`);
    } catch (err: any) {
      console.error(err);
      setAlertMsg("❌ Failed to generate keywords: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveKeywords = async () => {
    if (!project) return;
    try {
      setIsSaving(true);
      const payload = {
        project_id: project.project_id,
        project_name: project.project_name || "Untitled",
        raw_query: prompt,
        keywords,
      };
      await fetch(`${API_BASE}/keyword/manual-store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setEditable(false);
      setAlertMsg("✅ Keywords saved successfully!");
    } catch (err) {
      console.error(err);
      setAlertMsg("❌ Failed to save keywords.");
    } finally {
      setIsSaving(false);
    }
  };

  // 📂 Upload PDF (Gemini Mode only, still hits /keyword/analyze)
  const handleFileUpload = async (selectedFile: File) => {
    // 🚫 Chrome Build Mode should not upload
    if (chromeBuild) {
      setAlertMsg("⚠️ Upload is only available in Gemini Mode.");
      return;
    }

    if (!project) {
      setAlertMsg("⚠️ Please select a project first.");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setAlertMsg("⚠️ Only PDF files are supported.");
      return;
    }

    try {
      await analyzeWithGemini(selectedFile);
    } catch {
      // analyzeWithGemini already sets alerts
    }
  };

  const handleAddKeyword = () => {
    const word = newKeyword.trim();
    if (word && !keywords.includes(word)) {
      setKeywords([...keywords, word]);
      setNewKeyword("");
    }
  };

  const handleDeleteKeyword = (i: number) =>
    setKeywords(keywords.filter((_, idx) => idx !== i));

  const AlertBox = ({ msg }: { msg: string }) => (
    <div className="fixed bottom-6 right-6 bg-blue-700 text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50">
      {msg}
    </div>
  );

  // 🧭 Navigate to Fetch Papers Page
  const handleFetchPapers = () => {
    navigate("/app/fetch");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-14 pb-16 px-4 space-y-8">
      {alertMsg && <AlertBox msg={alertMsg} />}

      {/* 🔘 Mode Toggle */}
      <div className="w-full max-w-4xl flex justify-end items-center gap-3 pr-2">
        <span className="text-gray-700 font-medium text-sm">
          {chromeBuild ? "🧠 Chrome Build Mode" : "⚡ Gemini Mode"}
        </span>
        <button
          onClick={() => setChromeBuild(!chromeBuild)}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
            chromeBuild ? "bg-green-600" : "bg-gray-400"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              chromeBuild ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm text-gray-600">
          Mode: {chromeBuild ? "Local Chrome AI" : "Gemini Cloud API"}
        </span>
      </div>

      {/* 🧩 Project Header */}
      {project && (
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl shadow-md p-6 w-full max-w-4xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{project.project_name}</h1>
              <p className="text-blue-100 text-sm mt-1">
                Project ID: {project.project_id}
              </p>
            </div>
            <div className="flex items-center bg-white/20 px-3 py-1.5 rounded-md">
              <CheckCircle className="h-4 w-4 mr-2 text-white" />
              <span className="text-sm font-medium">Active Analyzer</span>
            </div>
          </div>
        </div>
      )}

      {/* 📊 Stats */}
      {project && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total Papers</p>
            <p className="text-2xl font-semibold text-gray-900">
              {statsLoading ? "…" : stats?.total_papers ?? "—"}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Analyzed Papers</p>
            <p className="text-2xl font-semibold text-green-700">
              {statsLoading ? "…" : stats?.analyzed_papers ?? "—"}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Unanalyzed Papers</p>
                <p className="text-2xl font-semibold text-amber-700">
                  {statsLoading ? "…" : stats?.unanalyzed_papers ?? "—"}
                </p>
              </div>
              <button
                onClick={() => project && fetchProjectStats(project.project_id)}
                disabled={statsLoading}
                title={statsErr || "Refresh stats"}
                className="flex items-center text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
              >
                <RefreshCcw className="h-3 w-3 mr-1" />
                {statsLoading ? "…" : "Refresh"}
              </button>
            </div>
            {statsErr && <p className="mt-2 text-xs text-red-600">{statsErr}</p>}
          </div>
        </div>
      )}

      {/* 🧠 Research Prompt + Upload */}
      <div
        className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-full max-w-4xl ${
          !chromeBuild ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""
        }`}
      >
        {/* Prompt */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Research Prompt
          </h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your research topic..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 min-h-[130px]"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleGenerateKeywords}
              disabled={isAnalyzing}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium ${
                isAnalyzing
                  ? "bg-gray-300 text-gray-600"
                  : "bg-blue-700 hover:bg-blue-800 text-white"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Keywords</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Upload PDF (Gemini Mode) */}
        {!chromeBuild && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload Research Document (PDF)
            </h3>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <Upload className="h-8 w-8 mb-2 text-blue-600" />
                <p className="text-sm text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Only PDF files allowed
                </p>
              </div>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
                className="hidden"
              />
            </label>
            {isUploading && (
              <div className="w-full mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-700 mt-2">{uploadStatus}</p>
              </div>
            )}
            {!isUploading && uploadStatus && (
              <p className="text-sm mt-3 text-gray-700">{uploadStatus}</p>
            )}
          </div>
        )}
      </div>

      {/* 🧩 Keywords */}
      <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-6 w-full max-w-4xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Keywords
        </h3>

        {keywords.length === 0 ? (
          <p className="text-sm text-gray-500">No keywords yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-3">
            {keywords.map((word, i) => (
              <div
                key={i}
                className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <span>{word}</span>
                {editable && (
                  <button
                    onClick={() => handleDeleteKeyword(i)}
                    className="ml-1 text-blue-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {editable && (
          <>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                placeholder="Add new keyword"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleAddKeyword}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSaveKeywords}
                disabled={isSaving}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium ${
                  isSaving
                    ? "bg-gray-300 text-gray-600"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Keywords
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* 🧭 Fetch Papers Button */}
      {keywords.length > 0 && !editable && (
        <div className="w-full max-w-4xl flex justify-end">
          <button
            onClick={handleFetchPapers}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium shadow"
          >
            <ArrowDownCircle className="h-5 w-5" />
            Fetch Papers
          </button>
        </div>
      )}
    </div>
  );
};

export default KeywordWorkspace;
