import { db, QuicklistItem } from '@/hooks/useInstantDb';
import { User } from '@instantdb/react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // Perbaikan import

export const useQuickLists = (user: User | null | undefined) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Ambil parameter dari URL, default ke 'desc' jika tidak ada
    const sortOrder = (searchParams.get('sort') as 'asc' | 'desc') || 'desc';
    const sortField = searchParams.get('field') || 'createdAt';

    // State untuk fallback jika tidak menggunakan URL params
    const [localSort, setLocalSort] = useState(sortOrder);
    const [localField, setLocalField] = useState(sortField);

    // Update state lokal ketika URL berubah
    useEffect(() => {
        setLocalSort(sortOrder);
        setLocalField(sortField);
    }, [sortOrder, sortField]);

    const { data, isLoading, error } = db.useQuery(
        user
            ? {
                  quick_lists: {
                      $: {
                          where: {
                              user_id: user.id,
                              isArchived: false,
                          },
                          order: {
                              createdAt: sortOrder,
                          },
                      },
                      items: {
                          $: {
                              order: {
                                  createdAt: sortOrder,
                              },
                          },
                      },
                  },
              }
            : null,
    );

    // Fungsi helper untuk mengubah URL parameter
    const updateSortParams = (field: string, order: 'asc' | 'desc') => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('sort', order);
        newParams.set('field', field);
        setSearchParams(newParams);
    };

    // Toggle sorting order untuk field yang sama
    const toggleSort = (field?: string) => {
        const targetField = field || sortField;
        const newOrder = sortField === targetField && sortOrder === 'asc' ? 'desc' : 'asc';
        updateSortParams(targetField, newOrder);
    };

    // Set quick sort presets
    const setSortBy = {
        newest: () => updateSortParams('createdAt', 'desc'),
        oldest: () => updateSortParams('createdAt', 'asc'),
        nameAZ: () => updateSortParams('name', 'asc'),
        nameZA: () => updateSortParams('name', 'desc'),
        updated: () => updateSortParams('updatedAt', 'desc'),
    };

    function formatDate(timestamp: number) {
        return new Date(timestamp).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    const downloadAsImage = async (list: any) => {
        const items = list.items || [];
        if (!items.length) return;

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Enhanced dimensions
            const width = 600;
            const itemHeight = 60;
            const headerHeight = 140;
            const footerHeight = 80;
            const padding = 30;
            const itemPadding = 15;
            const height = headerHeight + items.length * itemHeight + footerHeight + padding * 2;

            canvas.width = width;
            canvas.height = height;

            // Enhanced background with gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#f8fafc');
            gradient.addColorStop(1, '#f1f5f9');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Add subtle border
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, width - 2, height - 2);

            let y = padding;

            // Enhanced Header with shadow
            const headerY = y + 20;

            // Header background with rounded corners
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 2;
            roundRect(ctx, padding, headerY - 10, width - padding * 2, headerHeight - 20, 12);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Title with better typography
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 28px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            const title = `📝 ${list.title || 'Quick List'}`;
            ctx.fillText(title, width / 2, headerY + 35);

            // Subtitle
            ctx.font = '16px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#64748b';
            const dateStr = formatDate(Date.now());

            ctx.fillText(dateStr, width / 2, headerY + 65);

            // Progress bar
            const completed = items.filter((item: QuicklistItem) => item.isCompleted).length;
            const progress = items.length > 0 ? completed / items.length : 0;
            const progressBarWidth = 200;
            const progressBarHeight = 8;
            const progressBarX = (width - progressBarWidth) / 2;
            const progressBarY = headerY + 85;

            // Progress bar background
            ctx.fillStyle = '#e2e8f0';
            roundRect(ctx, progressBarX, progressBarY, progressBarWidth, progressBarHeight, 4);
            ctx.fill();

            // Progress bar fill
            if (progress > 0) {
                const progressGradient = ctx.createLinearGradient(progressBarX, 0, progressBarX + progressBarWidth, 0);
                progressGradient.addColorStop(0, '#10b981');
                progressGradient.addColorStop(1, '#059669');
                ctx.fillStyle = progressGradient;
                roundRect(ctx, progressBarX, progressBarY, progressBarWidth * progress, progressBarHeight, 4);
                ctx.fill();
            }

            // Progress text
            ctx.font = '12px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.fillText(`${completed}/${items.length} completed`, width / 2, progressBarY + 25);

            y += headerHeight;

            // Enhanced Items
            ctx.textAlign = 'left';
            items.forEach((item: QuicklistItem, index: number) => {
                const itemY = y + index * itemHeight + itemPadding;
                const itemBgHeight = itemHeight - itemPadding;

                // Item background with alternating colors and shadow
                ctx.fillStyle = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
                ctx.shadowBlur = 3;
                ctx.shadowOffsetY = 1;
                roundRect(ctx, padding + 5, itemY, width - padding * 2 - 10, itemBgHeight, 8);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;

                // Left accent bar
                const accentColor = item.isCompleted ? '#10b981' : '#3b82f6';
                ctx.fillStyle = accentColor;
                ctx.fillRect(padding + 5, itemY, 4, itemBgHeight);

                // Enhanced checkbox
                const checkboxX = padding + 25;
                const checkboxY = itemY + itemBgHeight / 2;
                const checkboxSize = 24;

                if (item.isCompleted) {
                    // Completed checkbox with gradient
                    const checkGradient = ctx.createRadialGradient(
                        checkboxX,
                        checkboxY,
                        0,
                        checkboxX,
                        checkboxY,
                        checkboxSize / 2,
                    );
                    checkGradient.addColorStop(0, '#10b981');
                    checkGradient.addColorStop(1, '#059669');
                    ctx.fillStyle = checkGradient;
                    roundRect(
                        ctx,
                        checkboxX - checkboxSize / 2,
                        checkboxY - checkboxSize / 2,
                        checkboxSize,
                        checkboxSize,
                        6,
                    );
                    ctx.fill();

                    // Checkmark
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 3;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(checkboxX - 6, checkboxY - 1);
                    ctx.lineTo(checkboxX - 2, checkboxY + 3);
                    ctx.lineTo(checkboxX + 6, checkboxY - 5);
                    ctx.stroke();
                } else {
                    // Uncompleted checkbox
                    ctx.fillStyle = '#ffffff';
                    ctx.strokeStyle = '#cbd5e1';
                    ctx.lineWidth = 2;
                    roundRect(
                        ctx,
                        checkboxX - checkboxSize / 2,
                        checkboxY - checkboxSize / 2,
                        checkboxSize,
                        checkboxSize,
                        6,
                    );
                    ctx.fill();
                    ctx.stroke();
                }

                // Enhanced item text
                ctx.font = item.isCompleted ? '16px system-ui' : 'bold 16px system-ui';
                ctx.fillStyle = item.isCompleted ? '#94a3b8' : '#1e293b';

                const text = `${index + 1}. ${item.item}`;
                const textX = checkboxX + 35;

                // Text shadow for better readability
                if (!item.isCompleted) {
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
                    ctx.shadowBlur = 1;
                    ctx.shadowOffsetY = 1;
                }

                ctx.fillText(text, textX, checkboxY + 1);
                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;

                // Enhanced strikethrough for completed items
                if (item.isCompleted) {
                    const textWidth = ctx.measureText(text).width;
                    ctx.strokeStyle = '#94a3b8';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(textX, checkboxY);
                    ctx.lineTo(textX + textWidth, checkboxY);
                    ctx.stroke();
                }
            });

            // Enhanced Footer
            const footerY = y + items.length * itemHeight + 30;

            // Footer background
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetY = -2;
            roundRect(ctx, padding, footerY - 10, width - padding * 2, footerHeight - 20, 8);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Stats
            ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#1e293b';
            ctx.textAlign = 'center';
            ctx.fillText(`📊 ${completed}/${items.length} tasks completed`, width / 2, footerY + 20);

            // Percentage
            const percentage = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;
            ctx.font = '14px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.fillText(`${percentage}% progress`, width / 2, footerY + 40);

            // Watermark/branding
            ctx.font = '10px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'right';
            ctx.fillText('Generated by QuickList', width - padding, height - 10);

            // Download with better filename
            const link = document.createElement('a');
            const sanitizedTitle = (list.title || 'quick-list')
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .trim();
            link.download = `${sanitizedTitle}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png', 0.95);
            link.click();
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    // Helper function to draw rounded rectangles
    function roundRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
    ) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    return {
        data,
        isLoading,
        error,
        // Sorting state
        sortOrder,
        sortField,
        localSort,
        localField,
        // Sorting functions
        updateSortParams,
        toggleSort,
        setSortBy,
        // Computed values
        isAscending: sortOrder === 'asc',
        isDescending: sortOrder === 'desc',
        sortInfo: {
            field: sortField,
            order: sortOrder,
            displayName:
                sortField === 'createdAt'
                    ? 'Tanggal Dibuat'
                    : sortField === 'updatedAt'
                      ? 'Tanggal Diperbarui'
                      : sortField === 'name'
                        ? 'Nama'
                        : sortField,
        },

        downloadAsImage,
    };
};
