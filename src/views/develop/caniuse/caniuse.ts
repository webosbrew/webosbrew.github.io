import {Component, html, render} from "htm/preact";
import {DataEntry} from "./types";
import {useQuery} from "preact-fetching";
import {CanIUseCard} from "./card";
import {uniq} from "lodash-es";

interface AppState {
    q?: string;
    index?: Record<string, string[]>;
}

class App extends Component<unknown, AppState> {
    constructor() {
        super();
        const query = new URLSearchParams(location.search);
        this.state = {q: (query.get('q')?.trim()) || undefined};
        fetch('caniuse/data/index.json').then(resp => resp.json()).then(data => this.setState({
            index: data,
        }));
    }

    onSearchChange = (e: Event) => {
        const q = (e.target as HTMLInputElement).value?.trim();
        const url = new URL(location.href);
        if (url.searchParams) {
            url.searchParams.set('q', q);
            history.pushState(null, '', url);
        }
        this.setState({q});
    };

    render(props: unknown, state: AppState) {
        return html`
          <h1>Can I use <input type="search" class="" oninput=${this.onSearchChange}/>?</h1>
          <hr/>
          ${state.index && state.q && html`
            <${CanIUseSearch} index=${state.index} name=${state.q}/>`}`;
    }

}

function CanIUseSearch(props: { index: Record<string, string[]>, name: string }) {
    const {name, index} = props;

    async function fetchData(q: string): Promise<DataEntry[]> {
        return Promise.all(uniq(Object.entries(index).flatMap(([k, names]) => k.includes(q) ? names : []))
            .map(name => fetch(`caniuse/data/${name}.json`).then(resp => {
                if (!resp.ok) {
                    throw new Error(`Failed to fetch data for ${name}`);
                }
                return resp.json();
            })));
    }

    const {isLoading, isError, error, data} = useQuery(`caniuse/data/${name}`, async () => fetchData(name));
    if (isError) {
        return html`
          <div>Error: ${error.message}</div>`;
    }
    if (isLoading) {
        return html`
          <div>Loading...</div>`;
    }
    return html`
      <div class="row g-3">${data?.map(entry => html`
        <${CanIUseCard} data=${entry}/>`)}
      </div>`;
}

render(html`
      <${App}/>`,
    document.getElementById('app-container')!);