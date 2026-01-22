import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { auth, firestore } from '@/config/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

interface TimetableEntry {
  id: string;
  course: string;
  day: string;
  time: string;
  teacher: string;
  place: string;
  uid: string;
}

export default function TimetableScreen() {
  const user = auth.currentUser;
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [course, setCourse] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [teacher, setTeacher] = useState('');
  const [place, setPlace] = useState('');
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // 🔹 Load timetable
  useEffect(() => {
    if (!user) return;
    const q = query(collection(firestore, 'timetable'), where('uid', '==', user.uid));
    const unsub = onSnapshot(
      q,
      snapshot => {
        const list: TimetableEntry[] = [];
        snapshot.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() } as TimetableEntry);
        });
        setTimetable(list);
      },
      error => {
        console.log('Firestore error:', error.message);
        Alert.alert('Error', 'Cannot load timetable. Check rules.');
      }
    );
    return () => unsub();
  }, [user]);

  // 🔹 Save or Update class
  const saveClass = async () => {
    if (!user) return Alert.alert('Error', 'User not logged in');
    if (!course || !day || !time || !teacher || !place)
      return Alert.alert('Error', 'Please fill all fields');

    try {
      if (editingId) {
        // 🔹 Update existing document
        const docRef = doc(firestore, 'timetable', editingId);
        await updateDoc(docRef, { course, day, time, teacher, place });
        Alert.alert('Updated', 'Class updated successfully');
      } else {
        // 🔹 Add new class
        await addDoc(collection(firestore, 'timetable'), {
          uid: user.uid,
          course,
          day,
          time,
          teacher,
          place,
          createdAt: serverTimestamp(),
        });
        Alert.alert('Saved', 'Class added successfully');
      }

      // Reset form
      setCourse('');
      setDay('');
      setTime('');
      setTeacher('');
      setPlace('');
      setShowForm(false);
      setEditingId(null);
    } catch (e: any) {
      console.log(e);
      Alert.alert('Error', 'Could not save class. Check rules.');
    }
  };

  // 🔹 Delete class
  const deleteClass = async (id: string) => {
    Alert.alert('Delete Class', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(firestore, 'timetable', id));
            Alert.alert('Deleted', 'Class removed');
          } catch (e) {
            Alert.alert('Error', 'Cannot delete class');
          }
        },
      },
    ]);
  };

  // 🔹 Edit class
  const editClass = (entry: TimetableEntry) => {
    setEditingId(entry.id);
    setCourse(entry.course);
    setDay(entry.day);
    setTime(entry.time);
    setTeacher(entry.teacher);
    setPlace(entry.place);
    setShowForm(true);
  };

  // 🔹 Cancel editing
  const cancelEdit = () => {
    setCourse('');
    setDay('');
    setTime('');
    setTeacher('');
    setPlace('');
    setShowForm(false);
    setEditingId(null);
  };

  const getClassesByDay = (dayName: string) =>
    timetable.filter(t => t.day === dayName);

  return (
    <ScrollView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Text style={styles.header}>📅 Weekly Timetable</Text>
        <Text style={styles.subHeader}>Your class schedule at a glance</Text>
      </LinearGradient>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📚</Text>
          </View>
          <Text style={styles.statValue}>{timetable.length}</Text>
          <Text style={styles.statLabel}>Total Classes</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🗓️</Text>
          </View>
          <Text style={styles.statValue}>
            {new Set(timetable.map(t => t.day)).size}
          </Text>
          <Text style={styles.statLabel}>Active Days</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>👨‍🏫</Text>
          </View>
          <Text style={styles.statValue}>
            {new Set(timetable.map(t => t.teacher)).size}
          </Text>
          <Text style={styles.statLabel}>Teachers</Text>
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setShowForm(!showForm)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addBtnGradient}
        >
          <Text style={styles.addText}>
            {showForm ? '✕ Close Form' : editingId ? '✏️ Edit Class' : '+ Add New Class'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Form */}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {editingId ? 'Edit Class' : 'Class Information'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Course Name</Text>
            <TextInput
              placeholder="e.g., Data Structures"
              style={styles.input}
              value={course}
              onChangeText={setCourse}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Day</Text>
            <View style={styles.daySelector}>
              {daysOfWeek.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.dayChip,
                    day === d && styles.dayChipActive,
                  ]}
                  onPress={() => setDay(d)}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      day === d && styles.dayChipTextActive,
                    ]}
                  >
                    {d.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              placeholder="e.g., 9:00 AM - 10:30 AM"
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teacher Name</Text>
            <TextInput
              placeholder="e.g., Dr. Smith"
              style={styles.input}
              value={teacher}
              onChangeText={setTeacher}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Place / Room</Text>
            <TextInput
              placeholder="e.g., Room 301, CS Lab"
              style={styles.input}
              value={place}
              onChangeText={setPlace}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formBtn, styles.saveBtn]}
              onPress={saveClass}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>
                {editingId ? '✏️ Update Class' : '💾 Save Class'}
              </Text>
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity
                style={[styles.formBtn, styles.cancelBtn]}
                onPress={cancelEdit}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Timetable Display */}
      <View style={styles.timetableSection}>
        <Text style={styles.sectionTitle}>📋 Weekly Schedule</Text>

        {daysOfWeek.map(dayName => {
          const dayClasses = getClassesByDay(dayName);
          return (
            <View key={dayName} style={styles.dayContainer}>
              {/* Day Header */}
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{dayName}</Text>
                <Text style={styles.dayCount}>
                  {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                </Text>
              </View>

              {/* Classes for this day */}
              {dayClasses.length > 0 ? (
                dayClasses.map(c => (
                  <View key={c.id} style={styles.classCard}>
                    <View style={styles.classHeader}>
                      <Text style={styles.courseName}>{c.course}</Text>
                      <View style={styles.timeChip}>
                        <Text style={styles.timeText}>🕐 {c.time}</Text>
                      </View>
                    </View>

                    <View style={styles.classDetails}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>👨‍🏫</Text>
                        <Text style={styles.detailText}>{c.teacher}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>📍</Text>
                        <Text style={styles.detailText}>{c.place}</Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => editClass(c)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.editBtnText}>✏️ Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => deleteClass(c.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyDay}>
                  <Text style={styles.emptyDayText}>No classes scheduled</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  // Header Styles
  headerGradient: {
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 16,
    color: '#E0E7FF',
    fontWeight: '500',
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Add Button
  addBtn: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addBtnGradient: {
    padding: 18,
    alignItems: 'center',
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Form Styles
  form: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },

  // Day Selector
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayChip: {
    flex: 1,
    padding: 10,
    marginHorizontal: 2,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E7FF',
  },
  dayChipActive: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  dayChipTextActive: {
    color: '#FFFFFF',
  },

  // Form Buttons
  formButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  formBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 16,
  },

  // Timetable Section
  timetableSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },

  // Day Container
  dayContainer: {
    marginBottom: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#667EEA',
  },
  dayName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  dayCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  // Class Card
  classCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#764BA2',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
  },
  timeChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#667EEA',
  },
  classDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },

  // Action Buttons
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  editBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  // Empty Day
  emptyDay: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyDayText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  bottomSpacer: {
    height: 40,
  },
});