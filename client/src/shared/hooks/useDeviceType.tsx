import { useAppSelector } from "@shared/store/hooks.ts";
import { SelectDeviceType } from "@entities/app";

export enum DeviceType {
  desktop = "DESKTOP",
  mobile = "MOBILE",
}

export const useDeviceType = () => {
  const type = useAppSelector(SelectDeviceType);

  return {
    type,
    isMobile: type === DeviceType.mobile,
    isDesktop: type === DeviceType.desktop,
  };
};
