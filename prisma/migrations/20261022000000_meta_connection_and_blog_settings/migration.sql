-- CreateTable
CREATE TABLE "MetaConnection" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "fbUserId" TEXT,
    "fbUserName" TEXT,
    "fbUserToken" TEXT,
    "pageId" TEXT,
    "pageName" TEXT,
    "pageToken" TEXT,
    "igUserId" TEXT,
    "igUsername" TEXT,
    "adAccountId" TEXT,
    "scopes" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "connectedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "voice" TEXT NOT NULL DEFAULT '',
    "audience" TEXT NOT NULL DEFAULT '',
    "style" TEXT NOT NULL DEFAULT '',
    "dos" TEXT NOT NULL DEFAULT '',
    "donts" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogSettings_pkey" PRIMARY KEY ("id")
);
