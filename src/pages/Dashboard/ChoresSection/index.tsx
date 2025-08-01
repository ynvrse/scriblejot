// components/chores/ChoresSection.tsx
import { Button } from '@/components/ui/button';

import * as Icons from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';

// Import helper components
import { Chore } from '@/hooks/useInstantDb';
import ChoreHelpers from './helper';
import { useChores, useChoresMutations } from './useChores';

// Destructure components untuk kemudahan penggunaan
const { TimeInput, DateChoiceButtons, IconSelector, EmptyState, ChoreCard, AddChoreModal, availableIcons } =
    ChoreHelpers;

export default function ChoresSection() {
    const { chores, isLoading, error } = useChores();
    const { addChore, updateChore, deleteChore, toggleChoreCompletion } = useChoresMutations();

    const [showAddChore, setShowAddChore] = useState(false);
    const [editingChore, setEditingChore] = useState<Chore | null>(null);
    const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [showActions, setShowActions] = useState<string | null>(null);

    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const dueTimeString = now.toTimeString().slice(0, 5); // Format: "HH:MM"

    const [newChore, setNewChore] = useState<any>({
        title: '',
        dueDate: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
        dueTime: dueTimeString,
        icon: 'Home',
        isToday: true,
        isCompleted: false,
    });

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (showAddChore) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [showAddChore]);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    const formatTime = (t: string) => {
        const [h, m] = t.split(':');
        return `${h}:${m}`;
    };

    const isOverdue = (chore: Chore) => {
        if (chore.isCompleted) return false;
        const choreTime = new Date(`${chore.dueDate}T${chore.dueTime}`);
        return choreTime < new Date();
    };

    const saveChore = async () => {
        const choreData = editingChore ?? newChore;
        const isValid = (choreData.title || '').trim() && (choreData.isToday ? true : !!choreData.dueDate);

        if (!isValid) return;

        const safeDueTime = (choreData.dueTime || '00:00').trim();

        try {
            if (editingChore) {
                await updateChore(editingChore.id, {
                    ...choreData,
                    dueTime: safeDueTime,
                });
                setEditingChore(null);
                setSelectedChore(null);
            } else {
                const today = new Date().toISOString().split('T')[0];
                await addChore({
                    ...newChore,
                    title: choreData.title,
                    dueDate: newChore.isToday ? today : choreData.dueDate,
                    dueTime: safeDueTime,
                    isCompleted: false,
                });
                setNewChore({
                    title: '',
                    dueDate: new Date().toISOString().split('T')[0],
                    dueTime: '00:00',
                    icon: 'Home',
                    isToday: true,
                    isCompleted: false,
                });
            }
            setShowAddChore(false);
        } catch (error) {
            console.error('Error saving chore:', error);
        }
    };

    const handleToggleCompletion = async (id: string, currentStatus: boolean) => {
        try {
            await toggleChoreCompletion(id, !currentStatus);
            setShowActions(null);
        } catch (error) {
            console.error('Error toggling chore completion:', error);
        }
    };

    const handleDeleteChore = async (id: string) => {
        try {
            await deleteChore(id);
            setShowActions(null);
            setSelectedChore(null);
        } catch (error) {
            console.error('Error deleting chore:', error);
        }
    };

    const IconComponent: FC<{ name: string; size?: number; className?: string }> = ({
        name,
        size = 32,
        className = '',
    }) => {
        const Icon = (Icons as any)[name] || Icons.Home;
        return <Icon size={size} className={className} />;
    };

    if (isLoading) {
        return (
            <div className="mb-8">
                <div className="mb-4 flex items-center gap-2">
                    <Icons.Activity size={18} />
                    <h2 className="text-lg font-semibold">My Chores</h2>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Icons.Loader2 className="animate-spin" size={24} />
                    <span className="ml-2">Loading chores...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mb-8">
                <div className="mb-4 flex items-center gap-2">
                    <Icons.Activity size={18} />
                    <h2 className="text-lg font-semibold">My Chores</h2>
                </div>
                <div className="flex items-center justify-center py-8 text-red-500">
                    <Icons.AlertCircle size={24} />
                    <span className="ml-2">Error loading chores</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icons.Activity size={18} />
                    <h2 className="text-lg font-semibold">My Chores</h2>
                </div>
                {chores.length > 0 && (
                    <Button onClick={() => setShowAddChore((prev) => !prev)} size="sm" variant="outline">
                        <Icons.Plus size={16} className="mr-1" />
                        Add Chore
                    </Button>
                )}
            </div>

            {showAddChore && (
                <AddChoreModal
                    editingChore={editingChore}
                    newChore={newChore}
                    setNewChore={setNewChore}
                    setEditingChore={setEditingChore}
                    dateInputRef={dateInputRef}
                    inputRef={inputRef}
                    onSave={saveChore}
                    onCancel={() => {
                        setShowAddChore(false);
                        setEditingChore(null);
                    }}
                />
            )}

            {chores.length === 0 ? (
                <EmptyState onAdd={() => setShowAddChore(true)} />
            ) : (
                <div className="scrollbar-hide flex space-x-4 overflow-x-auto pb-4">
                    {chores.map((chore) => {
                        const overdue = isOverdue(chore);
                        return (
                            <ChoreCard
                                key={chore.id}
                                chore={chore}
                                overdue={overdue}
                                showActions={showActions === chore.id}
                                onToggleActions={() => setShowActions(showActions === chore.id ? null : chore.id)}
                                onToggleCompletion={() => handleToggleCompletion(chore.id, chore.isCompleted)}
                                onEdit={() => {
                                    setEditingChore({ ...chore });
                                    setSelectedChore(chore);
                                    setShowActions(null);
                                    setShowAddChore(true);
                                }}
                                onDelete={() => handleDeleteChore(chore.id)}
                                formatDate={formatDate}
                                formatTime={formatTime}
                                IconComponent={IconComponent}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
