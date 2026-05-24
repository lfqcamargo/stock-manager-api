-- CreateTable
CREATE TABLE "temp_password_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "company_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "temp_password_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "temp_password_tokens_token_key" ON "temp_password_tokens"("token");

-- AddForeignKey
ALTER TABLE "temp_password_tokens" ADD CONSTRAINT "temp_password_tokens_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temp_password_tokens" ADD CONSTRAINT "temp_password_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
