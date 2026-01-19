'use client';

import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import styles from '../styles/components/DataManager.module.scss';
import { Item } from '../types';

interface DataManagerProps {
    items: Item[];
    profile: any;
    onImport: (data: { items: Item[]; profile: any }) => void;
}

export const DataManager: React.FC<DataManagerProps> = ({ items, profile, onImport }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = {
            items,
            profile,
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        a.download = `timeline-backup-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const data = JSON.parse(content);

                if (data.items && Array.isArray(data.items)) {
                    if (confirm('現在のデータを上書きしてインポートしますか？')) {
                        onImport(data);
                        alert('インポートが完了しました');
                    }
                } else {
                    alert('無効なデータ形式です');
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('ファイルの読み込みに失敗しました');
            }
        };
        reader.readAsText(file);

        // Reset input
        e.target.value = '';
    };

    return (
        <div className={styles.container}>
            <button onClick={handleExport} className={styles.button} title="データをエクスポート">
                <Download size={16} />
            </button>
            <button onClick={handleImportClick} className={styles.button} title="データをインポート">
                <Upload size={16} />
            </button>
            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileChange}
                hidden
            />
        </div>
    );
};
