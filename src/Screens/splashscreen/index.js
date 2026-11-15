import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import LanguageSwitcher from '../Component/LanguageSwitcher';
import { useAppTheme } from "../../Hooks/useAppTheme"
import { Images } from '../../Constants/ImageIconContant';
const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const vh = height / 100;

// ---- Design tokens ----
const COLORS = {
  indigo: '#3D2FC9',
  indigoLight: '#6C5CE7',
  indigoDark: '#2E22A8',
  orange: '#F5891F',
  bg: '#FFFFFF',
  textDark: '#1A1D29',
  textGray: '#6B7280',
  cardBg: '#FFFFFF',
  cardBorder: '#EEF0F5',
  iconBgPurple: '#EDEBFB',
  iconBgOrange: '#FDEEE0',
  dotGray: '#E5E7EB',
  dividerGray: '#E5E7EB',
};

const FEATURES = [
  {
    icon: <Ionicons name="storefront-outline" size={vh * 4} color={COLORS.indigo} />,
    bg: COLORS.iconBgPurple,
    title: 'Smart POS',
    subtitle: 'Simplify your sales management',
  },
  {
    icon: <Feather name="bar-chart-2" size={vh * 4} color={COLORS.orange} />,
    bg: COLORS.iconBgOrange,
    title: 'Real-time Data',
    subtitle: 'Get real-time insights of your business',
  },
  {
    icon: <MaterialCommunityIcons name="shield-check-outline" size={vh * 4} color={COLORS.indigo} />,
    bg: COLORS.iconBgPurple,
    title: 'Secure & Reliable',
    subtitle: 'Your business data is always protected',
  },
];

const BOTTOM_STATS = [
  {
    icon: <Feather name="zap" size={vh * 4} color={COLORS.indigo} />,
    title: 'Easy to Use',
    subtitle: 'User-friendly interface',
  },
  {
    icon: <Feather name="bar-chart-2" size={vh * 4} color={COLORS.orange} />,
    title: 'Boost Productivity',
    subtitle: 'Streamline operations',
  },
  {
    icon: <Feather name="trending-up" size={vh * 4} color={COLORS.indigo} />,
    title: 'Grow Your Business',
    subtitle: 'Scale with confidence',
  },
  {
    icon: <Feather name="headphones" size={vh * 4} color={COLORS.orange} />,
    title: '24/7 Support',
    subtitle: "We're here for you",
  },
];

