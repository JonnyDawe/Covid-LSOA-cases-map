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
