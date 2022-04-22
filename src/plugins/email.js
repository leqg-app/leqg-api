import fastifyPlugin from "fastify-plugin";
import SibApiV3Sdk from "sib-api-v3-sdk";

const defaultClient = SibApiV3Sdk.ApiClient.instance;

async function email(fastify) {
  const apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = fastify.config.SIB_API_KEY;
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  fastify.decorate("email", {
    send: (options) => {
      return new Promise((resolve, reject) => {
        sendSmtpEmail.sender = { email: "no-reply@leqg.app", name: "Le QG" };
        sendSmtpEmail.replyTo = { email: "contact@leqg.app" };
        sendSmtpEmail.to = [{ email: options.to }];
        sendSmtpEmail.subject = options.subject;
        sendSmtpEmail.htmlContent = options.html;
        sendSmtpEmail.textContent = options.text || "";

        apiInstance.sendTransacEmail(sendSmtpEmail).then(
          (data) => {
            resolve(data);
          },
          (error) => {
            reject(error);
          }
        );
      });
    },
  });
}

export default fastifyPlugin(email);
