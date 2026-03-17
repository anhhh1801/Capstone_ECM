import dayjs from "dayjs";

export const formatDateValue = (value?: string | null): string => {
    if (!value) return "-";

    const parsed = dayjs(value);
    if (!parsed.isValid()) return value;

    return parsed.format("DD/MM/YY");
};
