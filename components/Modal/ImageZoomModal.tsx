import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { GestureHandlerRootView, PinchGestureHandler, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';

interface ImageZoomModalProps {
    visible: boolean;
    imageUri: string | null;
    onClose: () => void;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
    visible,
    imageUri,
    onClose,
}) => {
    const scale = useSharedValue(1);
    const savedScale = useRef(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useRef(0);
    const savedTranslateY = useRef(0);
    const [displayZoom, setDisplayZoom] = React.useState(100);

    const pinchRef = useRef<PinchGestureHandler>(null);
    const panRef = useRef<PanGestureHandler>(null);

    const screenDimensions = Dimensions.get('window');

    const resetZoom = () => {
        scale.value = withTiming(1, { duration: 200 });
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
        savedScale.current = 1;
        savedTranslateX.current = 0;
        savedTranslateY.current = 0;
        setDisplayZoom(100);
    };

    const handleClose = () => {
        resetZoom();
        onClose();
    };

    const handleZoomIn = () => {
        const newScale = Math.min(savedScale.current + 0.5, 5);
        scale.value = withTiming(newScale, { duration: 200 });
        savedScale.current = newScale;
        setDisplayZoom(Math.round(newScale * 100));
    };

    const handleZoomOut = () => {
        const newScale = Math.max(savedScale.current - 0.5, 1);
        scale.value = withTiming(newScale, { duration: 200 });
        savedScale.current = newScale;
        setDisplayZoom(Math.round(newScale * 100));
        if (newScale <= 1) {
            translateX.value = withTiming(0, { duration: 200 });
            translateY.value = withTiming(0, { duration: 200 });
            savedTranslateX.current = 0;
            savedTranslateY.current = 0;
        }
    };

    const onPinchEvent = (event: any) => {
        const newScale = Math.max(1, Math.min(savedScale.current * event.nativeEvent.scale, 5));
        scale.value = newScale;
    };

    const onPinchStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            savedScale.current = Math.max(1, Math.min(savedScale.current * event.nativeEvent.scale, 5));
            scale.value = savedScale.current;
            setDisplayZoom(Math.round(savedScale.current * 100));

            if (savedScale.current <= 1) {
                translateX.value = withTiming(0, { duration: 200 });
                translateY.value = withTiming(0, { duration: 200 });
                savedTranslateX.current = 0;
                savedTranslateY.current = 0;
            }
        }
    };

    const onPanEvent = (event: any) => {
        if (savedScale.current > 1) {
            const maxX = (screenDimensions.width * (savedScale.current - 1)) / 2;
            const maxY = (screenDimensions.height * (savedScale.current - 1)) / 2;

            const newX = savedTranslateX.current + event.nativeEvent.translationX;
            const newY = savedTranslateY.current + event.nativeEvent.translationY;

            translateX.value = Math.max(-maxX, Math.min(maxX, newX));
            translateY.value = Math.max(-maxY, Math.min(maxY, newY));
        }
    };

    const onPanStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            savedTranslateX.current = translateX.value;
            savedTranslateY.current = translateY.value;
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
    }));

    return (
        <Modal
            visible={visible && !!imageUri}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.imageModalContainer}>
                    <View style={styles.imageModalHeader}>
                        <TouchableOpacity
                            style={styles.imageModalCloseButton}
                            onPress={handleClose}
                        >
                            <Text style={styles.imageModalCloseText}>✕</Text>
                        </TouchableOpacity>
                        <View style={styles.imageModalControls}>
                            <TouchableOpacity
                                style={styles.zoomButton}
                                onPress={handleZoomOut}
                            >
                                <Text style={styles.zoomButtonText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.zoomValue}>{displayZoom}%</Text>
                            <TouchableOpacity
                                style={styles.zoomButton}
                                onPress={handleZoomIn}
                            >
                                <Text style={styles.zoomButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <PanGestureHandler
                        ref={panRef}
                        simultaneousHandlers={pinchRef}
                        onGestureEvent={onPanEvent}
                        onHandlerStateChange={onPanStateChange}
                        minPointers={1}
                        maxPointers={2}
                    >
                        <Animated.View style={styles.imageCanvas}>
                            <PinchGestureHandler
                                ref={pinchRef}
                                simultaneousHandlers={panRef}
                                onGestureEvent={onPinchEvent}
                                onHandlerStateChange={onPinchStateChange}
                            >
                                <Animated.View style={[styles.imageInner, animatedStyle]}>
                                    {imageUri && (
                                        <Image
                                            source={{ uri: imageUri }}
                                            style={styles.zoomedImage}
                                            resizeMode="contain"
                                        />
                                    )}
                                </Animated.View>
                            </PinchGestureHandler>
                        </Animated.View>
                    </PanGestureHandler>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    imageModalContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    imageModalHeader: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        paddingTop: 50,
        zIndex: 10,
    },
    imageModalCloseButton: {
        padding: 8,
    },
    imageModalCloseText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    imageModalControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    zoomButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    zoomButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    zoomValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        minWidth: 45,
        textAlign: 'center',
    },
    imageCanvas: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageInner: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomedImage: {
        width: '100%',
        height: '100%',
    },
});
