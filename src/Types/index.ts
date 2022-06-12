// schedule.ts

export interface loosegp {
    round: string;
    raceName: string;
    Circuit: {
        circuitId: string;
        circuitName: string;
        Location: {
            lat: string;
            long: string;
            locality: string;
            country: string;
        };
    };
    //data from 2022 (any beyond?) has datetime for race and all other sessions
    //data before 2022 has race datetime, but only has date for other sessions, no time
    //data before 2021 only has race datetime, no other sessions
    //data from 2020 - 2005 has datetime for race only, no other sessions
    //data before 2005 has race date only, no time, no other sessions

    //race times
    date: string;
    time?: string;

    FirstPractice?: datetime;
    SecondPractice?: datetime;
    //no fp3 during a sprint weekend
    ThirdPractice?: datetime;
    Qualifying?: datetime;
    Sprint?: datetime;
}

export interface ScheduleAPIloose {
    MRData: {
        total: string;
        RaceTable: {
            season: string;
            Races: loosegp[];
        };
    };
}
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
    | 'Free Practice 1'
    | 'Free Practice 2'
    | 'Free Practice 3'
    | 'Qualifying'
    | 'Sprint Qualifying'
    | 'Race';

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

export interface datet {
    date: string;
    time?: string;
}
