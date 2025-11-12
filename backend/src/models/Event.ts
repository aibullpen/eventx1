export interface Event {
  id: string;
  organizerId: string;
  name: string;
  location: string;
  description: string;
  instructor: string;
  date: Date;
  formId?: string;
  formUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventData {
  name: string;
  location: string;
  description: string;
  instructor: string;
  date: Date;
}
