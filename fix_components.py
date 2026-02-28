#!/usr/bin/env python3
import re

with open('app/screens/dashboard/DonorManagementScreen.tsx', 'r') as f:
    content = f.read()

# Find the reusable components section
components_match = re.search(
    r'(// ============ REUSABLE COMPONENTS FACTORY ============.*?)(\n// ============ SCREEN COMPONENTS ============)',
    content,
    re.DOTALL
)

if components_match:
    components_section = components_match.group(1)
    
    # Remove the factory wrapper
    components_section = components_section.replace(
        '// ============ REUSABLE COMPONENTS FACTORY ============\nconst createComponents = (colors: any) => {',
        '// ============ REUSABLE COMPONENTS (will be moved inside main component) ============'
    )
    
    # Count braces to find where to close
    # For now, just add closing brace at the end
    components_section = components_section + '\n}'
    
    content = content.replace(components_match.group(0), components_section + '\n// ============ SCREEN COMPONENTS ============')

# Now move the components inside the main component
# Find main component start
main_match = re.search(
    r'(// ============ MAIN SCREEN COMPONENT ============\nconst DonorManagementScreen: React\.FC = \(\) => \{\n  const \{ colors \} = useTheme\(\);)',
    content
)

if main_match:
    # Find where reusable components are defined
    reusable_start = content.find('// ============ REUSABLE COMPONENTS (will be moved inside main component) ============')
    reusable_end = content.find('// ============ SCREEN COMPONENTS ============', reusable_start)
    
    if reusable_start != -1 and reusable_end != -1:
        # Extract components section (without the closing brace)
        components_code = content[reusable_start:reusable_end].replace(
            '// ============ REUSABLE COMPONENTS (will be moved inside main component) ============',
            '// ============ REUSABLE COMPONENTS ============'
        ).rstrip()
        
        # Remove the trailing }\n
        if components_code.endswith('\n}\n'):
            components_code = components_code[:-3]
        elif components_code.endswith('\n}'):
            components_code = components_code[:-2]
        
        # Remove from original location
        content = content[:reusable_start] + content[reusable_end:]
        
        # Insert after const { colors } = useTheme();
        insert_pos = content.find('const { colors } = useTheme();') + len('const { colors } = useTheme();')
        content = content[:insert_pos] + '\n\n' + components_code + '\n' + content[insert_pos:]

with open('app/screens/dashboard/DonorManagementScreen.tsx', 'w') as f:
    f.write(content)

print("Moved components inside main component")
