import React, { forwardRef } from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import { normalizeScrollViewProps } from './utils/booleanHOC';

/**
 * Safe ScrollView component that automatically normalizes all boolean props
 * to prevent Android runtime crashes from string-to-boolean casting.
 */
const SafeScrollView = forwardRef<ScrollView, ScrollViewProps>((props, ref) => {
  const normalizedProps = normalizeScrollViewProps(props);
  return <ScrollView ref={ref} {...normalizedProps} />;
});

SafeScrollView.displayName = 'SafeScrollView';

export default SafeScrollView;