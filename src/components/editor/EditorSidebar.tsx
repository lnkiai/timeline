'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pencil,
    Calendar,
    Link as LinkIcon,
    Image,
    FileText,
    X,
    ArrowUp,
    ChevronDown,
    Type,
    Zap,
    Sparkles,
    Loader2,
    Check,
} from 'lucide-react';
import { Item } from '../../types';
import styles from '../../styles/components/Editor.module.scss';

// Common emojis
const EMOJI_OPTIONS = ['🎉', '🚀', '✨', '📝', '💡', '🔥', '📦', '🎯', '💻', '🏆', '📚', '🎨'];

// Input modes
type InputMode = 'title' | 'action' | 'description';

const INPUT_MODES: { mode: InputMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'title', icon: <Type size={16} />, label: 'タイトル' },
    { mode: 'action', icon: <Zap size={16} />, label: 'アクション' },
    { mode: 'description', icon: <FileText size={16} />, label: '説明' },
];

// Generate year/month options
const YEARS = Array.from({ length: 8 }, (_, i) => 2020 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const smoothSpring = {
    type: "spring" as const,
    stiffness: 400,
    damping: 35,
};

// AI Enhance API call
interface EnhanceContext {
    title?: string;
    action?: string;
    description?: string;
}

async function enhanceText(
    text: string,
    type: InputMode,
    context?: EnhanceContext
): Promise<string> {
    try {
        const response = await fetch('/api/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, type, context }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Enhance API error:', errorData.error || response.statusText);
            throw new Error(errorData.error || 'Failed to enhance');
        }

        const data = await response.json();
        return data.enhancedText || text;
    } catch (error) {
        console.error('Enhance error:', error);
        return text;
    }
}

interface EditorInputProps {
    onAddItem: (item: Omit<Item, 'id' | 'excluded'>) => void;
    onUpdateItem?: (id: string, item: Omit<Item, 'id' | 'excluded'>) => void;
    editingItem?: Item | null;
    onCancelEdit?: () => void;
}

