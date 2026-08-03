// src/Store/AppStore.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { commonReducer, locationReducer } from './Reducers';
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['common'], // only persist `common` (theme, language, cart, user data)
  // `location` isn't whitelisted, so it won't persist — it'll reset each launch.
  // Add 'location' to this array too if you want the last known location to survive restarts.
};
const rootReducer = combineReducers({
  common: commonReducer,
  location: locationReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);