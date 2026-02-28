#!/usr/bin/env python3
with open('app/screens/dashboard/DonorManagementScreen.tsx', 'r') as f:
    lines = f.readlines()

# Find sections
screen_components_start = None
screen_components_end = None

for i, line in enumerate(lines):
    if '// ============ SCREEN COMPONENTS ============' in line:
        screen_components_start = i
    if screen_components_start is not None and '// ============ MAIN SCREEN COMPONENT ============' in line:
        screen_components_end = i
        break

if screen_components_start is None or screen_components_end is None:
    print(f"Screen components not found properly: start={screen_components_start}, end={screen_components_end}")
    exit(1)

print(f"Screen components: {screen_components_start+1} to {screen_components_end+1}")

# Extract screen components
screen_components = lines[screen_components_start:screen_components_end]

# Remove from original location
new_lines = lines[:screen_components_start] + lines[screen_components_end:]

# Find where to insert (before donors state)
insert_pos = None
for i, line in enumerate(new_lines):
    if 'const [donors, setDonors]' in line:
        insert_pos = i
        break

if insert_pos:
    # Add screen components with proper indentation  
    indented = []
    for line in screen_components:
        if line.strip():
            indented.append('  ' + line)
        else:
            indented.append('\n')
    
    # Insert
    new_lines = new_lines[:insert_pos] + indented + new_lines[insert_pos:]
    
    with open('app/screens/dashboard/DonorManagementScreen.tsx', 'w') as f:
        f.writelines(new_lines)
    print(f"Moved screen components to line {insert_pos+1}")
else:
    print("Could not find insert position")
