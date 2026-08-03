import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  LayoutChangeEvent,
} from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";

const SCREEN_WIDTH = Dimensions.get("window").width;

/* -------------------------------------------------------------------------
 * Shared shimmer engine
 * A soft 3-stop "gradient" band (transparent -> white -> transparent) built
 * from plain Views (no external gradient library needed). Sweeping this
 * across a gray shape is what reads instantly as "loading". Every skeleton
 * below (product card, category pill, subcategory chip) reuses this same
 * band + hook so the whole screen shimmers in one consistent style.
 * ---------------------------------------------------------------------- */

const GradientBand: React.FC = () => (
  <View style={styles.bandRow}>
    <View style={[styles.bandSegment, { opacity: 0 }]} />
    <View style={[styles.bandSegment, { opacity: 0.25 }]} />
    <View style={[styles.bandSegment, { opacity: 0.55 }]} />
    <View style={[styles.bandSegment, { opacity: 0.85 }]} />
    <View style={[styles.bandSegment, { opacity: 0.55 }]} />
    <View style={[styles.bandSegment, { opacity: 0.25 }]} />
    <View style={[styles.bandSegment, { opacity: 0 }]} />
  </View>
);

const ShimmerShape: React.FC<{
  style?: any;
  shimmerAnim: Animated.Value;
  sweepWidth?: number;
}> = ({ style, shimmerAnim, sweepWidth = SCREEN_WIDTH }) => {
  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-sweepWidth, sweepWidth],
  });

  return (
    <View style={[styles.baseSkeleton, style, { overflow: "hidden" }]}>
      <Animated.View
        style={[
          styles.bandWrapper,
          { width: sweepWidth, transform: [{ translateX }] },
        ]}
      >
        <GradientBand />
      </Animated.View>
    </View>
  );
};

const useShimmer = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => {
      loop.stop();
      shimmerAnim.setValue(0);
    };
  }, [shimmerAnim]);
  return shimmerAnim;
};

/* -------------------------------------------------------------------------
 * Product card skeleton — mirrors renderProductCard: image, badge row,
 * name line, price + circular add-button in the footer.
 * ---------------------------------------------------------------------- */

const ProductCardSkeleton: React.FC = () => {
  const shimmerAnim = useShimmer();
  // Card width varies with the grid's column count, so it's measured at
  // runtime instead of assumed.
  const [cardWidth, setCardWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && w !== cardWidth) setCardWidth(w);
  };

  const sweepWidth = cardWidth || 200;

  return (
    <View style={styles.card} onLayout={onLayout}>
      <ShimmerShape
        style={styles.imageShape}
        shimmerAnim={shimmerAnim}
        sweepWidth={sweepWidth}
      />

      <View style={styles.info}>
        {/* Badge row - veg/non-veg dot + small tag, mirrors renderBadgeRow */}
        <View style={styles.badgeRow}>
          <ShimmerShape
            style={styles.badgeDot}
            shimmerAnim={shimmerAnim}
            sweepWidth={sweepWidth}
          />
          <ShimmerShape
            style={styles.badgeTag}
            shimmerAnim={shimmerAnim}
            sweepWidth={sweepWidth}
          />
        </View>

        {/* Product name */}
        <ShimmerShape
          style={styles.nameLine}
          shimmerAnim={shimmerAnim}
          sweepWidth={sweepWidth}
        />

        {/* Footer row - price + circular add button */}
        <View style={styles.footerRow}>
          <ShimmerShape
            style={styles.priceLine}
            shimmerAnim={shimmerAnim}
            sweepWidth={sweepWidth}
          />
          <ShimmerShape
            style={styles.addBtn}
            shimmerAnim={shimmerAnim}
            sweepWidth={sweepWidth}
          />
        </View>
      </View>
    </View>
  );
};

/* -------------------------------------------------------------------------
 * Category pill skeleton — mirrors the icon + name category pill.
 * ---------------------------------------------------------------------- */

export const CategoryPillSkeleton: React.FC = () => {
  const shimmerAnim = useShimmer();
  return (
    <View style={styles.pill}>
      <ShimmerShape style={styles.pillIcon} shimmerAnim={shimmerAnim} />
      <View style={styles.pillTextGroup}>
        <ShimmerShape style={styles.pillTextLine1} shimmerAnim={shimmerAnim} />
        <ShimmerShape style={styles.pillTextLine2} shimmerAnim={shimmerAnim} />
      </View>
    </View>
  );
};

export const CategoryRowSkeleton: React.FC<{ count?: number }> = ({
  count = 6,
}) => (
  <View style={styles.row}>
    {Array.from({ length: count }).map((_, i) => (
      <CategoryPillSkeleton key={"cat_skel_" + i} />
    ))}
  </View>
);

