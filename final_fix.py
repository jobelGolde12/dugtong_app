#!/usr/bin/env python3
"""
Final script to properly update DonorManagementScreen.tsx
"""
import re

with open('app/screens/dashboard/DonorManagementScreen.tsx', 'r') as f:
    lines = f.readlines()

# Find key sections
reusable_start = None
reusable_end = None
main_start = None
colors_line = None

for i, line in enumerate(lines):
    if '// ============ REUSABLE COMPONENTS ============' in line:
        reusable_start = i
    if reusable_start and '// ============ SCREEN COMPONENTS ============' in line:
        reusable_end = i
        break
    if 'const DonorManagementScreen: React.FC = () => {' in line:
        main_start = i

if reusable_start is None or reusable_end is None or main_start is None:
    print(f"Error: Could not find all sections.")
    exit(1)

print(f"Reusable components: lines {reusable_start+1} to {reusable_end+1}")
print(f"Main component: line {main_start+1}")

# Check if colors line exists, if not add it
for i in range(main_start, min(main_start + 10, len(lines))):
    if 'const { colors } = useTheme();' in lines[i]:
        colors_line = i
        break

if colors_line is None:
    # Add colors line after function declaration
    colors_line = main_start + 1
    lines.insert(colors_line, '  const { colors } = useTheme();\n')
    print(f"Added 'const {{ colors }} = useTheme();' at line {colors_line+1}")
    # Adjust indices
    if reusable_start > colors_line:
        reusable_start += 1
    if reusable_end > colors_line:
        reusable_end += 1
    if main_start > colors_line:
        main_start += 1

# Extract reusable components section
components_section = lines[reusable_start:reusable_end]
components_str = ''.join(components_section)

# Rename Text component to CustomText to avoid conflict with React Native Text
components_str = components_str.replace('const Text = ({ children, style, variant', 'const CustomText = ({ children, style, variant')

# Remove reusable components from original location
new_lines = lines[:reusable_start] + lines[reusable_end:]

# Re-find main_start and colors_line since line numbers changed
main_start = None
colors_line = None
for i, line in enumerate(new_lines):
    if 'const DonorManagementScreen: React.FC = () => {' in line:
        main_start = i
    if main_start is not None and 'const { colors } = useTheme();' in line:
        colors_line = i
        break

if colors_line:
    insert_pos = colors_line + 1
    
    # Add the components section with proper indentation
    indented_components = []
    for line in components_str.split('\n'):
        if line.strip():
            indented_components.append('  ' + line + '\n')
        else:
            indented_components.append('\n')
    
    # Insert components
    new_lines = new_lines[:insert_pos] + indented_components + new_lines[insert_pos:]
    
    # Now replace Text usages in the rest of the file
    # Find where our CustomText component definition ends (look for the closing of Badge component)
    custom_text_end = None
    for i in range(insert_pos, len(new_lines)):
        if 'const Badge:' in new_lines[i]:
            # Find end of Badge component
            for j in range(i, min(i+50, len(new_lines))):
                if '};' in new_lines[j] and j > i + 10:
                    custom_text_end = j
                    break
        if custom_text_end:
            break
    
    if custom_text_end:
        # Replace Text usages after custom_text_end with CustomText
        for i in range(custom_text_end + 1, len(new_lines)):
            line = new_lines[i]
            # Skip lines with Animated.Text
            if 'Animated.Text' not in line and 'React.Text' not in line:
                # Replace <Text  or <Text> with <CustomText
                if '<Text ' in line:
                    new_lines[i] = line.replace('<Text ', '<CustomText ')
                if '<Text>' in line:
                    new_lines[i] = new_lines[i].replace('<Text>', '<CustomText>')

with open('app/screens/dashboard/DonorManagementScreen.tsx', 'w') as f:
    f.writelines(new_lines)

print("Done! Components moved and Text renamed to CustomText")
