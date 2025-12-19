import React from 'react';
import { View, StyleSheet } from 'react-native';
import { defaultColors } from '../../constants/colors';

interface ProgressBarProps {
  percentage: number;
  color?: string;
  height?: number;
  backgroundColor?: string;
}

export function ProgressBar({
  percentage,
  color = defaultColors.primary,
  height = 6,
  backgroundColor = defaultColors.background
}: ProgressBarProps) {
  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            backgroundColor: color,
            height
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 3,
  },
});