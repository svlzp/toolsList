import React from 'react';
import { View, Text, ScrollView, Image, Modal, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PredefinedButton } from '../Button/PredefinedButton';

export interface DetailField {
    label: string;
    value?: string;
}

export interface ItemDetails {
    id: string;
    title: string;
    subtitle?: string;
    images?: string[];
    fields?: DetailField[];
}

interface ItemDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    item: ItemDetails | null;
    title?: string;
    onDelete?: (id: string) => void;
    showDeleteButton?: boolean;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
    visible,
    onClose,
    item,
    title = 'Детали',
    onDelete,
    showDeleteButton = false,
}) => {
    const { t } = useTranslation();

    if (!item) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    
                    <ScrollView horizontal style={styles.imagesContainer}>
                        {item.images && item.images.length > 0 ? (
                            item.images.map((file, index) => (
                                <Image 
                                    key={index} 
                                    source={{ uri: file }} 
                                    style={styles.image} 
                                />
                            ))
                        ) : (
                            <View style={styles.noImagePlaceholder}>
                                <Text style={styles.noImageText}>{t('common.noPhotos')}</Text>
                            </View>
                        )}
                    </ScrollView>
                    
                    <View style={styles.detailsInfo}>
                        <Text style={styles.detailsTitle}>{item.title}</Text>
                        {item.subtitle && (
                            <Text style={styles.detailsSubtitle}>{item.subtitle}</Text>
                        )}
                        {item.fields?.map((field, index) => (
                            field.value ? (
                                <Text key={index} style={styles.detailsField}>
                                    {field.label}: {field.value}
                                </Text>
                            ) : null
                        ))}
                    </View>
                    
                    <View style={styles.buttonContainer}>
                        {showDeleteButton && onDelete && (
                            <>
                                <PredefinedButton 
                                    type="text"
                                    label={t('common.delete')} 
                                    onPress={() => onDelete(item.id)} 
                                    textColor="#FF3B30"
                                />
                                <View style={styles.buttonSpacer} />
                            </>
                        )}
                        <PredefinedButton 
                            type="blue"
                            label={t('common.close')} 
                            onPress={onClose}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '85%',
        maxHeight: '90%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    imagesContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        maxHeight: 200,
    },
    image: {
        width: 180,
        height: 180,
        borderRadius: 5,
        resizeMode: 'cover',
        marginRight: 10,
    },
    noImagePlaceholder: {
        width: 180,
        height: 180,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    noImageText: {
        fontSize: 14,
        color: '#999',
    },
    detailsInfo: {
        width: '100%',
        marginBottom: 15,
    },
    detailsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    detailsSubtitle: {
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
        color: '#666',
    },
    detailsField: {
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    buttonSpacer: {
        width: 10,
    },
});

export default ItemDetailsModal;
