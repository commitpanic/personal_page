import BlogView from '@/components/BlogView';
import Header from '@/components/Header';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-green-400">
      <Header />
      <main className="container mx-auto max-w-4xl">
        <BlogView colorTheme="green" />
      </main>
    </div>
  );
}
