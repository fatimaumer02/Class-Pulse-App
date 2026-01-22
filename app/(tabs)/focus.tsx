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
import { collection, query, where, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
// import { serverTimestamp } from 'firebase/firestore';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// 🔥 Motivational Quotes Pool (rotates daily)
const motivationalQuotes = [
  { quote: "Consistency beats motivation — keep going!", emoji: "🚀" },
  { quote: "Small steps every day lead to big achievements!", emoji: "🎯" },
  { quote: "Focus on progress, not perfection!", emoji: "💪" },
  { quote: "Your future self will thank you for today's effort!", emoji: "⭐" },
  { quote: "Success is the sum of small efforts repeated daily!", emoji: "🔥" },
  { quote: "The expert in anything was once a beginner!", emoji: "🌱" },
  { quote: "Discipline is choosing what you want most over what you want now!", emoji: "🎓" },
  { quote: "Every day is a fresh start to reach your goals!", emoji: "🌅" },
  { quote: "Your only limit is the one you set for yourself!", emoji: "🚀" },
  { quote: "Dream big, work hard, stay focused!", emoji: "💎" },
  { quote: "The harder you work, the luckier you get!", emoji: "🍀" },
  { quote: "Believe in yourself and all that you are!", emoji: "✨" },
  { quote: "Education is the passport to the future!", emoji: "🎓" },
  { quote: "Stay hungry, stay foolish, stay focused!", emoji: "🧠" },
  { quote: "You're capable of amazing things!", emoji: "🌟" },
];

export default function FocusScreen() {
  const user = auth.currentUser;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // 🔹 Today Stats
  const [todayStats, setTodayStats] = useState({
    total: 0,
    ongoing: 0,
    late: 0,
    cancelled: 0,
  });

  // 🔹 Weekly chart
  const [weeklyData, setWeeklyData] = useState<number[]>(Array(7).fill(0));

  // 🔹 Focus Timer
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [focusDuration, setFocusDuration] = useState(25);

  // 🔹 Get daily motivation (changes every day)
  const getDailyMotivation = () => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % motivationalQuotes.length;
    return motivationalQuotes[index];
  };

  const dailyMotivation = getDailyMotivation();

  // 🔹 Load today stats
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(firestore, 'timetable'),
      where('uid', '==', user.uid),
      where('day', '==', today)
    );

    const unsub = onSnapshot(q, snap => {
      let total = snap.size;
      let ongoing = 0;
      let late = 0;
      let cancelled = 0;

      snap.forEach(d => {
        const s = d.data().status;
        if (s === 'ongoing') ongoing++;
        if (s === 'late') late++;
        if (s === 'cancelled') cancelled++;
      });

      setTodayStats({ total, ongoing, late, cancelled });
    });

    return () => unsub();
  }, []);

  // 🔹 Load weekly chart
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(firestore, 'timetable'),
      where('uid', '==', user.uid)
    );

    const unsub = onSnapshot(q, snap => {
      const counts = Array(7).fill(0);
      snap.forEach(d => {
        const index = days.indexOf(d.data().day);
        if (index !== -1) counts[index]++;
      });
      setWeeklyData(counts);
    });

    return () => unsub();
  }, []);

  // 🔹 Focus timer effect
  useEffect(() => {
    let timer: any;

    if (running && focusTime > 0) {
      timer = setInterval(() => setFocusTime(prev => prev - 1), 1000);
    }

    if (focusTime === 0 && running) {
      setRunning(false);
      setSessions(prev => prev + 1);
      Alert.alert('🎉 Session Complete!', 'Great work! Time for a short break 🛋️');
      setFocusTime(focusDuration * 60);
      saveSessionToFirestore();
    }

    return () => clearInterval(timer);
  }, [running, focusTime, focusDuration]);

  // 🔹 Save focus session to Firestore
  const saveSessionToFirestore = async () => {
    if (!user) return;
    try {
      const todayKey = new Date().toISOString().split('T')[0];
      const ref = doc(firestore, 'focusSessions', `${user.uid}_${todayKey}`);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const prev = snap.data().count || 0;
        await setDoc(ref, { count: prev + 1 }, { merge: true });
      } else {
        await setDoc(ref, { count: 1 });
      }
    } catch (err) {
      console.log('Could not save session:', err);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const maxValue = Math.max(...weeklyData, 1);

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Focus & Productivity</Text>
          <Text style={styles.subGreeting}>Stay focused, stay productive</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="bulb" size={28} color="#4F46E5" />
        </View>
      </View>

      {/* Today Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="calendar" size={24} color="#4F46E5" />
          </View>
          <Text style={styles.statValue}>{todayStats.total}</Text>
          <Text style={styles.statLabel}>Total Classes</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          </View>
          <Text style={styles.statValue}>{todayStats.ongoing}</Text>
          <Text style={styles.statLabel}>Ongoing</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.statValue}>{todayStats.late}</Text>
          <Text style={styles.statLabel}>Late</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="close-circle" size={24} color="#EF4444" />
          </View>
          <Text style={styles.statValue}>{todayStats.cancelled}</Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
      </View>

      {/* Weekly Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Weekly Overview</Text>
            <Text style={styles.cardSubtitle}>Your weekly attendance pattern</Text>
          </View>
          <View style={styles.cardIcon}>
            <Ionicons name="bar-chart" size={20} color="#4F46E5" />
          </View>
        </View>

        <View style={styles.chartContainer}>
          {weeklyData.map((value, index) => {
            const barHeight = Math.max((value / maxValue) * 140, 4);
            const isToday = days[index] === today;
            
            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barContainer}>
                  {value > 0 && (
                    <Text style={styles.barValue}>{value}</Text>
                  )}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: isToday ? '#4F46E5' : '#EEF2FF',
                      },
                    ]}
                  />
                </View>
                <Text style={[
                  styles.dayLabel,
                  { 
                    color: isToday ? '#4F46E5' : '#6B7280',
                    fontWeight: isToday ? '700' : '500',
                  }
                ]}>
                  {days[index].substring(0, 3)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Focus Timer */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Focus Timer</Text>
            <Text style={styles.cardSubtitle}>Pomodoro technique for better focus</Text>
          </View>
          <View style={styles.cardIcon}>
            <Ionicons name="timer" size={20} color="#4F46E5" />
          </View>
        </View>

        {/* Timer Display */}
        <View style={styles.timerDisplay}>
          <Ionicons 
            name={running ? "pause-circle" : "play-circle"} 
            size={40} 
            color="#4F46E5" 
            style={{ marginBottom: 8 }}
          />
          <Text style={styles.timerText}>{formatTime(focusTime)}</Text>
          <Text style={styles.timerLabel}>
            {running ? 'Focus Time Running' : 'Ready to Focus'}
          </Text>
        </View>

        {/* Timer Controls */}
        <View style={styles.timerControls}>
          <TouchableOpacity
            style={styles.controlBtnPrimary}
            onPress={() => setRunning(!running)}
          >
            <Ionicons name={running ? "pause" : "play"} size={20} color="#FFFFFF" />
            <Text style={styles.controlBtnText}>{running ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtnSecondary}
            onPress={() => {
              setRunning(false);
              setFocusTime(focusDuration * 60);
            }}
          >
            <Ionicons name="refresh" size={20} color="#111827" />
            <Text style={styles.controlBtnTextSecondary}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Duration Selector */}
        <View style={styles.durationSelector}>
          {[25, 50, 90].map(min => (
            <TouchableOpacity
              key={min}
              onPress={() => {
                setFocusDuration(min);
                setFocusTime(min * 60);
                setRunning(false);
              }}
              style={[
                styles.durationBtn,
                {
                  backgroundColor: focusDuration === min ? '#4F46E5' : '#F3F4F6',
                },
              ]}
            >
              <Text
                style={[
                  styles.durationText,
                  { color: focusDuration === min ? '#FFFFFF' : '#111827' },
                ]}
              >
                {min}
              </Text>
              <Text
                style={[
                  styles.durationLabel,
                  { color: focusDuration === min ? '#FFFFFF' : '#6B7280' },
                ]}
              >
                min
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sessions Badge */}
        <View style={styles.sessionsBadge}>
          <Ionicons name="flame" size={20} color="#F59E0B" />
          <Text style={styles.sessionsText}>
            {sessions} Focus Session{sessions !== 1 ? 's' : ''} Today
          </Text>
        </View>
      </View>

      {/* Insights */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Smart Insights</Text>
            <Text style={styles.cardSubtitle}>AI-powered productivity tips</Text>
          </View>
          <View style={styles.cardIcon}>
            <Ionicons name="bulb" size={20} color="#4F46E5" />
          </View>
        </View>

        <View style={styles.insightsList}>
          <View style={styles.insightItem}>
            <View style={[styles.insightIcon, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="trending-up" size={18} color="#4F46E5" />
            </View>
            <Text style={styles.insightText}>
              You attend most classes mid-week
            </Text>
          </View>

          <View style={styles.insightItem}>
            <View style={[styles.insightIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="flash" size={18} color="#10B981" />
            </View>
            <Text style={styles.insightText}>
              Productivity improves after focus sessions
            </Text>
          </View>

          <View style={styles.insightItem}>
            <View style={[styles.insightIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="sunny" size={18} color="#F59E0B" />
            </View>
            <Text style={styles.insightText}>
              Morning schedules show higher consistency
            </Text>
          </View>
        </View>
      </View>

      {/* Daily Motivation (Changes Every Day) */}
      <View style={styles.motivationCard}>
        <View style={styles.motivationHeader}>
          <Text style={styles.motivationEmoji}>{dailyMotivation.emoji}</Text>
          <Text style={styles.motivationTitle}>Daily Motivation</Text>
        </View>
        <Text style={styles.motivationQuote}>{dailyMotivation.quote}</Text>
        <View style={styles.motivationFooter}>
          <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.motivationDate}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Card Styles
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Chart
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 20,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: '70%',
    borderRadius: 6,
    minHeight: 4,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  dayLabel: {
    fontSize: 12,
    marginTop: 8,
  },

  // Timer
  timerDisplay: {
    padding: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 2,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  controlBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  controlBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  controlBtnTextSecondary: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  durationSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 20,
    fontWeight: '800',
  },
  durationLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sessionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  sessionsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  // Insights
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 20,
  },

  // Motivation Card
  motivationCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#4F46E5',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  motivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  motivationEmoji: {
    fontSize: 28,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  motivationQuote: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 12,
  },
  motivationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  motivationDate: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
});