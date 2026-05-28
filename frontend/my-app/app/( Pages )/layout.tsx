'use client';
import Sidebar from '../components/layout/Sidebar';
import TopAppBar from '../components/layout/TopAppBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="ml-[260px] flex-1 flex flex-col h-screen overflow-hidden">
        <TopAppBar />
        <main className="flex-1 overflow-y-auto p-container_padding bg-background">
          {children}
        </main>
      </div>
    </>
  );
}