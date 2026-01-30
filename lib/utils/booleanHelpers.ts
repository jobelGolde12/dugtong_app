import React from 'react';

/**
 * Boolean normalization utilities to prevent Android runtime crashes
 * caused by string-to-boolean casting issues.
 */

/**
 * Safely converts any value to a boolean
 * @param value - The value to convert
 * @param defaultValue - Default value if conversion fails (default: false)
 * @returns A guaranteed boolean value
 */
export const toBoolean = (value: any, defaultValue: boolean = false): boolean => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return defaultValue;
  }

  // Handle boolean values directly
  if (typeof value === 'boolean') {
    return value;
  }

  // Handle string values
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim();
    if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
      return true;
    }
    if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
      return false;
    }
    // Fallback for non-boolean strings
    return defaultValue;
  }

  // Handle numeric values
  if (typeof value === 'number') {
    return value === 1;
  }

  // For all other types, return the default value for safety
  return defaultValue;
};

/**
 * Enhanced boolean conversion with error handling and logging
 * @param value - The value to convert
 * @param defaultValue - Default value if conversion fails (default: false)
 * @param context - Context for error logging
 * @returns A guaranteed boolean value
 */
export const normalizeBoolean = (
  value: any, 
  defaultValue: boolean = false, 
  context?: string
): boolean => {
  try {
    const result = toBoolean(value, defaultValue);
    
    // Log conversion in development for debugging
    if (__DEV__ && context && typeof value !== 'boolean') {
      console.log(`[BooleanConversion] ${context}: ${JSON.stringify(value)} -> ${result}`);
    }
    
    return result;
  } catch (error) {
    console.warn(`Boolean conversion failed${context ? ` in ${context}` : ''}:`, error);
    return defaultValue;
  }
};

/**
 * Creates a typed useState hook with boolean normalization
 * @param initialValue - Initial value for state
 * @returns Standard useState tuple with boolean typing
 */
export const useBooleanState = (initialValue: any = false): [boolean, (value: any) => void] => {
  const [state, setState] = React.useState(() => normalizeBoolean(initialValue, false, 'useState'));
  
  const setNormalizedState = React.useCallback((value: any) => {
    setState(normalizeBoolean(value, false, 'setState'));
  }, []);
  
  return [state, setNormalizedState];
};

/**
 * Defensive boolean prop handler for React components
 * @param value - Prop value that should be boolean
 * @param propName - Name of the prop for error logging
 * @param defaultValue - Default value if conversion fails
 * @returns A guaranteed boolean value
 */
export const normalizeBooleanProp = (
  value: any, 
  propName: string, 
  defaultValue: boolean = false
): boolean => {
  return normalizeBoolean(value, defaultValue, `prop.${propName}`);
};

/**
 * Common React Native props that require boolean normalization
 */
export const BOOLEAN_PROPS = [
  'visible',
  'enabled', 
  'disabled',
  'secureTextEntry',
  'editable',
  'multiline',
  'horizontal',
  'scrollEnabled',
  'autoFocus',
  'collapsable',
  'showsHorizontalScrollIndicator',
  'showsVerticalScrollIndicator',
  'useNativeDriver',
  'transparent',
  'keyboardShouldPersistTaps',
  'removeClippedSubviews',
  'automaticallyAdjustContentInsets',
  'bounces',
  'canCancelContentTouches',
  'centerContent',
  'decelerationRate',
  'directionalLockEnabled',
  'disableIntervalMomentum',
  'endFillColor',
  'fadingEdgeLength',
  'invertStickyHeaders',
  'nestedScrollEnabled',
  'overScrollMode',
  'pagingEnabled',
  'persistentScrollbar',
  'pinchGestureEnabled',
  'scrollEventThrottle',
  'scrollsToTop',
  'snapToAlignment',
  'snapToEnd',
  'snapToStart',
  'zoomScale',
] as const;

// Prevent Expo Router from treating this utility file as a route
export default null;