export type WebOSMajor =
    'afro'
    | 'beehive'
    | 'dreadlocks'
    | 'dreadlocks2'
    | 'goldilocks'
    | 'goldilocks2'
    | 'jhericurl'
    | 'kisscurl'
    | 'mullet'
    | 'number1'
    | 'ombre'
    | 'ponytail'
    | 'queue';


export interface DataEntry {
    name: string;
    versions: Record<WebOSMajor, string>;
    documentation?: string;
    warning?: string,
}