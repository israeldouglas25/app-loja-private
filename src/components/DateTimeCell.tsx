export const renderDateTimeCell = (value: unknown) => {
    if (!value) {
      return <span>—</span>;
    }

    const dateValue = value instanceof Date ? value : new Date(String(value));

    if (Number.isNaN(dateValue.getTime())) {
      return <span>{String(value)}</span>;
    }

    const locale =
      typeof navigator !== 'undefined' && navigator.language
        ? navigator.language
        : 'pt-BR';

    return (
      <span>
        {new Intl.DateTimeFormat(locale, {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(dateValue)}
      </span>
    );
};
