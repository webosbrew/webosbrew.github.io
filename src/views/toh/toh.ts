import {Component, html, render} from "htm/preact";
import {SearchConditions, SideSearch} from "./search";
import {indices, models} from "./toh-data";
import {DevicesTable} from "./table";

type AppState = {
    conditions?: SearchConditions;
};

class App extends Component<{}, AppState> {

    conditionsChanged = (conditions: SearchConditions) => {
        this.setState({conditions});
    }

    render(_props: {}, state: AppState) {
        return html`
          <div class="d-flex flex-column-reverse flex-md-row align-items-md-start">
            <div class="flex-md-fill">
              <${DevicesTable} models=${models} conditions=${state.conditions}></DevicesTable>
            </div>
            <aside class="ms-md-3 toc" style="top: calc(var(--navbar-height) + 1em)">
              <div class="vr position-absolute h-100 d-none d-md-block"></div>
              <${SideSearch} models=${models} indices=${indices} conditionsChanged=${this.conditionsChanged}>
              </SideSearch>
            </aside>
          </div>
        `;
    }
}

render(html`
      <${App}/>`,
    document.getElementById('app-container')!);