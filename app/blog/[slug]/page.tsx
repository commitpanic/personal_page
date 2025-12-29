"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { blogAPI, commentsAPI, reactionsAPI, type Article, type Comment } from '@/services/api';
import Header from '@/components/Header';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<{ type: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const [articleResult, commentsResult, reactionsResult] = await Promise.all([
        blogAPI.getArticleBySlug(slug),
        blogAPI.getArticleBySlug(slug).then(r => commentsAPI.getComments(r.article.id)),
        blogAPI.getArticleBySlug(slug).then(r => reactionsAPI.getReactions(r.article.id))
      ]);
      
      setArticle(articleResult.article);
      setComments(commentsResult.comments);
      setReactions(reactionsResult.reactions);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      await commentsAPI.createComment(
        article.id,
        commentForm.name,
        commentForm.email,
        commentForm.content
      );
      
      setSubmitMessage({ 
        type: 'success', 
        text: 'Comment submitted successfully! It will appear after moderation.' 
      });
      setCommentForm({ name: '', email: '', content: '' });
      
      // Reload comments
      const commentsResult = await commentsAPI.getComments(article.id);
      setComments(commentsResult.comments);
    } catch (err: any) {
      setSubmitMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!article) return;

    try {
      await reactionsAPI.toggleReaction(article.id, 'like');
      const reactionsResult = await reactionsAPI.getReactions(article.id);
      setReactions(reactionsResult.reactions);
    } catch (err: any) {
      console.error('Failed to toggle like:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-green-400">
        <Header />
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 font-mono">
          <div className="animate-pulse">Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-950 text-green-400">
        <Header />
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 font-mono">
          <div className="text-red-400 mb-4">Error: {error || 'Article not found'}</div>
          <button 
            onClick={() => router.push('/blog')}
            className="px-4 py-2 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition"
          >
            ← Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-green-400">
      <Header />
      
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 font-mono text-xs sm:text-sm">
        {/* Back button */}
        <button 
          onClick={() => router.push('/blog')}
          className="mb-6 text-green-400 hover:underline"
        >
          ← Back to all articles
        </button>

        {/* Article header */}
        <article>
          <div className="border-t-2 border-b-2 border-green-400 py-6 mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold mb-4">{article.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-xs opacity-70 mb-4">
              <span>
                📅 {new Date(article.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {article.view_count && <span>👁️ {article.view_count} views</span>}
              <span>✍️ Author #{article.author_id}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-3 py-1 border border-green-400 text-xs hover:bg-green-400 hover:text-black transition cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Article content */}
          <div className="prose prose-invert prose-green max-w-none mb-12 whitespace-pre-wrap leading-relaxed">
            {article.content}
          </div>
        </article>

        {/* Reactions */}
        <div className="border-t border-green-400 pt-6 mb-8">
          <h2 className="text-lg font-bold mb-4">❤️ Reactions ({totalReactions})</h2>
          
          {reactions.length > 0 ? (
            <div className="flex flex-wrap gap-4 mb-4">
              {reactions.map(reaction => (
                <div key={reaction.type} className="flex items-center gap-2">
                  <span className="text-xl">
                    {reaction.type === 'like' ? '❤️' : '👍'}
                  </span>
                  <span>{reaction.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="opacity-70 mb-4">No reactions yet. Be the first!</div>
          )}

          <button
            onClick={handleLike}
            className="px-4 py-2 border border-green-400 hover:bg-green-400 hover:text-black transition"
          >
            ❤️ Like this article
          </button>
        </div>

        {/* Comments section */}
        <div className="border-t border-green-400 pt-6">
          <h2 className="text-lg font-bold mb-6">💬 Comments ({comments.length})</h2>

          {/* Comment form */}
          <form onSubmit={handleCommentSubmit} className="mb-8 border border-green-400 p-4">
            <h3 className="font-bold mb-4">Leave a Comment</h3>
            
            {submitMessage && (
              <div className={`mb-4 p-2 border ${
                submitMessage.type === 'success' 
                  ? 'border-green-400 text-green-400' 
                  : 'border-red-400 text-red-400'
              }`}>
                {submitMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-xs">Name *</label>
                <input
                  type="text"
                  value={commentForm.name}
                  onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                  required
                  className="w-full bg-gray-900 border border-green-400 px-3 py-2 text-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs">Email *</label>
                <input
                  type="email"
                  value={commentForm.email}
                  onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                  required
                  className="w-full bg-gray-900 border border-green-400 px-3 py-2 text-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs">Comment *</label>
                <textarea
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  required
                  rows={4}
                  className="w-full bg-gray-900 border border-green-400 px-3 py-2 text-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
                  placeholder="Share your thoughts..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-400 text-black font-bold hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting ? 'Submitting...' : 'Submit Comment'}
              </button>
            </div>
          </form>

          {/* Comments list */}
          {comments.length === 0 ? (
            <div className="opacity-70">No comments yet. Be the first to comment!</div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div 
                  key={comment.id} 
                  className={`border-l-2 border-green-400 pl-4 py-2 ${
                    comment.status === 'pending' ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-bold">👤 {comment.author_name}</span>
                    <span className="text-xs opacity-50">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                    {comment.status === 'pending' && (
                      <span className="text-xs border border-yellow-400 text-yellow-400 px-2">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="opacity-90">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Terminal tip */}
        <div className="mt-12 pt-6 border-t border-green-400 text-xs opacity-50">
          💡 <strong>Terminal users:</strong> You can also interact via commands:
          <div className="mt-2 ml-4 space-y-1">
            <div><code>blog comments {article.id}</code> - View comments</div>
            <div><code>blog comment {article.id} "Name" email@example.com "Your comment"</code> - Add comment</div>
            <div><code>blog like {article.id}</code> - Toggle like</div>
          </div>
        </div>
      </main>
    </div>
  );
}
