# Blog Frontend Documentation

Complete blog system for the Personal Page Terminal application with both terminal commands and GUI interface.

---

## Features Overview

✅ **Article Management**
- List all articles with pagination
- Read individual articles
- Search articles by keyword
- Filter articles by tags
- Create new articles (authenticated users)

✅ **Comments System**
- View comments on articles
- Add comments (with name, email, content)
- Moderation status display (pending/approved)

✅ **Reactions System**
- Like articles
- View all reactions with counts
- Toggle reactions on/off

✅ **Dual Interface**
- Terminal commands for power users
- GUI pages for standard browsing
- Seamless integration between both

---

## Terminal Commands

### Viewing Articles

#### `blog` or `blog list`
List all published articles with basic information.

```bash
blog
blog list
```

#### `blog list -page N`
View a specific page of articles (10 per page).

```bash
blog list -page 2
```

**Output Format:**
```
╔════════════════════════════════════════════════════════════╗
║                      BLOG ARTICLES                         ║
╚════════════════════════════════════════════════════════════╝

┌─ Article #1
│ Getting Started with TypeScript
├─ Slug: getting-started-typescript
├─ Published: Jan 15, 2024 | 245 views
├─ Tags: typescript, javascript, programming
│
│ Learn the basics of TypeScript and why it's awesome...
└────────────────────────────────────────────────────────────

Page 1 of 3 | Total: 25 articles
```

---

### Reading Articles

#### `blog read <slug>`
Read the full content of a specific article.

```bash
blog read getting-started-typescript
```

**Output Format:**
```
══════════════════════════════════════════════════════════════════
  GETTING STARTED WITH TYPESCRIPT
══════════════════════════════════════════════════════════════════

📅 Published: January 15, 2024 | 245 views
🏷️  Tags: typescript, javascript, programming
✍️  Author ID: 1

──────────────────────────────────────────────────────────────────

[Full article content here with proper formatting...]

──────────────────────────────────────────────────────────────────

💡 Interact:
  • blog comments 1           - View comments
  • blog comment 1 <text>     - Add comment
  • blog like 1               - Toggle like
  • blog reactions 1          - View reactions
```

---

### Searching & Filtering

#### `blog search <query>`
Search for articles matching a query string.

```bash
blog search javascript
blog search "web development"
```

#### `blog tags`
View all available article tags.

```bash
blog tags
```

**Output:**
```
╔════════════════════════════════════════════════════════════╗
║                     AVAILABLE TAGS                         ║
╚════════════════════════════════════════════════════════════╝

  🏷️  javascript    🏷️  typescript    🏷️  web-development
  🏷️  react         🏷️  node          🏷️  python
```

#### `blog filter -tag <tag>`
Filter articles by a specific tag.

```bash
blog filter -tag javascript
blog filter -tag web-development
```

---

### Comments

#### `blog comments <articleId>`
View all comments on an article.

```bash
blog comments 1
```

**Output:**
```
╔════════════════════════════════════════════════════════════╗
║                COMMENTS (5)                                ║
╚════════════════════════════════════════════════════════════╝

┌─ Comment #1
│ 👤 John Doe
│ 📅 Jan 16, 2024, 10:30 AM
│
│ Great article! Really helped me understand TypeScript better.
└────────────────────────────────────────────────────────────
```

#### `blog comment <articleId> "name" email "text"`
Add a comment to an article.

```bash
blog comment 1 "John Doe" john@email.com "Great article!"
```

**Note:** Comments are pending moderation by default.

---

### Reactions

#### `blog like <articleId>`
Toggle a like on an article.

```bash
blog like 1
```

**Output:**
```
❤️  Reaction toggled successfully!

💡 Use 'blog reactions 1' to see all reactions
```

#### `blog reactions <articleId>`
View all reactions on an article.

```bash
blog reactions 1
```

