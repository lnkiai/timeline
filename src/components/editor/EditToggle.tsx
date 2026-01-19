'use client';

import { motion } from 'framer-motion';
import { Eye, Pencil } from 'lucide-react';
import styles from '../../styles/components/Editor.module.scss';

interface EditToggleProps {
    isEditing: boolean;
    onToggle: () => void;
}

export const EditToggle: React.FC<EditToggleProps> = ({ isEditing, onToggle }) => {
    return (
        <div className={styles.editToggle}>
            <motion.button
                className={styles.toggleBtn}
                onClick={onToggle}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <motion.div
                    className={styles.toggleSlider}
                    initial={false}
                    animate={{ x: isEditing ? 0 : '100%' }}
                    transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 35,
                    }}
                />
                <span className={`${styles.toggleOption} ${isEditing ? styles.active : ''}`}>
                    <Pencil size={14} />
                    編集
                </span>
                <span className={`${styles.toggleOption} ${!isEditing ? styles.active : ''}`}>
                    <Eye size={14} />
                    プレビュー
                </span>
            </motion.button>
        </div>
    );
};
