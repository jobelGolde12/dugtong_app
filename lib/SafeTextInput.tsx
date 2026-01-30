import React, { forwardRef } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { normalizeTextInputProps } from './utils/booleanHOC';

/**
 * Safe TextInput component that automatically normalizes all boolean props
 * to prevent Android runtime crashes from string-to-boolean casting.
 */
const SafeTextInput = forwardRef<any, TextInputProps>((props, ref) => {
  const normalizedProps = normalizeTextInputProps(props);
  return <TextInput ref={ref} {...normalizedProps} />;
});

SafeTextInput.displayName = 'SafeTextInput';

export default SafeTextInput;