import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Upload, Download, RotateCcw, Grid } from 'lucide-react';

interface ImageData {
    id: number;
    src: string;
    image: HTMLImageElement;
    name: string;
    position: number;
}

interface GridSize {
    rows: number;
    cols: number;
}

interface CellDimensions {
    width: number;
    height: number;
}

const MTG_RATIO: number = 7/5; // height/width = 1.4

export const App: React.FC = () => {
    const [images, setImages] = useState<ImageData[]>([]);
    const [gridSize, setGridSize] = useState<GridSize>({ rows: 7, cols: 10 });
    const [customWidth, setCustomWidth] = useState<number>(300);

    // MTG card ratio is 2.5:3.5 (width:height) or approximately 5:7
    const customHeight: number = Math.round(customWidth * MTG_RATIO);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calculate actual cell dimensions based on loaded images or custom size
    const getActualCellDimensions = (): CellDimensions => {
        return { width: customWidth, height: customHeight };
    };

    const cellDimensions: CellDimensions = getActualCellDimensions();

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>): void => {
        const files = Array.from(event.target.files || []);

        files.forEach((file: File, index: number) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e: ProgressEvent<FileReader>) => {
                    const img = new Image();
                    img.onload = () => {
                        setImages(prev => [...prev, {
                            id: Date.now() + index,
                            src: e.target?.result as string,
                            image: img,
                            name: file.name,
                            position: prev.length // Auto-assign position
                        }]);
                    };
                    img.src = e.target?.result as string;
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const drawCanvas = (): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (!ctx) return;

        const { width: cellWidth, height: cellHeight } = cellDimensions;
        const totalWidth: number = gridSize.cols * cellWidth;
        const totalHeight: number = gridSize.rows * cellHeight;

        const devicePixelRatio = 2;

        canvas.width = totalWidth * devicePixelRatio;
        canvas.height = totalHeight * devicePixelRatio;
        canvas.style.width = totalWidth + 'px';
        canvas.style.height = totalHeight + 'px';

        ctx.scale(devicePixelRatio, devicePixelRatio);

        // Clear canvas
        ctx.clearRect(0, 0, totalWidth, totalHeight);

        // Draw grid lines
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 2;

        // Vertical lines
        for (let i = 0; i <= gridSize.cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellWidth, 0);
            ctx.lineTo(i * cellWidth, totalHeight);
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= gridSize.rows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * cellHeight);
            ctx.lineTo(totalWidth, i * cellHeight);
            ctx.stroke();
        }

        // Draw images in their positions
        images.forEach((imgData: ImageData) => {
            const row: number = Math.floor(imgData.position / gridSize.cols);
            const col: number = imgData.position % gridSize.cols;

            if (row < gridSize.rows && col < gridSize.cols) {
                const x: number = col * cellWidth;
                const y: number = row * cellHeight;

                // Draw image at full cell size to maintain readability
                ctx.drawImage(
                    imgData.image,
                    x, y,
                    cellWidth, cellHeight
                );
            }
        });
    };

    // Redraw canvas when images or settings change
    useEffect(() => {
        drawCanvas();
    }, [images, gridSize, customWidth]);

    const moveImage = (imageId: number, newPosition: number): void => {
        setImages(prev => prev.map(img =>
            img.id === imageId ? { ...img, position: newPosition } : img
        ));
    };

    const removeImage = (imageId: number): void => {
        setImages(prev => prev.filter(img => img.id !== imageId));
    };

    const clearAll = (): void => {
        setImages([]);
    };

    const downloadCanvas = (): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = 'image-grid.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    const autoArrange = (): void => {
        setImages(prev => prev.map((img, index) => ({ ...img, position: index })));
    };

    const handleGridRowsChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setGridSize(prev => ({ ...prev, rows: parseInt(event.target.value) || 1 }));
    };

    const handleGridColsChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setGridSize(prev => ({ ...prev, cols: parseInt(event.target.value) || 1 }));
    };

    const handleCustomWidthChange = (event: ChangeEvent<HTMLInputElement>): void => {
        setCustomWidth(parseInt(event.target.value));
    };

    const handlePositionChange = (imageId: number, event: ChangeEvent<HTMLInputElement>): void => {
        moveImage(imageId, parseInt(event.target.value) - 1 || 0);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Image Grid Sorter</h1>

                    {/* Controls */}
                    <div className="flex flex-wrap gap-4 mb-6 items-center">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                type="button"
                            >
                                <Upload size={16} />
                                Upload Images
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Rows:</label>
                            <input
                                type="number"
                                value={gridSize.rows}
                                onChange={handleGridRowsChange}
                                className="w-16 px-2 py-1 border border-gray-300 rounded"
                                min="1"
                                max="20"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Cols:</label>
                            <input
                                type="number"
                                value={gridSize.cols}
                                onChange={handleGridColsChange}
                                className="w-16 px-2 py-1 border border-gray-300 rounded"
                                min="1"
                                max="20"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Custom Width:</label>
                            <input
                                type="range"
                                value={customWidth}
                                onChange={handleCustomWidthChange}
                                className="w-24"
                                min="200"
                                max="600"
                            />
                            <span className="text-sm text-gray-600 w-20">{customWidth}×{customHeight}px</span>
                        </div>

                        <button
                            onClick={autoArrange}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            type="button"
                        >
                            <Grid size={16} />
                            Auto Arrange
                        </button>

                        <button
                            onClick={clearAll}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            type="button"
                        >
                            <RotateCcw size={16} />
                            Clear All
                        </button>

                        <button
                            onClick={downloadCanvas}
                            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={images.length === 0}
                            type="button"
                        >
                            <Download size={16} />
                            Download
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Canvas */}
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">MTG Card Grid Canvas</h2>
                            <div className="overflow-auto border border-gray-300 bg-white" style={{ maxHeight: '600px' }}>
                                <canvas
                                    ref={canvasRef}
                                    className="border"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                MTG Card Ratio (5:7) | Cell Size: {cellDimensions.width}×{cellDimensions.height}px | Images: {images.length}
                            </p>
                        </div>

                        {/* Image List */}
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">Image Management</h2>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {images.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No images loaded. Upload some images to get started!</p>
                                ) : (
                                    images.map((img: ImageData) => (
                                        <div key={img.id} className="flex items-center gap-3 p-3 bg-white rounded border">
                                            <img
                                                src={img.src}
                                                alt={img.name}
                                                className="w-12 h-12 object-cover rounded border"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-700 truncate">{img.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <label className="text-xs text-gray-500">Position:</label>
                                                    <input
                                                        type="number"
                                                        value={img.position + 1}
                                                        onChange={(e) => handlePositionChange(img.id, e)}
                                                        className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded"
                                                        min="1"
                                                        max={gridSize.rows * gridSize.cols}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeImage(img.id)}
                                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                type="button"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Upload multiple image files using the "Upload Images" button</li>
                            <li>• Images automatically adjust to MTG card proportions (5:7 ratio)</li>
                            <li>• Adjust grid dimensions (rows/columns) as needed</li>
                            <li>• Use "Auto Arrange" to automatically position images in order</li>
                            <li>• Manually adjust image positions using the position input in the image list</li>
                            <li>• Download the final grid as a high-resolution PNG image</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
