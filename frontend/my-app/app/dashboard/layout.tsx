import Sidebar from '../components/Sidebar';
import TopAppBar from '../components/TopAppBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
