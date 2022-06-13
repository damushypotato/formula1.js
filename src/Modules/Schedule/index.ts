import {
    datet,
    loosegp,
    loosegpcircuit,
    ScheduleAPIloose,
    session,
    sessions,
    sessionType,
    sessionTypes,
    year,
} from '../../Types';
import { Request } from '../Request';
import { getDate } from '../Tools';

export class Schedule {
    constructor(year: year) {
        this.year = year;
    }

    async pop(): Promise<Schedule> {
        const data = (await Request(this.year.toString())) as ScheduleAPIloose;
        const schedule = data.MRData;

        this.season = parseInt(schedule.RaceTable.season);
        this.rounds = schedule.RaceTable.Races.map(r => new GrandPrix(this, r));

        this.initialized = true;
        return this;
    }

    private year: year;
    initialized: boolean = false;

    season: number;
    rounds: GrandPrix[];

    getAllSessions(): Session[] {
        let ss = [];
        for (const g of this.rounds) {
            ss.push(...g.sessions);
        }
        return ss;
    }

    findNextSession(): Session {
        let ss = this.getAllSessions();
        return ss.filter(s => !s.completed)[0];
    }

    findLastSession(): Session {
        let ss = this.getAllSessions();
        return ss.filter(s => s.completed).at(-1);
    }

    // findNextSessionFromDate(date: Date)
    // findLastSessionFromDate(date: Date)
}

export class GrandPrix {
    constructor(schedule: Schedule, data: loosegp) {
        this.name = data.raceName;
        this.round = parseInt(data.round);
        this.season = schedule.season;
        const {
            FirstPractice: p1,
            SecondPractice: p2,
            ThirdPractice: p3,
            Qualifying: q,
            Sprint: s,
            date,
            time,
        } = data;
        this.sessions = [p1, p2, p3, q, s, { date, time }]
            .map((s, i) =>
                s != null
                    ? new Session(this, s, sessions[i], sessionTypes[i])
                    : null
            )
            .filter(Boolean);
        this.schedule = schedule;
        this.sprintWeekend = this.getSession(sessions[4]) != null;
        this.circuit = new Circuit(this, data.Circuit);
    }

    name: string;
    round: number;
    season: number;
    schedule: Schedule;
    sprintWeekend: boolean;
    circuit: Circuit;
    sessions: Session[];

    getSession(id: session): Session {
        return this.sessions.find(s => s.name == id);
    }
}

export class Session {
    constructor(
        grandprix: GrandPrix,
        data: datet,
        name: session,
        type: sessionType
    ) {
        this.grandprix = grandprix;
        this.date = getDate({
            date: data.date,
            time: data.time || '00:00:00Z',
        });
        this.completed = this.date < new Date();
        this.name = name;
        this.type = type;
    }

    name: session;
    grandprix: GrandPrix;
    date: Date;
    completed: boolean;
    type: sessionType;
    // length: number/string? (1:30:00 | 69 laps);
}

export class Circuit {
    constructor(grandprix: GrandPrix, data: loosegpcircuit) {
        this.grandprix = grandprix;
        this.name = data.circuitName;
        this.id = data.circuitId;
        this.location = {
            latitude: parseFloat(data.Location.lat),
            longitude: parseFloat(data.Location.long),
            locality: data.Location.locality,
            country: data.Location.country,
        };
    }

    grandprix: GrandPrix;
    name: string;
    id: string;
    location: {
        latitude: number;
        longitude: number;
        locality: string;
        country: string;
    };
}
