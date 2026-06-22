'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getEngineerByUid, InstallationRecord } from '@/lib/services/engineers';
import { Wrench, Search, ClipboardList, History, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EngineerDashboardPage() {
  const router = useRouter();
  const [engineerName, setEngineerName] = useState('');
  const [engineerPhone, setEngineerPhone] = useState('');
  const [recentInstallations, setRecentInstallations] = useState<InstallationRecord[]>([]);
  const [totalInstallations, setTotalInstallations] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = sessionStorage.getItem('engineerName') || 'Engineer';
    const phone = sessionStorage.getItem('engineerPhone') || '';
    const uid = sessionStorage.getItem('engineerUid');

    setEngineerName(name);
    setEngineerPhone(phone);

    const fetchData = async () => {
      if (!uid) return;

      try {
        // Get engineer record
        const engineer = await getEngineerByUid(uid);

        if (!engineer) {
          return;
        }

        // Get recent installations by this engineer
        const installationsRef = collection(db, 'installations');
        const q = query(
          installationsRef,
          where('engineerId', '==', engineer.id || uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const installations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as InstallationRecord[];

        setRecentInstallations(installations);
        setTotalInstallations(installations.length);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    {
      title: 'Find Customer',
      description: 'Look up customer details by mobile number',
      icon: <Search size={24} className="text-primary" />,
      href: '/engineer/customer-lookup',
      color: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      title: 'New Installation',
      description: 'Record inverter, solar panel & wiring details',
      icon: <ClipboardList size={24} className="text-primary" />,
      href: '/engineer/installations/new',
      color: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      title: 'My Installations',
      description: 'View all your completed installations',
      icon: <History size={24} className="text-primary" />,
      href: '/engineer/installations',
      color: 'bg-purple-50 dark:bg-purple-950/20',
    },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {engineerName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your installations and customer data
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Wrench size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{totalInstallations}</p>
              <p className="text-sm text-muted-foreground">Total Installations</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-500/10 p-3">
              <Search size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quick Action</p>
              <p className="text-sm font-medium text-foreground">Find Customer by Phone</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-500/10 p-3">
              <ClipboardList size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quick Action</p>
              <p className="text-sm font-medium text-foreground">Record New Installation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg p-3 ${action.color}`}>
                    {action.icon}
                  </div>
                  <ArrowRight size={20} className="text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {action.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Installations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Installations</h2>
          <Link href="/engineer/installations">
            <Button variant="ghost" size="sm">
              View All <ArrowRight size={16} className="ml-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : recentInstallations.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <ClipboardList size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No installations recorded yet</p>
            <Link href="/engineer/installations/new">
              <Button className="mt-4">
                Record Your First Installation
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentInstallations.map((installation) => (
              <div
                key={installation.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {installation.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {installation.customerPhone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Inverter: {installation.inverterSerialNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Panels: {installation.solarPanelSerialNumbers?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}