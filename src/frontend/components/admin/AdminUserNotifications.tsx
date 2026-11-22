import { IAdminUserDetail } from "@/lib/models/admin-user";
import {
  notificationChannels,
  notificationTypes,
} from "@/lib/models/notification";

export function AdminUserNotifications({ user }: { user: IAdminUserDetail }) {
  const preferences = user.notification_preferences;
  if (!preferences) {
    return <p className="text-muted">Настройки уведомлений недоступны</p>;
  }
  const telegramLinked = user.links.some(
    ({ provider }) => provider === "telegram",
  );

  return (
    <div className="overflow-hidden rounded-xl bg-surface">
      <table aria-label="Настройки уведомлений" className="w-full text-sm">
        <thead className="border-b border-border/50 text-muted">
          <tr>
            <th className="px-3 py-3 text-left font-medium" scope="col">
              Тип уведомления
            </th>
            {notificationChannels.map(({ id, label }) => (
              <th
                key={id}
                className="px-2 py-3 text-center font-medium"
                scope="col"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {notificationTypes.map(({ kind, label }) => (
            <tr
              key={kind}
              className="border-b border-border/50 last:border-b-0"
            >
              <th className="px-3 py-3 text-left font-medium" scope="row">
                {label}
              </th>
              {notificationChannels.map(({ id }) => {
                const preference = preferences[kind]?.find(
                  ({ channel }) => channel === id,
                );
                const unlinked = id === "telegram" && !telegramLinked;
                return (
                  <td key={id} className="px-2 py-3 text-center">
                    {preference ? (
                      <>
                        {preference.enabled ? "Включено" : "Выключено"}
                        {(unlinked || !preference.available) && (
                          <span className="block text-xs text-muted">
                            {unlinked ? "Не подключён" : "Доставка недоступна"}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">Нет данных</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
