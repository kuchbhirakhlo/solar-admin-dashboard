'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InstallationRecord, getEngineerByUid } from '@/lib/services/engineers';
import { Button } from '@/components/ui/button';
import { ClipboardList, Search, Plus, ArrowRight, Wrench, Zap, Sun } from 'lucide-react';
import Link from 'next/link';

export default function InstallationsListPage() {
  const router = useRouter();
  const [installations, setInstallations] = useState<InstallationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [engineerName, setEngineerName] = useState('');

  useEffect(() => {
    const uid = sessionStorage.getItem('engineerUid');
    const name = sessionStorage.getItem('engineerName') || 'Engineer';
    setEngineerName(name);

    const fetchInstallations = async () => {
      if (!uid) return;

      try {
        const engineer = await getEngineerByUid(uid);
        const engineerId = engineer?.id || uid;

        const installationsRef = collection(db, 'installations');
        const q = query(
          installationsRef,
          where('engineerId', '==', engineerId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as InstallationRecord[];

        setInstallations(items);
      } catch (error) {
        console.error('Failed to load installations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstallations();
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Installations</h1>
          <p className="text-muted-foreground mt-1">
            View all installation records you've created
          </p>
        </div>
        <Link href="/engineer/installations/new">
          <Button>
            <Plus size={16} className="mr-2" />
            New Installation
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-muted-foreground">
          Loading installations...
        </div>
      )}

      {/* Empty State */}
      {!loading && installations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
          <ClipboardList size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Installations Yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            You haven't recorded any installations yet. Start by creating a new installation record.
          </p>
          <Link href="/engineer/installations/new">
            <Button>
              <Plus size={16} className="mr-2" />
              Record Your First Installation
            </Button>
          </Link>
        </div>
      )}

      {/* Installations List */}
      {!loading && installations.length > 0 && (
        <div className="space-y-4">
          {installations.map((installation) => (
            <div
              key={installation.id}
              className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Customer Header */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {installation.customerName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {installation.customerPhone}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>ID: {installation.id?.slice(-6).toUpperCase()}</p>
                    <p>{installation.installationDate}</p>
                  </div>
                </div>
              </div>

              {/* Equipment Details */}
              <div className="px-6 py-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Inverter */}
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Zap size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Inverter Serial</p>
                      <p className="text-sm font-medium text-foreground">
                        {installation.inverterSerialNumber}
                      </p>
                    </div>
                  </div>

                  {/* Solar Panels */}
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-yellow-500/10 p-2">
                      <Sun size={16} className="text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Solar Panels ({installation.solarPanelSerialNumbers?.length || 0})
                      </p>
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {installation.solarPanelSerialNumbers?.join(', ') || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Wiring */}
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/10 p-2">
                      <Wrench size={16} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Wiring</p>
                      <p className="text-sm font-medium text-foreground">
                        {[
                          installation.acWireUsed && `AC: ${installation.acWireUsed}`,
                          installation.dcWireUsed && `DC: ${installation.dcWireUsed}`,
                          installation.earthingWireUsed && `Earth: ${installation.earthingWireUsed}`,
                        ].filter(Boolean).join(' | ') || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {installation.notes && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm text-foreground">{installation.notes}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-6 py-3 bg-muted/20 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Recorded by {installation.engineerName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {installation.createdAt
                    ? new Date(installation.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}