/* -------------------------------------------------------------------------
 * Subcategory chip skeleton — mirrors the text-only filter chip row.
 * ---------------------------------------------------------------------- */

export const SubCategoryPillSkeleton: React.FC<{ width?: number }> = ({
  width = 70,
}) => {
  const shimmerAnim = useShimmer();
  return (
    <ShimmerShape
      style={[styles.subCategoryChip, { width }]}
      shimmerAnim={shimmerAnim}
    />
  );
};

export const SubCategoryRowSkeleton: React.FC<{ count?: number }> = ({
  count = 4,
}) => (
  <View style={styles.row}>
    {Array.from({ length: count }).map((_, i) => (
      <SubCategoryPillSkeleton key={"subcat_skel_" + i} width={50 + (i % 3) * 20} />
    ))}
  </View>
);

/* -------------------------------------------------------------------------
 * Empty-cart skeleton — mirrors the "no products in your cart" state:
 * a round icon placeholder, a title line, and a shorter subtitle line.
 * ---------------------------------------------------------------------- */

export const EmptyCartSkeleton: React.FC<{ size?: "small" | "large" }> = ({
  size = "large",
}) => {
  const shimmerAnim = useShimmer();
  const isSmall = size === "small";
  return (
    <View style={styles.emptySkeletonInner}>
      <ShimmerShape
        style={isSmall ? styles.emptyIconCircleSmall : styles.emptyIconCircleLarge}
        shimmerAnim={shimmerAnim}
        sweepWidth={200}
      />
      <ShimmerShape
        style={isSmall ? styles.emptyTitleLineSmall : styles.emptyTitleLineLarge}
        shimmerAnim={shimmerAnim}
        sweepWidth={200}
      />
      <ShimmerShape
        style={isSmall ? styles.emptySubtitleLineSmall : styles.emptySubtitleLineLarge}
        shimmerAnim={shimmerAnim}
        sweepWidth={200}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // ---- product card ----
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3.84,
    elevation: 4,
    overflow: "hidden",
  },
  imageShape: {
    width: "100%",
    aspectRatio: 1.15,
    borderRadius: 0,
  },
  info: {
    padding: 10,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(0.9),
  },
  badgeDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeTag: {
    width: 40,
    height: 12,
    borderRadius: 4,
  },
  nameLine: {
    height: 13,
    width: "80%",
    borderRadius: 4,
    marginBottom: responsiveHeight(1.1),
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLine: {
    height: 14,
    width: "38%",
    borderRadius: 4,
  },
  addBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },

  // ---- category / subcategory rows ----
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F6",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: responsiveWidth(3),
  },
  pillIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 8,
  },
  pillTextGroup: {
    justifyContent: "center",
  },
  pillTextLine1: {
    width: 50,
    height: 10,
    borderRadius: 4,
    marginBottom: 5,
  },
  pillTextLine2: {
    width: 34,
    height: 10,
    borderRadius: 4,
  },
  subCategoryChip: {
    height: 30,
    borderRadius: 15,
    marginRight: responsiveWidth(2.5),
  },

  // ---- empty cart ----
  // No flex/minHeight here on purpose — this is meant to sit inside a
  // panel that already centers its children (e.g. cartPanel / emptyWrap).
  emptySkeletonInner: {
    alignItems: "center",
  },
  // small — matches Home.js's cartPanel (icon responsiveWidth(6), text ~1/0.8)
  emptyIconCircleSmall: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    marginBottom: responsiveHeight(3),
  },
  emptyTitleLineSmall: {
    width: responsiveWidth(23),
    height: responsiveHeight(8),
    borderRadius: 8,
    marginBottom: responsiveHeight(2),
  },
  emptySubtitleLineSmall: {
    width: responsiveWidth(20),
    height: responsiveHeight(8),
    borderRadius: 8,
  },
  // large — matches HomeRight.js's emptyWrap (icon responsiveWidth(10), text ~1.5/1.3)
  emptyIconCircleLarge: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    marginBottom: responsiveHeight(2.5),
  },
  emptyTitleLineLarge: {
    width: responsiveWidth(23),
    height: responsiveHeight(8),
    borderRadius: 8,
    marginBottom: responsiveHeight(3),
  },
  emptySubtitleLineLarge: {
    width: responsiveWidth(20),
    height: responsiveHeight(7),
    borderRadius: 8,
  },

  // ---- shared shimmer primitives ----
  baseSkeleton: {
    backgroundColor: "#E4E7EB",
  },
  bandWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  bandRow: {
    flex: 1,
    flexDirection: "row",
  },
  bandSegment: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});

export default ProductCardSkeleton;