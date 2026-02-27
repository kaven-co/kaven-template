'use client';

import { Button } from '@kaven/ui-base';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@kaven/ui-base';
import { Alert } from '@kaven/ui-base';
import { XCircle, ArrowLeft, LayoutDashboard, Info } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[500px] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Cancel card */}
        <Card className="shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <XCircle className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Payment Canceled</CardTitle>
            <CardDescription className="text-base">
              No worries — your current plan remains active and nothing was charged.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert
              variant="standard"
              severity="info"
              icon={<Info className="h-4 w-4" />}
            >
              You can upgrade at any time from the Pricing page. Your data and
              current access are fully preserved.
            </Alert>

            <div className="flex flex-col gap-2 pt-2">
              <Link href="/pricing">
                <Button className="w-full gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Pricing
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <p className="text-center text-xs text-muted-foreground">
          Having trouble with checkout?{' '}
          <Link href="/help" className="underline underline-offset-2 hover:text-foreground">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
