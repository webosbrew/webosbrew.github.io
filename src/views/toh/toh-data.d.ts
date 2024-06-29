import {DeviceModelData} from "@webosbrew/caniroot";

export type DeviceModelEntry = DeviceModelData & { model: string };

export type DeviceModelIndexEntry = { value: string, indices: number[] };

export type DeviceModelIndices = {
    machine: DeviceModelIndexEntry[],
    series: DeviceModelIndexEntry[],
    codename: DeviceModelIndexEntry[],
    broadcast: DeviceModelIndexEntry[],
    region: DeviceModelIndexEntry[],
};

export const models: DeviceModelEntry[];

export const indices: DeviceModelIndices;