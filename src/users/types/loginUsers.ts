export interface LoginUsers {
    _id: string;
    name:string;
    email?: string;
    clientId: string;
    role:string;
    tokens:any;
    loginDateAndTime: Date;
  }