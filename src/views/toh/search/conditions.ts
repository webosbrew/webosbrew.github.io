import {intersection} from "lodash-es";

export interface SearchConditions {
    machine?: number[];
    codename?: number[];
    series?: number[];
    broadcast?: number[];
    region?: number[];
    otaId?: number[];

}

export function getConditionsIndices(conditions?: SearchConditions): number[] | undefined {
    if (!conditions) return undefined;
    const values: number[][] = Object.values(conditions).filter(v => v?.length > 0);
    if (values.length === 0) return undefined;
    return intersection(...values).sort();
}