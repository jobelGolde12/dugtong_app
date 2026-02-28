#!/usr/bin/env python3
"""Script to update DonorManagementScreen.tsx to use theme colors"""

import re

with open('app/screens/dashboard/DonorManagementScreen.tsx', 'r') as f:
    content = f.read()

# Remove the COLORS constant block (lines 60-112)
content = re.sub(
    r'\n// ============ DESIGN SYSTEM CONSTANTS ============\nconst COLORS = \{[^}]+\};',
    '',
    content,
    flags=re.DOTALL
)

# Replace COLORS references with colors.
# Map COLORS.*[number] to colors.*
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
]

for old, new in replacements:
    content = re.sub(old, new, content)

# Remove 'gradient' from COLORS if referenced
content = re.sub(r'COLORS\.gradient\.[a-zA-Z]+', 'colors.primary', content)

with open('app/screens/dashboard/DonorManagementScreen.tsx', 'w') as f:
    f.write(content)

print("Updated DonorManagementScreen.tsx to use theme colors")
