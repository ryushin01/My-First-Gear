const won = new Intl.NumberFormat("ko-KR");
const dateTime = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" });

export const formatWon = (value: number) => `${won.format(value)}원`;
export const formatDateTime = (value: Date | string) => dateTime.format(new Date(value));
