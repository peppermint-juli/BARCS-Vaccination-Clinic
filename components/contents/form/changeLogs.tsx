import { FC } from 'react';

export type ChangeLogEntry = {
  action: string | Record<string, { from: any, to: any }>;
  timestamp: string;
  volunteer_initials: string;
}

export const ChangeLogs: FC<{ logs: ChangeLogEntry[] }> = ({ logs }) => {
  return (
    <div>
      <h3>Change Logs</h3>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            <strong>
              {typeof log.action === 'string' ? (
                log.action
              ) : (
                Object.entries(log.action).map(([field, change], i) => (
                  <span key={field}>
                    {field === 'items' ?
                      <>
                        <span>{field}: </span>
                        {console.log(JSON.stringify(change.from))}
                        From: {change.from.map((item: any) => item.name).join(', ')} → To: {change.to.map((item: any) => item.name).join(', ')}
                      </>
                      :
                      <>{field}: {String(change.from)} → {String(change.to)}</>
                    }
                    {i < Object.entries(log.action).length - 1 ? ', ' : ''}
                  </span>
                ))
              )}
            </strong> - {log.timestamp} - {log.volunteer_initials}
          </li>
        ))}
      </ul>
    </div>
  );
};
