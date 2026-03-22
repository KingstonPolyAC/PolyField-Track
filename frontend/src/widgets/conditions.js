// Widget visibility condition system.
// Each widget can have a `conditions` array. ALL conditions must pass for the widget to show.
// If conditions is empty or absent, the widget always shows.

export const CONDITION_TYPES = {
  always: {
    label: 'Always visible',
    hasValue: false,
  },
  hasWind: {
    label: 'Event has a wind reading',
    hasValue: false,
  },
  hasClub: {
    label: 'Event has club / affiliation data',
    hasValue: false,
  },
  clockState: {
    label: 'Clock state is…',
    hasValue: true,
    valueLabel: 'State',
    valueOptions: ['running', 'stopped', 'armed', 'idle', 'timeofday'],
  },
  clockStateNot: {
    label: 'Clock state is NOT…',
    hasValue: true,
    valueLabel: 'State',
    valueOptions: ['running', 'stopped', 'armed', 'idle', 'timeofday'],
  },
  eventNameContains: {
    label: 'Event name contains…',
    hasValue: true,
    valueLabel: 'Text',
    valueOptions: null, // free text
  },
  eventNameNotContains: {
    label: 'Event name does not contain…',
    hasValue: true,
    valueLabel: 'Text',
    valueOptions: null,
  },
  hasCompetitors: {
    label: 'Event has competitors',
    hasValue: false,
  },
};

// Evaluate a single condition against live data.
function evalOne(condition, lif, clock) {
  switch (condition.type) {
    case 'always':
      return true;

    case 'hasWind':
      return !!(lif?.wind && lif.wind.trim() !== '' && lif.wind !== '—');

    case 'hasClub':
      return (lif?.competitors || []).some(c => c.affiliation && c.affiliation.trim() !== '');

    case 'clockState':
      return (clock?.state || 'idle') === condition.value;

    case 'clockStateNot':
      return (clock?.state || 'idle') !== condition.value;

    case 'eventNameContains':
      return (lif?.eventName || '').toLowerCase().includes((condition.value || '').toLowerCase());

    case 'eventNameNotContains':
      return !(lif?.eventName || '').toLowerCase().includes((condition.value || '').toLowerCase());

    case 'hasCompetitors':
      return (lif?.competitors || []).some(c => c.lastName || c.firstName);

    default:
      return true;
  }
}

// Returns true if the widget should be shown given the current live data.
// All conditions must pass (AND logic). Empty conditions = always show.
export function evaluateConditions(widget, lif, clock) {
  const conditions = widget.conditions;
  if (!conditions || conditions.length === 0) return true;
  return conditions.every(c => evalOne(c, lif, clock));
}
