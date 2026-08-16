import { type CollectionEntry } from "astro:content";

export type Collection = "blog";
export type Post = CollectionEntry<'blog'>;
