'use client';

import { useFirestoreCollectionRealtime } from '@/lib/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Search, Plus, ChevronRight, Award } from 'lucide-react';
import { Engineer } from '@/lib/services/engineers';
import Link from 'next/link';
import { useState, useMemo } from 'react';

export default function EngineersPage() {
  const { data: engineers, loading, error } = useFirestoreCollectionRealtime<Engineer>('engineers');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEngineers = useMemo(() => {
    if (!engineers) return [];
    if (!searchQuery.trim()) return engineers;
    const query = searchQuery.toLowerCase();
    return engineers.filter(
      (eng) =>
        eng.name?.toLowerCase().includes(query) ||
        eng.email?.toLowerCase().includes(query) ||
        eng.phone?.toLowerCase().includes(query)
    );
  }, [engineers, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading engineers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Failed to load engineers: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Engineers"
        description="Manage installation and maintenance engineers"
        action={
          <Link href="/dashboard/engineers/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={20} className="mr-2" />
              Add Engineer
            </Button>
          </Link>
        }
      />

      {/* Search & Filters */}
      <div className="px-6 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search by name, email or phone..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">Filter</Button>
        </div>
      </div>

      {/* Engineers Table */}
      <div className="px-6">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Certification
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEngineers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {searchQuery ? 'No engineers match your search.' : 'No engineers found. Add your first engineer to get started.'}
                  </td>
                </tr>
              ) : (
                filteredEngineers.map((engineer) => (
                  <tr
                    key={engineer.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {engineer.name?.charAt(0)?.toUpperCase() || 'E'}
                        </div>
                        <p className="font-medium text-foreground">{engineer.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {engineer.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {engineer.phone}
                    </td>
                    <td className="px-6 py-4">
                      {engineer.certification ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          <Award size={14} />
                          {engineer.certification}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={(engineer.status || 'active') as any} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/dashboard/engineers/${engineer.id}`}>
                        <button className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-muted">
                          <ChevronRight
                            size={20}
                            className="text-muted-foreground"
                          />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredEngineers.length} engineer{filteredEngineers.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}