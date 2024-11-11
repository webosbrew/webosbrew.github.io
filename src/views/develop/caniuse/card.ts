import {DataEntry, WebOSMajor} from "./types";
import {html} from "htm/preact";

interface WebOSVersion {
    major: WebOSMajor;
    name: string;
}

const allVersions: WebOSVersion[] = [
    {major: 'afro', name: '1.x'},
    {major: 'beehive', name: '2.x'},
    {major: 'dreadlocks', name: '3.0~3.4'},
    {major: 'dreadlocks2', name: '3.5~3.9'},
    {major: 'goldilocks', name: '4.0~4.4'},
    {major: 'goldilocks2', name: '4.5~4.10'},
    {major: 'jhericurl', name: '5.x'},
    {major: 'kisscurl', name: '6.x'},
    {major: 'mullet', name: '7.x'},
    {major: 'number1', name: '8.x'},
    {major: 'ombre', name: '9.x'},
];

export function CanIUseCard(props: { data: DataEntry }) {
    const {data} = props;
    return html`
      <div class="col">
        <div class="card">
          <div class="card-header d-flex align-items-baseline">
            <h3 class="me-auto">${data.name}</h3>
            ${data.documentation && html`<a href="${data.documentation}" target="_blank"><i
                class="bi bi-file-earmark-text h4"/></a>`}
          </div>
          <div class="card-body">
            ${data.warning && html`
              <div class="alert alert-warning">
                <h5><i class="bi bi-exclamation-triangle-fill me-2"/>Warning</h5>
                <div class="mb-n3" dangerouslySetInnerHTML=${{__html: data.warning}}></div>
              </div>`}
            <table class="table table-bordered">
              <thead>
              <tr>
                <th>webOS Release</th>
                ${allVersions.sort().map(version => html`
                  <th>${version.name}</th>`)}
              </tr>
              </thead>
              <tbody>
              <tr>
                <th>Version</th>
                ${allVersions.map(version => {
                  const pkg = data.versions[version.major];
                  return html`
                    <td class="${pkg ? '' : 'text-muted'}">${pkg || 'N/A'}</td>`;
                })}
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>`
}