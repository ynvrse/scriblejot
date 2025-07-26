// ChoresSection.tsx
import StylishDatePicker from '@/components/StylishDatePicker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';

type Chore = {
    id: number;
    title: string;
    description?: string;
    dueDate: string;
    dueTime: string;
    completed: boolean;
    icon: string;
    isToday: boolean;
};

const initialChores: Chore[] = [];

const availableIcons = [
    { name: 'Utensils', label: 'Kitchen' },
    { name: 'Shirt', label: 'Laundry' },
    { name: 'Car', label: 'Vehicle' },
    { name: 'Flower2', label: 'Garden' },
    { name: 'Brush', label: 'Cleaning' },
    { name: 'Droplets', label: 'Water' },
    { name: 'Home', label: 'General' },
    { name: 'ShoppingBag', label: 'Shopping' },
];

export default function ChoresSection() {
    const [showAddChore, setShowAddChore] = useState(false);
    const [editingChore, setEditingChore] = useState<Chore | null>(null);
    const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const [showActions, setShowActions] = useState<number | null>(null);
    const [chores, setChores] = useState<Chore[]>(initialChores);
    const [newChore, setNewChore] = useState<Omit<Chore, 'id' | 'completed'>>({
        title: '',
        dueDate: '',
        dueTime: '',
        icon: 'Home',
        isToday: true,
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
        if (chore.completed) return false;
        const choreTime = new Date(`${chore.dueDate}T${chore.dueTime}`);
        return choreTime < new Date();
    };

    const saveChore = () => {
        const choreData = editingChore ?? newChore;
        const isValid = (choreData.title || '').trim() && (choreData.isToday ? true : !!choreData.dueDate);

        if (!isValid) return;

        // Pakai default '00:00' kalau dueTime kosong
        const safeDueTime = (choreData.dueTime || '00:00').trim();

        if (editingChore) {
            setChores((prev) =>
                prev.map((chore) => (chore.id === editingChore.id ? { ...editingChore, dueTime: safeDueTime } : chore)),
            );
            setEditingChore(null);
            setSelectedChore(null);
            setShowAddChore(false);
        } else {
            const today = new Date().toISOString().split('T')[0];
            const newEntry: Chore = {
                ...newChore,
                id: Date.now(),
                dueDate: newChore.isToday ? today : newChore.dueDate,
                dueTime: safeDueTime,
                completed: false,
            };
            setChores((prev) => [...prev, newEntry]);
            setNewChore({ title: '', dueDate: '', dueTime: '', icon: 'Home', isToday: true });
            setShowAddChore(false);
        }
    };

    const toggleChoreCompletion = (id: number) => {
        setChores((prev) => prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c)));
        setShowActions(null);
    };

    const deleteChore = (id: number) => {
        setChores((prev) => prev.filter((c) => c.id !== id));
        setShowActions(null);
        setSelectedChore(null);
    };

    const IconComponent: FC<{ name: string; size?: number; className?: string }> = ({
        name,
        size = 32,
        className = '',
    }) => {
        const Icon = (Icons as any)[name] || Icons.Home;
        return <Icon size={size} className={className} />;
    };

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
                <div className="fixed inset-0 z-50 flex w-full items-start justify-center bg-black/30">
                    <Card className="w-full max-w-md space-y-4 p-4 sm:rounded-2xl sm:p-6">
                        <textarea
                            name="chore_q98y08as"
                            autoComplete="off"
                            autoFocus
                            placeholder="Nama tugas"
                            value={(editingChore ?? newChore).title}
                            onChange={(e) => {
                                const title = e.target.value;
                                editingChore
                                    ? setEditingChore({ ...editingChore, title })
                                    : setNewChore({ ...newChore, title });
                            }}
                            className="w-full flex-1 resize-none overflow-hidden rounded-lg border p-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            style={{
                                minHeight: '44px', // tinggi awal minimum
                                maxHeight: '120px', // batasi maksimum jika perlu
                            }}
                            rows={1}
                        />

                        <DateChoiceButtons
                            isToday={(editingChore ?? newChore).isToday}
                            setIsToday={(val) => {
                                editingChore
                                    ? setEditingChore({ ...editingChore, isToday: val })
                                    : setNewChore({ ...newChore, isToday: val });

                                // trigger klik date picker hanya jika tombol "Pilih Tanggal" dipilih
                                if (!val) {
                                    setTimeout(() => {
                                        dateInputRef.current?.showPicker?.(); // modern browser
                                        dateInputRef.current?.click(); // fallback
                                    }, 10);
                                }
                            }}
                        />

                        {/* hidden input date */}

                        {!(editingChore ?? newChore).isToday && (
                            <>
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    hidden
                                    value={(editingChore ?? newChore).dueDate}
                                    onChange={(e) => {
                                        const dueDate = e.target.value;
                                        editingChore
                                            ? setEditingChore({ ...editingChore, dueDate })
                                            : setNewChore({ ...newChore, dueDate });
                                    }}
                                />

                                <StylishDatePicker
                                    date={(editingChore ?? newChore).dueDate}
                                    inputRef={dateInputRef}
                                    onChange={(val) =>
                                        editingChore
                                            ? setEditingChore({ ...editingChore, dueDate: val })
                                            : setNewChore({ ...newChore, dueDate: val })
                                    }
                                />
                            </>
                        )}

                        <TimeInput
                            value={(editingChore ?? newChore).dueTime}
                            onChange={(t: string) => {
                                editingChore
                                    ? setEditingChore({ ...editingChore, dueTime: t })
                                    : setNewChore({ ...newChore, dueTime: t });
                                inputRef.current?.focus();
                            }}
                        />

                        <IconSelector
                            selected={(editingChore ?? newChore).icon}
                            onSelect={(icon: string) => {
                                editingChore
                                    ? setEditingChore({ ...editingChore, icon })
                                    : setNewChore({ ...newChore, icon });
                                inputRef.current?.focus();
                            }}
                        />

                        <div className="flex gap-2">
                            <Button onClick={saveChore} size="sm">
                                <Icons.Check size={16} className="mr-1" /> Save
                            </Button>
                            <Button
                                onClick={() => {
                                    inputRef.current?.blur();
                                    setShowAddChore(false);
                                    setEditingChore(null);
                                }}
                                variant="outline"
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {chores.length === 0 ? (
                <EmptyState onAdd={() => setShowAddChore(true)} />
            ) : (
                <div className="scrollbar-hide flex space-x-4 overflow-x-auto pb-4">
                    {chores.map((chore) => {
                        const overdue = isOverdue(chore);
                        return (
                            <Card
                                key={chore.id}
                                className={`relative min-w-[200px] flex-shrink-0 p-4 transition-all ${
                                    chore.completed
                                        ? 'bg-primary text-primary-foreground'
                                        : overdue
                                          ? 'bg-rose-500 text-white'
                                          : ''
                                }`}
                            >
                                {/* Done Button */}
                                <button
                                    onClick={() => toggleChoreCompletion(chore.id)}
                                    className={`absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                        chore.completed
                                            ? 'text-primary bg-white'
                                            : overdue
                                              ? 'border-white/50 hover:bg-white/20'
                                              : 'hover:border-primary hover:bg-primary/10'
                                    }`}
                                >
                                    {chore.completed && <Icons.Check size={14} />}
                                </button>
                                {/* Detail Button */}
                                <Button
                                    onClick={() => setShowActions(showActions === chore.id ? null : chore.id)}
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 h-6 w-6 p-0"
                                >
                                    <Icons.MoreHorizontal size={14} />
                                </Button>

                                {/* Icon & Title */}
                                <div
                                    onClick={() => setShowActions(showActions === chore.id ? null : chore.id)}
                                    className="mt-6 cursor-pointer space-y-3 text-center"
                                >
                                    <div className="flex justify-center">
                                        <div
                                            className={`rounded-full p-3 ${chore.completed ? 'bg-primary-foreground/20' : ''}`}
                                        >
                                            <IconComponent name={chore.icon} size={42} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{chore.title}</p>
                                        <p className="text-xs">
                                            {chore.isToday
                                                ? formatTime(chore.dueTime)
                                                : `${formatDate(chore.dueDate)} • ${formatTime(chore.dueTime)}`}
                                        </p>
                                        {overdue && !chore.completed && (
                                            <p className="text-xs text-red-100">⚠ Overdue</p>
                                        )}
                                    </div>
                                </div>
                                {/* Action Buttons */}
                                {showActions === chore.id && (
                                    <div className="mt-4 flex justify-center gap-2 border-t pt-4">
                                        <Button
                                            onClick={() => {
                                                setEditingChore({ ...chore });
                                                setSelectedChore(chore);
                                                setShowActions(null);
                                                setShowAddChore(true);
                                            }}
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Icons.Edit3 size={14} />
                                        </Button>
                                        <Button onClick={() => deleteChore(chore.id)} size="sm" variant="ghost">
                                            <Icons.Trash2 size={14} />
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ===== Helper Components =====

const TimeInput: FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => {
    const [hours, setHours] = useState(value?.split(':')[0] || '12');
    const [minutes, setMinutes] = useState(value?.split(':')[1] || '00');

    const update = (h: string, m: string) => onChange(`${h.padStart(2, '0')}:${m.padStart(2, '0')}`);

    return (
        <div className="border-primary bg-primary/10 flex items-center gap-2 rounded-lg border-2 p-3">
            <Icons.Clock size={20} className="text-primary" />
            <input
                type="number"
                value={hours}
                min="0"
                max="23"
                onChange={(e) => {
                    const h = Math.min(23, Math.max(0, +e.target.value)).toString();
                    setHours(h);
                    update(h, minutes);
                }}
                className="border-primary text-primary w-12 text-center font-bold outline-none"
            />
            <span>:</span>
            <input
                type="number"
                value={minutes}
                min="0"
                max="59"
                onChange={(e) => {
                    const m = Math.min(59, Math.max(0, +e.target.value)).toString();
                    setMinutes(m);
                    update(hours, m);
                }}
                className="border-primary text-primary w-12 text-center font-bold outline-none"
            />
        </div>
    );
};

const DateChoiceButtons: FC<{
    isToday: boolean;
    setIsToday: (value: boolean) => void;
    onPickDate?: () => void;
}> = ({ isToday, setIsToday, onPickDate }) => (
    <div className="flex gap-4">
        {[
            { label: 'Hari Ini', icon: Icons.Clock, value: true },
            { label: 'Pilih Tanggal', icon: Icons.Calendar, value: false },
        ].map(({ label, icon: Icon, value }) => (
            <button
                key={label}
                onClick={() => {
                    setIsToday(value);
                    if (!value && onPickDate) {
                        setTimeout(() => onPickDate(), 50); // Delay agar input sudah render
                    }
                }}
                className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 ${
                    isToday === value ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200'
                }`}
            >
                <Icon size={16} />
                {label}
            </button>
        ))}
    </div>
);

const IconSelector: FC<{ selected: string; onSelect: (value: string) => void }> = ({ selected, onSelect }) => (
    <div className="grid grid-cols-4 gap-2">
        {availableIcons.map((icon) => {
            const Icon = (Icons as any)[icon.name];
            return (
                <button
                    key={icon.name}
                    onClick={() => onSelect(icon.name)}
                    className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 ${
                        selected === icon.name
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <Icon size={20} />
                    <span className="text-xs">{icon.label}</span>
                </button>
            );
        })}
    </div>
);

const EmptyState: FC<{ onAdd: () => void }> = ({ onAdd }) => (
    <div className="flex flex-col items-center justify-center px-8 py-16">
        <div className="mb-6 flex space-x-2">
            <div className="animate-bounce">
                <Icons.Utensils className="text-blue-600" size={24} />
            </div>
            <div className="animate-bounce delay-75">
                <Icons.Shirt className="text-purple-600" size={24} />
            </div>
            <div className="animate-bounce delay-150">
                <Icons.Flower2 className="text-green-600" size={24} />
            </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">Belum Ada Tugas</h3>
        <p className="text-sm text-gray-500">Tambahkan tugas untuk memulai hari yang produktif</p>
        <Button onClick={onAdd} className="mt-6" size="lg">
            <Icons.Plus size={18} className="mr-2" />
            Tambah Tugas
        </Button>
    </div>
);
