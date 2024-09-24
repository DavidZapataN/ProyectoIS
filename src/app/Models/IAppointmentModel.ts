import { IPatientMeasurementsModel } from './IPatientMeasurementsModel';

export interface IAppointmentModel {
  date: string;
  patientId: string;
  patientName: string;
  measures: IPatientMeasurementsModel;
  status: 'PENDING' | 'DONE' | 'EXPIRED';
}
