export type HeadRoNotification = {
  id: number;
  title: string;
  time: string;
  unread: boolean;
};

export const HEAD_RO_NOTIFICATIONS_STORAGE_KEY = "ylpms:head-ro-notifications";
export const HEAD_RO_NOTIFICATIONS_UPDATED_EVENT = "ylpms:head-ro-notifications-updated";

export const initialHeadRoNotifications: HeadRoNotification[] = [
  {
    id: 1,
    title: "Pedro Manalo submitted a new report for approval.",
    time: "2h ago",
    unread: true,
  },
  {
    id: 2,
    title: "Task 'Update volunteer database' was marked as done.",
    time: "5h ago",
    unread: true,
  },
  {
    id: 3,
    title: "New RO Liza Ramos registered and awaiting assignment.",
    time: "1d ago",
    unread: false,
  },
  {
    id: 4,
    title: "National Volunteer Summit is in 21 days.",
    time: "1d ago",
    unread: false,
  },
  {
    id: 5,
    title: "Ana Cruz's analytics report needs your review.",
    time: "2d ago",
    unread: false,
  },
];
