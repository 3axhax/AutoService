import { useEffect, useState } from "react";

export enum DeviceType {
  desktop = "DESKTOP",
  mobile = "MOBILE",
}

export const useDeviceType = () => {
  const [type, setType] = useState<DeviceType>(DeviceType.desktop);

  const checkWidth = () => {
    if (window.innerWidth < 1024) {
      setType(DeviceType.mobile);
    } else {
      setType(DeviceType.desktop);
    }
  };

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => {
      window.removeEventListener("resize", checkWidth);
    };
  }, []);

  return {
    type,
    isMobile: type === DeviceType.mobile,
    isDesktop: type === DeviceType.desktop,
  };
};
