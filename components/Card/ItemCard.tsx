import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

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
    variant?: 'tool' | 'learning' | 'machine';
}

export const ItemCard: React.FC<ItemCardProps> = ({
    item,
    onPress,
    variant = 'tool',
}) => {
    
    const imageSource = item.imageUrl || (item.images && item.images.length > 0 ? item.images[0] : null);

    return (
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
                        <Text style={styles.noImageText}>Нет фото</Text>
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
    );
};

const styles = StyleSheet.create({
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
});

export default ItemCard;
