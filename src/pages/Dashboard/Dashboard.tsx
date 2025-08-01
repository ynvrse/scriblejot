import { db } from '@/hooks/useInstantDb';
import Login from '../Auth/Login';
import ChoresSection from './ChoresSection';
import GreetingsSection from './GreetingsSection';
import NotesSection from './NotesSection';
import ShopingLists from './ShopinListsSection';

export default function Dashboard() {
    const { isLoading, user, error } = db.useAuth();

    if (isLoading) {
        return (
            <div className="bg-background flex min-h-screen items-center justify-center p-4">
                <div>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-background flex min-h-screen items-center justify-center p-4">
                <div className="text-red-500">Error: {error.message}</div>
            </div>
        );
    }

    if (user) {
        return (
            <div className="bg-background min-h-screen p-4">
                {/* Greeting Section  */}
                <GreetingsSection />

                {/* Notes Section */}
                <NotesSection />

                {/* Chores Section */}
                <ChoresSection />

                {/* Shopping List Section */}
                <ShopingLists />
            </div>
        );
    }

    return <Login />;
}
