import {Component, html} from "htm/preact";
import {ComponentChild, RenderableProps} from "preact";
import {DeviceModelEntry, DeviceModelIndexEntry, DeviceModelIndices} from "./toh-data";
import {ChangeEvent} from "preact/compat";
import {debounce, intersection, omit} from "lodash-es";

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

type SideSearchProps = {
    models: DeviceModelEntry[];
    indices: DeviceModelIndices;
    conditionsChanged?: (conditions: SearchConditions) => void;
};

export class SideSearch extends Component<SideSearchProps> {

    private conditions: SearchConditions = {};

    searchConditionChanged(name: keyof SearchConditions, indices: number[]) {
        this.conditions[name] = indices;
        this.props.conditionsChanged?.(this.conditions);
    }

    render(props: RenderableProps<SideSearchProps>): ComponentChild {
        return html`
          <div class="ps-3 overflow-y-auto">
            <${SearchSection} name="machine" title="SoC" models=${props.models} entries=${props.indices.machine}
                              conditions=${this.conditions}
                              selectionsChanged=${(v: number[]) => this.searchConditionChanged("machine", v)}>
            </SearchSection>
            <${SearchSection} name="codename" title="Codename" models=${props.models} entries=${props.indices.codename}
                              conditions=${this.conditions}
                              selectionsChanged=${(v: number[]) => this.searchConditionChanged("codename", v)}>
            </SearchSection>
            <${SearchSection} name="series" title="Series" models=${props.models} entries=${props.indices.series}
                              conditions=${this.conditions}
                              selectionsChanged=${(v: number[]) => this.searchConditionChanged("series", v)}>
            </SearchSection>
            <${SearchSection} name="broadcast" title="Broadcast" models=${props.models}
                              entries=${props.indices.broadcast} conditions=${this.conditions}
                              selectionsChanged=${(v: number[]) => this.searchConditionChanged("broadcast", v)}>
            </SearchSection>
            <${SearchSection} name="region" title="Region" models=${props.models} entries=${props.indices.region}
                              conditions=${this.conditions}
                              selectionsChanged=${(v: number[]) => this.searchConditionChanged("region", v)}>
            </SearchSection>
            <${SearchSection} name="otaId" title="OTA ID" models=${props.models} entries=${props.indices.otaId}
                              conditions=${this.conditions}
                              selectionsChanged=${(v: number[]) => this.searchConditionChanged("otaId", v)}>
            </SearchSection>
          </div>
        `;
    }
}

type SearchOption = string | {
    value: string;
    label: string;
};

type SearchSectionProps = {
    name: keyof DeviceModelIndices;
    title: string;
    entries: DeviceModelIndexEntry[];
    options: (models: DeviceModelIndexEntry[]) => SearchOption[];

    readonly conditions: SearchConditions;
    selectionsChanged?: (indices: number[]) => void;
};

type SearchSectionState = {
    [index: number]: DeviceModelIndexEntry | undefined;
};

class SearchSection extends Component<SearchSectionProps, SearchSectionState> {

    constructor() {
        super();
        this.state = {};
    }

    checkChanged(index: number, checked: boolean) {
        const state = {...this.state};
        if (checked) {
            state[index] = this.props.entries[index];
        } else {
            state[index] = undefined;
        }
        this.setState(state);
        const indices = Object.values(state).flatMap(v => v?.indices ?? []).sort();
        this.selectionsChangedDebounced(indices);
    }

    selectionsChangedDebounced = debounce((v: number[]) => this.props.selectionsChanged?.(v), 500);

    render(props: RenderableProps<SearchSectionProps>, state: Readonly<SearchSectionState>) {
        const otherIndices = getConditionsIndices(omit(props.conditions, props.name));
        const entries = props.entries.map((entry): DeviceModelIndexEntry => {
            const indices = (otherIndices?.length && intersection(entry.indices, otherIndices)) || entry.indices;
            return {value: entry.value, indices: indices};
        }).filter(entry => entry.indices.length > 0);
        return html`
          <div class="search-section mb-2">
            <div class="d-flex flex-row w-100 collapsed user-select-none" data-bs-toggle="collapse"
                 href="#search-${props.name}">
              <label class="form-label flex-fill ${props.conditions[props.name] ? 'fw-bold' : ''}">${props.title}
                  (${entries.length})</label>
            </div>
            <div class="collapse" id="search-${props.name}">
              ${entries.map((entry, index) => {
                const label = entry.value;
                const value = entry.value;
                return html`
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input" value=${value} id="${props.name}-${value}"
                           checked=${state[index]}
                           onChange=${(e: ChangeEvent<HTMLInputElement>) => this.checkChanged(index, e.currentTarget.checked)}/>
                    <label class="form-check-label text-nowrap" for="${props.name}-${value}">${label}
                        (${entry.indices.length}
                      )</label>
                  </div>`;
              })}
            </div>
          </div>
        `;
    }
}