import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

type Props = {
    date: string | number | undefined;
    onChange: (value: string) => void;
    inputRef: React.RefObject<HTMLInputElement>;
};

export default function StylishDatePicker({ date, onChange, inputRef }: Props) {
    const formatted = date ? format(new Date(date), 'dd MMMM yyyy', { locale: id }) : 'Pilih tanggal';

    return (
        <div
            onClick={() => {
                inputRef.current?.showPicker?.();
                inputRef.current?.click();
            }}
            className="border-primary bg-primary/10 flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3"
        >
            <Calendar size={20} className="text-primary" />
            <span className="text-primary font-bold">{formatted}</span>

            <input
                ref={inputRef}
                type="date"
                value={date}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
            />
        </div>
    );
}
