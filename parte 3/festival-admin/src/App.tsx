import { Admin, Resource, ListGuesser, fetchUtils } from "react-admin";
import type { DataProvider } from "react-admin"; 
const apiUrl = 'http://localhost:3000';
const httpClient = fetchUtils.fetchJson;

const myDataProvider: DataProvider = {
    getList: (resource, params) => {
        const url = `${apiUrl}/${resource}`;
        return httpClient(url).then(({ json }) => ({
            data: json,
            total: json.length,
        }));
    },

    getOne: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({ data: json })),

    create: (resource, params) =>
        httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({
            data: { ...params.data, id: json.id },
        })) as Promise<any>,

    update: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PATCH',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json })) as Promise<any>,

    delete: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
        }).then(({ json }) => ({ data: json })) as Promise<any>,

    getMany: (resource, params) => Promise.resolve({ data: [] }),
    getManyReference: (resource, params) => Promise.resolve({ data: [], total: 0 }),
    updateMany: (resource, params) => Promise.resolve({ data: [] }),
    deleteMany: (resource, params) => Promise.resolve({ data: [] }),
};

const App = () => (
  <Admin dataProvider={myDataProvider}>
    <Resource name="artistas" list={ListGuesser} />
    <Resource name="palcos" list={ListGuesser} />
    <Resource name="concertos" list={ListGuesser} />
    <Resource name="bilhetes" list={ListGuesser} />
  </Admin>
);

export default App;