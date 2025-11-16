import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ProductFormDialog } from '@/features/products/ProductFormDialog';
import { useProducts } from '@/features/products/useProducts';
import { type ProductModel } from '@/api/types.gen';
import { useTranslation } from 'react-i18next';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formOpen, setFormOpen] = useState(false);
  const [product, setProduct] = useState<ProductModel | null>(null);

  const { products, isLoading, updateProduct } = useProducts();

  useEffect(() => {
    if (products && id) {
      const found = products.find((p) => p.id === id);
      setProduct(found || null);
    }
  }, [products, id]);

  if (isLoading) return <LoadingIndicator />;

  if (!product) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('product')} nicht gefunden</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/app/products')}>
              {t('productPlural')} anzeigen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/products')}
          >
            <IconArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-sm text-muted-foreground">
              {product.manufacturer} · {product.type.name}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setFormOpen(true)}
          className="gap-2"
        >
          <IconEdit className="size-4" />
          {t('edit')}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="product" className="w-full">
        <TabsList>
          <TabsTrigger value="product">{t('product')}</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
        </TabsList>

        {/* Product Tab */}
        <TabsContent value="product" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Produktdetails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('name')}
                </div>
                <div className="mt-1">{product.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('manufacturer')}
                </div>
                <div className="mt-1">{product.manufacturer}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('productType')}
                </div>
                <div className="mt-1">{product.type.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('description')}
                </div>
                <div className="mt-1">
                  {product.description || (
                    <span className="text-muted-foreground italic">
                      Keine Beschreibung
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Varianten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Varianten-Feature wird hier implementiert
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Items-Feature wird hier implementiert
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="edit"
        initialValues={{
          name: product.name,
          manufacturer: product.manufacturer,
          description: product.description ?? '',
          typeId: product.typeId,
        }}
        onSubmit={async (data) => {
          await updateProduct(product.id, data);
          setFormOpen(false);
        }}
      />
    </div>
  );
}
