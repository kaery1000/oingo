import aws4 from 'aws4';
import axios from 'axios';

export async function awsSigning(reqParam, path) {
  let signedRequest = aws4.sign({
    host: 'l7057qjhsc.execute-api.us-east-2.amazonaws.com/',
    method: 'POST',
    url: 'https://l7057qjhsc.execute-api.us-east-2.amazonaws.com/' + path,
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.REACT_APP_apiKey,
    },

    secretAccessKey: process.env.REACT_APP_accessKeyId,
    accessKeyId: process.env.REACT_APP_secretAccessKey,
    data: reqParam,
    body: reqParam
  })

  delete signedRequest.headers['Host']
  delete signedRequest.headers['Content-Length']

  let response = await axios(signedRequest);
  return response;
};

export const tagOptions = [
  { key: 'shopping', text: 'Shopping', value: "shopping" },
  { key: 'food', text: 'Food', value: "food" },
  { key: 'entertainment', text: 'Entertainment', value: "entertainment" },
  { key: 'music', text: 'Music', value: "music" },
]

export const dayOptions = [
  { key: 'every', text: 'Every', value: "every" },
  { key: 'monday', text: 'Monday', value: "monday" },
  { key: 'tuesday', text: 'Tuesday', value: "tueday" },
  { key: 'wedday', text: 'Wednesday', value: "wedday" },
  { key: 'thursday', text: 'Thursday', value: "thursday" },
  { key: 'friday', text: 'Friday', value: "friday" },
  { key: 'saturday', text: 'Saturday', value: "saturday" },
  { key: 'sunday', text: 'Sunday', value: "sunday" },
]

export const frequencyOptions = [
  { key: 'every', text: 'Every', value: "every" },
  { key: 'once', text: 'Once', value: "once" },
]