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
import { useNavigate } from "react-router-dom";
import { BASE_URL as EXTERNAL_BASE } from "../utils/constant";

/* =======================
   CONFIG
======================= */

const API_BASE: string =
  (typeof EXTERNAL_BASE !== "undefined" && EXTERNAL_BASE) ||
  "http://127.0.0.1:8000";

/* =======================
   HELPERS
======================= */

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

/* =======================
   TYPES
======================= */

type Project = {
  project_id: number;
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

/* =======================
   COMPONENT
======================= */

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

  /* =======================
     LOAD PROJECT
  ======================= */

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

  /* =======================
     API CALLS
  ======================= */

  const fetchProjectKeywords = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/keyword/fetch/${id}`);
      const data = await safeJson(res);
      if (res.ok && data?.keywords) {
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
      const res = await fetch(`${API_BASE}/papers/stats/project/${id}`);
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.detail || "Stats error");
      setStats(data);
    } catch (err: any) {
      setStatsErr(err.message);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  /* =======================
     GEMINI ANALYSIS
  ======================= */

  const analyzeWithGemini = async (file?: File | null) => {
    if (!project) throw new Error("No project");

    const userId = getUserId();
    if (!userId) {
      setAlertMsg("⚠️ User not authenticated.");
      throw new Error("Missing user_id");
    }

    setIsUploading(!!file);
    setUploadStatus(file ? "Uploading & analyzing…" : "Analyzing…");

    const formData = new FormData();
    formData.append("user_id", String(userId));
    formData.append("project_id", String(project.project_id));
    formData.append("prompt", prompt || "");
    if (file) formData.append("files", file);

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/keyword/analyze`);

      xhr.upload.onprogress = (e) => {
        if (file && e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = async () => {
        setIsUploading(false);
        if (xhr.status === 200) {
          setAlertMsg("✅ Gemini analysis completed");
          await fetchProjectKeywords(project.project_id);
          await fetchProjectStats(project.project_id);
          resolve();
        } else {
          reject(new Error("Analysis failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(formData);
    });
  };

  /* =======================
     UI HANDLERS
  ======================= */

  const handleGenerateKeywords = async () => {
    if (!prompt.trim() || !project) return;

    if (!chromeBuild) {
      try {
        setIsAnalyzing(true);
        await analyzeWithGemini(null);
        setEditable(true);
      } catch {
        setAlertMsg("❌ Gemini failed");
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    // Chrome AI fallback logic unchanged
    setKeywords(
      prompt
        .split(/\s+/)
        .filter((w) => w.length > 4)
        .slice(0, 7)
    );
    setEditable(true);
  };

  const handleSaveKeywords = async () => {
    if (!project) return;

    setIsSaving(true);
    await fetch(`${API_BASE}/keyword/manual-store`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: project.project_id,
        project_name: project.project_name,
        raw_query: prompt,
        keywords,
      }),
    });
    setEditable(false);
    setIsSaving(false);
    setAlertMsg("✅ Keywords saved");
  };

  const handleFileUpload = async (file: File) => {
    if (chromeBuild) return;
    if (file.type !== "application/pdf") return;
    await analyzeWithGemini(file);
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {alertMsg && <div className="fixed bottom-6 right-6 bg-blue-700 text-white px-4 py-3 rounded">{alertMsg}</div>}

      <h1 className="text-2xl font-bold mb-4">Keyword Workspace</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full border p-3 rounded mb-4"
        placeholder="Enter research topic..."
      />

      <button
        onClick={handleGenerateKeywords}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate Keywords
      </button>

      <div className="mt-4 flex gap-2 flex-wrap">
        {keywords.map((k, i) => (
          <span key={i} className="bg-blue-100 px-3 py-1 rounded">
            {k}
          </span>
        ))}
      </div>

      {!chromeBuild && (
        <input
          type="file"
          accept="application/pdf"
          className="mt-6"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
        />
      )}
    </div>
  );
};

export default KeywordWorkspace;
