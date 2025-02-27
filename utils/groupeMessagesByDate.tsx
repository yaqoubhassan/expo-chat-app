import { format, isToday, isYesterday, subDays, parseISO } from "date-fns";
import { Message } from "@/types/MessageTypes";

const getDateLabel = (date: string | Date) => {
    const parsedDate = typeof date === "string" ? parseISO(date) : new Date(date);
    const today = new Date(); // Get current local time

    // Ensure today, yesterday, and other calculations use consistent local time
    if (isToday(parsedDate)) return "Today";
    if (isYesterday(parsedDate)) return "Yesterday";

    for (let i = 2; i <= 7; i++) {
        if (parsedDate.toDateString() === subDays(today, i).toDateString()) {
            return format(parsedDate, "EEEE"); // Returns full day name (e.g., "Thursday")
        }
    }

    return format(parsedDate, "EEE MMM dd, yyyy"); // Fallback full date format
};

export const groupMessagesByDate = (messages: Message[]) => {
    return messages.reduce((acc: any[], message) => {
        const dateLabel = getDateLabel(message.createdAt ?? new Date());

        const lastGroup = acc[acc.length - 1];
        if (lastGroup?.label === dateLabel) {
            lastGroup.messages.push(message);
        } else {
            acc.push({ label: dateLabel, messages: [message] });
        }

        return acc;
    }, []);
};
