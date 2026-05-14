import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {};

export function ThemedView({ style, className, ...otherProps }: ThemedViewProps) {
  return <View className={className} style={style} {...otherProps} />;
}
