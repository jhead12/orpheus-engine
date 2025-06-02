import {v4 as uuidv4} from 'uuid';
<<<<<<< HEAD
import TimelinePosition from "./services/types/TimelinePosition";
import { AutomationLaneEnvelope, AutomationMode, Track, TrackType } from "./services/types/types";
=======
import { TimelinePosition, AutomationLaneEnvelope, Track, TrackType } from "./services/types/types";
>>>>>>> 378d52c (update)

const data : Track[] = [
  {
    id: uuidv4(), 
    name: "Track 1", 
    type: TrackType.Midi,
    color: "#84a3ff", 
    clips: [
      {
        id: uuidv4(),
        start: new TimelinePosition(1, 3, 0),
        end: new TimelinePosition(3, 2, 900),
        startLimit: new TimelinePosition(1, 2, 0),
        endLimit: new TimelinePosition(4, 2, 0),
        loopEnd: new TimelinePosition(3, 2, 900),
        muted: false,
        name: "my_clip",
        type: TrackType.Midi
      },
      {
        id: uuidv4(),
        start: new TimelinePosition(4, 1, 0),
        end: new TimelinePosition(4, 3, 750),
        startLimit: undefined,
        endLimit: undefined,
        loopEnd: new TimelinePosition(5, 2, 500),
        muted: false,
        name: "my_clip",
        type: TrackType.Midi
      }
    ],
    // Note: fx, mute, solo, armed, automation, volume, pan, automationMode properties 
    // are not part of the Track interface and have been removed/commented out
    automationLanes: [
      {
        envelope: AutomationLaneEnvelope.Volume,
        enabled: true,
        expanded: true,
        id: uuidv4(),
        label: "Volume",
        minValue: -Infinity,
        maxValue: 6,
        nodes: [
          {
            id: uuidv4(),
            pos: new TimelinePosition(1, 2, 0),
            value: -37
          },
          {
            id: uuidv4(),
            pos: new TimelinePosition(2, 2, 0),
            value: -Infinity
          },
          {
            id: uuidv4(),
            pos: new TimelinePosition(3, 4, 500),
            value: 6
          },
          {
            id: uuidv4(),
            pos: new TimelinePosition(5, 1, 0),
            value: -57
          }
        ],
        show: false
      },
      {
        enabled: true,
        envelope: AutomationLaneEnvelope.Pan,
        expanded: true,
        id: uuidv4(),
        label: "Pan",
        minValue: -100,
        maxValue: 100,
        nodes: [
          {
            id: uuidv4(),
            pos: new TimelinePosition(1, 1, 0),
            value: 0
          },
          {
            id: uuidv4(),
            pos: new TimelinePosition(3, 1, 0),
            value: -37
          }
        ],
        show: false
      }
    ]
  }
]

export default data;