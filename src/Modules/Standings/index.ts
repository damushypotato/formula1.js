import {
    CSAPIloose,
    DSAPIloose,
    looseconstructor,
    loosedriver,
    loosestanding,
    loosestanding_c,
    loosestanding_d,
    year,
} from '../../Types';
import { Request } from '../Request';

export class Standings {
    constructor(year: year, round?: number, limit?: number) {
        this.year = year;
        this.round = round;
        this.limit = limit;
    }

    pop: () => Promise<Standings>;

    protected year: year;
    protected round: number;
    protected limit: year;
    initialized: boolean = false;

    season: number;
    completedRounds: number;
    standings: Standing[];
}

export class ConstructorStandings extends Standings {
    pop = async (): Promise<ConstructorStandings> => {
        const defaultLimit = 30;
        const round = `${
            this.round != null && this.round > 0
                ? `/${Math.floor(this.round)}`
                : ''
        }`;
        const data = (await Request(
            `${this.year}${round}/constructorStandings`,
            `limit=${this.limit || defaultLimit}`
        )) as CSAPIloose;

        const standings = data.MRData.StandingsTable.StandingsLists[0];

        this.season = parseInt(standings.season);
        this.completedRounds = parseInt(standings.round);

        this.standings = standings.ConstructorStandings.map(
            s => new ConstructorStanding(this, s)
        );

        this.initialized = true;
        return this;
    };
}

export class DriverStandings extends Standings {
    pop = async (): Promise<DriverStandings> => {
        const defaultLimit = 150;
        const round = `${
            this.round != null && this.round > 0
                ? `/${Math.floor(this.round)}`
                : ''
        }`;
        const data = (await Request(
            `${this.year}${round}/driverStandings`,
            `limit=${this.limit || defaultLimit}`
        )) as DSAPIloose;

        const standings = data.MRData.StandingsTable.StandingsLists[0];

        this.season = parseInt(standings.season);
        this.completedRounds = parseInt(standings.round);

        this.standings = standings.DriverStandings.map(
            s => new DriverStanding(this, s)
        );

        this.initialized = true;
        return this;
    };
}

export class Standing {
    constructor(s: Standings, data: loosestanding) {
        this.position = parseInt(data.position);
        this.points = parseFloat(data.points);
        this.wins = parseInt(data.wins);
        this.standings = s;
    }

    standings: Standings;
    position: number;
    points: number;
    wins: number;
    team: Constructor;
}

export class ConstructorStanding extends Standing {
    constructor(s: ConstructorStandings, data: loosestanding_c) {
        super(s, data);
        this.team = new Constructor(this, data.Constructor);
    }
}

export class DriverStanding extends Standing {
    constructor(s: ConstructorStandings, data: loosestanding_d) {
        super(s, data);
        this.team = new Constructor(this, data.Constructors[0]);
        this.driver = new Driver(this, data.Driver);
    }

    driver: Driver;
}

export class Constructor {
    constructor(s: Standing, data: looseconstructor) {
        this.id = data.constructorId;
        this.name = data.name;
        this.nationality = data.nationality;
        this.standing = s;
    }

    standing: Standing;
    id: string;
    name: string;
    nationality: string;
}

export class Driver {
    constructor(s: DriverStanding, data: loosedriver) {
        this.id = data.driverId;
        this.permanentNumber = data.permanentNumber;
        this.code = data.code;
        this.firstName = data.givenName;
        this.lastName = data.familyName;
        this.dateOfBirth = data.dateOfBirth;
        this.nationality = data.nationality;
        this.standing = s;
    }

    standing: DriverStanding;
    id: string;
    permanentNumber?: string;
    code?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;

    fullName = (): string => `${this.firstName} ${this.lastName}`;
}
