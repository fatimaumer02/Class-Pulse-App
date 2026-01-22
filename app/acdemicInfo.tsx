import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAllCountries } from '@/api/countryApi';
import { fetchAllUniversities } from '@/api/universityApi';
import { auth } from '@/config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { useRouter } from 'expo-router';

export default function AcademicInfo() {
  const router = useRouter();

  const [countries, setCountries] = useState<string[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);

  const [country, setCountry] = useState('');
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState('');
  const [department, setDepartment] = useState('');

  const degrees = [
    'BTech',
    'BS Computer Science',
    'BS Software Engineering',
    'BSc Information Technology',
    'MTech',
    'MS Computer Science',
    'PhD'
  ];

  // Load countries
  useEffect(() => {
    const loadCountries = async () => {
      const data = await getAllCountries();
      setCountries(data);
    };
    loadCountries();
  }, []);

  // Load universities when country changes
  useEffect(() => {
    if (!country) {
      setUniversities([]);
      return;
    }

    const loadUniversities = async () => {
      const data = await fetchAllUniversities();
      const names: string[] = [];

      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          if (data[i] && data[i].label) {
            names.push(data[i].label);
          }
        }
      }

      setUniversities(names);
    };

    loadUniversities();
  }, [country]);

  const handleSave = async () => {
    if (!country || !university || !degree || !department) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(firestore, 'users', user.uid);
    const snap = await getDoc(ref);

    // Store academic info ONLY ONCE
    if (snap.exists() && snap.data().academicInfoSaved) {
      Alert.alert('Info', 'Academic info already saved');
      router.replace('/(tabs)/home');
      return;
    }

    await setDoc(
      ref,
      {
        academicInfo: { country, university, degree, department },
        academicInfoSaved: true
      },
      { merge: true }
    );

    Alert.alert('Success', 'Academic info saved 🎓', [
      {
        text: 'OK',
        onPress: () => router.replace('/(tabs)/home')
      }
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Academic Information</Text>
          <Text style={styles.subtitle}>
            Please provide your academic details to continue
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Country */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Country</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={country}
                onValueChange={setCountry}
                style={styles.picker}
              >
                <Picker.Item label="Select Country" value="" />
                {countries.map(c => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>
          </View>

          {/* University */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>University</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={university}
                onValueChange={setUniversity}
                style={styles.picker}
                enabled={!!country}
              >
                <Picker.Item label="Select University" value="" />
                {universities.map(u => (
                  <Picker.Item key={u} label={u} value={u} />
                ))}
              </Picker>
            </View>
            {!country && (
              <Text style={styles.helperText}>Please select a country first</Text>
            )}
          </View>

          {/* Degree */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Degree Program</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={degree}
                onValueChange={setDegree}
                style={styles.picker}
              >
                <Picker.Item label="Select Degree" value="" />
                {degrees.map(d => (
                  <Picker.Item key={d} label={d} value={d} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Department */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Department</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={department}
                onValueChange={setDepartment}
                style={styles.picker}
              >
                <Picker.Item label="Select Department" value="" />
                <Picker.Item label="Computer Science" value="CS" />
                <Picker.Item label="Software Engineering" value="SE" />
                <Picker.Item label="Information Technology" value="IT" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.btn,
            (!country || !university || !degree || !department) && styles.btnDisabled
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Save & Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1, padding: 24, paddingTop: 60 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
  form: { marginBottom: 24 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, letterSpacing: 0.3 },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  picker: { height: 56, width: '100%' },
  helperText: { fontSize: 12, color: '#9CA3AF', marginTop: 6, fontStyle: 'italic' },
  btn: {
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  btnDisabled: { backgroundColor: '#C7D2FE', shadowOpacity: 0.1 },
  btnText: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 }
});
