import type { BrandTone } from './brand-tokens';
import type { ComponentSize, Density } from './sizing-tokens';

export interface BaseComponentContract {
  size?: ComponentSize;
  density?: Density;
  tone?: BrandTone;
  fullWidth?: boolean;
}
