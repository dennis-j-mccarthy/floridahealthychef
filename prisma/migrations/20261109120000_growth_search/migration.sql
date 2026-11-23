-- Growth / search: keywords, landing pages, conversion events, ad spend entries, studio settings. Additive only.

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "phrase" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'service',
    "priority" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'idea',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "note" TEXT,
    "landingSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingPage" (
    "slug" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL DEFAULT '',
    "h1" TEXT NOT NULL,
    "intro" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,
    "faq" JSONB,
    "heroImage" TEXT,
    "heroAlt" TEXT,
    "sections" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingPage_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "ConversionEvent" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "path" TEXT,
    "source" TEXT,
    "campaign" TEXT,
    "gclid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpendEntry" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "results" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpendEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_phrase_key" ON "Keyword"("phrase");

-- CreateIndex
CREATE INDEX "Keyword_kind_priority_idx" ON "Keyword"("kind", "priority");

-- CreateIndex
CREATE INDEX "ConversionEvent_kind_createdAt_idx" ON "ConversionEvent"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "SpendEntry_channel_periodStart_idx" ON "SpendEntry"("channel", "periodStart");



-- Seed the starter keywords (src/lib/keywords.ts SEED_KEYWORDS). Priority is our own score, not search volume.
-- ON CONFLICT DO NOTHING: never overwrites a keyword that already exists.
INSERT INTO "Keyword" ("id", "phrase", "kind", "priority", "status", "source", "note", "updatedAt") VALUES
  ('personal-chef-naples-fl', 'personal chef Naples FL', 'service', 90, 'target', 'seed', NULL, CURRENT_TIMESTAMP),
  ('personal-chef-bonita-springs', 'personal chef Bonita Springs', 'service', 84, 'target', 'seed', NULL, CURRENT_TIMESTAMP),
  ('personal-chef-estero-fl', 'personal chef Estero FL', 'service', 74, 'idea', 'seed', NULL, CURRENT_TIMESTAMP),
  ('personal-chef-fort-myers', 'personal chef Fort Myers', 'service', 80, 'idea', 'seed', NULL, CURRENT_TIMESTAMP),
  ('personal-chef-punta-gorda', 'personal chef Punta Gorda', 'service', 62, 'idea', 'seed', NULL, CURRENT_TIMESTAMP),
  ('healthy-personal-chef-southwest-florida', 'healthy personal chef Southwest Florida', 'service', 70, 'idea', 'seed', NULL, CURRENT_TIMESTAMP),
  ('intimate-dinner-party-catering-naples', 'intimate dinner party catering Naples', 'service', 76, 'target', 'seed', NULL, CURRENT_TIMESTAMP),
  ('small-event-caterer-bonita-springs', 'small event caterer Bonita Springs', 'service', 64, 'idea', 'seed', NULL, CURRENT_TIMESTAMP),
  ('cooking-demonstration-speaker-naples', 'cooking demonstration speaker Naples', 'service', 48, 'idea', 'seed', 'Speaking & tasting events (/services#speaking)', CURRENT_TIMESTAMP),
  ('weekly-healthy-meal-prep-chef-naples', 'weekly healthy meal prep chef Naples', 'problem', 86, 'target', 'seed', NULL, CURRENT_TIMESTAMP),
  ('gluten-free-personal-chef-naples', 'gluten-free personal chef Naples', 'problem', 78, 'idea', 'seed', NULL, CURRENT_TIMESTAMP),
  ('paleo-meal-prep-naples-fl', 'paleo meal prep Naples FL', 'problem', 66, 'idea', 'seed', NULL, CURRENT_TIMESTAMP),
  ('organic-home-cooked-meals-naples', 'organic home-cooked meals Naples', 'problem', 72, 'idea', 'seed', NULL, CURRENT_TIMESTAMP),
  ('too-busy-to-cook-healthy-meals', 'too busy to cook healthy meals', 'problem', 60, 'idea', 'seed', NULL, CURRENT_TIMESTAMP),
  ('private-chef-for-a-small-dinner-party-florida', 'private chef for a small dinner party Florida', 'problem', 58, 'idea', 'seed', NULL, CURRENT_TIMESTAMP),
  ('how-much-does-a-personal-chef-cost-in-naples', 'how much does a personal chef cost in Naples', 'question', 80, 'idea', 'seed', NULL, CURRENT_TIMESTAMP),
  ('are-personal-chefs-worth-it', 'are personal chefs worth it', 'question', 64, 'idea', 'seed', NULL, CURRENT_TIMESTAMP),
  ('what-does-a-personal-chef-do', 'what does a personal chef do', 'question', 56, 'idea', 'seed', NULL, CURRENT_TIMESTAMP),
  ('personal-chef-vs-meal-delivery-service', 'personal chef vs meal delivery service', 'question', 54, 'idea', 'seed', NULL, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
