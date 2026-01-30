import React, { forwardRef } from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { normalizeTouchableProps } from './utils/booleanHOC';

/**
 * Safe TouchableOpacity component that automatically normalizes all boolean props
 * to prevent Android runtime crashes from string-to-boolean casting.
 */
const SafeTouchableOpacity = forwardRef<any, TouchableOpacityProps>((props, ref) => {
  const normalizedProps = normalizeTouchableProps(props);
  return <TouchableOpacity ref={ref} {...normalizedProps} />;
});

SafeTouchableOpacity.displayName = 'SafeTouchableOpacity';

export default SafeTouchableOpacity;