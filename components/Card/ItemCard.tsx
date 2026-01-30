import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActionSheetIOS,
    Platform,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';

export interface CardItem {
    id: string | number;
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    images?: string[];
}

interface ItemCardProps {
    item: CardItem;
    onPress: (item: CardItem) => void;
    onEdit?: (item: CardItem) => void;
    onDelete?: (id: string | number) => Promise<void> | void;
    variant?: 'tool' | 'learning' | 'machine';
    showMenu?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
    item,
    onPress,
    onEdit,
    onDelete,
    variant = 'tool',
    showMenu = false,
}) => {
    const { t } = useTranslation();
    const imageSource = item.imageUrl || (item.images && item.images.length > 0 ? item.images[0] : null);
    
    const handleMenuPress = () => {
        const options = [t('common.cancel')];
        const destructiveButtonIndex = -1;
        let editIndex = -1;
        let deleteIndex = -1;

        if (onEdit) {
            options.push(t('common.edit'));
            editIndex = options.length - 1;
        }
        if (onDelete) {
            options.push(t('common.delete'));
            deleteIndex = options.length - 1;
        }

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options,
                    cancelButtonIndex: 0,
                    destructiveButtonIndex: deleteIndex !== -1 ? deleteIndex : undefined,
                },
                (buttonIndex) => {
                    if (buttonIndex === editIndex) {
                        onEdit?.(item);
                    } else if (buttonIndex === deleteIndex) {
                        onDelete?.(item.id);
                    }
                }
            );
        } else {
            
            const androidOptions: any[] = [];
            if (onEdit) {
                androidOptions.push({
                    text: t('common.edit'),
                    onPress: () => onEdit?.(item),
                });
            }
            if (onDelete) {
                androidOptions.push({
                    text: t('common.delete'),
                    onPress: () => onDelete?.(item.id),
                    style: 'destructive' as const,
                });
            }
            androidOptions.push({ text: t('common.cancel'), style: 'cancel' as const });

            Alert.alert(t('common.actions'), t('common.selectAction'), androidOptions);
        }
    };

    return (
        <View style={styles.cardWrapper}>
            <TouchableOpacity
                style={styles.card}
                onPress={() => onPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.imageContainer}>
                    {imageSource ? (
                        <Image source={{ uri: imageSource }} style={styles.image} />
                    ) : (
                        <View style={styles.noImagePlaceholder}>
                            <Text style={styles.noImageText}>{t('common.noPhoto')}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                        {item.title}
                    </Text>
                    {item.subtitle && (
                        <Text style={styles.subtitle} numberOfLines={1}>
                            {item.subtitle}
                        </Text>
                    )}
                    {item.description && (
                        <Text style={styles.description} numberOfLines={1} ellipsizeMode="tail">
                            {item.description}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>

            {showMenu && (onEdit || onDelete) && (
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={handleMenuPress}
                >
                    <Text style={styles.menuButtonText}>⋮</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    cardWrapper: {
        position: 'relative',
        paddingTop: 0,
    },
    card: {
        width: 200,
        height: 200,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        margin: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    imageContainer: {
        width: '100%',
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 5,
        resizeMode: 'cover',
    },
    noImagePlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        color: '#999',
        fontSize: 12,
    },
    info: {
        alignItems: 'center',
        width: '100%',
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
        textAlign: 'center',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 4,
        textAlign: 'center',
        color: '#666',
    },
    description: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    menuButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    menuButtonText: {
        fontSize: 24,
        color: '#333',
        fontWeight: 'bold',
    },
});

export default ItemCard;
