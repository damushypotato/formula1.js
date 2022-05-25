// schedule.ts
export interface ScheduleResponse {
    total: string;
    season: string;
    gps: GrandPrix[];
}

export interface GrandPrix {
    name: string;
    round: number;
    season: number;
    sprintWeekend: boolean;
    circuit: Circuit;
    sessions: Session[];
    id: string;
}

export interface Circuit {
    id: string;
    name: string;
    location: CircuitLocation;
}

export interface CircuitLocation {
    latitude: number;
    longitude: number;
    locality: string;
    country: string;
}

export type sessionType =
    | 'FP1'
    | 'FP2'
    | 'FP3'
    | 'QUALIFYING'
    | 'SPRINT'
    | 'RACE';

export interface Session {
    type: sessionType;
    date: Date;
    id: string;
}
//

//misc
export interface datetime {
    date: string;
    time: string;
}
