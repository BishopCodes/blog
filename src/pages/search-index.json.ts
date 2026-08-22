import { getCollection } from "astro:content";
import { create, insertMultiple, save } from "@orama/orama";

const schema = {
  id: "string",
  title: "string",
  description: "string",
  content: "string",
  tag: "string",
  path: "string",
} as const;

export async function GET() {
  const posts = await getCollection("blog");

  const db = create({
    schema,
  });

  const documents = posts.map((post) => ({
    id: post.id,
    title: post.data.title,
    description: post.data.description,
    content: post.body,
    tag: post.data.tag,
    // Trailing slash matches the built routes and the rest of the site's links,
    // so search clicks navigate directly instead of via a 301.
    path: `/posts/${post.id}/`,
  }));

  insertMultiple(db, documents);

  const index = save(db);

  return new Response(JSON.stringify(index), {
    headers: {
      "Content-Type": "application/json",
      // Rebuilt on every deploy; safe to cache per session.
      "Cache-Control": "public, max-age=3600",
    },
  });
}
