"use client";

import { useState, useEffect } from 'react';
import { blogAPI, type Article } from '@/services/api';

interface BlogViewProps {
  colorTheme?: 'green' | 'white' | 'red' | 'yellow';
}

export default function BlogView({ colorTheme = 'green' }: BlogViewProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5;

  const themeColors = {
    green: 'text-green-400',
    white: 'text-white',
    red: 'text-red-400',
    yellow: 'text-yellow-400'
  };

  const themeColor = themeColors[colorTheme];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const result = await blogAPI.getArticles();
      setArticles(result.articles);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectArticle = async (slug: string) => {
    try {
      setLoading(true);
      const result = await blogAPI.getArticleBySlug(slug);
      setSelectedArticle(result.article);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const backToList = () => {
    setSelectedArticle(null);
  };

  // Pagination
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  if (loading && articles.length === 0) {
    return (
      <div className={`p-4 ${themeColor} font-mono`}>
        <div className="animate-pulse">Loading blog articles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 text-red-400 font-mono`}>
        <div>Error: {error}</div>
        <button 
          onClick={loadArticles}
          className="mt-2 px-4 py-1 border border-red-400 hover:bg-red-400 hover:text-black transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <div className={`p-4 sm:p-6 ${themeColor} font-mono text-xs sm:text-sm`}>
        <button 
          onClick={backToList}
          className={`mb-4 ${themeColor} hover:underline`}
        >
          ← Back to articles
        </button>

        <div className="border-t border-b border-current py-4 mb-4">
          <h1 className="text-lg sm:text-2xl font-bold mb-2">{selectedArticle.title}</h1>
          <div className="text-xs opacity-70">
            Published: {new Date(selectedArticle.published_at).toLocaleDateString()} 
            {selectedArticle.view_count && ` | ${selectedArticle.view_count} views`}
          </div>
          <div className="mt-2">
            {selectedArticle.tags.map(tag => (
              <span key={tag} className="inline-block mr-2 px-2 py-1 border border-current text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="prose prose-invert max-w-none whitespace-pre-wrap">
          {selectedArticle.content}
        </div>

        <div className="mt-8 pt-4 border-t border-current text-xs opacity-70">
          <div>Article ID: {selectedArticle.id} | Slug: {selectedArticle.slug}</div>
          <div className="mt-2">
            💡 Tip: Use terminal commands for more interactivity:<br/>
            <code className="ml-4">blog comments {selectedArticle.id}</code> - View comments<br/>
            <code className="ml-4">blog like {selectedArticle.id}</code> - Like this article
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 ${themeColor} font-mono text-xs sm:text-sm`}>
      <div className="mb-6">
        <h1 className="text-xl sm:text-3xl font-bold mb-2">
          ╔════════════════════════════════════╗
        </h1>
        <h1 className="text-xl sm:text-3xl font-bold mb-2">
          ║         BLOG ARTICLES              ║
        </h1>
        <h1 className="text-xl sm:text-3xl font-bold mb-4">
          ╚════════════════════════════════════╝
        </h1>
        <div className="opacity-70">
          {articles.length} article{articles.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="opacity-70">
          No articles published yet. Check back soon!
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {currentArticles.map((article, index) => (
              <div 
                key={article.id}
                className="border-l-2 border-current pl-4 hover:border-l-4 transition-all cursor-pointer"
                onClick={() => selectArticle(article.slug)}
              >
                <div className="text-xs opacity-50 mb-1">
                  Article #{indexOfFirstArticle + index + 1}
                </div>
                <h2 className="text-base sm:text-lg font-bold mb-2 hover:underline">
                  {article.title}
                </h2>
                <div className="text-xs opacity-70 mb-2">
                  {new Date(article.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {article.view_count && ` | ${article.view_count} views`}
                </div>
                <p className="mb-2 opacity-90">{article.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="text-xs px-2 py-1 border border-current opacity-70"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-current pt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-1 border border-current ${
                  currentPage === 1 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:bg-current hover:text-black transition'
                }`}
              >
                ← Previous
              </button>
              
              <div className="text-xs">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-1 border border-current ${
                  currentPage === totalPages 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:bg-current hover:text-black transition'
                }`}
              >
                Next →
              </button>
            </div>
          )}

          <div className="mt-6 text-xs opacity-50">
            💡 Click on any article to read it in full
          </div>
        </>
      )}
    </div>
  );
}
