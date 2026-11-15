import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDarkMode: false,
  userData: null,
  userToken: '',
  deviceToken: '',
  //baseUrl: 'https://menuhuts.com/apiv/',
  //siteUrl: 'https://menuhuts.com/',
  //baseUrl: 'https://staging-api.nexordr.com/api/',
  siteUrl: 'https://staging-api.nexordr.com/',
  //baseUrl: 'https://staging-api.acuitysoftware.in/api/',
  //siteUrl: 'https://staging-api.acuitysoftware.in/',
  //baseUrl: 'https://api.nexordr.com/api/',
  //siteUrl: 'https://api.nexordr.com/',

  baseUrl: 'https://api.nexordr.cloud/api/web-business/',
  siteSetting: 'https://api.nexordr.cloud/api/',

  user_slug: "BGYSTLAHONQD",
  loginImages: {},

  tempEmailorMobile: '',
  google_api_key: '',
  //Navigation state
  isStackHeaderVisible: false,
  post_data: {},
  langId: 1,
  cartDetails: [],
  cartQuantity: 0,
  newOrder: 0,
  newOrderNotification: {},
  newOrderData: {},
  orderid: null,

  languagesList: [],
  languageStrings: {},
  isLanguageLoading: false,
  businessTheme: {
    business_primary_color: '#2916A1',
    business_secondary_color: '#FD8324',
    business_background: '#ffffff',
    business_cancelbutton: '#FF0000',
    business_font_color: '#ffffff',
    business_secondary_font_color: null,
    business_font_color_on_background: '#000000',
    business_selected_button_color: '#d56510',
    business_secondary_background: '#d9d9d9',
    business_font_color_on_secondary_background: '#525459',
    businees_highlighted_color: '#FF0000',
    business_login_image_path: '',
  },
  isThemeLoaded: false,

  UsbPrinter: null,
};

export const commonReducer = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setIsDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },

    saveOrderId: (state, action) => {
      console.log('order_id set');
      state.orderid = action.payload;
    },

    deleteOrderId: (state, action) => {
      console.log('order_id set');
      state.orderid = null;
    },

    saveData: (state, action) => {
      console.log('csdkbcsdkbcdsbck');
      // state.userData = action.payload;
    },

    setTempEmail: (state, action) => {
      state.tempEmailorMobile = action.payload;
    },

    setUserData: (state, action) => {
      //console.log("action data : ", action.payload);
      state.userData = action.payload.data;
      state.userToken = action.payload.token;
    },
    setUserDataAfterLogin: (state, action) => {
      state.userData = action.payload.data;
    },

    clearUserData: state => {
      state.userData = null;
      state.userToken = '';
    },

    localstorage_DeviceTokenAdd: (state, action) => {
      console.log('common:' + action.payload);
      state.deviceToken = action.payload;
    },

    localstorage_TokenAdd: (state, action) => {
      state.userToken = action.payload;
    },
    localstorage_UserdetailsAdd: (state, action) => {
      state.userData = action.payload;
    },

    //Navigation State
    setIsStackHeaderVisible: (state, action) => {
      state.isStackHeaderVisible = action.payload;
    },

    // advertisement for tab screens
    setAdvertisement: (state, action) => {
      console.log('adds payload', action);
      state.advertisements = action.payload;
    },

    setPostData: (state, action) => {
      //console.log("adds payload", action);
      state.post_data = action.payload;
    },
    removePostData: (state, action) => {
      //console.log("adds payload", action);
      state.post_data = {};
    },
    setCartDetails: (state, action) => {
      state.cartDetails = action.payload;
    },
    setCartQuantity: (state, action) => {
      state.cartQuantity = action.payload;
    },
    setNewOrder: (state, action) => {
      state.newOrder = action.payload;
    },
    setNewOrderNotification: (state, action) => {
      state.newOrderNotification = action.payload;
    },
    setNewOrderData: (state, action) => {
      state.newOrderData = action.payload;
    },

    setLoginImages: (state, action) => {
      state.loginImages = action.payload;
    },

    setLanguagesList: (state, action) => {
      state.languagesList = action.payload;
    },
    setLangId: (state, action) => {
      state.langId = action.payload;
    },
    setLanguageStrings: (state, action) => {
      state.languageStrings = action.payload;
    },
    setIsLanguageLoading: (state, action) => {
      state.isLanguageLoading = action.payload;
    },
    setBusinessTheme: (state, action) => {
      state.businessTheme = action.payload;
      state.isThemeLoaded = true;
    },

    setUsbPrinterValue: (state, action) => {
      console.log('payload');
      console.log(action.payload);
      state.UsbPrinter = action.payload;
    },
    unsetUsbPrinterValue: state => {
      state.UsbPrinter = null;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setIsDarkMode,
  saveData,
  setTempEmail,
  setUserData,
  clearUserData,
  localstorage_TokenAdd,
  localstorage_UserdetailsAdd,
  setUserDataAfterLogin,
  setPostData,
  removePostData,
  localstorage_DeviceTokenAdd,
  setCartDetails,
  setCartQuantity,

  //Navigation State
  setIsStackHeaderVisible,

  // advertisement for tab screens
  setAdvertisement,
  setNewOrder,
  setNewOrderNotification,
  setNewOrderData,
  saveOrderId,
  deleteOrderId,
  setLoginImages,

  setLanguagesList,
  setLangId,
  setLanguageStrings,
  setIsLanguageLoading,

  setBusinessTheme,

  setUsbPrinterValue,
  unsetUsbPrinterValue,
} = commonReducer.actions;

export default commonReducer.reducer;
