import { Accelerometer, Subscription } from 'expo-sensors';

export type TiltAction = 'CORRECT' | 'PASS' | 'NEUTRAL';

export interface SensorManagerConfig {
  /** Angle threshold in degrees to trigger "PASS" (tilting down toward floor). Default: +40° */
  passThresholdDegrees?: number;
  /** Angle threshold in degrees to trigger "CORRECT" (tilting up toward ceiling). Default: -40° */
  correctThresholdDegrees?: number;
  /** Deadzone threshold in degrees to reset back to NEUTRAL before next action. Default: 15° */
  neutralResetDegrees?: number;
  /** Update interval for accelerometer sampling in milliseconds. Default: 50ms (20Hz) */
  updateIntervalMs?: number;
}

export class SensorManager {
  private subscription: Subscription | null = null;
  private isDebouncing: boolean = false;

  private passThreshold: number;
  private correctThreshold: number;
  private neutralReset: number;
  private updateIntervalMs: number;

  private onActionCallback?: (action: 'CORRECT' | 'PASS') => void;
  private onPitchUpdateCallback?: (pitchDegrees: number) => void;

  constructor(config: SensorManagerConfig = {}) {
    this.passThreshold = config.passThresholdDegrees ?? 40;
    this.correctThreshold = config.correctThresholdDegrees ?? -40;
    this.neutralReset = config.neutralResetDegrees ?? 15;
    this.updateIntervalMs = config.updateIntervalMs ?? 50;
  }

  /**
   * Starts listening to accelerometer motion sensor data.
   * Calculates pitch angle and triggers callback upon valid tilt.
   */
  public startListening(
    onAction: (action: 'CORRECT' | 'PASS') => void,
    onPitchUpdate?: (pitchDegrees: number) => void
  ): void {
    this.stopListening();
    this.onActionCallback = onAction;
    this.onPitchUpdateCallback = onPitchUpdate;
    this.isDebouncing = false;

    Accelerometer.setUpdateInterval(this.updateIntervalMs);

    this.subscription = Accelerometer.addListener((data: { x: number; y: number; z: number }) => {
      this.processSensorData(data.x, data.y, data.z);
    });
  }

  /**
   * Stops listening to the accelerometer sensor.
   */
  public stopListening(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.isDebouncing = false;
  }

  /**
   * GYROSCOPE & ACCELEROMETER PITCH MATH EXPLANATION:
   * ------------------------------------------------
   * When the mobile device is held against the player's forehead in LANDSCAPE mode facing outward:
   * - Neutral Position: Phone screen is vertical, parallel to player's face. Z-axis gravity acceleration ≈ 0.0g.
   * - Pitch Angle (Tilt): Angle between the screen plane and gravity vector.
   * 
   * Formula: Pitch = atan2(Z, sqrt(X^2 + Y^2)) * (180 / PI)
   * 
   * Behavior:
   * 1. Tilting forehead DOWN toward the floor: Screen rotates toward ground -> Z becomes POSITIVE -> Pitch > +40°.
   * 2. Tilting forehead UP toward the ceiling: Screen rotates toward sky -> Z becomes NEGATIVE -> Pitch < -40°.
   * 3. Neutral Reset (Hysteresis): Prevents multiple cards from rapidly cycling during a single tilt motion.
   *    Once a tilt action is registered, `isDebouncing` is set to TRUE. It only unlocks back to FALSE once
   *    the player brings the phone back upright near neutral position (|Pitch| < 15°).
   */
  private processSensorData(x: number, y: number, z: number): void {
    // Calculate pitch angle in degrees
    const denominator = Math.sqrt(x * x + y * y);
    const pitchRadians = Math.atan2(z, denominator);
    const pitchDegrees = pitchRadians * (180 / Math.PI);

    if (this.onPitchUpdateCallback) {
      this.onPitchUpdateCallback(pitchDegrees);
    }

    // Check if phone has returned to neutral zone to unlock debounce
    if (this.isDebouncing) {
      if (Math.abs(pitchDegrees) < this.neutralReset) {
        this.isDebouncing = false;
      }
      return;
    }

    // Trigger actions based on pitch thresholds
    if (pitchDegrees > this.passThreshold) {
      // Tilting Down -> PASS
      this.isDebouncing = true;
      if (this.onActionCallback) {
        this.onActionCallback('PASS');
      }
    } else if (pitchDegrees < this.correctThreshold) {
      // Tilting Up -> CORRECT
      this.isDebouncing = true;
      if (this.onActionCallback) {
        this.onActionCallback('CORRECT');
      }
    }
  }
}
