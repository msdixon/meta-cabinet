import { defineCollection, z } from 'astro:content';

const rooms = defineCollection({
  type: 'content',
  schema: z.object({
    order: z.number(),
    index: z.string(),
    titleMain: z.string(),
    titleSuffix: z.string(),
    tag: z.string().optional(),
    sub: z.string().optional(),
    metaLine1: z.string().optional(),
    metaLine2: z.string().optional(),
    githubUrl: z.string().optional(),
    anchor: z.string().optional(),
    rosterSections: z.array(z.object({
      label: z.string(),
      members: z.array(z.object({
        name: z.string(),
        role: z.string(),
      })),
    })),
  }),
});

export const collections = { rooms };
