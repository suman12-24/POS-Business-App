import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  responsiveFontSize,
  responsiveHeight,
} from 'react-native-responsive-dimensions';

const ServiceTypeSelector = ({ options, selectedKey, onSelect, styles, theme }) => {
  if (!options || options.length === 0) return null;

  return (
    <View style={styles.serviceTypeRow}>
      {options.map(opt => {
        const isSelected = selectedKey === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.serviceTypeCard,
              isSelected && styles.serviceTypeCardSelected,
            ]}
            onPress={() => onSelect(opt.key)}
          >
            {isSelected ? (
              <View style={styles.serviceTypeCheckBadge}>
                <Ionicons
                  name="checkmark"
                  size={responsiveFontSize(0.95)}
                  color={theme.fontColor}
                />
              </View>
            ) : null}
            <Ionicons
              name={opt.icon}
              size={responsiveFontSize(1.8)}
              color={isSelected ? theme.primary : theme.fontColorOnBackground}
              style={{ marginBottom: responsiveHeight(0.6) }}
            />
            <Text style={styles.serviceTypeLabel}>{opt.label}</Text>
            <Text style={styles.serviceTypeSub} numberOfLines={2}>
              {opt.sub}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default React.memo(ServiceTypeSelector);