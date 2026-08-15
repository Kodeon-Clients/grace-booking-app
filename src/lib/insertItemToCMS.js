import { items } from '@wix/data';
import { createClient, OAuthStrategy } from '@wix/sdk';

const myWixClient = createClient({
    modules: { items },
    auth: OAuthStrategy({ clientId: import.meta.env.VITE_WIX_CLIENT_ID }),
});

export async function insertItemToCMS(toInsert) {
    const inserted = await myWixClient.items.insert("Orders", toInsert);
    return inserted;
}