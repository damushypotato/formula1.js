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
import { ConstructorStandings, DriverStandings } from '../Standings';
import { getDate } from '../Tools';

export class Schedule {
    constructor(year: year | Schedule) {
        if (year instanceof Schedule) {
            this._pop(year);
            return;
        }
        this.year = year;
    }

    async pop(_data?: ScheduleAPIloose): Promise<Schedule> {
        const data = _data || (await Request<ScheduleAPIloose>(this.year.toString()));
        const schedule = data.MRData;

        if (!schedule) throw new Error('No schedule found for requested time');

        return this._pop(schedule);
    }

    private _pop(schedule: ScheduleAPIloose['MRData'] | Schedule): Schedule {
        if (schedule instanceof Schedule) {
            this.season = schedule.season;
            this.rounds = schedule.rounds;
            this.initialized = true;
            return this;
        }

        this.season = parseInt(schedule.RaceTable.season);
        this.rounds = schedule.RaceTable.Races.map(r => new GrandPrix_S(this, r));

        this.initialized = true;
        return this;
    }

    private year: year;
    initialized: boolean = false;

    season: number;
    rounds: GrandPrix_S[];

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
    constructor(year: year | GrandPrix, round?: number) {
        if (year instanceof GrandPrix) return this._pop(year);
        if (!round) throw new Error('Invalid round specified. Must be greater than 0');
        this._year = year;
        this._round = round;
    }

    async pop(_data?: ScheduleAPIloose, index = 0): Promise<GrandPrix> {
        const data = _data || (await Request<ScheduleAPIloose>(`${this._year}/${this._round}`));

        const schedule = data.MRData;

        if (!schedule) throw new Error('No schedule found for requested time');

        if (!schedule.RaceTable.Races[index])
            throw new Error(`No grand prix found for requested url ${data.MRData.url}`);

        return this._pop(schedule.RaceTable.Races[0]);
    }

    protected _pop(gp: loosegp | GrandPrix): GrandPrix {
        if (gp instanceof GrandPrix) {
            this.name = gp.name;
            this.round = gp.round;
            this.season = gp.season;
            this.sessions = gp.sessions;
            this.sprintWeekend = gp.sprintWeekend;
            this.circuit = gp.circuit;
            this.initialized = true;
            return this;
        }

        this.name = gp.raceName;
        this.round = parseInt(gp.round);
        this.season = parseInt(gp.season);
        const {
            FirstPractice: p1,
            SecondPractice: p2,
            ThirdPractice: p3,
            Qualifying: q,
            Sprint: s,
            date,
            time,
        } = gp;
        this.sessions = [p1, p2, p3, q, s, { date, time }]
            .map((s, i) => (s != null ? new Session(this, s, sessions[i], sessionTypes[i]) : null))
            .filter(Boolean);
        this.sprintWeekend = this.getSession(sessions[4]) != null;
        this.circuit = new Circuit(this, gp.Circuit);

        this.initialized = true;

        return this;
    }

    private _year: year;
    private _round: number;
    initialized: boolean = false;

    name: string;
    round: number;
    season: number;
    sprintWeekend: boolean;
    circuit: Circuit;
    sessions: Session[];

    getSession(id: session): Session {
        return this.sessions.find(s => s.name == id);
    }

    async getDriverStandings(limit?: number): Promise<DriverStandings> {
        return await new DriverStandings(this.season, this.round, limit).pop();
    }

    async getConstructorStandings(limit?: number): Promise<ConstructorStandings> {
        return await new ConstructorStandings(this.season, this.round, limit).pop();
    }
}

export class GrandPrix_S extends GrandPrix {
    constructor(schedule: Schedule, data: loosegp) {
        super(schedule.season, parseInt(data.round));
        this._pop(data);

        this.schedule = schedule;
    }

    schedule: Schedule;
}

export class Session {
    constructor(grandprix: GrandPrix, data: datet, name: session, type: sessionType) {
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
