export interface SecretPattern {
    name: string;
    type: string;
    regex: RegExp;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
}
export declare const SECRET_PATTERNS: SecretPattern[];
export declare const SKIP_EXTENSIONS: Set<string>;
export declare const SKIP_DIRECTORIES: Set<string>;
export declare const MAX_FILE_SIZE: number;
