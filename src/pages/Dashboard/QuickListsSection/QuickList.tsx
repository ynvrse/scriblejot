import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { db, Quicklist, QuicklistItem } from '@/hooks/useInstantDb';
import { id } from '@instantdb/react';
import { Activity, Check, Download, Edit3, List, Notebook, Pencil, Plus, PlusCircle, Trash, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function QuickList() {
    const { user } = db.useAuth();
    const [newItem, setNewItem] = useState('');
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Get all quick lists for current user
    const { data, isLoading, error } = db.useQuery(
        user
            ? {
                  quick_lists: {
                      $: {
                          where: {
                              user_id: user.id,
                              isArchived: false,
                          },
                      },
                      items: {
                          $: {
                              order: {
                                  createdAt: 'asc',
                              },
                          },
                      },
                  },
              }
            : null,
    );

    const quickLists = data?.quick_lists || [];
    const currentQuickList = selectedListId ? quickLists.find((list) => list.id === selectedListId) : quickLists[0];
    const quickListItems = currentQuickList?.items || [];

    // Auto select first list when data loads
    useEffect(() => {
        if (quickLists.length > 0 && !selectedListId) {
            setSelectedListId(quickLists[0].id);
        }
    }, [quickLists, selectedListId]);

    // Auto scroll when new item is added
    useEffect(() => {
        if (scrollRef.current && quickListItems?.length) {
            scrollRef.current.scrollTop = 0;
        }
    }, [quickListItems?.length]);

    const createNewQuickList = async () => {
        if (user) {
            const quickListId = id();
            await db.transact(
                db.tx.quick_lists[quickListId].update({
                    title: 'Quick List',
                    user_id: user.id,
                    createdAt: new Date(),
                    isArchived: false,
                }),
            );
            setSelectedListId(quickListId);
        }
    };

    const deleteQuickList = async (listId: string) => {
        if (!listId) return;

        // Get the list to be deleted
        const listToDelete = quickLists.find((list) => list.id === listId);
        if (!listToDelete) return;

        // Delete all items in the list first, then delete the list
        const itemsToDelete = listToDelete.items || [];
        const deleteTransactions = [
            ...itemsToDelete.map((item: QuicklistItem) => db.tx.quick_list_items[item.id].delete()),
            db.tx.quick_lists[listId].delete(),
        ];

        await db.transact(deleteTransactions);

        // Update selected list if the deleted list was selected
        if (selectedListId === listId) {
            const remainingLists = quickLists.filter((list) => list.id !== listId);
            setSelectedListId(remainingLists.length > 0 ? remainingLists[0].id : null);
        }
    };

    const startEditingTitle = (list: Quicklist) => {
        setEditingTitleId(list.id);
        setEditingTitle(list.title || 'Quick List');
    };

    const saveTitle = () => {
        if (editingTitleId && editingTitle.trim()) {
            db.transact(
                db.tx.quick_lists[editingTitleId].update({
                    title: editingTitle.trim(),
                    updatedAt: new Date(),
                }),
            );
        }
        setEditingTitleId(null);
        setEditingTitle('');
    };

    const cancelEditingTitle = () => {
        setEditingTitleId(null);
        setEditingTitle('');
    };

    const addQuickListItem = async () => {
        if ((newItem ?? '').trim() && currentQuickList) {
            const maxOrder = Math.max(...quickListItems.map((item: QuicklistItem) => item.order || 0), 0);
            const itemId = id();

            db.transact(
                db.tx.quick_list_items[itemId]
                    .update({
                        item: newItem,
                        isCompleted: false,
                        order: maxOrder + 1,
                        createdAt: new Date(),
                    })
                    .link({
                        parentList: currentQuickList.id,
                    }),
            );
            setNewItem('');
        }
    };

    const toggleItemComplete = (item: QuicklistItem) => {
        db.transact(
            db.tx.quick_list_items[item.id].update({
                isCompleted: !item.isCompleted,
                updatedAt: new Date(),
            }),
        );
    };

    const completedCount = quickListItems?.filter((item: QuicklistItem) => item.isCompleted).length || 0;

    const deleteCompletedItems = () => {
        const completed = quickListItems?.filter((item: QuicklistItem) => item.isCompleted);
        const txs = completed?.map((item: QuicklistItem) => db.tx.quick_list_items[item.id].delete());
        if (txs && txs.length > 0) {
            db.transact(txs);
        }
    };

    const deleteQuickListItem = (item: QuicklistItem) => {
        db.transact(db.tx.quick_list_items[item.id].delete());
    };

    const downloadAsImage = async (list: any) => {
        const items = list.items || [];
        if (!items.length) return;

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set canvas size
            const width = 400;
            const itemHeight = 50;
            const headerHeight = 120;
            const footerHeight = 60;
            const padding = 20;
            const height = headerHeight + items.length * itemHeight + footerHeight + padding * 2;

            canvas.width = width;
            canvas.height = height;

            // Set background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);

            let y = padding;

            // Header
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`📝 ${list.title || 'Quick List'}`, width / 2, y + 30);

            ctx.font = '14px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText(formatDate(Date.now()), width / 2, y + 60);

            y += headerHeight;

            // Items
            ctx.textAlign = 'left';
            ctx.font = '16px system-ui, -apple-system, sans-serif';

            items.forEach((item: QuicklistItem, index: number) => {
                const itemY = y + index * itemHeight;

                // Draw item border
                ctx.strokeStyle = '#d1d5db';
                ctx.lineWidth = 1;
                ctx.strokeRect(padding, itemY, width - padding * 2, itemHeight - 5);

                // Draw checkbox
                const checkboxX = padding + 15;
                const checkboxY = itemY + itemHeight / 2;
                const checkboxSize = 20;

                if (item.isCompleted) {
                    ctx.fillStyle = '#10b981';
                    ctx.fillRect(
                        checkboxX - checkboxSize / 2,
                        checkboxY - checkboxSize / 2,
                        checkboxSize,
                        checkboxSize,
                    );
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 14px system-ui';
                    ctx.textAlign = 'center';
                    ctx.fillText('✓', checkboxX, checkboxY);
                } else {
                    ctx.strokeStyle = '#d1d5db';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(
                        checkboxX - checkboxSize / 2,
                        checkboxY - checkboxSize / 2,
                        checkboxSize,
                        checkboxSize,
                    );
                }

                // Draw item text
                ctx.textAlign = 'left';
                ctx.font = '16px system-ui, -apple-system, sans-serif';
                ctx.fillStyle = item.isCompleted ? '#9ca3af' : '#374151';

                const text = `${index + 1}. ${item.item}`;
                ctx.fillText(text, checkboxX + 35, checkboxY);

                // Draw line through if completed
                if (item.isCompleted) {
                    const textWidth = ctx.measureText(text).width;
                    ctx.strokeStyle = '#9ca3af';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(checkboxX + 35, checkboxY);
                    ctx.lineTo(checkboxX + 35 + textWidth, checkboxY);
                    ctx.stroke();
                }
            });

            // Footer
            const footerY = y + items.length * itemHeight + 20;
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding, footerY);
            ctx.lineTo(width - padding, footerY);
            ctx.stroke();

            ctx.font = '12px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#9ca3af';
            ctx.textAlign = 'center';
            const completed = items.filter((item: QuicklistItem) => item.isCompleted).length;
            ctx.fillText(`Total items: ${items.length} | Completed: ${completed}`, width / 2, footerY + 30);

            // Download
            const link = document.createElement('a');
            link.download = `${(list.title || 'quick-list').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png', 0.9);
            link.click();
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <List size={18} />
                    <h2 className="text-lg font-semibold">Quick Lists</h2>
                </div>
            </div>

            {/* Loading/Error States */}
            {isLoading && (
                <Card className="p-8">
                    <p className="text-muted-foreground animate-pulse py-4 text-center">Loading quick lists...</p>
                </Card>
            )}

            {error && (
                <Card className="p-8">
                    <p className="py-4 text-center text-red-500">
                        Gagal memuat data. Silakan coba lagi nanti. <br />
                        {error.message}
                    </p>
                </Card>
            )}

            {/* Empty State - No Lists */}
            {!isLoading && !error && quickLists.length === 0 && (
                <Card className="p-8">
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="mb-6 flex space-x-2">
                            <div className="animate-bounce">
                                <Notebook className="text-blue-600" size={24} />
                            </div>
                            <div className="animate-bounce delay-75">
                                <Pencil className="text-purple-600" size={24} />
                            </div>
                            <div className="animate-bounce delay-150">
                                <Activity className="text-green-600" size={24} />
                            </div>
                        </div>
                        <p className="text-muted-foreground mb-4">You don't have any quick lists yet</p>
                        <Button onClick={createNewQuickList} size="lg">
                            <PlusCircle size={16} className="mr-2" />
                            Create Your First Quick List
                        </Button>
                    </div>
                </Card>
            )}

            {/* Main Content - When Lists Exist */}
            {!isLoading && !error && quickLists.length > 0 && (
                <>
                    {/* Quick Lists Tabs */}
                    <div className="mb-4 flex flex-wrap gap-2">
                        {quickLists.map((list: any) => (
                            <Button
                                key={list.id}
                                onClick={() => setSelectedListId(list.id)}
                                variant={selectedListId === list.id ? 'default' : 'outline'}
                                size="sm"
                                className="relative"
                            >
                                {list.title || 'Quick List'}
                                {list.items?.length > 0 && (
                                    <span
                                        className={`ml-2 rounded-full px-2 text-xs ${
                                            selectedListId === list.id
                                                ? 'bg-primary-foreground text-primary'
                                                : 'bg-secondary text-secondary-foreground'
                                        }`}
                                    >
                                        {list.items.length}
                                    </span>
                                )}
                            </Button>
                        ))}
                        <Button onClick={createNewQuickList} size="sm" variant="outline">
                            <PlusCircle size={16} className="mr-1" />
                            New List
                        </Button>
                    </div>

                    {/* Main Card */}
                    <Card className="p-4">
                        {currentQuickList && (
                            <>
                                {/* Title Section */}
                                <div className="mb-4 flex items-center gap-2">
                                    {editingTitleId === currentQuickList.id ? (
                                        <div className="flex flex-1 items-center gap-2">
                                            <Input
                                                value={editingTitle}
                                                onChange={(e) => setEditingTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveTitle();
                                                    if (e.key === 'Escape') cancelEditingTitle();
                                                }}
                                                className="flex-1"
                                                autoFocus
                                            />
                                            <Button onClick={saveTitle} size="sm">
                                                Save
                                            </Button>
                                            <Button onClick={cancelEditingTitle} size="sm" variant="outline">
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEditingTitle(currentQuickList)}
                                                className="hover:bg-muted/50 flex flex-1 items-center gap-2 rounded-md p-2"
                                            >
                                                <h3 className="text-lg font-medium">
                                                    {currentQuickList.title || 'Quick List'}
                                                </h3>
                                                <Edit3 size={14} className="text-muted-foreground" />
                                            </button>
                                            <Button
                                                onClick={() => deleteQuickList(currentQuickList.id)}
                                                size="icon"
                                                variant="outline"
                                                className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <Trash size={16} />
                                            </Button>
                                            {quickListItems.length > 0 && (
                                                <Button
                                                    onClick={() => downloadAsImage(currentQuickList)}
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Download size={16} />
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Add Item Section */}
                                <div className="mb-4 flex gap-2">
                                    <Input
                                        placeholder="Add new item..."
                                        value={newItem}
                                        onChange={(e) => setNewItem(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addQuickListItem()}
                                        className="flex-1"
                                        disabled={isLoading || !currentQuickList}
                                    />
                                    <Button
                                        onClick={addQuickListItem}
                                        size="sm"
                                        disabled={isLoading || !newItem.trim() || !currentQuickList}
                                    >
                                        <Plus size={16} />
                                    </Button>
                                </div>

                                {/* Delete Completed Button */}
                                {completedCount > 1 && (
                                    <div className="mb-4 flex justify-end">
                                        <Button
                                            onClick={deleteCompletedItems}
                                            size="sm"
                                            className="hover:bg-destructive text-destructive hover:text-destructive-foreground"
                                            variant="outline"
                                        >
                                            <Trash size={16} className="mr-1" />
                                            Delete Completed Items
                                        </Button>
                                    </div>
                                )}

                                {/* Items List */}
                                <div
                                    ref={scrollRef}
                                    className="max-h-96 space-y-2 overflow-y-auto pr-2"
                                    style={{ scrollbarWidth: 'thin' }}
                                >
                                    {quickListItems?.map((item: QuicklistItem) => (
                                        <div
                                            key={item.id}
                                            className="hover:bg-muted/50 flex items-center gap-3 rounded-md p-2"
                                        >
                                            <button
                                                onClick={() => toggleItemComplete(item)}
                                                className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                                                    item.isCompleted
                                                        ? 'border-green-500 bg-green-500 text-white'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                            >
                                                {item.isCompleted && <Check size={14} />}
                                            </button>
                                            <span
                                                className={`flex-1 ${
                                                    item.isCompleted ? 'text-muted-foreground line-through' : ''
                                                }`}
                                            >
                                                {item.item}
                                            </span>
                                            <Button
                                                onClick={() => deleteQuickListItem(item)}
                                                size="sm"
                                                variant="ghost"
                                                className="p-1 text-red-500 hover:text-red-700"
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>
                                    ))}

                                    {quickListItems?.length === 0 && (
                                        <p className="text-muted-foreground py-8 text-center">
                                            No items in this quick list
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
}
