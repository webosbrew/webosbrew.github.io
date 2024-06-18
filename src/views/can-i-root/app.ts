import {Component, html, render} from 'htm/preact';
import {DeviceExploitAvailabilities, DeviceModel} from "@webosbrew/caniroot";
import debounce from 'lodash-es/debounce';
import {JSXInternal} from "preact/src/jsx";
import TargetedInputEvent = JSXInternal.TargetedInputEvent;
import {RenderableProps} from "preact";

interface AppProps {
    q?: string;
}

interface AppState {
    term?: SearchTerm;
    model?: DeviceModel;
    availability?: DeviceExploitAvailabilities;
}

interface SearchTerm {
    q: string;
    model?: string;
    firmware?: string;
}

function parseSearchTerm(q?: string): SearchTerm | undefined {
    if (!q) return undefined;
    const model = q.match(/[A-Z0-9-]{4,12}(?:\.[A-Z0-9]{2,4})?/)?.[0];
    const firmware = q.match(/\d{2}\.\d{2}\.\d{2}/)?.[0];
    return {q, model, firmware};
}

interface ExploitMethod {
    name: string;
    key: keyof DeviceExploitAvailabilities;
    expert?: boolean;
}

class App extends Component<AppProps, AppState> {

    readonly exploits: ExploitMethod[] = [
        {name: 'DejaVuln', key: 'dejavuln'},
        {name: 'crashd', key: 'crashd'},
        {name: 'WTA', key: 'wta'},
        {name: 'rootmytv', key: 'rootmytv'},
        {name: 'NVM', key: 'nvm', expert: true},
    ];

    constructor(props: AppProps) {
        super(props);
        const term = parseSearchTerm(props.q);
        let model = term && DeviceModel.findModel(term.model ?? '');
        let availability = model && DeviceExploitAvailabilities.byOTAID(model.otaId);
        this.state = {term, model, availability};
    }

    /**
     * Submit input to search for device model and exploit availability
     */
    searchChanged = debounce((q: string) => {
        const term = parseSearchTerm(q);
        let model = term && DeviceModel.findModel(term.model ?? '');
        let availability = model && DeviceExploitAvailabilities.byOTAID(model.otaId);
        this.setState({term, model, availability});
    }, 300);

    render(_props: RenderableProps<AppProps>, state: Readonly<AppState>) {
        return html`
          <div class="app">
            <input class="form-control form-control-lg" type="search" value="${state.term?.q ?? ''}"
                   placeholder="Type model & firmware version here..."
                   onInput=${(e: TargetedInputEvent<HTMLInputElement>) => this.searchChanged(e.currentTarget.value)}/>
            ${state.term && (state.model ?
                    html`
                      <div class="alert alert-success mt-3" role="alert">Found otaId <code>${state.model.otaId}</code>, 
                        broadcast <code>${state.model.broadcast}</code>, region <code>${state.model.region}</code>
                      </div>
                      <hr/>` :
                    html`
                      <div class="alert alert-warning mt-3" role="alert">Device not found!</div>
                      <hr/>`
            )}

            ${this.exploits.map(exploit => {
              const avail = state.availability?.[exploit.key];
              const firmware = state.term?.firmware ?? avail?.patched?.version;
              const patched = (avail?.patched && firmware && firmware >= avail.patched.version) || false;
              return avail && html`
                <div class=${`card p-3 mt-3 ${patched ? 'bg-danger-subtle' : 'bg-success-subtle'}`}>
                  <h3>${exploit.name}</h3>
                  <div><i class="bi bi-hand-thumbs-up-fill"/> Latest known working firmware: ${avail.latest?.version}
                  </div>
                  ${avail.patched && html`
                    <div><i class="bi bi-bandaid-fill"/> Patched in: ${avail.patched?.version}
                      ${state.term?.firmware && html` (you have ${state.term.firmware})`}
                    </div>
                  `}
                </div>`;
            })}
          </div>
        `;
    }
}

render(html`
  <${App} q=${new URLSearchParams(location.search).get('q')}/>`, document.getElementById('app-container')!);