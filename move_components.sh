#!/bin/bash
FILE="app/screens/dashboard/DonorManagementScreen.tsx"

# Extract lines 122-430 (reusable components) to a temp file
sed -n '122,430p' $FILE > /tmp/components.txt

# Delete lines 122-430 from the file
sed -i '122,430d' $FILE

# Now insert the components after line 1110 (after "const { colors } = useTheme();")
# First find the line number
LINE=$(grep -n "const { colors } = useTheme();" $FILE | cut -d: -f1)
INSERT_LINE=$((LINE + 1))

# Insert the components
sed -i "${INSERT_LINE}r /tmp/components.txt" $FILE

# Clean up
rm /tmp/components.txt

echo "Moved components to line $INSERT_LINE"
