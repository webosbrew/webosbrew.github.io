import {Component, html} from "htm/preact";
import {ComponentChild, RenderableProps} from "preact";
import {DeviceModelEntry, DeviceModelIndexEntry, DeviceModelIndices} from "./toh-data";

type SideSearchProps = {
    models: DeviceModelEntry[];
    indices: DeviceModelIndices;
};

export class SideSearch extends Component<SideSearchProps> {
    render(props: RenderableProps<SideSearchProps>): ComponentChild {
        return html`
          <div class="ms-3 overflow-y-auto">
            <${SearchSection} name="soc" title="SoC" models=${props.models} entries=${props.indices.machine}>
            </SearchSection>
            <${SearchSection} name="codename" title="Codename" models=${props.models} entries=${props.indices.codename}>
            </SearchSection>
            <${SearchSection} name="series" title="Series" models=${props.models} entries=${props.indices.series}>
            </SearchSection>
            <${SearchSection} name="broadcast" title="Broadcast" models=${props.models}
                              entries=${props.indices.broadcast}></SearchSection>
            <${SearchSection} name="region" title="Region" models=${props.models} entries=${props.indices.region}>
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
    name: string;
    title: string;
    entries: DeviceModelIndexEntry[];
    options: (models: DeviceModelIndexEntry[]) => SearchOption[];
};

type SearchSectionState = {
    options?: SearchOption[];
}

class SearchSection extends Component<SearchSectionProps, SearchSectionState> {
    componentDidMount() {
        const collapse = document.getElementById(`search-${this.props.name}`) as HTMLElement;
        collapse?.addEventListener('show.bs.collapse', () => {
            if (!this.state.options) {
                this.setState({
                    options: this.props.entries.map(e => ({
                        value: e.value,
                        label: `${e.value} (${e.indices.length})`
                    }))
                });
            }
        });
    }

    render(props: RenderableProps<SearchSectionProps>, state: Readonly<SearchSectionState>): ComponentChild {
        return html`
          <div class="search-section mb-2">
            <div class="d-flex flex-row w-100 collapsed user-select-none" data-bs-toggle="collapse"
                 href="#search-${props.name}">
              <label class="form-label fw-bold flex-fill">${props.title}</label>
            </div>
            <div class="collapse" id="search-${props.name}">
              ${state.options?.map(option => {
                const label = typeof option === 'string' ? option : option.label;
                const value = typeof option === 'string' ? option : option.value;
                return html`
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input" value=${value} id="${props.name}-${value}"/>
                    <label class="form-check-label" for="${props.name}-${value}">${label}</label>
                  </div>`;
              })}
            </div>
          </div>
        `;
    }
}