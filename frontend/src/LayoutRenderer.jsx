import React from 'react';
import { widgetToStyle } from './widgets/WidgetTypes';
import ResultsTableWidget from './widgets/ResultsTableWidget';
import ClockWidget from './widgets/ClockWidget';
import EventNameWidget from './widgets/EventNameWidget';
import WindWidget from './widgets/WindWidget';
import CustomTextWidget from './widgets/CustomTextWidget';
import CustomLogoWidget from './widgets/CustomLogoWidget';
import TimeOfDayWidget from './widgets/TimeOfDayWidget';
import AreaMaskWidget from './widgets/AreaMaskWidget';

function renderWidget(widget, liveProps, isBuilder) {
  const shared = { key: widget.id, widget, isBuilder, ...liveProps };
  switch (widget.type) {
    case 'results_table': return <ResultsTableWidget {...shared} />;
    case 'clock':         return <ClockWidget {...shared} />;
    case 'event_name':    return <EventNameWidget {...shared} />;
    case 'wind':          return <WindWidget {...shared} />;
    case 'custom_text':   return <CustomTextWidget {...shared} />;
    case 'custom_logo':   return <CustomLogoWidget {...shared} />;
    case 'time_of_day':   return <TimeOfDayWidget {...shared} />;
    case 'area_mask':     return <AreaMaskWidget {...shared} />;
    default:              return null;
  }
}

// Finds the area_mask widget in a layout and returns its % bounds,
// or null if none exists. Used by overlays to clip to the mask zone.
export function getMaskBounds(layout) {
  if (!layout?.widgets) return null;
  const mask = layout.widgets.find(w => w.type === 'area_mask');
  if (!mask) return null;
  return {
    left:   `${(mask.x / 20) * 100}%`,
    top:    `${(mask.y / 20) * 100}%`,
    width:  `${(mask.w / 20) * 100}%`,
    height: `${(mask.h / 20) * 100}%`,
  };
}

// LayoutRenderer renders a full layout in display mode.
// Props:
//   layout        — LayoutEntry object (id, name, theme, widgets[])
//   lif           — current LifData object
//   clock         — current clock state from useRunningClock
//   customAcronyms — map of club abbreviations
//   theme         — theme key string (resolved to THEMES[key] inside each widget)
//   overlayContent — optional React node rendered inside the mask zone (text/screensaver)
//   containerStyle — optional style overrides for the outer container
export default function LayoutRenderer({
  layout,
  lif,
  clock,
  customAcronyms,
  overlayContent,
  containerStyle = {},
}) {
  if (!layout || !layout.widgets) return null;

  const liveProps = {
    lif,
    clock,
    customAcronyms,
    theme: layout.theme || 'classic',
  };

  const maskBounds = getMaskBounds(layout);

  const outerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
    ...containerStyle,
  };

  return (
    <div style={outerStyle}>
      {/* Render all widgets */}
      {layout.widgets.map(widget => (
        <div key={widget.id} style={widgetToStyle(widget)}>
          {renderWidget(widget, liveProps, false)}
        </div>
      ))}

      {/* Overlay (text/screensaver) clipped to mask zone if defined, otherwise full screen */}
      {overlayContent && (
        <div style={{
          position: 'absolute',
          zIndex: 10,
          ...(maskBounds || { left: 0, top: 0, width: '100%', height: '100%' }),
        }}>
          {overlayContent}
        </div>
      )}
    </div>
  );
}
