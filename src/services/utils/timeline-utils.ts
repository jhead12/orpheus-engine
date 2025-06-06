import { SnapGridSizeOption } from "../../types/audio";

export function getGridSizeFromOption(option: SnapGridSizeOption): number {
  switch (option) {
    case SnapGridSizeOption.SixteenthBeat:
      return 0.25;
    case SnapGridSizeOption.EighthBeat:
      return 0.5;
    case SnapGridSizeOption.QuarterBeat:
      return 1;
    case SnapGridSizeOption.HalfBeat:
      return 2;
    case SnapGridSizeOption.Beat:
      return 4;
    case SnapGridSizeOption.Measure:
      return 16;
    case SnapGridSizeOption.TwoMeasures:
      return 32;
    case SnapGridSizeOption.FourMeasures:
      return 64;
    case SnapGridSizeOption.EightMeasures:
      return 128;
    default:
      return 1; // Default to one beat
  }
}
