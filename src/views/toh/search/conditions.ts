import {intersection, union} from "lodash-es";
import {DeviceModelIndices, indices} from "../toh-data";

export interface SearchCondition {
    options: string[];
    indices: number[];
}

export interface SearchConditions {
    machine?: SearchCondition;
    codename?: SearchCondition;
    series?: SearchCondition;
    broadcast?: SearchCondition;
    region?: SearchCondition;
    otaId?: SearchCondition;
}

export function getConditionsIndices(conditions?: SearchConditions): number[] | undefined {
    if (!conditions) return undefined;
    const values: SearchCondition[] = Object.values(conditions)
        .filter((v: SearchCondition) => v?.indices?.length > 0);
    if (values.length === 0) return undefined;
    return intersection(...values.map(v => v.indices)).sort();
}

export function applyToUrlParams(conditions: SearchConditions, params: URLSearchParams) {
    for (let k in conditions) {
        const options = conditions[k as keyof SearchConditions]?.options;
        if (options?.length) {
            params?.set(k, options?.join(' '));
        } else {
            params?.delete(k);
        }
    }
}

export function parseFromUrlParams(params: URLSearchParams): SearchConditions {
    const conditions: SearchConditions = {};
    for (let [k, v] of params) {
        const entries = Object.fromEntries(indices[k as keyof DeviceModelIndices].map(e => [e.value, e.indices]));
        if (!entries) continue;
        const options = v.split(' ');
        conditions[k as keyof SearchConditions] = {options, indices: union(...options.map(o => entries[o]))};
    }
    return conditions;
}