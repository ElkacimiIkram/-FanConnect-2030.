import MatchCalendar, { toMonthKey } from '../MatchCalendar';

export { toMonthKey };

export default function WcScheduleTab({
  calendar,
  monthKey,
  selectedDate,
  onMonthChange,
  onSelectDate,
  loading,
}) {
  return (
    <MatchCalendar
      calendar={calendar}
      monthKey={monthKey}
      selectedDate={selectedDate}
      onMonthChange={onMonthChange}
      onSelectDate={onSelectDate}
      loading={loading}
    />
  );
}