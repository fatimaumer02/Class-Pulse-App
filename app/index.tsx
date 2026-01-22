import { View, Text, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function SplashScreen() {
   const router = useRouter();
   useEffect(() => {
    setTimeout(() => {
      router.push('/welcom')
    }, 2000);
    }, []);
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.slang}>
        Classes change. Stay ahead.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 25,
  },
  slang: {
    color: '#000',
    fontSize: 18,
    fontStyle: 'italic',
    fontFamily: 'System',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

