import Terminal from "@/components/Terminal";
import Header from "@/components/Header";
import QrzMapPanel from "@/components/QrzMapPanel";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-2 sm:p-4">
      <div className="flex w-full max-w-6xl flex-col gap-4">
        <div className="flex h-[72vh] min-h-[560px] flex-col rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
          <Header />
          <Terminal />
        </div>
        <QrzMapPanel />
      </div>
    </div>
  );
}
