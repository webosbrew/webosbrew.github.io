import {DeviceModelIndexEntry, DeviceModelIndices} from "../toh-data";
import {getConditionsIndices, SearchConditions} from "./conditions";
import {Component, html} from "htm/preact";
import {signal} from "@preact/signals";
import {debounce, intersection, omit} from "lodash-es";
import {RenderableProps} from "preact";
import {ChangeEvent} from "preact/compat";

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

type SearchCheckboxProps = {
    name: string;
    index: number;
    entry: DeviceModelIndexEntry;
    checked: boolean;
    changed: (index: number, checked: boolean) => void;
};

function SearchCheckbox(props: SearchCheckboxProps) {
    const {name, index, checked} = props;
    const {value, indices} = props.entry;
    return html`
      <div class="form-check" key="${name}-${index}">
        <input type="checkbox" class="form-check-input" value=${value} id="${name}-${value}" checked=${checked}
               onChange=${(e: ChangeEvent<HTMLInputElement>) => props.changed(index, e.currentTarget.checked)}/>
        <label class="form-check-label text-nowrap" for="${props.name}-${value}">${value} (${indices.length})</label>
      </div>`;
}

export class SearchSection extends Component<SearchSectionProps, SearchSectionState> {

    private filter = signal('');

    constructor() {
        super();
        this.state = {};
    }

    checkChanged = (index: number, checked: boolean) => {
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

    resetSelections() {
        this.setState(Object.fromEntries(this.props.entries.map((_, index) => [index, undefined])));
        this.selectionsChangedDebounced([]);
    }

    selectionsChangedDebounced = debounce((v: number[]) => this.props.selectionsChanged?.(v), 500);

    render(props: RenderableProps<SearchSectionProps>, state: Readonly<SearchSectionState>) {
        const otherIndices = getConditionsIndices(omit(props.conditions, props.name));
        const entries = props.entries.map((entry, index): DeviceModelIndexEntry & { index: number } => {
            const indices = (otherIndices?.length && intersection(entry.indices, otherIndices)) || entry.indices;
            return {value: entry.value, indices: indices, index};
        }).filter(entry => entry.indices.length > 0).sort((a, b) => {
            if (state[a.index] != state[b.index]) {
                return state[a.index] ? -1 : 1;
            }
            return a.value.localeCompare(b.value);
        });
        const hasValue = !!props.conditions[props.name];
        return html`
          <div class="search-section mb-2">
            <div class="ps-md-3 d-flex flex-row w-100 collapsed user-select-none" data-bs-toggle="collapse"
                 href="#search-${props.name}">
              <label class="form-label flex-fill ${hasValue ? 'fw-bold' : ''}">
                ${props.title} (${entries.length})</label>
            </div>
            <div class="collapse" id="search-${props.name}">
              <div class="ps-md-3 position-relative mt-2">
                <input type="text" class="form-control pe-5" placeholder="Filter..." autocomplete="new-filter"
                       value=${this.filter.value}
                       onInput=${(e: ChangeEvent<HTMLInputElement>) => this.filter.value = e.currentTarget.value}/>
                <button class="btn btn-link position-absolute top-0 end-0 ${this.filter.value ? '' : 'd-none'}"
                        onClick=${() => this.filter.value = ''}>
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              ${hasValue && html`
                <div class="mt-2">
                  <button class="btn btn-link text-decoration-none" onClick=${() => this.resetSelections()}>Reset
                  </button>
                </div>
              `}
              <div class="ps-md-3 mt-2 pb-2 overflow-x-auto">
                ${entries.map((entry) => {
                  if (entry.indices.length === 0) return;
                  if (this.filter.value) {
                    const filter = this.filter.value.toLowerCase();
                    if (!entry.value.toLowerCase().includes(filter)) return;
                  }
                  return html`
                    <${SearchCheckbox} name=${props.name} index=${entry.index} entry=${entry}
                                       checked=${!!state[entry.index]} changed=${this.checkChanged}></SearchCheckbox>`;
                })}
              </div>
            </div>
          </div>
        `;
    }
}