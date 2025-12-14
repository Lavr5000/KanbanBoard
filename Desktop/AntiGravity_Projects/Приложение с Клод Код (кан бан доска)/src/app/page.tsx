import { Metadata } from 'next';
import { Board } from '@/components/kanban/Board';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Kanban Board - Task Management',
  description: 'A modern Kanban board for task management and project organization',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Board />
      </main>
    </div>
  );
}
