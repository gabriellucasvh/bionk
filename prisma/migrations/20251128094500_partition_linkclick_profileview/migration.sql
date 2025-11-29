-- Ajuste: remover tentativa de partição que falha em Postgres/Neon
-- Em vez disso, garantir índices úteis para consultas por tempo e chaves

CREATE INDEX IF NOT EXISTS "LinkClick_linkId_createdAt_idx" ON "public"."LinkClick"("linkId", "createdAt");
CREATE INDEX IF NOT EXISTS "LinkClick_device_idx" ON "public"."LinkClick"("device");
CREATE INDEX IF NOT EXISTS "LinkClick_referrer_idx" ON "public"."LinkClick"("referrer");

CREATE INDEX IF NOT EXISTS "ProfileView_userId_createdAt_idx" ON "public"."ProfileView"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "ProfileView_device_idx" ON "public"."ProfileView"("device");
CREATE INDEX IF NOT EXISTS "ProfileView_referrer_idx" ON "public"."ProfileView"("referrer");
