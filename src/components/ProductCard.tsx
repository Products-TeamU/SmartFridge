import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface Props {
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  onPress?: () => void;
  onLongPress?: () => void;
  onDelete?: () => void;
  onUse?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
}

const getExpiryStatus = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'warning';
  return 'good';
};

export const ProductCard: React.FC<Props> = ({
  name,
  quantity,
  unit,
  expiryDate,
  onPress,
  onLongPress,
  onDelete,
  onUse,
  selectionMode = false,
  selected = false,
}) => {
  const status = getExpiryStatus(expiryDate);
  const statusColor =
    status === 'expired'
      ? '#ff4444'
      : status === 'warning'
      ? '#ffbb33'
      : '#00C851';

  const renderLeftActions = () => {
    if (!onUse) return null;

    return (
      <TouchableOpacity style={styles.useAction} onPress={onUse}>
        <Text style={styles.useActionText}>−1</Text>
      </TouchableOpacity>
    );
  };

  const renderRightActions = () => {
    if (!onDelete) return null;

    return (
      <TouchableOpacity style={styles.deleteAction} onPress={onDelete}>
        <Text style={styles.deleteActionText}>Удалить?</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={!selectionMode && onUse ? renderLeftActions : undefined}
      renderRightActions={!selectionMode && onDelete ? renderRightActions : undefined}
    >
      <TouchableOpacity
        style={[
          styles.card,
          selectionMode && styles.cardSelectionMode,
          selected && styles.cardSelected,
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={300}
        activeOpacity={0.85}
      >
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.details}>
            {quantity} {unit}
          </Text>
        </View>

        <View style={styles.rightSide}>
          {selectionMode && (
            <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
              <Text style={styles.checkboxText}>{selected ? '✓' : ''}</Text>
            </View>
          )}

          <View style={[styles.expiry, { backgroundColor: statusColor }]}>
            <Text style={styles.expiryText}>
              {new Date(expiryDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  cardSelectionMode: {
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  info: {
    flex: 1,
    paddingRight: 12,
  },
  rightSide: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  expiry: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expiryText: {
    color: '#fff',
    fontWeight: '600',
  },
  useAction: {
    width: 90,
    marginVertical: 4,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  useActionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  deleteAction: {
    width: 100,
    marginVertical: 4,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionText: {
    color: '#fff',
    fontWeight: '700',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxText: {
    color: '#fff',
    fontWeight: '700',
  },
});