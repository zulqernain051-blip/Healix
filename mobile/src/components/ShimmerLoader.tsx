import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../theme';

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

const styles = StyleSheet.create({
  shimmer: {
    backgroundColor: COLORS.cardElevated,
  },
});
