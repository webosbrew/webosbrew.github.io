import {Component, html} from "htm/preact";
import {ComponentChild, RenderableProps} from "preact";
import {DeviceModelEntry, DeviceModelIndices} from "../toh-data";

import {getConditionsIndices, SearchCondition, SearchConditions} from "./conditions";
import {SearchSection} from "./section";

interface SideSearchProps {
    models: DeviceModelEntry[];
    indices: DeviceModelIndices;
    conditions?: SearchConditions;
    changed: (conditions: SearchConditions) => void;
}

export class SideSearch extends Component<SideSearchProps> {

    searchConditionChanged(name: keyof SearchConditions, condition: SearchCondition) {
        const conditions = Object.assign({}, this.props.conditions);
        conditions[name] = condition.indices.length > 0 ? condition : undefined;
        this.props.changed(conditions);
    }

    render(props: RenderableProps<SideSearchProps>): ComponentChild {
        return html`
          <div class="overflow-y-auto">
            <${SearchSection} name="machine" title="SoC" models=${props.models} entries=${props.indices.machine}
                              conditions=${props.conditions}
                              changed=${(v: SearchCondition) => this.searchConditionChanged("machine", v)}>
            </SearchSection>
            <${SearchSection} name="year" title="Year" models=${props.models} entries=${props.indices.year}
                              conditions=${props.conditions}
                              changed=${(v: SearchCondition) => this.searchConditionChanged("year", v)}>
            </SearchSection>
            <${SearchSection} name="codename" title="Codename" models=${props.models} entries=${props.indices.codename}
                              conditions=${props.conditions}
                              changed=${(v: SearchCondition) => this.searchConditionChanged("codename", v)}>
            </SearchSection>
            <${SearchSection} name="series" title="Series" models=${props.models} entries=${props.indices.series}
                              conditions=${props.conditions}
                              changed=${(v: SearchCondition) => this.searchConditionChanged("series", v)}>
            </SearchSection>
            <${SearchSection} name="screenSize" title="Screen Size" models=${props.models}
                              entries=${props.indices.screenSize} conditions=${props.conditions}
                              changed=${(v: SearchCondition) => this.searchConditionChanged("screenSize", v)}>
            </SearchSection>
            <${SearchSection} name="broadcast" title="Broadcast" models=${props.models}
                              entries=${props.indices.broadcast} conditions=${props.conditions}
                              changed=${(v: SearchCondition) => this.searchConditionChanged("broadcast", v)}>
            </SearchSection>
            <${SearchSection} name="region" title="Region" models=${props.models} entries=${props.indices.region}
                              conditions=${props.conditions}
                              changed=${(v: SearchCondition) => this.searchConditionChanged("region", v)}>
            </SearchSection>
            <${SearchSection} name="otaId" title="OTA ID" models=${props.models} entries=${props.indices.otaId}
                              conditions=${props.conditions}
                              changed=${(v: SearchCondition) => this.searchConditionChanged("otaId", v)}>
            </SearchSection>
          </div>
        `;
    }
}


export {SearchConditions, getConditionsIndices};