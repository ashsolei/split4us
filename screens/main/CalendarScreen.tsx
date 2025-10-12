import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { sv } from 'date-fns/locale';

type CalendarNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CalendarEvent {
  id: string;
  contract_id: string;
  contract_title: string;
  event_date: string;
  event_type: 'renewal' | 'expiry' | 'reminder';
  description: string;
}

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<CalendarNavigationProp>();

  const loadEvents = async () => {
    try {
      // Load contracts and create calendar events
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('*')
        .gte('end_date', format(startOfMonth(currentDate), 'yyyy-MM-dd'))
        .lte('end_date', format(endOfMonth(addMonths(currentDate, 2)), 'yyyy-MM-dd'));

      if (error) throw error;

      if (contracts) {
        const calendarEvents: CalendarEvent[] = contracts.map(contract => ({
          id: contract.id,
          contract_id: contract.id,
          contract_title: contract.title,
          event_date: contract.end_date,
          event_type: 'expiry' as const,
          description: `Avtalet utgår`,
        }));

        setEvents(calendarEvents);
      }
    } catch (error: any) {
      console.error('Error loading events:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const hasEvent = (date: Date) => {
    return events.some(event => isSameDay(new Date(event.event_date), date));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.event_date), date));
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'renewal':
        return '#10b981';
      case 'expiry':
        return '#ef4444';
      case 'reminder':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  const renderDay = (date: Date) => {
    const isCurrentMonth = isSameMonth(date, currentDate);
    const isToday = isSameDay(date, new Date());
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const dayHasEvent = hasEvent(date);

    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[
          styles.dayCell,
          !isCurrentMonth && styles.dayOutOfMonth,
          isToday && styles.dayToday,
          isSelected && styles.daySelected,
        ]}
        onPress={() => setSelectedDate(date)}
      >
        <Text
          style={[
            styles.dayText,
            !isCurrentMonth && styles.dayTextOutOfMonth,
            isToday && styles.dayTextToday,
            isSelected && styles.dayTextSelected,
          ]}
        >
          {format(date, 'd')}
        </Text>
        {dayHasEvent && <View style={styles.eventDot} />}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const days = getDaysInMonth();
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setCurrentDate(subMonths(currentDate, 1))}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={24} color="#3b82f6" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {format(currentDate, 'MMMM yyyy', { locale: sv })}
        </Text>

        <TouchableOpacity
          onPress={() => setCurrentDate(addMonths(currentDate, 1))}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map(day => (
          <Text key={day} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendar}>
        {days.map(day => renderDay(day))}
      </View>

      {selectedDate && (
        <View style={styles.eventsSection}>
          <Text style={styles.eventsSectionTitle}>
            Händelser {format(selectedDate, 'PPP', { locale: sv })}
          </Text>

          {selectedDateEvents.length === 0 ? (
            <View style={styles.noEvents}>
              <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
              <Text style={styles.noEventsText}>Inga händelser denna dag</Text>
            </View>
          ) : (
            selectedDateEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() =>
                  navigation.navigate('ContractDetail', { contractId: event.contract_id })
                }
              >
                <View
                  style={[
                    styles.eventIndicator,
                    { backgroundColor: getEventColor(event.event_type) },
                  ]}
                />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.contract_title}</Text>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Utgångsdatum</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]}>
            </View>
            <Text style={styles.legendText}>Förnyelse</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Påminnelse</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  weekDays: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  dayOutOfMonth: {
    opacity: 0.3,
  },
  dayToday: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  daySelected: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#111827',
  },
  dayTextOutOfMonth: {
    color: '#9ca3af',
  },
  dayTextToday: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ef4444',
    marginTop: 2,
  },
  eventsSection: {
    padding: 16,
  },
  eventsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  noEvents: {
    alignItems: 'center',
    padding: 32,
  },
  noEventsText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  eventIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  legend: {
    padding: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  legendItems: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
