import React, { RefObject } from "react";
import { Tooltip, TooltipProps } from "@mui/material";
import { clamp } from "../../services/utils/general";

interface MeterStyle {
  bgColor?: string;
  color?: string;
  width?: number;
  sizeRatio?: number;
  backgroundColor?: string;
  borderColor?: string;
  overflow?: string;
}

interface KnobStyle {
  knob?: React.CSSProperties;
  meter?: MeterStyle;
  indicator?: React.CSSProperties;
}

interface KnobProps {
  bidirectionalMeter?: boolean;
  classes?: {
    knob?: string;
    meter?: string;
    indicator?: string;
  };
  degrees?: number;
  disabled?: boolean;
  disableTextInput?: boolean;
  knobStyle?: React.CSSProperties;
  max?: number;
  min?: number;
  meterStyle?: MeterStyle;
  onChange?: (value: number) => void;
  onInput?: (value: number) => void;
  origin?: number;
  rotationOffset?: number;
  showMeter?: boolean;
  size?: number;
  step?: number;
  style?: KnobStyle;
  title?: string;
  tooltipProps?: Partial<TooltipProps>;
  value: number;
  valueLabelFormat?: (value: number) => string;
  scale?: {
    toNormalized: (value: number) => number;
    toScale: (value: number) => number;
  };
}

interface KnobState {
  dragging: boolean;
  mousePos: { x: number; y: number };
  value: number;
  showInput: boolean;
  active: boolean;
  wheel: boolean;
  text: string;
  anchorEl: HTMLElement | null;
}

export default class Knob extends React.Component<KnobProps, KnobState> {
  private ref: RefObject<HTMLDivElement | null>;
  private timeout: ReturnType<typeof setTimeout> | undefined;

  static defaultProps = {
    degrees: 270,
    disabled: false,
    disableTextInput: false,
    showMeter: true,
    rotationOffset: -135,
    valueLabelFormat: (value: number) => value.toString(),
    min: 0,
    max: 1,
    size: 40,
  } as const;

  constructor(props: KnobProps) {
    super(props);
    this.ref = React.createRef<HTMLDivElement>();
    this.state = {
      dragging: false,
      mousePos: { x: 0, y: 0 },
      value: props.value || 0,
      showInput: false,
      active: false,
      wheel: false,
      text: props.value?.toString() || "0",
      anchorEl: null,
    };
  }

  componentDidUpdate(prevProps: KnobProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({
        value: this.props.value || 0,
        text: this.props.value?.toString() || "0",
      });
    }
  }

  private onMouseMove = (e: MouseEvent): void => {
    if (this.state.dragging) {
      const { clientX, clientY } = e;
      const deltaY = clientY - this.state.mousePos.y;

      this.setState({ mousePos: { x: clientX, y: clientY } }, () =>
        this.updateValue(-deltaY * 0.005)
      );
    }
  };

  private onMouseUp = (): void => {
    if (this.state.dragging) {
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseup", this.onMouseUp);
      document.body.style.cursor = "";
      this.setState({ dragging: false, active: false });
    }
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    if (!this.props.disabled) {
      const delta = e.deltaY * 0.002;
      this.updateValue(-delta);

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.setState({ active: true, wheel: true });
      this.timeout = setTimeout(() => {
        this.setState({ active: false, wheel: false });
      }, 1000);
    }
  };

  private handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!this.props.disabled && e.button === 0 && !this.state.anchorEl) {
      e.preventDefault();
      document.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.onMouseUp);
      document.body.style.cursor = "ns-resize";

      this.setState({
        dragging: true,
        active: true,
        mousePos: { x: e.clientX, y: e.clientY },
      });
    }
  };

  componentDidMount(): void {
    const element = this.ref.current;
    if (element) {
      element.addEventListener("wheel", this.onWheel, { passive: false });
    }
  }

  componentWillUnmount(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    const element = this.ref.current;
    if (element) {
      element.removeEventListener("wheel", this.onWheel);
    }
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  }

  private updateValue(delta: number): void {
    const { min = 0, max = 1, step, onInput } = this.props;
    const range = max - min;

    let newValue = this.state.value + delta * range;

    if (step) {
      newValue = Math.round(newValue / step) * step;
    }

    newValue = clamp(newValue, min, max);

    if (newValue !== this.state.value) {
      this.setState({ value: newValue, text: newValue.toString() });
      onInput?.(newValue);
    }
  }

  private normalize(value: number): number {
    const { min = 0, max = 1 } = this.props;
    return (value - min) / (max - min);
  }

  private getSizeWithPadding(): number {
    const { size = 40 } = this.props;
    const { style } = this.props;
    const sizeRatio = style?.meter?.sizeRatio || 1.15;
    const width = style?.meter?.width || 2;
    return size * sizeRatio + width * 4;
  }

  render(): React.ReactElement {
    const {
      size = 40,
      disabled,
      style,
      valueLabelFormat = (v: number) => v.toString(),
      tooltipProps,
      rotationOffset = -135,
      degrees = 270,
    } = this.props;

    const sizeWithPadding = this.getSizeWithPadding();
    const normalizedValue = this.normalize(this.state.value);
    const rotation = rotationOffset + normalizedValue * degrees;

    const label = valueLabelFormat(this.state.value);

    return (
      <Tooltip title={label} arrow open={this.state.active} {...tooltipProps}>
        <div
          ref={this.ref}
          data-testid="knob-container"
          aria-label={label}
          style={{
            width: sizeWithPadding,
            height: sizeWithPadding,
            position: "relative",
            cursor: disabled ? "default" : "pointer",
          }}
          onMouseDown={this.handleMouseDown}
          role="slider"
          aria-valuemin={this.props.min}
          aria-valuemax={this.props.max}
          aria-valuenow={this.state.value}
          aria-disabled={disabled}
        >
          <div
            data-testid="knob-rotator"
            style={{
              position: "absolute",
              width: size,
              height: size,
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              ...style?.knob,
            }}
          >
            <div
              data-testid="knob-indicator"
              style={{
                position: "absolute",
                width: size * 0.25,
                height: size * 0.25,
                top: size * 0.25,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: disabled ? "#888" : "#000",
                ...style?.indicator,
              }}
            />
          </div>
        </div>
      </Tooltip>
    );
  }
}
