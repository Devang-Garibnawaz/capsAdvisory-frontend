export interface Users {
    _id: string;
    name:string;
    email?: string;
    clientId: string;
    role:string;
    tokens:any;
    loginDateAndTime: Date;
  }