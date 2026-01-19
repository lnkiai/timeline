'use client';

import { useState } from 'react';
import { Pencil, Check, X, Upload } from 'lucide-react';
import styles from '../styles/components/HomeHero.module.scss';
// TwitterIcon import removed

interface ProfileData {
  title: string;
  description: string;
  iconUrl: string;
}

interface HomeHeroProps {
  isEditing?: boolean;
  profile?: ProfileData;
  onUpdateProfile?: (updates: Partial<ProfileData>) => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  isEditing = false,
  profile,
  onUpdateProfile,
}) => {
  const [editingField, setEditingField] = useState<'title' | 'description' | null>(null);
  const [editValue, setEditValue] = useState('');

  const title = profile?.title || "Hi, I'm catnose";
  const description = profile?.description || "Designer, developer, maker, dog & cat lover.";
  const iconUrl = profile?.iconUrl || "/icon.png";

  const handleStartEdit = (field: 'title' | 'description') => {
    if (!isEditing) return;
    setEditingField(field);
    setEditValue(field === 'title' ? title : description);
  };

  const handleSave = () => {
    if (!editingField || !onUpdateProfile) return;
    // For description, preserve line breaks or handle as needed
    onUpdateProfile({ [editingField]: editValue });
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateProfile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ iconUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Profile Section (Icon + Title) */}
      <div className={styles.profileHeader}>
        <div className={`${styles.iconWrapper} ${isEditing ? styles.editable : ''}`}>
          <img src={iconUrl} alt="Icon" width={64} height={64} style={{ objectFit: 'cover' }} />
          {isEditing && (
            <label className={styles.iconOverlay}>
              <Upload size={20} />
              <input
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                hidden
              />
            </label>
          )}
        </div>

        {editingField === 'title' ? (
          <div className={styles.editField}>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className={styles.editInput}
            />
            <button onClick={handleSave} className={styles.saveBtn}>
              <Check size={14} />
            </button>
            <button onClick={handleCancel} className={styles.cancelBtn}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <h1
            className={`${styles.title} ${isEditing ? styles.editable : ''}`}
            onClick={() => handleStartEdit('title')}
          >
            {title}
            {isEditing && <Pencil size={14} className={styles.editIcon} />}
          </h1>
        )}
      </div>

      {/* Description Section */}
      {editingField === 'description' ? (
        <div className={styles.editField}>
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className={styles.editTextarea}
            rows={3}
          />
          <button onClick={handleSave} className={styles.saveBtn}>
            <Check size={14} />
          </button>
          <button onClick={handleCancel} className={styles.cancelBtn}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          className={`${styles.descriptionWrapper} ${isEditing ? styles.editable : ''}`}
          onClick={() => handleStartEdit('description')}
        >
          <p className={styles.description}>
            {description}
          </p>
          {isEditing && <Pencil size={14} className={styles.editIcon} />}
        </div>
      )}
    </div>
  );
};
