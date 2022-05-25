import { Request } from '../Modules/Request';

import {
    ScheduleResponse,
    GrandPrix,
    Circuit,
    Session,
    CircuitLocation,
    datetime,
    sessionType,
} from '../Types';

import { getDate } from '../Modules/Tools';

interface loosegp {
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

interface looseAPIresponse {
    MRData: {
        total: string;
        RaceTable: {
            season: string;
            Races: loosegp[];
        };
    };
}

export const Schedule = async (
    year: number | 'current'
): Promise<ScheduleResponse> => {
    const req = (await Request(year.toString())) as looseAPIresponse;

    const { total, RaceTable } = req.MRData;

    const { season } = RaceTable;

    const gps = RaceTable.Races.map((r): GrandPrix => {
        const { round, raceName: name, Circuit: c, date: race_date } = r;

        const location: CircuitLocation = {
            latitude: parseFloat(c.Location.lat),
            longitude: parseFloat(c.Location.long),
            locality: c.Location.locality,
            country: c.Location.country,
        };

        const circuit: Circuit = {
            id: c.circuitId,
            name: c.circuitName,
            location,
        };

        const sprintWeekend: boolean =
            r.Sprint != null && r.ThirdPractice == null;

        const id = `${season}.${round}-${c.circuitId}`;

        const newSession = (type: sessionType, date: datetime): Session => {
            if (!date) return null;

            return {
                type,
                date: getDate(date),
                id: `${type}.${id}`.toLowerCase(),
            };
        };

        const race: datetime = {
            date: race_date,
            time: r.time || '00:00:00Z',
        };

        const s: Session[] = [
            newSession('FP1', r.FirstPractice),
            newSession('FP2', r.SecondPractice),
            newSession('FP3', r.ThirdPractice),
            newSession('QUALIFYING', r.Qualifying),
            newSession('SPRINT', r.Sprint),
            newSession('RACE', race),
        ];

        const sessions = [
            ...s
                .filter(Boolean)
                .sort((a, b) => a.date.getTime() - b.date.getTime()),
        ];

        return {
            name,
            round: parseInt(round),
            season: parseInt(season),
            sprintWeekend,
            circuit,
            sessions,
            id,
        };
    });

    const out: ScheduleResponse = {
        total,
        season,
        gps,
    };

    return out;
};
