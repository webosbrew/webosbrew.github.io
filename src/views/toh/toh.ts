import {Component, html, render} from "htm/preact";
import {SideSearch} from "./search";
import {indices, models} from "./toh-data";
import {DevicesTable} from "./table";

class App extends Component {
    render() {
        return html`
          <div class="d-flex flex-row align-items-start">
            <${DevicesTable} models=${models} truncated=${true}></DevicesTable>
            <aside class="w-25 ms-3 position-sticky" style="top: calc(var(--navbar-height) + 1em)">
              <div class="vr position-absolute h-100"></div>
              <${SideSearch} models=${models} indices=${indices}></SideSearch>
            </aside>
          </div>
        `;
    }
}

render(html`
      <${App}/>`,
    document.getElementById('app-container')!);