import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
import { useManufacturerDetail } from '@/features/manufacturers/useManufacturerDetail';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function ManufacturerDetailContent({ id }: { id: string }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { manufacturer, products, error, refetch } = useManufacturerDetail(id);

  if (error && !manufacturer) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!manufacturer) {
    return <LoadingIndicator />;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/app/manufacturers')}>
          ← {t('back')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{manufacturer.name}</CardTitle>
          {manufacturer.description && (
            <CardDescription>{manufacturer.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address Info */}
            <div className="space-y-3">
              <h3 className="font-semibold">{t('address')}</h3>
              {manufacturer.street || manufacturer.city ? (
                <div className="text-sm text-muted-foreground space-y-1">
                  {manufacturer.street && (
                    <div>
                      {manufacturer.street} {manufacturer.houseNumber}
                    </div>
                  )}
                  {manufacturer.postalCode && manufacturer.city && (
                    <div>
                      {manufacturer.postalCode} {manufacturer.city}
                    </div>
                  )}
                  {manufacturer.country && <div>{manufacturer.country}</div>}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">-</p>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="font-semibold">{t('contact')}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                {manufacturer.phoneNumber && (
                  <div>{manufacturer.phoneNumber}</div>
                )}
                {manufacturer.email && (
                  <div>
                    <a
                      href={`mailto:${manufacturer.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {manufacturer.email}
                    </a>
                  </div>
                )}
                {manufacturer.website && (
                  <div>
                    <a
                      href={manufacturer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {manufacturer.website}
                    </a>
                  </div>
                )}
                {!manufacturer.phoneNumber &&
                  !manufacturer.email &&
                  !manufacturer.website && <p>-</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('productPlural')} ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {t('noProductsFound')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('productType')}</TableHead>
                  <TableHead>{t('description')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/app/products/${product.id}`)}
                  >
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.type.name}</TableCell>
                    <TableCell>{product.description || '-'}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/products/${product.id}`);
                        }}
                      >
                        {t('view')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ManufacturerDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <ErrorState
        error={{ message: 'Manufacturer ID not provided' }}
        onRetry={() => {}}
      />
    );
  }

  return <ManufacturerDetailContent id={id} />;
}
