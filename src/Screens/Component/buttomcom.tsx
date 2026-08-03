import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
// import useLanguage from '../../hooks/useLanguage';


const ButtonComponent: React.FC<{
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: object;
  textStyle?: object,
  loaderComponent?: ReactNode
}> = ({ title, onPress, disabled = false, loading = false, style, textStyle, loaderComponent }) => {
  //   const { t } = useLanguage();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, style, disabled && styles.disabled]}
    >

      <Text style={[styles.buttonText, textStyle]}>{title}</Text>

    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    // bottom:10
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabled: {
    backgroundColor: '#ccc',
  },
});
export default ButtonComponent;