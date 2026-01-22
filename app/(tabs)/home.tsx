import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { auth, firestore } from '@/config/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface TimetableEntry {
  id: string;
  course: string;
  day: string;
  time: string;
  teacher: string;
  place: string;
  status?: string;
}

export default function HomeScreen() {
  const user = auth.currentUser;
  const [todayClasses, setTodayClasses] = useState<TimetableEntry[]>([]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  /* 🔹 Load Today Classes */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(firestore, 'timetable'),
      where('uid', '==', user.uid),
      where('day', '==', today)
    );

    const unsub = onSnapshot(q, snap => {
      const list: TimetableEntry[] = [];
      snap.forEach(d =>
        list.push({ id: d.id, ...d.data() } as TimetableEntry)
      );
      setTodayClasses(list);
    });

    return () => unsub();
  }, [user]);

  /* 🔹 Update Status */
  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(firestore, 'timetable', id), { status });
      Alert.alert('Success', `Class marked as ${status}`);
    } catch {
      Alert.alert('Error', 'Could not update status');
    }
  };

  /* 🔹 Status Color & Icon */
  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'ongoing':
        return { color: '#10B981', bgColor: '#D1FAE5', icon: 'play-circle' };
      case 'late':
        return { color: '#F59E0B', bgColor: '#FEF3C7', icon: 'time' };
      case 'cancelled':
        return { color: '#EF4444', bgColor: '#FEE2E2', icon: 'close-circle' };
      case 'attendance':
        return { color: '#3B82F6', bgColor: '#DBEAFE', icon: 'checkmark-circle' };
      default:
        return { color: '#94A3B8', bgColor: '#F1F5F9', icon: 'ellipse' };
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.displayName || 'Student'}</Text>
            <Text style={styles.title}>Today's Schedule</Text>
          </View>
          <View style={styles.dateCard}>
            <Text style={styles.dateDay}>{new Date().getDate()}</Text>
            <Text style={styles.dateMonth}>
              {new Date().toLocaleDateString('en-US', { month: 'short' })}
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle}>{today}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{todayClasses.length}</Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {todayClasses.filter(c => c.status === 'ongoing').length}
            </Text>
            <Text style={styles.statLabel}>Ongoing</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {todayClasses.filter(c => c.status === 'attendance').length}
            </Text>
            <Text style={styles.statLabel}>Attended</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Classes List */}
      <View style={styles.content}>
        {todayClasses.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={80} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Classes Today</Text>
            <Text style={styles.emptySubtitle}>Enjoy your free day! 🎉</Text>
          </View>
        )}

        {todayClasses.map((item, index) => {
          const statusInfo = getStatusInfo(item.status);
          
          return (
            <View key={item.id} style={styles.classCard}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseName}>{item.course}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusInfo.bgColor },
                    ]}
                  >
                    <Ionicons 
                      name={statusInfo.icon as any} 
                      size={14} 
                      color={statusInfo.color} 
                    />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {item.status || 'Not Set'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Class Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="time-outline" size={18} color="#667EEA" />
                  </View>
                  <Text style={styles.detailText}>{item.time}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="person-outline" size={18} color="#667EEA" />
                  </View>
                  <Text style={styles.detailText}>{item.teacher}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="location-outline" size={18} color="#667EEA" />
                  </View>
                  <Text style={styles.detailText}>{item.place}</Text>
                </View>
              </View>

              {/* Status Action Buttons */}
              <View style={styles.divider} />
              <Text style={styles.actionsLabel}>Mark as:</Text>
              <View style={styles.statusGrid}>
                <StatusButton
                  label="Ongoing"
                  icon="play-circle"
                  color="#10B981"
                  bgColor="#D1FAE5"
                  onPress={() => updateStatus(item.id, 'ongoing')}
                  active={item.status === 'ongoing'}
                />
                <StatusButton
                  label="Late"
                  icon="time"
                  color="#F59E0B"
                  bgColor="#FEF3C7"
                  onPress={() => updateStatus(item.id, 'late')}
                  active={item.status === 'late'}
                />
                <StatusButton
                  label="Cancelled"
                  icon="close-circle"
                  color="#EF4444"
                  bgColor="#FEE2E2"
                  onPress={() => updateStatus(item.id, 'cancelled')}
                  active={item.status === 'cancelled'}
                />
                <StatusButton
                  label="Attended"
                  icon="checkmark-circle"
                  color="#3B82F6"
                  bgColor="#DBEAFE"
                  onPress={() => updateStatus(item.id, 'attendance')}
                  active={item.status === 'attendance'}
                />
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

/* 🔹 Enhanced Status Button */
function StatusButton({
  label,
  icon,
  color,
  bgColor,
  onPress,
  active,
}: {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.statusBtn,
        { backgroundColor: bgColor },
        active && { borderWidth: 2, borderColor: color },
      ]}
    >
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.statusBtnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 16,
    color: '#E0E7FF',
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#E0E7FF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 20,
  },
  dateCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 60,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  dateMonth: {
    fontSize: 12,
    color: '#E0E7FF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#E0E7FF',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 16,
  },
  courseInfo: {
    gap: 10,
  },
  courseName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  actionsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    flex: 1,
    minWidth: '47%',
    justifyContent: 'center',
  },
  statusBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});