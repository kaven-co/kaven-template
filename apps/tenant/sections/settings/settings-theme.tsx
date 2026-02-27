/**
 * Settings Theme Tab — STORY-010
 * Inline form para personalização de tema com persistência no banco de dados.
 * Usa endpoint backend /api/tenant/theme (GET/PUT).
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Palette, Building2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@kaven/ui-base';
import { Input } from '@kaven/ui-base';
import { Label } from '@kaven/ui-base';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kaven/ui-base';
import { api } from '@/lib/api';

// ----------------------------------------------------------------------

interface TenantThemeConfig {
  id?: string;
  name: string;
  primaryColor: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
}

async function fetchPlatformConfig(): Promise<TenantThemeConfig> {
  try {
    const { data } = await api.get<TenantThemeConfig>('/api/tenant/theme');
    return data;
  } catch {
    return {
      name: 'Kaven SaaS',
      primaryColor: '#10B981',
      logoUrl: null,
      faviconUrl: null,
    };
  }
}

async function savePlatformConfig(data: TenantThemeConfig): Promise<TenantThemeConfig> {
  try {
    const response = await api.put<TenantThemeConfig>('/api/tenant/theme', data);
    return response.data;
  } catch (error: unknown) {
    const message =
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Erro ao salvar configurações';
    throw new Error(message);
  }
}

// ----------------------------------------------------------------------

function isValidHex(color: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

// ----------------------------------------------------------------------

// Inner form — receives config as props so state initializes from props (no useEffect needed)
function ThemeForm({ config }: { config: TenantThemeConfig }) {
  const queryClient = useQueryClient();

  const [companyName, setCompanyName] = useState(config.name ?? '');
  const [primaryColor, setPrimaryColor] = useState(config.primaryColor ?? '#10B981');
  const [logoUrl, setLogoUrl] = useState(config.logoUrl ?? '');

  const mutation = useMutation({
    mutationFn: (values: TenantThemeConfig) => savePlatformConfig(values),
    onSuccess: (saved) => {
      queryClient.setQueryData(['platform-config'], saved);
      toast.success('Tema salvo com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Erro ao salvar tema');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (companyName.trim().length < 2) {
      toast.error('Nome da empresa deve ter ao menos 2 caracteres');
      return;
    }
    if (!isValidHex(primaryColor)) {
      toast.error('Cor primária deve estar no formato hexadecimal (#RRGGBB)');
      return;
    }

    mutation.mutate({
      name: companyName.trim(),
      primaryColor,
      logoUrl: logoUrl || undefined,
      faviconUrl: config.faviconUrl ?? undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="companyName" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Nome da Empresa
        </Label>
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Kaven SaaS"
          minLength={2}
          required
        />
        <p className="text-xs text-muted-foreground">
          Exibido na barra lateral e em e-mails transacionais.
        </p>
      </div>

      {/* Primary Color */}
      <div className="space-y-2">
        <Label htmlFor="primaryColor" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Cor Primária
        </Label>
        <div className="flex gap-3 items-center">
          <input
            type="color"
            value={isValidHex(primaryColor) ? primaryColor : '#10B981'}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-10 w-12 rounded border border-input cursor-pointer shrink-0"
            title="Selecionar cor"
          />
          <Input
            id="primaryColor"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            placeholder="#10B981"
            pattern="^#[0-9A-Fa-f]{6}$"
            className="font-mono"
          />
        </div>
        {primaryColor && !isValidHex(primaryColor) && (
          <p className="text-xs text-destructive">Formato inválido. Use #RRGGBB (ex: #10B981)</p>
        )}

        {/* Preview */}
        {isValidHex(primaryColor) && (
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="contained"
              color="primary"
              className="pointer-events-none"
              style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
            >
              Botão Primário
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              className="pointer-events-none"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Variante Outline
            </Button>
          </div>
        )}
      </div>

      {/* Logo URL */}
      <div className="space-y-2">
        <Label htmlFor="logoUrl" className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          URL do Logo
          <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Input
          id="logoUrl"
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://exemplo.com/logo.png"
        />
        {logoUrl && (
          <div className="mt-2 p-3 border rounded-md inline-block bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Preview do logo"
              className="h-10 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Salvar Alterações
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setCompanyName(config.name ?? '');
            setPrimaryColor(config.primaryColor ?? '#10B981');
            setLogoUrl(config.logoUrl ?? '');
          }}
        >
          Descartar
        </Button>
      </div>
    </form>
  );
}

// ----------------------------------------------------------------------

export function SettingsTheme() {
  const { data: config, isLoading } = useQuery({
    queryKey: ['platform-config'],
    queryFn: fetchPlatformConfig,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalização de Tema</CardTitle>
        <CardDescription>
          Personalize a identidade visual da plataforma. As alterações persistem no banco de dados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* key forces re-mount (and state reset) if config reloads */}
        {config && <ThemeForm key={config.id ?? 'default'} config={config} />}
      </CardContent>
    </Card>
  );
}
