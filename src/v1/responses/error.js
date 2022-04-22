import S from "fluent-json-schema";

export const errorSchema = () =>
  S.array().items(
    S.object().prop(
      "messages",
      S.array().items(S.object().prop("id", S.string()))
    )
  );

export const formatError = (message) => [{ messages: [{ id: message }] }];
