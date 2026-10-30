export interface VisitAgendaNew {
    dateVisit: string;
    salespersonId: number;
    salespersonName: string;
    clientId: number;
    clientName: string;
    clientCNPJ?: string;
    clientCPF?: string;
    informationAgenda: string;
}

export interface VisitAgenda extends VisitAgendaNew {
    id: number;
}

export interface VisitAgendaUpdate {
    id: number;
    salespersonId: number;
    salespersonName: string;
    clientId: number;
    clientName: string;
    type: string;
    latitude: string;
    longitude: string;
    description: string;
}
