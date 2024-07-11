import {Component, html} from "htm/preact";
import {RenderableProps} from "preact";
import {ChangeEvent} from "preact/compat";

type PaginationProps = {
    count: number;
    offset: number;
    limit: number;
    onChange?: (offset: number) => void;
}

export class Pagination extends Component<PaginationProps> {

    previousPage = () => {
        if (this.props.offset < this.props.limit) {
            return;
        }
        this.props.onChange?.(this.props.offset - this.props.limit);
    };

    nextPage = () => {
        const newOffset = this.props.offset + this.props.limit;
        if (newOffset >= this.props.count) {
            return;
        }
        this.props.onChange?.(newOffset);
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
          <nav class="py-1 w-100 d-flex flex-row justify-content-center position-sticky bottom-0">
            <ul class="pagination input-group input-group-sm flex-nowrap align-self-center w-auto shadow rounded-2">
              <li class="page-item">
                <button class="page-link" disabled=${props.offset <= 0} onClick=${this.previousPage}
                        aria-label="Previous">
                  <i class="bi bi-chevron-left" aria-hidden="true"></i>
                </button>
              </li>
              <select class="page-item form-select w-auto"
                      onChange=${(e: ChangeEvent<HTMLSelectElement>) => this.toOffset(parseInt(e.currentTarget.value))}>
                ${offsets.map(offset => html`
                  <option value=${offset} selected=${offset === props.offset}>
                    ${offset + 1} - ${Math.min(offset + props.limit, props.count)}
                  </option>`
                )}
              </select>
              <li class="page-item input-group-text">
                of ${props.count}
              </li>
              <li class="page-item">
                <button class="page-link" disabled=${props.offset + props.limit >= props.count} onClick=${this.nextPage}
                        aria-label="Next">
                  <i class="bi bi-chevron-right" aria-hidden="true"></i>
                </button>
              </li>
            </ul>
          </nav>
        `;
    }
}