import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { HStack, Text } from '@gluestack-ui/themed';

export default function AuthLogo() {
  return (
    <View style={styles.wrapper}>
      <HStack alignItems="center" space="sm">
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Fridge Smart</Text>
      </HStack>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  logo: {
    width: 28,
    height: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2F2F2F',
  },
});