import { normalizeBooleanProp, BOOLEAN_PROPS } from './booleanHelpers';

/**
 * Hook to normalize all boolean props in a component
 * @param props - Component props object
 * @returns Props with all boolean values normalized
 */
export function useNormalizedProps(props: Record<string, any>): Record<string, any> {
  const normalizedProps: Record<string, any> = { ...props };

  // Normalize common boolean props
  BOOLEAN_PROPS.forEach(propName => {
    if (propName in props) {
      normalizedProps[propName] = normalizeBooleanProp(
        props[propName], 
        propName
      );
    }
  });

  return normalizedProps;
}

/**
 * Specific normalization for React Native ScrollView props
 */
export function normalizeScrollViewProps(props: Record<string, any>): Record<string, any> {
  const {
    showsVerticalScrollIndicator,
    showsHorizontalScrollIndicator,
    scrollEnabled,
    removeClippedSubviews,
    ...rest
  } = props;

  return {
    ...rest,
    showsVerticalScrollIndicator: normalizeBooleanProp(showsVerticalScrollIndicator, 'showsVerticalScrollIndicator', true),
    showsHorizontalScrollIndicator: normalizeBooleanProp(showsHorizontalScrollIndicator, 'showsHorizontalScrollIndicator', true),
    scrollEnabled: normalizeBooleanProp(scrollEnabled, 'scrollEnabled', true),
    removeClippedSubviews: normalizeBooleanProp(removeClippedSubviews, 'removeClippedSubviews', false),
  };
}

/**
 * Specific normalization for React Native TextInput props
 */
export function normalizeTextInputProps(props: Record<string, any>): Record<string, any> {
  const {
    editable,
    multiline,
    secureTextEntry,
    autoFocus,
    ...rest
  } = props;

  return {
    ...rest,
    editable: normalizeBooleanProp(editable, 'editable', true),
    multiline: normalizeBooleanProp(multiline, 'multiline', false),
    secureTextEntry: normalizeBooleanProp(secureTextEntry, 'secureTextEntry', false),
    autoFocus: normalizeBooleanProp(autoFocus, 'autoFocus', false),
  };
}

/**
 * Specific normalization for React Native TouchableOpacity/TouchableHighlight props
 */
export function normalizeTouchableProps(props: Record<string, any>): Record<string, any> {
  const {
    disabled,
    activeOpacity,
    ...rest
  } = props;

  return {
    ...rest,
    disabled: normalizeBooleanProp(disabled, 'disabled', false),
    activeOpacity: typeof activeOpacity === 'number' ? activeOpacity : 0.2,
  };
}

/**
 * Utility function to normalize boolean props
 * Use this by wrapping your component props: const normalizedProps = withBooleanProps(props);
 */
export function withBooleanProps<T extends Record<string, any>>(props: T): T {
  const normalizedProps: Record<string, any> = { ...props };

  // Normalize common boolean props
  BOOLEAN_PROPS.forEach(propName => {
    if (propName in props) {
      normalizedProps[propName] = normalizeBooleanProp(
        props[propName], 
        propName
      );
    }
  });

  return normalizedProps as T;
}

// Prevent Expo Router from treating this utility file as a route
export default null;