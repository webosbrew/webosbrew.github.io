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
        fetch(dataUrl('index')).then(resp => resp.json()).then(data => this.setState({
            index: data,
        }));
    }

    onSearchChange = (e: Event) => {
        const q = (e.target as HTMLInputElement).value?.trim();
        const url = new URL(location.href);
        if (url.searchParams) {
            if (q) {
                url.searchParams.set('q', q);
            } else {
                url.searchParams.delete('q');
            }
            history.replaceState(null, '', url);
        }
        this.setState({q});
    };

    render(props: unknown, state: AppState) {
        // onInput, not onChange, so results follow typing. onChange waits for the field
        // to lose focus, which on a phone means tapping away before seeing anything.
        // An empty query lists everything, rather than leaving the page blank.
        return html`
          <h1>Can I use <input type="search" class="border-0 border-bottom border-dark-subtle bg-dark px-1 mx-1"
                               defaultValue=${this.state.q} onInput=${this.onSearchChange}/>?
          </h1>
          <hr/>
          ${state.index && html`
            <${CanIUseSearch} index=${state.index} name=${state.q ?? ''}/>`}`;
    }

}

function CanIUseSearch(props: { index: Record<string, string[]>, name: string }) {
    const {name, index} = props;

    async function fetchData(q: string): Promise<DataEntry[]> {
        // Index keys are lower case, the query is whatever the user typed. Searching
        // for SDL2 or FFmpeg, as the guides name them, found nothing without this.
        const needle = q.trim().toLowerCase();
        return Promise.all(uniq(Object.entries(index).flatMap(([k, names]) => k.toLowerCase().includes(needle) ? names : []))
            .map(name => fetch(dataUrl(name)).then(resp => {
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

function dataUrl(name: string) {
    const baseUrl = new URL(location.href);
    if (!baseUrl.pathname.endsWith('/')) {
        baseUrl.pathname += '/';
    }
    return new URL(`./data/${name}.json`, baseUrl);
}

render(html`
      <${App}/>`,
    document.getElementById('app-container')!);