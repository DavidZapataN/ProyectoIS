import { IAppointmentModel } from './IAppointmentModel';

export interface IPatientModel {
  id: number;
  name: string;
  age: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  nextAppointment?: IAppointmentModel;
  appointments: IAppointmentModel[];
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELED';
}
