![React](https://img.shields.io/badge/Frontend-React-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![Azure OpenAI](https://img.shields.io/badge/AI-Azure%20OpenAI-purple)

# 🧠 i-Smart ScholAR

*AI-powered research assistant that turns hours of literature review into minutes*

**🚀 Built for Dev_dash 2026 Hackathon**

---

## ❓ Problem Statement
Academic literature review is time-consuming and overwhelming due to the rapid growth of research publications. Students and researchers spend hours discovering relevant papers, summarizing content, and synthesizing insights manually.

**i-Smart ScholAR** addresses this by providing an AI-powered research assistant that automates discovery, summarization, and synthesis in a single platform.

---

## 📘 Overview

**i-Smart ScholAR** is an intelligent academic assistant that helps researchers and students **discover, analyze, and summarize** research papers using AI.
It integrates **Azure OpenAI (GPT-4o)** and **LangChain** to automate research workflows — from **keyword generation** to **literature review synthesis** — all within an interactive web app.

---

## 👨‍💻 My Contribution
Built the entire project end-to-end including:
- **Frontend:** React + Tailwind CSS
- **Backend:** FastAPI + LangChain
- **AI Integration:** Azure OpenAI (GPT-4o)
- **UI/UX Design:** Targeted for researcher efficiency

---

## 🤖 AI Usage Disclosure
This project uses **Azure OpenAI (GPT-4o)** for:
- Keyword generation from user prompts and PDF text.
- Comprehensive paper summarization.
- Intelligent synthesis of literature reviews across multiple papers.

---

## ⚡ Key Features

* ✅ AI-based **keyword generation** from prompts or PDFs
* ✅ **Smart paper discovery & ranking** by relevance
* ✅ **Instant summaries and insights** using Azure OpenAI
* ✅ **Automated literature review** with GPT-4o
* ✅ **Report export** in Markdown or PDF
* ✅ Modern and responsive web interface

---

## 🧠 Core Technologies

| Layer                   | Tools / Frameworks                  |
| ----------------------- | ----------------------------------- |
| 💻 **Frontend**         | React.js, Vite, TailwindCSS         |
| ⚙️ **Backend**          | FastAPI, LangChain                  |
| 🧩 **AI Models / APIs** | Azure OpenAI (GPT-4o)               |
| 🗄️ **Database**        | MySQL                               |
| 🌐 **External API**     | OpenAlex (for research papers)      |

---

## 🏗️ System Architecture

![Architecture](./images/arch2.jpg)

**Flow:**

1. React frontend interacts with FastAPI backend via REST.
2. Backend integrates:

   * 🧠 **Azure OpenAI** → Summarization, literature synthesis, and keyword generation
   * 🔗 **LangChain** → Chaining and context handling
   * 🗄️ **MySQL** → Project data and metadata storage

---

## 🧩 Core Modules

### 1️⃣ Project Dashboard

![Dashboard](./images/project.png)
Manage and view all your research projects in a centralized list. Easily create, edit, and switch between different research topics.

---

### 2️⃣ Keyword Discovery

![Keyword Generator](./images/keyword.png)
Generate research keywords and explore in-project tools that help you identify the best search terms for your literature.

---

### 3️⃣ Paper Collection

![Paper List](./images/show_papers.png)
Access the full list of discovered research papers. Each paper is automatically ranked and categorized for easier management.

---

### 4️⃣ Paper Insights

![Paper Detail](./images/paper.png)
Explore the individual details of each paper. This view provides AI-extracted summaries, key findings, and detailed metadata to help you understand the paper's core contributions at a glance.

---

### 5️⃣ Literature Review & Analysis

![Literature Review](./images/literature_review.png)
Synthesize your research into a professional review. This module automatically analyzes uploaded papers to identify **key insights**, **strengths**, and **weaknesses**, streamlining the academic synthesis process.

---

## ⚙️ Setup Guide

### 🧩 Prerequisites

* 🐍 Python **3.9+**
* 🧱 Node.js **18+**
* 🐬 MySQL installed and running

---

### 🔐 Environment Variables

Create a `.env` file in the **backend** directory.

**Backend `.env`:**

```env
# --------------------------
# 🔐 API KEYS & AUTH (AZURE OPENAI)
# --------------------------
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint_here
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# 📧 CONTACT EMAIL (for OpenAlex/Crossref User-Agent)
CONTACT_EMAIL=your_email@example.com

# --------------------------
# 🗄️ DATABASE CONFIGURATION
# --------------------------
DB_HOST=your_db_host_here
DB_PORT=4000
DB_USER=your_db_user_here
DB_PASSWORD=your_db_password_here
DB_DATABASE=your_db_database_name_here

# --------------------------
# ⚙️ APP SETTINGS
# --------------------------
APP_PORT=8000
```

---

## 🚀 Running Locally

### 1) Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

* FastAPI will start at: **[http://localhost:8000](http://localhost:8000)**
* Docs: **[http://localhost:8000/docs](http://localhost:8000/docs)**

### 2) Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

* Vite dev server runs at (default): **[http://localhost:5173](http://localhost:5173)**

---

## 🔮 Future Scope
- **AI Engine Enhancement:** Continuous improvement of the core AI logic for deeper reasoning.
- **Source Expansion:** Adding more data sources and journals to the paper discovery pipeline.
- **Paid Journal Access:** Integrating authentication for access to subscription-based academic journals.
- **Multi-language Support:** Enabling the UI and AI analysis for researchers across the globe.
- **Collaboration Tools:** Multi-user workspaces and PDF annotation features.

---

## 🙌 Acknowledgements

* **Dev_dash 2026 Hackathon** for the opportunity to innovate
* **Azure OpenAI** for powerful language modeling
* **LangChain** for robust AI application development
* **FastAPI** & **React** for the modern stack

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---
