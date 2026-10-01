"use client";

import { useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api-client";
import { usePagedList } from "@/hooks/usePagedList";
import { useUnreadNotificationCount, useUnreadStore } from "@/hooks/useUnreadNotificationCount";
import { NotificationItem, type NotificationRow } from "./NotificationItem";
import { ActionErrorBanner, FilterPills, LoadMoreButton, PageHeader } from "../shared/ListParts";

const VIEW_OPTIONS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
] as const;

/** `portalPrefix` scopes which notification links are followable (see NotificationItem). */
export function NotificationList({ portalPrefix }: { portalPrefix?: string } = {}) {
  const [view, setView] = useState<"all" | "unread">("all");
  const list = usePagedList<NotificationRow>(
    (page) => `/api/notifications?${view === "unread" ? "unreadOnly=true&" : ""}pageSize=25&pageNumber=${page}`,
    `notifications:${view}`,
    "Unable to load notifications."
  );
  // The shared store keeps the sidebar/topbar badges in sync with this page.
  const unreadCount = useUnreadNotificationCount();
  const unreadStore = useUnreadStore();
  const [actionError, setActionError] = useState<string | null>(null);

  const markAsRead = async (id: string) => {
    const target = list.items.find((n) => n.id === id);
    if (!target || target.read) return;
    setActionError(null);
    list.setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    unreadStore.adjust(-1);
    try {
      await apiFetch(`/api/notifications/${id}`, { method: "PATCH", body: { read: true } });
    } catch (error) {
      list.setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
      unreadStore.adjust(1);
      setActionError(errorMessage(error, "Couldn't mark that notification as read."));
    }
  };

  const markAllAsRead = async () => {
    const previous = list.items;
    const previousCount = unreadCount;
    setActionError(null);
    list.setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    unreadStore.set(0);
    try {
      await apiFetch("/api/notifications/mark-all-read", { method: "POST" });
      if (view === "unread") list.reload();
    } catch (error) {
      list.setItems(previous);
      unreadStore.set(previousCount);
      setActionError(errorMessage(error, "Couldn't mark all notifications as read."));
    }
  };

  const deleteNotification = async (id: string) => {
    const previous = list.items;
    const target = previous.find((n) => n.id === id);
    setActionError(null);
    list.setItems((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.read) unreadStore.adjust(-1);
    try {
      await apiFetch(`/api/notifications/${id}`, { method: "DELETE" });
    } catch (error) {
      list.setItems(previous);
      if (target && !target.read) unreadStore.adjust(1);
      setActionError(errorMessage(error, "Couldn't delete that notification."));
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        actions={
          unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="rounded-lg bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 transition hover:text-orange-700"
            >
              Mark all as read
            </button>
          )
        }
      />

      <FilterPills label="Show" options={VIEW_OPTIONS} value={view} onChange={setView} />
      <ActionErrorBanner message={actionError} onDismiss={() => setActionError(null)} />

      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        {list.isLoading && <p className="px-6 py-8 text-center text-sm text-gray-400">Loading notifications...</p>}
        {!list.isLoading && list.error && (
          <p role="alert" className="px-6 py-8 text-center text-sm text-red-500">
            {list.error}
          </p>
        )}
        {!list.isLoading && !list.error && list.items.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-gray-400">
            {view === "unread" ? "No unread notifications." : "You're all caught up."}
          </p>
        )}
        {!list.isLoading && !list.error && list.items.length > 0 && (
          <>
            <ul className="divide-y divide-gray-100">
              {list.items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  portalPrefix={portalPrefix}
                  onMarkRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </ul>
            <LoadMoreButton
              hasMore={list.hasMore}
              isLoadingMore={list.isLoadingMore}
              onClick={list.loadMore}
              shownCount={list.items.length}
            />
          </>
        )}
      </div>
    </div>
  );
}
