import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pattern to identify problematic imports
const importPatterns = [
  {
    pattern: /@orpheus\/types\/types/,
    replacements: {
      'BaseClipComponentProps': '@orpheus/types/components',
      'TimelinePosition': '@orpheus/types/core',
      'SnapGridSizeOption': '@orpheus/types/core',
      'Track': '@orpheus/types/core',
      'Clip': '@orpheus/types/core',
      'Effect': '@orpheus/types/core'
    }
  }
];

const fileReplacements = [
  {
    file: 'src/screens/workstation/components/Lane.tsx',
    from: "import { AutomationLane, Clip, Track, TrackType } from '@orpheus/types/types';",
    to: "import { AutomationLane, Clip, Track, TrackType } from '@orpheus/types/core';"
  },
  {
    file: 'src/screens/workstation/components/TrackVolumeSlider.tsx',
    from: "import { AutomationLaneEnvelope, Track } from '@orpheus/types/types';",
    to: "import { AutomationLaneEnvelope, Track } from '@orpheus/types/core';"
  },
  {
    file: 'src/screens/workstation/components/AutomationNodeComponent.tsx',
    from: "import { AutomationLane, AutomationLaneEnvelope, AutomationNode, ContextMenuType, TimelinePosition } from '@orpheus/types/types';",
    to: "import { AutomationLane, AutomationLaneEnvelope, AutomationNode, ContextMenuType, TimelinePosition } from '@orpheus/types/core';"
  },
  {
    file: 'src/screens/workstation/components/AutomationLaneTrack.tsx',
    from: "import { AutomationLane, Track, AutomationLaneEnvelope, TimelinePosition, ContextMenuType } from '@orpheus/types/types'",
    to: "import { AutomationLane, Track, AutomationLaneEnvelope, TimelinePosition, ContextMenuType } from '@orpheus/types/core'"
  },
  {
    file: 'src/screens/workstation/components/Mixer.tsx',
    from: "import { AutomationLaneEnvelope, AutomationMode, ContextMenuType, Track } from '@orpheus/types/types';",
    to: "import { AutomationLaneEnvelope, AutomationMode, ContextMenuType, Track } from '@orpheus/types/core';"
  },
  {
    file: 'src/screens/workstation/components/AutomationLaneComponent.tsx',
    from: "import { AutomationLane, AutomationLaneEnvelope, AutomationNode, Track, ContextMenuType, TimelinePosition } from '@orpheus/types/types';",
    to: "import { AutomationLane, AutomationLaneEnvelope, AutomationNode, Track, ContextMenuType, TimelinePosition } from '@orpheus/types/core';"
  },
  {
    file: 'src/screens/workstation/components/RegionComponent.tsx',
    from: "import { Region, TimelinePosition } from '@orpheus/types/types';",
    to: "import { Region, TimelinePosition } from '@orpheus/types/core';"
  },
  {
    file: 'src/screens/workstation/components/__tests__/TrackComponent.test.tsx',
    from: "import type { Track } from '@orpheus/types/types';",
    to: "import type { Track } from '@orpheus/types/core';"
  },
  {
    file: 'src/screens/workstation/components/FXComponent.tsx',
    from: "import { BaseEffect, ContextMenuType, Effect, FXChainPreset, Track } from '@orpheus/types/types';",
    to: "import { BaseEffect, ContextMenuType, Effect, FXChainPreset, Track } from '@orpheus/types/core';"
  }
];

function fixImports() {
  let fixedCount = 0;
  
  for (const { file, from, to } of fileReplacements) {
    const filePath = path.join(__dirname, '..', file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${file}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(from)) {
      content = content.replace(from, to);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed imports in: ${file}`);
      fixedCount++;
    } else {
      console.log(`ℹ️ No changes needed in: ${file}`);
    }
  }
  
  console.log(`\n🎉 Fixed imports in ${fixedCount} files!`);
}

fixImports();
