import { config } from '../../config/config';
const fetch = require('node-fetch');
//TO AND COMPONENTS BODY EXAMPLE
// "to_and_components": [
//   {
//     "to": [
//       "receiver-number"
//     ],
//     "components": {
//       "header_1": {
//         "type": "component type",
//         "value": "component-url-link"
//       },
//       "body_1": {
//         "type": "text",
//         "value": "1"
//       },
//       "body_2": {
//         "type": "text",
//         "value": "2"
//       }
//     }
//   },
//   {
//     "to": [
//       "receiver number"
//     ],
//     "components": {
//       "header_1": {
//         "type": "component-type",
//         "value": "component-url-link"
//       },
//       "body_1": {
//         "type": "text",
//         "value": "1"
//       },
//       "body_2": {
//         "type": "text",
//         "value": "2"
//       }
//     }
//   }
// ]
export const sendBulkAbandonedFeedbackNotification = async (
  toAndComponents: any
) => {
  try {
    const body = JSON.stringify({
      integrated_number: config.whatsAppCredentials.integrated_number,
      content_type: config.whatsAppCredentials.content_type,
      payload: {
        type: config.whatsAppCredentials.type,
        template: {
          name: config.whatsAppCredentials.defaultTemplateName,
          language: config.whatsAppCredentials.language,
          to_and_components: toAndComponents,
        },
        messaging_product: config.whatsAppCredentials.messaging_product,
      },
    });
    const headers = {
      accept: 'application/json',
      authkey: config.whatsAppCredentials.authKey,
      'content-type': 'application/json',
    };
    await fetch(config.whatsAppCredentials.baseUrlBulk, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    return;
  } catch (err) {
    return Promise.reject(err);
  }
};

//COMPONENTS BODY EXAMPLE
// [
//   {
//       "type": "body",
//       "parameters": [
//           {
//               "type": "text",
//               "text": "https://google.com"
//           }
//       ]
//   }
// ]
export const sendFeedbackFormCertificateNotification = async (
  components: any, //customer message
  to: string //customer number
) => {
  try {
    const body = JSON.stringify({
      integrated_number: config.whatsAppCredentials.integrated_number,
      content_type: config.whatsAppCredentials.content_type,
      payload: {
        to: to,
        type: config.whatsAppCredentials.type,
        template: {
          name: config.whatsAppCredentials.defaultTemplateName,
          language: config.whatsAppCredentials.language,
          components: components,
        },
        messaging_product: config.whatsAppCredentials.messaging_product,
      },
    });
    const headers = {
      accept: 'application/json',
      authkey: config.whatsAppCredentials.authKey,
      'content-type': 'application/json',
    };
    await fetch(config.whatsAppCredentials.baseUrl, {
      method: 'POST',
      headers: headers,
      body: body,
    });
    return;
  } catch (err) {
    return Promise.reject(err);
  }
};
