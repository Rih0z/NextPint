import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import {COLORS, TYPOGRAPHY, SPACING} from '@constants';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    isDisabled && styles.disabled,
    style,
  ];

  const buttonTextStyle = [
    styles.textBase,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? COLORS.textLight : COLORS.primary}
        />
      ) : (
        <Text style={buttonTextStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  text: {
    backgroundColor: 'transparent',
  },

  // Sizes
  small: {
    height: 36,
    paddingHorizontal: SPACING.base,
  },
  medium: {
    height: 44,
    paddingHorizontal: SPACING.lg,
  },
  large: {
    height: 52,
    paddingHorizontal: SPACING.xl,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },

  // Text styles
  textBase: {
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  primaryText: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  secondaryText: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  outlineText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  textText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.base,
  },

  // Text sizes
  smallText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  mediumText: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
  largeText: {
    fontSize: TYPOGRAPHY.sizes.lg,
  },

  // Disabled text
  disabledText: {
    opacity: 0.7,
  },
});