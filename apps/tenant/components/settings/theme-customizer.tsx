'use client';

import * as React from 'react';
import { Moon, Palette, Settings as SettingsIcon, Sun, Type, X } from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@kaven/ui-base';
import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/theme-provider';

interface ThemeCustomizerProps {
  open?: boolean;
  onClose?: () => void;
}

const BRAND_DEFAULTS = {
  primaryColor: '#10B981',
  secondaryColor: '#F97316',
  borderRadius: 8,
  fontFamily: 'Inter',
};

const FONT_OPTIONS = ['Inter', 'Space Grotesk'];

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ open = false, onClose }) => {
  const { mode, setMode } = useTheme();
  const [primaryColor, setPrimaryColor] = React.useState(BRAND_DEFAULTS.primaryColor);
  const [secondaryColor, setSecondaryColor] = React.useState(BRAND_DEFAULTS.secondaryColor);
  const [borderRadius, setBorderRadius] = React.useState(BRAND_DEFAULTS.borderRadius);
  const [fontFamily, setFontFamily] = React.useState(BRAND_DEFAULTS.fontFamily);

  const handleReset = () => {
    setPrimaryColor(BRAND_DEFAULTS.primaryColor);
    setSecondaryColor(BRAND_DEFAULTS.secondaryColor);
    setBorderRadius(BRAND_DEFAULTS.borderRadius);
    setFontFamily(BRAND_DEFAULTS.fontFamily);
    setMode('dark');
  };

  const handleExport = () => {
    const theme = {
      primaryColor,
      secondaryColor,
      borderRadius,
      fontFamily,
      mode,
    };
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kaven-theme.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="size-5 text-primary" />
                Personalizar Tema
              </CardTitle>
              <CardDescription>Aplicar identidade visual Kaven nos elementos da aplicação.</CardDescription>
            </div>
            <Button type="button" variant="text" size="icon-sm" onClick={onClose} aria-label="Fechar">
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto p-6">
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              {mode === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
              Modo de Cor
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={mode === 'light' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setMode('light')}
                className={cn(mode !== 'light' && 'border-border text-foreground')}
                fullWidth
              >
                <Sun className="size-4" /> Claro
              </Button>
              <Button
                type="button"
                variant={mode === 'dark' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setMode('dark')}
                className={cn(mode !== 'dark' && 'border-border text-foreground')}
                fullWidth
              >
                <Moon className="size-4" /> Escuro
              </Button>
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Palette className="size-4" />
              Cores da Marca
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="primary-color" className="mb-2 block">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-14 p-1"
                    tone="brand"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="font-mono"
                    tone="brand"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary-color" className="mb-2 block">Cor Transform</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-14 p-1"
                    tone="warning"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="font-mono"
                    tone="warning"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Type className="size-4" />
              Tipografia
            </h3>
            <Label htmlFor="font-family" className="mb-2 block">Fonte UI</Label>
            <select
              id="font-family"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="radius" className="mb-2 block text-sm font-semibold">
              Border Radius: {borderRadius}px
            </Label>
            <Input
              id="radius"
              type="range"
              min="0"
              max="24"
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
            />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Preview</h3>
            <div className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  style={{ backgroundColor: primaryColor, borderRadius: `${borderRadius}px`, fontFamily }}
                >
                  Botão Primário
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  color="secondary"
                  style={{ backgroundColor: secondaryColor, borderRadius: `${borderRadius}px`, fontFamily }}
                >
                  Botão Secundário
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <Button type="button" variant="text" onClick={handleReset}>
            Resetar
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outlined" onClick={handleExport}>
              Exportar
            </Button>
            <Button type="button" variant="contained" color="primary" onClick={onClose}>
              Aplicar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

ThemeCustomizer.displayName = 'ThemeCustomizer';
