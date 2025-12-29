# Blog Commands Quick Reference

## 📚 Viewing Content

| Command | Description | Example |
|---------|-------------|---------|
| `blog` | List all articles | `blog` |
| `blog list` | List all articles | `blog list` |
| `blog list -page N` | View specific page | `blog list -page 2` |
| `blog read <slug>` | Read an article | `blog read my-first-post` |
| `blog tags` | Show all tags | `blog tags` |

## 🔍 Searching & Filtering

| Command | Description | Example |
|---------|-------------|---------|
| `blog search <query>` | Search articles | `blog search javascript` |
| `blog filter -tag <tag>` | Filter by tag | `blog filter -tag web-dev` |

## 💬 Comments

| Command | Description | Example |
|---------|-------------|---------|
| `blog comments <id>` | View comments | `blog comments 1` |
| `blog comment <id> "name" email "text"` | Add comment | `blog comment 1 "John" john@email.com "Great!"` |

## ❤️ Reactions

| Command | Description | Example |
|---------|-------------|---------|
| `blog like <id>` | Toggle like | `blog like 1` |
| `blog reactions <id>` | View all reactions | `blog reactions 1` |

## ✍️ Creating Content (Auth Required)

| Command | Description | Example |
|---------|-------------|---------|
| `blog new "title" "excerpt" "content"` | Create draft | `blog new "Title" "Intro" "Content"` |
| `blog new "..." -tags tag1,tag2` | Create with tags | `blog new "Title" "Intro" "Content" -tags js,web` |
| `blog new "..." -publish` | Create & publish | `blog new "Title" "Intro" "Content" -publish` |

## 🌐 GUI Pages

- `/blog` - Blog list page
- `/blog/[slug]` - Article detail page

## 🔑 Authentication

Before creating articles, login first:
```bash
login <username> <password>
```

## 💡 Pro Tips

1. Use `↑`/`↓` arrow keys for command history
2. Article IDs are shown when you read an article
3. Comments are pending moderation by default
4. Slugs are URL-friendly versions of titles
5. Tags are case-insensitive when filtering

## 🎨 Output Features

- **Box drawing** - Clean ASCII art borders
- **Pagination** - 10 articles per page (terminal)
- **Word wrapping** - Automatic at 60 characters
- **Color coding** - Success (green), Error (red), Info (yellow)
- **Emojis** - Visual indicators for better UX

## 🐛 Common Issues

**"Article not found"**
→ Check slug with `blog list`

**"Must be logged in"**
→ Use `login <user> <pass>`

**"No articles found"**
→ Backend may be offline or database empty

---

**Quick Start:** Type `blog` to see all articles, then `blog read <slug>` to read one!
