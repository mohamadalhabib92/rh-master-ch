import { requireOptionalNativeModule } from 'expo-modules-core';

/** Absent on web and in tests. Never throws. */
export default requireOptionalNativeModule('MacInput');
