import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProducts, getVariants, getItems, getPersons } from '@/api';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  products: number;
  variants: number;
  items: number;
  persons: number;
  orders: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    variants: 0,
    items: 0,
    persons: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, variantsRes, itemsRes, personsRes] =
          await Promise.all([
            getProducts({}),
            getVariants({}),
            getItems({}),
            getPersons({}),
          ]);

        setStats({
          products: productsRes.data?.length ?? 0,
          variants: variantsRes.data?.length ?? 0,
          items: itemsRes.data?.length ?? 0,
          persons: personsRes.data?.length ?? 0,
          orders: 0, // Platzhalter
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: t('productPlural'),
      value: stats.products,
      onClick: () => navigate('/app/products'),
    },
    {
      title: t('variantPlural'),
      value: stats.variants,
      onClick: () => navigate('/app/products'),
    },
    {
      title: 'Orders',
      value: stats.orders,
      onClick: () => {},
    },
    {
      title: t('items.label'),
      value: stats.items,
      onClick: () => navigate('/app/products'),
    },
    {
      title: t('personPlural'),
      value: stats.persons,
      onClick: () => navigate('/app/persons'),
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {cards.map((card) => (
              <Card
                key={card.title}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={card.onClick}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{card.value}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