export const EditorInput: React.FC<EditorInputProps> = ({
    onAddItem,
    onUpdateItem,
    editingItem,
    onCancelEdit
}) => {
    // Form state (saved values)
    const [title, setTitle] = useState('');
    const [action, setAction] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [emoji, setEmoji] = useState('🎉');

    // Date state
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [day, setDay] = useState(now.getDate());

    // UI state
    const [isExpanded, setIsExpanded] = useState(false);
    const [inputMode, setInputMode] = useState<InputMode>('title');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const [showUrl, setShowUrl] = useState(false);
    const [showImage, setShowImage] = useState(false);
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Populate form when editing item changes
    useEffect(() => {
        if (editingItem) {
            setTitle(editingItem.title || '');
            setAction(editingItem.action || '');
            setDescription(editingItem.description || '');
            setUrl(editingItem.url || '');
            setImageUrl(editingItem.imageUrl || '');
            setEmoji(editingItem.emoji || '🎉');

            // Parse date
            const dateParts = editingItem.date.split('-');
            if (dateParts.length === 3) {
                setYear(parseInt(dateParts[0]));
                setMonth(parseInt(dateParts[1]));
                setDay(parseInt(dateParts[2]));
            }

            setIsExpanded(true);
            setShowDate(true);
        }
    }, [editingItem]);

    const formatDate = () => {
        const m = month.toString().padStart(2, '0');
        const d = day.toString().padStart(2, '0');
        return `${year}-${m}-${d}`;
    };

    // Get current input value based on mode
    const getCurrentValue = () => {
        switch (inputMode) {
            case 'title': return title;
            case 'action': return action;
            case 'description': return description;
        }
    };

    // Set current input value based on mode
    const setCurrentValue = (value: string) => {
        switch (inputMode) {
            case 'title': setTitle(value); break;
            case 'action': setAction(value); break;
            case 'description': setDescription(value); break;
        }
    };

    // Get placeholder based on mode
    const getPlaceholder = () => {
        switch (inputMode) {
            case 'title': return 'タイトルを入力...';
            case 'action': return 'アクション（例：公開、達成、開始）';
            case 'description': return '説明を入力...';
        }
    };

    // Check if mode has value
    const hasValue = (mode: InputMode) => {
        switch (mode) {
            case 'title': return !!title;
            case 'action': return !!action;
            case 'description': return !!description;
        }
    };

    // AI Enhance handler
    const handleEnhance = async () => {
        const currentText = getCurrentValue();
        if (!currentText.trim() || isEnhancing) return;

        setIsEnhancing(true);

        // Build context for AI
        const context: EnhanceContext = {};
        if (title && inputMode !== 'title') context.title = title;
        if (action && inputMode !== 'action') context.action = action;

        const enhanced = await enhanceText(currentText, inputMode, context);
        setCurrentValue(enhanced);
        setIsEnhancing(false);
    };

    const handleSubmit = () => {
        if (!title.trim()) return;

        const itemData = {
            title: title.trim(),
            date: formatDate(),
            action: action.trim() || undefined,
            url: url.trim() || undefined,
            description: description.trim() || undefined,
            imageUrl: imageUrl.trim() || undefined,
            emoji: emoji,
        };

        if (editingItem && onUpdateItem) {
            onUpdateItem(editingItem.id!, itemData);
            if (onCancelEdit) onCancelEdit();
        } else {
            onAddItem(itemData);
        }

        // Reset form
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setAction('');
        setDescription('');
        setUrl('');
        setImageUrl('');
        setInputMode('title');
        setShowDate(false);
        setShowUrl(false);
        setShowImage(false);
        if (onCancelEdit) onCancelEdit();
    };

    const handleCancel = () => {
        resetForm();
        if (onCancelEdit) onCancelEdit();
    };

    const handleExpand = () => {
        setIsExpanded(true);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 50);
    };

    const handleModeChange = (mode: InputMode) => {
        setInputMode(mode);
        setTimeout(() => {
            if (mode === 'description') {
                textareaRef.current?.focus();
            } else {
                inputRef.current?.focus();
            }
        }, 50);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (inputMode === 'title' && title.trim()) {
                handleSubmit();
            }
        }
    };

    const toggleDateDropdown = (type: 'year' | 'month') => {
        if (type === 'year') {
            setShowYearDropdown(!showYearDropdown);
            setShowMonthDropdown(false);
        } else {
            setShowMonthDropdown(!showMonthDropdown);
            setShowYearDropdown(false);
        }
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                if (!title.trim() && !url && !description && !imageUrl && !action) {
                    setIsExpanded(false);
                }
                setShowEmojiPicker(false);
                setShowYearDropdown(false);
                setShowMonthDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [title, url, description, imageUrl, action]);

    const isCompact = !isExpanded;
    const currentValue = getCurrentValue();

    return (
        <div ref={containerRef} className={styles.inputContainer}>
            <motion.div
                layout
                transition={smoothSpring}
                onClick={isCompact ? handleExpand : undefined}
                className={`${styles.inputCard} ${isCompact ? styles.compact : ''}`}
            >
                {/* Compact View */}
                <motion.div
                    layout
                    className={isCompact ? styles.compactContent : styles.hidden}
                >
                    <Pencil size={16} className={styles.compactIcon} />
                    <span>タイムラインに追加する...</span>
                </motion.div>

                {/* Expanded View */}
                <motion.div
                    layout
                    className={isCompact ? styles.hidden : styles.expandedContent}
                >
                    {/* Expanded Fields */}
                    <AnimatePresence>
                        {/* Date Field */}
                        {showDate && (
                            <motion.div
                                key="date"
                                className={styles.expandedField}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <div className={styles.fieldRow}>
                                    <Calendar size={14} className={styles.fieldIcon} />
                                    <div className={styles.dateGroup}>
                                        <div className={styles.selectWrapper}>
                                            <button
                                                type="button"
                                                className={styles.selectBtn}
                                                onClick={(e) => { e.stopPropagation(); toggleDateDropdown('year'); }}
                                            >
                                                {year}<ChevronDown size={10} />
                                            </button>
                                            <AnimatePresence>
                                                {showYearDropdown && (
                                                    <motion.div
                                                        className={styles.dropdown}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 8 }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {YEARS.map((y) => (
                                                            <button
                                                                key={y}
                                                                type="button"
                                                                className={year === y ? styles.selected : ''}
                                                                onClick={() => { setYear(y); setShowYearDropdown(false); }}
                                                            >
                                                                {y}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <span className={styles.sep}>/</span>
                                        <div className={styles.selectWrapper}>
                                            <button
                                                type="button"
                                                className={styles.selectBtn}
                                                onClick={(e) => { e.stopPropagation(); toggleDateDropdown('month'); }}
                                            >
                                                {month}<ChevronDown size={10} />
                                            </button>
                                            <AnimatePresence>
                                                {showMonthDropdown && (
                                                    <motion.div
                                                        className={styles.dropdown}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 8 }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {MONTHS.map((m) => (
                                                            <button
                                                                key={m}
                                                                type="button"
                                                                className={month === m ? styles.selected : ''}
                                                                onClick={() => { setMonth(m); setShowMonthDropdown(false); }}
                                                            >
                                                                {m}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <span className={styles.sep}>/</span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={31}
                                            value={day}
                                            onChange={(e) => setDay(Number(e.target.value))}
                                            className={styles.dayInput}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.closeField}
                                        onClick={() => setShowDate(false)}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* URL Field */}
                        {showUrl && (
                            <motion.div
                                key="url"
                                className={styles.expandedField}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <div className={styles.fieldRow}>
                                    <LinkIcon size={14} className={styles.fieldIcon} />
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className={styles.fieldInput}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className={styles.closeField}
                                        onClick={() => { setShowUrl(false); setUrl(''); }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Image Field */}
                        {showImage && (
                            <motion.div
                                key="image"
                                className={styles.expandedField}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <div className={styles.imageWrapper}>
                                    {imageUrl ? (
                                        <div className={styles.imagePreview}>
                                            <img src={imageUrl} alt="Preview" />
                                            <button type="button" onClick={() => setImageUrl('')}>
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className={styles.uploadBtn}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Image size={14} />
                                            画像をアップロード
                                        </button>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        hidden
                                    />
                                    <button
                                        type="button"
                                        className={styles.closeField}
                                        onClick={() => { setShowImage(false); setImageUrl(''); }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Input Row */}
                    <div className={styles.titleRow}>
                        <div className={styles.emojiWrapper}>
                            <button
                                type="button"
                                className={styles.emojiBtn}
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                {emoji}
                            </button>
                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div
                                        className={styles.emojiGrid}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        {EMOJI_OPTIONS.map((e) => (
                                            <button
                                                key={e}
                                                type="button"
                                                onClick={() => { setEmoji(e); setShowEmojiPicker(false); }}
                                                className={emoji === e ? styles.selected : ''}
                                            >
                                                {e}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Dynamic Input - textarea for description, input for others */}
                        {inputMode === 'description' ? (
                            <textarea
                                ref={textareaRef}
                                placeholder={getPlaceholder()}
                                value={currentValue}
                                onChange={(e) => setCurrentValue(e.target.value)}
                                className={styles.descriptionInput}
                                disabled={isEnhancing}
                                rows={3}
                            />
                        ) : (
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={getPlaceholder()}
                                value={currentValue}
                                onChange={(e) => setCurrentValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className={styles.titleInput}
                                disabled={isEnhancing}
                            />
                        )}
                    </div>

                    {/* Bottom Bar */}
                    <div className={styles.bottomBar}>
                        <div className={styles.leftControls}>
                            {/* Animated Input Mode Toggles */}
                            <div className={styles.modeToggleGroup}>
                                {INPUT_MODES.map((item) => (
                                    <button
                                        key={item.mode}
                                        type="button"
                                        className={`${styles.modeBtn} ${inputMode === item.mode ? styles.active : ''} ${hasValue(item.mode) ? styles.hasValue : ''}`}
                                        onClick={() => handleModeChange(item.mode)}
                                        title={item.label}
                                    >
                                        {inputMode === item.mode && (
                                            <motion.div
                                                layoutId="activeModeBg"
                                                className={styles.modeBtnBg}
                                                transition={{
                                                    type: 'spring',
                                                    bounce: 0.2,
                                                    duration: 0.3,
                                                }}
                                            />
                                        )}
                                        <span className={styles.modeBtnIcon}>{item.icon}</span>
                                    </button>
                                ))}
                            </div>

                            <div className={styles.separator} />

                            {/* Other Field Toggles */}
                            <button
                                type="button"
                                className={`${styles.iconBtn} ${showDate ? styles.active : ''}`}
                                onClick={() => setShowDate(!showDate)}
                                title="日付"
                            >
                                <Calendar size={16} />
                            </button>
                            <button
                                type="button"
                                className={`${styles.iconBtn} ${showUrl || url ? styles.active : ''}`}
                                onClick={() => setShowUrl(!showUrl)}
                                title="URL"
                            >
                                <LinkIcon size={16} />
                            </button>
                            <button
                                type="button"
                                className={`${styles.iconBtn} ${showImage || imageUrl ? styles.active : ''}`}
                                onClick={() => setShowImage(!showImage)}
                                title="画像"
                            >
                                <Image size={16} />
                            </button>
                        </div>

                        <div className={styles.rightControls}>
                            {/* AI Enhance Button */}
                            <motion.button
                                type="button"
                                className={`${styles.enhanceBtn} ${isEnhancing ? styles.loading : ''}`}
                                onClick={handleEnhance}
                                disabled={!currentValue.trim() || isEnhancing}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="AIで文章を改善"
                            >
                                {isEnhancing ? (
                                    <Loader2 size={16} className={styles.spinner} />
                                ) : (
                                    <Sparkles size={16} />
                                )}
                            </motion.button>

                            {/* Submit Button */}
                            <motion.button
                                type="button"
                                className={styles.submitBtn}
                                onClick={handleSubmit}
                                disabled={!title.trim()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {editingItem ? <Check size={16} /> : <ArrowUp size={16} />}
                            </motion.button>

                            {/* Cancel Edit Button */}
                            {editingItem && (
                                <motion.button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={handleCancel}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <X size={16} />
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export const EditorSidebar = EditorInput;
