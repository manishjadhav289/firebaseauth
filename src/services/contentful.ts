import { createClient, Entry } from 'contentful';
import {
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_DELIVERY_TOKEN,
  CONTENTFUL_PREVIEW_TOKEN,
} from '@env';

const client = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_DELIVERY_TOKEN,
});

// Interface for our Terms of Service entry
// We accept any structure for now, but typically it has a 'content' or 'body' field.
export interface TermsEntry {
  title?: string;
  content?: any; // Rich text or string
  date?: string;
}

export const contentfulService = {
  getEntry: async (entryId: string) => {
    try {
      const entry = await client.getEntry(entryId);
      return entry;
    } catch (error) {
      console.error('Error fetching entry from Contentful:', error);
      throw error;
    }
  },
};
