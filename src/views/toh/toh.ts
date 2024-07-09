import {Component, html, render} from "htm/preact";
import {SearchConditions, SideSearch} from "./search";
import {indices, models} from "./toh-data";
import {DevicesTable} from "./table";
import {applyToUrlParams, parseFromUrlParams} from "./search/conditions";

type AppState = {
    conditions?: SearchConditions;
};

class App extends Component<{}, AppState> {

    constructor() {
        super();
        const params = new URL(location.href).searchParams;
        this.state = {conditions: params ? parseFromUrlParams(params) : undefined};
    }

    conditionsChanged = (conditions: SearchConditions) => {
        this.setState({conditions});
        const url = new URL(location.href);
        if (url.searchParams) {
            applyToUrlParams(conditions, url.searchParams);
            history.pushState(null, '', url);
        }
    }

    locationChanged = (): void => {
        const url = new URL(location.href);
        if (url.searchParams) {
            this.conditionsChanged(parseFromUrlParams(url.searchParams));
        }
    };

    componentDidMount(): void {
        addEventListener('popstate', this.locationChanged);
    }

    componentWillUnmount(): void {
        removeEventListener('popstate', this.locationChanged);
    }


    render(_props: {}, state: AppState) {
        return html`
          <div class="d-flex flex-column-reverse flex-md-row align-items-md-start">
            <div class="flex-md-fill overflow-x-auto">
              <${DevicesTable} models=${models} conditions=${state.conditions}></DevicesTable>
            </div>
            <aside class="ms-md-3 toc flex-shrink-0" style="top: calc(var(--navbar-height) + 1em)">
              <div class="vr position-absolute h-100 d-none d-md-block"></div>
              <${SideSearch} models=${models} indices=${indices} conditions=${state.conditions}
                             changed=${this.conditionsChanged}>
              </SideSearch>
            </aside>
          </div>
        `;
    }
}

render(html`
      <${App}/>`,
    document.getElementById('app-container')!);