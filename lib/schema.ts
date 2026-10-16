import { z } from "zod";

export const LOCALES = ["ca", "es"] as const; // + "eu", "gl" quan hi hagi traduccions
export type Locale = (typeof LOCALES)[number];

const Text = z.object({ ca: z.string().min(1), es: z.string().min(1) });
const Statement = z.object({ ca: z.string().min(1).max(120), es: z.string().min(1).max(120) });
const Id = z.string().regex(/^[a-z0-9-]+$/);
const Ine2 = z.string().regex(/^\d{2}$/);

export const Axis = z.enum(["economic", "social", "territorial"]);
export type Axis = z.infer<typeof Axis>;

export const Territory = z.object({
  communities: z.array(z.object({ id: Ine2, name: Text })).length(19),
  provinces: z
    .array(z.object({ id: Ine2, name: Text, community: Ine2, aliases: z.array(z.string()) }))
    .length(52),
});

export const Topic = z.object({ id: Id, name: Text });

export const Election = z.object({
  id: Id,
  type: z.enum(["general", "autonomica", "europea", "municipal"]),
  scope: z.union([z.literal("ES"), z.object({ community: Ine2 })]),
  date: z.iso.date(),
  status: z.enum(["open", "upcoming", "archived"]),
  name: Text,
  fictional: z.boolean(),
  axes: z.array(Axis).min(2),
  facts: z.array(Text).default([]), // dades curioses per a les pauses del joc
});

export const Question = z.object({
  id: Id,
  topic: Id,
  text: Statement,
  context: Text,
  // +1: estar-hi d'acord empeny cap al pol positiu de l'eix
  axes: z.partialRecord(Axis, z.number().min(-1).max(1)),
});

export const Source = z.object({
  id: Id,
  title: z.string().min(1),
  url: z.url(),
  date: z.iso.date(),
  lang: z.string().min(2), // idioma del document, per marcar les cites
});

export const Position = z
  .object({
    value: z.int().min(-2).max(2).nullable(), // null = revisat i no s'hi pronuncia
    source: Id,
    page: z.int().positive().optional(),
    url: z.url().optional(),
    quote: z.string().optional(),
  })
  .refine((p) => p.value === null || p.page !== undefined || p.url !== undefined, {
    message: "Cada posició amb valor necessita pàgina o URL",
  });

export const Candidacy = z.object({
  id: Id,
  name: z.string().min(1),
  short: z.string().min(1),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  members: z.array(z.string()).optional(),
  provisional: z.boolean().default(false), // encara no proclamada oficialment
  circumscriptions: z.union([z.literal("all"), z.array(Ine2).min(1)]),
  sources: z.array(Source), // en una elecció oberta, almenys una (ho comprova lib/data.ts)
  positions: z.record(Id, Position),
});

export type Territory = z.infer<typeof Territory>;
export type Topic = z.infer<typeof Topic>;
export type Election = z.infer<typeof Election>;
export type Question = z.infer<typeof Question>;
export type Position = z.infer<typeof Position>;
export type Candidacy = z.infer<typeof Candidacy>;
export type Answer = -2 | -1 | 0 | 1 | 2;
