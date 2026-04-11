import {
  ActivityIndicator,
  View,
  Text,
  useWindowDimensions,
  Modal,
} from 'react-native';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
  responsiveScreenHeight,
} from 'react-native-responsive-dimensions';
import { Colors } from '../Constants/Colors';

function Loader() {
  const { height } = useWindowDimensions();
  return (
    <Modal supportedOrientations={['landscape']} transparent={true} visible={true} animationType="fade">
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        <View
          style={{
            width: responsiveWidth(15),
            height: responsiveWidth(10),
            backgroundColor: '#fff',
            borderRadius: responsiveWidth(1),
            padding: responsiveWidth(2),
            // iOS-specific shadow properties
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            // Android-specific shadow property
            elevation: 5,
          }}
        >
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text
            style={{
              marginTop: responsiveHeight(1),
              fontSize: responsiveFontSize(1.8),
              fontWeight: 600,
              color: '#333',
            }}
          >
            Loading...
          </Text>
        </View>
      </View>
    </Modal>
  );
}

{
  /*
<View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 1,
      }}
    >
      <ActivityIndicator color={'#28A745'} size="large" />
      <Text
        style={{
          marginTop: responsiveHeight(2),
          fontSize: responsiveFontSize(2),
          fontWeight: 600,
          color: '#333',
        }}
      >
        {responsiveScreenHeight(100) + height}Loading...
      </Text>
    </View>

  */
}
export default Loader;
