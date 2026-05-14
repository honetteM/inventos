import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  className,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const typeClass =
    type === 'title' ? 'text-3xl font-bold leading-8' :
    type === 'subtitle' ? 'text-xl font-bold' :
    type === 'defaultSemiBold' ? 'text-base font-semibold leading-6' :
    type === 'link' ? 'text-base leading-7 text-primary' :
    'text-base leading-6';

  return (
    <Text
      className={`${typeClass} ${className ?? ''}`}
      style={style}
      {...rest}
    />
  );
}
