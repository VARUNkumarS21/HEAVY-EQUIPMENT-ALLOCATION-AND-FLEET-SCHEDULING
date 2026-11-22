# ConstrumindNet

**A Hybrid Spatio-Temporal Deep Learning System and Method for Multi-Horizon Heavy Equipment Allocation and Fleet Scheduling**

Capstone Project by **Varun Kumar S** (USN: ENG23RA0022), Robotics and Artificial Intelligence, Dayananda Sagar University.

---

## 🏗️ Overview

ConstrumindNet is an intelligent construction fleet dispatch and allocation management system. It combines multi-horizon spatio-temporal deep learning optimization with real-time telematics and field logistics management to minimize idle times, prevent scheduling conflicts, and optimize equipment utilization across active construction job sites.

---

## 📂 Repository Structure

```
├── app/                       # Frontend application (React, TypeScript, Vite, Tailwind CSS)
│   ├── src/                   # Source code (Components, Pages, Services, State Management)
│   └── public/                # Static assets and equipment illustrations
├── overleaf_project/          # LaTeX source files for the research publication
├── patent_project/            # Patent specification LaTeX source and documentation
├── scripts/                   # Automated report generation and publication build scripts
├── PATENT_SPECIFICATION_DOCUMENT.md  # Detailed patent claims and specifications
├── RESEARCH_PAPER_EQUIPMENT_ALLOCATION.md # Academic research paper text
└── PROJECT_REPORT_VARUN_KUMAR_S.md   # Complete Capstone Project Report
```

---

## 🚀 Getting Started

### Web Application (`app/`)

1. **Navigate to the application folder:**
   ```bash
   cd app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` and add your Gemini API key:
   ```bash
   cp .env.example .env.local
   ```
   Add:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 📄 License & Attribution

All rights reserved © Varun Kumar S. Submitted in partial fulfillment of the requirements for Bachelor of Technology in Robotics and Artificial Intelligence.
