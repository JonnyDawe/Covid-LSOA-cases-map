import esri = __esri;
export interface ToolTipInfo {
  screenPoint: { x: number; y: number };
  text: string;
}

export interface CovidTableDataElement {
  MSOAName: string;
  MSOALocalAuthority: string;
  cases: number;
  MSOACode: string;
  MSOAGeometry: esri.Geometry;
}

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  DeviceInfo: {
    userAgent: string;
    os: string;
    browser: string;
    device: string;
    os_version: string;
    browser_version: string;
  };
}
