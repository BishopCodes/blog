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
    path: `/posts/${post.id}`,
  }));

  insertMultiple(db, documents);

  const index = save(db);

  return new Response(JSON.stringify(index), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
