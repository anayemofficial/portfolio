export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  detailedOverview: string;
  problem: string;
  solution: string;
  role: string;
  category: 'Full-Stack' | 'AI / Data Science' | 'Concept';
  projectType?: 'Client Project' | 'Personal Project' | 'Academic Research' | 'Product Concept';
  techStack: string[];
  features: string[];
  developmentProcess: string[];
  challenges: string[];
  currentStatus: 'Live Platform' | 'Completed Project' | 'Research Project' | 'Product Concept';
  liveUrl?: string;
  githubUrl?: string;
  image?: string;
  badge?: string;
  isFlagship?: boolean;
}

export interface SkillCategory {
  category: string;
  description: string;
  skills: { name: string; icon: string; highlighted?: boolean }[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  deliverables: string[];
}

export interface TimelineItem {
  id: string;
  period: string;
  title: string;
  institutionOrContext: string;
  description: string;
  highlights: string[];
  category: 'Education' | 'Development' | 'AI/Data Science';
}

export interface Certification {
  title: string;
  issuer: string;
  date?: string;
  description?: string;
  certificateUrl?: string;
}

export interface LeadershipRole {
  role: string;
  organization: string;
}

export interface PortfolioData {
  personal: {
    name: string;
    fullName: string;
    title: string;
    subTitle: string;
    shortPositioning: string;
    statusBadge: string;
    avatarUrl: string;
    bio: string;
    summary: string;
    location: string;
    university: string;
    degree: string;
    cgpa: string;
    coreAreas: string[];
    cvUrl: string;
    languages: { name: string; proficiency: string }[];
    socials: {
      github: string;
      linkedin: string;
      fiverr: string;
      email: string;
      phone: string;
      facebook: string;
      instagram: string;
    };
  };
  skills: SkillCategory[];
  projects: Project[];
  services: Service[];
  timeline: TimelineItem[];
  education: {
    degrees: {
      title: string;
      institution: string;
      period: string;
      result: string;
    }[];
    focusAreas: string[];
    description: string;
  };
  certifications: Certification[];
  leadership: LeadershipRole[];
}

export const portfolioData: PortfolioData = {
  personal: {
    name: 'Abdullah Nayem',
    fullName: 'MD ABDULLAH AL NAYEM',
    title: 'Software Engineer | Full-Stack Developer | Data Science Enthusiast',
    subTitle: 'Full-Stack Developer building scalable web applications and intelligent digital experiences.',
    shortPositioning: 'Software Engineer • Full-Stack • Data Science & AI',
    statusBadge: 'Available for freelance & software engineering roles',
    avatarUrl: '/profile.jpg',
    location: 'Mirpur, Dhaka, Bangladesh',
    bio: 'Software Engineering graduate from Daffodil International University with a strong foundation in full-stack development and data science. Experienced in building web applications and backend systems using Python, JavaScript/TypeScript, React, Node.js, and Supabase. Combines technical problem-solving with proven leadership experience.',
    summary: 'Software Engineering graduate from Daffodil International University with a strong foundation in full-stack development and data science. Experienced in building web applications and backend systems using Python, JavaScript/TypeScript, React, Node.js, and Supabase. Combines technical problem-solving with proven leadership experience and is eager to contribute to a dynamic, innovation-driven team.',
    university: 'Daffodil International University',
    degree: 'B.Sc. in Software Engineering',
    cgpa: '3.10 / 4.00',
    coreAreas: [
      'Full-Stack Web Development',
      'Frontend Development (React, Next.js, Vite)',
      'Backend Systems & REST APIs (Node.js, Express)',
      'Data Science & Analytics (Pandas, Power BI)',
      'Machine Learning & Generative AI',
      'Database & Cloud Architecture (Supabase, PostgreSQL, MySQL)',
    ],
    cvUrl: '/cv',
    languages: [
      { name: 'English', proficiency: 'Fluent (Reading, Writing, Speaking)' },
      { name: 'Bengali', proficiency: 'Native' },
    ],
    socials: {
      github: 'https://github.com/anayemofficial',
      linkedin: 'https://www.linkedin.com/in/md-abdullah-al-nayem/',
      fiverr: 'https://www.fiverr.com/anayem_official',
      email: 'anayem.official@gmail.com',
      phone: '+880 1915-174425',
      facebook: 'https://www.facebook.com/nayem.abdullah01',
      instagram: 'https://www.instagram.com/na__yem_/',
    },
  },

  skills: [
    {
      category: 'Programming Languages',
      description: 'Core languages for algorithm development, backend logic, and data analysis.',
      skills: [
        { name: 'Python', icon: 'Terminal', highlighted: true },
        { name: 'JavaScript', icon: 'FileCode', highlighted: true },
        { name: 'TypeScript', icon: 'FileJson', highlighted: true },
        { name: 'Java', icon: 'Code2' },
        { name: 'C', icon: 'Code2' },
      ],
    },
    {
      category: 'Web Technologies',
      description: 'Modern, fast client interfaces, server frameworks, and build tooling.',
      skills: [
        { name: 'React.js', icon: 'Atom', highlighted: true },
        { name: 'Next.js', icon: 'Zap', highlighted: true },
        { name: 'TypeScript', icon: 'FileJson', highlighted: true },
        { name: 'Node.js', icon: 'Server', highlighted: true },
        { name: 'Express.js', icon: 'Cpu', highlighted: true },
        { name: 'Tailwind CSS', icon: 'LayoutGrid', highlighted: true },
        { name: 'Vite', icon: 'Zap' },
        { name: 'HTML5 & CSS3', icon: 'Palette' },
      ],
    },
    {
      category: 'Data Science & Analytics',
      description: 'Data processing, visualization, predictive modeling, and business intelligence.',
      skills: [
        { name: 'Data Analysis', icon: 'BarChart2', highlighted: true },
        { name: 'Data Visualization', icon: 'LineChart', highlighted: true },
        { name: 'Power BI', icon: 'BarChart2', highlighted: true },
        { name: 'Web Scraping', icon: 'Globe' },
        { name: 'Microsoft Excel', icon: 'Table' },
        { name: 'Pandas & NumPy', icon: 'Binary' },
        { name: 'Scikit-learn', icon: 'Brain' },
        { name: 'PyTorch', icon: 'Activity' },
      ],
    },
    {
      category: 'Databases & Backend BaaS',
      description: 'Real-time database architecture, PostgreSQL relational models, and BaaS storage.',
      skills: [
        { name: 'Supabase', icon: 'Database', highlighted: true },
        { name: 'PostgreSQL', icon: 'HardDrive', highlighted: true },
        { name: 'MySQL', icon: 'Table' },
      ],
    },
    {
      category: 'Tools & Platforms',
      description: 'Developer tools, version control, and system troubleshooting.',
      skills: [
        { name: 'Git & GitHub', icon: 'Github', highlighted: true },
        { name: 'VS Code', icon: 'Laptop' },
        { name: 'Postman', icon: 'Send' },
        { name: 'Microsoft Office Suite', icon: 'Laptop' },
        { name: 'Hardware & OS Troubleshooting', icon: 'Box' },
      ],
    },
  ],

  projects: [
    {
      id: 'madx-bd',
      title: 'MADX — E-Commerce Platform',
      tagline: '★ FLAGSHIP PROJECT — Live Client Commercial Platform',
      description: 'Developed a commercial e-commerce platform for a client with a modern frontend, backend APIs, database integration, and e-commerce functionality.',
      detailedOverview: 'madx.bd is my flagship commercial project—a full-scale e-commerce digital platform engineered to deliver speed, user engagement, and resilient server-side rendering. It combines an intuitive product catalog layout with real-time cart state management, Node.js API routing, and high Lighthouse performance optimization.',
      problem: 'Traditional commercial client stores suffered from slow mobile page rendering times, unoptimized image assets, and poor checkout conversion flow.',
      solution: 'Engineered a Next.js server-side rendered application integrated with Express.js REST APIs, indexed product search, and responsive Tailwind CSS grid layouts.',
      role: 'Lead Full-Stack Architect & Developer (Client Project) — Built frontend Next.js architecture, Node.js API routing, database schemas, and UX design.',
      category: 'Full-Stack',
      projectType: 'Client Project',
      techStack: ['React', 'Next.js', 'Node.js', 'Express.js', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'REST API'],
      features: [
        'Live client commercial store with fast indexed product search and filtering',
        'Responsive mobile-first interface optimized across 320px to 1920px viewports',
        'Node.js REST API server handling product catalog payloads & orders',
        'Client shopping cart state management & secure checkout flow',
        'Optimized page asset rendering resulting in high Lighthouse speed scores',
        'Structured modular component design system built for scale',
      ],
      developmentProcess: [
        'Client requirement mapping and structural wireframe prototyping',
        'Frontend Next.js app architecture setup with Tailwind CSS design tokens',
        'Backend Express REST API route integration and validator middleware',
        'End-to-end mobile responsiveness and performance auditing',
      ],
      challenges: [
        'Optimizing heavy media asset loading on low-bandwidth mobile networks using Next.js image optimization.',
        'Structuring reliable client shopping cart state persistence across page navigation.',
      ],
      currentStatus: 'Live Platform',
      liveUrl: 'https://madx.bd',
      githubUrl: 'https://github.com/anayemofficial/madx.bd',
      badge: 'Flagship Commercial Project',
      isFlagship: true,
    },
    {
      id: 'krishi-gold',
      title: 'Krishi Gold — Rice Business Website',
      tagline: 'Professional Food Brand & Product Showcase Web Experience',
      description: 'Designed and developed a professional rice business website for a client, featuring a premium brand presentation, product showcase, and business-focused web experience.',
      detailedOverview: 'Krishi Gold (krishigold.com) is a corporate and product web platform developed for a leading Bangladeshi rice manufacturing, processing, and packaging enterprise. Engineered with Next.js and Tailwind CSS, the platform delivers a fast, responsive, and multilingual brand experience showcasing premium rice varieties, industrial processing operations in Kushtia, and corporate wholesale inquiry channels.',
      problem: 'The client required an authoritative, high-speed digital web presence to showcase multiple consumer rice varieties, highlight modern milling and sorting processing plants, and capture B2B wholesale inquiries.',
      solution: 'Engineered a high-performance Next.js application with English and Bengali localization, responsive product catalog showcases, industrial process storytelling, and dedicated corporate inquiry channels.',
      role: 'Lead Frontend & Web Developer (Client Project) — Designed layout architecture, UI components, responsive layout systems, and multi-language support.',
      category: 'Full-Stack',
      projectType: 'Client Project',
      techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vercel', 'Responsive Design'],
      features: [
        'Multilingual brand experience supporting English and Bengali locales',
        'Comprehensive product showcase highlighting premium rice varieties (Miniket, Nazirshail, Chinigura, Basmati)',
        'Interactive manufacturing process walkthrough detailing paddy sourcing, milling, sorting, and packaging',
        'Corporate wholesale and distributor inquiry channels with business contact integration',
        'Next.js Server-Side Rendering (SSR) with high-performance responsive image delivery',
        'Mobile-optimized responsive design tailored for viewports from mobile to 4K displays',
      ],
      developmentProcess: [
        'Client discovery and brand requirement analysis for the agro-food industry',
        'Design prototyping focusing on brand credibility, packaging visuals, and product specifications',
        'Next.js component implementation with Tailwind CSS utility architecture',
        'Localization integration and cross-device performance testing',
      ],
      challenges: [
        'Balancing rich, high-resolution product imagery with fast mobile loading speeds through Next.js responsive image pipelines.',
        'Implementing clean multi-language layout switching without content shift or layout regressions.',
      ],
      currentStatus: 'Live Platform',
      liveUrl: 'https://krishigold.com',
      badge: 'Client Commercial Project',
    },
    {
      id: 'nayem-portfolio',
      title: 'Abdullah Nayem — Personal Portfolio',
      tagline: 'Modern Software Engineering Portfolio & Database-Backed Micro-Blog',
      description: 'Designed and developed my personal portfolio to showcase my professional profile, technical skills, projects, education, experience, and contact information.',
      detailedOverview: 'A high-performance personal portfolio and engineering platform (anayem.com) built with Next.js 16, React 19, TypeScript, and Tailwind CSS. Beyond a static showcase, it incorporates a production-grade micro-blog powered by Supabase PostgreSQL with Row Level Security (RLS), atomic stored procedures for duplicate-proof visitor likes, Upstash Redis distributed rate limiting, and an ATS-friendly printable CV system.',
      problem: 'Static developer portfolios often lack architectural depth, interactive backend validation, secure content management, and verifiable full-stack functionality.',
      solution: 'Engineered an end-to-end full-stack portfolio integrating an authoritative Supabase PostgreSQL database, stateless REST client architecture, double-submit CSRF protection, Upstash Redis sliding-window rate limiting, and a dynamic blog management engine.',
      role: 'Lead Software Engineer & Designer (Personal Project) — Designed complete UX/UI, engineered Next.js 16 application, configured Supabase PostgreSQL database, and implemented multi-layer security architecture.',
      category: 'Full-Stack',
      projectType: 'Personal Project',
      techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Redis', 'Zod'],
      features: [
        'Comprehensive professional profile detailing skills, projects case studies, education, and experience',
        'Authoritative Supabase PostgreSQL micro-blog with relational posts, comments, and like tracking',
        'Atomic like counter via PostgreSQL stored procedure (increment_post_like) with visitor HMAC hashing',
        'Enterprise security controls: HMAC session tokens, double-submit CSRF, and timing-safe passcode verification',
        'Distributed sliding-window rate limiting powered by Upstash Redis with fail-closed production safeguards',
        'ATS-optimized printable curriculum vitae (/cv) with instant browser-to-PDF print rendering',
        'Strict Content-Security-Policy (CSP), 2-year HSTS, and nosniff security headers',
      ],
      developmentProcess: [
        'UX/UI concept design emphasizing modern developer aesthetic, dark mode glassmorphism, and responsive layout',
        'Next.js 16 App Router implementation with modular TypeScript component architecture',
        'Supabase PostgreSQL database schema design with table-level privilege revocations and RLS policies',
        'Comprehensive automated test suite implementation with 168 passing verification checks',
      ],
      challenges: [
        'Ensuring zero downtime migration from legacy JSON storage to authoritative PostgreSQL with fail-closed production guards.',
        'Implementing duplicate-proof atomic like increments under concurrent visitor traffic using PostgreSQL stored procedures.',
      ],
      currentStatus: 'Live Platform',
      liveUrl: 'https://anayem.com',
      githubUrl: 'https://github.com/anayemofficial/portfolio',
      badge: 'Full-Stack & PostgreSQL',
    },
    {
      id: 'sketch2design-ai',
      title: 'Sketch2Design-AI',
      tagline: 'AI-Powered Sketch-to-UI Code Conversion Engine',
      description: 'An AI-powered sketch-to-UI conversion application that transforms hand-drawn wireframes into usable front-end code, built with React, TypeScript, and Vite.',
      detailedOverview: 'Sketch2Design-AI leverages generative computer vision and machine learning models to analyze hand-drawn UI wireframe sketches and automatically generate clean, production-ready React component code. Built with React, TypeScript, and Vite for lightning-fast rendering.',
      problem: 'Manual translation of hand-drawn paper wireframes into front-end code is slow, repetitive, and prone to UI alignment inconsistencies during rapid prototyping.',
      solution: 'Engineered an end-to-end AI vision pipeline that ingests sketch uploads, detects UI elements (buttons, inputs, cards), and outputs structured React & TypeScript code.',
      role: 'Lead AI & Full-Stack Developer — Built sketch parser pipeline, Vite + React UI editor, and code generator.',
      category: 'AI / Data Science',
      projectType: 'Personal Project',
      techStack: ['React', 'TypeScript', 'Vite', 'Generative AI', 'Computer Vision', 'Tailwind CSS'],
      features: [
        'AI vision model transforming paper sketches into live front-end components',
        'Interactive real-time component code preview and editor interface',
        'Export generated UI code in clean React & TypeScript syntax',
        'Responsive layout component parsing algorithm',
        'Lightweight build architecture powered by Vite',
      ],
      developmentProcess: [
        'Dataset curation and sketch UI component classification model setup',
        'Vite + React frontend interface development with live code view',
        'Integration of Generative AI vision endpoint for layout parsing',
        'Testing sketch variance handling across different drawing styles',
      ],
      challenges: [
        'Accurately parsing ambiguous hand-drawn layout boundaries and mapping them to responsive CSS grid components.',
        'Ensuring sub-second code generation speed for instant user feedback.',
      ],
      currentStatus: 'Completed Project',
      githubUrl: 'https://github.com/anayemofficial/Sketch2Design-AI',
      badge: 'Generative AI & Vision',
    },
    {
      id: 'photo-hub',
      title: 'Photo Hub',
      tagline: 'Web-Based Photo Gallery & Media Management System',
      description: 'Built a web-based photo gallery and management system with user authentication, backend APIs, and Supabase-based data storage.',
      detailedOverview: 'Photo Hub is a full-stack photo management application built using JavaScript, Node.js, and Supabase. It features secure user registration and login, media asset uploading to Supabase Storage, photo metadata tagging, and fast indexed gallery views in PostgreSQL.',
      problem: 'Handling secure user session authorization and fast image metadata queries without gallery rendering lag.',
      solution: 'Engineered an Express & Node.js backend with Supabase Auth & PostgreSQL storage integration for rapid image lookups.',
      role: 'Full-Stack Developer — Built REST API, user authentication, Supabase database storage, and gallery UI.',
      category: 'Full-Stack',
      projectType: 'Personal Project',
      techStack: ['JavaScript', 'Node.js', 'Express.js', 'Supabase', 'PostgreSQL', 'REST API'],
      features: [
        'User registration, login, and secure session management via Supabase',
        'Image upload and asset storage in Supabase Cloud Storage',
        'Responsive photo grid gallery with tag filtering and search',
        'RESTful API endpoints with Row Level Security (RLS)',
        'Clean PostgreSQL database schema design',
      ],
      developmentProcess: [
        'Supabase PostgreSQL schema setup for users, photos, tags, and collections',
        'Express REST API route implementation with Supabase Auth middleware',
        'Frontend UI integration using responsive gallery layout grids',
      ],
      challenges: [
        'Enforcing strict Row Level Security (RLS) policies on protected Supabase storage buckets.',
      ],
      currentStatus: 'Completed Project',
      githubUrl: 'https://github.com/anayemofficial/Photo-Hub',
      badge: 'Full-Stack API & Supabase',
    },
    {
      id: 'scientific-calculator',
      title: 'Scientific Calculator',
      tagline: 'Python GUI Calculator & Function Graph Plotting',
      description: 'Developed a GUI-based scientific calculator with Tkinter, supporting advanced mathematical operations and graph plotting.',
      detailedOverview: 'A feature-rich desktop software application built in Python using the Tkinter GUI library. Supports standard algebraic calculations, trigonometric and logarithmic functions, memory operations, and dynamic mathematical graph visualization.',
      problem: 'Basic desktop calculators lack integrated 2D function plotting capabilities and intuitive scientific notation views.',
      solution: 'Built a Python desktop GUI integrating mathematical parser logic with Matplotlib/Tkinter canvas plotting.',
      role: 'Software Developer — Programmed math parser, GUI layout, keyboard bindings, and plotting module.',
      category: 'Full-Stack',
      projectType: 'Personal Project',
      techStack: ['Python', 'Tkinter', 'Matplotlib', 'NumPy', 'GUI Architecture'],
      features: [
        'Scientific math operations: sin, cos, tan, log, powers, roots, factorials',
        'Dynamic 2D function graph plotting directly on Tkinter canvas',
        'Keypad click and physical keyboard input event handling',
        'Memory store/recall registers and calculation history log',
      ],
      developmentProcess: [
        'Mathematical expression evaluator and token parser design',
        'Tkinter window layout and custom button grid styling',
        'Graphing engine integration using NumPy array calculations',
      ],
      challenges: [
        'Safely evaluating complex nested mathematical expressions without runtime syntax exceptions.',
      ],
      currentStatus: 'Completed Project',
      githubUrl: 'https://github.com/anayemofficial/Scientific-Calculator',
      badge: 'Python GUI & Math Engine',
    },
    {
      id: 'skin-disease-classification',
      title: 'Privacy-Preserving Skin Disease Classification Using Federated Learning and Explainable Artificial Intelligence',
      tagline: 'Undergraduate Thesis — Federated Learning (Flower) & Explainable AI (Grad-CAM)',
      description: 'Undergraduate thesis research developing a privacy-preserving medical image classification framework across distributed client nodes using Federated Learning and Explainable AI.',
      detailedOverview: 'Final year undergraduate thesis at Daffodil International University (Supervised by Ms. Tapushe Rabaya Toma, Assistant Professor). The research addresses patient privacy vulnerabilities in centralized medical AI training by evaluating distributed deep learning architectures across 12,684 clinical images spanning 10 dermatological conditions. Centralized MobileNetV2 achieved 97.75% classification accuracy. Federated implementations using the Flower (FLWR) framework across 3 client nodes achieved 65.76% accuracy under IID data distribution (FedAvg) and 62.61% under statistical heterogeneity (Non-IID using FedProx with proximal regularization to combat client drift). Explainable AI via Grad-CAM generates heatmaps validating that feature attributions align with clinical lesion pathology.',
      problem: 'Centralized healthcare AI models require pooling sensitive patient medical imagery into single servers, introducing severe data privacy, GDPR/HIPAA compliance risks, and vulnerability to statistical client drift across hospital nodes.',
      solution: 'Constructed a distributed Federated Learning framework with Flower (FLWR) utilizing MobileNetV2 backbones, comparing FedAvg and FedProx across IID and Non-IID client distributions, integrated with Grad-CAM visual explainability.',
      role: 'Undergraduate Researcher (Author) — Designed federated client-server architecture, preprocessed 10-class dermatological dataset, implemented FedAvg/FedProx pipelines in Flower, and generated Grad-CAM interpretability heatmaps.',
      category: 'AI / Data Science',
      projectType: 'Academic Research',
      techStack: ['Python', 'TensorFlow', 'MobileNetV2', 'Flower (FLWR)', 'FedAvg', 'FedProx', 'Grad-CAM', 'Scikit-learn'],
      features: [
        '10-class dermatological classification across 12,684 images (Acne, Cellulitis, Eczema, Psoriasis, Scabies, etc.)',
        'Centralized MobileNetV2 benchmark achieving 97.75% accuracy (97.80% precision, 97.75% recall, 97.66% F1-score)',
        'Distributed Federated Learning architecture simulated across 3 decentralized client nodes using Flower (FLWR)',
        'IID evaluation: FedAvg achieved 65.76% accuracy; FedProx achieved 63.45% accuracy without raw data sharing',
        'Non-IID heterogeneous evaluation: FedProx achieved 62.61% accuracy, outperforming FedAvg (58.61%) by penalizing local drift',
        'Explainable AI (XAI) with Grad-CAM generating visual saliency heatmaps on last convolutional layers to verify lesion focus',
        'Conducted strictly in a controlled laboratory experimental setting (academic evaluation, not clinically deployed)',
      ],
      developmentProcess: [
        'Curated and standardized 12,684 clinical images across 10 disease categories with normalization pipelines',
        'Benchmarked centralized deep learning backbones (CNN, ResNet50, EfficientNetB0, MobileNetV2)',
        'Constructed Flower federated simulation orchestrating 3 client nodes under IID and Dirichlet Non-IID partitions',
        'Tuned FedProx proximal regularization parameter (mu) to stabilize weight updates against client drift',
        'Implemented Grad-CAM visualization pipeline extracting gradients from MobileNetV2 feature maps',
      ],
      challenges: [
        'Mitigating significant client drift caused by non-identical class distributions (Non-IID) across decentralized clients using FedProx proximal regularization.',
        'Preserving model generalizability under communication-constrained federated rounds without transmitting raw patient imagery.',
      ],
      currentStatus: 'Research Project',
      githubUrl: 'https://github.com/anayemofficial/Skin-Disease-Classification',
      badge: 'Undergraduate Thesis (DIU)',
    },
    {
      id: 'health-super-app',
      title: 'Health Super App',
      tagline: 'Comprehensive Digital Healthcare Platform Architecture',
      description: 'A concept for a comprehensive digital healthcare platform connecting patients, doctors, hospitals, appointments, medical records, AI assistance, and pharmacy services.',
      detailedOverview: 'Health Super App is a full-scale healthcare platform architecture concept designed to stream communication between patients, physicians, and medical institutions. It models end-to-end workflows from instant doctor discovery and appointment booking to encrypted digital health record access and AI health triage assistance.',
      problem: 'Fragmented healthcare portals, slow appointment scheduling, and disjointed medical history access for patients and healthcare providers.',
      solution: 'Designed a unified multi-tenant platform architecture separating Patient, Doctor, Hospital, and Pharmacy modules with centralized API routing.',
      role: 'System Architect & Developer — Formulated platform data models, user roles, workflow diagrams, and UI component hierarchy.',
      category: 'Concept',
      projectType: 'Product Concept',
      techStack: ['React', 'Next.js', 'Node.js', 'Supabase', 'System Architecture', 'UI/UX Concept'],
      features: [
        'Multi-role authentication model (Patient, Doctor, Hospital Admin, Pharmacy)',
        'Appointment booking & doctor availability scheduling workflow',
        'Centralized digital medical history and prescription records model',
        'Conceptual AI triage health assistant integration schema',
        'Hospital discovery, clinic directory, and pharmacy ordering workflow',
      ],
      developmentProcess: [
        'Architectural mapping of domain entities and state interactions',
        'Wireframing multi-dashboard views for patient and physician personas',
      ],
      challenges: [
        'Structuring complex nested appointment state transitions.',
      ],
      currentStatus: 'Product Concept',
      githubUrl: 'https://github.com/anayemofficial/Health-Super-App-Concept',
      badge: 'System Architecture Concept',
    },
  ],

  services: [
    {
      id: 'full-stack',
      title: 'Full-Stack Web Development',
      description: 'End-to-end web applications crafted from responsive user interfaces to resilient database integrations and server architectures.',
      icon: 'Layers',
      deliverables: [
        'Single Page & Multi Page Next.js Applications',
        'Client & Server-side Rendering Optimization',
        'Supabase & PostgreSQL Backend Connectivity',
        'Scalable & Maintainable Code Architecture',
      ],
    },
    {
      id: 'frontend',
      title: 'Frontend Development',
      description: 'Modern, fluid, and high-performance interfaces built with React, Next.js, TypeScript, Vite, and Tailwind CSS.',
      icon: 'Layout',
      deliverables: [
        'Pixel-perfect responsive design across all viewports',
        'Clean component composition & reusable design systems',
        'Smooth micro-interactions & Framer Motion animations',
        'WCAG accessibility & performance tuning',
      ],
    },
    {
      id: 'backend',
      title: 'Backend Development & APIs',
      description: 'Secure, fast backend services, RESTful API endpoints, Supabase authentication flows, and structured data handling.',
      icon: 'Server',
      deliverables: [
        'RESTful API architecture & Express.js server setup',
        'Supabase Auth & session-based secure authentication',
        'Database modelling with Supabase, PostgreSQL, & MySQL',
        'Data validation & robust error handling',
      ],
    },
    {
      id: 'data-science',
      title: 'Data Science & Analytics',
      description: 'Transforming raw datasets into actionable insights through statistical analysis, feature engineering, and Power BI visualization.',
      icon: 'BarChart2',
      deliverables: [
        'Data cleaning, manipulation & visualization with Pandas/NumPy',
        'Power BI & Microsoft Excel dashboard reporting',
        'Web scraping data collection pipelines',
        'Supervised & unsupervised machine learning model training',
      ],
    },
    {
      id: 'ai-vision',
      title: 'Generative AI & Computer Vision',
      description: 'Developing intelligent vision pipelines, sketch-to-code converters, and deep learning models.',
      icon: 'Brain',
      deliverables: [
        'Sketch2Design-AI wireframe-to-code generation models',
        'PyTorch & Torchvision deep learning pipelines',
        'Image preprocessing, normalization & augmentation',
        'Databricks & Generative AI literacy concepts',
      ],
    },
    {
      id: 'website-dev',
      title: 'Website & E-Commerce Development',
      description: 'Custom, professional websites and e-commerce stores tailored for businesses, startups, and personal brands.',
      icon: 'Globe',
      deliverables: [
        'Live client websites & commercial platforms (MADX, Krishi Gold)',
        'SEO-optimized, search-engine ready page structure',
        'Ultra-fast load times & mobile-first responsiveness',
        'Interactive contact forms & social integrations',
      ],
    },
  ],

  timeline: [
    {
      id: 'education-diu',
      period: '2022 – 2026',
      title: 'Bachelor of Science (B.Sc.) in Software Engineering',
      institutionOrContext: 'Daffodil International University (CGPA: 3.10 / 4.00)',
      description: 'Completed comprehensive software engineering degree focused on software design paradigms, data science, algorithms, web technologies, and machine learning.',
      highlights: [
        'CGPA: 3.10 / 4.00',
        'Former President of Daffodil Kushtia Association',
        'Former Active Member of Data Science Lab & Software Engineering Club',
      ],
      category: 'Education',
    },
    {
      id: 'hsc-education',
      period: '2020',
      title: 'Higher Secondary Certificate (HSC)',
      institutionOrContext: 'Kushtia Government Central College (GPA: 5.00 / 5.00)',
      description: 'Achieved top academic distinction with perfect GPA in Science curriculum.',
      highlights: ['GPA: 5.00 / 5.00', 'Science Stream Distinction'],
      category: 'Education',
    },
    {
      id: 'ssc-education',
      period: '2018',
      title: 'Secondary School Certificate (SSC)',
      institutionOrContext: 'Police Lines School & College, Kushtia (GPA: 4.83 / 5.00)',
      description: 'Strong foundation in secondary science studies and computer science fundamentals.',
      highlights: ['GPA: 4.83 / 5.00'],
      category: 'Education',
    },
    {
      id: 'jsc-education',
      period: '2015',
      title: 'Junior School Certificate (JSC)',
      institutionOrContext: 'Police Lines School & College, Kushtia (GPA: 5.00 / 5.00)',
      description: 'Graduated junior secondary with top academic distinction and perfect GPA.',
      highlights: ['GPA: 5.00 / 5.00', 'Academic Distinction'],
      category: 'Education',
    },
    {
      id: 'psc-education',
      period: '2012',
      title: 'Primary School Certificate (PSC)',
      institutionOrContext: 'Primary Education Board, Kushtia (GPA: 5.00 / 5.00)',
      description: 'Completed primary education curriculum with perfect GPA distinction.',
      highlights: ['GPA: 5.00 / 5.00', 'Perfect Score'],
      category: 'Education',
    },
    {
      id: 'fullstack-dev',
      period: 'Continuous Practice',
      title: 'Full-Stack Development & Client Engineering',
      institutionOrContext: 'MADX, Krishi Gold, Sketch2Design-AI, Portfolio',
      description: 'Architecting end-to-end applications using React, Next.js, Vite, Node.js, Express, Supabase, and Python.',
      highlights: [
        'Developing live client commercial platforms (MADX, Krishi Gold)',
        'Built AI-powered Sketch2Design-AI sketch-to-UI converter',
        'Engineered full-stack Photo Hub gallery with Supabase auth & PostgreSQL',
      ],
      category: 'Development',
    },
  ],

  education: {
    degrees: [
      {
        title: 'Bachelor of Science (B.Sc.) in Software Engineering',
        institution: 'Daffodil International University',
        period: '2022 – 2026',
        result: 'CGPA: 3.10 / 4.00',
      },
      {
        title: 'Higher Secondary Certificate (HSC)',
        institution: 'Kushtia Government Central College',
        period: '2020',
        result: 'GPA: 5.00 / 5.00',
      },
      {
        title: 'Secondary School Certificate (SSC)',
        institution: 'Police Lines School & College, Kushtia',
        period: '2018',
        result: 'GPA: 4.83 / 5.00',
      },
      {
        title: 'Junior School Certificate (JSC)',
        institution: 'Police Lines School & College, Kushtia',
        period: '2015',
        result: 'GPA: 5.00 / 5.00',
      },
      {
        title: 'Primary School Certificate (PSC)',
        institution: 'Primary Education Board, Kushtia',
        period: '2012',
        result: 'GPA: 5.00 / 5.00',
      },
    ],
    focusAreas: [
      'Software Architecture & System Engineering',
      'Full-Stack Web Development (React, Next.js, Node.js, Supabase)',
      'Data Science & Analytics (Pandas, Power BI, Web Scraping)',
      'Artificial Intelligence & Generative AI Vision Models',
      'Database Management Systems (Supabase, PostgreSQL, MySQL)',
      'Programming Paradigms (Python, Java, JavaScript, C, TypeScript)',
    ],
    description: 'Academic background rigorously structured around building resilient software systems, mastering software engineering paradigms, and developing data-driven and AI solutions.',
  },

  certifications: [
    {
      title: '37th National Science & IT Project Exhibition',
      issuer: 'District Administration, Kushtia & Ministry of Science and Technology',
      date: '2016',
      description: 'Award of recognition for presenting an innovative science and technology project at the 37th National Science & IT Week Fair.',
    },
    {
      title: '3rd Inter-School Letter Festival (Chithi Utshab)',
      issuer: 'Bangladesh Rural Journalist Society (BRJS) & Kushtia Journalists Union',
      date: '2015',
      description: 'Certificate of excellence representing Police Lines School & College in creative writing and journalism at the Kangal Harinath Memorial Festival.',
    },
    {
      title: 'Data Analysis with Python',
      issuer: 'Cognitive Class — IBM',
      description: 'Professional certification in data analysis methodologies, Pandas dataframes, and statistical evaluation.',
    },
    {
      title: 'Python for Data Analysis',
      issuer: 'Professional Training',
      description: 'Comprehensive training covering NumPy arrays, data manipulation pipelines, and exploratory data analysis.',
    },
    {
      title: 'Databricks for Generative AI',
      issuer: 'Databricks',
      description: 'Specialized certification covering generative AI workflows and large-scale model data processing.',
    },
    {
      title: 'Generative AI Literacy',
      issuer: 'AI Literacy Program',
      description: 'Fundamental and advanced principles of generative AI architectures and prompt engineering.',
    },
    {
      title: 'Mindful Resilience',
      issuer: 'JCI Dhaka United, Moshal Mental Health & PUSAB (DIU)',
      description: 'Collaborative training on emotional resilience, peer-to-peer support, mindfulness, and personal well-being.',
    },
  ],

  leadership: [
    {
      role: 'Former President',
      organization: 'Daffodil Kushtia Association — Daffodil International University',
    },
    {
      role: 'Former Active Member',
      organization: 'Data Science Lab — Daffodil International University',
    },
    {
      role: 'Former Active Member',
      organization: 'Software Engineering Club — Daffodil International University',
    },
  ],
};
