'use client';

import * as React from 'react';
import { Slide } from '@kaven/ui-base';
import { Paper } from '@kaven/ui-base';
import { Switch } from '@kaven/ui-base';

export function TransitionsSlideDemo() {
  const [checked, setChecked] = React.useState(true);
  return (
    <div className="flex flex-col items-center gap-4 h-48 overflow-hidden relative border w-full">
       <div className="absolute top-4 z-10 bg-white/80 p-2 rounded">
         <div className="flex items-center gap-2">
            <Switch checked={checked} onChange={(e) => setChecked(e.target.checked)} /> Show
        </div>
      </div>
      <Slide in={checked} direction="up" className="absolute bottom-0">
        <Paper className="p-4 bg-secondary-main text-white m-4">Slide Up</Paper>
      </Slide>
    </div>
  );
}
