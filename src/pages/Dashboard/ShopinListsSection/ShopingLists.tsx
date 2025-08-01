import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { db, ShopingList } from '@/hooks/useInstantDb';
import { id } from '@instantdb/react';
import { Check, Download, Plus, ShoppingCart, Trash, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ShopingLists() {
    const { user } = db.useAuth();
    const [newItem, setNewItem] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const downloadRef = useRef<HTMLDivElement>(null);

    const { data, isLoading, error } = db.useQuery(
        user
            ? {
                  shoping_lists: {
                      $: {
                          where: {
                              user_id: user.id,
                          },
                          order: {
                              serverCreatedAt: 'desc',
                          },
                      },
                  },
              }
            : null,
    );

    // Sort shopping lists with newest items first
    const shopingLists = data?.shoping_lists;

    // Auto scroll to top when new item is added
    useEffect(() => {
        if (scrollRef.current && shopingLists?.length) {
            scrollRef.current.scrollTop = 0;
        }
    }, [shopingLists?.length]);

    const addShoppingItem = () => {
        if ((newItem ?? '').trim()) {
            db.transact(
                db.tx.shoping_lists[id()].update({
                    user_id: user?.id,
                    item: newItem,
                    isCompleted: false,
                    createdAt: Date.now(),
                }),
            );
            setNewItem('');
        }
    };

    const toggleItemComplete = (item: ShopingList) => {
        db.transact(db.tx.shoping_lists[item.id].update({ isCompleted: !item.isCompleted }));
    };
    const completedCount = shopingLists?.filter((item) => item.isCompleted).length || 0;

    const deleteCompletedShoppingItem = () => {
        const completed = shopingLists?.filter((item) => item.isCompleted);
        const txs = completed?.map((item) => db.tx.shoping_lists[item.id].delete());
        if (txs && txs.length > 0) {
            db.transact(txs);
        }
    };

    const deleteShoppingItem = (item: ShopingList) => {
        db.transact(db.tx.shoping_lists[item.id].delete());
    };

    const downloadAsImage = async () => {
        if (!shopingLists?.length) return;

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
            const height = headerHeight + shopingLists.length * itemHeight + footerHeight + padding * 2;

            canvas.width = width;
            canvas.height = height;

            // Set background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);

            // Set font
            ctx.font = '16px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            let y = padding;

            // Header
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🛒 Shopping List', width / 2, y + 30);

            ctx.font = '14px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText(formatDate(Date.now()), width / 2, y + 60);

            y += headerHeight;

            // Items
            ctx.textAlign = 'left';
            ctx.font = '16px system-ui, -apple-system, sans-serif';

            shopingLists.forEach((item, index) => {
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
            const footerY = y + shopingLists.length * itemHeight + 20;
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding, footerY);
            ctx.lineTo(width - padding, footerY);
            ctx.stroke();

            ctx.font = '12px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#9ca3af';
            ctx.textAlign = 'center';
            const completedCount = shopingLists.filter((item) => item.isCompleted).length;
            ctx.fillText(`Total items: ${shopingLists.length} | Completed: ${completedCount}`, width / 2, footerY + 30);

            // Download
            const link = document.createElement('a');
            link.download = `shopping-list-${new Date().toISOString().split('T')[0]}.png`;
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
                    <ShoppingCart size={18} />
                    <h2 className="text-lg font-semibold">Shopping List</h2>
                </div>
            </div>

            <Card className="p-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Add new item..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addShoppingItem()}
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button onClick={addShoppingItem} size="sm" disabled={isLoading || !newItem.trim()}>
                        <Plus size={16} />
                    </Button>

                    {shopingLists && shopingLists?.length > 0 && (
                        <Button onClick={downloadAsImage} size="sm" variant="outline">
                            <Download size={16} className="mr-1" />
                        </Button>
                    )}
                </div>
                <div className="mb-2 flex justify-end">
                    {completedCount > 1 && (
                        <Button
                            onClick={deleteCompletedShoppingItem}
                            size="sm"
                            className="hover:bg-destructive text-destructive hover:text-background"
                            variant="outline"
                        >
                            <Trash size={16} className="mr-1" />
                            Delete Completed Items
                        </Button>
                    )}
                </div>

                {isLoading && (
                    <p className="text-muted-foreground animate-pulse py-4 text-center">Loading shopping list...</p>
                )}

                {error && <p className="py-4 text-center text-red-500">Gagal memuat data. Silakan coba lagi nanti.</p>}

                {!isLoading && !error && (
                    <div
                        ref={scrollRef}
                        className="max-h-96 space-y-2 overflow-y-auto pr-2"
                        style={{ scrollbarWidth: 'thin' }}
                    >
                        {shopingLists?.map((item: ShopingList) => (
                            <div key={item.id} className="hover:bg-muted/50 flex items-center gap-3 rounded-md p-2">
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
                                    className={`flex-1 ${item.isCompleted ? 'text-muted-foreground line-through' : ''}`}
                                >
                                    {item.item}
                                </span>
                                <Button
                                    onClick={() => deleteShoppingItem(item)}
                                    size="sm"
                                    variant="ghost"
                                    className="p-1 text-red-500 hover:text-red-700"
                                >
                                    <X size={14} />
                                </Button>
                            </div>
                        ))}
                        {shopingLists?.length === 0 && (
                            <p className="text-muted-foreground py-4 text-center">No items in your shopping list</p>
                        )}
                    </div>
                )}
            </Card>

            {/* Hidden component for download */}
            <div ref={downloadRef} className="pointer-events-none fixed -top-full -left-full bg-white opacity-0">
                <div className="max-w-md p-8">
                    <div className="mb-6 text-center">
                        <div className="mb-2 flex items-center justify-center gap-2">
                            <ShoppingCart size={24} className="text-gray-700" />
                            <h1 className="text-2xl font-bold text-gray-800">Shopping List</h1>
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(Date.now())}</p>
                    </div>

                    <div className="space-y-3">
                        {shopingLists?.map((item: ShopingList, index: number) => (
                            <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                                <div
                                    className={`flex h-6 w-6 items-center justify-center rounded border-2 ${
                                        item.isCompleted
                                            ? 'border-green-500 bg-green-500 text-white'
                                            : 'border-gray-300'
                                    }`}
                                >
                                    {item.isCompleted && <Check size={16} />}
                                </div>
                                <span
                                    className={`flex-1 text-gray-800 ${
                                        item.isCompleted ? 'text-gray-500 line-through' : ''
                                    }`}
                                >
                                    {index + 1}. {item.item}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 border-t pt-4 text-center">
                        <p className="text-xs text-gray-500">
                            Total items: {shopingLists?.length || 0} | Completed:{' '}
                            {shopingLists?.filter((item) => item.isCompleted).length || 0}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
