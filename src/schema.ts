import * as z from 'zod';

export const itemSchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  title: z.string(),
  action: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  emoji: z.string().optional(),  // アイコン絵文字
  excluded: z.boolean(),
});

export const itemsSchema = z.array(itemSchema);
