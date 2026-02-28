#!/usr/bin/env python3
"""
Comprehensive script to update DonorManagementScreen.tsx to use theme colors.
This script:
1. Adds useTheme import
2. Removes COLORS constant
3. Replaces all COLORS.* references with colors.*
4. Adds const { colors } = useTheme() to the main component
5. Wraps reusable components in a factory function
"""

import re

with open('app/screens/dashboard/DonorManagementScreen.tsx', 'r') as f:
    content = f.read()

# 1. Add useTheme import after SafeAreaView
content = re.sub(
    r"import { SafeAreaView } from 'react-native-safe-area-context';",
    "import { SafeAreaView } from 'react-native-safe-area-context';\nimport { useTheme } from '../../../contexts/ThemeContext';",
    content
)

# 2. Remove COLORS constant block (from "// ============ DESIGN SYSTEM CONSTANTS ===========" to "} as const;" after gradient)
content = re.sub(
    r'\n// ============ DESIGN SYSTEM CONSTANTS ============\nconst COLORS = \{.*?\n\} as const;',
    '',
    content,
    flags=re.DOTALL
)

# 3. Fix SHADOWS to not use COLORS
content = re.sub(r'shadowColor: COLORS\.primary\[500\]', 'shadowColor: \'#000\'', content)

# 4. Replace all COLORS.* references with colors.*
replacements = [
    # Primary colors
    (r'COLORS\.primary\[50\]', 'colors.primary + \'20\''),
    (r'COLORS\.primary\[100\]', 'colors.primary + \'30\''),
    (r'COLORS\.primary\[300\]', 'colors.primary'),
    (r'COLORS\.primary\[500\]', 'colors.primary'),
    (r'COLORS\.primary\[600\]', 'colors.primary'),
    
    # Neutral colors  
    (r'COLORS\.neutral\[50\]', 'colors.surface'),
    (r'COLORS\.neutral\[100\]', 'colors.surfaceVariant'),
    (r'COLORS\.neutral\[200\]', 'colors.border'),
    (r'COLORS\.neutral\[300\]', 'colors.border'),
    (r'COLORS\.neutral\[400\]', 'colors.textSecondary'),
    (r'COLORS\.neutral\[500\]', 'colors.textSecondary'),
    (r'COLORS\.neutral\[600\]', 'colors.text'),
    (r'COLORS\.neutral\[700\]', 'colors.text'),
    (r'COLORS\.neutral\[900\]', 'colors.text'),
    
    # Success colors
    (r'COLORS\.success\[50\]', 'colors.success + \'20\''),
    (r'COLORS\.success\[500\]', 'colors.success'),
    (r'COLORS\.success\[600\]', 'colors.success'),
    
    # Warning colors
    (r'COLORS\.warning\[50\]', 'colors.warning + \'20\''),
    (r'COLORS\.warning\[500\]', 'colors.warning'),
    (r'COLORS\.warning\[600\]', 'colors.warning'),
    
    # Error colors
    (r'COLORS\.error\[50\]', 'colors.error + \'20\''),
    (r'COLORS\.error\[500\]', 'colors.error'),
    (r'COLORS\.error\[600\]', 'colors.error'),
    
    # Surface colors
    (r'COLORS\.surface\.light', 'colors.card'),
    
    # Gradient
    (r'COLORS\.gradient\.[a-zA-Z]+', 'colors.primary'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

# 5. Add const { colors } = useTheme() to main component
content = re.sub(
    r'(const DonorManagementScreen: React\.FC = \(\) => \{)\n(\s+const \[donors)',
    r'\1\n  const { colors } = useTheme();\n\2',
    content
)

# 6. Wrap reusable components in createComponents factory
# Find the reusable components section and wrap it
components_start = content.find('// ============ REUSABLE COMPONENTS ============')
if components_start != -1:
    # Replace the section header
    content = content.replace(
        '// ============ REUSABLE COMPONENTS ============',
        '// ============ REUSABLE COMPONENTS FACTORY ============\nconst createComponents = (colors: any) => {'
    )
    
    # Find where screen components start and close the factory before it
    screen_components = content.find('// ============ SCREEN COMPONENTS ============')
    if screen_components != -1:
        # Insert closing brace before screen components
        content = content[:screen_components] + '\n};\n\n// ============ SCREEN COMPONENTS ============' + content[screen_components + len('// ============ SCREEN COMPONENTS ============'):]

# 7. Update component usages in the main render to use components from factory
# Find where the main component returns and add const components = createComponents(colors);
content = re.sub(
    r'(const \{ colors \} = useTheme\(\);)',
    r'\1\n  const components = createComponents(colors);',
    content
)

with open('app/screens/dashboard/DonorManagementScreen.tsx', 'w') as f:
    f.write(content)

print("Successfully updated DonorManagementScreen.tsx to use theme colors")
print("Note: You may need to manually adjust component usages to use components.Container, components.Text, etc.")
