import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Svg, { Circle, Path } from 'react-native-svg';
import Avatar from '../../assets/images/avatar.png';

const SPEEDOMETER_SIZE = 200;
const SPEED_INDICATOR_LENGTH = SPEEDOMETER_SIZE * 0.4;
const CENTER_X = SPEEDOMETER_SIZE / 2;
const CENTER_Y = SPEEDOMETER_SIZE / 2;

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [speed, setSpeed] = useState(75); // Mock speed value

  // Colors based on theme
  const colors = {
    background: isDark ? '#1a1a1a' : '#fff',
    text: isDark ? '#fff' : '#1a1a1a',
    subText: isDark ? '#999' : '#666',
    card: isDark ? '#2a2a2a' : '#f5f5f5',
    accent: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  const getSpeedometerPath = () => {
    const startAngle = -120;
    const endAngle = 120;
    const radius = SPEEDOMETER_SIZE * 0.4;

    const start = {
      x: CENTER_X + radius * Math.cos((startAngle * Math.PI) / 180),
      y: CENTER_Y + radius * Math.sin((startAngle * Math.PI) / 180),
    };

    const end = {
      x: CENTER_X + radius * Math.cos((endAngle * Math.PI) / 180),
      y: CENTER_Y + radius * Math.sin((endAngle * Math.PI) / 180),
    };

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const getIndicatorRotation = () => {
    const maxSpeed = 160; // Maximum speed on the speedometer
    const angle = -120 + (speed / maxSpeed) * 240; // Map speed to angle
    return `rotate(${angle} ${CENTER_X} ${CENTER_Y})`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.subText }]}>
            Fleet Management
          </Text>
          <Text style={[styles.name, { color: colors.text }]}>Dashboard</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Image source={Avatar} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.mapContainer}
        >
          {location && (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Current Location"
              />
            </MapView>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300)}
          style={[
            styles.speedometerContainer,
            { backgroundColor: colors.card },
          ]}
        >
          <Svg width={SPEEDOMETER_SIZE} height={SPEEDOMETER_SIZE}>
            {/* Speedometer background arc */}
            <Path
              d={getSpeedometerPath()}
              stroke={isDark ? '#333' : '#ddd'}
              strokeWidth="10"
              fill="none"
            />
            {/* Speed indicator */}
            <Path
              d={`M ${CENTER_X} ${CENTER_Y} L ${CENTER_X} ${
                CENTER_Y - SPEED_INDICATOR_LENGTH
              }`}
              stroke={colors.accent}
              strokeWidth="3"
              transform={getIndicatorRotation()}
            />
            {/* Center point */}
            <Circle cx={CENTER_X} cy={CENTER_Y} r="8" fill={colors.accent} />
          </Svg>
          <Text style={[styles.speedText, { color: colors.text }]}>
            {speed}
          </Text>
          <Text style={[styles.speedUnit, { color: colors.subText }]}>MPH</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400)}
          style={styles.statsContainer}
        >
          {[
            {
              icon: 'battery-charging',
              title: 'Battery',
              value: '80%',
              color: colors.success,
            },
            {
              icon: 'thermometer',
              title: 'Temperature',
              value: '72°F',
              color: colors.warning,
            },
            {
              icon: 'time',
              title: 'Drive Time',
              value: '2.5h',
              color: colors.accent,
            },
          ].map((stat, index) => (
            <View
              key={index}
              style={[styles.statCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.statHeader}>
                <Ionicons name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statTitle, { color: colors.subText }]}>
                {stat.title}
              </Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  speedometerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  speedText: {
    fontSize: 48,
    fontWeight: 'bold',
    position: 'absolute',
  },
  speedUnit: {
    fontSize: 16,
    marginTop: 60,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
    width: '31%',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
  },
});
