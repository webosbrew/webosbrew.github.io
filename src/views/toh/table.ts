import {Component, html} from "htm/preact";
import {ComponentChild, RenderableProps} from "preact";
import {DeviceModelEntry} from "./toh-data";
import {ChangeEvent} from "preact/compat";
import {getConditionsIndices, SearchConditions} from "./search";

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

    render(props: RenderableProps<DevicesTableProps>, state: Readonly<DevicesTableState>): ComponentChild {
        const indices = getConditionsIndices(props.conditions);
        const filtered = indices?.map(i => props.models[i]) ?? props.models;
        const offset = state.offset;
        const limit = 50;
        const items = filtered.slice(offset, offset + limit);
        return html`
          <div class="flex-fill table-responsive">
            <${Pagination} count=${filtered.length} offset=${offset} limit=${limit}
                           onChange=${this.offsetChange}></Pagination>
            <table class="table table-hover table-striped">
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
                  <td>${item.model}</td>
                  <td>${item.series}</td>
                  <td>${item.machine}</td>
                  <td>${item.codename}</td>
                  <td>${item.region}</td>
                  <td>${item.otaId}</td>
                </tr>
              `)}
              </tbody>
            </table>
          </div>`;
    }
}

type PaginationProps = {
    count: number;
    offset: number;
    limit: number;
    onChange?: (offset: number) => void;
}

class Pagination extends Component<PaginationProps> {

    previousPage = () => {
        if (this.props.offset < this.props.limit) {
            return;
        }
        this.props.onChange?.(this.props.offset - this.props.limit);
    };

    nextPage = () => {
        if (this.props.offset >= this.props.count) {
            return;
        }
        this.props.onChange?.(this.props.offset + this.props.limit);
    };

    toOffset = (offset: number) => {
        if (this.props.offset === offset) {
            return;
        }
        this.props.onChange?.(offset);
    }

    render(props: RenderableProps<PaginationProps>) {
        const offsets = Array.from({length: Math.ceil(props.count / props.limit)}, (_, i) => i * props.limit);
        return html`
          <nav class="py-1">
            <ul class="pagination input-group input-group-sm flex-nowrap">
              <li class="page-item" onClick=${this.previousPage}>
                <a class="page-link" href="#" aria-label="Previous">
                  <i class="bi bi-chevron-left" aria-hidden="true"></i>
                </a>
              </li>
              <select class="page-item form-select w-auto"
                      onChange=${(e: ChangeEvent<HTMLSelectElement>) => this.toOffset(parseInt(e.currentTarget.value))}>
                ${offsets.map(offset => html`
                  <option value=${offset} selected=${offset === props.offset}>${offset + 1} - ${offset + props.limit}
                  </option>`
                )}
              </select>
              <li class="page-item input-group-text">
                of ${props.count}
              </li>
              <li class="page-item" onClick=${this.nextPage}>
                <a class="page-link" href="#" aria-label="Next">
                  <i class="bi bi-chevron-right" aria-hidden="true"></i>
                </a>
              </li>
            </ul>
          </nav>
        `;
    }
}