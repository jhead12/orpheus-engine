import { TimelineSettings } from "../types/types";
import { TimeSignature } from "../types/types";

export class TimelinePosition {
  constructor(public measures: number, public beats: number, public fraction: number) {}
  add(measures: number, beats: number, fraction: number, preserveMargin: boolean): TimelinePosition {
    return new TimelinePosition(this.measures + measures, this.beats + beats, this.fraction + fraction);
  }
  copy(): TimelinePosition {
    return new TimelinePosition(this.measures, this.beats, this.fraction);
  }
  diff(other: TimelinePosition): { measures: number; beats: number; fraction: number; sign: number } {
    const measuresDiff = this.measures - other.measures;
    const beatsDiff = this.beats - other.beats;
    const fractionDiff = this.fraction - other.fraction;
    const sign = measuresDiff >= 0 && beatsDiff >= 0 && fractionDiff >= 0 ? 1 : -1;
    return { measures: measuresDiff, beats: beatsDiff, fraction: fractionDiff, sign };
  }
  diffInMargin(other: TimelinePosition): number {
    //Improved Placeholder:  Calculates the difference in margin considering time signature and tempo.
    const settings = TimelinePosition.timelineSettings;
    const thisMargin = this.toMargin(settings);
    const otherMargin = other.toMargin(settings);
    return thisMargin - otherMargin;
  }
  equals(other: TimelinePosition): boolean {
    return this.measures === other.measures && this.beats === other.beats && this.fraction === other.fraction;
  }
  fromMargin(margin: number, settings: TimelineSettings): TimelinePosition {
    //Improved Placeholder: Converts margin to measures, beats, and fraction based on settings.
    const { timeSignature, tempo } = settings;
    const measures = Math.floor(margin / (timeSignature.beats * 4 * settings.horizontalScale)); // Assuming 4 beats per measure
    const beats = Math.floor((margin % (timeSignature.beats * 4 * settings.horizontalScale)) / (4 * settings.horizontalScale));
    const fraction = (margin % (4 * settings.horizontalScale)) / settings.horizontalScale;
    return new TimelinePosition(measures, beats, fraction);
  }
  measureMargin(margin: number, settings: TimelineSettings): { measures: number; beats: number; fraction: number } {
    //Improved Placeholder: Converts margin to measures, beats, and fraction based on settings.
    const { timeSignature, tempo, horizontalScale } = settings;
    const measures = Math.floor(margin / (timeSignature.beats * 4 * horizontalScale)); // Assuming 4 beats per measure
    const beats = Math.floor((margin % (timeSignature.beats * 4 * horizontalScale)) / (4 * horizontalScale));
    const fraction = (margin % (4 * horizontalScale)) / horizontalScale;
    return { measures, beats, fraction };
  }
  static timelineSettings: TimelineSettings = { 
    timeSignature: { beats: 4, noteValue: 4 }, 
    tempo: 120, 
    horizontalScale: 1,
    snap: true,
    snapUnit: 'beat'
  };
  translate(diff: { measures: number; beats: number; fraction: number; sign: number }, preserveMargin: boolean): TimelinePosition {
    return new TimelinePosition(this.measures + diff.measures * diff.sign, this.beats + diff.beats * diff.sign, this.fraction + diff.fraction * diff.sign);
  }
  compareTo(other: TimelinePosition): number {
    if (this.measures !== other.measures) return this.measures - other.measures;
    if (this.beats !== other.beats) return this.beats - other.beats;
    return this.fraction - other.fraction;
  }
  toMargin(settings?: TimelineSettings): number {
    //Improved Placeholder: Converts measures, beats, and fraction to margin based on settings.
    const { timeSignature, tempo, horizontalScale } = settings || TimelinePosition.timelineSettings;
    return (this.measures * timeSignature.beats * 4 + this.beats * 4 + this.fraction) * horizontalScale;
  }
}