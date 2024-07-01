import {DeviceModelIndexEntry, DeviceModelIndices} from "../toh-data";
import {getConditionsIndices, SearchCondition, SearchConditions} from "./conditions";
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
    changed: (condition: SearchCondition) => void;
};

type SearchSectionState = Record<string, DeviceModelIndexEntry | undefined>;

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
      <div class="form-check" key="check-${name}-${value}">
        <input type="checkbox" class="form-check-input" value=${value} id="${name}-${value}" checked=${checked}
               onChange=${(e: ChangeEvent<HTMLInputElement>) => props.changed(index, e.currentTarget.checked)}/>
        <label class="form-check-label text-nowrap" for="${props.name}-${value}">${value} (${indices.length})</label>
      </div>`;
}

export class SearchSection extends Component<SearchSectionProps, SearchSectionState> {

    private filter = signal('');

    constructor(props: SearchSectionProps) {
        super();
        const state: SearchSectionState = {};
        for (const entry of props.entries) {
            const checked = props.conditions[props.name]?.options.includes(entry.value);
            if (checked) {
                state[entry.value] = entry;
            }
        }
        this.state = state;
    }

    checkChanged = (index: number, checked: boolean) => {
        const state = {...this.state};
        const entry = this.props.entries[index];
        if (checked) {
            state[entry.value] = entry;
        } else {
            state[entry.value] = undefined;
        }
        this.setState(state);
        const selectedEntries = Object.values(state)
            .filter(v => v?.indices) as DeviceModelIndexEntry[];
        this.selectionsChangedDebounced({
            options: selectedEntries.map(e => e.value),
            indices: selectedEntries.flatMap(e => e.indices).sort()
        });
    }

    resetSelections = () => {
        this.setState(Object.fromEntries(this.props.entries.map((entry) => [entry.value, undefined])));
        this.selectionsChangedDebounced({options: [], indices: []});
    }

    selectionsChangedDebounced = debounce((v: SearchCondition) => this.props.changed(v), 500);

    render(props: RenderableProps<SearchSectionProps>, state: Readonly<SearchSectionState>) {
        const otherIndices = getConditionsIndices(omit(props.conditions, props.name));
        const entries = props.entries.map((entry, index): DeviceModelIndexEntry & { index: number } => {
            const indices = (otherIndices?.length && intersection(entry.indices, otherIndices)) || entry.indices;
            return {value: entry.value, indices: indices, index};
        }).filter(entry => {
            return state[entry.value] || entry.indices.length > 0;
        }).sort((a, b) => {
            if (state[a.value] != state[b.value]) {
                return state[a.value] ? -1 : 1;
            }
            return a.value.localeCompare(b.value);
        });
        const hasValue = !!props.conditions[props.name];
        return html`
          <div class="search-section mb-2">
            <div class="ps-md-3 pe-md-1 py-2 d-flex flex-row w-100 collapsed user-select-none" data-bs-toggle="collapse"
                 href="#search-${props.name}">
              <label class="form-label flex-fill ${hasValue ? 'fw-bold' : ''}">
                ${props.title} (${entries.length})</label>
            </div>
            <div class="collapse" id="search-${props.name}">
              <div class="p-1 my-1 my-md-2 ms-md-3 me-md-1 overflow-auto list-container border rounded">
                ${entries.length > 10 &&
                html`
                  <div class="position-relative mb-2">
                    <input type="text" class="form-control form-control-sm pe-4" placeholder="Filter..."
                           autocomplete="new-filter" value=${this.filter.value}
                           onInput=${(e: ChangeEvent<HTMLInputElement>) => this.filter.value = e.currentTarget.value}/>
                    <button
                        class="btn btn-sm btn-link position-absolute top-0 end-0 ${this.filter.value ? '' : 'd-none'}"
                        onClick=${() => this.filter.value = ''}>
                      <i class="bi bi-x"></i>
                    </button>
                  </div>`
                }
                ${hasValue && html`
                  <div class="mt-2 d-flex flex-row justify-content-end">
                    <button class="btn btn-sm btn-link text-decoration-none" onClick=${this.resetSelections}>
                      Reset
                    </button>
                  </div>
                `}
                ${entries.map((entry) => {
                  if (this.filter.value) {
                    const filter = this.filter.value.toLowerCase();
                    if (!entry.value.toLowerCase().includes(filter)) return;
                  }
                  return html`
                    <${SearchCheckbox} name=${props.name} index=${entry.index} entry=${entry}
                                       checked=${!!state[entry.value]} changed=${this.checkChanged}></SearchCheckbox>`;
                })}
              </div>
            </div>
          </div>
        `;
    }
}