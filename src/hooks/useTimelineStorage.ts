'use client';

import { useState, useEffect, useCallback } from 'react';
import { Item } from '../types';

const STORAGE_KEY = 'timeline-items';

export function useTimelineStorage(initialItems: Item[] = []) {
    const [items, setItems] = useState<Item[]>(initialItems);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setItems(parsed);
                } catch (e) {
                    console.error('Failed to parse stored items:', e);
                    setItems(initialItems);
                }
            } else {
                setItems(initialItems);
            }
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage whenever items change
    useEffect(() => {
        if (isLoaded && typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addItem = useCallback((item: Omit<Item, 'id' | 'excluded'>) => {
        const newItem: Item = {
            ...item,
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            excluded: false,
        };
        setItems(prev => {
            const newItems = [...prev, newItem];
            // Sort by date descending
            return newItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        return newItem;
    }, []);

    const updateItem = useCallback((id: string, updates: Partial<Item>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    }, []);

    const deleteItem = useCallback((id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setItems([]);
    }, []);

    return {
        items,
        isLoaded,
        addItem,
        updateItem,
        deleteItem,
        clearAll,
        setItems,
    };
}
