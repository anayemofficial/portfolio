export interface BlogComment {
  id: string;
  name: string;
  email: string;
  comment: string;
  createdAt: string;
}

export type BlogCategory =
  | 'Daily Life Updates'
  | 'Political & Social Thoughts'
  | 'Feelings & Reflections'
  | 'Tech & Code'
  | 'Project Updates'
  | 'Career & Journey';

export type BlogMood =
  | '💭 Thought'
  | '🌍 Political & Social'
  | '☕ Daily Life'
  | '🚀 Building'
  | '💡 Idea'
  | '🏆 Milestone'
  | '✨ Reflection'
  | '🔥 Perspective';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: BlogCategory;
  mood?: BlogMood;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string;
  readTime: string;
  likes: number;
  comments: BlogComment[];
  isPrivate?: boolean;
}

export const initialBlogPosts: BlogPost[] = [
  {
    id: 'post-political-1',
    slug: 'youth-leadership-transparent-tech-nation-future',
    title: 'Why Youth Leadership & Transparent Tech Matter for Our Nation\'s Future',
    excerpt: 'True systemic progress starts with accountability, meritocracy, and digital transparency. My personal thoughts on how young engineers and citizens can shape a fairer society.',
    content: `Living in Dhaka and studying software engineering, I frequently reflect on how technology intersects with national governance, society, and youth representation.

### Digital Transparency Over Bureaucracy
In any developing society, the biggest roadblocks to progress are opacity, redundant paperwork, and lack of accountability. When systems are digitized with open records and verifiable audit trails:
1. Public services become accessible to citizens without middlemen or corruption.
2. Merit replaces nepotism, allowing genuine talent to flourish.
3. Trust between the youth and civic institutions is rebuilt.

### The Role of Student & Community Leadership
Serving as President of the Daffodil Kushtia Association at DIU taught me that leadership isn't about power or titles—it's about listening to the quietest voices in the room and standing up for fairness.

Bangladesh's greatest asset has always been its young generation. We are passionate, resilient, and unapologetically visionary. As software engineers, our responsibility goes beyond writing code for profit—we have an obligation to use our skills, voices, and ethical judgment to build systems that uplift society.

I believe in a future where every young person with a dream and honest work ethic gets an equal seat at the table.`,
    coverImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
    category: 'Political & Social Thoughts',
    mood: '🌍 Political & Social',
    tags: ['Society', 'Youth Leadership', 'Governance', 'Ethics', 'Bangladesh'],
    author: {
      name: 'Abdullah Nayem',
      avatar: '/profile.jpg',
      role: 'Software Engineer & Student Leader',
    },
    publishedAt: 'Oct 29, 2026',
    readTime: '4 min read',
    likes: 82,
    comments: [
      {
        id: 'c-pol-1',
        name: 'Mahmudul Hasan',
        email: 'mahmud.diu@gmail.com',
        comment: 'Very bold and necessary words. Technology is the greatest weapon for transparency and youth empowerment.',
        createdAt: 'Oct 29, 2026',
      },
      {
        id: 'c-pol-2',
        name: 'Anika Tabassum',
        email: 'anika.policy@outlook.com',
        comment: 'Totally agree Nayem. Digital public infrastructure and ethical leadership will shape the next decade.',
        createdAt: 'Oct 30, 2026',
      },
    ],
  },
  {
    id: 'post-daily-update-1',
    slug: 'day-in-life-mirpur-diu-classes-client-code',
    title: 'A Day in the Life in Mirpur: Balancing DIU Classes, Client Deadlines & Cha',
    excerpt: 'From early morning commutes and university labs to late-evening client meetings for madx.bd. A candid look inside my daily routine as a student and full-stack developer.',
    content: `People often ask me how I manage university coursework at Daffodil International University, build live commercial client systems like madx.bd, and explore AI vision research all at once. The honest truth? It requires ruthless time-blocking and plenty of roadside milk tea (*doodh cha*).

### My Typical Daily Routine:
- **8:00 AM — Morning Kickoff**: Review GitHub notifications, plan the day's sprint tasks, and review any pending client feature requests.
- **10:00 AM to 2:00 PM — University & Labs**: Attending software architecture, database management, and machine learning lectures at DIU.
- **3:30 PM — Afternoon Recharge**: A quick walk around Mirpur, catching up with friends, and unwinding.
- **5:00 PM to 8:30 PM — Deep Client Work**: Focused coding session for madx.bd—building API routes, refining Supabase queries, and tuning frontend responsiveness.
- **10:30 PM to Midnight — Learning & Experiments**: Reading papers on Generative AI or tweaking Sketch2Design-AI wireframe algorithms.

### Finding Balance
It isn't always glamorous, and burnout is something every ambitious engineer must actively guard against. Taking a break to sit with family, pray, and appreciate how far I have come keeps me grounded.

Every day is an opportunity to build something lasting.`,
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop',
    category: 'Daily Life Updates',
    mood: '☕ Daily Life',
    tags: ['Daily Routine', 'Mirpur', 'DIU Life', 'Freelance', 'Balance'],
    author: {
      name: 'Abdullah Nayem',
      avatar: '/profile.jpg',
      role: 'Full-Stack Developer',
    },
    publishedAt: 'Oct 26, 2026',
    readTime: '3 min read',
    likes: 56,
    comments: [
      {
        id: 'c-day-1',
        name: 'Kawsar Ahmed',
        email: 'kawsar.dev@gmail.com',
        comment: 'Balancing DIU syllabus with real commercial projects is truly commendable brother! Keep it up.',
        createdAt: 'Oct 27, 2026',
      },
    ],
  },
  {
    id: 'post-daily-1',
    slug: 'late-night-thoughts-on-building-software',
    title: 'Late Night Reflections: What Building madx.bd Taught Me About Resilience',
    excerpt: 'Sometimes coding late at night brings the clearest clarity. A personal reflection on overcoming complex client challenges and finding joy in the debugging process.',
    content: `It is 1:30 AM in Mirpur, Dhaka. Looking back at the past few months of building madx.bd, I realized that software engineering is only 30% writing syntax. The remaining 70% is mental resilience, patience, and solving problems when nothing seems to work on the first try.

### The Real Highs and Lows of Building
When you're building a live commercial platform from scratch, the pressure is real. There were nights when responsive CSS broke on specific Android screen ratios, and moments when state persistence between cart and checkout felt tricky.

But then, that moment arrives: the API response is crisp, the Lighthouse score turns emerald green (98+), and the client sees their store live on the internet. That feeling makes every hour of late-night debugging worth it.

### What I Remind Myself Daily:
1. **Don't rush the foundation**: Good architecture saves you weeks of headaches later.
2. **Stay humble & keep learning**: Tech moves fast; being curious is your superpower.
3. **Enjoy the small wins**: Even resolving one tricky Supabase policy bug is progress.

To anyone reading this who is also building their dreams late at night: keep pushing. We're getting better every single day.`,
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
    category: 'Feelings & Reflections',
    mood: '✨ Reflection',
    tags: ['Daily Life', 'Reflections', 'Building madx.bd', 'Mindset'],
    author: {
      name: 'Abdullah Nayem',
      avatar: '/profile.jpg',
      role: 'Full-Stack Developer',
    },
    publishedAt: 'Oct 22, 2026',
    readTime: '3 min read',
    likes: 47,
    comments: [
      {
        id: 'c-101',
        name: 'Tanvir Hossain',
        email: 'tanvir.dev@gmail.com',
        comment: 'Relatable! Late night coding sessions with a cup of coffee hit different. Proud of your journey Nayem bro!',
        createdAt: 'Oct 23, 2026',
      },
    ],
  },
  {
    id: 'post-tech-1',
    slug: 'architecting-scalable-web-apps-nextjs-supabase',
    title: 'Architecting Scalable Web Applications with Next.js 16 and Supabase',
    excerpt: 'A deep dive into building production-grade full-stack platforms with Next.js Turbopack, server actions, and Supabase PostgreSQL with Row Level Security (RLS).',
    content: `When designing real-world commercial platforms like madx.bd, software architecture decisions made early on directly dictate developer velocity, database latency, and user experience.

### Why Next.js 16 & Supabase?
Modern web users expect instant page transitions and interactive client state without sacrificing search engine discoverability. Pairing Next.js with Supabase gives us:

1. **Server-Side Rendering (SSR) & Static Prerendering**: Instant First Contentful Paint (FCP) and optimal SEO indexing.
2. **PostgreSQL Relational Power**: ACID transactions, structured relational schemas, and complex join queries without ORM bloat.
3. **Row Level Security (RLS)**: Enforcing authorization at the database level rather than relying solely on server API middlewares.
4. **Real-time Subscriptions**: Instantly broadcasting order updates and live notifications to the client.

### Key Takeaway
Always architect with separation of concerns. Keep your frontend declarative, delegate database rules to PostgreSQL RLS, and optimize asset delivery at the edge.`,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    category: 'Tech & Code',
    mood: '🚀 Building',
    tags: ['Next.js', 'Supabase', 'PostgreSQL', 'Architecture'],
    author: {
      name: 'Abdullah Nayem',
      avatar: '/profile.jpg',
      role: 'Software Engineer',
    },
    publishedAt: 'Oct 15, 2026',
    readTime: '4 min read',
    likes: 38,
    comments: [],
  },
];
