import {Component, html} from "htm/preact";
import {ComponentChild, RenderableProps} from "preact";
import {DeviceModelEntry} from "./toh-data";

type DevicesTableProps = {
    models: DeviceModelEntry[];
    truncated: boolean;
}

export class DevicesTable extends Component<DevicesTableProps> {
    render(props: RenderableProps<DevicesTableProps>): ComponentChild {
        const offset = 0;
        const limit = 50;
        const items = props.models.slice(offset, offset + limit);
        return html`
          <div class="flex-fill table-responsive">
            <${Pagination} count=${props.models.length} offset=${offset} limit=${limit}></Pagination>
            <table class="table table-hover table-striped">
              <thead>
              <tr>
                <th>Model</th>
                <th>Series</th>
                <th>Machine</th>
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
}

class Pagination extends Component<PaginationProps> {
    render(props: RenderableProps<PaginationProps>) {
        const options = Array.from({length: Math.ceil(props.count / props.limit)}, (_, i) => i * props.limit);
        return html`
          <nav aria-label="Page navigation example">
            <ul class="pagination input-group input-group-sm">
              <li class="page-item">
                <a class="page-link" href="#" aria-label="First">
                  <i class="bi bi-chevron-bar-left" aria-hidden="true"></i>
                </a>
              </li>
              <li class="page-item">
                <a class="page-link" href="#" aria-label="Previous">
                  <i class="bi bi-chevron-left" aria-hidden="true"></i>
                </a>
              </li>
              <select class="page-item form-select">
                ${options.map(option => html`
                  <option value=${option} selected=${option === props.offset}>${option + 1} - ${option + props.limit}
                  </option>`
                )}
              </select>
              <li class="page-item input-group-text">
                of ${props.count}
              </li>
              <li class="page-item">
                <a class="page-link" href="#" aria-label="Next">
                  <i class="bi bi-chevron-right" aria-hidden="true"></i>
                </a>
              </li>
              <li class="page-item">
                <a class="page-link" href="#" aria-label="Last">
                  <i class="bi bi-chevron-bar-right" aria-hidden="true"></i>
                </a>
              </li>
            </ul>
          </nav>
        `;
    }
}