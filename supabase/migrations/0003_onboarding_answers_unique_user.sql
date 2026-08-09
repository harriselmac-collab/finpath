ALTER TABLE onboarding_answers
  ADD CONSTRAINT onboarding_answers_user_id_key UNIQUE (user_id);
