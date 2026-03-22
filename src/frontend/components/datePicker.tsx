import { DatePicker, Label, DateField, Calendar } from "@heroui/react";
import { CalendarDate } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";

export const CustomDatePicker = ({
  value,
  onChange,
  label,
  name,
  maxValue,
  variant = "primary",
}: {
  value: CalendarDate | null;
  onChange: { (date: CalendarDate | null): void };
  label: string;
  name: string;
  maxValue?: CalendarDate | null;
  variant?: "primary" | "secondary";
}) => {
  return (
    <I18nProvider locale="ru-RU">
      <DatePicker
        className="text-left"
        maxValue={maxValue}
        name={name}
        value={value}
        onChange={onChange}
      >
        <Label>{label}</Label>
        <DateField.Group variant={variant}>
          <DateField.Input>
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger>
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DatePicker.Popover>
          <Calendar aria-label="Выберите дату">
            <Calendar.Header>
              <Calendar.YearPickerTrigger>
                <Calendar.YearPickerTriggerHeading />
                <Calendar.YearPickerTriggerIndicator />
              </Calendar.YearPickerTrigger>
              <Calendar.NavButton slot="previous" />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>
                {(date) => <Calendar.Cell date={date} />}
              </Calendar.GridBody>
            </Calendar.Grid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>
    </I18nProvider>
  );
};
