import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback,
    ScrollView,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ImageSliderProps {
    images: string[];
    autoRotateInterval?: number; // in milliseconds
    height?: number;
}

export default function ImageSlider({
    images,
    autoRotateInterval = 4000,
    height = 200,
}: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Auto-rotate function
    const startAutoRotate = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            if (!isPaused) {
                setCurrentIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % images.length;
                    scrollViewRef.current?.scrollTo({
                        x: nextIndex * screenWidth,
                        animated: true,
                    });
                    return nextIndex;
                });
            }
        }, autoRotateInterval);
    };

    // Start auto-rotation on mount and when isPaused changes
    useEffect(() => {
        if (!isPaused) {
            startAutoRotate();
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPaused, images.length, autoRotateInterval]);

    // Handle manual scroll
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / screenWidth);
        setCurrentIndex(index);
    };

    // Handle press in (pause rotation)
    const handlePressIn = () => {
        setIsPaused(true);
    };

    // Handle press out (resume rotation)
    const handlePressOut = () => {
        setIsPaused(false);
    };

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <View>
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        style={{ height }}
                    >
                        {images.map((image, index) => (
                            <View key={index} style={[styles.imageContainer, { width: screenWidth }]}>
                                <Image
                                    source={{ uri: image }}
                                    style={[styles.image, { height }]}
                                    resizeMode="cover"
                                />
                            </View>
                        ))}
                    </ScrollView>

                    {/* Dots Indicator */}
                    <View style={styles.dotsContainer}>
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    currentIndex === index && styles.activeDot,
                                ]}
                            />
                        ))}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 4,
    },
    activeDot: {
        width: 24,
        backgroundColor: '#fff',
        borderRadius: 4,
    },
});
