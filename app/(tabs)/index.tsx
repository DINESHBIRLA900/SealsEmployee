import { StyleSheet, View, Text, ScrollView } from 'react-native';
import HeaderCard from '../../components/HeaderCard';
import ImageSlider from '../../components/ImageSlider';

export default function HomeScreen() {
  // Sample images for the slider
  const sliderImages = [
    'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
  ];

  return (
    <View style={styles.container}>
      <HeaderCard />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Slider */}
        <View style={styles.sliderSection}>
          <ImageSlider images={sliderImages} height={200} autoRotateInterval={4000} />
        </View>

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
