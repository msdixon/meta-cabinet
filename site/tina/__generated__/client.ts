import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '18df6fc4485d688fb9d81280e61c7bdcfdb40f08', queries,  });
export default client;
  