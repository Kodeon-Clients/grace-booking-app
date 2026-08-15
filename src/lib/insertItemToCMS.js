import { items } from '@wix/data';
import { createClient, OAuthStrategy } from '@wix/sdk';

const myWixClient = createClient({
    modules: { items },
    auth: OAuthStrategy({ clientId: "4b115364-e9ff-48f5-8e2b-f8cb49116c7c" }),
});

export async function insertItemToCMS(toInsert) {
    const inserted = await myWixClient.items.insert("Orders", toInsert);
    return inserted;
}