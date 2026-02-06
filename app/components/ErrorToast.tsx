import { X, XCircle } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

interface ErrorToastProps {
    message: string;
    visible: boolean;
    onDismiss: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, visible, onDismiss }) => {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onDismiss();
            }, 5000); // Auto dismiss after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [visible, onDismiss]);

    if (!visible) return null;

    return (
        <Animated.View
            entering={FadeInUp}
            exiting={FadeOutUp}
            style={styles.container}
        >
            <View style={styles.content}>
                <XCircle size={24} color="#ef4444" style={styles.icon} />
                <Text style={styles.message}>{message}</Text>
                <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                    <X size={20} color="#6b7280" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fee2e2',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    icon: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        color: '#991b1b',
        fontSize: 14,
        fontWeight: '500',
    },
    closeButton: {
        padding: 4,
    },
});

export default ErrorToast;
