\connect bocadb

DROP TABLE IF EXISTS "tag" CASCADE;
CREATE TABLE "public"."tag" (
    "tagid" integer NOT NULL,
    "tagname" character varying(256) NOT NULL,
    "tagvalue" character varying(256) NOT NULL,
    "contestnumber" integer NOT NULL,
    CONSTRAINT "tag_index" UNIQUE (tagid, contestnumber),
    CONSTRAINT "tag_pkey" PRIMARY KEY (tagid, contestnumber),
    CONSTRAINT "tag_contestnumber_fkey" FOREIGN KEY (contestnumber)
        REFERENCES contesttable (contestnumber) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE
);

DROP TABLE IF EXISTS "problem_tag" CASCADE;
CREATE TABLE "public"."problem_tag" (
    "problemnumber" integer NOT NULL,
    "contestnumber" integer NOT NULL,
    "tagid" integer NOT NULL,
    CONSTRAINT "problem_tag_index" UNIQUE ("problemnumber", "contestnumber", "tagid"),
    CONSTRAINT "problem_tag_pkey" PRIMARY KEY ("problemnumber", "contestnumber", "tagid"),
    CONSTRAINT "problem_tag_problemnumber_fkey" FOREIGN KEY ("problemnumber", "contestnumber")
        REFERENCES "problemtable" ("problemnumber", "contestnumber") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE,
    CONSTRAINT "problem_tag_tagid_fkey" FOREIGN KEY ("tagid", "contestnumber")
        REFERENCES "tag" ("tagid", "contestnumber") ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE
);

DROP TABLE IF EXISTS "language_tag" CASCADE;
CREATE TABLE "public"."language_tag" (
    langnumber integer NOT NULL,
    contestnumber integer NOT NULL,
    tagid integer NOT NULL,
    CONSTRAINT "site_tag_index" UNIQUE ("langnumber", "contestnumber", "tagid"),
    CONSTRAINT "language_tag_pkey" PRIMARY KEY (langnumber, contestnumber, tagid),
    CONSTRAINT "language_tag_langnumber_fkey" FOREIGN KEY (langnumber, contestnumber)
        REFERENCES langtable (langnumber, contestnumber) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE,
    CONSTRAINT "language_tag_tagid_fkey" FOREIGN KEY (tagid, contestnumber)
        REFERENCES tag (tagid, contestnumber) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE
);

DROP TABLE IF EXISTS "site_tag" CASCADE;
CREATE TABLE "public"."site_tag" (
    sitenumber integer NOT NULL,
    contestnumber integer NOT NULL,
    tagid integer NOT NULL,
    CONSTRAINT "site_tag_index" UNIQUE (sitenumber, contestnumber, tagid),
    CONSTRAINT "site_tag_pkey" PRIMARY KEY (sitenumber, tagid, contestnumber),
    CONSTRAINT "site_tag_tagid_fkey" FOREIGN KEY (tagid, contestnumber)
        REFERENCES tag (tagid, contestnumber) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE,
    CONSTRAINT "site_tag_sitenumber_fkey" FOREIGN KEY (sitenumber, contestnumber)
        REFERENCES sitetable (sitenumber, contestnumber) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE
);

DROP TABLE IF EXISTS "user_tag" CASCADE;
CREATE TABLE "public"."user_tag" (
    usernumber integer NOT NULL,
    usersitenumber integer NOT NULL,
    contestnumber integer NOT NULL,
    tagid integer NOT NULL,
    CONSTRAINT "user_tag_index" UNIQUE (usernumber, usersitenumber, contestnumber, tagid),
    CONSTRAINT "user_tag_pkey" PRIMARY KEY (usernumber, contestnumber, tagid, usersitenumber),
    CONSTRAINT "user_tag_usernumber_fkey" FOREIGN KEY (usernumber, usersitenumber, contestnumber)
        REFERENCES usertable (usernumber, usersitenumber, contestnumber) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE,
    CONSTRAINT "user_tag_tagid_fkey" FOREIGN KEY (tagid, contestnumber)
        REFERENCES tag (tagid, contestnumber) ON UPDATE CASCADE ON DELETE CASCADE NOT DEFERRABLE
);

-- Criando índices hash para as tags sobre o tagid (facilita a verificação de existência de uma tag)
CREATE INDEX "tag_tagid_idx" ON "public"."tag" USING hash (tagid);
CREATE INDEX "tag_contestnumber_idx" ON "public"."tag" USING hash (contestnumber);

-- Para cada uma das tabelas associativas, criar índices hash sobre os campos que definem a entidade
-- CREATE INDEX "problem_tag_problemnumber_idx" ON "public"."problem_tag" USING hash (problemnumber, contestnumber);
-- CREATE INDEX "language_tag_langnumber_idx" ON "public"."language_tag" USING hash (langnumber, contestnumber);
-- CREATE INDEX "site_tag_sitenumber_idx" ON "public"."site_tag" USING hash (sitenumber, contestnumber);
-- CREATE INDEX "user_tag_usernumber_idx" ON "public"."user_tag" USING hash (usernumber, usersitenumber, contestnumber);

