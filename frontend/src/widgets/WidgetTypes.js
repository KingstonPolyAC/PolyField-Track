// Widget type definitions, default sizes and default configs for the layout builder.
// Grid is 20 columns x 20 rows — each unit = 5% of viewport.

export const WIDGET_TYPES = {
  results_table: {
    label: 'Results Table',
    defaultW: 14,
    defaultH: 18,
    defaultConfig: {
      columns: ['place', 'name', 'affiliation', 'time'],
      showHeader: true,
      maxRows: 8,
      speedUnit: 'kph',
    },
  },
  clock: {
    label: 'Running Clock',
    defaultW: 10,
    defaultH: 7,
    defaultConfig: {
      colorRunning:   '#1e88e5',
      colorStopped:   '#e0e0e0',
      colorReady:     '#607d8b',
      colorTimeOfDay: '#e0e0e0',
      backgroundColor: '#000000',
    },
  },
  event_name: {
    label: 'Event Name (Current)',
    defaultW: 10,
    defaultH: 3,
    defaultConfig: {
      source: 'clock',
      align: 'center',
      color: '#ffffff',
      backgroundColor: '',
      fontSizePercent: 65,
      maxLines: 1,
    },
  },
  event_name_result: {
    label: 'Event Name (Result)',
    defaultW: 10,
    defaultH: 3,
    defaultConfig: {
      source: 'lif',
      align: 'center',
      color: '#ffffff',
      backgroundColor: '',
      fontSizePercent: 65,
      maxLines: 1,
    },
  },
  wind: {
    label: 'Wind (Result)',
    defaultW: 5,
    defaultH: 3,
    defaultConfig: {
      source: 'lif',
      align: 'center',
      color: '#a0b4c8',
      backgroundColor: '',
    },
  },
  wind_current: {
    label: 'Wind (Current)',
    defaultW: 5,
    defaultH: 3,
    defaultConfig: {
      source: 'clock',
      align: 'center',
      color: '#a0b4c8',
      backgroundColor: '',
    },
  },
  custom_text: {
    label: 'Custom Text',
    defaultW: 8,
    defaultH: 3,
    defaultConfig: {
      text: 'Custom Text',
      color: '#ffffff',
      align: 'center',
      backgroundColor: '',
      fontSizePercent: 65,
      maxLines: 1,
    },
  },
  custom_logo: {
    label: 'Logo / Image',
    defaultW: 5,
    defaultH: 5,
    defaultConfig: {
      imageBase64: '',
      fit: 'contain',
      backgroundColor: '',
    },
  },
  time_of_day: {
    label: 'Time of Day',
    defaultW: 8,
    defaultH: 3,
    defaultConfig: {
      format: 'HH:MM:SS',
      color: '#ffffff',
      align: 'center',
      backgroundColor: '',
    },
  },
  stopped_clock: {
    label: 'Stopped Time',
    defaultW: 10,
    defaultH: 7,
    defaultConfig: {
      displaySeconds: 0,
      color: '#e0e0e0',
      backgroundColor: '#000000',
    },
  },
  start_list: {
    label: 'Start List',
    defaultW: 14,
    defaultH: 18,
    defaultConfig: {
      columns: ['lane', 'name', 'bib', 'affiliation'],
      showHeader: true,
      maxRows: 8,
      lanePrefix: false,
    },
  },
  text_overlay: {
    label: 'Text Overlay',
    defaultW: 20,
    defaultH: 6,
    defaultConfig: {},
  },
  screensaver_overlay: {
    label: 'Screensaver',
    defaultW: 20,
    defaultH: 20,
    defaultConfig: {},
  },
  lineview_overlay: {
    label: 'Line View',
    defaultW: 20,
    defaultH: 14,
    defaultConfig: {
      showRotation: false,
    },
  },
};

// Convert grid position to CSS percentage style for absolute positioning
export function widgetToStyle(widget) {
  return {
    position: 'absolute',
    left: `${(widget.x / 20) * 100}%`,
    top: `${(widget.y / 20) * 100}%`,
    width: `${(widget.w / 20) * 100}%`,
    height: `${(widget.h / 20) * 100}%`,
    overflow: 'hidden',
    boxSizing: 'border-box',
  };
}

// Clamp a value within bounds
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
