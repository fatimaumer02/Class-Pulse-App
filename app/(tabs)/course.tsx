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
import { firestore, auth } from '@/config/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/themeContext';
interface Course {
  semester: string;
  code: string;
  title: string;
  credit: number;
  type: string;
}

export default function CourseScreen() {
  const [showForm, setShowForm] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  const [semester, setSemester] = useState('');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [credit, setCredit] = useState('');
  const [type, setType] = useState('');

  const user = auth.currentUser;

  // 🔄 Fetch courses from Firestore
  const loadCourses = async () => {
    if (!user) return;

    const q = query(
      collection(firestore, 'courses'),
      where('uid', '==', user.uid)
    );

    const snap = await getDocs(q);
    const list: Course[] = [];

    snap.forEach(doc => {
      list.push(doc.data() as Course);
    });

    setCourses(list);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // ➕ Add course
  const addCourse = async () => {
    if (!semester || !code || !title || !credit || !type) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }

    if (!user) return;

    await addDoc(collection(firestore, 'courses'), {
      uid: user.uid,
      semester,
      code,
      title,
      credit: Number(credit),
      type,
      createdAt: new Date(),
    });

    setSemester('');
    setCode('');
    setTitle('');
    setCredit('');
    setType('');
    setShowForm(false);

    loadCourses();
};
const { isDarkMode } = useTheme();

const lightTheme = {
  backgroundColor: '#F1F5F9',
  textColor: '#1E293B',
};

const darkTheme = {
  backgroundColor: '#01050c',
  textColor: '#F1F5F9',
};

const theme = isDarkMode ? darkTheme : lightTheme;

const totalCredits = courses.reduce((s, c) => s + c.credit, 0);
  
  // Get unique semesters count
  const uniqueSemesters = [...new Set(courses.map(c => c.semester))].length;

  return (
    <ScrollView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Text style={styles.header}>📚 My Courses</Text>
        <Text style={styles.subHeader}>Manage your academic journey</Text>
      </LinearGradient>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📖</Text>
          </View>
          <Text style={styles.summaryValue}>{courses.length}</Text>
          <Text style={styles.summaryLabel}>Total Courses</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🎓</Text>
          </View>
          <Text style={styles.summaryValue}>{totalCredits}</Text>
          <Text style={styles.summaryLabel}>Credit Hours</Text>
        </View>

        {/* <View style={styles.summaryCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📅</Text>
          </View>
          <Text style={styles.summaryValue}>{uniqueSemesters}</Text>
          <Text style={styles.summaryLabel}>Semesters</Text>
        </View> */}
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
            {showForm ? '✕ Close Form' : '+ Add New Course'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Course Form */}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Course Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Semester Number</Text>
            <TextInput
              placeholder="e.g., 1, 2, 3..."
              value={semester}
              onChangeText={setSemester}
              style={styles.input}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Course Code</Text>
            <TextInput
              placeholder="e.g., CS101"
              value={code}
              onChangeText={setCode}
              style={styles.input}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Course Title</Text>
            <TextInput
              placeholder="e.g., Introduction to Programming"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Credit Hours</Text>
            <TextInput
              placeholder="e.g., 3"
              value={credit}
              onChangeText={setCredit}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Course Type</Text>
            <TextInput
              placeholder="e.g., Major, Minor, Elective"
              value={type}
              onChangeText={setType}
              style={styles.input}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <TouchableOpacity 
            style={styles.saveBtn} 
            onPress={addCourse}
            activeOpacity={0.8}
          >
            <Text style={styles.saveText}>💾 Save Course</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Course List Header */}
      {courses.length > 0 && (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>📋 Course List</Text>
          </View>

          {/* Table Headings */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeading, styles.codeCol]}>Course Code</Text>
            <Text style={[styles.tableHeading, styles.titleCol]}>Title</Text>
            <Text style={[styles.tableHeading, styles.creditCol]}>Credits</Text>
            <Text style={[styles.tableHeading, styles.typeCol]}>Type</Text>
          </View>
        </>
      )}

      {/* Course Table */}
      {courses.length > 0 ? (
        (() => {
          // Group courses by semester
          const groupedCourses = courses.reduce((acc, course) => {
            const sem = course.semester;
            if (!acc[sem]) {
              acc[sem] = [];
            }
            acc[sem].push(course);
            return acc;
          }, {} as Record<string, Course[]>);

          // Sort semesters numerically
          const sortedSemesters = Object.keys(groupedCourses).sort((a, b) => 
            Number(a) - Number(b)
          );

          return sortedSemesters.map((semester) => (
            <View key={semester} style={styles.semesterGroup}>
              {/* Semester Header */}
              <View style={styles.semesterHeader}>
                <Text style={styles.semesterTitle}>Semester {semester}</Text>
                <Text style={styles.semesterCount}>
                  {groupedCourses[semester].length} course{groupedCourses[semester].length !== 1 ? 's' : ''}
                </Text>
              </View>

              {/* Courses in this semester */}
              {groupedCourses[semester].map((c, i) => (
                <View key={i} style={styles.courseRow}>
                  <Text style={[styles.cellText, styles.codeCol, styles.courseCodeCell]}>
                    {c.code}
                  </Text>
                  <Text style={[styles.cellText, styles.titleCol]} numberOfLines={2}>
                    {c.title}
                  </Text>
                  <Text style={[styles.cellText, styles.creditCol, styles.centerText]}>
                    {c.credit}
                  </Text>
                  <View style={[styles.typeCol, styles.typeCell]}>
                    <View style={[
                      styles.typeBadgeSmall,
                      c.type.toLowerCase() === 'major' ? styles.majorBadge :
                      c.type.toLowerCase() === 'minor' ? styles.minorBadge :
                      styles.electiveBadge
                    ]}>
                      <Text style={styles.typeBadgeText}>{c.type}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ));
        })()
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>No courses added yet</Text>
          <Text style={styles.emptySubText}>
            Start by adding your first course above
          </Text>
        </View>
      )}

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

  // Summary Cards
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  summaryCard: {
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
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  summaryLabel: {
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
  saveBtn: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveText: { 
    color: '#FFFFFF', 
    textAlign: 'center', 
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // List Header
  listHeader: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },

  // Table Styles
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#667EEA',
    marginHorizontal: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeading: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  
  // Column Widths (adjusted without semester column)
  codeCol: {
    width: '25%',
  },
  titleCol: {
    width: '40%',
  },
  creditCol: {
    width: '15%',
  },
  typeCol: {
    width: '20%',
  },

  // Semester Group
  semesterGroup: {
    marginBottom: 20,
  },
  semesterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#667EEA',
    marginTop: 8,
  },
  semesterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  semesterCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  // Course Row
  courseRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  courseCodeCell: {
    fontWeight: '700',
    color: '#667EEA',
  },
  centerText: {
    textAlign: 'center',
  },
  typeCell: {
    alignItems: 'flex-start',
  },
  typeBadgeSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  majorBadge: {
    backgroundColor: '#DBEAFE',
  },
  minorBadge: {
    backgroundColor: '#FCE7F3',
  },
  electiveBadge: {
    backgroundColor: '#FEF3C7',
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },



  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },

  bottomSpacer: {
    height: 40,
  },
});