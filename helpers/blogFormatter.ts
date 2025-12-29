import type { Article, Comment } from '@/services/api';

export const formatArticleList = (articles: Article[], page: number = 1, perPage: number = 10): string => {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedArticles = articles.slice(startIndex, endIndex);
  const totalPages = Math.ceil(articles.length / perPage);

  if (paginatedArticles.length === 0) {
    return 'No articles found.';
  }

  let output = '\n╔════════════════════════════════════════════════════════════╗\n';
  output += '║                      BLOG ARTICLES                         ║\n';
  output += '╚════════════════════════════════════════════════════════════╝\n\n';

  paginatedArticles.forEach((article, index) => {
    const displayNumber = startIndex + index + 1;
    const date = new Date(article.published_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const views = article.view_count ? ` | ${article.view_count} views` : '';

    output += `┌─ Article #${displayNumber} (ID: ${article.id})\n`;
    output += `│ ${article.title}\n`;
    output += `├─ Slug: ${article.slug}\n`;
    output += `├─ Published: ${date}${views}\n`;
    output += `├─ Tags: ${article.tags && article.tags.length > 0 ? article.tags.join(', ') : 'None'}\n`;
    output += `│\n`;
    output += `│ ${article.excerpt || 'No excerpt available'}\n`;
    output += `└${'─'.repeat(60)}\n\n`;
  });

  if (totalPages > 1) {
    output += `Page ${page} of ${totalPages} | Total: ${articles.length} articles\n`;
    if (page < totalPages) {
      output += `Tip: Use 'blog list -page ${page + 1}' to see more\n`;
    }
  }

  output += `\n💡 Commands:\n`;
  output += `  • blog read <slug>       - Read full article\n`;
  output += `  • blog search <query>    - Search articles\n`;
  output += `  • blog filter -tag <tag> - Filter by tag\n`;

  return output;
};

export const formatArticleDetail = (article: Article): string => {
  if (!article) {
    return '❌ Article not found.';
  }
  
  const date = article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';
  const views = article.view_count ? ` | ${article.view_count} views` : '';

  let output = '\n' + '═'.repeat(70) + '\n';
  output += `  ${(article.title || 'Untitled').toUpperCase()}\n`;
  output += '═'.repeat(70) + '\n\n';
  
  output += `📅 Published: ${date}${views}\n`;
  const tagsString = article.tags && article.tags.length > 0 
    ? (typeof article.tags[0] === 'string' ? article.tags.join(', ') : article.tags.map((t: any) => t.name || t.slug || t).join(', '))
    : 'None';
  output += `🏷️  Tags: ${tagsString}\n`;
  output += `✍️  Author: ${(article as any).author_name || article.author_id || 'Unknown'}\n\n`;
  output += '─'.repeat(70) + '\n\n';
  
  // Format article content with proper line breaks
  const formattedContent = (article.content || 'No content available')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n');
  
  output += formattedContent + '\n\n';
  output += '─'.repeat(70) + '\n\n';
  
  output += `💡 Interact:\n`;
  output += `  • blog comments ${article.id}           - View comments\n`;
  output += `  • blog comment ${article.id} <text>     - Add comment\n`;
  output += `  • blog like ${article.id}               - Toggle like\n`;
  output += `  • blog reactions ${article.id}          - View reactions\n`;

  return output;
};

export const formatSearchResults = (articles: Article[], query: string): string => {
  if (!articles || articles.length === 0) {
    return `\n🔍 No articles found matching "${query}"\n\nTry:\n  • Different keywords\n  • 'blog tags' to see available topics\n  • 'blog list' to see all articles`;
  }

  let output = `\n🔍 Search Results for "${query}"\n`;
  output += '─'.repeat(60) + '\n\n';
  output += `Found ${articles.length} article${articles.length !== 1 ? 's' : ''}\n\n`;

  articles.forEach((article, index) => {
    const date = article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'N/A';

    output += `${index + 1}. 📄 ${article.title || 'Untitled'}\n`;
    output += `   Slug: ${article.slug || 'N/A'} | ${date}\n`;
    output += `   ${article.excerpt || 'No excerpt'}\n`;
    const tagsStr = article.tags && article.tags.length > 0 
      ? (typeof article.tags[0] === 'string' ? article.tags.join(', ') : article.tags.map((t: any) => t.name || t.slug || t).join(', '))
      : 'None';
    output += `   Tags: ${tagsStr}\n\n`;
  });

  output += `\n💡 Use 'blog read <slug>' to read an article\n`;

  return output;
};

export const formatTags = (tags: string[]): string => {
  if (tags.length === 0) {
    return '\n🏷️  No tags available yet.\n';
  }

  let output = '\n╔════════════════════════════════════════════════════════════╗\n';
  output += '║                     AVAILABLE TAGS                         ║\n';
  output += '╚════════════════════════════════════════════════════════════╝\n\n';

  // Group tags in rows of 3
  const tagsPerRow = 3;
  for (let i = 0; i < tags.length; i += tagsPerRow) {
    const rowTags = tags.slice(i, i + tagsPerRow);
    output += '  ' + rowTags.map(tag => `🏷️  ${tag}`).join('    ') + '\n';
  }

  output += `\n💡 Use 'blog filter -tag <tag>' to filter articles by tag\n`;
  output += `   Example: blog filter -tag javascript\n`;

  return output;
};

export const formatComments = (comments: Comment[], articleId: number): string => {
  if (comments.length === 0) {
    return `\n💬 No comments yet. Be the first!\n\nUse: blog comment ${articleId} "Your name" your@email.com "Your comment"\n`;
  }

  let output = `\n╔════════════════════════════════════════════════════════════╗\n`;
  output += `║                COMMENTS (${comments.length})                                   ║\n`;
  output += `╚════════════════════════════════════════════════════════════╝\n\n`;

  comments.forEach((comment, index) => {
    const date = new Date(comment.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    output += `┌─ Comment #${index + 1}\n`;
    output += `│ 👤 ${comment.author_name}`;
    if (comment.status === 'pending') {
      output += ` [Pending Approval]`;
    }
    output += `\n`;
    output += `│ 📅 ${date}\n`;
    output += `│\n`;
    
    // Word wrap comment content
    const words = comment.content.split(' ');
    let line = '│ ';
    words.forEach(word => {
      if ((line + word).length > 60) {
        output += line + '\n';
        line = '│ ' + word + ' ';
      } else {
        line += word + ' ';
      }
    });
    if (line.trim().length > 1) {
      output += line + '\n';
    }
    
    output += `└${'─'.repeat(60)}\n\n`;
  });

  output += `💡 Add your comment:\n`;
  output += `   blog comment ${articleId} "Your Name" your@email.com "Your comment text"\n`;

  return output;
};

export const formatReactions = (reactions: { type: string; count: number }[], articleId: number): string => {
  if (reactions.length === 0) {
    return `\n❤️  No reactions yet. Be the first to react!\n\nUse: blog like ${articleId}\n`;
  }

  let output = `\n╔════════════════════════════════════════════════════════════╗\n`;
  output += `║                       REACTIONS                            ║\n`;
  output += `╚════════════════════════════════════════════════════════════╝\n\n`;

  const reactionEmojis: Record<string, string> = {
    like: '❤️',
    love: '💖',
    bookmark: '🔖',
    fire: '🔥',
    clap: '👏'
  };

  let totalReactions = 0;
  reactions.forEach(reaction => {
    const emoji = reactionEmojis[reaction.type] || '👍';
    output += `  ${emoji}  ${reaction.type.padEnd(15)} ${reaction.count}\n`;
    totalReactions += reaction.count;
  });

  output += `\n  Total Reactions: ${totalReactions}\n`;
  output += `\n💡 React to this article: blog like ${articleId}\n`;

  return output;
};

export const formatArticleCreated = (article: Article): string => {
  return `
✅ Article created successfully!

Title: ${article.title}
Slug: ${article.slug}
Status: ${article.published ? 'Published' : 'Draft'}
Published: ${article.published ? new Date(article.published_at).toLocaleDateString() : 'Not yet'}

💡 Commands:
  • blog read ${article.slug}    - Read your article
  • blog edit ${article.id}      - Edit this article
  • blog list                    - View all articles
`;
};

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const wrapText = (text: string, maxWidth: number = 60): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxWidth) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines;
};
