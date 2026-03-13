import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  onPress?: () => void;
}

const getExpiryStatus = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'warning';
  return 'good';
};

export const ProductCard: React.FC<Props> = ({ name, quantity, unit, expiryDate, onPress }) => {
  const status = getExpiryStatus(expiryDate);
  const statusColor = status === 'expired' ? '#ff4444' : status === 'warning' ? '#ffbb33' : '#00C851';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.details}>{quantity} {unit}</Text>
      </View>
      <View style={[styles.expiry, { backgroundColor: statusColor }]}>
        <Text style={styles.expiryText}>{new Date(expiryDate).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  details: { fontSize: 14, color: '#666' },
  expiry: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  expiryText: { color: '#fff', fontWeight: '600' },
});