import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { Check, Plus, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import Login from './Login';
import ChoresSection from './sections/ChoresSection';

import db from '@/hooks/useIDB';
import Greeting from './sections/Greeting';
import NoteSection from './sections/NotesSection';

export default function Dashboard() {
    const { isLoading, user, error } = db.useAuth();

    // State untuk Shopping List
    const [shoppingItems, setShoppingItems] = useState([
        { id: 1, item: 'Milk', completed: false },
        { id: 2, item: 'Bread', completed: true },
        { id: 3, item: 'Eggs', completed: false },
        { id: 4, item: 'Apples', completed: false },
    ]);

    const [newItem, setNewItem] = useState('');

    // Functions untuk Shopping List
    const addShoppingItem = () => {
        if ((newItem ?? '').trim()) {
            setShoppingItems([
                ...shoppingItems,
                {
                    id: Date.now(),
                    item: newItem,
                    completed: false,
                },
            ]);
            setNewItem('');
        }
    };

    const toggleItemComplete = (id: number) => {
        setShoppingItems(
            shoppingItems.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
        );
    };

    const deleteShoppingItem = (id: number) => {
        setShoppingItems(shoppingItems.filter((item) => item.id !== id));
    };

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
                {/* Greeting Section - bisa dimodifikasi untuk menggunakan nama dari profil */}
                <Greeting />

                {/* Notes Section */}
                <NoteSection />

                {/* Chores Section */}
                <ChoresSection />

                {/* Shopping List Section */}
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-x-2">
                            <ShoppingCart size={18} />
                            <h2 className="text-lg font-semibold">Shopping List</h2>
                        </div>
                    </div>

                    <Card className="p-4">
                        <div className="mb-4 flex gap-2">
                            <Input
                                placeholder="Add new item..."
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addShoppingItem()}
                                className="flex-1"
                            />
                            <Button onClick={addShoppingItem} size="sm">
                                <Plus size={16} />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {shoppingItems.map((item) => (
                                <div key={item.id} className="hover:bg-muted/50 flex items-center gap-3 rounded-md p-2">
                                    <button
                                        onClick={() => toggleItemComplete(item.id)}
                                        className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                                            item.completed
                                                ? 'border-green-500 bg-green-500 text-white'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        {item.completed && <Check size={14} />}
                                    </button>
                                    <span
                                        className={`flex-1 ${item.completed ? 'text-muted-foreground line-through' : ''}`}
                                    >
                                        {item.item}
                                    </span>
                                    <Button
                                        onClick={() => deleteShoppingItem(item.id)}
                                        size="sm"
                                        variant="ghost"
                                        className="p-1 text-red-500 hover:text-red-700"
                                    >
                                        <X size={14} />
                                    </Button>
                                </div>
                            ))}
                            {shoppingItems.length === 0 && (
                                <p className="text-muted-foreground py-4 text-center">No items in your shopping list</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return <Login />;
}
