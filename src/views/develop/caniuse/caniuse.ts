import {Component, html, render} from "htm/preact";
import {DataEntry} from "./types";
import {useQuery} from "preact-fetching";
import {CanIUseCard} from "./card";
import {uniq} from "lodash-es";

interface AppState {
    q?: string;
    index?: Record<string, string[]>;
}

// Wait for a pause in typing before searching. Every keystroke otherwise fetches, and the
// prefixes on the way to a real word match plenty: "s" pulls every SDL card before "sdl2"
// narrows it back down.
const SETTLE_MS = 250;

class App extends Component<unknown, AppState> {
    private settle?: ReturnType<typeof setTimeout>;

    constructor() {
        super();
        const query = new URLSearchParams(location.search);
        this.state = {q: (query.get('q')?.trim()) || undefined};
        fetch(dataUrl('index')).then(resp => resp.json()).then(data => this.setState({
            index: data,
        }));
    }

    componentWillUnmount() {
        clearTimeout(this.settle);
    }

    onSearchChange = (e: Event) => {
        const q = (e.target as HTMLInputElement).value?.trim();
        clearTimeout(this.settle);
        this.settle = setTimeout(() => this.search(q), SETTLE_MS);
    };

    /** Runs once typing has settled, so the URL only records what was actually searched. */
    search(q?: string) {
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
    }

    render(props: unknown, state: AppState) {
        // onInput, not onChange, so results follow typing rather than waiting for the field
        // to lose focus, which on a phone means tapping away before seeing anything. The
        // debounce above keeps that from firing a fetch per character.
        return html`
          <h1>Can I use <input type="search" class="border-0 border-bottom border-dark-subtle bg-dark px-1 mx-1"
                               defaultValue=${this.state.q} onInput=${this.onSearchChange}/>?
          </h1>
          <hr/>
          ${state.index && (state.q?.trim()
            // Mounted only for a real query. Handing it an empty one and letting it return
            // no results would flash "nothing matches" before the first fetch lands.
            ? html`<${CanIUseSearch} index=${state.index} name=${state.q.trim()}/>`
            : html`<${CanIUseEmpty}/>`)}`;
    }

}

/** Nothing typed yet. Say what the page is for, rather than dumping every card. */
function CanIUseEmpty() {
    return html`
      <div class="text-secondary">
        <p>Type a library name above to see which webOS releases carry it, and at what
          version.</p>
        <p class="mb-0">Try <code>ffmpeg</code>, <code>libcurl</code>, <code>sdl2</code>
          or <code>qt5</code>.</p>
      </div>`;
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
    // `data` is undefined until the first fetch for this query settles. Treating that as
    // no results would show "nothing matches" while the answer is still on its way.
    if (isLoading || !data) {
        return html`
          <div>Loading...</div>`;
    }
    if (!data.length) {
        return html`
          <div class="text-secondary">
            <p>Nothing here matches <strong>${name}</strong>.</p>
            <p class="mb-0">The list only covers libraries someone has written up. If you have
              version data for one that is missing, please
              <a href="https://github.com/webosbrew/webosbrew.github.io">add it</a>.</p>
          </div>`;
    }
    return html`
      <div class="row g-3">${data.map(entry => html`
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