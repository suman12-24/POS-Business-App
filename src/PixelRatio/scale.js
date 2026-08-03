import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// Base guideline (standard mobile)
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

// ✅ Clamp limits (VERY IMPORTANT)
const MAX_SCALE = 1.2;   // prevents huge UI on tablets
const MIN_SCALE = 0.9;   // prevents too small UI on small devices

const getScaleFactor = () => {
    const scale = width / guidelineBaseWidth;
    return Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
};

const getVerticalScaleFactor = () => {
    const scale = height / guidelineBaseHeight;
    return Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
};

// ✅ Main scale functions
const scale = (size) =>
    PixelRatio.roundToNearestPixel(size * getScaleFactor());

const verticalScale = (size) =>
    PixelRatio.roundToNearestPixel(size * getVerticalScaleFactor());

// ✅ Best for fonts
const moderateScale = (size, factor = 0.5) =>
    size + (scale(size) - size) * factor;

const verticalModerateScale = (size, factor = 0.5) =>
    size + (verticalScale(size) - size) * factor;

// aliases (to match your existing usage)
const mdscale = moderateScale;
const vrscale = verticalModerateScale;

export {
    scale,
    verticalScale,
    moderateScale,
    verticalModerateScale,
    mdscale,
    vrscale,
};