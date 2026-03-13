// src/hub/services/ens.service.ts
import { hubFetch } from './hub.fetcher';

const SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens';

export const ENSService = {
  async resolve(ensName: string) {
    const query = `{
      domains(where: { name: "${ensName.toLowerCase()}" }) {
        resolvedAddress { id }
        owner { id }
        name
        expiryDate
      }
    }`;
    const data = await hubFetch<any>(SUBGRAPH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return data?.domains?.[0] || null;
  },

  async reverseResolve(address: string) {
    const query = `{
      domains(where: { resolvedAddress: "${address.toLowerCase()}" }) {
        name
        owner { id }
      }
    }`;
    const data = await hubFetch<any>(SUBGRAPH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return data?.domains || [];
  }
};
