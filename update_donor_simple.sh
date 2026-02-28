#!/bin/bash
# Simple script to update DonorManagementScreen to use theme colors

FILE="app/screens/dashboard/DonorManagementScreen.tsx"

# 1. Add useTheme import
sed -i "s|import { SafeAreaView } from 'react-native-safe-area-context';|import { SafeAreaView } from 'react-native-safe-area-context';\nimport { useTheme } from '../../../contexts/ThemeContext';|" $FILE

# 2. Fix SHADOWS before removing COLORS
sed -i 's/shadowColor: COLORS\.primary\[500\]/shadowColor: '\''#000'\''/' $FILE

# 3. Delete COLORS constant block (lines with COLORS definition)
sed -i '/^\/\/ ============ DESIGN SYSTEM CONSTANTS ============/,/^} as const;$/d' $FILE

# 4. Replace COLORS references with colors
sed -i 's/COLORS\.primary\[50\]/colors.primary + '\''20'\''/g' $FILE
sed -i 's/COLORS\.primary\[100\]/colors.primary + '\''30'\''/g' $FILE
sed -i 's/COLORS\.primary\[300\]/colors.primary/g' $FILE
sed -i 's/COLORS\.primary\[500\]/colors.primary/g' $FILE
sed -i 's/COLORS\.primary\[600\]/colors.primary/g' $FILE

sed -i 's/COLORS\.neutral\[50\]/colors.surface/g' $FILE
sed -i 's/COLORS\.neutral\[100\]/colors.surfaceVariant/g' $FILE
sed -i 's/COLORS\.neutral\[200\]/colors.border/g' $FILE
sed -i 's/COLORS\.neutral\[300\]/colors.border/g' $FILE
sed -i 's/COLORS\.neutral\[400\]/colors.textSecondary/g' $FILE
sed -i 's/COLORS\.neutral\[500\]/colors.textSecondary/g' $FILE
sed -i 's/COLORS\.neutral\[600\]/colors.text/g' $FILE
sed -i 's/COLORS\.neutral\[700\]/colors.text/g' $FILE
sed -i 's/COLORS\.neutral\[900\]/colors.text/g' $FILE

sed -i 's/COLORS\.success\[50\]/colors.success + '\''20'\''/g' $FILE
sed -i 's/COLORS\.success\[500\]/colors.success/g' $FILE
sed -i 's/COLORS\.success\[600\]/colors.success/g' $FILE

sed -i 's/COLORS\.warning\[50\]/colors.warning + '\''20'\''/g' $FILE
sed -i 's/COLORS\.warning\[500\]/colors.warning/g' $FILE
sed -i 's/COLORS\.warning\[600\]/colors.warning/g' $FILE

sed -i 's/COLORS\.error\[50\]/colors.error + '\''20'\''/g' $FILE
sed -i 's/COLORS\.error\[500\]/colors.error/g' $FILE
sed -i 's/COLORS\.error\[600\]/colors.error/g' $FILE

sed -i 's/COLORS\.surface\.light/colors.card/g' $FILE
sed -i 's/COLORS\.gradient\.[a-zA-Z]*/colors.primary/g' $FILE

# 5. Add const { colors } = useTheme() to main component
sed -i 's/const DonorManagementScreen: React.FC = () => {/const DonorManagementScreen: React.FC = () => {\n  const { colors } = useTheme();/' $FILE

echo "Done! Updated $FILE"
