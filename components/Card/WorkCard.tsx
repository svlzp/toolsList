import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WorkOvernight } from '../../store/api/workOvernightApi';

interface WorkCardProps {
  work: WorkOvernight;
  onPress: () => void;
  onDelete?: (id: number, title: string) => void;
  onUpdateQuantity?: (rt: string, quantity: number) => void;
  isAdmin?: boolean;
}

export const WorkCard: React.FC<WorkCardProps> = ({
  work,
  onPress,
  onDelete,
  onUpdateQuantity,
  isAdmin = false,
}) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.workItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.workHeader}>
        <View style={styles.workHeaderContent}>
          <Text style={styles.workTitle}>{work.title}</Text>
          <Text style={styles.workRt}>RT: {work.rt}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            work.isArchived && styles.statusArchived,
          ]}
        >
          <Text style={styles.statusText}>
            {work.isArchived ? t('works.archived') : t('works.active')}
          </Text>
        </View>
      </View>

      {work.description && (
        <Text style={styles.workDescription}>{work.description}</Text>
      )}

      <View style={styles.workInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>{t('works.quantity')}:</Text>
          <Text style={styles.infoValue}>{work.quantity}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>{t('works.completed')}:</Text>
          <Text style={styles.infoValue}>{work.completed}</Text>
        </View>
        {work.manufacturingTime && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              {t('works.manufacturingTime')}:
            </Text>
            <Text style={styles.infoValue}>{work.manufacturingTime}</Text>
          </View>
        )}
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>{t('common.created')}:</Text>
          <Text style={styles.infoValue}>
            {new Date(work.createdAt).toLocaleDateString('ru-RU')}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>{t('common.updated')}:</Text>
          <Text style={styles.infoValue}>
            {new Date(work.updatedAt).toLocaleDateString('ru-RU')}
          </Text>
        </View>
      </View>

      <View style={styles.workQuantity}>
        <Text style={styles.quantityLabel}>{t('works.manageQuantity')}</Text>
        {!work.isArchived && !isAdmin && onUpdateQuantity && (
          <View style={styles.quantityButtons}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                onUpdateQuantity(work.rt, Math.max(0, work.quantity - 1))
              }
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onUpdateQuantity(work.rt, work.quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isAdmin && onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(work.id, work.title)}
        >
          <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  workItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  workHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workHeaderContent: {
    flex: 1,
    marginRight: 12,
  },
  workTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  workRt: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#34C759',
  },
  statusArchived: {
    backgroundColor: '#FF9500',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  workDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  workInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  workQuantity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 12,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  quantityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
