import {Component, html} from "htm/preact";
import {ComponentChild, RenderableProps} from "preact";
import {DeviceModelEntry, DeviceModelIndices} from "../toh-data";

import {getConditionsIndices, SearchConditions} from "./conditions";
import {SearchSection} from "./section";

type SideSearchProps = {
    models: DeviceModelEntry[];
    indices: DeviceModelIndices;
    conditionsChanged?: (conditions: SearchConditions) => void;
};

export class SideSearch extends Component<SideSearchProps> {

    private conditions: SearchConditions = {};

    searchConditionChanged(name: keyof SearchConditions, indices: number[]) {
        this.conditions[name] = indices.length > 0 ? indices : undefined;
        this.props.conditionsChanged?.(this.conditions);
    }

    render(props: RenderableProps<SideSearchProps>): ComponentChild {
        return html`
          <div class="overflow-y-auto">
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


export {SearchConditions, getConditionsIndices};