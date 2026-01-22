import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, firestore } from '@/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

/* ✅ CLOUDINARY CONFIG */
const CLOUDINARY_CLOUD_NAME = 'dfgti5wjo';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const CLOUDINARY_PRESET = 'expo_folder';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const router = useRouter();
  const [photo, setPhoto] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  /* 🔹 LOAD PROFILE */
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const ref = doc(firestore, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setPhoto(data?.photoURL || null);
        setDisplayName(data?.displayName || 'Student');
        setIsDarkMode(data?.darkMode || false);
      } else {
        setDisplayName('Student');
      }
    };
    loadProfile();
  }, []);

  /* 🔹 PICK IMAGE */
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Allow gallery access');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      uploadToCloudinary(result.assets[0].uri);
    }
  };

  /* 🔹 UPLOAD TO CLOUDINARY */
  const uploadToCloudinary = async (uri: string) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('upload_preset', CLOUDINARY_PRESET);
      formData.append('folder', 'classpulse/profile');

      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = await res.json();
      if (!data.secure_url) throw new Error('Upload failed');
      await savePhoto(data.secure_url);
      setPhoto(data.secure_url);
      Alert.alert('Success', 'Profile photo updated!');
    } catch (err) {
      console.log(err);
      Alert.alert('Upload Failed', 'Could not upload image');
    } finally {
      setLoading(false);
    }
  };

  /* 🔹 SAVE PHOTO TO FIRESTORE */
  const savePhoto = async (url: string) => {
    if (!user) return;
    await setDoc(
      doc(firestore, 'users', user.uid),
      { photoURL: url },
      { merge: true }
    );
  };

  /* 🔹 EDIT NAME */
  const openEditModal = () => {
    setTempName(displayName);
    setEditModalVisible(true);
  };

  const saveName = async () => {
    if (!tempName.trim()) return;
    try {
      setLoading(true);
      await setDoc(
        doc(firestore, 'users', user!.uid),
        { displayName: tempName.trim() },
        { merge: true }
      );
      setDisplayName(tempName.trim());
      setEditModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  /* 🔹 SIGN OUT */
  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER GRADIENT CARD */}
      <LinearGradient
        colors={isDarkMode ? ['#4F46E5', '#7C3AED'] : ['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.imageWrapper}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Ionicons name="person" size={60} color="#c7c1c1" />
            </View>
          )}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={pickImage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.emailBadge}>
          <Ionicons name="mail" size={14} color="#fff" style={{ opacity: 0.9 }} />
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </LinearGradient>

      {/* PROFILE DETAILS CARD */}
      <View style={[styles.detailsCard, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Profile Information
        </Text>

        {/* Full Name Row */}
        <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.iconBg }]}>
            <Ionicons name="person-outline" size={22} color="#6366F1" />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: theme.label }]}>Full Name</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {displayName}
            </Text>
          </View>
          <TouchableOpacity style={styles.editIconBtn} onPress={openEditModal}>
            <Ionicons name="pencil" size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {/* Email Row */}
        <View style={styles.infoRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.iconBg }]}>
            <Ionicons name="mail-outline" size={22} color="#8B5CF6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: theme.label }]}>Email</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {user?.email}
            </Text>
          </View>
        </View>
      </View>

      {/* SIGN OUT BUTTON */}
      <TouchableOpacity
        style={[styles.signOutBtn, { backgroundColor: theme.cardBg }]}
        onPress={handleSignOut}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        </View>
        <Text style={[styles.signOutText, { color: '#EF4444' }]}>Sign Out</Text>
        <Ionicons name="chevron-forward" size={20} color="#EF4444" />
      </TouchableOpacity>

      {/* EDIT NAME MODAL */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setEditModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <View style={styles.modalHandle} />
            
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Edit Name
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#6366F1" />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                value={tempName}
                onChangeText={setTempName}
                placeholder="Enter your name"
                placeholderTextColor={theme.label}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={saveName}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={[styles.cancelBtnText, { color: theme.subText }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

/* 🎨 THEMES */
const lightTheme = {
  background: '#F8F9FA',
  cardBg: '#FFFFFF',
  text: '#1F2937',
  subText: '#6B7280',
  label: '#9CA3AF',
  border: '#E5E7EB',
  iconBg: '#F3F4F6',
};

const darkTheme = {
  background: '#0F172A',
  cardBg: '#1E293B',
  text: '#F1F5F9',
  subText: '#CBD5E1',
  label: '#94A3B8',
  border: '#334155',
  iconBg: '#334155',
};

/* 🎨 ENHANCED STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 28,
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  imageWrapper: {
    marginBottom: 20,
    position: 'relative',
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 5,
    borderColor: '#fff',
  },
  placeholderImage: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#807c7c',
    padding: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  email: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  detailsCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  editIconBtn: {
    padding: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  signOutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});