**Output:**
```
╔════════════════════════════════════════════════════════════╗
║                       REACTIONS                            ║
╚════════════════════════════════════════════════════════════╝

  ❤️  like            42
  🔖  bookmark        15
  🔥  fire            8

  Total Reactions: 65
```

---

### Creating Articles (Authentication Required)

#### `blog new "title" "excerpt" "content" [-tags tag1,tag2] [-publish]`
Create a new blog article.

```bash
# Create a draft
blog new "My First Post" "A short introduction" "Full article content here" -tags javascript,web

# Create and publish immediately
blog new "Another Post" "Quick intro" "Full content" -tags typescript -publish
```

**Requirements:**
- Must be logged in (`login <username> <password>`)
- Title, excerpt, and content are required
- Tags are optional (comma-separated)
- Use `-publish` flag to publish immediately (default: draft)

**Output:**
```
✅ Article created successfully!

Title: My First Post
Slug: my-first-post
Status: Draft
Published: Not yet

💡 Commands:
  • blog read my-first-post    - Read your article
  • blog edit 5                - Edit this article
  • blog list                  - View all articles
```

---

## GUI Interface

### Blog List Page: `/blog`

**Features:**
- Clean, terminal-style design
- Paginated article list (5 per page)
- Click any article to read
- View count and tags for each article
- Responsive design

**Navigation:**
- Previous/Next page buttons
- Visual page indicator
- Hover effects on articles

### Article Detail Page: `/blog/[slug]`

**Features:**
- Full article content
- Publication date and view count
- Tag display with hover effects
- Reactions section with live counts
- Like button for quick interaction
- Comments section with:
  - All approved comments
  - Comment form (name, email, content)
  - Real-time submission
  - Moderation status display

**Comment Form:**
```
Leave a Comment

Name *
[Input field]

Email *
[Input field]

Comment *
[Textarea - 4 rows]

[Submit Comment]
```

---

## File Structure

```
personal_page/
├── app/
│   ├── blog/
│   │   ├── page.tsx                    # Blog list page
│   │   └── [slug]/
│   │       └── page.tsx                # Article detail page
│   └── page.tsx                        # Terminal home
├── components/
│   ├── BlogView.tsx                    # Reusable blog list component
│   ├── Header.tsx                      # Navigation header
│   ├── Terminal.tsx                    # Terminal interface
│   └── Output.tsx                      # Terminal output
├── helpers/
│   ├── blogFormatter.ts                # Blog formatting utilities
│   └── commandParser.ts                # Command parsing & execution
├── services/
│   └── api.ts                          # API service layer
└── types/
    ├── api.ts                          # API type definitions
    └── command.ts                      # Command type definitions
```

---

## API Integration

### Endpoints Used

**Blog Articles:**
- `GET /api/blog/articles` - List all articles
- `GET /api/blog/articles/:slug` - Get article by slug
- `POST /api/blog/articles` - Create article (auth required)
- `GET /api/blog/search?q=query` - Search articles
- `GET /api/blog/tags` - Get all tags

**Comments:**
- `GET /api/blog/articles/:id/comments` - Get comments
- `POST /api/blog/articles/:id/comments` - Add comment

**Reactions:**
- `GET /api/blog/articles/:id/reactions` - Get reactions
- `POST /api/blog/articles/:id/reactions` - Toggle reaction

---

## Formatting Features

### Article List Formatting
- Box-drawing characters for visual appeal
- Numbered articles with metadata
- Excerpt preview (truncated if too long)
- Tags display
- Pagination info and tips

### Article Detail Formatting
- Full-width header with title
- Metadata bar (date, views, author)
- Tag badges
- Content with preserved line breaks
- Interactive command suggestions

### Comments Formatting
- Border-left design for visual hierarchy
- Author name with emoji icon
- Timestamp formatting
- Word-wrapped content (60 char width)
- Status indicators (pending/approved)

### Reactions Formatting
- Emoji-based reaction types
- Count display per reaction type
- Total reactions summary
- Call-to-action for interaction

---

## Usage Examples

### Complete Workflow

