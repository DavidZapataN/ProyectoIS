export interface IPatientMeasurementsModel {
  weight: number;
  height: number;
  backMeasurement: number;
  upperAbdomenMeasurement: number;
  lowerAbdomenMeasurement: number;
  hipMeasurement: number | null;
  armMeasurement: number;
  legMeasurement: number;
}
