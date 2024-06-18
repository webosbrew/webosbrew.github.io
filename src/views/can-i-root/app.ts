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
    const model = q.match(/[A-Z0-9-]{4,12}(?:\.[A-Z0-9]{2,4})?/)?.[0]?.toUpperCase();
    const firmware = q.match(/\d{2}\.\d{2}\.\d{2}/)?.[0];
    return {q, model, firmware};
}

interface ExploitMethod {
    name: string;
    key: keyof DeviceExploitAvailabilities;
    url:string;
    expert?: boolean;
}

class App extends Component<AppProps, AppState> {

    readonly exploits: ExploitMethod[] = [
        {name: 'DejaVuln', key: 'dejavuln', url: 'https://github.com/throwaway96/dejavuln-autoroot'},
        {name: 'crashd', key: 'crashd', url: 'https://gist.github.com/throwaway96/e811b0f7cc2a705a5a476a8dfa45e09f'},
        {name: 'WTA', key: 'wta', url: 'https://gist.github.com/throwaway96/b171240ef59d7f5fd6fb48fc6dfd2941'},
        {name: 'RootMy.TV', key: 'rootmytv', url: 'https://rootmy.tv/'},
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
        const url = new URL(location.href);
        if (url.searchParams) {
            url.searchParams.set('q', q);
            history.pushState(null, '', url);
        }
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
                  <h3><i class="bi ${patched ? 'bi-exclamation-octagon-fill' : 'bi-hand-thumbs-up-fill'}"/> ${exploit.name}</h3>
                  ${avail.latest && html`
                    <div>
                      <i class="bi bi-info-circle-fill me-2"/>Latest known working firmware: <b>${avail.latest?.version}
                    </b>
                    </div>
                  `}
                  ${avail.patched && html`
                    <div><i class="bi bi-bandaid-fill me-2"/>Patched in: <b>${avail.patched?.version}</b>
                      ${state.term?.firmware && html` (you have <b>${state.term.firmware}</b>)`}
                    </div>
                  `}
                  ${exploit.expert && html`
                    <div>
                      <i class="bi bi-exclamation-triangle-fill me-2"/>Requires expert knowledge.
                    </div>
                  `}
                  <a class="stretched-link" href="${exploit.url}" target="_blank">Read manual</a>
                </div>`;
            })}

            ${state.availability?.nvm && html`
              <div class="card p-3 mt-3 bg-info-subtle">
                <h3><i class="bi bi-cpu-fill me-2"></i>NVM</h3>
                <div>
                  Alternatively, you can try reprogramming the NVRAM chip to enable root access. <br/>
                  <i class="bi bi-exclamation-triangle-fill me-2"/>This method requires expert knowledge. <a
                    class="stretched-link" href="https://gist.github.com/throwaway96/827ff726981cc2cbc46a22a2ad7337a1"
                    target="_blank">Read manual</a>
                </div>
              </div>
            `
            }
          </div>
        `;
    }
}

render(html`
  <${App} q=${new URLSearchParams(location.search).get('q')}/>`, document.getElementById('app-container')!);