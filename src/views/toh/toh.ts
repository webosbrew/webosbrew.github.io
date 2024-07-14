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
          <div class="toh-app d-md-grid d-block">
            <button class="form-select text-start d-md-none mb-2" type="button" data-bs-toggle="collapse"
                    data-bs-target="#toh-search">
              Filter
            </button>
            <aside id="toh-search" class="collapse d-md-block p-2 p-md-0">
              <${SideSearch} models=${models} indices=${indices} conditions=${state.conditions}
                             changed=${this.conditionsChanged}>
              </SideSearch>
            </aside>
            <${DevicesTable} models=${models} conditions=${state.conditions}></DevicesTable>
          </div>
        `;
    }
}

render(html`
      <${App}/>`,
    document.getElementById('app-container')!);