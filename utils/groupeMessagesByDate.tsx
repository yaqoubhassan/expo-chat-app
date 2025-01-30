import { format, isToday, isYesterday, subDays } from "date-fns";
import { Message } from "@/types/Message";

const getDateLabel = (date: string | Date) => {
    const parsedDate = new Date(date);

    if (isToday(parsedDate)) return "Today";
    if (isYesterday(parsedDate)) return "Yesterday";

    const daysAgoLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const today = new Date();

    for (let i = 2; i <= 7; i++) {
        if (parsedDate.toDateString() === subDays(today, i).toDateString()) {
            return daysAgoLabels[parsedDate.getDay()];
        }
    }

    return format(parsedDate, "EEE MMM dd, yyyy");
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
