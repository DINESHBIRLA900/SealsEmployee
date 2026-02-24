import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import HeaderCard from '../../components/HeaderCard';
import ImageSlider from '../../components/ImageSlider';
import CategoryGrid from '../../components/CategoryGrid';
import React, { useEffect, useState } from 'react';
import { advertisementService } from '../../src/services/advertisementService';

export default function HomeScreen() {
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [middleSliderImages, setMiddleSliderImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSliderImages();
  }, []);

  const loadSliderImages = async () => {
    try {
      const [homeCards, middleCards] = await Promise.all([
        advertisementService.getHomeCards(),
        advertisementService.getMiddleCards()
      ]);

      setSliderImages(homeCards.map(card => card.image));
      setMiddleSliderImages(middleCards.map(card => card.image));
    } catch (error) {
      console.error('Failed to load slider images', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderCard />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Top Image Slider */}
        <View style={styles.sliderSection}>
          {loading ? (
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#10b981" />
            </View>
          ) : sliderImages.length > 0 ? (
            <ImageSlider images={sliderImages} height={200} autoRotateInterval={4000} />
          ) : (
            <View style={{ height: 200, backgroundColor: '#e5e7eb', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#9ca3af' }}>No advertisements available</Text>
            </View>
          )}
        </View>

        {/* Product Categories */}
        <CategoryGrid />

        {/* Middle Image Slider */}
        {middleSliderImages.length > 0 && (
          <View style={styles.sliderSection}>
            <ImageSlider images={middleSliderImages} height={180} autoRotateInterval={4000} />
          </View>
        )}

        {/* Welcome Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Home</Text>
          <Text style={styles.text}>Welcome to CLT Mobile App.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  sliderSection: {
    padding: 16,
    paddingTop: 8,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
  },
  text: {
    fontSize: 16,
    color: '#4b5563',
  },
});
