import { Request } from '../Modules/Request';
import { getDate } from '../Modules/Tools';
import { datet, loosegp, ScheduleAPIloose } from '../Types';

export class Schedule {
    constructor(year: 'current' | number) {
        this.year = year;
    }

    public async setup(): Promise<Schedule> {
        const data = (await Request(this.year.toString())) as ScheduleAPIloose;
        this.data = data;
        const schedule = data.MRData;

        this.season = parseInt(schedule.RaceTable.season);
        this.rounds = schedule.RaceTable.Races.map(r => new GrandPrix(this, r));

        return this;
    }

    private year: 'current' | number;
    private data: ScheduleAPIloose;

    season: number;
    rounds: GrandPrix[];

    findNextSession(from_date: Date): Session {
        //find the upcoming session
        let ss = [];
        this.rounds.forEach(g => {
            ss.push(...g.getSessionsArray());
        });
        return ss
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .find(s => s.date > from_date);
    }
}

export class GrandPrix {
    constructor(schedule: Schedule, data: loosegp) {
        this.name = data.raceName;
        this.round = parseInt(data.round);
        this.season = schedule.season;
        this.sessions = {
            race: new Session(this, { date: data.date, time: data.time }),
        };
        if (data.FirstPractice && data.SecondPractice && data.Qualifying) {
            this.sessions.fp1 = new Session(this, data.FirstPractice);
            this.sessions.fp2 = new Session(this, data.SecondPractice);
            this.sessions.qualifying = new Session(this, data.Qualifying);
        }
        if (data.Sprint) {
            this.sessions.sprint = new Session(this, data.Sprint);
        } else if (data.ThirdPractice) {
            this.sessions.fp3 = new Session(this, data.ThirdPractice);
        }
        this.schedule = schedule;
    }

    name: string;
    round: number;
    season: number;
    schedule: Schedule;
    sprintWeekend: boolean;
    circuit: Circuit;
    id: string;
    sessions: {
        fp1?: Session;
        fp2?: Session;
        fp3?: Session;
        qualifying?: Session;
        sprint?: Session;
        race: Session;
    };

    getSessionsArray(): Session[] {
        const a = [];
        a.push(this.sessions.fp1);
        a.push(this.sessions.fp2);
        a.push(this.sessions.fp3);
        a.push(this.sessions.qualifying);
        a.push(this.sessions.sprint);
        a.push(this.sessions.race);
        return a.filter(Boolean);
    }
}

export class Session {
    constructor(grandprix: GrandPrix, data: datet) {
        this.grandprix = grandprix;
        this.date = getDate({
            date: data.date,
            time: data.time || '00:00:00Z',
        });
    }

    name:
        | 'Free Practice 1'
        | 'Free Practice 2'
        | 'Free Practice 3'
        | 'Qualifying'
        | 'Sprint Qualifying'
        | 'Race';
    grandprix: GrandPrix;
    date: Date;
    length: number;
    completed: boolean;
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
