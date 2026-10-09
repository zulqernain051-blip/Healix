import { useAppTheme, useThemeValue } from '../theme/ThemeProvider';
import type { ThemeColors } from '../theme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, StyleProp, ViewStyle } from 'react-native';


interface ShimmerLoaderProps {
  style?: StyleProp<ViewStyle>;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
}

export const ShimmerLoader: React.FC<ShimmerLoaderProps> = ({
  style,
  width = '100%',
  height = 20,
  borderRadius = 6,
}) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.shimmer,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  shimmer: {
    backgroundColor: COLORS.cardElevated,
  },
}));
