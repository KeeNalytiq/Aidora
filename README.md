# 🚀 Aidora
### *Intelligent Support at the Right Time*

> **Built for engineers, powered by AI — by Keeistu M S**

Aidora is a **production-ready, AI-powered technical support platform** that helps teams **triage, prioritize, and resolve customer issues faster**. It uses real NLP models to understand tickets, automatically assign priority and SLA targets, recommend solutions from similar past issues, and provide deep operational insights through analytics dashboards.

Designed with a **Technical Product Support Engineer (TPSE)** mindset, Aidora mirrors real-world SaaS helpdesk workflows—from ticket creation to SLA enforcement and resolution tracking.

---

## ✨ Why Aidora?

- ⚡ **Faster resolutions** with AI-driven ticket classification  
- 🎯 **Accurate prioritization** with automatic SLA calculation  
- 🧠 **Smart recommendations** using semantic similarity  
- 📊 **Real-time analytics** for SLA compliance & performance  
- 🔐 **Secure, role-based access** (Customer / Engineer / Admin)

> *Less waiting. More solving.*

---

## 🤖 Core Capabilities

- **AI Ticket Classification**  
  Automatically categorizes tickets into API, Authentication, Payment, Performance, Bug, or Feature issues and assigns priority (Critical → Low).

- **SLA Monitoring & Auto Escalation**  
  Tracks SLA timelines in real time and escalates tickets automatically when they approach breach thresholds.

- **Similar Ticket Recommendations**  
  Suggests solutions from previously resolved tickets using sentence embeddings and semantic similarity.

- **Role-Based Dashboards**  
  - **Customers** → Create & track tickets  
  - **Engineers** → Resolve, assign, collaborate  
  - **Admins** → Analytics, SLA insights, system visibility  

---
## 🧱 System Architecture

React Frontend (UI)
↓
Node.js + Express (API & Auth)
↓
Python NLP Service (spaCy + Transformers)
↓
Firebase Authentication & Firestore

Built using a microservice-based architecture for scalability, reliability, and real production workflows.

---

## 🛠 Tech Stack

**Frontend**
- React + Vite  
- Tailwind CSS (Dark Mode)  
- Recharts (Analytics)  

**Backend**
- Node.js + Express  
- Firebase Admin SDK  
- Role-Based Access Control (RBAC)  

**AI / NLP**
- Python + FastAPI  
- spaCy  
- sentence-transformers  

**Database & Auth**
- Firebase Authentication  
- Firestore (with composite indexes)  

**DevOps**
- Docker & Docker Compose  
- Health checks & structured logging  

---

## ⚙️ Quick Start (Local Setup)

```bash
# Clone the repository
git clone https://github.com/your-username/aidora.git
cd aidora

# Backend
cd backend
npm install
npm run dev

# NLP Service
cd ../nlp-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd ../frontend
npm install
npm run dev
```
## 📈 What Makes Aidora Stand Out

✔️ **Real AI-powered NLP**  
&nbsp;&nbsp;&nbsp;&nbsp;Understands tickets using NLP models — not just rule-based logic.

✔️ **SLA-driven support workflows**  
&nbsp;&nbsp;&nbsp;&nbsp;Automatically tracks, escalates, and enforces SLA commitments.

✔️ **Enterprise-grade UI/UX**  
&nbsp;&nbsp;&nbsp;&nbsp;Modern, responsive interface designed for real support teams.

✔️ **Production-ready deployment**  
&nbsp;&nbsp;&nbsp;&nbsp;Built with scalability, security, and reliability in mind.

✔️ **Support-engineering mindset**  
&nbsp;&nbsp;&nbsp;&nbsp;Designed around real Technical Product Support Engineer workflows.

> 🚀 **Not a CRUD project** — Aidora is a **real SaaS-style support platform**.

---

## 👨‍💻 Author

**Keeistu M S**  
*Built for engineers, powered by AI*

---

## 📄 License

📜 This project is licensed under the **MIT License**.