export default function SplashScreen({ navigation }) {
  const [appIsReady, setAppIsReady] = useState(false);
  const { loginImages } = useSelector(state => state.common);
  const theme = useAppTheme();
  useEffect(() => {
    const prepare = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setAppIsReady(true);
    };
    prepare();
  }, []);
  const handleStart = () => {
    navigation.navigate('Login');
  };
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Main content: left panel + right illustration */}
        <View style={styles.languageSwitcherWrap}>
          <LanguageSwitcher />
        </View>
        <View style={styles.mainRow}>
          {/* LEFT PANEL */}
          <View style={styles.leftPanel}>
            {/* Logo */}
            <View style={styles.logoRow}>
              <Image
                // source={require('../../assets/images/static_logo.png')}
                source={
                  loginImages?.logo
                    ? { uri: loginImages.logo }
                    : Images.splash_logo
                }
                style={{
                  width: vh * 90,
                  height: vh * 20,
                }}
                resizeMode="contain"
              />
            </View>

            {/* Feature cards */}
            <View style={styles.featuresRow}>
              {FEATURES.map((f, i) => (
                <View key={i} style={[styles.featureCard, { backgroundColor: theme.background }]}>
                  <View style={[styles.featureIconWrap, { backgroundColor: f.bg }]}>
                    {f.icon}
                  </View>
                  <Text style={[styles.featureTitle, { color: theme.fontColorOnBackground }]}>{f.title}</Text>
                  <Text numberOfLines={2} style={[styles.featureSubtitle, { color: theme.fontColorOnBackground }]}>
                    {f.subtitle}
                  </Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity activeOpacity={0.85} onPress={handleStart}
              style={[styles.startButton, { backgroundColor: theme.primary }]}>

              <Feather name="arrow-right" size={vh * 3} color={theme.fontColor} />
              <Text style={[styles.startButtonText, { color: theme.fontColor }]}>Start now</Text>

            </TouchableOpacity>

            <View style={styles.secureRow}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={vh * 3}
                color={theme.fontColorOnBackground}
              />
              <Text style={[styles.secureText, { color: theme.fontColorOnBackground }]}>
                Secure login for authorized users only
              </Text>
            </View>
          </View>
          {/* RIGHT ILLUSTRATION */}
          <View style={styles.rightPanel}>
            <Image
              source={require('../../assets/images/indus_right.png')}
              style={styles.posImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Bottom stats strip */}
        <View style={styles.bottomStrip}>
          {BOTTOM_STATS.map((s, i) => (
            <React.Fragment key={i}>
              <View style={styles.bottomItem}>
                <View style={styles.bottomIconWrap}>{s.icon}</View>
                <View style={styles.bottomTextWrap}>
                  <Text numberOfLines={1} style={[styles.bottomTitle, { color: theme.fontColorOnBackground }]}>
                    {s.title}
                  </Text>
                  <Text numberOfLines={1} style={[styles.bottomSubtitle, { color: theme.fontColorOnBackground }]}>
                    {s.subtitle}
                  </Text>
                </View>
              </View>
              {i < BOTTOM_STATS.length - 1 && <View style={styles.bottomDivider} />}
            </React.Fragment>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const CARD_GAP = vh * 1;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  languageSwitcherWrap: {
    position: 'absolute',
    top: vh * 3,
    right: vh * 3,
    zIndex: 10,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  leftPanel: {
    top: vh * -5,
    width: '46%',
    maxWidth: vh * 80,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightPanel: {
    top: vh * 3,
    width: '36%',
    maxWidth: vh * 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posImage: {
    width: '100%',
    aspectRatio: 1449 / 1157,
    maxWidth: vh * 90,
  },

  logoRow: {
    left: vh * -10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: vh * 3.5,
  },

  featuresRow: {
    flexDirection: 'row',
    gap: vh * 4,
    //marginTop: vh * 0.5,     
    justifyContent: 'flex-start',
  },
  featureCard: {
    height: vh * 24,
    width: vh * 22,           // narrower, closer to screenshot proportions
    borderRadius: vh * 2,     // soft rounded corners, not pill-shaped
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vh * 1,
    paddingHorizontal: vh * 1,
    // no border — elevation comes from shadow only
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: vh * 1.4,
    shadowOffset: { width: 0, height: vh * 0.6 },
    elevation: 1,
  },
  featureIconWrap: {
    width: vh * 8,
    height: vh * 8,
    borderRadius: vh * 4,     // fully circular icon badge
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vh * 1,
  },
  featureTitle: {
    fontSize: vh * 2.5,
    fontWeight: '700',
    marginBottom: vh * 1,
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: vh * 1.5,
    lineHeight: vh * 2,
    textAlign: 'center',      // screenshot subtitles are centered, wrap to 2 lines
  },

  startButton: {
    top: vh * 5,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vh * 1.2,
    paddingVertical: vh * 2,     // was vh * 1.1
    paddingHorizontal: vh * 4,   // was vh * 2.2
    gap: vh * 0.8,                 // was vh * 0.6
    marginBottom: vh * 2,
    shadowColor: COLORS.indigo,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  startButtonText: {
    fontSize: vh * 3,   // was vh * 1.4
    fontWeight: '500',
  },
  secureRow: {
    top: vh * 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: vh * 0.4,
  },
  secureText: {
    fontSize: vh * 2.3,
  },
  bottomStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',   // centers the whole strip as a block
    marginBottom: vh * 7,
  },
  bottomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vh * 1,
  },
  bottomDivider: {
    width: 1,
    height: vh * 4,
    backgroundColor: COLORS.dividerGray,
    marginHorizontal: vh * 2,
  },
  bottomIconWrap: {
    width: vh * 7.5,
    height: vh * 7.5,
    borderRadius: vh * 4,
    borderColor: COLORS.dividerGray,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF', // keep clean white
  },
  bottomTextWrap: {
    flexShrink: 1,
  },
  bottomTitle: {
    fontSize: vh * 2.5,
    fontWeight: '700',
  },
  bottomSubtitle: {
    fontSize: vh * 1.5,
  },
});
