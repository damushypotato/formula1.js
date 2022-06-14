//#region Common

export type anythang<name extends string, T> = {
    [p in name]: T;
};

export type year = 'current' | number;

export interface datetime {
    date: string;
    time: string;
}
export interface datet {
    date: string;
    time?: string;
}

//#endregion

//#region MRData
export interface MRData<n extends string, T> {
    MRData: anythang<n, T> & {
        xmlns: string;
        series: string;
        url: string;
        total: string;
    };
}

export type loosetable<n extends string, T> = anythang<n, T[]> & {
    season: string;
};

//#endregion

//#region Schedule

export type ScheduleAPIloose = MRData<'RaceTable', loosetable<'Races', loosegp>>;

export interface loosegp {
    season: string;
    round: string;
    raceName: string;
    Circuit: loosegpcircuit;

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

export interface loosegpcircuit {
    circuitId: string;
    circuitName: string;
    Location: {
        lat: string;
        long: string;
        locality: string;
        country: string;
    };
}

export const sessions = [
    'Free Practice 1',
    'Free Practice 2',
    'Free Practice 3',
    'Qualifying',
    'Sprint Qualifying',
    'Race',
] as const;
export type session = typeof sessions[number];

export const sessionTypes = [
    'practice',
    'practice',
    'practice',
    'qualifying',
    'qualifying',
    'race',
] as const;
export type sessionType = typeof sessionTypes[number];

//#endregion

//#region Standings

export type DSAPIloose = MRData<
    'StandingsTable',
    loosetable<'StandingsLists', standinglist<'DriverStandings', loosestanding_d>>
>;

export type CSAPIloose = MRData<
    'StandingsTable',
    loosetable<'StandingsLists', standinglist<'ConstructorStandings', loosestanding_c>>
>;

export type standinglist<name extends string, T> = anythang<name, T[]> & {
    season: string;
    round: string;
};

export interface loosestanding {
    position: string;
    positionText: string;
    points: string;
    wins: string;
}
export interface loosestanding_d extends loosestanding {
    Driver: loosedriver;
    Constructors: [looseconstructor];
}
export interface loosestanding_c extends loosestanding {
    Constructor: looseconstructor;
}

export interface loosedriver {
    driverId: string;
    permanentNumber?: string;
    code?: string;
    url: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    nationality: string;
}
export interface looseconstructor {
    constructorId: string;
    url: string;
    name: string;
    nationality: string;
}

//#endregion Standings