1. **Browse articles:**
   ```bash
   blog list
   ```

2. **Read an interesting article:**
   ```bash
   blog read getting-started-typescript
   ```

3. **Check comments:**
   ```bash
   blog comments 1
   ```

4. **Add your own comment:**
   ```bash
   blog comment 1 "Jane Smith" jane@email.com "Thanks for this tutorial!"
   ```

5. **Like the article:**
   ```bash
   blog like 1
   ```

6. **Search for related content:**
   ```bash
   blog search typescript
   ```

7. **Filter by tag:**
   ```bash
   blog filter -tag javascript
   ```

### Creating Content (Authenticated)

1. **Login:**
   ```bash
   login admin password123
   ```

2. **Create article:**
   ```bash
   blog new "Understanding Async/Await" "Deep dive into async programming" "Full tutorial content here..." -tags javascript,async,promises -publish
   ```

3. **Verify creation:**
   ```bash
   blog list
   blog read understanding-async-await
   ```

---

## Responsive Design

### Mobile (< 640px)
- Single column layout
- Reduced padding
- Smaller font sizes (text-xs)
- Touch-friendly buttons
- Hidden navigation in header

### Desktop (≥ 640px)
- Multi-column where appropriate
- Larger fonts (text-sm)
- Visible navigation menu
- Hover effects enabled
- Wider content area

---

## Tips & Best Practices

### For Users

1. **Use tab completion** (when available) for commands
2. **Use arrow keys** (↑/↓) for command history
3. **Bookmark favorite articles** using the GUI
4. **Search before browsing** if looking for specific topics
5. **Filter by tags** to discover related content

### For Content Creators

1. **Always preview** articles before publishing
2. **Use descriptive slugs** for better SEO
3. **Add relevant tags** for discoverability
4. **Write compelling excerpts** (shows in listings)
5. **Format content** with proper line breaks

### For Developers

1. **Use formatters** in `blogFormatter.ts` for consistency
2. **Handle errors gracefully** in async commands
3. **Validate input** before API calls
4. **Cache results** where appropriate
5. **Test pagination** with various data sizes

---

## Future Enhancements

Potential additions:
- [ ] Markdown support in articles
- [ ] Article editing interface
- [ ] Article deletion (admin only)
- [ ] Comment moderation commands
- [ ] More reaction types (love, fire, bookmark)
- [ ] Article drafts management
- [ ] Author profiles
- [ ] Article categories
- [ ] RSS feed generation
- [ ] Social sharing buttons
- [ ] Reading time estimation
- [ ] Related articles suggestions
- [ ] Article bookmarking for users
- [ ] Email notifications for comments
- [ ] Syntax highlighting for code blocks

---

## Troubleshooting

### "Article not found"
- Check the slug is correct (use `blog list` to see slugs)
- Ensure article is published
- Try searching: `blog search <keyword>`

### "Must be logged in"
- Use: `login <username> <password>`
- Verify credentials are correct
- Check session hasn't expired

### "Comment pending approval"
- Comments require moderation by default
- Admin must approve via API or admin panel
- This is normal behavior

### No articles showing
- Ensure backend API is running
- Check API connection (http://localhost:5000)
- Verify articles exist in database
- Check browser console for errors

---

## Performance Considerations

- **Pagination:** Articles loaded 10 at a time (terminal) or 5 (GUI)
- **Lazy loading:** Comments/reactions loaded on-demand
- **Caching:** Consider implementing for frequently accessed articles
- **Debouncing:** Search should debounce input (future enhancement)

---

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- High contrast terminal theme
- Screen reader friendly labels
- Focus indicators on interactive elements

---

## Security Notes

- Comments require email (not displayed publicly)
- XSS protection via React's built-in escaping
- Authentication tokens stored in localStorage
- CORS configured for API access
- Input validation on all forms

---

**Version:** 1.0.0  
**Last Updated:** December 29, 2025  
**Maintained by:** Kuba (SP3FCK)
