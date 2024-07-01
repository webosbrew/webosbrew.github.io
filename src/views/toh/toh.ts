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
        console.log(conditions);
    }

    render(_props: {}, state: AppState) {
        return html`
          <div class="d-flex flex-row align-items-start">
            <${DevicesTable} models=${models} conditions=${state.conditions}></DevicesTable>
            <aside class="w-25 ms-3 position-sticky" style="top: calc(var(--navbar-height) + 1em)">
              <div class="vr position-absolute h-100"></div>
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