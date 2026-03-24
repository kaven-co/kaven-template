'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@kaven/ui-base';
import { Plus, Landmark, CreditCard } from 'lucide-react';
import { AccountTree } from '@/components/finance/AccountTree';
import { AmountDisplay } from '@/components/finance/AmountDisplay';
import type { ChartOfAccount, BankAccount } from '@/types/finance';

export default function AccountsPage() {
  const { tenant } = useTenant();
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null);

  // Fetch chart of accounts
  const { data: accountsData } = useQuery({
    queryKey: ['chart-of-accounts', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/finance/accounts');
      return res.data?.data || [];
    },
    enabled: !!tenant?.id,
  });

  // Fetch bank accounts
  const { data: bankAccounts } = useQuery<BankAccount[]>({
    queryKey: ['bank-accounts', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/finance/bank-accounts');
      return res.data?.data || [];
    },
    enabled: !!tenant?.id,
  });

  const accounts: ChartOfAccount[] = accountsData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Chart of accounts and bank accounts</p>
        </div>
        <Button aria-label="Add new account">
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <Tabs defaultValue="chart">
        <TabsList>
          <TabsTrigger value="chart">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="bank">Bank Accounts</TabsTrigger>
        </TabsList>

        {/* Chart of Accounts */}
        <TabsContent value="chart" className="mt-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                {accounts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No chart of accounts found. Run seed to create defaults.
                  </p>
                ) : (
                  <AccountTree
                    accounts={accounts}
                    onSelect={setSelectedAccount}
                    selectedId={selectedAccount?.id}
                  />
                )}
              </CardContent>
            </Card>

            {/* Account detail */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAccount ? (
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Code:</span>{' '}
                      <span className="font-mono">{selectedAccount.code}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Name:</span>{' '}
                      {selectedAccount.name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>{' '}
                      {selectedAccount.type.replace('_', ' ')}
                    </div>
                    {selectedAccount.subtype && (
                      <div>
                        <span className="text-muted-foreground">Subtype:</span>{' '}
                        {selectedAccount.subtype}
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">In DRE:</span>{' '}
                      {selectedAccount.appearsInDRE ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">In DFC:</span>{' '}
                      {selectedAccount.appearsInDFC ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">System:</span>{' '}
                      {selectedAccount.isSystem ? 'Yes' : 'No'}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Select an account to see details
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bank Accounts */}
        <TabsContent value="bank" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bankAccounts?.map((account) => (
              <Card key={account.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{account.name}</CardTitle>
                  {account.type === 'credit_card' ? (
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Landmark className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-muted-foreground capitalize">{account.type.replace('_', ' ')}</div>
                  {account.bankName && (
                    <div className="text-xs text-muted-foreground">{account.bankName}</div>
                  )}
                  {account.confirmedBalance !== undefined && (
                    <div>
                      <div className="text-xs text-muted-foreground">Confirmed Balance</div>
                      <AmountDisplay amount={account.confirmedBalance} className="text-lg font-bold" />
                    </div>
                  )}
                  {account.projectedBalance !== undefined && (
                    <div>
                      <div className="text-xs text-muted-foreground">Projected Balance</div>
                      <AmountDisplay amount={account.projectedBalance} className="text-sm" />
                    </div>
                  )}
                  {!account.isActive && (
                    <div className="text-xs text-amber-600">Inactive</div>
                  )}
                </CardContent>
              </Card>
            ))}

            {(!bankAccounts || bankAccounts.length === 0) && (
              <Card className="md:col-span-3">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Landmark className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No bank accounts</p>
                  <p className="text-muted-foreground">Add your first bank account to track balances.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
