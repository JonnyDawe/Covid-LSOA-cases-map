function getPointSymbolData() {
  return {
    type: "CIMPointSymbol",
    symbolLayers: [
      {
        type: "CIMVectorMarker",
        enable: true,
        size: 32,
        colorLocked: true,
        anchorPointUnits: "Relative",
        frame: { xmin: -5, ymin: -5, xmax: 5, ymax: 5 },
        markerGraphics: [
          {
            type: "CIMMarkerGraphic",
            geometry: { x: 0, y: 0 },
            symbol: {
              type: "CIMTextSymbol",
              fontFamilyName: "Arial",
              fontStyleName: "Bold",
              height: 4,
              horizontalAlignment: "Center",
              offsetX: 0,
              offsetY: 3,
              symbol: {
                type: "CIMPolygonSymbol",
                symbolLayers: [
                  {
                    type: "CIMSolidFill",
                    enable: true,
                    color: [255, 255, 255, 255],
                  },
                ],
              },
              verticalAlignment: "Center",
            },
            textString:
              pointType === "number"
                ? String(numberIndex + 124)
                : String.fromCharCode(64 + letterIndex++),
          },
        ],
        scaleSymbolsProportionally: true,
        respectFrame: true,
      },
      {
        type: "CIMVectorMarker",
        enable: true,
        anchorPoint: { x: 0, y: 0 },
        anchorPointUnits: "Relative",
        size: 32,
        frame: { xmin: 0.0, ymin: 0.0, xmax: 39.7, ymax: 42.0 },
        markerGraphics: [
          {
            type: "CIMMarkerGraphic",
            geometry: {
              rings: [
                [
                  [19.85, 20],
                  [14.85, 25],
                  [24.85, 25],
                  [19.85, 20],
                ],
              ],
            },
            symbol: {
              type: "CIMPolygonSymbol",
              symbolLayers: [
                {
                  type: "CIMSolidFill",
                  enable: true,
                  color: [39, 129, 153, 255],
                },
              ],
            },
          },
        ],
        scaleSymbolsProportionally: true,
        respectFrame: true,
      },
      {
        type: "CIMVectorMarker",
        enable: true,
        anchorPoint: { x: 0, y: 0 },
        anchorPointUnits: "Relative",
        size: 32,
        frame: {
          xmin: 0.0,
          ymin: 0.0,
          xmax: 39.7,
          ymax: 42,
        },
        markerGraphics: [
          {
            type: "CIMMarkerGraphic",
            geometry: {
              rings: [
                [
                  [32.2, 25],
                  [7.4, 25],
                  [6, 25.2],
                  [4.6, 25.6],
                  [3.3, 26.4],
                  [2.2, 27.5],
                  [1.2, 28.8],
                  [0.6, 30.2],
                  [0.1, 31.8],
                  [0, 33.5],
                  [0.1, 35.2],
                  [0.6, 36.8],
                  [1.2, 38.2],
                  [2.2, 39.5],
                  [3.3, 40.6],
                  [4.6, 41.4],
                  [6, 41.8],
                  [7.4, 42],
                  [32.2, 42],
                  [33.7, 41.8],
                  [35.1, 41.4],
                  [36.4, 40.6],
                  [37.5, 39.5],
                  [38.4, 38.2],
                  [39.1, 36.7],
                  [39.6, 35.2],
                  [39.7, 33.5],
                  [39.6, 31.8],
                  [39.1, 30.3],
                  [38.4, 28.8],
                  [37.5, 27.5],
                  [36.4, 26.4],
                  [35.1, 25.6],
                  [33.7, 25.2],
                  [32.2, 25],
                ],
              ],
            },
            symbol: {
              type: "CIMPolygonSymbol",
              symbolLayers: [
                {
                  type: "CIMSolidFill",
                  enable: true,
                  color: [170, 70, 50, 255],
                },
              ],
            },
          },
        ],
        scaleSymbolsProportionally: true,
        respectFrame: true,
      },
    ],
  };
}
