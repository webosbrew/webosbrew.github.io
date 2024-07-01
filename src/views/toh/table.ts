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
                <th>Model</th>
                <th>Series</th>
                <th>SoC</th>
                <th>Codename</th>
                <th>Region</th>
                <th>OTA ID</th>
              </tr>
              </thead>
              <tbody>
              ${items.map((item) => html`
                <tr>
                  <td class="model">${item.model}</td>
                  <td class="series">${item.series}</td>
                  <td class="machine">${item.machine}</td>
                  <td class="codename">${item.codename}</td>
                  <td class="region">${item.region}</td>
                  <td class="ota-id">${item.otaId}</td>
                </tr>
              `)}
              ${filtered.length === 0 && html`
                <tr>
                  <td colspan="6" class="text-center">No devices found</td>
                </tr>
              `}
              </tbody>
            </table>
          </div>
          ${filtered.length && html`
            <${Pagination} count=${filtered.length} offset=${offset} limit=${limit}
                           onChange=${this.offsetChange}></Pagination>
          `}
        `;
    }
}
