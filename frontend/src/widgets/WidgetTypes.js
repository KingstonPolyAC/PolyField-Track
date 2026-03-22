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
    },
  },
  clock: {
    label: 'Running Clock',
    defaultW: 10,
    defaultH: 7,
    defaultConfig: {},
  },
  event_name: {
    label: 'Event Name',
    defaultW: 10,
    defaultH: 3,
    defaultConfig: {
      align: 'center',
    },
  },
  wind: {
    label: 'Wind',
    defaultW: 5,
    defaultH: 3,
    defaultConfig: {
      align: 'center',
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
    },
  },
  custom_logo: {
    label: 'Logo / Image',
    defaultW: 5,
    defaultH: 5,
    defaultConfig: {
      imageBase64: '',
      fit: 'contain',
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
    },
  },
  area_mask: {
    label: 'Overlay Area',
    defaultW: 20,
    defaultH: 4,
    defaultConfig: {},
  },
  athlete_speed: {
    label: 'Athlete Speed',
    defaultW: 10,
    defaultH: 12,
    defaultConfig: {
      unit: 'kph',
      maxRows: 8,
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
