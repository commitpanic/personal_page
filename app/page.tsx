import Terminal from "@/components/Terminal";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-2 sm:p-4">
      <div className="w-full max-w-5xl h-[95vh] sm:h-[85vh] md:h-[80vh] flex flex-col rounded-lg overflow-hidden shadow-2xl border border-gray-700">
        <Header />
        <Terminal />
      </div>
    </div>
  );
}
