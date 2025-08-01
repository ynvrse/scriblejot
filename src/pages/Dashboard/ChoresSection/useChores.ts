import { Chore, db } from '@/hooks/useInstantDb';

export function useChores() {
    const { user } = db.useAuth();
    const { isLoading, error, data } = db.useQuery({
        chores: {
            $: {
                where: {
                    user_id: user?.id,
                },
            },
        },
    });

    const sortedChores =
        data?.chores?.sort((a, b) => {
            const now = new Date();

            const getTimeForSorting = (chore: Chore) => {
                if (chore.isToday) {
                    return new Date(chore.createdAt);
                } else {
                    if (chore.dueDate) {
                        let dueDateTime = new Date(chore.dueDate);

                        if (chore.dueTime) {
                            const timeOnly = new Date(chore.dueTime);
                            dueDateTime.setHours(timeOnly.getHours(), timeOnly.getMinutes(), timeOnly.getSeconds());
                        }

                        return dueDateTime;
                    }

                    return new Date(chore.createdAt);
                }
            };

            const timeA = getTimeForSorting(a);
            const timeB = getTimeForSorting(b);

            if (a.isCompleted !== b.isCompleted) {
                return a.isCompleted ? 1 : -1;
            }

            //
            if (!a.isCompleted && !b.isCompleted) {
                const isOverdueA = timeA.getTime() < now.getTime();
                const isOverdueB = timeB.getTime() < now.getTime();

                if (isOverdueA && !isOverdueB) return -1;
                if (!isOverdueA && isOverdueB) return 1;

                const diffA = Math.abs(now.getTime() - timeA.getTime());
                const diffB = Math.abs(now.getTime() - timeB.getTime());

                return diffA - diffB;
            }

            return timeB.getTime() - timeA.getTime();
        }) || [];

    return {
        chores: sortedChores,
        isLoading,
        error,
    };
}
export function useChoresMutations() {
    const { user } = db.useAuth();

    const addChore = (chore: Omit<Chore, 'id' | 'createdAt' | 'updatedAt'>) => {
        return db.transact([
            db.tx.chores[crypto.randomUUID()].update({
                ...chore,
                user_id: user?.id,
            }),
        ]);
    };

    const updateChore = (id: string, updates: Partial<Chore>) => {
        return db.transact([
            db.tx.chores[id].update({
                ...updates,
            }),
        ]);
    };

    const deleteChore = (id: string) => {
        return db.transact([db.tx.chores[id].delete()]);
    };

    const toggleChoreCompletion = (id: string, isCompleted: boolean) => {
        return db.transact([
            db.tx.chores[id].update({
                isCompleted,
            }),
        ]);
    };

    return {
        addChore,
        updateChore,
        deleteChore,
        toggleChoreCompletion,
    };
}
