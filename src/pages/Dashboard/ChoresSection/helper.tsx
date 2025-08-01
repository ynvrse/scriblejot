// components/chores/helpers.tsx
import StylishDatePicker from '@/components/stylish-date-picker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chore } from '@/hooks/useInstantDb';
import * as Icons from 'lucide-react';
import { FC, useState } from 'react';

// ===== Available Icons =====
export const availableIcons = [
    { name: 'Utensils', label: 'Kitchen' },
    { name: 'Shirt', label: 'Laundry' },
    { name: 'Car', label: 'Vehicle' },
    { name: 'Flower2', label: 'Garden' },
    { name: 'Brush', label: 'Cleaning' },
    { name: 'Droplets', label: 'Water' },
    { name: 'Home', label: 'General' },
    { name: 'ShoppingBag', label: 'Shopping' },
];

// ===== TimeInput Component =====
interface TimeInputProps {
    value: string;
    onChange: (value: string) => void;
}

export const TimeInput: FC<TimeInputProps> = ({ value, onChange }) => {
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

// ===== DateChoiceButtons Component =====
interface DateChoiceButtonsProps {
    isToday: boolean;
    setIsToday: (value: boolean) => void;
    onPickDate?: () => void;
}

export const DateChoiceButtons: FC<DateChoiceButtonsProps> = ({ isToday, setIsToday, onPickDate }) => (
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
                        setTimeout(() => onPickDate(), 50);
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

// ===== IconSelector Component =====
interface IconSelectorProps {
    selected: string;
    onSelect: (value: string) => void;
}

export const IconSelector: FC<IconSelectorProps> = ({ selected, onSelect }) => (
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

// ===== EmptyState Component =====
interface EmptyStateProps {
    onAdd: () => void;
}

export const EmptyState: FC<EmptyStateProps> = ({ onAdd }) => (
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

// ===== ChoreCard Component =====
interface ChoreCardProps {
    chore: Chore;
    overdue: boolean;
    showActions: boolean;
    onToggleActions: () => void;
    onToggleCompletion: () => void;
    onEdit: () => void;
    onDelete: () => void;
    formatDate: (d: string) => string;
    formatTime: (t: string) => string;
    IconComponent: FC<{ name: string; size?: number; className?: string }>;
}

export const ChoreCard: FC<ChoreCardProps> = ({
    chore,
    overdue,
    showActions,
    onToggleActions,
    onToggleCompletion,
    onEdit,
    onDelete,
    formatDate,
    formatTime,
    IconComponent,
}) => (
    <Card
        className={`relative min-w-[200px] flex-shrink-0 p-4 transition-all ${
            chore.isCompleted ? 'bg-primary text-primary-foreground' : overdue ? 'bg-rose-500 text-white' : ''
        }`}
    >
        <button
            onClick={onToggleCompletion}
            className={`absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                chore.isCompleted
                    ? 'text-primary bg-white'
                    : overdue
                      ? 'border-white/50 hover:bg-white/20'
                      : 'hover:border-primary hover:bg-primary/10'
            }`}
        >
            {chore.isCompleted && <Icons.Check size={14} />}
        </button>

        <Button onClick={onToggleActions} size="sm" variant="ghost" className="absolute top-2 right-2 h-6 w-6 p-0">
            <Icons.MoreHorizontal size={14} />
        </Button>

        <div onClick={onToggleActions} className="mt-6 cursor-pointer space-y-3 text-center">
            <div className="flex justify-center">
                <div className={`rounded-full p-3 ${chore.isCompleted ? 'bg-primary-foreground/20' : ''}`}>
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
                {overdue && !chore.isCompleted && <p className="text-xs text-red-100">⚠ Overdue</p>}
            </div>
        </div>

        {showActions && (
            <div className="mt-4 flex justify-center gap-2 border-t pt-4">
                <Button onClick={onEdit} size="sm" variant="ghost">
                    <Icons.Edit3 size={14} />
                </Button>
                <Button onClick={onDelete} size="sm" variant="ghost">
                    <Icons.Trash2 size={14} />
                </Button>
            </div>
        )}
    </Card>
);

// ===== AddChoreModal Component =====
interface AddChoreModalProps {
    editingChore: Chore | null;
    newChore: Omit<Chore, 'id' | 'createdAt' | 'updatedAt'>;
    setNewChore: React.Dispatch<React.SetStateAction<Omit<Chore, 'id' | 'createdAt' | 'updatedAt'>>>;
    setEditingChore: React.Dispatch<React.SetStateAction<Chore | null>>;
    dateInputRef: React.RefObject<HTMLInputElement>;
    inputRef: React.RefObject<HTMLInputElement>;
    onSave: () => void;
    onCancel: () => void;
}

export const AddChoreModal: FC<AddChoreModalProps> = ({
    editingChore,
    newChore,
    setNewChore,
    setEditingChore,
    dateInputRef,
    inputRef,
    onSave,
    onCancel,
}) => (
    <div className="fixed inset-0 z-50 flex w-full items-start justify-center bg-black/30">
        <Card className="w-full max-w-md space-y-4 p-4 sm:rounded-2xl sm:p-6">
            <textarea
                ref={inputRef}
                name="chore_q98y08as"
                autoComplete="off"
                autoFocus
                placeholder="Nama tugas"
                value={(editingChore ?? newChore).title}
                onChange={(e) => {
                    const title = e.target.value;
                    editingChore ? setEditingChore({ ...editingChore, title }) : setNewChore({ ...newChore, title });
                }}
                className="w-full flex-1 resize-none overflow-hidden rounded-lg border p-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                style={{
                    minHeight: '44px',
                    maxHeight: '120px',
                }}
                rows={1}
            />

            <DateChoiceButtons
                isToday={(editingChore ?? newChore).isToday}
                setIsToday={(val) => {
                    editingChore
                        ? setEditingChore({ ...editingChore, isToday: val })
                        : setNewChore({ ...newChore, isToday: val });

                    if (!val) {
                        setTimeout(() => {
                            dateInputRef.current?.showPicker?.();
                            dateInputRef.current?.click();
                        }, 10);
                    }
                }}
            />

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
                }}
            />

            <IconSelector
                selected={(editingChore ?? newChore).icon}
                onSelect={(icon: string) => {
                    editingChore ? setEditingChore({ ...editingChore, icon }) : setNewChore({ ...newChore, icon });
                }}
            />

            <div className="flex gap-2">
                <Button onClick={onSave} size="sm">
                    <Icons.Check size={16} className="mr-1" /> Save
                </Button>
                <Button onClick={onCancel} variant="outline" size="sm">
                    Cancel
                </Button>
            </div>
        </Card>
    </div>
);

// ===== Default Export =====
export default {
    TimeInput,
    DateChoiceButtons,
    availableIcons,
    IconSelector,
    EmptyState,
    ChoreCard,
    AddChoreModal,
};
