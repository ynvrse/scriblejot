export interface Stellaryst {
    id?: number;
    name: string;
    appName: string;
    owner: string;
    gitHub: string;
    sourceCode: string;
    createdAt: Date;
    updatedAt: Date | null;
}

export interface DatabaseSchema {
    stellaryst: Stellaryst;
}
