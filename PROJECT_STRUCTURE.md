# Project Directory Structure

```
resumeiq-ai-ats-platform/
├── docker-compose.yml
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── app.js
│       ├── config/
│       │   ├── database.js
│       │   └── env.js
│       ├── controllers/
│       │   ├── analysis.controller.js
│       │   ├── auth.controller.js
│       │   └── resume.controller.js
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   ├── error.middleware.js
│       │   ├── notFound.middleware.js
│       │   ├── upload.middleware.js
│       │   └── validation.middleware.js
│       ├── routes/
│       │   ├── analysis.routes.js
│       │   ├── auth.routes.js
│       │   └── resume.routes.js
│       └── services/
│           ├── ats.service.js
│           └── parser.service.js
├── frontend/
│   ├── Dockerfile
│   └── nginx.conf
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── components/
    │   ├── LoadingSpinner.tsx
    │   ├── Navbar.tsx
    │   ├── ProgressBar.tsx
    │   ├── ProtectedRoute.tsx
    │   ├── ResumeCard.tsx
    │   ├── ScoreCircle.tsx
    │   ├── SkillBadge.tsx
    │   └── StatCard.tsx
    ├── context/
    │   ├── AuthContext.tsx
    │   └── ThemeContext.tsx
    ├── layouts/
    │   └── AppLayout.tsx
    ├── pages/
    │   ├── DashboardPage.tsx
    │   ├── JobMatchPage.tsx
    │   ├── LandingPage.tsx
    │   ├── LoginPage.tsx
    │   ├── RegisterPage.tsx
    │   ├── ResultsPage.tsx
    │   └── UploadPage.tsx
    ├── services/
    │   ├── atsAnalyzer.ts
    │   └── resumeStore.ts
    └── utils/
        └── cn.ts
```
