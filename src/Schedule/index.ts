import { Request } from '../Modules/Request';
import { getDate } from '../Modules/Tools';
import { datet, loosegp, ScheduleAPIloose, sessionType } from '../Types';

export class Schedule {
    constructor(year: 'current' | number) {
        this.year = year;
    }

    public async get(): Promise<Schedule> {
        const data = (await Request(this.year.toString())) as ScheduleAPIloose;
        this.data = data;
        const schedule = data.MRData;

        this.season = parseInt(schedule.RaceTable.season);
        this.rounds = schedule.RaceTable.Races.map(r => new GrandPrix(this, r));

        this.initialized = true;
        return this;
    }

    private year: 'current' | number;
    private data: ScheduleAPIloose;
    private initialized: boolean = false;

    season: number;
    rounds: GrandPrix[];

    getAllSessions(): Session[] {
        let ss = [];
        for (const g of this.rounds) {
            ss.push(...g.getSessionsArray());
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
        this.sessions = {
            race: new Session(
                this,
                { date: data.date, time: data.time },
                'Race'
            ),
        };
        if (data.FirstPractice && data.SecondPractice && data.Qualifying) {
            this.sessions.fp1 = new Session(
                this,
                data.FirstPractice,
                'Free Practice 1'
            );
            this.sessions.fp2 = new Session(
                this,
                data.SecondPractice,
                'Free Practice 2'
            );
            this.sessions.qualifying = new Session(
                this,
                data.Qualifying,
                'Qualifying'
            );
        }
        if (data.Sprint) {
            this.sessions.sprint = new Session(
                this,
                data.Sprint,
                'Sprint Qualifying'
            );
        } else if (data.ThirdPractice) {
            this.sessions.fp3 = new Session(
                this,
                data.ThirdPractice,
                'Free Practice 3'
            );
        }
        this.schedule = schedule;
        this.sprintWeekend = this.sessions.sprint != null;
        this.circuit = new Circuit(this, data.Circuit);
    }

    name: string;
    round: number;
    season: number;
    schedule: Schedule;
    sprintWeekend: boolean;
    circuit: Circuit;
    sessions: {
        fp1?: Session;
        fp2?: Session;
        fp3?: Session;
        qualifying?: Session;
        sprint?: Session;
        race: Session;
    };

    getSessionsArray(): Session[] {
        const { fp1, fp2, fp3, qualifying, sprint, race } = this.sessions;
        return [fp1, fp2, fp3, qualifying, sprint, race].filter(Boolean);
    }
}

export class Session {
    constructor(grandprix: GrandPrix, data: datet, name: sessionType) {
        this.grandprix = grandprix;
        this.date = getDate({
            date: data.date,
            time: data.time || '00:00:00Z',
        });
        this.name = name;
        this.completed = this.date < new Date();
    }

    name: sessionType;
    grandprix: GrandPrix;
    date: Date;
    completed: boolean;
    // length: number/string? (1:30:00 | 69 laps);
}

export class Circuit {
    constructor(grandprix: GrandPrix, data: loosegp['Circuit']) {
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
