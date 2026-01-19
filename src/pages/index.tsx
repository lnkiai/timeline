'use client';

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import jsonItems from '../../.items.json';
import siteConfig from '../../site.config';
import { ContentWrapper } from '../components/ContentWrapper';
import { HomeHero } from '../components/HomeHero';
import { Timeline } from '../components/Timeline';
import { DataManager } from '../components/DataManager';
import { EditorInput } from '../components/editor/EditorSidebar';
import { EditToggle } from '../components/editor/EditToggle';
import { useTimelineStorage } from '../hooks/useTimelineStorage';
import { useProfileStorage } from '../hooks/useProfileStorage';
import { itemsSchema } from '../schema';
import { Item } from '../types';

const IndexPage = () => {
  const initialItems = itemsSchema.parse(jsonItems);
  const {
    items,
    isLoaded,
    addItem,
    deleteItem,
    updateItem,
    setItems,
  } = useTimelineStorage(initialItems);

  const {
    profile,
    updateProfile,
    setProfile,
  } = useProfileStorage();

  const [isEditing, setIsEditing] = useState(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Merge initial items with stored items on first load
  useEffect(() => {
    if (isLoaded && items.length === 0) {
      const itemsWithIds = initialItems.map((item, index) => ({
        ...item,
        id: item.id || `initial-${index}`,
      }));
      setItems(itemsWithIds);
    }
  }, [isLoaded]);

  const handleAddItem = useCallback((item: Omit<Item, 'id' | 'excluded'>) => {
    addItem(item);
  }, [addItem]);

  const handleEditItem = useCallback((item: Item) => {
    setEditingItem(item);
  }, []);

  const handleToggleEdit = useCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);

  const handleImport = useCallback((data: { items: Item[]; profile: any }) => {
    if (data.items) {
      setItems(data.items);
    }
    if (data.profile) {
      setProfile(data.profile);
    }
  }, [setItems, setProfile]);

  return (
    <>
      <Head>
        <title>{siteConfig.title}</title>
        <link rel="canonical" href={siteConfig.siteRoot} />
        <meta property="og:title" content={siteConfig.title} />
        <meta property="og:description" content={siteConfig.description} />
        <meta name="description" content={siteConfig.description} />
      </Head>

      {/* Tools */}
      <DataManager items={items} profile={profile} onImport={handleImport} />
      <EditToggle isEditing={isEditing} onToggle={handleToggleEdit} />

      <ContentWrapper>
        <HomeHero
          isEditing={isEditing}
          profile={profile}
          onUpdateProfile={updateProfile}
        />
        <div style={{ paddingBottom: isEditing ? '100px' : '0' }}>
          <Timeline
            items={items}
            isEditing={isEditing}
            onDeleteItem={deleteItem}
            onEditItem={handleEditItem}
          />
        </div>
      </ContentWrapper>

      {/* Editor Input (visible in edit mode) */}
      {isEditing && (
        <EditorInput
          onAddItem={handleAddItem}
          onUpdateItem={updateItem}
          editingItem={editingItem}
          onCancelEdit={() => setEditingItem(null)}
        />
      )}
    </>
  );
};

export default IndexPage;
