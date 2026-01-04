import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { useUsers } from '@/hooks/useUsers';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

export default function UsersPage() {
  const { t } = useTranslation();
  const { users, initialLoading, error, refetch } = useUsers();

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  if (initialLoading) return <LoadingIndicator />;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{t('users.label')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('users.managedInKeycloak')}
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('users.email')}</TableHead>
            <TableHead>{t('users.name')}</TableHead>
            <TableHead>{t('users.userId')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground"
              >
                {t('users.empty')}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.eMail}</TableCell>
                <TableCell>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {user.id}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
