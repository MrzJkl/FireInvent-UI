import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getProducts,
  getVariants,
  getItems,
  getPersons,
  getOrders,
  getAppointments,
  getAppointmentsByIdVisits,
} from '@/api';
import { Skeleton } from '@/components/ui/skeleton';
import type { AppointmentModel } from '@/api/types.gen';

interface DashboardStats {
  products: number;
  variants: number;
  items: number;
  persons: number;
  orders: number;
}

interface AppointmentWithVisits extends AppointmentModel {
  visitsCount: number;
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
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    AppointmentWithVisits[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, variantsRes, itemsRes, personsRes, ordersRes] =
          await Promise.all([
            getProducts({}),
            getVariants({}),
            getItems({}),
            getPersons({}),
            getOrders({}),
          ]);

        setStats({
          products: productsRes.data?.length ?? 0,
          variants: variantsRes.data?.length ?? 0,
          items: itemsRes.data?.length ?? 0,
          persons: personsRes.data?.length ?? 0,
          orders: ordersRes.data?.length ?? 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointmentsRes = await getAppointments({});
        const appointments = appointmentsRes.data ?? [];

        // Filter upcoming appointments (today or future)
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const upcoming = appointments
          .filter((apt) => {
            const aptDate = new Date(apt.scheduledAt);
            return aptDate >= now;
          })
          .sort((a, b) => {
            return (
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime()
            );
          })
          .slice(0, 5); // Show next 5 appointments

        // Fetch visits count for each appointment
        const appointmentsWithVisits = await Promise.all(
          upcoming.map(async (apt) => {
            try {
              const visitsRes = await getAppointmentsByIdVisits({
                path: { id: apt.id! },
              });
              return {
                ...apt,
                visitsCount: visitsRes.data?.length ?? 0,
              };
            } catch {
              return {
                ...apt,
                visitsCount: 0,
              };
            }
          }),
        );

        setUpcomingAppointments(appointmentsWithVisits);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    fetchAppointments();
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
      title: t('orderPlural'),
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

          {/* Upcoming Appointments Section */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Card className="sm:col-span-2">
              <CardHeader>
                <CardTitle>{t('appointmentPlural')}</CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {t('noData')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment) => (
                      <Card
                        key={appointment.id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() =>
                          navigate(`/app/appointments/${appointment.id}`)
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">
                                {appointment.description || t('appointment')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(
                                  appointment.scheduledAt,
                                ).toLocaleDateString('de-DE', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-2xl font-bold">
                                  {appointment.visitsCount}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t('visitPlural')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
