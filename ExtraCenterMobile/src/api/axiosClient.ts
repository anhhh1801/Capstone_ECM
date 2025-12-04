import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// 1. Cấu hình địa chỉ API
// Nếu chạy Android Emulator thì dùng 10.0.2.2
// Nếu chạy máy thật (iOS/Android) thì thay dòng dưới bằng IP LAN của bạn (vd: 192.168.1.x)
const ANDROID_EMULATOR_URL = 'http://10.0.2.2:8080/api';
const LOCAL_LAN_URL = 'http://192.168.1.12:8080/api'; // <--- Thay IP của bạn vào đây

// Tự động chọn URL dựa trên thiết bị
const BASE_URL = Platform.OS === 'android'
    ? ANDROID_EMULATOR_URL // Dùng cho Emulator
    // ? LOCAL_LAN_URL     // Uncomment dòng này nếu chạy máy thật Android
    : LOCAL_LAN_URL;       // iOS Simulator hoặc máy thật iOS buộc dùng IP LAN

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(async (config) => {
    try {
        const token = await AsyncStorage.getItem('accessToken');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error("Lỗi khi đọc token từ storage:", error);
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosClient;