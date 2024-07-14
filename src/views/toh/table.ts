import {Component, html} from "htm/preact";
import {ComponentChild, RenderableProps} from "preact";
import {DeviceModelEntry} from "./toh-data";
import {getConditionsIndices, SearchConditions} from "./search";
import {Pagination} from "./pagination";

type DevicesTableProps = {
    models: DeviceModelEntry[];
    conditions?: SearchConditions;
}

type DevicesTableState = {
    offset: number;
};

export class DevicesTable extends Component<DevicesTableProps, DevicesTableState> {

    constructor() {
        super();
        this.state = {offset: 0};
    }

    offsetChange = (offset: number) => {
        if (offset === this.state.offset) return;
        this.setState({offset});
    }

    componentWillReceiveProps(nextProps: Readonly<DevicesTableProps>) {
        if (nextProps.conditions !== this.props.conditions) {
            this.setState({offset: 0});
        }
    }

    render(props: RenderableProps<DevicesTableProps>, state: Readonly<DevicesTableState>): ComponentChild {
        const indices = getConditionsIndices(props.conditions);
        const filtered = indices?.map(i => props.models[i]) ?? props.models;
        const offset = state.offset;
        const limit = 50;
        const items = filtered.slice(offset, offset + limit);
        return html`
          <div class="flex-fill table-responsive">
            <table class="table table-hover table-striped toh">
              <thead>
              <tr>
                <th class="text-nowrap">Model</th>
                <th class="text-nowrap">Series</th>
                <th class="text-nowrap">SoC</th>
                <th class="text-nowrap">Codename</th>
                <th class="text-nowrap">Region</th>
                <th class="text-nowrap">OTA ID</th>
                <th class="text-nowrap">Screen Sizes</th>
              </tr>
              </thead>
              <tbody>
              ${items.map((item) => html`
                <tr>
                  <td class="model">${item.model}</td>
                  <td class="series">${item.series}</td>
                  <td class="machine">${item.machine}</td>
                  <td class="codename">${item.codename}</td>
                  <td class="region text-nowrap">${item.regions?.join(", ")}</td>
                  <td class="ota-id">${item.otaId}</td>
                  <td class="screen-size text-nowrap">${item.sizes?.join(", ")}</td>
                </tr>
              `)}
              ${filtered.length === 0 && html`
                <tr>
                  <td colspan="7" class="text-center">No devices found</td>
                </tr>
              `}
              </tbody>
            </table>
          </div>
          ${filtered.length > 0 && html`
            <${Pagination} count=${filtered.length} offset=${offset} limit=${limit}
                           onChange=${this.offsetChange}></Pagination>
          `}
        `;
    }
}
