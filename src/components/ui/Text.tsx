import React from 'react';
import {Text as RNText, TextStyle, StyleSheet} from 'react-native';
import {COLORS, TYPOGRAPHY, FontSize, FontWeight} from '@constants';

export interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  size?: FontSize;
  weight?: FontWeight;
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: TextStyle;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  size,
  weight,
  color,
  align = 'left',
  numberOfLines,
  style,
}) => {
  const textStyle = [
    styles.base,
    styles[variant],
    size && {fontSize: TYPOGRAPHY.sizes[size]},
    weight && {fontWeight: TYPOGRAPHY.weights[weight]},
    color && {color},
    align && {textAlign: align},
    style,
  ];

  return (
    <RNText style={textStyle} numberOfLines={numberOfLines}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.weights.normal,
  },

  // Variants
  h1: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: TYPOGRAPHY.sizes.xxxl * TYPOGRAPHY.lineHeights.tight,
    marginBottom: TYPOGRAPHY.sizes.base,
  },
  h2: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: TYPOGRAPHY.sizes.xxl * TYPOGRAPHY.lineHeights.tight,
    marginBottom: TYPOGRAPHY.sizes.sm,
  },
  h3: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: TYPOGRAPHY.sizes.xl * TYPOGRAPHY.lineHeights.normal,
    marginBottom: TYPOGRAPHY.sizes.sm,
  },
  body: {
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: TYPOGRAPHY.sizes.base * TYPOGRAPHY.lineHeights.normal,
  },
  caption: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.normal,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.normal,
  },
});