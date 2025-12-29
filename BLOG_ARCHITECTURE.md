# Blog System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────┐    ┌─────────────────────────────┐   │
│  │   TERMINAL INTERFACE    │    │      GUI INTERFACE          │   │
│  │   (components/          │    │   (app/blog/...)            │   │
│  │    Terminal.tsx)        │    │                             │   │
│  ├─────────────────────────┤    ├─────────────────────────────┤   │
│  │ Commands:               │    │ Pages:                      │   │
│  │ • blog list             │    │ • /blog                     │   │
│  │ • blog read <slug>      │    │ • /blog/[slug]              │   │
│  │ • blog search           │    │                             │   │
│  │ • blog comments         │    │ Components:                 │   │
│  │ • blog like             │    │ • BlogView.tsx              │   │
│  │ • blog new              │    │ • Article detail page       │   │
│  │ • + 10 more...          │    │ • Comment forms             │   │
│  └─────────────────────────┘    └─────────────────────────────┘   │
│           │                               │                         │
│           └───────────────┬───────────────┘                         │
│                           ▼                                         │
└─────────────────────────────────────────────────────────────────────┘

                            │
                            ▼

┌─────────────────────────────────────────────────────────────────────┐
│                      COMMAND & LOGIC LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           helpers/commandParser.ts                           │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ • parseCommand()           - Parse user input                │  │
│  │ • executeCommand()         - Sync command execution          │  │
│  │ • executeAsyncCommand()    - Async API calls                 │  │
│  │                                                               │  │
│  │ Blog Handlers:                                                │  │
│  │ • handleBlogList()         • handleBlogRead()                │  │
│  │ • handleBlogSearch()       • handleBlogTags()                │  │
│  │ • handleBlogComments()     • handleBlogAddComment()          │  │
│  │ • handleBlogLike()         • handleBlogReactions()           │  │
│  │ • handleBlogCreate()       • handleBlogFilterByTag()         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           helpers/blogFormatter.ts                           │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ • formatArticleList()      - Pretty article listings         │  │
│  │ • formatArticleDetail()    - Full article display            │  │
│  │ • formatSearchResults()    - Search output                   │  │
│  │ • formatTags()             - Tag cloud                       │  │
│  │ • formatComments()         - Comment threads                 │  │
│  │ • formatReactions()        - Reaction counts                 │  │
│  │ • formatArticleCreated()   - Success messages                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

                            │
                            ▼

┌─────────────────────────────────────────────────────────────────────┐
│                        API SERVICE LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  services/api.ts                             │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                               │  │
│  │  blogAPI:                    commentsAPI:                    │  │
│  │  • getArticles()            • getComments()                  │  │
│  │  • getArticleBySlug()       • createComment()                │  │
│  │  • createArticle()                                           │  │
│  │  • searchArticles()         reactionsAPI:                    │  │
│  │  • getTags()                • getReactions()                 │  │
│  │                              • toggleReaction()              │  │
│  │  authAPI:                                                    │  │
│  │  • login()                  contactAPI:                      │  │
│  │  • register()               • submit()                       │  │
│  │  • logout()                                                  │  │
│  │  • getToken()                                                │  │
│  │  • isAuthenticated()                                         │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

                            │
                            ▼

┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND API                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│              http://localhost:5000/api                               │
│                                                                       │
│  ┌────────────────────┐  ┌────────────────────┐                    │
│  │   /blog/articles   │  │   /blog/comments   │                    │
│  │   /blog/search     │  │   /blog/reactions  │                    │
│  │   /blog/tags       │  │   /auth/*          │                    │
│  └────────────────────┘  └────────────────────┘                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

                            │
                            ▼

┌─────────────────────────────────────────────────────────────────────┐
│                          DATABASE                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Tables:                                                             │
│  • articles (id, title, slug, content, excerpt, tags, ...)          │
│  • comments (id, article_id, author_name, content, status, ...)     │
│  • reactions (id, article_id, user_id, reaction_type, ...)          │
│  • users (id, username, email, password_hash, ...)                  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                          DATA FLOW EXAMPLES
═══════════════════════════════════════════════════════════════════════

Example 1: Reading an Article (Terminal)
─────────────────────────────────────────
User types → "blog read my-first-post"
     │
     ├─> commandParser.parseCommand() 
     │   └─> Returns: { command: 'blog', args: ['read', 'my-first-post'] }
     │
     ├─> commandParser.executeCommand()
     │   └─> Returns: { output: '__ASYNC__blog:read:my-first-post', isAsync: true }
     │
     ├─> Terminal detects async, calls executeAsyncCommand()
     │   └─> Calls: blogAPI.getArticleBySlug('my-first-post')
     │       └─> Fetches: GET /api/blog/articles/my-first-post
     │
     ├─> blogFormatter.formatArticleDetail(article)
     │   └─> Returns beautifully formatted article text
     │
     └─> Terminal displays output with typewriter effect


Example 2: Liking an Article (GUI)
──────────────────────────────────
User clicks "Like" button on /blog/my-first-post
     │
     ├─> ArticlePage component calls handleLike()
     │   └─> Calls: reactionsAPI.toggleReaction(articleId, 'like')
     │       └─> POST /api/blog/articles/1/reactions
     │
     ├─> Backend processes, updates database
     │
     ├─> Re-fetch reactions: reactionsAPI.getReactions(articleId)
     │   └─> GET /api/blog/articles/1/reactions
     │
     └─> UI updates with new reaction count


Example 3: Creating an Article (Terminal)
─────────────────────────────────────────
User types → 'blog new "Title" "Excerpt" "Content" -tags js,web -publish'
     │
     ├─> commandParser checks: authAPI.isAuthenticated()
     │   └─> Returns true (user logged in)
     │
     ├─> commandParser.handleBlogCreate()
     │   └─> Returns: '__ASYNC__blog:create:Title:Excerpt:Content:js,web:true'
     │
     ├─> executeAsyncCommand() processes
     │   └─> Calls: blogAPI.createArticle({ title, excerpt, content, tags, published })
     │       └─> POST /api/blog/articles (with auth token)
     │
     ├─> Backend creates article, returns new article object
     │
     ├─> blogFormatter.formatArticleCreated(article)
     │   └─> Returns success message with article details
     │
     └─> Terminal displays formatted success message


Example 4: Browsing Blog (GUI)
──────────────────────────────
User navigates to /blog
     │
     ├─> BlogView component mounts
     │   └─> useEffect() calls loadArticles()
     │
     ├─> blogAPI.getArticles()
     │   └─> GET /api/blog/articles
     │
     ├─> Backend returns array of published articles
     │
     ├─> Component state updated: setArticles(result.articles)
     │
     ├─> React renders paginated list (5 per page)
     │
     └─> User sees beautiful article listing

═══════════════════════════════════════════════════════════════════════


┌─────────────────────────────────────────────────────────────────────┐
│                      KEY DESIGN PATTERNS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. Command Pattern                                                  │
│     • Commands parsed independently of execution                     │
│     • Async/sync handling separated                                  │
│                                                                       │
│  2. Formatter Pattern                                                │
│     • Presentation logic separated from business logic               │
│     • Reusable formatting functions                                  │
│                                                                       │
│  3. Service Layer Pattern                                            │
│     • API calls centralized in services/api.ts                       │
│     • Error handling at service level                                │
│                                                                       │
│  4. Component Composition                                            │
│     • BlogView reusable in multiple contexts                         │
│     • Separation of concerns (display vs. logic)                     │
│                                                                       │
│  5. Dual Interface                                                   │
│     • Terminal and GUI share same backend                            │
│     • Consistent data models across interfaces                       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  User Login                                                          │
│  ──────────                                                          │
│  1. User: "login john password123"                                   │
│  2. authAPI.login(username, password)                                │
│  3. POST /api/auth/login                                             │
│  4. Backend validates, returns { token, user }                       │
│  5. localStorage.setItem('auth_token', token)                        │
│  6. localStorage.setItem('user', JSON.stringify(user))               │
│  7. Success message displayed                                        │
│                                                                       │
│  Creating Article (Authenticated)                                    │
│  ────────────────────────────────                                    │
│  1. User: "blog new ..."                                             │
│  2. Check: authAPI.isAuthenticated() → true                          │
│  3. Get token: authAPI.getToken()                                    │
│  4. POST /api/blog/articles with header:                             │
│     Authorization: Bearer <token>                                    │
│  5. Backend validates token                                          │
│  6. Article created and returned                                     │
│  7. Success message with article details                             │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                        FILE DEPENDENCIES                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Terminal.tsx                                                        │
│      ↓ imports                                                       │
│  commandParser.ts                                                    │
│      ↓ imports                                                       │
│  ├─ blogFormatter.ts                                                 │
│  └─ api.ts                                                           │
│      ↓ imports                                                       │
│  types/api.ts                                                        │
│                                                                       │
│  ─────────────────────                                               │
│                                                                       │
│  app/blog/page.tsx                                                   │
│      ↓ imports                                                       │
│  components/BlogView.tsx                                             │
│      ↓ imports                                                       │
│  services/api.ts                                                     │
│                                                                       │
│  ─────────────────────                                               │
│                                                                       │
│  app/blog/[slug]/page.tsx                                            │
│      ↓ imports                                                       │
│  ├─ services/api.ts (blogAPI, commentsAPI, reactionsAPI)            │
│  └─ components/Header.tsx                                            │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘


Built with ❤️ using Next.js, React, TypeScript, and Tailwind CSS
Terminal aesthetic meets modern web development 🚀
