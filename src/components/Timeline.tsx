import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Pencil } from 'lucide-react';
import {
  formatDate,
  groupByKey,
} from '../lib/helper';
import styles from '../styles/components/Timeline.module.scss';
import editorStyles from '../styles/components/Editor.module.scss';
import { Item } from '../types';

interface TimelineItemProps {
  item: Item;
  isEditing: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (item: Item) => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ item, isEditing, onDelete, onEdit }) => {
  return (
    <motion.div
      className={`${styles.itemLink} ${isEditing ? editorStyles.itemEditing : ''}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <a href={item.url || '#'} className={styles.itemContent}>
        <div className={styles.itemIcon}>
          {item.emoji && <span className={styles.itemEmoji}>{item.emoji}</span>}
        </div>
        <div className={styles.itemMeta}>
          <div>
            {!!item.action?.length && (
              <span className={styles.itemAction}>{item.action}</span>
            )}
            <time className={styles.itemDate}>{formatDate(item.date)}</time>
          </div>
        </div>
        <h2 className={styles.itemTitle}>{item.title}</h2>

        {item.description && (
          <p className={styles.itemDescription}>{item.description}</p>
        )}

        {item.imageUrl && (
          <div className={styles.itemImage}>
            <img src={item.imageUrl} alt={item.title} />
          </div>
        )}
      </a>

      <AnimatePresence>
        {isEditing && item.id && (
          <>
            {/* Edit Button */}
            {onEdit && (
              <motion.button
                className={editorStyles.editItemButton}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(item);
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Pencil size={16} />
              </motion.button>
            )}
            {/* Delete Button */}
            {onDelete && (
              <motion.button
                className={editorStyles.deleteItemButton}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(item.id!);
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 size={16} />
              </motion.button>
            )}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface TimelineProps {
  items: Item[];
  isEditing?: boolean;
  onDeleteItem?: (id: string) => void;
  onEditItem?: (item: Item) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  items,
  isEditing = false,
  onDeleteItem,
  onEditItem,
}) => {
  const itemGroups = groupByKey(items, (item) => Number(item.date.slice(0, 4)));

  return (
    <section className={styles.container}>
      <AnimatePresence mode="popLayout">
        {itemGroups.map((group) => {
          const [year, groupItems] = group;
          return (
            <motion.section
              key={`group-${year}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={styles.year}>{year}</div>
              <div className={styles.itemsContainer}>
                <AnimatePresence mode="popLayout">
                  {groupItems.map((item, i) => (
                    <TimelineItem
                      key={item.id || `item-${i}`}
                      item={item}
                      isEditing={isEditing}
                      onDelete={onDeleteItem}
                      onEdit={onEditItem}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          );
        })}
      </AnimatePresence>
    </section>
  );
};
