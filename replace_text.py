#!/usr/bin/env python3
with open('app/screens/dashboard/DonorManagementScreen.tsx', 'r') as f:
    content = f.read()

# Find the start of main component function body
main_start = content.find('const DonorManagementScreen: React.FC = () => {')
if main_start == -1:
    print("Could not find main component")
    exit(1)

# Split
before_main = content[:main_start]
main_body = content[main_start:]

# Replace Text with CustomText in main body only, preserving Animated.Text
lines = main_body.split('\n')
new_lines = []
for line in lines:
    if 'Animated.Text' not in line and 'React.Text' not in line:
        line = line.replace('<Text ', '<CustomText ')
        line = line.replace('<Text>', '<CustomText>')
        line = line.replace('</Text>', '</CustomText>')
    new_lines.append(line)

main_body_fixed = '\n'.join(new_lines)

# Write back
with open('app/screens/dashboard/DonorManagementScreen.tsx', 'w') as f:
    f.write(before_main + main_body_fixed)

print("Replaced Text with CustomText throughout main component")
