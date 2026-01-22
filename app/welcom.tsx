import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/welcome.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
      </View>

      {/* Tagline Section */}
      <View style={styles.taglineSection}>
        <Text style={styles.tagline}>
          Classes in Your Pocket
        </Text>
        <Text style={styles.subtitle}>
          Boost your productivity and achieve your goals with our focus-driven app.
        </Text>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/register")}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
        Join thousands of students enhancing their focus daily!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  logoSection: {
    alignItems: "center",
    marginTop: 40,
  },

  logoContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 120,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  logo: {
    width: 180,
    height: 180,
  },

  taglineSection: {
    marginVertical:10,
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "#FAFAFA",
    paddingVertical: 30,
    borderRadius: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  tagline: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#1A202C",
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#718096",
    lineHeight: 24,
  },

  buttonSection: {
    width: "100%",
    alignItems: "center",
    gap: 16,
    
  },

  primaryButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    width: "90%",
    shadowColor: "#4F46E5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  secondaryButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    width: "90%",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  secondaryButtonText: {
    color: "#4F46E5",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  footerText: {
    fontSize: 14,
    color: "#A0AEC0",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },
});
