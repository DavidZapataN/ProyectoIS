import { IPatientMeasurementsModel } from './IPatientMeasurementsModel';

export interface IAppointmentModel {
  date: string;
  measures: IPatientMeasurementsModel[];
  status: 'PENDING' | 'DONE' | 'EXPIRED';
}
