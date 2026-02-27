'use client';

import { CurrencyIcon } from './currency-icon';
import { cn } from '../patterns/utils';

type CurrencyRecord = {
  code: string;
  symbol: string | null;
  iconType: 'TEXT' | 'SVG';
  iconColorMode?: 'MONOCHROME' | 'COLORED';
  iconSvgPath: string | null;
  iconSvgViewBox?: string | null;
};

const CURRENCIES: Record<string, CurrencyRecord> = {
  BRL: { code: 'BRL', symbol: 'R$', iconType: 'TEXT', iconSvgPath: null },
  USD: { code: 'USD', symbol: '$', iconType: 'TEXT', iconSvgPath: null },
  EUR: { code: 'EUR', symbol: 'EUR', iconType: 'TEXT', iconSvgPath: null },
  SATS: {
    code: 'SATS',
    symbol: null,
    iconType: 'SVG',
    iconColorMode: 'MONOCHROME',
    iconSvgPath:
      'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1.25 4h-2.5v1.193A3.261 3.261 0 0 0 8.1 10.28c0 1.94 1.48 2.69 3.7 3.3 1.66.45 2.1.78 2.1 1.47 0 .75-.67 1.25-1.76 1.25-1.2 0-2.02-.55-2.58-1.37l-1.94 1.2c.7 1.34 1.83 2.2 3.13 2.53V20h2.5v-1.25c2.16-.42 3.6-1.91 3.6-3.92 0-2.16-1.35-3.03-3.96-3.72-1.37-.36-1.88-.66-1.88-1.33 0-.62.56-1.06 1.43-1.06.96 0 1.6.44 2.08 1.17l1.9-1.23c-.66-1.16-1.7-1.95-3.17-2.27V6z',
    iconSvgViewBox: '0 0 24 24',
  },
};

function getCurrency(code: string): CurrencyRecord | null {
  return CURRENCIES[code.toUpperCase()] ?? null;
}

function formatCurrency(value: number, code: string): string {
  if (code === 'SATS') return Math.round(value).toLocaleString();
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code.toUpperCase() }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

interface CurrencyDisplayProps {
  value: number;
  currencyCode?: string; // Opcional: especificar moeda diferente da padrão
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'positive' | 'negative' | 'neutral' | 'auto';
}

/**
 * Componente para exibir valores monetários formatados
 * Usa automaticamente a moeda configurada em Platform Settings
 * Suporta moedas com ícone SVG (sats) e texto (R$, $, €)
 * 
 * @example
 * <CurrencyDisplay value={1234.56} />
 * // Exibe: "R$ 1.234,56" (se currency = BRL)
 * 
 * @example
 * <CurrencyDisplay value={2051} currencyCode="SATS" variant="auto" />
 * // Exibe: "2,051 ⚡" (ícone SVG de sats)
 */
export function CurrencyDisplay({
  value,
  currencyCode,
  className = '',
  showIcon = true,
  variant = 'default',
}: CurrencyDisplayProps) {
  const code = (currencyCode ?? 'BRL').toUpperCase();
  const currency = getCurrency(code);



  if (!currency) {

    return <span className={className}>{value.toFixed(2)}</span>;
  }

  // Determinar variante automaticamente se 'auto'
  let iconVariant: 'default' | 'positive' | 'negative' | 'neutral' = 'default';
  if (variant === 'auto') {
    if (value > 0) iconVariant = 'positive';
    else if (value < 0) iconVariant = 'negative';
    else iconVariant = 'neutral';
  } else {
    iconVariant = variant;
  }

  // IMPORTANTE: Para sats, formatar ANTES de chamar format() para evitar decimais
  if (code === 'SATS') {
    let displayValue: string;
    if (value === 0) {
      displayValue = '0';
    } else if (Math.abs(value) < 1000000) {
      displayValue = Math.round(value).toLocaleString();
    } else {
      displayValue = `${(value / 1000000).toFixed(1)}M`;
    }



    if (!showIcon) {
      return <span className={className}>{displayValue}</span>;
    }

    return (
      <span className={`flex items-center gap-2 ${className}`}>
        <CurrencyIcon currency={currency} size={34} variant={iconVariant} />
        {displayValue}
      </span>
    );
  }

  // Para outras moedas, usar format() normalmente
  const formattedValue = formatCurrency(value, code);



  if (!showIcon) {
    return <span className={className}>{formattedValue}</span>;
  }

  // Para moedas com ícone SVG (não-sats), exibir valor + ícone
  if (currency.iconType === 'SVG') {
    return (
      <span className={cn('flex items-center gap-1', className)}>
        {formattedValue}
        <CurrencyIcon currency={currency} size={16} variant={iconVariant} />
      </span>
    );
  }

  // Para moedas com símbolo texto, Intl.NumberFormat já inclui o símbolo
  return <span className={className}>{formattedValue}</span>;
}
